<?php
require_once __DIR__ . "/bootstrap.php";

function normalize_recipe_shape(array $candidate): ?array
{
    $title = trim((string) ($candidate["title"] ?? ""));
    $summary = trim((string) ($candidate["summary"] ?? ""));
    $ingredients = $candidate["ingredients"] ?? null;
    $steps = $candidate["steps"] ?? null;

    if ($title === "" || !is_array($ingredients) || !is_array($steps)) {
        return null;
    }

    $normalizedIngredients = array_values(array_filter(array_map(function ($item) {
        return trim((string) $item);
    }, $ingredients), function ($item) {
        return $item !== "";
    }));

    $normalizedSteps = array_values(array_filter(array_map(function ($item) {
        return trim((string) $item);
    }, $steps), function ($item) {
        return $item !== "";
    }));

    if (count($normalizedIngredients) === 0 || count($normalizedSteps) === 0) {
        return null;
    }

    return [
        "title" => $title,
        "summary" => $summary,
        "ingredients" => $normalizedIngredients,
        "steps" => $normalizedSteps,
    ];
}

function decode_recipe_json(string $rawContent): ?array
{
    $decoded = json_decode($rawContent, true);
    if (is_array($decoded)) {
        return normalize_recipe_shape($decoded);
    }

    if (preg_match('/\{(?:[^{}]|(?R))*\}/s', $rawContent, $matches) !== 1) {
        return null;
    }

    $decodedFromBlock = json_decode($matches[0], true);
    if (!is_array($decodedFromBlock)) {
        return null;
    }

    return normalize_recipe_shape($decodedFromBlock);
}

$apiKey = env_value("OPENAI_API_KEY");
if (!$apiKey) {
    json_response([
        "error" => "Recipe generation is temporarily unavailable. Missing OPENAI_API_KEY.",
    ], 500);
}

$input = json_decode(file_get_contents("php://input"), true);
$ingredients = $input["ingredients"] ?? [];
$language = strtolower(trim((string) ($input["language"] ?? "en")));
$targetLanguage = $language === "ru" ? "Russian" : "English";

if (!is_array($ingredients) || count($ingredients) === 0) {
    json_response(["error" => "ingredients must be a non-empty array"], 400);
}

$prompt = "Create ONE cooking recipe and return ONLY JSON object.
Use these ingredients when possible:

" . implode(", ", $ingredients) . "

Response JSON schema:
{
  \"title\": \"Recipe title\",
  \"summary\": \"Short description\",
  \"ingredients\": [\"item 1\", \"item 2\"],
  \"steps\": [\"step 1\", \"step 2\"]
}

Requirements:
- Use {$targetLanguage} for all text values.
- Do not include markdown.
- Do not include additional keys.
- Ensure ingredients and steps arrays are non-empty.";

$payload = json_encode([
    "model" => "gpt-4o-mini",
    "messages" => [
        ["role" => "user", "content" => $prompt]
    ],
    "response_format" => ["type" => "json_object"],
    "temperature" => 0.7,
    "max_tokens" => 600
]);

$ch = curl_init("https://api.openai.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $curlError) {
    json_response(["error" => "Failed to reach recipe provider"], 502);
}

$data = json_decode($response, true);

if ($httpCode !== 200) {
    json_response([
        "error" => "OpenAI request failed",
        "details" => $data
    ], $httpCode ?: 502);
}

$text = $data["choices"][0]["message"]["content"] ?? "";
$recipe = decode_recipe_json((string) $text);
if (!$recipe) {
    json_response([
        "error" => "Recipe provider returned invalid structured data.",
    ], 502);
}

json_response(["recipe" => $recipe]);
