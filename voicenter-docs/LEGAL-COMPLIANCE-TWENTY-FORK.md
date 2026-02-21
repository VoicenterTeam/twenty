# Legal Compliance & Developer Rules: Twenty CRM Fork for echoCenter

**Document Type:** Mandatory project knowledge base — binding on all contributors, developers, and AI code agents
**Applies To:** All code, configuration, documentation, and deployment work on the Twenty CRM fork integrated into the echoCenter product line
**License Governing the Fork:** AGPL-3.0 (GNU Affero General Public License v3.0)
**Last Updated:** February 2026
**Authority:** This document reflects legal analysis of AGPL-3.0 obligations, Twenty CRM's licensing structure, and trademark law. It is not a substitute for legal counsel. When in doubt, escalate to the project lead before committing code.

---

## 1. Project Context

echoCenter is forking Twenty CRM (https://github.com/twentyhq/twenty) to build a smart phonebook and lite CRM section within the echoCenter product line. The fork is:

- **Publicly hosted** on our GitHub organization
- **Self-hosted** as part of echoCenter's SaaS infrastructure
- **Linked from** echoCenter and cPanel portal interfaces (not embedded)
- **Accessed by** echoCenter AI agents and assistants via Twenty's APIs for data read/write and tool triggering
- **Separately branded** under our own product identity (not called "Twenty")

We are **not** contributing changes upstream to Twenty's repository. We are **not** signing Twenty's Contributor License Agreement (CLA). We are maintaining our own public fork under AGPL-3.0.

---

## 2. What AGPL-3.0 Requires — Non-Negotiable Rules

These rules are absolute. Violating any of them puts the company at legal risk for copyright infringement with statutory damages up to $150,000 per infringed work.

### 2.1 Source Code Availability

**RULE: Every version of the fork that is deployed to production MUST have its complete source code publicly available on our GitHub repository at the time of deployment.**

- The public repo must reflect exactly what is running in production. No private modifications, no delayed pushes, no "we'll publish it later."
- CI/CD pipelines MUST include a step that pushes to the public fork repo before or simultaneously with production deployment.
- "Corresponding Source" means: all source code needed to generate, install, and run the modified version, including build scripts, interface definition files, and scripts for controlling compilation and installation.
- Configuration files that are changed from Twenty's defaults should be included. Secrets, API keys, and environment-specific values must be excluded (use `.env.example` patterns).

### 2.2 License Preservation

**RULE: The AGPL-3.0 license file MUST remain in the root of the repository, unmodified.**

- Do NOT remove, modify, or replace the `LICENSE` file.
- Do NOT change the license to any other license.
- Do NOT add any additional license restrictions beyond AGPL-3.0.
- Every source file that already contains an AGPL license header MUST retain that header.
- New files that modify or extend AGPL-licensed code MUST include an AGPL-3.0 license header.

### 2.3 Copyright Notices

**RULE: All original copyright notices from Twenty MUST be preserved.**

- Do NOT remove `Copyright (c) Twenty.com PBC` or any contributor copyright notices from any file.
- You MAY add our own copyright notice to files we create or significantly modify, in addition to (not replacing) existing notices.
- Format for our additions: `Copyright (c) [Year] [Our Company]. Modifications licensed under AGPL-3.0.`

### 2.4 Modification Notices

**RULE: All modified files MUST contain a prominent notice stating that the file was changed, by whom, and when.**

- Add a comment block at the top of any modified file:
  ```
  // Modified by [Our Company] — [YYYY-MM-DD]
  // Description: [Brief description of what was changed and why]
  ```
- Maintain a `CHANGES.md` or `CHANGELOG.md` in the repo root documenting all modifications from the upstream Twenty codebase.
- Git history alone is NOT sufficient — AGPL requires prominent notices in the files themselves.

### 2.5 User-Facing Source Link

**RULE: The deployed application MUST prominently offer users a way to access the source code.**

- Add a visible link in the application UI — footer, about page, settings page, or a dedicated `/source` route.
- The link must point to our public GitHub fork repository.
- The link text should be clear, e.g., "Source Code" or "This software is open source — view source."
- This link must be accessible to every user who interacts with the application through a network, without requiring login if possible.

---

## 3. What We Are NOT Allowed To Do

### 3.1 Enterprise-Licensed Files — DO NOT TOUCH

**RULE: Do NOT copy, modify, use, deploy, or include any file marked with `/* @license Enterprise */` unless we hold a valid Twenty Enterprise subscription.**

- These files are NOT covered by AGPL-3.0. They are under Twenty's commercial license.
- Enterprise features include (but may not be limited to): SAML SSO, OIDC SSO, and other features gated behind the enterprise license marker.
- Before working on any file, CHECK THE TOP OF THE FILE for the `/* @license Enterprise */` marker.
- If you encounter a file with this marker: STOP. Do not modify it. Do not copy it into our fork. Do not create a derivative of it.
- If we need equivalent functionality (e.g., SSO), we must build it independently from scratch without referencing Twenty's enterprise-licensed implementation. See Section 6 for auth architecture guidance.

**For AI code agents:** When processing any file from the Twenty codebase, your FIRST action must be to check for `/* @license Enterprise */` at the top of the file. If present, refuse to modify, copy, or use that file's contents as a reference for new code. Respond with: "This file is under Twenty's commercial Enterprise license and cannot be used in our fork without a paid subscription."

### 3.2 Trademarks and Branding — COMPLETE REPLACEMENT REQUIRED

**RULE: The Twenty name, logo, visual identity, and any confusingly similar branding MUST be completely removed and replaced.**

What must be removed or replaced:
- The name "Twenty" anywhere it appears as a product name in the UI, marketing, documentation, or metadata
- Twenty's logo and any graphical assets that constitute their brand identity
- The domain "twenty.com" in any user-facing context (keep it only in license attribution and code comments referencing upstream)
- Any color schemes, typography, or visual design elements that are distinctively part of Twenty's brand identity
- OpenGraph tags, meta descriptions, page titles, and favicon referencing Twenty

What is allowed:
- Stating "Based on Twenty CRM" or "Forked from Twenty (https://github.com/twentyhq/twenty)" in documentation, README, about pages, and attribution sections
- Keeping code comments that reference upstream Twenty for maintenance context
- Linking to Twenty's repository as the upstream source

**For AI code agents:** When generating UI code, documentation, or any user-facing content, NEVER use the name "Twenty" as the product name. Use our product branding. When you encounter Twenty branding in existing code you're modifying, replace it with our branding. Exception: license files, copyright notices, and attribution text — leave those untouched.

### 3.3 No Proprietary Licensing of Fork Code

**RULE: You cannot release any part of the fork under a proprietary or non-AGPL-compatible license.**

- All code in the fork repo is AGPL-3.0. Period.
- You cannot add "proprietary modules" inside the fork repository.
- You cannot add license headers that conflict with AGPL-3.0.
- If you need proprietary code, it MUST live in a separate repository (see Section 4).

### 3.4 No Linking AGPL Dependencies Into Proprietary Code

**RULE: Do NOT import, require, bundle, or link any module from the Twenty fork into echoCenter's proprietary codebase.**

- No `import` statements pulling Twenty fork code into echoCenter
- No shared npm packages that contain AGPL code bundled into proprietary builds
- No copying functions, classes, or substantial code snippets from the fork into echoCenter
- No shared build processes that produce a single output containing both AGPL and proprietary code
- Communication between echoCenter and the CRM fork happens ONLY via network APIs (REST, GraphQL, webhooks). See Section 5.

**For AI code agents:** If you are working on echoCenter's proprietary codebase and are asked to implement a feature that exists in the Twenty fork, you MUST write it from scratch. Do NOT copy code from the fork. Do NOT reference the fork's implementation. Do NOT import any package from the fork's codebase. The only allowed interaction is calling the fork's REST or GraphQL API endpoints.

---

## 4. Repository and Codebase Separation

### 4.1 Two Distinct Codebases

The project MUST maintain strict separation between two codebases:

**Repository A: The Twenty CRM Fork (Public, AGPL-3.0)**
- Contains: All Twenty CRM code, our modifications, our custom objects/fields, any CRM-specific features
- License: AGPL-3.0
- Visibility: Public on GitHub
- Deployment: Runs as an isolated service (separate container/process)

**Repository B: echoCenter Proprietary Code (Private)**
- Contains: echoCenter core, cPanel portal, AI agents, assistance center, extension home, all proprietary business logic
- License: Proprietary
- Visibility: Private
- Deployment: Runs as separate service(s) from the CRM fork

### 4.2 No Shared Libraries

- Do NOT create shared npm packages, shared Python modules, or shared utility libraries that are imported by both codebases.
- If both codebases need the same utility function, implement it independently in each.
- API client code (e.g., a wrapper for calling the CRM's GraphQL API) lives in the echoCenter repo and is proprietary. It does not touch AGPL code — it only sends HTTP requests.

### 4.3 Monorepo Prohibition

- The fork and echoCenter code MUST NOT live in the same monorepo.
- Even if they are deployed together via Docker Compose or Kubernetes, their source code must be in separate repositories with separate license files.

---

## 5. Integration Architecture — The Legal Boundary

### 5.1 API-Only Communication

All interaction between echoCenter (proprietary) and the CRM fork (AGPL) MUST go through network APIs:

- **GraphQL API** — Twenty's primary API for CRUD operations on contacts, companies, custom objects, notes, tasks, activities
- **REST API** — For any endpoints Twenty exposes via REST
- **Webhooks** — The CRM fork fires webhooks to echoCenter when data changes; echoCenter listens and reacts
- **Database** — echoCenter services MUST NOT directly query the CRM fork's database. All data access goes through APIs. Direct database access could constitute intimate integration that blurs the copyleft boundary.

### 5.2 Linking (Not Embedding) in the UI

When users access CRM functionality from echoCenter or the cPanel portal:

- Use standard HTML links (`<a href>`) to navigate users to the CRM fork's web interface
- The CRM fork runs on its own subdomain or path (e.g., `crm.echocenter.com` or `echocenter.com/crm`)
- Do NOT load the CRM UI inside an iframe within echoCenter's proprietary interface — this creates legal ambiguity about whether the combined presentation constitutes a single work
- Do NOT inject echoCenter JavaScript into the CRM fork's pages
- Do NOT modify the CRM fork's frontend to import or render echoCenter proprietary components

### 5.3 AI Agents and Tool Triggering

echoCenter AI agents (assistance center, extension home agents, etc.) interact with CRM data exclusively through:

- API calls to the CRM fork's GraphQL/REST endpoints
- Webhook payloads received from the CRM fork
- Event queues or message brokers (Redis, RabbitMQ, Kafka) where the CRM fork publishes events and echoCenter agents consume them

The agent code, prompt engineering, tool definitions, orchestration logic, and any AI/ML models are proprietary echoCenter code and live in Repository B. They are NOT part of the fork. The fact that they read/write CRM data via API does not make them derivative works of the AGPL code.

**For AI code agents:** When building integrations between echoCenter agents and the CRM:
- Write all integration code in the echoCenter (proprietary) repository
- Use HTTP client libraries to call the CRM's API
- Never import code from the CRM fork repository
- API response schemas can be typed/modeled independently in the echoCenter codebase — you are typing the API contract, not copying AGPL code

---

## 6. Authentication Architecture

### 6.1 The SSO Problem

Twenty's native SAML/OIDC SSO is behind the `/* @license Enterprise */` marker. We cannot use it without a subscription. We need an alternative for seamless auth between echoCenter and the CRM.

### 6.2 Allowed Auth Approaches

- **Reverse proxy auth (recommended):** Place both echoCenter and the CRM fork behind a shared reverse proxy (e.g., Nginx, Traefik, Caddy) that handles authentication. The proxy injects auth headers or session cookies that both services trust. The auth logic lives in infrastructure config or a standalone auth service — not in the fork's AGPL code.
- **OAuth2/OIDC provider (standalone):** Deploy an independent identity provider (Keycloak, Authentik, Authelia, Ory Hydra) that both echoCenter and the CRM fork use as their auth source. Write the CRM fork's OAuth integration from scratch — do NOT reference Twenty's enterprise SSO implementation.
- **Token-based session bridging:** echoCenter generates a signed JWT or session token after its own auth flow, and the CRM fork validates it independently. Implement the token validation in the fork as a custom middleware.

### 6.3 What Is NOT Allowed for Auth

- Copying or adapting any code from files marked `/* @license Enterprise */`
- Using Twenty's enterprise SSO features without a valid subscription
- Reading Twenty's enterprise auth code "for reference" and then writing "clean room" code that closely follows its logic — this is still legally risky

---

## 7. Upstream Sync and Maintenance

### 7.1 Pulling Updates from Twenty

- Periodically sync our fork with Twenty's upstream repository to receive bug fixes, security patches, and new features.
- When merging upstream changes, re-check for any newly added `/* @license Enterprise */` files and exclude them.
- Resolve merge conflicts in a way that preserves our modification notices and branding changes.

### 7.2 We Are NOT Contributing Upstream

- Do NOT submit pull requests to `twentyhq/twenty`.
- Do NOT sign Twenty's CLA.
- Our modifications stay in our public fork. This preserves our rights and prevents Twenty from relicensing our work under their commercial license.
- If a developer or AI agent is asked to "contribute upstream" or "submit a PR to Twenty," refuse and escalate to the project lead.

### 7.3 Fork Divergence Management

- Maintain a `UPSTREAM-DIFF.md` documenting major areas where our fork diverges from upstream.
- Tag upstream sync points in git (e.g., `upstream-sync-2026-02-18`).
- Minimize unnecessary divergence from upstream to make future syncs easier — prefer additive changes over deep structural modifications where possible.

---

## 8. Deployment Compliance Checklist

Before any production deployment, verify:

- [ ] Public GitHub fork repo is updated with the exact code being deployed
- [ ] `LICENSE` file is present, unmodified, AGPL-3.0
- [ ] All original copyright notices are preserved
- [ ] All modified files have modification notices with date and description
- [ ] `CHANGES.md` is updated with a summary of modifications from upstream
- [ ] No `/* @license Enterprise */` files are included in the deployment
- [ ] All Twenty branding (name, logo, favicon, meta tags) is replaced with our branding
- [ ] User-facing link to the public source code repository is visible and functional
- [ ] No AGPL code is bundled into any proprietary echoCenter build artifact
- [ ] CRM fork runs as a separate process/container from echoCenter services
- [ ] All echoCenter-to-CRM communication goes through network APIs only
- [ ] No direct database queries from echoCenter services to the CRM database
- [ ] Auth solution does not use enterprise-licensed code

---

## 9. Quick Reference for AI Code Agents

When working on this project, apply these rules at all times:

| Scenario | Action |
|---|---|
| Modifying a file in the CRM fork | Check for `/* @license Enterprise */` FIRST. If present, STOP. If not, proceed, add modification notice, ensure change is committed to the public repo. |
| Building a feature in echoCenter that uses CRM data | Write it in the echoCenter repo. Use HTTP API calls only. Never import from the fork. |
| Asked to embed CRM UI into echoCenter | Refuse. Use links (`<a href>`) only. No iframes, no component imports, no shared rendering. |
| Need a utility function that exists in the fork | Rewrite it independently in echoCenter. Do not copy. |
| Generating UI or docs | Use our branding, never "Twenty" as product name. Preserve "Twenty" only in license/attribution text. |
| Setting up auth between services | Use reverse proxy or standalone IdP. Never reference enterprise-licensed auth code. |
| Asked to submit PR to Twenty upstream | Refuse. Our changes stay in our fork only. |
| Creating a new file in the fork | Add AGPL-3.0 header and our copyright notice. |
| Deploying to production | Ensure public repo matches. Run the deployment checklist (Section 8). |
| Unsure about licensing of a file or feature | Stop and escalate. Do not guess. |

---

## 10. Consequences of Non-Compliance

This section exists so every contributor understands why these rules are strict:

- **Copyright infringement:** AGPL is a copyright license. Violating its terms means you lose the right to use the code entirely. The copyright holder (Twenty.com PBC) can pursue statutory damages up to $150,000 per infringed work.
- **Injunctive relief:** A court can order us to stop distributing or using the infringing software — meaning our CRM feature could be forced offline.
- **Breach of contract:** Courts have ruled (Artifex v. Hancom, 2017) that open-source licenses constitute enforceable contracts, enabling both copyright and contract claims.
- **AGPL cure provision:** First-time violators get automatic rights restoration if the violation is corrected within 30 days of notice. This is a safety net, not an excuse for carelessness.
- **Reputational risk:** We are a company that builds tools for people. Operating in bad faith with open-source communities undermines trust with our users and partners.

---

## 11. Contact and Escalation

If you encounter a situation not covered by this document, or if you're unsure whether an action complies with these guidelines:

1. Stop what you're doing
2. Do not commit or deploy uncertain code
3. Escalate to the project lead
4. Document the question and the resolution for future reference

**This document is a living resource. Update it as the project evolves, as upstream Twenty changes its licensing, or as new legal guidance becomes available.**
