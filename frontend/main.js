/* ============================================================
   main.js — contact fetch + scroll animations + theme toggle
   DO NOT modify the fetch logic or Intersection Observer setup.
   ============================================================ */

// ── Contact details ──────────────────────────────────────────
const WORKER_URL = '/api/contact'

async function loadContact() {
  const loading = document.getElementById('contact-loading')
  const details = document.getElementById('contact-details')
  const emailEl = document.getElementById('email-text')
  const phoneEl = document.getElementById('phone-text')
  const emailLink = document.getElementById('contact-email')
  const phoneLink = document.getElementById('contact-phone')

  try {
    const res = await fetch(WORKER_URL)
    if (!res.ok) throw new Error(`Worker responded ${res.status}`)
    const { email, phone } = await res.json()

    emailEl.textContent = email
    phoneEl.textContent = phone
    emailLink.href = `mailto:${email}`
    phoneLink.href = `tel:${phone.replace(/\s+/g, '')}`
  } catch {
    emailEl.textContent = 'contact@example.com'
    phoneEl.textContent = '+65 9000 0000'
    emailLink.href = 'mailto:contact@example.com'
  } finally {
    loading.style.display = 'none'
    details.classList.remove('hidden')
  }
}

// ── Dark / light theme toggle ─────────────────────────────────
function initTheme() {
  const btn = document.getElementById('theme-toggle')
  const root = document.documentElement

  // Restore saved preference
  const saved = localStorage.getItem('resume-theme')
  if (saved === 'dark') root.setAttribute('data-theme', 'dark')

  btn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark'
    if (isDark) {
      root.removeAttribute('data-theme')
      localStorage.setItem('resume-theme', 'light')
    } else {
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('resume-theme', 'dark')
    }
  })
}

// ── Floating particles in hero ────────────────────────────────
function initParticles() {
  const container = document.getElementById('hero-particles')
  if (!container) return

  const COUNT = 22
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('span')
    p.className = 'particle'
    const size = 2 + Math.random() * 3
    p.style.setProperty('--x',    `${Math.random() * 100}%`)
    p.style.setProperty('--size', `${size}px`)
    p.style.setProperty('--dur',  `${7 + Math.random() * 8}s`)
    p.style.setProperty('--delay',`${Math.random() * 10}s`)
    container.appendChild(p)
  }
}

// ── Scroll-reveal via Intersection Observer ──────────────────
function initReveal() {
  const revealEls = document.querySelectorAll('.reveal')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )

  revealEls.forEach((el) => observer.observe(el))
}

// ── Stagger animations inside skill/cert grids ────────────────
function initStagger() {
  const groups = document.querySelectorAll('.skills-grid, .certs-grid')

  groups.forEach((group) => {
    const items = group.querySelectorAll('.stagger')

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          items.forEach((item, i) => {
            item.style.setProperty('--stagger-delay', `${i * 60}ms`)
            item.classList.add('visible')
          })
          observer.unobserve(group)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    )

    observer.observe(group)
  })
}

// ── Counter roll-up animation for stat numbers ────────────────
function animateCounter(el, target, suffix, duration = 1400) {
  const start = performance.now()

  function tick(now) {
    const elapsed  = now - start
    const progress = Math.min(elapsed / duration, 1)
    // Cubic ease-out
    const eased    = 1 - Math.pow(1 - progress, 3)
    el.textContent = Math.round(eased * target) + suffix
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el     = entry.target
          const target = parseInt(el.dataset.target, 10)
          const suffix = el.dataset.suffix ?? ''
          animateCounter(el, target, suffix)
          observer.unobserve(el)
        }
      })
    },
    { threshold: 0.6 }
  )

  counters.forEach((el) => observer.observe(el))
}

