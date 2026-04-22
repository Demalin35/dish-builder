<?php

function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($data);
    exit;
}

function read_json_input(): array
{
    $raw = file_get_contents("php://input");
    if ($raw === false || $raw === "") {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function env_value(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === "") {
        return $default;
    }
    return $value;
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = env_value("DB_DSN");
    $dbUser = env_value("DB_USER", "");
    $dbPassword = env_value("DB_PASSWORD", "");

    if (!$dsn) {
        $host = env_value("DB_HOST", "127.0.0.1");
        $port = env_value("DB_PORT", "3306");
        $name = env_value("DB_NAME");
        $charset = env_value("DB_CHARSET", "utf8mb4");

        if (!$name) {
            json_response([
                "error" => "Database is not configured",
                "details" => "Set DB_DSN or DB_NAME environment variables."
            ], 500);
        }

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";
    }

    try {
        $pdo = new PDO($dsn, $dbUser, $dbPassword, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (Throwable $error) {
        json_response([
            "error" => "Failed to connect to database",
            "details" => $error->getMessage(),
        ], 500);
    }

    ensure_schema($pdo);
    return $pdo;
}

function ensure_schema(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(190) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS auth_tokens (
            token CHAR(64) PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            created_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS saved_recipes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            content LONGTEXT NOT NULL,
            created_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");
}

function get_bearer_token(): ?string
{
    $header = $_SERVER["HTTP_AUTHORIZATION"] ?? "";
    if (!preg_match("/Bearer\s+(.+)/i", $header, $matches)) {
        return null;
    }
    return trim($matches[1]);
}

function require_auth(PDO $pdo): array
{
    $token = get_bearer_token();
    if (!$token) {
        json_response(["error" => "Unauthorized"], 401);
    }

    $stmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, u.created_at
        FROM auth_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token = :token
        LIMIT 1
    ");
    $stmt->execute(["token" => $token]);
    $user = $stmt->fetch();

    if (!$user) {
        json_response(["error" => "Unauthorized"], 401);
    }

    return $user;
}
