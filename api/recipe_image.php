<?php
header("Content-Type: application/json; charset=utf-8");

function env_value(string $key): ?string
{
    $value = getenv($key);
    if ($value !== false && trim($value) !== "") {
        return trim($value);
    }

    $envPath = __DIR__ . "/.env";
    if (file_exists($envPath)) {
        $env = parse_ini_file($envPath);
        if ($env && isset($env[$key]) && trim((string) $env[$key]) !== "") {
            return trim((string) $env[$key]);
        }
    }

    return null;
}

$query = trim((string) ($_GET["query"] ?? ""));
if ($query === "") {
    http_response_code(422);
    echo json_encode(["error" => "Query is required"]);
    exit;
}

$apiKey = env_value("PEXELS_API_KEY");
if (!$apiKey) {
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
    http_response_code(502);
    echo json_encode(["error" => "Image provider request failed"]);
    exit;
}

$data = json_decode($response, true);

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
