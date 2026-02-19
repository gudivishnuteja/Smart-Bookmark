# Video Walkthrough Script (3–5 minutes)

Use this as a guide while recording. Aim for **3–5 minutes** total.

---

## 1. Intro & overall approach (≈45–60 sec)

**Say something like:**

- "This is Smart Bookmark Premium — a bookmark manager with Google sign-in, folders, search, sort, and Excel export."
- "**Overall approach:** I used **Next.js 14** with the App Router for the front end, and **Supabase** for authentication and the database. The UI is built with **Tailwind CSS** and is responsive for both desktop and mobile."
- "The flow is simple: users land on a login page, sign in with Google, and are redirected to a dashboard where they can add, edit, delete, search, and filter bookmarks, and export them to Excel."
- "I’ll show the repo structure briefly."  
  **[Optional: Quick show of folders: `app/` (page.js, dashboard), `components/`, `lib/supabase.js`.]**

---

## 2. Authentication & user privacy (≈1–1.5 min)

**Authentication:**

- "**Authentication** is handled entirely by **Supabase Auth** with **Google OAuth**."
- "On the home page we only show a ‘Continue with Google’ button. When the user clicks it we call `supabase.auth.signInWithOAuth` with provider `google` and a redirect URL pointing to `/dashboard`. Supabase and Google handle the rest."
- "We use `onAuthStateChange` so that when the session becomes available we redirect to the dashboard, and when the user signs out or has no session we redirect back to the home page. On the dashboard we also check for OAuth callback hash so we don’t redirect away before Supabase has finished processing the tokens."
- "Session is stored by Supabase (e.g. in cookies/localStorage). We never store passwords; we only use the session and user object from `getUser()` or `getSession()`."

**User privacy:**

- "**User privacy** is enforced in two places."
- "**First, in the client:** when we add a bookmark we always attach the current user: we pass `user_id: user.id` in the insert payload so every row is tied to the signed-in user."
- "**Second, in the database:** we rely on **Supabase Row Level Security (RLS)**. The `bookmarks` table has RLS enabled with policies so that users can only select, insert, update, and delete rows where `auth.uid() = user_id`. So even if someone tried to call the API directly, they could only see and change their own bookmarks."

**[Optional: Show in code]**  
- `app/page.js`: `signInWithOAuth`, `onAuthStateChange`, redirect to `/dashboard`.  
- `app/dashboard/page.js`: `onAuthStateChange`, `setUser(session.user)`, and in `addBookmark` the `user_id: user.id` in the insert.

---

## 3. Keeping the UI in sync (≈1 min)

**Say something like:**

- "**Keeping the list up to date** is done by **refetching after every change**."
- "We don’t use Supabase Realtime subscriptions in this version. Instead, after any add, edit, or delete we call `fetchBookmarks()` again, which runs a `supabase.from('bookmarks').select('*').order('created_at', { ascending: false })`. Because RLS is in place, that query only returns the current user’s bookmarks, so the list on screen always reflects their data."
- "So the ‘real-time’ feel is: user adds or edits a bookmark → we run the mutation → we refetch the list → the UI updates. It’s simple and works well for this use case. If we wanted live updates across tabs or devices we could add Supabase Realtime subscriptions later."

**[Optional: Show in code]**  
- `fetchBookmarks()` and where it’s called: after `addBookmark`, `deleteBookmark`, `updateBookmark`, and in `useEffect` when `user` is set.

---

## 4. Short wrap-up (≈20–30 sec)

- "So in summary: **approach** — Next.js + Supabase + Tailwind with a clear login → dashboard flow; **authentication and privacy** — Google OAuth via Supabase plus RLS so each user only sees their own bookmarks; **updates** — refetch after each mutation to keep the list in sync. Thanks for watching."

---

## Timing checklist

| Section              | Target  |
|----------------------|--------|
| Intro & approach     | ~1 min |
| Auth & user privacy  | ~1–1.5 min |
| UI updates / sync    | ~1 min |
| Wrap-up              | ~30 sec |
| **Total**            | **3–5 min** |

---

## Tips for recording

- Have the repo open and the app running (e.g. `npm run dev`) so you can show the login page and dashboard if needed.
- You can show `lib/supabase.js` (single Supabase client) and the key parts of `app/page.js` and `app/dashboard/page.js` when you talk about auth and refetch.
- If you mention RLS, you can refer to the README where the `bookmarks` table and RLS are described.
