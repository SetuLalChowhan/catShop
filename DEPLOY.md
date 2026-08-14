# Deploying to Vercel (Client + Server)

This repo contains two apps, and they deploy as **two separate Vercel projects**
from the same GitHub repo (Vercel monorepo support):

| Project   | Root directory | What it is                          |
|-----------|----------------|-------------------------------------|
| Client    | `client/`      | Next.js public website              |
| Server    | `server/`      | Express REST API (serverless fn)    |

The browser only ever talks to the **client** origin — Next.js proxies every
`/api/*` call to the server via `rewrites` in `client/next.config.ts`. So there
is no CORS between the browser and the API; the server's `CLIENT_URL` is used
for the rare direct/cross-origin case.

---

## 1. Prerequisites (have ready)

- GitHub repo containing this code (push your changes first).
- **MongoDB Atlas** cluster → connection string (`mongodb+srv://...`).
- **Cloudinary** account → cloud name, API key, API secret.
- (Recommended) change `server/.env` values first — see Security note below.

## 2. Deploy the Server project

1. Go to **vercel.com → Add New… → Project → Import** your GitHub repo.
2. **Root Directory**: set to `server`.
3. Framework Preset: **Other** (leave auto-detected as-is; `vercel.json`
   handles the build).
4. Add these **Environment Variables** (Server):

   | Name | Example |
   |------|---------|
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/cat-booking` |
   | `JWT_SECRET` | any long random string |
   | `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` |
   | `CLOUDINARY_API_KEY` | `123456789012345` |
   | `CLOUDINARY_API_SECRET` | `your-api-secret` |
   | `CLIENT_URL` | `https://your-client.vercel.app` (client URL once deployed) |
   | `ADMIN_EMAIL` | `admin@example.com` (used to create the first admin) |
   | `ADMIN_PASSWORD` | a strong password (first-boot seed only) |
   | `ADMIN_NAME` | `Admin` (optional) |

5. Click **Deploy**. You'll get a URL like `https://your-server.vercel.app`.
   - Test it: open `https://your-server.vercel.app/` → `{ status: "ok", ... }`.
   - The first boot auto-seeds the default admin + sample content
     (idempotent — safe on every cold start).

## 3. Deploy the Client project

1. **Add New… → Project → Import** the same GitHub repo again.
2. **Root Directory**: set to `client`.
3. Framework Preset: **Next.js** (auto-detected).
4. Add these **Environment Variables** (Client):

   | Name | Example |
   |------|---------|
   | `BACKEND_URL` | `https://your-server.vercel.app` |
   | `NEXT_PUBLIC_API_URL` | `https://your-server.vercel.app` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-client.vercel.app` |

   > `BACKEND_URL` is read at build time for the Next.js rewrites and
   > `NEXT_PUBLIC_API_URL` is used by server components — both must point at
   > the **server** URL, not the client URL.

5. Click **Deploy**. Done — browse your site and try `/admin/login`.

## 4. Finishing touches

- **Custom domains**: add them in each project's **Settings → Domains**.
- **Update `CLIENT_URL`** on the Server project to your final client domain
  (re-deploy if you change it).
- **MongoDB network access**: allow access from everywhere
  (Atlas → Network Access → `0.0.0.0/0`) or add Vercel's IP range; the
  simplest for a hobby site is `0.0.0.0/0`.

---

## Known limitations (serverless)

- **Upload size**: Vercel serverless functions reject request bodies over
  **4.5 MB**. Phone photos can exceed this, so image uploads may fail with a
  413. Recommended fix: upload images **directly from the browser to
  Cloudinary** (unsigned upload preset) and just store the returned
  `url`/`publicId` via the API.
- **Cold starts**: first request after idle can take a few seconds while the
  DB connects and seeds are checked.

## Security note

`server/.env` is currently tracked in git (it contains your secrets).
Before deploying, generate new values, add the real secrets to Vercel env
vars, and remove `.env` from the repo:

```bash
git rm --cached server/.env
```

Then add `.env` back to `server/.gitignore` (uncomment the line) so secrets
are never committed.
