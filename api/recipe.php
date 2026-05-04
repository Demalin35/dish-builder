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

function ingredient_alias_map(): array
{
    return [
        "chicken" => [
            "chicken", "курица", "курицы", "курицу",
            "курицей",
            "куриное филе", "куриного филе",
            "куриным филе", "филе курицы",
            "куриная грудка", "куриной грудки",
            "куриную грудку",
            "chicken breast", "chicken fillet"
        ],
        "onion" => [
            "onion", "onions",
            "лук", "лука", "луком",
            "луковица", "луковицы", "луковицей",
            "репчатый лук", "репчатого лука"
        ],
        "tomato" => [
            "tomato", "tomatoes",
            "помидор", "помидора", "помидоры", "помидоров",
            "помидорами",
            "томат", "томаты", "томатов", "томатами"
        ],
        "potato" => ["potato", "potatoes", "картофель", "картошка", "картофелина"],
        "pepper" => ["pepper", "black pepper", "перец", "черный перец", "чёрный перец"],
        "egg" => ["egg", "eggs", "яйцо", "яйца", "яиц"],
        "milk" => ["milk", "молоко"],
        "flour" => ["flour", "мука", "муки"],
        "banana" => ["banana", "bananas", "банан", "бананы"],
        "bread" => ["bread", "хлеб", "хлеба"],
        "rice" => ["rice", "рис", "риса"],
        "pasta" => ["pasta", "макароны", "паста"],
        "cheese" => ["cheese", "сыр", "сыра"],
        "butter" => ["butter", "сливочное масло"],
        "olive_oil" => ["olive oil", "оливковое масло"],
        "vegetable_oil" => ["vegetable oil", "растительное масло", "подсолнечное масло"],
        "lemon" => ["lemon", "лимон", "лимона"],
        "avocado" => ["avocado", "авокадо"],
        "garlic" => ["garlic", "чеснок", "чеснока"],
    ];
}

function pantry_aliases(): array
{
    return [
        "salt",
        "sea salt",
        "kosher salt",
        "соль",
        "соли",
        "pepper",
        "black pepper",
        "перец",
        "перца",
        "черный перец",
        "чёрный перец",
        "черного перца",
        "чёрного перца",
        "water",
        "вода",
        "воды",
        "oil",
        "cooking oil",
        "olive oil",
        "vegetable oil",
        "масло",
        "масла",
        "оливковое масло",
        "оливкового масла",
        "растительное масло",
        "растительного масла",
        "подсолнечное масло",
        "подсолнечного масла",
        "butter",
        "сливочное масло",
        "сливочного масла",
        "spices",
        "специи",
        "dry spices",
        "сухие специи",
        "sugar",
        "white sugar",
        "granulated sugar",
        "caster sugar",
        "сахар",
        "сахара",
        "baking powder",
        "разрыхлитель",
        "разрыхлителя",
        "vanilla",
        "vanilla extract",
        "vanilla essence",
        "ваниль",
        "ванильный экстракт",
        "ванилин",
        "paprika",
        "паприка",
        "паприки",
        "oregano",
        "орегано",
        "basil",
        "базилик",
        "базилика",
        "thyme",
        "тимьян",
        "тимьяна",
        "cumin",
        "кумин",
        "кумина",
        "chili flakes",
        "red pepper flakes",
        "хлопья чили",
        "vinegar",
        "уксус",
        "уксуса",
        "lemon juice",
        "лимонный сок",
        "лимонного сока",
    ];
}

function text_contains_alias(string $text, string $alias): bool
{
    $pattern = '/(?:^|[\s,\-])' . preg_quote($alias, '/') . '(?:$|[\s,\-])/u';
    return preg_match($pattern, " {$text} ") === 1;
}

function canonical_ingredient_id(string $text, array $aliasMap): ?string
{
    foreach ($aliasMap as $canonical => $aliases) {
        foreach ($aliases as $alias) {
            $normalizedAlias = normalize_ingredient_text($alias);
            if ($normalizedAlias !== "" && text_contains_alias($text, $normalizedAlias)) {
                return $canonical;
            }
        }
    }
    return null;
}

