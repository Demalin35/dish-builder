# Dish Builder

## Local app startup

```bash
npm install
npm start
```

## Authentication and database setup

The app now includes API-backed auth and user-owned saved recipes:

- `POST /api/auth.php?action=signup`
- `POST /api/auth.php?action=login`
- `GET /api/auth.php?action=me`
- `POST /api/auth.php?action=logout`
- `GET /api/saved_recipes.php`
- `POST /api/saved_recipes.php`
- `DELETE /api/saved_recipes.php`

### Required environment variables for PHP hosting

Set one of the following database configurations on your PHP host:

1) `DB_DSN` (single-string PDO DSN), or
2) `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (and optional `DB_CHARSET`)

Example:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=dish_builder
DB_USER=dish_builder_user
DB_PASSWORD=super_secret_password
DB_CHARSET=utf8mb4
OPENAI_API_KEY=your_openai_key
```

### Database schema

Tables are auto-created by `api/bootstrap.php`:

- `users`
- `auth_tokens`
- `saved_recipes`

### Production notes

- In production, set environment variables in your hosting panel or deployment config.
- The frontend stores only the auth token in browser storage.
- API access uses `Authorization: Bearer <token>`.
- Passwords are hashed in PHP with `password_hash()`.

### What to wire next

- Replace token-table auth with JWT/cookie strategy if desired.
- Add endpoint rate limiting and stricter validation.
- Add password reset and email verification flows.
