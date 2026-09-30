# Contributing to JolWatch Edge

Thank you for your interest in contributing to **JolWatch Edge**! This project aims to make water intelligence accessible to low-connectivity facilities such as rural clinics, community schools, and public buildings.

## Development Workflow

### Prerequisites
- Node.js 18.x or newer
- Git

### Quick Start
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/jolwatch-edge.git
   cd jolwatch-edge
   ```
3. Run the automated test suite:
   ```bash
   npm test
   ```
4. Open `index.html` directly in any modern browser to test UI modifications. No build steps or bundlers required.

### Code Style Guidelines
- **Modularity:** Keep mathematical rules and classification logic inside `js/engine.js`. DOM interactions belong in `js/app.js`.
- **Determinism:** Any new detection rule or threshold must be accompanied by automated deterministic tests in `tests/detection-engine.test.js`.
- **Security:** Do not use `innerHTML` for rendering untrusted local storage or user inputs; use safe DOM element construction (`textContent`).
- **Internationalization:** Maintain both English (`en`) and Bangla (`bn`) dictionary keys when updating UI strings.

## Submitting Pull Requests
1. Create a descriptive feature branch (`git checkout -b feature/dynamic-thresholds`).
2. Ensure `npm test` passes 100% of the test suite.
3. Commit with clear, conventional commit messages (`feat: ...`, `fix: ...`, `docs: ...`).
4. Push to your fork and submit a Pull Request to `main`.
