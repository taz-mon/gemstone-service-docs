[![Live Site](https://img.shields.io/website?up_message=LIVE&down_message=DOWN&url=https%3A%2F%2Ftaz-mon.github.io%2Fgemstone-service-docs%2F&style=for-the-badge)](https://taz-mon.github.io/gemstone-service-docs/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/taz-mon/gemstone-service-docs/static.yml?style=for-the-badge&label=Deploy)](https://github.com/taz-mon/gemstone-service-docs/actions)
[![Built with Docusaurus](https://img.shields.io/badge/Built%20with-Docusaurus%203.x-teal?style=for-the-badge)](https://docusaurus.io/)

# GemStone Service Docs

#### A documentation site for GemStone/S 64 Bit — a high-performance, object-oriented transactional database platform powering mission-critical operations in financial services, government, healthcare, and telecommunications since 1982.

---

This site is a **portfolio writing sample** demonstrating docs-as-code workflow: Markdown authoring, structured information architecture, custom CSS theming, and automated GitHub Actions deployment. It covers GemStone/S database administration across four original technical articles.

[**View the live site →**](https://taz-mon.github.io/gemstone-service-docs/)  

[**View the author's portfolio →**](https://taz-mon.github.io/tazdocs-as-code/docs/my-docs/resume/)

---

## Contents

- [About this repo](#about-this-repo)
- [Documentation coverage](#documentation-coverage)
- [Run locally](#run-locally)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Author](#author)

---

## About this repo

This repository contains the source for a Docusaurus 3.x documentation site covering GemStone/S 64 Bit database administration. Content is written in Markdown, organized by audience and task type, and deployed automatically to GitHub Pages on every push to `main`.

The articles were researched from primary source documentation — the GemStone/S 64 Bit Programmer's Guide — and written to demonstrate the ability to synthesize complex technical material into clear, structured content for database administrator and developer audiences.

---

## Documentation coverage

| Article | Category | Audience | Focus |
|---|---|---|---|
| [Platform Overview](https://taz-mon.github.io/gemstone-service-docs/docs/getting-started/platform-overview) | Getting Started | Admins, new users | Architecture orientation, comparison to SQL |
| [Quick Start](https://taz-mon.github.io/gemstone-service-docs/docs/getting-started/quick-start) | Getting Started | Admins | First installation through first committed transaction |
| [Transactions and Concurrency](https://taz-mon.github.io/gemstone-service-docs/docs/core-concepts/transactions) | Core Concepts | Developers, admins | Transaction modes, commit conflicts, locking, Rc classes |
| [Object Security](https://taz-mon.github.io/gemstone-service-docs/docs/reference/object-security) | Reference | Admins | Security policies, user groups, system privileges |

---

## Run locally

**Prerequisites:** Node.js 18 or later, npm.

| OS | Package manager | Install command |
|---|---|---|
| macOS | Homebrew | `brew install node` |
| Ubuntu | Apt | `sudo apt install nodejs npm` |
| Windows | Chocolatey | `choco install nodejs-lts` |

**Steps:**

1. Clone the repository:

```bash
git clone https://github.com/taz-mon/gemstone-service-docs.git
cd gemstone-service-docs
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

Browse the site at [localhost:3000/gemstone-service-docs/](http://localhost:3000/gemstone-service-docs/).

4. Build a production copy:

```bash
npm run build
```

Static output is written to the `/build` directory.

---

## Project structure

```
gemstone-service-docs/
├── .github/
│   └── workflows/
│       └── static.yml          # GitHub Actions deploy workflow
├── docs/
│   ├── getting-started/
│   │   ├── platform-overview.md
│   │   └── quick-start.md      # Tabbed content: Linux zip, Linux RPM, macOS
│   └── reference/
│       └── object-security.md
├── src/
│   ├── css/
│   │   └── custom.css          # Custom theme (Inter, JetBrains Mono, teal palette)
│   └── pages/
│       └── index.tsx           # Root redirect to platform overview
├── static/
│   └── img/
│       └── logo.svg            # Hexagonal gem logo
├── docusaurus.config.ts        # Site config, navbar, footer
└── sidebars.ts                 # Three-category sidebar structure
```

## Article metadata

Each article includes front matter structured for agent and search retrieval. The schema covers:

- `title` / `description` — human-readable identity and summary
- `product` / `version` — scopes content to GemStone/S 64 Bit 3.7.x
- `doc_type` — Diátaxis classification: `conceptual`, `task`, `reference`, or `tutorial`
- `content_category` — maps to the GemTalk doc set: `getting-started`, `installation`, `administration`, `programming`, `reference`, `security`
- `audience` — one or more of `evaluator`, `developer`, `administrator`
- `platform` — one or more of `linux`, `macos`, `windows-client`, `all`
- `keywords` — terms optimized for search and agent retrieval
- `source_docs` — array of authoritative GemTalk source documents with URLs, enabling accuracy traceability
- `last_verified` — date the article content was last checked against source material

---

## Deployment

This site deploys automatically to GitHub Pages via a GitHub Actions workflow defined in [`.github/workflows/static.yml`](.github/workflows/static.yml). The workflow runs on every push to `main` and can also be triggered manually from the Actions tab.

### How the workflow is structured

The workflow uses a single `build-and-deploy` job that runs all steps in sequence on `ubuntu-latest`:

```yaml
jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: build
      - uses: actions/deploy-pages@v5
        id: deployment
```

The key design decision was consolidating build and deploy into a single job rather than splitting them. Splitting jobs requires passing the build artifact between runners, which adds complexity without benefit for a single-site deployment. Keeping everything in one job means the deploy step always has direct access to the artifact produced by the build step in the same runner environment.

### Adding validations to the workflow

The workflow is intentionally minimal to start. As the site grows, additional validation steps can be inserted between the build step and the Pages upload. Candidates include:

| Validation | Tool | Insert after |
|---|---|---|
| Broken link checking | `linkcheck` or `docusaurus-plugin-check-links` | `npm run build` |
| Markdown lint | `markdownlint-cli` | `npm ci` |
| Spelling check | `cspell` | `npm ci` |
| Accessibility audit | `pa11y-ci` | `npm run build` |

To add a step, insert it in `static.yml` before the `actions/upload-pages-artifact` step. For example, to add a broken link check:

```yaml
- name: Check for broken links
  run: npx linkcheck http://localhost:3000/gemstone-service-docs/ --skip-file .linkcheckignore
```

### Permissions

The workflow requires these GitHub token permissions to deploy to Pages:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Live URL: `https://taz-mon.github.io/gemstone-service-docs/`

---

## Author

**Tom "Taz" Aciukewicz** — Principal Technical Writer with many years of experience documenting complex enterprise software, cloud infrastructure, and developer platforms.

- Portfolio: [taz-mon.github.io/tazdocs-as-code](https://taz-mon.github.io/tazdocs-as-code/docs/my-docs/resume/)
- GitHub: [@taz-mon](https://github.com/taz-mon)
- LinkedIn: [linkedin.com/in/toma2z](https://linkedin.com/in/toma2z/)

---

*Documentation content is a writing sample. GemStone/S is a product of [GemTalk Systems](https://gemtalksystems.com).*
