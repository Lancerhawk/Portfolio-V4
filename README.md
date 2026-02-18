# Portfolio V4 - Arin Jain

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.2.3-green.svg)

A modern, interactive developer portfolio built with performance and aesthetics in mind. Featuring a unique paper tear design, reactive parallax effects, and a responsive layout.

## Features

-   **Interactive UI**: Custom paper tear effects with deterministic jagged edges.
-   **Parallax Animations**: Smooth scrolling and mouse movement depth effects.
-   **Responsive Design**: Optimized for Desktop, Tablet, and Mobile devices.
-   **Dynamic Content**: JSON-driven portfolio data for easy updates.
-   **Interactive Terminal**: Fully functional retro-style command-line interface with theme support.
-   **Interactive Map**: Leaflet integration for journey visualization with custom markers.

## Technical Stack

-   **Frontend**: React 19
-   **Build Tool**: Vite
-   **Styling**: TailwindCSS v4 & CSS Modules
-   **Maps**: Leaflet & React-Leaflet
-   **Deployment**: Vercel / Netlify (Ready)

## ⚙️ Configuration

### Environment Variables

1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Add your GitHub Token:
    -   Generate a Personal Access Token on GitHub (Settings -> Developer Settings -> Personal Access Tokens).
    -   Select `repo` (or just `public_repo` if you only need public data) scope.
    -   Paste it into `.env` as `VITE_GITHUB_TOKEN`.

> **Note**: The GitHub section uses `sessionStorage` to cache API responses. If you don't see your latest contributions immediately, try clearing your browser cache or waiting for the session to expire.

## 📝 How to Use This Template

This portfolio is designed to be easily customizable via a single JSON file. You don't need to touch the React code to update your content!

### 1. Edit `src/data/portfolio.json`
All text, links, and project data are stored here.
-   **Hero**: Update `greeting`, `name`, `description`, and `socials`.
-   **Skills**: Add or remove skills in the `skills` array.
-   **Projects**: Add your own projects to the `projects` list.
-   **Journey**: Update your timeline in `journey`.

### 2. Update Images
-   Place your images in the `public/images` folder.
-   Reference them in `portfolio.json` (e.g., `"logo": "/images/my-logo.png"`).

### 3. Change Colors (Optional)
-   Edit `src/index.css` to change CSS variables like `--primary`, `--cyan`, `--yellow`, etc., to match your brand.

## 💻 Development

Start the development server:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Building for Production

Create a production-ready build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
