<?php
require_once __DIR__ . "/bootstrap.php";

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
$pdo = db();
$user = require_auth($pdo);
$userId = $user["id"];

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

function read_slot_payload(): array
{
    $body = read_json_input();
    $dayOfWeek = (int) ($body["dayOfWeek"] ?? 0);
    $mealType = strtolower(trim((string) ($body["mealType"] ?? "")));
    $savedRecipeId = isset($body["savedRecipeId"]) ? (int) $body["savedRecipeId"] : 0;

    if ($dayOfWeek < 1 || $dayOfWeek > 7) {
        json_response(["error" => "dayOfWeek must be in range 1..7"], 422);
    }
    if (!in_array($mealType, MEAL_TYPES, true)) {
        json_response(["error" => "mealType must be breakfast, lunch, or dinner"], 422);
    }
    if ($savedRecipeId <= 0) {
        json_response(["error" => "savedRecipeId is required"], 422);
    }

    return [$dayOfWeek, $mealType, $savedRecipeId];
}

if ($method === "GET") {
    $stmt = $pdo->prepare("
        SELECT day_of_week, meal_type, saved_recipe_id
        FROM weekly_meal_plan
        WHERE user_id = :user_id
        ORDER BY day_of_week ASC
    ");
    $stmt->execute(["user_id" => $userId]);
    $rows = $stmt->fetchAll();

    $slots = array_map(function ($row) {
        return [
            "dayOfWeek" => (int) $row["day_of_week"],
            "mealType" => $row["meal_type"],
            "savedRecipeId" => $row["saved_recipe_id"] ? (int) $row["saved_recipe_id"] : null,
        ];
    }, $rows);

    json_response(["slots" => $slots]);
}

if ($method === "PUT") {
    [$dayOfWeek, $mealType, $savedRecipeId] = read_slot_payload();

    $recipeStmt = $pdo->prepare("
        SELECT id
        FROM saved_recipes
        WHERE id = :id AND user_id = :user_id
        LIMIT 1
    ");
    $recipeStmt->execute([
        "id" => $savedRecipeId,
        "user_id" => $userId,
    ]);
    if (!$recipeStmt->fetch()) {
        json_response(["error" => "Saved recipe was not found for this user"], 404);
    }

    $now = gmdate("Y-m-d H:i:s");
    $upsertStmt = $pdo->prepare("
        INSERT INTO weekly_meal_plan (
            user_id,
            day_of_week,
            meal_type,
            saved_recipe_id,
            created_at,
            updated_at
        ) VALUES (
            :user_id,
            :day_of_week,
            :meal_type,
            :saved_recipe_id,
            :created_at,
            :updated_at
        )
        ON DUPLICATE KEY UPDATE
            saved_recipe_id = VALUES(saved_recipe_id),
            updated_at = VALUES(updated_at)
    ");
    $upsertStmt->execute([
        "user_id" => $userId,
        "day_of_week" => $dayOfWeek,
        "meal_type" => $mealType,
        "saved_recipe_id" => $savedRecipeId,
        "created_at" => $now,
        "updated_at" => $now,
    ]);

    json_response([
        "slot" => [
            "dayOfWeek" => $dayOfWeek,
            "mealType" => $mealType,
            "savedRecipeId" => $savedRecipeId,
        ],
    ]);
}

if ($method === "DELETE") {
    $scope = $_GET["scope"] ?? "";

    if ($scope === "week") {
        $clearWeekStmt = $pdo->prepare("
            DELETE FROM weekly_meal_plan
            WHERE user_id = :user_id
        ");
        $clearWeekStmt->execute(["user_id" => $userId]);
        json_response(["ok" => true]);
    }

    $body = read_json_input();
    $dayOfWeek = (int) ($body["dayOfWeek"] ?? 0);
    $mealType = strtolower(trim((string) ($body["mealType"] ?? "")));

    if ($dayOfWeek < 1 || $dayOfWeek > 7) {
        json_response(["error" => "dayOfWeek must be in range 1..7"], 422);
    }
    if (!in_array($mealType, MEAL_TYPES, true)) {
        json_response(["error" => "mealType must be breakfast, lunch, or dinner"], 422);
    }

    $deleteStmt = $pdo->prepare("
        DELETE FROM weekly_meal_plan
        WHERE user_id = :user_id
          AND day_of_week = :day_of_week
          AND meal_type = :meal_type
    ");
    $deleteStmt->execute([
        "user_id" => $userId,
        "day_of_week" => $dayOfWeek,
        "meal_type" => $mealType,
    ]);

    json_response(["ok" => true]);
}

json_response(["error" => "Method not allowed"], 405);
