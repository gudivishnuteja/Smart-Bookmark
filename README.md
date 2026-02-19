# Smart Bookmark Premium

A bookmark manager with Google sign-in, folders, search, sort, and Excel export. Built with Next.js 14 and Supabase.

## Tech stack

- **Next.js 14** (App Router)
- **React 18**
- **Supabase** (auth + database)
- **Tailwind CSS**
- **xlsx** (export to Excel)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Create `.env.local` in the project root:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign in with Google to reach the dashboard.

## Problems I ran into & how I solved them

### 1. App was desktop-only, not mobile responsive

**Problem:** The layout was built for desktop. On phones, the header, sidebar, and content didn’t adapt; the sidebar was always visible and the UI was hard to use on small screens.

**Solution:**

- **Header:** On mobile, use a compact header with hamburger, shorter title (“Smart Bookmarks”), icon-only “Add” button, and a second row for search + Export. On desktop, keep the full “Add New Bookmark” and “Export” buttons in one row with search.
- **Sidebar:** On mobile, hide the sidebar by default and show it as a slide-out drawer when the hamburger is tapped. Use an overlay behind the drawer; tapping the overlay or a folder closes the drawer. On desktop (`md` and up), keep the sidebar always visible.
- **Touch:** Added `touch-manipulation` and sensible tap targets (e.g. `min-h-[44px]`) on buttons and dropdowns so taps work reliably on phones.
- **Landing page:** Made the login card responsive with `max-w-[400px]` and padding so it doesn’t touch the screen edges on small viewports.
- **Modals:** Added horizontal padding and `max-h-[90vh]` with `overflow-y-auto` so add/edit bookmark modals don’t overflow on small screens.
- **Bookmark cards:** Switched from fixed width to `w-full min-w-0` so they fill the grid on mobile.
- **Global:** Set a proper viewport in the layout and used `font-size: 16px` on inputs on small screens to avoid iOS zoom on focus.

### 2. “Sort: Alphabetical” looked like it was inside the sidebar on mobile

**Problem:** When the mobile drawer was open, the “Sort: Alphabetical” dropdown (which belongs to the main content, under “List Bookmarks”) appeared next to or under the folder list, so it looked like Sort was part of the sidebar.

**Solution:** The Sort control was always in the main content in the code; the confusion was from both the sidebar and the main content being visible at once. When the **mobile sidebar is open**, the main content is now **hidden** (`hidden` on small screens, `md:block` on desktop). So with the drawer open you only see the Folders list; when you close the drawer, you see “List Bookmarks” and the Sort dropdown in the correct place.

### 3. Supabase: “Invalid API key” or auth not working locally

**Problem:** The app showed Supabase errors or “Invalid API key” when running with `npm run dev`, or Google sign-in did nothing.

**Solution:**

- **Env vars:** Create `.env.local` in the project root (not inside `app/` or `src/`). Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase dashboard (Project Settings → API). Restart the dev server after changing `.env.local`.
- **No quotes in .env:** Use `NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co` with no quotes around the value.
- **Google OAuth:** In Supabase → Authentication → Providers, enable Google and add your OAuth client ID/secret. In the Google Cloud Console, add the correct redirect URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.

### 4. Supabase: Table “bookmarks” missing or permission denied

**Problem:** Dashboard failed to load bookmarks or showed “relation does not exist” / “permission denied”.

**Solution:**

- **Create the table** in Supabase → SQL Editor. Example:

  ```sql
  create table public.bookmarks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    title text,
    url text not null,
    category text default 'General',
    favorite boolean default false,
    pinned boolean default false,
    click_count int default 0,
    created_at timestamptz default now()
  );
  ```

- **Row Level Security (RLS):** Enable RLS on `bookmarks` and add a policy so users only see their own rows, e.g. “Allow select/insert/update/delete where `auth.uid() = user_id`”.

### 5. Vercel: Build fails or env vars not found

**Problem:** `vercel` or “Deploy to Vercel” from GitHub succeeded, but the build failed, or the deployed app showed “Invalid API key” / Supabase errors.

**Solution:**

- **Env vars in Vercel:** In Vercel → Project → Settings → Environment Variables, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the same values as in `.env.local`. Redeploy after saving.
- **Build errors:** Check the build log. Common fixes: fix any TypeScript/ESLint errors, ensure `npm run build` works locally, and that all `NEXT_PUBLIC_*` variables are set in Vercel for the Production (and Preview if you use it) environment.

### 6. Vercel + Supabase: Google sign-in redirects to wrong URL after deploy

**Problem:** Google sign-in worked on localhost but after deploying to Vercel it redirected to the wrong URL or showed an error.

**Solution:**

- **Redirect URL in Supabase:** In Supabase → Authentication → URL Configuration, set **Site URL** to your Vercel URL (e.g. `https://your-app.vercel.app`). Add the same URL (and `https://your-app.vercel.app/dashboard` if needed) under **Redirect URLs**.
- **Redirect in code:** The app uses `window.location.origin` for OAuth redirect, so it should automatically use the Vercel domain when deployed. If you had a hardcoded `localhost` redirect, remove it and use the dynamic origin.
- **Google Cloud Console:** In the OAuth client’s authorized redirect URIs, add `https://<your-project-ref>.supabase.co/auth/v1/callback` (same as local). The Supabase callback URL does not change between local and Vercel.

---

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Build for production     |
| `npm run start`| Start production server  |

## License

Private.
