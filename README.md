# Dyeloty

Dyeloty helps makers find yarn from the same dye lot. Listings link to the original Vinted or OLX offer; Dyeloty does not handle payments or in-app messaging.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Supabase (Auth, Postgres, Storage).

## Local setup

1. Install dependencies with `npm install`.
2. Create `.env.local` with the public Supabase values below.
3. Apply the SQL migrations in `supabase/migrations` to the target Supabase project, in filename order.
4. Start the app: `npm run dev`.

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Configure Google OAuth in Supabase Authentication and add the deployed `/auth/callback` URL (and the local development equivalent) to the allowed redirect URLs.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Deployment

Set the same public environment variables in the deployment platform, apply pending Supabase migrations before release, and verify Google OAuth redirect URLs for the production domain. Never commit secrets or service-role keys.
