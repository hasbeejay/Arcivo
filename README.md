# Arcivo — Your Personal Internet Archive & Knowledge Workspace

[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Chrome Extension](https://img.shields.io/badge/Extension-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **Full Stack Web Development Lab (CS-301 L) — Semester Project**  
> **Class:** BSCS 5A — Fall 2026  
> **Team:** Haseeb Jalil (Lead), Taimur Sajid, M. Uzair, Sharuf Khan

---

## 📌 Project Overview

The modern internet is abundant with valuable resources—articles, technical documentation, research papers, YouTube videos, and repositories—scattered across ephemeral browser bookmarks, messaging apps, and fragmented notes. Conventional bookmarks only store fragile URLs that suffer from **link rot** (when target websites change or shut down).

**Arcivo** is a full-stack personal internet archive and digital knowledge-management workspace featuring:
1. **Universal Archival & Reader Snapshots:** Captures rich Open Graph metadata and preserves clean reader-mode text snapshots so content remains preserved even if original links vanish.
2. **Dedicated Metadata Adapters:** Deep integrations with the YouTube Data API v3, Google Books API, Open Library, and GitHub API for specialized resource cards.
3. **macOS-Inspired Desktop Workspace:** Clean, desktop-grade UX complete with a frosted-glass menu bar, interactive dock, Finder-style folder explorer, and customizable resource views.
4. **Integrated Markdown Note-Taker:** Link contextual notes and study annotations directly to archived resources.
5. **Companion Browser Extension (Manifest V3):** One-click quick-archival directly from the browser into designated Arcivo folders and tags.
6. **AI-Assisted Knowledge Extraction:** Automatic 3-bullet takeaway summaries and smart tag suggestions via the Google Gemini API.

---

## 🏗️ Monorepo Architecture

Arcivo is organized as a unified single repository (monorepo) using npm/pnpm workspaces:

```
Arcivo/
├── apps/
│   ├── api/                 # NestJS Backend API & Scraper Engine
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # JWT Auth & Extension Token service
│   │   │   │   ├── resources/    # Archival CRUD, Reader Snapshots, Favorites
│   │   │   │   ├── scraper/      # Universal OG Scraper + YouTube & Books Adapters
│   │   │   │   ├── folders/      # Hierarchical Folder Management
│   │   │   │   ├── notes/        # Markdown Notes & Resource Linkage
│   │   │   │   ├── tags/         # Categorization & Collections
│   │   │   │   ├── search/       # PostgreSQL Full-Text Search
│   │   │   │   └── ai/           # Gemini API Summarizer
│   │   │   └── database/         # Prisma/TypeORM Schema & Migrations
│   │   └── package.json
│   │
│   ├── web/                 # React 18+ Frontend (Vite + Tailwind CSS)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── macos/        # MenuBar, Dock, FinderSidebar, GlassWindow
│   │   │   │   ├── explorer/     # ResourceCard, FolderGrid, ViewToggle
│   │   │   │   ├── saver/        # QuickArchiveModal, URLPreviewCard
│   │   │   │   └── notes/        # MarkdownEditor, SplitNoteView
│   │   │   ├── hooks/            # Custom React hooks & API mutations
│   │   │   ├── store/            # Zustand global state management
│   │   │   └── pages/            # Desktop Workspace, Login, ResourceDetail
│   │   └── package.json
│   │
│   └── extension/           # Chrome Companion Extension (Manifest V3)
│       ├── manifest.json         # Extension configuration & permissions
│       ├── popup/                # Popup UI: active tab detection, folder selection
│       ├── background/           # Service worker for API authentication & sync
│       └── package.json
│
├── docker-compose.yml       # Local PostgreSQL database container
├── package.json             # Root workspace scripts
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend** | NestJS (Node.js / TypeScript) | Enterprise architecture, modular dependency injection, robust validation pipes. |
| **Database** | PostgreSQL | Relational integrity, JSONB support for rich metadata, built-in full-text search. |
| **ORM / Query** | Prisma or TypeORM | Type-safe migrations, auto-generated TypeScript types, efficient relations. |
| **Frontend** | React + TypeScript (Vite) | Lightning-fast HMR, component reusability, high performance. |
| **Styling** | Tailwind CSS + Lucide Icons | macOS-style frosted glassmorphism (`backdrop-blur`), fluid grid/flex layouts. |
| **Extension** | Chrome Manifest V3 | Standard modern browser extension API, activeTab permissions, local storage sync. |
| **Scraper** | Cheerio + Readability | High-throughput server-side Open Graph parsing and clean article body extraction. |
| **AI Integration** | Google Gemini 1.5 Flash | Free, high-speed automated summarization and intelligent tag generation. |

---

## 📊 24 CRUD Operations Matrix

Arcivo exceeds academic requirements by supporting 24 distinct CRUD operations across 6 core entities:

| Entity | Create | Read | Update | Delete |
| :--- | :--- | :--- | :--- | :--- |
| **Archive Resource** | Save URL with scraped metadata | View card, detail view, reader mode | Edit title, description, folder | Remove / move to Trash |
| **Folder** | Create folder with custom color/icon | Browse folder tree & view contents | Rename, recolor, move folder | Delete folder (cascade/preserve) |
| **Note** | Create standalone or linked note | View note with rendered markdown | Update title, content, or linkage | Delete note |
| **Tag** | Create colored tag | Filter resources by tag | Rename tag | Delete tag & unlink |
| **Collection** | Create multi-resource collection | View curated collection feed | Add/remove items, update meta | Delete collection |
| **Favorite** | Star resource as favorite | View favorites feed | Toggle favorite status | Unfavorite |

---

## 🔌 API Directory

### External APIs & Adapters
* **Universal OG Scraper:** Built-in server parser using `cheerio` extracting `og:title`, `og:image`, `og:description`, author, and favicon.
* **Reader Snapshot Engine:** Built-in `@mozilla/readability` extracting clean article bodies for offline preservation.
* **YouTube Data API v3:** Fetches video duration, creator channel, high-res thumbnails, and embed data for `youtube.com` / `youtu.be` links.
* **Google Books & Open Library APIs:** Extracts book covers, publication metadata, and authors for literature and research citations.
* **Google Gemini AI API:** Provides 1-click 3-bullet takeaway summaries and suggested tags.

### Internal REST Endpoints

#### Authentication (`/api/v1/auth`)
All protected routes expect `Authorization: Bearer <token>`.

* `POST /register` — User registration with bcrypt-hashed passwords (returns user + tokens).
* `POST /login` — Email/password login returning Access & Refresh tokens.
* `POST /google` — Google sign-in via a Google Identity Services ID token (`credential`).
* `POST /refresh` — Exchange a refresh token for a fresh access token pair.
* `GET  /me` — Authenticated profile.
* `POST /extension-token` — Generate a long-lived (90d) token for the Chrome extension; accepted by the same JWT guard as access tokens.

Token types are encoded in the JWT `type` claim (`access`, `refresh`, `extension`). Refresh tokens are only accepted by `/auth/refresh`; extension tokens authenticate like access tokens but skip the browser refresh cycle.

#### Resources (`/api/v1/resources`)
All endpoints are scoped to the authenticated user (access or extension tokens).

* `GET  /` — List resources. Query params: `q`, `folderId`, `favorite=true`, `sort=newest|oldest|title`.
* `POST /` — Archive a resource. Accepts `url`, optional `title`, `description`, `resourceType`, `folderId`, `tags[]`, and `note`. Derives kind, title, and reading time when omitted.
* `GET  /:id` — Resource detail with folder, tags, latest note, and AI takeaways.
* `PATCH /:id` — Update title, description, favorite state, folder (or `folderId: null` to unfile), tags, note, or resource type.
* `DELETE /:id` — Permanently remove a resource.

#### Folders (`/api/v1/folders`)
* `GET  /` — List folders ordered by `sortOrder`, including resource counts.
* `POST /` — Create a folder with name, optional color, and description.

New accounts start with four folders: Research, University, Web Development, and Inspiration.

#### Notes
Notes are created and updated through the resource `note` field. The workspace Notes tab is derived from resources that have an attached note; standalone notes CRUD is planned.
* `DELETE /:id` — Delete note.

#### Tags (`/api/v1/tags`)
* `POST /` — Create a tag.
* `GET  /` — List tags with usage statistics.
* `DELETE /:id` — Delete tag.

#### Search (`/api/v1/search`)
* `GET /?q={query}` — PostgreSQL full-text search across titles, descriptions, notes, and snapshots.

---

## 🗄️ Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ FOLDERS : owns
    USERS ||--o{ RESOURCES : saves
    USERS ||--o{ NOTES : writes
    USERS ||--o{ TAGS : creates
    FOLDERS ||--o{ RESOURCES : contains
    RESOURCES ||--o{ NOTES : references
    RESOURCES ||--o{ RESOURCE_TAGS : has
    TAGS ||--o{ RESOURCE_TAGS : categorizes

    USERS {
        uuid id PK
        string email UK
        string password_hash "nullable for Google-only accounts"
        string google_id UK
        boolean email_verified
        string full_name
        string avatar_url
        datetime created_at
    }

    FOLDERS {
        uuid id PK
        uuid user_id FK
        uuid parent_id FK
        string name
        string color
        string icon
        datetime created_at
    }

    RESOURCES {
        uuid id PK
        uuid user_id FK
        uuid folder_id FK
        string url
        string title
        text description
        string thumbnail_url
        string favicon_url
        string resource_type
        text content_snapshot
        text ai_summary
        boolean is_favorite
        datetime created_at
    }

    NOTES {
        uuid id PK
        uuid user_id FK
        uuid resource_id FK
        string title
        text content_markdown
        datetime created_at
    }

    TAGS {
        uuid id PK
        uuid user_id FK
        string name
        string color
    }

    RESOURCE_TAGS {
        uuid resource_id PK,FK
        uuid tag_id PK,FK
    }
```

---

## 👥 Team Members & Responsibilities

| Member | Roll Number | Primary Responsibility |
| :--- | :--- | :--- |
| **Haseeb Jalil** *(Lead)* | `241908` | Architecture, NestJS backend, DB schema & migrations, Scraper & YouTube/Books pipeline. |
| **Taimur Sajid** | `241839` | Frontend Lead, macOS Desktop UI (Dock, MenuBar, FinderSidebar), Resource Card Explorer. |
| **M. Uzair** | `241875` | Custom Note Taker module, Markdown editor integration, Resource Details modal, Tagging. |
| **Sharuf Khan** | `231633` | Chrome Extension (Manifest V3), extension sync service, PostgreSQL full-text search, Deployment. |

---

## 🚀 Quick Start / Local Development

### 1. Prerequisites
* Node.js v20+ (v24 supported)
* PostgreSQL 15+ (or Docker)
* Git

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/hasbeejay/Arcivo.git
cd Arcivo
npm install
```

### 3. Start Local PostgreSQL with Docker
```bash
docker compose up -d
```

### 4. Configure Environment Variables
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/extension/.env.example apps/extension/.env
```
The defaults already match `docker-compose.yml`. Set the optional API keys if you need those integrations:
```env
DATABASE_URL="postgresql://arcivo_user:arcivo_password@localhost:5432/arcivo_db?schema=public"
JWT_SECRET="arcivo-secret-key-change-in-production"
JWT_REFRESH_SECRET="arcivo-refresh-secret-change-in-production"
YOUTUBE_API_KEY="your-google-cloud-api-key"
GEMINI_API_KEY="your-gemini-api-key"
GOOGLE_CLIENT_ID=""
PORT=4000
```

#### Google Sign-In setup (optional)
Email/password auth works with no extra configuration. To enable **Continue with Google**:

1. Open the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials) and create an **OAuth client ID** of type **Web application**.
2. Add an **Authorized JavaScript origin**: `http://localhost:5173` (add your deployed web URL later).
3. Copy the client ID into both files:
   * `apps/api/.env` → `GOOGLE_CLIENT_ID="..."`
   * `apps/web/.env` → `VITE_GOOGLE_CLIENT_ID="..."`
