<?php
require_once __DIR__ . "/bootstrap.php";

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";

if ($method !== "POST") {
    json_response(["error" => "Method not allowed"], 405);
}

$apiKey = env_value("OPENAI_API_KEY");
if (!$apiKey) {
    json_response([
        "error" => "Measurement conversion is temporarily unavailable. Missing OPENAI_API_KEY.",
    ], 500);
}

$input = read_json_input();
$ingredient = trim((string) ($input["ingredient"] ?? ""));
$quantityRaw = $input["quantity"] ?? null;
$unit = strtolower(trim((string) ($input["unit"] ?? "")));
$language = strtolower(trim((string) ($input["language"] ?? "en")));
$targetLanguage = $language === "ru" ? "Russian" : "English";

if ($ingredient === "") {
    json_response(["error" => "ingredient is required"], 400);
}

if (!is_numeric($quantityRaw)) {
    json_response(["error" => "quantity must be a positive number"], 400);
}

$quantity = (float) $quantityRaw;
if ($quantity <= 0) {
    json_response(["error" => "quantity must be a positive number"], 400);
}

$allowedUnits = ["grams", "milliliters"];
if (!in_array($unit, $allowedUnits, true)) {
    json_response(["error" => "unit must be grams or milliliters"], 400);
}

$unitLabel = $unit === "grams" ? "grams" : "milliliters";
$quantityLabel = rtrim(rtrim(sprintf("%.4F", $quantity), "0"), ".");

$prompt = "You are a practical cooking measurement assistant. Convert the following recipe amount into approximate household measurements.

Ingredient: {$ingredient}
Amount: {$quantityLabel}
Unit: {$unitLabel}

Return a short answer using:
- tablespoons
- teaspoons
- standard 200ml glass/cup when useful

Rules:
- Be clear that the result is approximate.
- For grams, consider that different ingredients have different density.
- For milliliters, use volume conversion.
- Do not give a long explanation.
- Do not invent complex nutritional information.
- Keep the answer practical for home cooking.
- Write the answer in {$targetLanguage}.

Example output:
'Approximately 100g of sugar equals about 8 tablespoons or 24 teaspoons. This is an estimate because spoon size and ingredient density can vary.'";

$payload = json_encode([
    "model" => "gpt-4o-mini",
    "messages" => [
        ["role" => "user", "content" => $prompt],
    ],
    "temperature" => 0.4,
    "max_tokens" => 220,
]);

$ch = curl_init("https://api.openai.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey",
    "Content-Type: application/json",
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $curlError) {
    json_response(["error" => "Failed to reach conversion provider"], 502);
}

$data = json_decode($response, true);

if ($httpCode !== 200) {
    json_response([
        "error" => "Conversion provider is temporarily unavailable",
    ], $httpCode ?: 502);
}

$conversion = trim((string) ($data["choices"][0]["message"]["content"] ?? ""));
if ($conversion === "") {
    json_response([
        "error" => "Conversion provider returned an empty response.",
    ], 502);
}

json_response(["conversion" => $conversion]);
