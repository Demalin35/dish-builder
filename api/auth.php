<?php
require_once __DIR__ . "/bootstrap.php";

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
$action = $_GET["action"] ?? "";
$pdo = db();

if (!in_array($action, ["signup", "login", "logout", "me"], true)) {
    json_response(["error" => "Unsupported auth action"], 400);
}

if ($action === "me") {
    if ($method !== "GET") {
        json_response(["error" => "Method not allowed"], 405);
    }
    $user = require_auth($pdo);
    json_response(["user" => [
        "id" => $user["id"],
        "name" => $user["name"],
        "email" => $user["email"],
        "createdAt" => $user["created_at"],
    ]]);
}

if ($method !== "POST") {
    json_response(["error" => "Method not allowed"], 405);
}

$body = read_json_input();

if ($action === "signup") {
    $name = trim((string) ($body["name"] ?? ""));
    $email = strtolower(trim((string) ($body["email"] ?? "")));
    $password = (string) ($body["password"] ?? "");

    if ($name === "" || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
        json_response(["error" => "Invalid sign up payload"], 422);
    }

    $existingStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $existingStmt->execute(["email" => $email]);
    if ($existingStmt->fetch()) {
        json_response(["error" => "An account with this email already exists."], 409);
    }

    $userId = bin2hex(random_bytes(16));
    $createdAt = gmdate("Y-m-d H:i:s");
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $insertUserStmt = $pdo->prepare("
        INSERT INTO users (id, name, email, password_hash, created_at)
        VALUES (:id, :name, :email, :password_hash, :created_at)
    ");
    $insertUserStmt->execute([
        "id" => $userId,
        "name" => $name,
        "email" => $email,
        "password_hash" => $passwordHash,
        "created_at" => $createdAt,
    ]);

    $token = bin2hex(random_bytes(32));
    $insertTokenStmt = $pdo->prepare("
        INSERT INTO auth_tokens (token, user_id, created_at)
        VALUES (:token, :user_id, :created_at)
    ");
    $insertTokenStmt->execute([
        "token" => $token,
        "user_id" => $userId,
        "created_at" => $createdAt,
    ]);

    json_response([
        "token" => $token,
        "user" => [
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "createdAt" => $createdAt,
        ],
    ], 201);
}

if ($action === "login") {
    $email = strtolower(trim((string) ($body["email"] ?? "")));
    $password = (string) ($body["password"] ?? "");

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === "") {
        json_response(["error" => "Invalid login payload"], 422);
    }

    $stmt = $pdo->prepare("
        SELECT id, name, email, password_hash, created_at
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute(["email" => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user["password_hash"])) {
        json_response(["error" => "Invalid email or password."], 401);
    }

    $token = bin2hex(random_bytes(32));
    $createdAt = gmdate("Y-m-d H:i:s");

    $insertTokenStmt = $pdo->prepare("
        INSERT INTO auth_tokens (token, user_id, created_at)
        VALUES (:token, :user_id, :created_at)
    ");
    $insertTokenStmt->execute([
        "token" => $token,
        "user_id" => $user["id"],
        "created_at" => $createdAt,
    ]);

    json_response([
        "token" => $token,
        "user" => [
            "id" => $user["id"],
            "name" => $user["name"],
            "email" => $user["email"],
            "createdAt" => $user["created_at"],
        ],
    ]);
}

if ($action === "logout") {
    $token = get_bearer_token();
    if ($token) {
        $stmt = $pdo->prepare("DELETE FROM auth_tokens WHERE token = :token");
        $stmt->execute(["token" => $token]);
    }
    json_response(["ok" => true]);
}
