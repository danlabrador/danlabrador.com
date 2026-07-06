# danlabrador.com

Personal portfolio + blog with a self-hosted admin panel.

## Stack

- **Framework** — Next.js 16 (App Router) + TypeScript + React 19
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Database** — Neon Postgres via Prisma 6
- **Auth** — Auth.js v5 (GitHub OAuth, email allowlist)
- **Media** — Cloudflare R2 (S3-compatible)
- **WYSIWYG** — Tiptap with `lowlight` code blocks
- **Email** — Resend (contact form)
- **Newsletter** — Buttondown
- **Spam protection** — Cloudflare Turnstile
- **Hosting** — Vercel

## Local setup

```bash
nvm use              # Node 20 (see .nvmrc)
npm install
cp .env.example .env # fill in the values (see walkthroughs below)
npx prisma db push   # apply schema to your Neon dev branch
npm run dev
```

Then visit `http://localhost:3000`.

## Service setup walkthroughs

The `.env.example` lists every variable. Below is how to get each one.

### 1. Neon Postgres

1. Sign up at [neon.tech](https://neon.tech). Free tier is plenty for this site.
2. Click **New Project**. Region: `us-east-2` (Ohio) or `us-west-2` (Oregon) — pick whichever's closer to Vercel's default. Postgres version: default (17).
3. Once created, the console shows a **Connection Details** panel. Select the **Prisma** framework preset.
4. Copy the pooled connection string into `DATABASE_URL` (it has `-pooler` in the hostname and `?pgbouncer=true`).
5. Copy the direct (non-pooled) connection string into `DIRECT_URL`. Prisma migrate needs it.
6. Neon gives every project a `main` branch. For dev vs prod isolation later, create a `dev` branch off `main` and use it locally; keep `main` for prod.

If you regenerate the password, both URLs change — update both in `.env` and in Vercel's environment variables.

### 2. Cloudflare R2

1. Sign up at [cloudflare.com](https://cloudflare.com) if you don't already have an account. R2 requires a payment card on file even on the free tier (10 GB storage / 1M writes / 10M reads free).
2. Dashboard → **R2 Object Storage** → **Create bucket**. Name it `danlabrador-media`. Location: Automatic.
3. On the bucket page → **Settings** tab → **Public access**. For dev, enable the `.r2.dev` public URL. For prod, connect a custom domain (e.g. `media.danlabrador.com` — you'll add a CNAME in Cloudflare DNS).
4. Back to the R2 landing page → **Manage R2 API Tokens** (right sidebar) → **Create API Token**.
   - Permissions: **Object Read & Write**
   - Specify bucket: `danlabrador-media`
   - TTL: forever (or your preference)
5. Copy the four values into `.env`:
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`
   - Account ID (shown on the R2 landing page) → `R2_ACCOUNT_ID`
   - Bucket name → `R2_BUCKET_NAME` (`danlabrador-media`)
6. Set `R2_PUBLIC_URL` to the r2.dev URL for dev, or `https://media.danlabrador.com` for prod once the custom domain is live.

### 3. Resend

1. Log in at [resend.com](https://resend.com).
2. **Domains** → **Add Domain** → enter `danlabrador.com`. Resend gives you a set of DNS records (usually SPF, DKIM x2, DMARC).
3. Add those records to `danlabrador.com`'s DNS in Cloudflare (or wherever your DNS lives). Wait 5–30 minutes for Resend to verify.
4. Once verified, **API Keys** → **Create API Key** → name it `danlabrador-com-prod`, scope: **Sending access** to `danlabrador.com`.
5. Paste the key into `RESEND_API_KEY`.
6. `RESEND_FROM` must use a verified sender address on the verified domain, e.g. `Dan Labrador <hello@danlabrador.com>`.
7. `CONTACT_INBOX=dan@danlabrador.com` — where submissions arrive.

If you haven't set up an inbox at `hello@danlabrador.com`, either create one (Google Workspace, Fastmail, ImprovMX for free forwarding) or send from a subdomain you own like `noreply@mail.danlabrador.com`.

### 4. GitHub OAuth app (for /admin sign-in)

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Application name**: `danlabrador.com (dev)` — you'll make a second one for prod.
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**.
4. On the app page:
   - Copy **Client ID** → `AUTH_GITHUB_ID`
   - Click **Generate a new client secret** → copy the value (shown once) → `AUTH_GITHUB_SECRET`
5. Create a **second** OAuth app for production with:
   - **Homepage URL**: `https://danlabrador.com`
   - **Authorization callback URL**: `https://danlabrador.com/api/auth/callback/github`
   - Its Client ID + Secret go into Vercel's environment variables (not `.env`).

`ADMIN_EMAIL_ALLOWLIST` is a comma-separated list — only these emails can sign into `/admin`. The email is whatever your GitHub account has as its primary email.

### 5. Buttondown (newsletter)

1. Sign up at [buttondown.com](https://buttondown.com). Free tier covers up to 100 subscribers.
2. **Settings** → **API access** → copy the API key.
3. Paste into `BUTTONDOWN_API_KEY`.

### 6. Cloudflare Turnstile

1. Cloudflare dashboard → **Turnstile** → **Add site**.
2. **Domain**: `danlabrador.com` (add `localhost` too for local dev).
3. **Widget mode**: Managed (default).
4. Copy the **Site key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
5. Copy the **Secret key** → `TURNSTILE_SECRET_KEY`

### 7. `AUTH_SECRET`

Any random 32-byte base64 string. Generate with:

```bash
openssl rand -base64 32
```

Paste the output into `AUTH_SECRET`. Do NOT reuse this between dev and prod.

## Scripts

```bash
npm run dev              # Next.js dev server (Turbopack)
npm run build            # production build
npm run start            # start prod server locally
npm run lint             # ESLint
npx prisma db push       # push schema to DB (no migration files)
npx prisma migrate dev   # create a migration
npx prisma studio        # open the Prisma data browser
```

## Deployment

Vercel picks up on push to `main` (once wired up).

Environment variables to set in the Vercel dashboard:
- All values from `.env.example` (with production values, not dev)
- `AUTH_URL=https://danlabrador.com`
- `NEXT_PUBLIC_SITE_URL=https://danlabrador.com`
- GitHub OAuth values from the **prod** OAuth app (different from dev)
- Neon `main` branch URLs, not the `dev` branch
