# Coding World

A simple, beginner-friendly online coding classroom. Teachers create coding
tasks; students complete them in a browser-based HTML/CSS/JavaScript workspace
with a live preview, then submit for grading and feedback.

## Structure

- `backend/` — Laravel 10 REST API (Sanctum auth, MySQL)
- `frontend/` — React 18 + Vite SPA (React Router, Axios, CodeMirror)

## Backend setup

```
cd backend
cp .env.example .env
composer install
php artisan key:generate
# create a MySQL database named coding_world (or edit .env), then:
php artisan migrate --seed
php artisan serve
```

Seeded accounts (password for all: `password`):
- Teacher: teacher@codingworld.test
- Students: ada.lovelace@codingworld.test, alan.turing@codingworld.test, margaret.hamilton@codingworld.test

## Frontend setup

```
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000/api` by default
(see `frontend/.env.example`), and the backend expects the frontend at
`http://localhost:5173` for CORS/Sanctum (see `backend/.env.example`).
