This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI ingredient suggestions

The "Menu Items" dialog has a **Suggest with AI** button that fills the
ingredient list for any dish. Two providers are supported — pick whichever
suits you:

### Option 1 — Google Gemini (free tier, no credit card)

1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   and click **Create API key**.
2. Add it to `.env.local`:

   ```
   AI_PROVIDER=gemini
   GOOGLE_API_KEY=your-google-ai-studio-key
   # optional — defaults to gemini-2.0-flash
   # GEMINI_MODEL=gemini-2.0-flash
   ```

3. Restart the dev server (`npm run dev`).

Free tier limits are generous (≈1,500 requests/day on `gemini-2.0-flash`),
which is more than enough for this app.

### Option 2 — OpenAI (paid, needs prepaid credit)

1. Get a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. **Add credit** at [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing) —
   $5 lasts a long time on `gpt-4o-mini`. New accounts no longer include a
   free trial, so this step is required.
3. Add to `.env.local`:

   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   # optional — defaults to gpt-4o-mini
   # OPENAI_MODEL=gpt-4o-mini
   ```

4. Restart the dev server.

### How it works

Keys are read server-side only by `app/api/suggest-ingredients/route.ts` and
are never exposed to the browser. The route returns a JSON list of
`{ name, quantity, unit }` rows that the dialog injects into the form so you
can review and tweak before saving. If `AI_PROVIDER` is unset, it auto-picks
OpenAI when `OPENAI_API_KEY` is present, otherwise Gemini.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
