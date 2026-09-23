# Smart Bar Operations Platform

Unified laptop loan management, student hardware repair tracking, and automated  service desk platform.

## Architecture

- **Frontend:** Next.js (TypeScript, Tailwind CSS, App Router) inside `/frontend`
- **Backend:** Spring Boot 3 (Java 25, Spring Boot JPA, Spring Security) inside `/backend`
- **Database:** PostgreSQL 16 via Docker

## Quick Start (Local Development)

1. **Start Database:**

    ```bash
    docker compose up -d
    ```

2. **Run Backend API:**

    ```bash
    cd backend && ./gradlew bootRun
    ```

3. **Run Frontend Web App:**

    ```bash
    cd frontend && npm run dev
    ```
