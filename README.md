# CyberArk Vibe Coding Workshop
## AI Coding Agents: Build Fast, Secured by CyberArk

Internal facilitator guide for technical teams running this workshop.

---

## About the Workshop

A hands-on session where participants use Claude Code — an AI coding agent — to build and personalise a real, deployable personal resume website from a boilerplate. The site is live by the end of the session.

The technical hook: the site has a Cloudflare Worker backend that serves contact details at runtime. That single architectural decision is what powers the three-part security narrative — the same app, increasingly secured, without touching the frontend at all.

**Target audience:**  technical staff, pre-sales engineers, solutions architects.

**Format:** Hands-on lab, ~2–3 hours. Participants work individually on their own VMs.

---

## Workshop objectives

By the end of the session, participants will have:

1. Built and deployed a personalised resume site using an AI coding agent (Claude Code)
2. Experienced how AI agents interact with secrets on the developer machine
3. Seen concretely why EPM and Secrets Hub matter in an agentic AI world — not as theory, but as a lived constraint during the exercise

The secondary goal is internal enablement: participants leave with a working mental model of how to position CyberArk products in the context of AI-assisted development, which is increasingly a customer conversation.

---

## The three-part narrative

The workshop follows a single application through three security states. The frontend never changes. Only how the Worker gets its secrets changes.

### Part 1 — Baseline: .env on disk

```
Browser → Cloudflare Worker → reads worker/.env → returns { email, phone } → renders on page
```

Claude Code has full access to the developer machine. Participants ask it to personalise their resume — content, colours, layout. It works beautifully and fast.

The implicit lesson: Claude Code can also read `worker/.env`. The AI agent has the same filesystem access as the developer. That is the problem being set up.

**What participants do:** Personalise all content via Claude Code prompts. Deploy to Cloudflare Pages.

---

### Part 2 — EPM blocks the agent

```
Claude Code tries to read worker/.env → EPM denies access → cannot see the secret
```
The Worker still reads `.env` at runtime, so the site keeps working. Only the AI agent on the developer machine is blocked from seeing the secret.

**What participants observe:** The boundary EPM draws between what the AI can do versus what the running application can do.

---

### Part 3 — Secrets Hub: .env is gone

```
Browser → Cloudflare Worker → AWS Secrets Manager (via Secrets Hub) → returns { email, phone } → renders on page
```

The `.env` file is deleted entirely. The Worker fetches the secret from AWS Secrets Manager on every request. Nothing sensitive ever touches the developer machine — there is nothing for an agent (or a human) to read.

**The demo moment:** Show that `worker/.env` no longer exists. The site still works. The AI agent cannot leak what does not exist on the machine.

This closes the loop: Secrets Hub is not just vault storage, it is what makes the agentic threat model irrelevant for this class of secret.

**What participants observe:** The architectural shift from "protect the file" to "remove the file from the equation."

---


## Repository structure

```
VibeCodingWorkshop/
├── README.md               ← this file
├── CLAUDE.md               ← Claude Code instructions (loaded automatically by the agent)
├── frontend/
│   ├── index.html          ← all sections and content
│   ├── style.css           ← all styles; CSS variables at the top drive the theme
│   ├── main.js             ← animations, theme toggle, terminal easter egg, contact fetch
│   ├── CYBR.png            ← CyberArk logo (used in experience, skills, certs sections)
│   ├── package.json        ← Vite only, no other dependencies
│   └── vite.config.js      ← proxies /api to localhost:8787 in dev
└── worker/
    ├── index.js            ← Cloudflare Worker; reads env bindings, returns { email, phone }
    ├── wrangler.toml       ← Worker config
    ├── package.json
    └── .env                ← CONTACT_EMAIL and CONTACT_PHONE (Part 1 & 2 only)
```

**What is not in the repo (gitignored):**
- `frontend/node_modules/` and `frontend/dist/` — generated locally
- `worker/.env` — participants create their own
- `worker/.wrangler/` — build cache
- `.claude/` — facilitator's personal Claude Code settings

---

## Prerequisites

### For facilitators setting up the workshop

