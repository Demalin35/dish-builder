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

function normalize_ingredient_text(string $value): string
{
    $value = mb_strtolower(trim($value), "UTF-8");
    $value = preg_replace('/\([^)]*\)/u', ' ', $value);
    $value = preg_replace('/[^a-zа-я0-9\s\-]/iu', ' ', $value);
    $value = preg_replace('/\s+/u', ' ', $value);
    return trim((string) $value);
}

function strip_quantity_prefix(string $value): string
{
    $value = preg_replace('/^\s*[\d.,\/-]+\s*/u', '', $value);
    $value = preg_replace('/^\s*(cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|g|kg|gram|grams|ml|l|oz|pinch|pinches|dash|clove|cloves|piece|pieces)\b\s*/iu', '', (string) $value);
    $value = preg_replace('/^\s*of\s+/iu', '', (string) $value);
    return trim((string) $value);
}

function ingredient_matches_user_item(string $ingredient, array $userIngredientsNormalized): bool
{
    foreach ($userIngredientsNormalized as $userItem) {
        if ($userItem === '') {
            continue;
        }
        if ($ingredient === $userItem) {
            return true;
        }
        $pattern = '/\b' . preg_quote($userItem, '/') . '\b/u';
        if (preg_match($pattern, $ingredient) === 1) {
            return true;
        }
    }
    return false;
}

function ingredient_is_allowed_pantry(string $ingredient): bool
{
    $allowedPantryPhrases = [
        "salt",
        "sea salt",
        "kosher salt",
        "pepper",
        "black pepper",
        "water",
        "oil",
        "cooking oil",
        "olive oil",
        "vegetable oil",
        "butter",
        "paprika",
        "oregano",
        "basil",
        "thyme",
        "cumin",
        "chili flakes",
        "red pepper flakes",
        "vinegar",
        "lemon juice",
    ];

    $allowedTailPhrases = [
        "to taste",
        "as needed",
        "optional",
        "for frying",
        "for cooking",
    ];

    foreach ($allowedPantryPhrases as $phrase) {
        if ($ingredient === $phrase) {
            return true;
        }
        foreach ($allowedTailPhrases as $tail) {
            if ($ingredient === "{$phrase} {$tail}") {
                return true;
            }
        }
    }

    return false;
}

function validate_recipe_ingredients(array $recipe, array $userIngredients): array
{
    $userIngredientsNormalized = array_values(array_filter(array_map(function ($item) {
        return normalize_ingredient_text((string) $item);
    }, $userIngredients), function ($item) {
        return $item !== "";
    }));

    $invalidIngredients = [];

    foreach ($recipe["ingredients"] as $item) {
        $normalized = normalize_ingredient_text((string) $item);
        $normalized = strip_quantity_prefix($normalized);

        if ($normalized === "") {
            continue;
        }

        if (ingredient_matches_user_item($normalized, $userIngredientsNormalized)) {
            continue;
        }

        if (ingredient_is_allowed_pantry($normalized)) {
            continue;
        }

        $invalidIngredients[] = $item;
    }

    return $invalidIngredients;
}

$apiKey = env_value("OPENAI_API_KEY");
if (!$apiKey) {
    json_response([
        "error" => "Recipe generation is temporarily unavailable. Missing OPENAI_API_KEY.",
    ], 500);
}

$input = read_json_input();
$ingredients = $input["ingredients"] ?? [];
$language = strtolower(trim((string) ($input["language"] ?? "en")));
$targetLanguage = $language === "ru" ? "Russian" : "English";

if (!is_array($ingredients) || count($ingredients) === 0) {
    json_response(["error" => "ingredients must be a non-empty array"], 400);
}

$prompt = "Create ONE cooking recipe and return ONLY a JSON object.
Use ONLY the user-provided ingredients as main ingredients:

" . implode(", ", $ingredients) . "

Allowed additional pantry staples (optional, small amounts):
- salt
- pepper
- water
- oil (olive oil or vegetable oil)
- butter
- dry spices (paprika, oregano, basil, thyme, cumin, chili flakes)
- vinegar or lemon juice as optional seasoning only

Do NOT add any extra main ingredient that is not in the user-provided list.
Do NOT add ingredients like cheese, milk, eggs, meat, fish, pasta, rice, bread, vegetables, or fruit unless they were explicitly provided.
If a typical version requires a missing ingredient, adapt the recipe instead of adding it.

All ingredients in the response must be either:
1) in the user-provided list, or
2) one of the allowed pantry staples.

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
- Ensure ingredients and steps arrays are non-empty.
- Keep the recipe simple and practical.";

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

$invalidIngredients = validate_recipe_ingredients($recipe, $ingredients);
if (count($invalidIngredients) > 0) {
    json_response([
        "error" => "Please add a few more ingredients. The generated recipe used items outside your provided list and basic pantry staples.",
        "invalidIngredients" => $invalidIngredients,
    ], 422);
}

json_response(["recipe" => $recipe]);
