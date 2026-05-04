<?php
require_once __DIR__ . "/bootstrap.php";

header("Content-Type: application/json; charset=utf-8");

function image_status_log(string $message): void
{
    error_log("[recipe_image] " . $message);
}

function normalize_search_text(string $value): string
{
    $value = mb_strtolower(trim($value), "UTF-8");
    $value = preg_replace('/[^a-zа-я0-9\s\-]/iu', ' ', $value);
    $value = preg_replace('/\s+/u', ' ', (string) $value);
    return trim((string) $value);
}

function ingredient_en_aliases(): array
{
    return [
        "chicken" => ["chicken", "курица", "курицы", "курицу", "куриное филе", "куриного филе", "куриная грудка", "куриной грудки"],
        "tomato" => ["tomato", "tomatoes", "помидор", "помидора", "помидоры", "помидоров", "томат", "томаты", "томатов"],
        "onion" => ["onion", "onions", "лук", "лука", "луковица", "луковицы", "репчатый лук"],
        "egg" => ["egg", "eggs", "яйцо", "яйца", "яиц"],
        "flour" => ["flour", "мука", "муки"],
        "milk" => ["milk", "молоко", "молока"],
        "banana" => ["banana", "bananas", "банан", "бананы", "банана"],
        "cheese" => ["cheese", "сыр", "сыра"],
        "bread" => ["bread", "хлеб", "хлеба"],
        "potato" => ["potato", "potatoes", "картофель", "картошка", "картофеля", "картошки"],
        "rice" => ["rice", "рис", "риса"],
        "pasta" => ["pasta", "макароны", "паста", "пасты"],
        "garlic" => ["garlic", "чеснок", "чеснока"],
        "avocado" => ["avocado", "авокадо"],
        "lemon" => ["lemon", "лимон", "лимона"],
        "olive oil" => ["olive oil", "оливковое масло", "оливкового масла"],
        "vegetable oil" => ["vegetable oil", "растительное масло", "растительного масла", "подсолнечное масло", "подсолнечного масла"],
    ];
}

function canonical_ingredient_en(string $value): ?string
{
    $normalized = normalize_search_text($value);
    if ($normalized === "") {
        return null;
    }

    foreach (ingredient_en_aliases() as $canonical => $aliases) {
        foreach ($aliases as $alias) {
            if (normalize_search_text($alias) === $normalized) {
                return $canonical;
            }
        }
    }

    return null;
}

function extract_english_terms_from_text(string $text): array
{
    $normalized = normalize_search_text($text);
    if ($normalized === "") {
        return [];
    }

    $terms = [];
    foreach (ingredient_en_aliases() as $canonical => $aliases) {
        foreach ($aliases as $alias) {
            $normalizedAlias = normalize_search_text($alias);
            if ($normalizedAlias === "") {
                continue;
            }
            $pattern = '/(?:^|[\s,\-])' . preg_quote($normalizedAlias, '/') . '(?:$|[\s,\-])/u';
            if (preg_match($pattern, " {$normalized} ") === 1) {
                $terms[$canonical] = true;
                break;
            }
        }
    }

    return array_keys($terms);
}

function parse_ingredients_param(string $rawIngredients): array
{
    if ($rawIngredients === "") {
        return [];
    }

    $decoded = json_decode($rawIngredients, true);
    if (!is_array($decoded)) {
        return [];
    }

    return array_values(array_filter(array_map(function ($item) {
        return is_string($item) ? trim($item) : "";
    }, $decoded), function ($item) {
        return $item !== "";
    }));
}

function build_pexels_search_query(string $title, array $ingredients, string $language): string
{
    $isRussian = str_starts_with(strtolower($language), "ru");

    if (!$isRussian) {
        return trim($title) . " recipe";
    }

    $englishTerms = [];
    foreach ($ingredients as $ingredient) {
        $canonical = canonical_ingredient_en($ingredient);
        if ($canonical !== null) {
            $englishTerms[$canonical] = true;
        }
    }

    if (count($englishTerms) === 0) {
        foreach (extract_english_terms_from_text($title) as $term) {
            $englishTerms[$term] = true;
        }
    }

    $terms = array_slice(array_keys($englishTerms), 0, 4);
    if (count($terms) > 0) {
        return implode(" ", $terms) . " recipe";
    }

    return "home cooked food recipe";
}

$query = trim((string) ($_GET["query"] ?? ""));
if ($query === "") {
    image_status_log("missing_query");
    http_response_code(422);
    echo json_encode(["error" => "Query is required"]);
    exit;
}

$language = strtolower(trim((string) ($_GET["language"] ?? "en")));
$ingredients = parse_ingredients_param((string) ($_GET["ingredients"] ?? ""));
$searchQuery = build_pexels_search_query($query, $ingredients, $language);
image_status_log("search_query_built");

$mockImageUrl = env_value("RECIPE_IMAGE_MOCK_URL");
if ($mockImageUrl) {
    image_status_log("mock_image_enabled");
    echo json_encode([
        "image" => [
            "imageUrl" => $mockImageUrl,
            "alt" => "{$searchQuery} recipe image",
            "photographerName" => "Mock Source",
            "photographerUrl" => "https://www.pexels.com",
            "source" => "Mock",
        ],
    ]);
    exit;
}

$apiKey = env_value("PEXELS_API_KEY");
if (!$apiKey) {
    image_status_log("missing_pexels_api_key");
    http_response_code(500);
    echo json_encode(["error" => "PEXELS_API_KEY is not configured"]);
    exit;
}

$url = "https://api.pexels.com/v1/search?query=" . rawurlencode($searchQuery) . "&per_page=1&orientation=landscape";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: {$apiKey}",
    "Accept: application/json",
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $curlError) {
    image_status_log("request_failed curl_error");
    http_response_code(502);
    echo json_encode(["error" => "Image provider request failed"]);
    exit;
}

$data = json_decode($response, true);
image_status_log("pexels_http_status={$httpCode}");

if ($httpCode < 200 || $httpCode >= 300) {
    http_response_code($httpCode ?: 502);
    echo json_encode([
        "error" => "Failed to fetch image from Pexels",
        "details" => $data,
    ]);
    exit;
}

$photo = $data["photos"][0] ?? null;

if (!$photo || empty($photo["src"]["large"])) {
    image_status_log("no_image_results");
    echo json_encode(["image" => null]);
    exit;
}

echo json_encode([
    "image" => [
        "imageUrl" => $photo["src"]["large"],
        "alt" => !empty($photo["alt"]) ? $photo["alt"] : "{$searchQuery} recipe image",
        "photographerName" => $photo["photographer"] ?? "Unknown",
        "photographerUrl" => $photo["photographer_url"] ?? "https://www.pexels.com",
        "source" => "Pexels",
    ],
]);
