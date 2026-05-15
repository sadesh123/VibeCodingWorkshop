# CLAUDE.md — CyberArk Vibe Coding Workshop

You are helping a workshop participant personalise their resume/bio site.
Read this file fully before making any changes.

---

## What this project is

A single-page personal bio site built with Vite (vanilla HTML/CSS/JS) and a
Cloudflare Worker backend that serves contact details at runtime.

The participant owns the content and visual style. Your job is to help them
make the site feel personal — not like a LinkedIn printout.

---

## Project structure

```
VibeCodingWorkshop/
├── CLAUDE.md              ← you are here
├── README.md              ← workshop context and deployment guide
├── frontend/
│   ├── index.html         ← all sections and content live here
│   ├── style.css          ← all styles; CSS variables at the top control the theme
│   ├── main.js            ← animations, theme toggle, terminal, contact fetch
│   ├── CYBR.png           ← CyberArk logo (used in experience + skills + certs)
│   ├── package.json
│   └── vite.config.js
└── worker/
    ├── index.js           ← Cloudflare Worker — serves contact details
    ├── wrangler.toml
    └── .env               ← CONTACT_EMAIL and CONTACT_PHONE (may be protected)
```

---

## What you must NOT change

- `worker/index.js` — the fetch logic and response shape (`{ email, phone }`)
- `worker/.env` variable names — `CONTACT_EMAIL` and `CONTACT_PHONE`
- `worker/wrangler.toml`
- `frontend/vite.config.js`
- The `IntersectionObserver` logic in `main.js` (`initReveal`, `initStagger`)
- The contact fetch logic in `main.js` (`loadContact`)
- The `dist/` folder if it exists

---

## Theme — how to restyle the whole site in one prompt

All colours are driven by three CSS variables at the very top of `style.css`:

```css
--accent:      #06b6d4;   /* main brand colour — change this one first */
--accent-dark: #0891b2;   /* slightly darker shade of the accent */
--accent-rgb:  6, 182, 212; /* RGB version of accent (used for rgba() shadows) */
```

Changing `--accent` cascades through every highlight, badge, border glow,
skill tile hover, stat number, terminal button, and `/now` card pulse.

When a participant asks to change the colour scheme, update all three variables
together. Example: for purple, use `#8b5cf6`, `#7c3aed`, and `139, 92, 246`.

Dark mode is toggled by `data-theme="dark"` on `<html>`. The default is light.
To make dark mode the default, add `initTheme()` logic or set the attribute in HTML.

---

## Sections and what can be changed in each

### Hero (`index.html` — `.hero` block)
| Element | How to change |
|---|---|
| Large initials in avatar circle | Edit the text inside `.hero-avatar` (e.g. `YN` → `JS`) |
| Name | Edit `<h1 class="hero-name">` |
| Job title line | Edit `<p class="hero-title">` |
| Tagline sentence | Edit `<p class="hero-tagline">` |
| Badge pills | Edit or add `<span class="hero-badge">` items |
| Eyebrow label | Edit `<p class="hero-eyebrow">` |

### /now card (inside the hero)
The small "what I'm up to" card with the pulsing green dot.
Each row is a `<li class="now-item">` with a `.now-key` label and `.now-val` value.
Update the four values: **Reading, Learning, Building, Based in**.
Update `.now-date` to reflect when it was last updated.

### About (`#about`)
| Element | How to change |
|---|---|
| Bio paragraphs | Edit the two `<p>` tags inside `.about-text` |
| Stat numbers | Edit `data-target` attribute AND the visible text (e.g. `data-target="8"`) |
| Stat labels | Edit `.stat-label` text |

### Experience (`#experience`)
Each job is a `.job-card`. Inside each card:
- `.job-company-bar` — logo, company name, location, date range
- `.job-title` — role title
- `.job-bullets li` — achievement bullet points

To add a new job, copy an entire `.job-card` block and update its content.
To use a company logo, put the image file in `frontend/` and reference it as `./filename.ext`.
The `CYBR.png` pattern (local file, `onerror` fallback) is the right approach.

### Skills (`#skills`)
Three categories: Identity & Security, Cloud & Infrastructure, Languages & Tools.
Each skill is a `.skill-tile` with:
- `.skill-logo-wrap` containing an `<img>` with a `src` URL and a fallback `<span>`
- `.skill-name` label

**Logo sources (reliable):**
- Tech tools (AWS, Azure, Python, Docker, K8s, etc.):
  `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{name}/{name}-original.svg`
- Brand logos (CyberArk, Okta, Splunk, etc.):
  `https://cdn.simpleicons.org/{slug}/{hex-colour}`
- Local files: place in `frontend/` and use `./filename.ext`

Always include `onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"`
on skill logo images so the text fallback shows if the CDN is unreachable.

To add a skill, copy a `.skill-tile` block. To remove one, delete the block.
To add a new category, copy a `.skills-category` block.

### Education (`#education`)
Single `.edu-card`. Edit degree, university name, year range, and grade/honours.

