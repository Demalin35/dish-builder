<?php
require_once __DIR__ . "/bootstrap.php";

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
$pdo = db();
$user = require_auth($pdo);
$userId = $user["id"];

if ($method === "GET") {
    $stmt = $pdo->prepare("
        SELECT id, content, created_at
        FROM saved_recipes
        WHERE user_id = :user_id
        ORDER BY created_at DESC, id DESC
    ");
    $stmt->execute(["user_id" => $userId]);
    $rows = $stmt->fetchAll();

    $recipes = array_map(function ($row) {
        return [
            "id" => (int) $row["id"],
            "content" => $row["content"],
            "createdAt" => $row["created_at"],
        ];
    }, $rows);

    json_response(["recipes" => $recipes]);
}

if ($method === "POST") {
    $body = read_json_input();
    $content = trim((string) ($body["content"] ?? ""));

    if ($content === "") {
        json_response(["error" => "Recipe content is required"], 422);
    }

    $duplicateStmt = $pdo->prepare("
        SELECT id
        FROM saved_recipes
        WHERE user_id = :user_id AND content = :content
        LIMIT 1
    ");
    $duplicateStmt->execute([
        "user_id" => $userId,
        "content" => $content,
    ]);
    $existing = $duplicateStmt->fetch();

    if ($existing) {
        json_response(["error" => "Recipe already saved"], 409);
    }

    $createdAt = gmdate("Y-m-d H:i:s");
    $insertStmt = $pdo->prepare("
        INSERT INTO saved_recipes (user_id, content, created_at)
        VALUES (:user_id, :content, :created_at)
    ");
    $insertStmt->execute([
        "user_id" => $userId,
        "content" => $content,
        "created_at" => $createdAt,
    ]);

    json_response([
        "recipe" => [
            "id" => (int) $pdo->lastInsertId(),
            "content" => $content,
            "createdAt" => $createdAt,
        ],
    ], 201);
}

if ($method === "DELETE") {
    $body = read_json_input();
    $recipeId = (int) ($body["id"] ?? 0);
    if ($recipeId <= 0) {
        json_response(["error" => "Recipe id is required"], 422);
    }

    $deleteStmt = $pdo->prepare("
        DELETE FROM saved_recipes
        WHERE id = :id AND user_id = :user_id
    ");
    $deleteStmt->execute([
        "id" => $recipeId,
        "user_id" => $userId,
    ]);

    json_response(["ok" => true]);
}

json_response(["error" => "Method not allowed"], 405);
