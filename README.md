# OneSite4U

A page builder for professionals. Every public page is assembled from **41 block types** — the same
parts whether you are a financial consultant, a wedding photographer, a yoga studio or an advocate.
Built with Next.js 14 (App Router), React 18, TypeScript and Tailwind CSS.

> **Demo build.** No backend, no login, no external APIs. Content and design live in `localStorage`;
> forms simulate a request and say so; the AI assistants run entirely in the browser.

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

| Route      | What it is                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `/`        | The directory — every published profile, so nobody lands on a stranger's page. |
| `/me`      | Your own page, the one the editor and dashboard write to. Mobile app view below 1024px, desktop web page above it. |
| `/<handle>` | A published profile: `/sheela`, `/revathi`, `/anitha`, `/aarav`, `/meera`, `/rohan`. Statically generated, pinned to that person, and what their QR code opens. |
| `/webview` | The canvas editor: block library, live page, properties panel.                                            |
| `/admin`   | The dashboard: content, enquiries, analytics and the live editor.                                         |

## The block system

`data/blocks.ts` registers every block type. A page is an ordered list of **block instances**, each
holding its own props, so nothing is tied to an industry.

| Group         | Blocks                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Basics** (6)    | Contact info · Link buttons · Social icons · Opening hours · Location map · Contact form                              |
| **About** (11)    | Text · Heading · Image + text · Quote · Experience · Education · Skills · Awards · Certifications · Team · Numbers    |
| **Offerings** (7) | Services · Pricing table · Products · Menu / price list · Downloads · Schedule · Progress tracker                     |
| **Trust** (2)     | Reviews · Logo wall                                                                                                  |
| **Media** (4)     | Photo gallery · Video · Link preview · Announcements                                                                 |
| **Engage** (10)   | AI assistant · Request desk · Event · Openings · Newsletter · Call to action · Poll · Support / tip · Countdown · FAQ |
| **Layout** (1)    | Divider                                                                                                              |

Three rules make it general:

- **Most blocks repeat.** Three text blocks, two FAQs, a pricing table per service line. Blocks backed
  by a shared collection (services, reviews, gallery…) appear once.
- **Every block renames.** "Services" becomes "Meet your MLA" or "Apprenticeships"; the heading, the
  desktop nav anchor and the mobile tab all follow.
- **Empty blocks disappear** from the live page and are flagged in the editor and admin.

## The canvas editor — `/webview`

- **Block panel** — each block is a tile showing a miniature of its own layout, filtered by category
  or search. Drag a tile onto the page or tap to append.
- **Canvas** — the live page inside one of six device frames (Desktop, Laptop, iPad mini, iPhone 15,
  iPhone SE, Pixel 8). A ghost card follows the cursor while dragging and a drop line marks the
  landing point; the canvas auto-scrolls near its edges. Pointer-event based, so it works on touch.
- **In-place editing** — select a block and type directly into its heading and subtitle.
- **Properties** — every option the block exposes, with add/reorder/remove rows for list blocks.
- **Undo / redo** on everything: `⌘Z`, `⇧⌘Z`, `Delete` to remove the selection, `Esc` to deselect.

## The live editor — Admin → Live editor

Three panes, résumé-builder style: the page outline with drag handles, theme colour and typography
sliders on the left; field-by-field control of the profile header in the middle (each row reorders,
hides, deletes and edits inline, with avatar alignment); and a zoomable live preview on the right that
is itself editable — click the name, title or tagline and type, or click the avatar to change it.

## Design system

Theming runs on CSS variables mapped into Tailwind (`brand-*`, `accent-*`, radius, fonts), so one
change repaints the public page, the editor preview and the admin together.

| Control     | Options                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Templates   | 7 presets — Indigo Pro, Sunset Bold, Editorial, Ocean Calm, Forest, Mono Minimal, Rose Luxe          |
| Colours     | 12 primary + 12 accent palettes, chosen separately                                                   |
| Fonts       | 7 pairings (Plus Jakarta, Playfair, Poppins, Space Grotesk, DM Serif, Sora, JetBrains Mono)           |
| Banners     | 6 generated covers + 4 photographic, or none                                                         |
| Layout      | 3 corner radii, 4 card styles, 3 button shapes, line height, base font size                          |
| Theme       | Light and dark, following the system setting or an explicit toggle                                   |

## The chat concierge

Every profile carries a chat bubble. It answers from the knowledge base **and completes the work in
the conversation** — no forms, no navigation:

| Say | What happens |
| --- | --- |
| "Book an appointment" | Service → day → free slot → name → phone → a confirmed appointment with a reference |
| "RSVP for the workshop" | Name → email → phone → an e-ticket |
| "Apply for a role" | Role → name → email → phone → an application |
| "Subscribe" | Email → confirmed |
| "Raise a request" | Category → name → phone → description → a reference number |
| "Call" / "WhatsApp" / "Save contact" / "Share" | Performed straight away |
| Anything else | Answered from the knowledge base, with sources cited |

