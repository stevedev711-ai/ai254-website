# AI254 website and AI254 LIVE

This is the public website for AI254 and the AI254 LIVE classroom application. It is built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, PostgreSQL and Prisma.

## Structure

| Path | What it is |
|---|---|
| `/`, `/who-we-are`, `/what-we-do`, `/our-technology`, `/request-a-demo`, `/contact`, `/privacy`, `/terms` | Public website (`src/app/(site)`) |
| `/live` | AI254 LIVE landing page (Student / Lecturer / Administrator login) |
| `/live/student`, `/live/student/[code]` | Student join page and live lecture view |
| `/live/login`, `/live/lecturer`, `/live/lecturer/[id]` | Lecturer sign-in, dashboard and session console |
| `/live/admin` | Administration: sessions, accounts, terminology, demo requests, messages, team page, logs, errors |
| `src/app/api/*` | Server endpoints (all inputs validated server-side with zod) |
| `src/lib/live/services.ts` | **The single integration point for the AI254 speech recognition and translation services** |
| `src/lib/live/demo-content.ts` | Sample lecture scripts and glossary entries used only in demonstration mode |

## Setup

```bash
cp .env.example .env          # fill in DATABASE_URL, AUTH_SECRET, SMTP_*, SEED_ADMIN_*
npm install
npx prisma migrate deploy     # create tables
npm run db:seed               # first admin, sample Biology terms, public demo sessions
npm run build && npm start
```

To create more accounts (the password is read from the environment so it stays out of shell history):

```bash
NEW_USER_PASSWORD='…12+ chars…' npm run create-user -- --email name@uni.ac.ke --name "Dr. Name" --role LECTURER
```

Administrators can also create lecturer accounts under **/live/admin → Lecturer accounts**.

## Connecting the AI254 services

Set `AI254_ASR_URL`, `AI254_TRANSLATE_URL` and `AI254_API_KEY`. Once they are set:

- lecturers can create **Live lecture** sessions;
- the lecturer's browser captures audio in 5-second chunks while the microphone switch is on, and posts each chunk to `/api/live/sessions/:id/audio`;
- the server forwards the audio to the ASR service, sends the text to the translation service along with the subject glossary, and stores the result as a `Segment`, including the processing times the services report;
- students receive segments through `/api/live/sessions/:id/feed`.

The request and response contract is documented at the top of `src/lib/live/services.ts`. If the existing services use a different shape, change only that file.

If the services are **not** configured, AI254 LIVE shows "Demonstration environment" throughout. Sessions in that mode play hand-prepared sample content, labelled as such on every screen, and audio is never processed.

## Forms

The demo-request and contact forms work as follows:

- Fields are validated on both the client and the server.
- A per-form idempotency key means a retry cannot create a duplicate. Repeat requests from the same email and organisation within 10 minutes are also refused.
- Spam protection uses a honeypot field, a minimum fill time and per-IP rate limits (the IP is stored only as a salted hash). Cloudflare Turnstile is used if its keys are set.
- Records are saved to PostgreSQL **before** any success message is shown.
- Email goes out over SMTP: a notification to `NOTIFY_EMAIL` (default info@ai254.net) and an acknowledgement to the sender. The delivery outcome is stored on each record and failures appear in the admin logs. If SMTP is missing, submissions are still saved and marked "not configured".

## Content to review before launch

- The Biology glossary is seeded with **sample** entries (status `SAMPLE`). Replace them with the reviewed AI254 glossary in /live/admin → Terminology.
- The Kiswahili lines in `demo-content.ts` were prepared for illustration and have not been reviewed by language specialists.
- The Privacy Policy and Terms of Use are drafts and should be reviewed by AI254.
- The team section shows a placeholder until profiles are added and published in /live/admin → Team page.
- Pilot figures are kept in `src/lib/site.ts` (`pilotFacts`).
