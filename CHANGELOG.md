# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-02-19

### Added
- **AI Assistant Modal**: Full neobrutalist chat interface powered by Groq (`llama-3.1-8b-instant`) — dynamically prompted from live `portfolio.json` data.
- **Express Backend Server**: Dedicated Node.js/Express server (`server/`) with `/api/health` and `/api/chat` endpoints, CORS allowlist, and ENV-driven config.
- **Quick-Question Chips**: One-click prompt buttons (Skills, Projects, Education, Experience) shown on a fresh conversation to guide the visitor.
- **Animated Message Bubbles**: Per-message `msgIn` slide-up animation with distinct user (pink) and assistant (cyan) avatars.
- **Dot-Grid Chat Area**: Subtle `radial-gradient` dot grid background in the message pane for a premium neobrutalist feel.
- **Scanline Header Stripe**: Decorative repeating border stripe at the very top of the modal header.
- **Live Status Indicator**: Pulsing dot (green/yellow/red) with connecting animation and live message count in the header subtitle.
- **Character Counter**: Appears inline while typing so the user can see input length at a glance.
- **Keyboard Shortcuts Footer**: Styled `<kbd>` hints for `Enter`, `Shift+Enter`, and `Esc` at the bottom of the modal.
- **ESLint Node.js Config**: Added a dedicated server-side ESLint block with `globals.node` and `sourceType: 'commonjs'` to `eslint.config.js`.

### Fixed
- **ESLint Server Errors**: Resolved 11 `no-undef` errors for `require`, `process`, and `__dirname` in `server/index.js`.

## [0.3.1] - 2026-02-19


### Added
- **Realistic 3D Book Flip**: Completely redesigned the Journey section flip using a unified `preserve-3d` leaf structure. Both the cover and content now exist on the same physical 'leaf'.
- **Snap-to-State Interaction**: Implemented debounced scroll-stop detection to ensure the book always completes its flip (fully open or fully closed) instead of getting stuck mid-transition.
- **Viewport-Aware Animations**: Integrated Intersection Observer into the Paper Tear effect to disable all JS logic and style writes when the component is off-screen.
- **Terminal Message Tracking**: Added visual divider lines after each command response to clearly delineate terminal history.

### Fixed
- **Page Tear Optimization**: Eliminated parallax stutter by resolving conflicts between CSS transitions and high-frequency JS updates.
- **State-Locking Performance**: Added visual state-locking to prevent redundant DOM writes once animation boundaries are reached.
- **Journey Content Glitch**: Resolved the issue where timeline content would render or 'print' before the flip animation started.
- **Terminal UI Refinement**: Hashed out distracting sidebars, global controls, and notifications from the `/terminal` route for a cleaner immersion.
## [0.3.0] - 2026-02-19

### Added
-   **Vibe Check System**: Implementation of a global theme-switching system with 4 distinct color palettes (Neon, Retro, Minimal, Default).
-   **Contrast Accessibility Sweep**: Comprehensive update to all components using CSS contrast variables to ensure legibility across all themes.
-   **Vibe Notifications**: Added centered on-screen notifications that display the active theme name for 3 seconds during transitions.
-   **Global Sound Controls**: Integrated a persistent Mute toggle for the tech-click sound system.

### Fixed
-   **Button Visibility**: Resolved contrast issues for the floating Mute and History buttons in the Retro and Neon themes.
-   **Responsive Layout Refinements**: Minor adjustments to spacing and contrast in the Projects and Skills sections for better mobile readability.

## [0.2.6] - 2026-02-18

### Added
-   **Custom Cursor**: Implemented a theme-aware Neo-brutalist cursor (ring & dot) with smooth mouse tracking and hover animations.
-   **Terminal Cursor**: specialized "Block Cursor" for the `/terminal` route to match the retro aesthetic.
-   **Reactive Click Sound**: Integrated a low-latency techy "snap" sound using the Web Audio API for a more tactile user experience.
-   **Custom Selection Styling**: Theme-aware `::selection` colors to match Neo-brutalist and Terminal themes.

### Changed
-   **Cursor Visibility**: Hidden the native system cursor to maintain the custom immersive design.

## [0.2.5] - 2026-02-18

### Added
-   **Technical SEO Suite**: Comprehensive metadata suite including Keywords, Open Graph, and Twitter Card support in `index.html`.
-   **Structured Data (JSON-LD)**: Implemented `Person` schema to improve entity recognition by search engines.
-   **Crawler Guidance**: Added `robots.txt` and `sitemap.xml` to the `public` directory.