**Voice both ways.** A mic button dictates (Web Speech API, shown only where the browser supports it)
and a speaker toggle reads replies aloud. Everything runs in the browser.

Choice steps only accept one of the offered options, answers are validated (a bad phone number or
email is refused with a reason), "cancel" exits a flow at any point, and the opening suggestions adapt
to what that profile actually offers — no "Raise a request" on a profile without a request desk.

`lib/chat-agent.ts` is a pure state machine, independent of React, so the flows can be tested on their
own. Appointment availability comes from `lib/slots.ts`, shared with the booking sheet, so the chat
never offers a slot the calendar would refuse.

## Assistants

**Visitor assistant** — `lib/rag.ts` tokenizes the question, scores knowledge entries by title, tag and
body overlap, answers extractively from the best passages and cites them. Below a confidence
threshold it says it does not know and offers a booking rather than inventing an answer.

**Documents** — `lib/ingest.ts` reads `.txt`, `.md`, `.csv` and `.json` in the browser, splits them into
passages and tags them automatically. PDFs and Word files are added as a labelled placeholder, since
there is no server to extract them.

**Private account assistant** — `lib/account-ai.ts` answers the owner's questions about their own
account from live figures: views and best day, click rate with strongest and weakest link, bookings
with value and conversion, open requests by category, and which blocks are not showing and why. Never
exposed on the public page.

## The admin adapts

Every tab is gated on a block being present. No Services block, no Appointments tab; add a Request
desk and Requests appears. What is missing is listed with the block that unlocks it. Only Overview,
Profile, the account assistant, Live editor, Design and Example profiles are always available.

## Example profiles

Four complete pages built from the same blocks, switchable from **Admin → Example profiles**:

| Profile             | Field                  | Leans on                                     |
| ------------------- | ---------------------- | -------------------------------------------- |
| Sheela Bhaskaran    | Financial consultant   | Services · AI assistant · Reviews · Numbers  |
| Revathi Arumugam    | Sitting MLA            | Request desk · Progress tracker · Event · Openings |
| Anitha Selvaraj     | Community organiser    | Announcements · Support · Progress tracker · Openings |
| Aarav Mehta         | Wedding photographer   | Gallery · Pricing · Video · Progress tracker |
| Meera Krishnan      | Yoga & breathwork      | Opening hours · Schedule · Menu · Team       |
| Rohan Deshpande     | Advocate               | Certifications · Request desk · FAQ · Downloads |

The two political profiles are deliberately a pair. Revathi holds office: an official grievance desk
with a 48-hour promise, a promises-versus-delivered tracker and free Janata Darbar slots. Anitha holds
none: her help desk states plainly that a citizens' trust cannot sanction anything and only files and
follows up, her tracker shows work in progress rather than promises kept, and the page carries public
contributions and notices instead of an official portal. Same blocks, opposite situations.

## Demo flows

- **Book** — service → calendar → slot → details → confirmation with a summary.
- **RSVP** — form → numbered e-ticket.
- **Apply** — jobs, volunteering or apprenticeships, with a résumé upload.
- **Request desk** — your own categories → a reference number → an admin inbox filtered by status.
- **Subscribe** — email → confirmation.
- **Ask AI** — a suggested question or your own, answered with cited sources.
- **Chat concierge** — the bubble on every profile: book, RSVP, apply, subscribe or raise a request by typing or speaking.
- **Extras** — a real scannable QR code for the deployed site, Web Share, dark mode, and a genuinely real vCard download.

## Structure

```
app/                     directory, /me your page, /[handle] published profiles, admin, canvas editor
components/              ui primitives, profile sections, sheets, stores, providers
components/editor.tsx    canvas editor: selection, drag, library, properties
components/live-editor.tsx   three-pane live editor
components/blocks/       block context and prop-driven block renderers
data/blocks.ts           block registry — 41 types, defaults, editable fields
data/design.ts           palettes, templates, fonts, banners
data/profiles.ts         the four example profiles
data/seed.ts             default demo content
lib/site.ts              the published site URL and per-handle links, in one place
lib/chat-agent.ts        the chat concierge: intent detection and flow state machine
lib/slots.ts             appointment availability, shared by the chat and the booking sheet
lib/rag.ts               retrieval and answer composition
lib/ingest.ts            document chunking
lib/account-ai.ts        private account assistant
docs/                    client deck and engineering plan (open the .html files)
```

## Docs

- `docs/client-deck.html` — 14-slide product walkthrough.
- `docs/engineering-plan.html` — architecture, recommended stack and the phased plan to 5M profiles.

## Building for production

The demo deliberately has no backend. Production would need accounts and a database in place of
browser storage, real email and SMS, payments, hosted embeddings and a language model, file storage,
custom domains per profile, and an analytics pipeline behind the dashboard figures.
`docs/engineering-plan.html` covers the recommended stack for each.