- Node.js 18+ and npm
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare account (free tier works)
- AWS account with Secrets Manager access (Part 3 only)
- CyberArk Secrets Hub configured and connected to the AWS account (Part 3 only)
- Claude Code installed: `npm install -g @anthropic-ai/claude-code`
- Claude Code authenticated with an Anthropic API key or Claude.ai subscription

### For participants

- Node.js 18+ and npm installed
- Claude Code installed and authenticated
- Cloudflare account (they create one during the session if needed)
- No prior JavaScript or web dev experience required — Claude Code handles the code

---

## Running the boilerplate locally

Participants download or clone the repo, then:

```bash
# Terminal 1 — start the Worker (serves contact details)
cd worker
npm install
wrangler dev
# Worker runs at http://localhost:8787

# Terminal 2 — start the frontend
cd frontend
npm install
npm run dev
# Site runs at http://localhost:5173
```

The frontend proxies `/api` to the local Worker via `vite.config.js`. If the Worker is not running, the site falls back to placeholder contact info — the site still loads, just with dummy values. Participants can personalise all content without running the Worker at all.

---

## Deploying

### Deploy the Worker first

```bash
cd worker
wrangler deploy
```

This makes the Worker live at `https://<worker-name>.<subdomain>.workers.dev`.

### Deploy the frontend

```bash
cd frontend
npm run build
wrangler pages deploy dist
```

First deploy will prompt for a project name. Participants should use their own name, e.g. `jane-resume`. The site goes live at `https://jane-resume.pages.dev`.

---

## What CLAUDE.md does

`CLAUDE.md` is automatically read by Claude Code when it opens the project. It gives the agent:

- The project structure and what each file does
- Which files it must not modify (Worker logic, Vite config, animation code)
- How to restyle the site by changing three CSS variables
- How each section of the page is structured and what can be changed
- Suggested prompts for common personalisation tasks
- Tone guidance for writing bio and bullet point content

This means participants can start prompting immediately without explaining the codebase to the agent. The facilitator does not need to walk through the code structure — Claude Code already knows it.

---

## Suggested workshop flow

| Time | Activity |
|---|---|
| 0:00 | Intro: the agentic AI development shift, what we're building |
| 0:15 | Participants clone the repo, run `npm run dev`, confirm the site loads |
| 0:20 | Part 1: personalise the site with Claude Code prompts |
| 1:00 | Deploy to Cloudflare Pages — participants have a live URL |
| 1:15 | Part 2 demo: EPM blocks Claude Code from reading `.env` |
| 1:30 | Discussion: what else could an agent read on your dev machine? |
| 1:45 | Part 3 demo: delete `.env`, move secret to AWS Secrets Manager via Secrets Hub |
| 2:00 | Discussion: positioning for customer conversations |
| 2:15 | Buffer / Q&A |

---

## Files participants should not edit

Claude Code is instructed (via CLAUDE.md) not to touch these. If something breaks, check these first:

- `worker/index.js` — the fetch handler and response shape `{ email, phone }`
- `worker/wrangler.toml` — Worker configuration
- `worker/.env` variable names — `CONTACT_EMAIL` and `CONTACT_PHONE`
- `frontend/vite.config.js` — the `/api` proxy
- The `IntersectionObserver` logic in `main.js` — `initReveal` and `initStagger`
- The contact fetch logic in `main.js` — `loadContact`

---

## Common issues

**Site loads but contact details show "loading…" forever**
The Worker is not running. Either start `wrangler dev` in the worker directory, or ignore it — the site works without contact details for the personalisation exercise.

**`wrangler dev` fails with auth error**
Run `wrangler login` first. Participants need a Cloudflare account.

**Claude Code cannot find the project**
Open the `VibeCodingWorkshop/` folder directly in Claude Code (`claude` from that directory, or open the folder in the desktop app). CLAUDE.md is loaded from the project root.

**Participant accidentally broke the Worker or animations**
Git reset is the fastest fix if the repo is initialised. Otherwise, the original files are in the boilerplate zip — replace `worker/index.js`, `main.js`, or `vite.config.js` from there.

---


Internal queries about this workshop: reach out to the session facilitator or the team that owns the CyberArk technical enablement programme.
