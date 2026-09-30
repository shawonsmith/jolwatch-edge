# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-01

### Added
- Modular architecture separating `js/engine.js` (core math) and `js/app.js` (UI controller).
- Comprehensive 28-test automated validation suite covering boundary thresholds, edge cases, reserve calculations, and maintenance indicators.
- Continuous Integration workflow via GitHub Actions across Node.js 18.x, 20.x, and 22.x.
- Safe DOM node rendering to prevent localStorage XSS vulnerabilities.
- JSON incident log export utility for offline data extraction.
- Official MIT License and academic citation file (`CITATION.cff`).
- Formalized mathematical specifications in `docs/TESTING.md`.

### Changed
- Clarified sync action as local prototype simulation (`Simulate Sync`) rather than a real cloud API request.
- Renamed "Tank Health Score" to "Maintenance Attention Indicator" to avoid misleading claims about microbiological water potability.
- Synchronized canonical benchmark dataset strictly across UI presets, documentation, and test suite.

## [1.0.0] - 2026-09-15

### Added
- Initial single-file proof of concept demonstrating inlet-to-zone balance logic.
- Basic Essential Reserve Clock and alert-to-repair simulation.
- English and Bangla bilingual user interface.