// ── Terminal easter egg ───────────────────────────────────────
function initTerminal() {
  const overlay  = document.getElementById('terminal-overlay')
  const input    = document.getElementById('terminal-input')
  const output   = document.getElementById('terminal-output')
  const closeBtn = document.getElementById('terminal-close')

  let cmdHistory = []
  let historyIdx = -1

  // ── Commands ──
  const COMMANDS = {
    help: () => [
      { cls: 't-hl',    text: 'Available commands:' },
      { cls: 't-line',  text: '  whoami        — who is this person' },
      { cls: 't-line',  text: '  ls            — what\'s on this site' },
      { cls: 't-line',  text: '  cat about     — the full story' },
      { cls: 't-line',  text: '  cat skills    — technical stack' },
      { cls: 't-line',  text: '  cat contact   — how to reach me' },
      { cls: 't-line',  text: '  cat now        — what I\'m up to' },
      { cls: 't-line',  text: '  sudo           — nice try' },
      { cls: 't-line',  text: '  clear          — clear terminal' },
      { cls: 't-line',  text: '  exit           — close terminal' },
    ],

    whoami: () => [
      { cls: 't-green', text: 'Your Name' },
      { cls: 't-line',  text: 'Senior Security Engineer @ CyberArk' },
      { cls: 't-line',  text: 'Identity security · PAM · Zero trust · Cloud' },
      { cls: 't-dim',   text: 'Based in Singapore · UTC+8' },
    ],

    ls: () => [
      { cls: 't-line',  text: 'drwxr-xr-x  about/' },
      { cls: 't-line',  text: 'drwxr-xr-x  experience/' },
      { cls: 't-line',  text: 'drwxr-xr-x  skills/' },
      { cls: 't-line',  text: 'drwxr-xr-x  projects/' },
      { cls: 't-line',  text: 'drwxr-xr-x  certifications/' },
      { cls: 't-line',  text: '-rw-r--r--  about.txt' },
      { cls: 't-line',  text: '-rw-r--r--  contact.txt' },
      { cls: 't-line',  text: '-rw-r--r--  now.txt' },
    ],

    'cat about': () => [
      { cls: 't-hl',    text: '# about.txt' },
      { cls: 't-blank', text: '' },
      { cls: 't-line',  text: 'I\'ve spent 8+ years convincing organisations that' },
      { cls: 't-line',  text: '"change my password every 90 days" is not a security' },
      { cls: 't-line',  text: 'strategy. Privileged access, identity threats, and the' },
      { cls: 't-line',  text: 'gap between compliance and actual security — that\'s my' },
      { cls: 't-line',  text: 'world.' },
      { cls: 't-blank', text: '' },
      { cls: 't-line',  text: 'Outside work: CTF player, homelab operator, and someone' },
      { cls: 't-line',  text: 'who has definitely broken prod at least twice (in testing).' },
    ],

    'cat skills': () => [
      { cls: 't-hl',    text: '# skills.txt' },
      { cls: 't-blank', text: '' },
      { cls: 't-yellow',text: '[Identity & PAM]' },
      { cls: 't-line',  text: '  CyberArk · Conjur · Okta · Azure AD / Entra' },
      { cls: 't-yellow',text: '[Cloud]' },
      { cls: 't-line',  text: '  AWS · Azure · Terraform · Kubernetes · Docker' },
      { cls: 't-yellow',text: '[Languages]' },
      { cls: 't-line',  text: '  Python · PowerShell · Bash' },
      { cls: 't-yellow',text: '[SIEM / IR]' },
      { cls: 't-line',  text: '  Splunk · Microsoft Sentinel · Defender XDR' },
    ],

    'cat contact': () => [
      { cls: 't-hl',    text: '# contact.txt' },
      { cls: 't-blank', text: '' },
      { cls: 't-line',  text: 'Email   → see the hero section (fetched from Worker)' },
      { cls: 't-line',  text: 'GitHub  → github.com/yourhandle' },
      { cls: 't-line',  text: 'LinkedIn → linkedin.com/in/yourhandle' },
      { cls: 't-blank', text: '' },
      { cls: 't-dim',   text: 'Best way to reach me: email. I reply within 24h.' },
    ],

    'cat now': () => [
      { cls: 't-hl',    text: '# now.txt  (updated Apr 2026)' },
      { cls: 't-blank', text: '' },
      { cls: 't-green', text: '● Status: available for conference talks & advisory' },
      { cls: 't-blank', text: '' },
      { cls: 't-line',  text: 'Reading  → The Unicorn Project — Gene Kim' },
      { cls: 't-line',  text: 'Learning → Entra ID workload identities' },
      { cls: 't-line',  text: 'Building → HomeLab PAM v2 on Proxmox' },
    ],

    sudo: () => [
      { cls: 't-line',  text: '[sudo] password for visitor:' },
      { cls: 't-red',   text: 'Sorry, visitor is not in the sudoers file.' },
      { cls: 't-dim',   text: 'This incident will be reported. (Just kidding.)' },
    ],

    ping: () => [
      { cls: 't-line',  text: 'PING yourname.dev (1.3.3.7): 56 bytes' },
      { cls: 't-green', text: '64 bytes: icmp_seq=0 ttl=64 time=0.42ms' },
      { cls: 't-green', text: '64 bytes: icmp_seq=1 ttl=64 time=0.38ms' },
      { cls: 't-dim',   text: '^C  (they\'re online)' },
    ],

    history: () => cmdHistory.length
      ? cmdHistory.map((c, i) => ({ cls: 't-dim', text: `  ${String(i + 1).padStart(3)}  ${c}` }))
      : [{ cls: 't-dim', text: 'No commands yet.' }],
  }

  // ── Render output ──
  function print(lines) {
    lines.forEach(({ cls, text }) => {
      if (cls === 't-blank') {
        const el = document.createElement('div')
        el.className = 't-blank'
        output.appendChild(el)
      } else {
        const el = document.createElement('div')
        el.className = `t-line ${cls}`
        el.textContent = text
        output.appendChild(el)
      }
    })
    // scroll to bottom
    output.parentElement.scrollTop = output.parentElement.scrollHeight
  }

  function printCmd(cmd) {
    const el = document.createElement('div')
    el.className = 't-line'
    el.innerHTML = `<span class="t-green">visitor@yourname:~$</span> <span class="t-cmd">${cmd}</span>`
    output.appendChild(el)
  }

  // ── Run a command ──
  function run(raw) {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return

    cmdHistory.push(raw.trim())
    historyIdx = cmdHistory.length
    printCmd(raw.trim())

    if (cmd === 'clear') {
      output.innerHTML = ''
      return
    }
    if (cmd === 'exit' || cmd === 'quit') {
      closeTerminal()
      return
    }

    const handler = COMMANDS[cmd]
    if (handler) {
      print(handler())
    } else {
      print([
        { cls: 't-red',  text: `command not found: ${cmd}` },
        { cls: 't-dim',  text: 'Type help to see available commands.' },
      ])
    }

    // blank line between commands
    const spacer = document.createElement('div')
    spacer.className = 't-blank'
    output.appendChild(spacer)
    output.parentElement.scrollTop = output.parentElement.scrollHeight
  }

  // ── Open / close ──
  function openTerminal() {
    overlay.classList.add('open')
    overlay.setAttribute('aria-hidden', 'false')
    setTimeout(() => input.focus(), 50)
  }
  function closeTerminal() {
    overlay.classList.remove('open')
    overlay.setAttribute('aria-hidden', 'true')
  }

  // ── Event listeners ──
  // Ctrl + ` to open
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '`') { e.preventDefault(); openTerminal() }
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeTerminal()
  })

  // FAB button opens terminal
  const fab = document.getElementById('terminal-fab')
  if (fab) fab.addEventListener('click', openTerminal)

  // Click red dot or outside window to close
  closeBtn.addEventListener('click', closeTerminal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeTerminal()
  })

  // Submit on Enter, history on up/down
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      run(input.value)
      input.value = ''
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIdx > 0) { historyIdx--; input.value = cmdHistory[historyIdx] }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx < cmdHistory.length - 1) { historyIdx++; input.value = cmdHistory[historyIdx] }
      else { historyIdx = cmdHistory.length; input.value = '' }
    }
  })
}

// ── Tab switching (Projects / Interests) ──────────────────────
function initTabs() {
  const btns   = document.querySelectorAll('.tab-btn')
  const panels = document.querySelectorAll('.tab-panel')

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab

      btns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false') })
      panels.forEach((p) => p.classList.remove('active'))

      btn.classList.add('active')
      btn.setAttribute('aria-selected', 'true')
      document.getElementById(`tab-${target}`).classList.add('active')
    })
  })
}

// ── Boot ──────────────────────────────────────────────────────
initTheme()
initParticles()
loadContact()
initReveal()
initStagger()
initCounters()
initTabs()
initTerminal()
