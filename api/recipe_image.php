<?php
require_once __DIR__ . "/bootstrap.php";

header("Content-Type: application/json; charset=utf-8");

function image_status_log(string $message): void
{
    error_log("[recipe_image] " . $message);
}

$query = trim((string) ($_GET["query"] ?? ""));
if ($query === "") {
    image_status_log("missing_query");
    http_response_code(422);
    echo json_encode(["error" => "Query is required"]);
    exit;
}

$mockImageUrl = env_value("RECIPE_IMAGE_MOCK_URL");
if ($mockImageUrl) {
    image_status_log("mock_image_enabled");
    echo json_encode([
        "image" => [
            "imageUrl" => $mockImageUrl,
            "alt" => "{$query} recipe image",
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

$url = "https://api.pexels.com/v1/search?query=" . rawurlencode($query) . "&per_page=1&orientation=landscape";

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
        "alt" => !empty($photo["alt"]) ? $photo["alt"] : "{$query} recipe image",
        "photographerName" => $photo["photographer"] ?? "Unknown",
        "photographerUrl" => $photo["photographer_url"] ?? "https://www.pexels.com",
        "source" => "Pexels",
    ],
]);
