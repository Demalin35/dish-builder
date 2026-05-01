<?php

ini_set("display_errors", "0");
ini_set("html_errors", "0");
ini_set("log_errors", "1");

function load_server_env_file(string $path): void
{
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    if (!file_exists($path)) {
        return;
    }

    $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($lines)) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === "" || str_starts_with($line, "#") || str_starts_with($line, ";")) {
            continue;
        }

        $separatorPosition = strpos($line, "=");
        if ($separatorPosition === false) {
            continue;
        }

        $key = trim(substr($line, 0, $separatorPosition));
        $value = trim(substr($line, $separatorPosition + 1));

        if ($key === "") {
            continue;
        }

        if (
            (str_starts_with($value, "\"") && str_ends_with($value, "\"")) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        if (getenv($key) !== false && getenv($key) !== "") {
            continue;
        }

        putenv($key . "=" . (string) $value);
    }
}

load_server_env_file(__DIR__ . "/.env");

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

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS weekly_meal_plan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            day_of_week TINYINT NOT NULL,
            meal_type VARCHAR(20) NOT NULL,
            saved_recipe_id INT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            UNIQUE KEY weekly_slot_unique (user_id, day_of_week, meal_type),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (saved_recipe_id) REFERENCES saved_recipes(id) ON DELETE SET NULL
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
