<?php
header("Content-Type: application/json; charset=utf-8");

$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $env = parse_ini_file($envPath);
    if ($env && isset($env['OPENAI_API_KEY'])) {
        putenv('OPENAI_API_KEY=' . $env['OPENAI_API_KEY']);
    }
}

$apiKey = getenv('OPENAI_API_KEY');

$input = json_decode(file_get_contents("php://input"), true);
$ingredients = $input["ingredients"] ?? [];

if (!is_array($ingredients) || count($ingredients) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "ingredients must be a non-empty array"]);
    exit;
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
curl_close($ch);

$data = json_decode($response, true);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        "error" => "OpenAI request failed",
        "details" => $data
    ]);
    exit;
}

$text = $data["choices"][0]["message"]["content"] ?? "";

echo json_encode(["recipe" => trim($text)]);
