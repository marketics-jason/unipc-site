# UNIPC — website

Static, low-bandwidth institutional website for **UNIPC**, an organization of
Indigenous nations and peoples. Plain HTML/CSS/JS — no build step, no framework.

## What this is
A multi-page site that routes four stakeholder audiences (Indigenous nations,
states/diplomats, organizations/funders, allies) into their own persuasive
paths, plus supporter/donor tracks, an emblem-meaning page, and a media/brand
room. The editorial spine is the **three-tense claims discipline** — every
statement is tagged **IS** (verifiable fact), **DOES** (function in operation),
or **SEEKS** (ambition, never implied as present fact). Never re-tense copy.

## Structure
```
index.html            Home
nations.html          Path — Indigenous nations & peoples
states.html           Path — states & diplomats
funders.html          Path — organizations & funders
allies.html           Path — allies & civil society
support.html          Support the founding
donate.html           Donate (DEMONSTRATION form — see below)
about.html            About & founding
what-we-do.html       What we do (the mandate)
recognition.html      The path to recognition (roadmap)
membership.html       Membership
newsroom.html         Newsroom / statements
contact.html          Contact & briefings
emblem.html           The emblem
media.html            Media & brand use
assets/unipc.css      Shared design system (Sky & Earth tokens)
assets/unipc.js       Progressive enhancement (fade, forms, donate)
```

## Conventions & constraints
- **Works without JavaScript.** Core content and forms render/submit with JS
  off; JS only enhances (scroll reveal, inline form-success, donate selector).
- **Low bandwidth is a hard requirement.** One cached stylesheet, no framework,
  fonts loaded non-blocking (`display=swap`) with system fallbacks.
- **No dark navy anywhere** — cultural directive. The dark register is wet slate
  `#43514F`.
- **No trackers, ever.** No analytics that fingerprint; contact lists are never
  shared or sold.
- **Claims discipline is binding.** All `{pending …}` placeholders are
  intentional and must stay until the real facts are confirmed.
- All form submissions and `mailto:` links route to **eosg@unipc.info**.

## The donate form is a demonstration
`donate.html` collects mock card details and processes **nothing**. Before any
real use, replace it with a PCI-compliant provider (e.g. Stripe Elements) — do
not collect raw card numbers yourself.

## Deploy (Netlify)
No build command. Publish directory: the repository root (`.`). `netlify.toml`
sets sensible security headers. Pages currently carry `noindex,nofollow` while
content is draft — remove that meta tag when ready to be indexed.

## Local preview
Any static server, e.g.:
```
python3 -m http.server 8000
```
then open http://localhost:8000/