function strip_quantity_prefix(string $value): string
{
    $value = preg_replace('/^\s*[\d.,\/-]+\s*/u', '', $value);
    $value = preg_replace('/^\s*(cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|g|kg|gram|grams|ml|l|oz|pinch|pinches|dash|clove|cloves|piece|pieces|г|кг|гр|грамм|грамма|мл|л|литр|литра|стакан|стакана|стаканов|столовая ложка|столовые ложки|столовых ложки|ст л|ст ложка|ст ложки|стол ложка|стол ложки|ч л|ч ложка|ч ложки|чай ложка|чай ложки|чайная ложка|чайные ложки|чайных ложки|щепотка|щепотки|зубчик|зубчика|ломтик|ломтика|штука|штуки)\b\s*/iu', '', (string) $value);
    $value = preg_replace('/^\s*(ст|стол|ч|чай)\s+л\b\s*/iu', '', (string) $value);
    $value = preg_replace('/^\s*(of|из)\s+/iu', '', (string) $value);
    $value = preg_replace('/^\s*(large|small|medium|big|fresh|большая|большой|большие|маленькая|маленький|средняя|средний|свежий|свежая)\s+/iu', '', (string) $value);
    return trim((string) $value);
}

function ingredient_matches_user_item(string $ingredient, array $userIngredientsNormalized): bool
{
    $aliasMap = ingredient_alias_map();
    $ingredientCanonical = canonical_ingredient_id($ingredient, $aliasMap);

    foreach ($userIngredientsNormalized as $userItem) {
        if ($userItem === '') {
            continue;
        }
        if ($ingredient === $userItem) {
            return true;
        }
        if (text_contains_alias($ingredient, $userItem) || text_contains_alias($userItem, $ingredient)) {
            return true;
        }

        $userCanonical = canonical_ingredient_id($userItem, $aliasMap);
        if ($ingredientCanonical !== null && $userCanonical !== null && $ingredientCanonical === $userCanonical) {
            return true;
        }
    }
    return false;
}

function ingredient_is_allowed_pantry(string $ingredient): bool
{
    $allowedPantryPhrases = pantry_aliases();

    $allowedTailPhrases = [
        "to taste",
        "as needed",
        "optional",
        "for frying",
        "for cooking",
        "по вкусу",
        "по желанию",
        "для жарки",
        "для приготовления",
    ];

    foreach ($allowedPantryPhrases as $phrase) {
        $normalizedPhrase = normalize_ingredient_text($phrase);
        if ($normalizedPhrase === "") {
            continue;
        }
        if ($ingredient === $normalizedPhrase || text_contains_alias($ingredient, $normalizedPhrase)) {
            return true;
        }
        foreach ($allowedTailPhrases as $tail) {
            $normalizedTail = normalize_ingredient_text($tail);
            if ($ingredient === "{$normalizedPhrase} {$normalizedTail}") {
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
- sugar (white, granulated, or caster sugar)
- baking powder
- vanilla (vanilla extract/essence)
- dry spices (paprika, oregano, basil, thyme, cumin, chili flakes)
- vinegar or lemon juice as optional seasoning only

Do NOT add any extra main ingredient that is not in the user-provided list.
Do NOT add ingredients like cheese, milk, eggs, meat, fish, pasta, rice, bread, vegetables, or fruit unless they were explicitly provided.
If a typical version requires a missing ingredient, adapt the recipe instead of adding it.

Example rule for baking:
If input is egg, milk, flour, valid additions are only salt, sugar, water, oil, butter, baking powder, and vanilla.
Invalid additions are syrup, berries, banana, cream, yogurt, chocolate, and cheese unless explicitly provided.

All ingredients in the response must be either:
1) in the user-provided list, or
2) one of the allowed pantry staples.
When listing ingredients, preserve the user-provided ingredient names as much as possible.
You may add quantities or preparation notes, but do not substitute them with new ingredients.

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
- Every ingredient item must include a practical quantity or amount.
- Keep the recipe simple and practical.";

$payload = json_encode([
    "model" => "gpt-4o-mini",
    "messages" => [
        ["role" => "user", "content" => $prompt]
    ],
    "response_format" => ["type" => "json_object"],
    "temperature" => 0.35,
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
    $validationErrorMessage = $targetLanguage === "Russian"
        ? "Пожалуйста, добавьте ещё несколько ингредиентов. Сгенерированный рецепт использовал продукты вне вашего списка и базовых домашних специй/добавок."
        : "Please add a few more ingredients. The generated recipe used items outside your provided list and basic pantry staples.";

    json_response([
        "error" => $validationErrorMessage,
        "invalidIngredients" => $invalidIngredients,
    ], 422);
}

json_response(["recipe" => $recipe]);