4. Restart the API and Vite dev server.

Both values must be the same client ID. If `GOOGLE_CLIENT_ID` is unset, `POST /auth/google` returns `503` and the web UI disables the Google button with a setup hint. Google accounts are linked to existing email/password accounts by email, and the extension signs in with the same email/password account.

### 5. Apply Database Migrations
```bash
npm run prisma:migrate --workspace=apps/api
```
This creates the tables in the running PostgreSQL container and generates the Prisma client.

### 6. Run the Applications
```bash
# Start backend API (NestJS)
npm run start:dev --workspace=apps/api

# Start frontend web app (React + Vite)
npm run dev --workspace=apps/web
```

### 7. Load the Browser Extension
1. Build the extension: `npm run build --workspace=apps/extension`.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Toggle on **Developer mode** in the top right.
4. Click **Load unpacked** and select the `apps/extension/dist` folder.

The popup signs in with your Arcivo email/password, stores a 90-day extension token in `chrome.storage.local`, and validates it against `GET /auth/me` on open. Signed-in users can archive the active tab to a real folder (`POST /resources` with title, folder, and tags); saved pages appear in the workspace immediately. Sign out from the popup header to clear the session. The API must be reachable at `http://localhost:4000` (already allowed in the manifest's `host_permissions`).

---

## ☁️ Deployment Strategy

* **Database:** Hosted PostgreSQL on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
* **Backend API:** Containerized NestJS deployment on [Render](https://render.com) or [Railway](https://railway.app).
* **Frontend Web App:** Continuous deployment via [Vercel](https://vercel.com).
* **Extension:** Pre-built distribution package ready for Chromium-based browsers.

---

## 📜 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
