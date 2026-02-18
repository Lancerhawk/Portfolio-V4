# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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