### Certifications (`#certifications`)
Each cert is a `.cert-card` with an icon, name, and issuer+year.
Add or remove `.cert-card` blocks as needed. Use the same logo CDN approach as skills.

### Projects & Interests (`#personal`) — tabbed section
**Projects tab:** Each `.project-card` has a title, status badge, description, and tech tags.
- Status options: `project-status--active` (green) or `project-status--complete` (teal)
- Update the `href="#"` on `.project-link` to a real GitHub/URL when available
- Tags are `<span class="project-tag">` inside `.project-tags`

**Interests tab:** Each `.interest-card` has an SVG icon, a name, and a short descriptor.
Icons are inline SVGs — swap the path data for any icon from heroicons.com.

### Terminal easter egg (`main.js` — `initTerminal()`)
The terminal responds to typed commands. To personalise the responses, edit the
`COMMANDS` object in `initTerminal()` inside `main.js`:
- `whoami` — name, role, company, location
- `cat about` — personal story in casual tone
- `cat skills` — grouped skill list
- `cat contact` — GitHub, LinkedIn, email note
- `cat now` — mirrors the /now card content

### Footer
Edit the `<p class="footer-text">` content. Keep it short — one line.

---

## How contact details work (important)

The email and phone in the hero are **not hardcoded**. They are fetched at
runtime from the Cloudflare Worker at `/api/contact`.

- In local dev: the Worker runs at `http://localhost:8787` and Vite proxies `/api` to it
- In production: the Worker is deployed separately and the frontend calls it live

To change the contact details, edit `worker/.env`:
```
CONTACT_EMAIL=yourname@gmail.com
CONTACT_PHONE=+65 9000 0000
```

If the Worker is not running locally, the frontend falls back to placeholder values —
the site still works, just with dummy contact info.

---

## Suggested prompts for workshop participants

### Content — make it yours

```
Replace all placeholder content with my details:
Name: [your name]
Initials: [XX]
Title: [your job title]
Tagline: [one sentence about what you do]
Eyebrow label: [your profession]
Badges: [badge 1], [badge 2], [badge 3]
```

```
Update the About section with this bio: [paste your bio]
Set the stats to: [X]+ years in security, [Y]+ deployments, [Z] certifications
```

```
Replace the experience section with my job history:
Job 1: [Company], [Title], [Location], [Date range]
- [bullet 1]
- [bullet 2]
Job 2: [Company], [Title], [Location], [Date range]
- [bullet 1]
```

```
Update the /now card with what I'm currently doing:
Reading: [book title and author]
Learning: [topic]
Building: [project]
Based in: [city] · [availability note]
Last updated: [month year]
```

```
Replace the projects with my actual projects:
Project 1: [name], [status: active or complete], [description], [tags]
Project 2: [name], [status], [description], [tags]
```

```
Update the interests section with my actual hobbies:
[hobby 1] — [short descriptor]
[hobby 2] — [short descriptor]
[hobby 3] — [short descriptor]
```

```
Update the terminal responses to reflect my real details —
whoami, cat about, cat skills, and cat contact.
```

```
Update the certifications to match mine:
[Cert name] — [Issuer] — [Year]
[Cert name] — [Issuer] — [Year]
```

---

### Appearance — make it look different

```
Change the accent colour to [colour name or hex].
Update all three accent variables: --accent, --accent-dark, and --accent-rgb.
```

```
Make dark mode the default instead of light mode.
```

```
Change the font to [font name]. Update the Google Fonts import link
and the font-family values in style.css.
```

```
Make the hero section shorter — I don't need it to be full screen height.
Change min-height: 100vh to min-height: 70vh on .hero.
```

```
Add a [colour] gradient to the hero instead of the solid dark navy.
```

```
Make the skill tiles larger with bigger logos.
Increase the minmax value in .skills-grid and the logo size in .skill-logo.
```

```
Make the animations faster / slower.
Change the transition duration values in :root (--duration) and
the reveal transition values in .reveal and .stagger.
```

```
Remove the floating particle effect from the hero.
Delete the initParticles() call and the .hero-particles CSS block.
```

---

### Adding sections

```
Add a [Languages / Publications / Volunteering / Awards] section
after [existing section name]. Use the same card style as the other sections.
```

```
Add a "Tech Stack" section as a horizontal scrolling logo strip
between the hero and about sections.
```

```
Add a "Speaking" or "Writing" section with cards linking to my talks or blog posts.
Each card should show the title, event/publication name, date, and a link.
```

---

### Deployment

```
I'm ready to deploy. Walk me through deploying the Worker first
and then the frontend to Cloudflare Pages using Wrangler.
```

```
Help me set a custom domain for my Cloudflare Pages deployment.
```

---

## Tone guidance for content

Write content in first person, achievement-focused, and human — not corporate.
Bullet points should say what the outcome was, not just what the task was.

Good: "Reduced privileged credential exposure by 94% across 12 enterprise clients."
Avoid: "Responsible for managing privileged access deployments."

The /now card and terminal responses should be casual and personal —
this is where personality shows, not polished prose.
