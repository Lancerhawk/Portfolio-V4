# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-18

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
