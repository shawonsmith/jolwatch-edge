# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-10-01

### Fixed
- Version alignment across `package.json`, `SECURITY.md`, and `CITATION.cff`.
- Added missing `paper/paper.bib` containing BibTeX citations for formal academic review.
- Updated manuscript link in `README.md` to point to `main` branch to prevent stale tag caching.
- Confirmed verified author ORCID `0009-0006-5669-3792` across all documentation.

## [1.0.0] - 2026-10-01

### Added
- Modular architecture separating `js/engine.js` (core math) and `js/app.js` (UI controller).
- Comprehensive 28-test automated validation suite covering boundary thresholds, edge cases, reserve calculations, and maintenance indicators.
- Continuous Integration workflow via GitHub Actions across Node.js 18.x, 20.x, and 22.x.
- Safe DOM node rendering to prevent localStorage XSS vulnerabilities.
- JSON incident log export utility for offline data extraction.
- Official MIT License and academic citation file (`CITATION.cff`).
- Formalized mathematical specifications in `docs/TESTING.md`.
- Essential Reserve Clock and alert-to-repair simulation.
- English and Bangla bilingual user interface.
- Official Zenodo DOI archiving (`10.5281/zenodo.23071386`).