### Changed
-   **Domain Configuration**: Unified all canonical links and asset URLs to use the production domain `https://arinjain.xyz`.

## [0.2.4] - 2026-02-18

### Fixed
-   **Navbar Theme Switcher**: Fixed a prop name mismatch (`toggle` vs `toggleTheme`) in `App.jsx` that prevented the light/dark mode switcher from working.

## [0.2.3] - 2026-02-18

### Added
-   **Map Label Positioning**: Support for `labelPosition: bottom` to prevent marker overlaps.
-   **Timeline UI**: Restored the vertical connector line for the last item to maintain visual consistency.

### Fixed
-   **Map Centering**: Adjusted auto-centering logic to focus on the info box (popup) instead of just the pin for better visibility.
-   **Map Popup UI**: Added scrollable content container and redesigned neo-brutalist close button.
-   **Map Opacity**: Removed default transparency from popups for better legibility.

## [0.2.2] - 2026-02-18

### Added
-   **Version History Modal**: Floating button (FAB) in the bottom-right that opens a neo-brutalist modal showing project evolution.

### Fixed
-   **Map Overlay**: Removed unwanted arrow image overlay from the journey map.


## [0.2.1] - 2026-02-18

### Added
-   **Physical Book Flip**: Redesigned the "My Journey" flip to use a realistic 3D page-turning effect with `backface-visibility: hidden`. Content is now physically on the back of the cover.
-   **Vercel Deployment**: Added `vercel.json` with rewrite rules to support client-side routing and page reloads.

### Changed
-   **Mobile Paper Tear**: Completely removed the gray parallax gap/color on mobile devices for a cleaner, non-popping jagged transition.
-   **Responsive Footer**: Centered layout and improved vertical stacking on small screens for better accessibility.

### Fixed
-   Fixed "white screen" crash caused by missing `useState` import.
-   Eliminated sub-pixel color bleeding in paper tear SVGs.
-   Refined sidebar shadow behavior to correctly hide when the book is open.

## [0.2.0] - 2026-02-18

### Added
-   **Interactive Terminal**: A fully functional retro-style terminal route (/terminal) with dynamic theme switching (Amber, Matrix, Modern, Retro), command history, and tab completion.
-   **Dynamic ASCII Art**: Integrated Figlet for real-time ASCII art generation in the terminal.
-   **CGPA Display**: Added CGPA to the education section in `portfolio.json`.
-   **Language Stars Counter**: Fixed and improved the language proficiency star visualization.

### Changed
-   **Journey Book Flip**: Completely redesigned the 3D book flip animation to be smoother and more robust, syncing logic with reference implementations.
-   **Map Integration**: Refined Leaflet map markers, fixed positioning offsets, and improved responsive behavior.
-   **Brutalism Aesthetic**: Unified the design system with consistent borders, shadows, and neo-brutalist color tokens.
-   **Responsive Navigation**: Improved navbar behavior and section tracking.

### Fixed
-   Fixed marker icons not loading correctly in Leaflet.
-   Resolved overlapping issues in the Journey section grid.
-   Fixed various z-index conflicts between overlapping 3D components.


### Added
-   **Paper Tear Effect**: Implemented a realistic, jagged paper tear separator with deterministic path generation.
-   **Tape Sticker**: Added an interactive tape sticker component with correct positioning logic.
-   **Hero Section**: Enhanced layout with centered content and responsive image sizing.
-   **Tech Badges**: Centered tech stack badges for better visual balance.

### Changed
-   Updated project name to `portfolio-arin-jain`.
-   Refactored `HeroSection` grid layout to prevent excessive spacing on wide screens.
-   Optimized `PaperTear` component performance by moving path generation outside the render cycle.
-   Adjusted gray background fade-out logic in `usePaperTearParallax` for better visual continuity.

### Fixed
-   Fixed misalignment in top/bottom tear SVG paths.
-   Resolved issue where the gray background layer remained visible when the tear was closed.
-   Fixed tape sticker drifting issues by moving it into the relative container.

## [0.0.1] - 2026-02-14

### Added
-   Initial project setup with Vite + React.
-   Basic component structure (Hero, About, Skills, Journey).
-   Integration of Leaflet maps.