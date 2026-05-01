<?php
require_once __DIR__ . "/bootstrap.php";

$apiKey = env_value("OPENAI_API_KEY");
if (!$apiKey) {
    json_response([
        "error" => "Recipe generation is temporarily unavailable. Missing OPENAI_API_KEY.",
    ], 500);
}

$input = json_decode(file_get_contents("php://input"), true);
$ingredients = $input["ingredients"] ?? [];

if (!is_array($ingredients) || count($ingredients) === 0) {
    json_response(["error" => "ingredients must be a non-empty array"], 400);
}

$prompt = "Create ONE cooking recipe in Markdown.
Use these ingredients when possible:

" . implode(", ", $ingredients) . "

Include:
- Title
- Ingredients list
- Short cooking steps";

$payload = json_encode([
    "model" => "gpt-4o-mini",
    "messages" => [
        ["role" => "user", "content" => $prompt]
    ],
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

json_response(["recipe" => trim($text)]);
