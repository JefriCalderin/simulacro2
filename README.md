# Project Manager

A Single Page Application (SPA) for internal project management built with vanilla JavaScript and Bootstrap 5. Features authentication, role-based access control, full CRUD operations, dark mode, search, filters, pagination, and toasts.

## Technologies

- **Vanilla JavaScript** (ES6 Modules) — SPA architecture
- **Bootstrap 5.3** — UI components, grid, dark mode, form validation
- **Bootstrap Icons** — Icon set
- **json-server** — Simulated REST API / database
- **GSAP** — SVG face animation on login
- **localStorage** — Session + dark mode persistence

## Installation

```bash
git clone <repo-url>
cd project-manager
npm install
```

## Running the Project

Two terminals needed:

### Terminal 1 — JSON Server (API)
```bash
npm run api
```

API at `http://localhost:3000`.

### Terminal 2 — Static Files
```bash
npm start
```

Open the URL shown (typically `http://localhost:3001` or `http://localhost:5000`).

> ES Modules require an HTTP server. Opening `index.html` directly will not work.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users?email=xxx` | Find user by email |
| GET | `/projects` | List all projects |
| GET | `/projects/:id` | Get project by ID |
| GET | `/projects?assignedTo=:id` | Get user's projects |
| POST | `/projects` | Create project |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

## Test Users

| Role | Email | Password |
|------|-------|----------|
| **Manager** | `manager@test.com` | `123456` |
| **Collaborator** | `user@test.com` | `123456` |

## Features

### Core
- Hash-based SPA routing with route guards
- Role-based access (Manager vs Collaborator)
- Full CRUD on projects
- Responsive sidebar layout

### Dark Mode
Toggle in the sidebar footer. Preference is persisted in localStorage. Also respects `prefers-color-scheme` system setting on first visit.

### Search & Filters
On the Projects page:
- **Search** by project name or description (real-time)
- **Filter** by status (Pending / In Progress / Completed)
- Results update instantly with item count

### Pagination
Projects are paginated (5 per page) with full page navigation.

### Toasts
Success/error notifications appear in the top-right corner and auto-dismiss after 3.5 seconds.

### Advanced Form Validation
- Client-side validation using Bootstrap's `was-validated`
- Email format, password length, required fields
- Character limits on description (max 500)
- Visual feedback (green/red borders)

### Loader
Bootstrap spinner component shown during all async operations.

## Project Structure

```
project-manager/
├── index.html              # Minimal SPA shell (Bootstrap + GSAP CDN)
├── style.css               # Custom styles + dark mode variables
├── netlify.toml            # Deploy config for Netlify/SPA routing
├── db.json                 # json-server data (users + projects)
├── README.md
├── js/
│   ├── main.js             # Entry point, sets initial route
│   ├── router.js           # Hash router + sidebar layout
│   ├── animation/
│   │   └── face.js         # SVG face animation (GSAP)
│   ├── services/
│   │   ├── api.js          # Fetch wrapper
│   │   ├── auth.js         # Authentication logic
│   │   └── session.js      # localStorage persistence
│   ├── views/
│   │   ├── login.js        # Login form with SVG face
│   │   ├── dashboard.js    # Stats cards by role
│   │   ├── projects.js     # Table + search + filter + pagination
│   │   ├── projectForm.js  # Create/Edit form with validation
│   │   └── projectDetail.js# Detail view with status update
│   └── utils/
│       ├── helpers.js      # Formatting utilities
│       ├── toast.js        # Bootstrap toast notifications
│       └── darkMode.js     # Dark mode toggle + persistence
```

## Role Permissions

### Manager
- View all projects
- Create, edit, delete any project
- View project details

### Collaborator
- View only assigned projects
- View project details
- Update only the status of own projects

## Technical Decisions

- **Vanilla JS over frameworks**: The requirements specified vanilla JavaScript, so no React/Vue. This also keeps the bundle small and avoids a complex build setup.
- **Hash-based routing**: Simple to implement with the `hashchange` event, no server-side URL rewrite needed for the SPA.
- **localStorage for session**: Survives page refresh and browser restart. Simpler than sessionStorage for this use case.
- **Bootstrap 5.3**: Provides ready-made components (cards, tables, forms, toasts, modals) that speed up development and match the SB Admin 2 style.
- **SB Admin 2 design**: Adapted the class names and layout to give a professional dashboard look without copying the entire template.
- **json-server**: Quick mock API that supports GET/POST/PATCH/DELETE — ideal for development and testing.
- **GSAP for face animation**: The login face animation was a creative touch; GSAP's TweenMax makes SVG morphing and coordinate-based movement straightforward.
- **Modular structure**: Separated concerns into services/views/utils so the code is easier to maintain and test.
- **Dark mode via CSS variables**: Using `data-bs-theme` on `<html>` lets Bootstrap handle most of the dark mode styling, with custom overrides only where needed.

## Deploy

This project is ready for deployment on Netlify or Vercel:

### Netlify (one-click)
1. Push repo to GitHub/GitLab
2. Connect repo in Netlify
3. Build command: `echo 'Static site'`
4. Publish directory: `.`
5. The `netlify.toml` handles SPA redirects automatically

### Vercel
1. Push repo to GitHub/GitLab
2. Import project in Vercel
3. Framework preset: **Other**
4. The SPA routing is handled by default

> Note: The API (json-server) is local only. For a production deploy, replace with a real backend.
