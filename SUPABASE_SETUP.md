# Supabase setup · Phase 1 (auth + progress sync)

This is a one-time setup. After it, the app syncs progress across devices for any signed-in user.

## 1. Create the project

1. Go to https://supabase.com/dashboard and create a new project.
2. Region: pick the closest one to your Hetzner box.
3. Save the **database password** somewhere safe.
4. Wait ~2 minutes for it to provision.

## 2. Wire the local env

1. In the project dashboard, go to **Project Settings → API**.
2. Copy **Project URL** and **anon public key**.
3. In the repo, copy the template:

   ```sh
   cp .env.example .env.local
   ```

4. Paste the values into `.env.local`:

   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

5. Restart `npm run dev`.

## 3. Run the migration

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase/migrations/20260422000000_init.sql`.
3. Click **Run**. It creates `profiles`, `user_progress`, RLS policies, and the auto-profile trigger.

Verify: **Table Editor** should show `profiles` and `user_progress`, both with RLS enabled.

## 4. Configure redirect URLs

In **Authentication → URL Configuration**:

- **Site URL**: your production URL (e.g. `https://athar.your-domain.com`).
- **Redirect URLs** — add both of these so magic links work everywhere:
  ```
  http://localhost:5173/auth/callback
  https://athar.your-domain.com/auth/callback
  ```

Without these, Supabase will reject the OAuth / magic-link callback.

## 5. Enable Google OAuth

### 5a. Google Cloud Console

1. Go to https://console.cloud.google.com.
2. Create a new project (or reuse one).
3. **APIs & Services → OAuth consent screen** → fill in app name, user support email. Publishing status can stay "Testing" while you're developing.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://athar.your-domain.com`
   - Authorized redirect URIs — **this one comes from Supabase**, not your app. Copy the exact value from Supabase (next step) and paste it here. It looks like:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
5. Save. Copy the **Client ID** and **Client Secret**.

### 5b. Supabase dashboard

1. **Authentication → Providers → Google**.
2. Toggle on.
3. Paste **Client ID** and **Client Secret** from step 5a.
4. Supabase shows the **Callback URL** — that's the one that goes into the Google Cloud Console redirect URIs (go back and update 5a if you haven't).
5. Save.

## 6. Test

1. Start the app: `npm run dev`.
2. Visit `http://localhost:5173/login`.
3. Try both:
   - **Continue with Google** → should bounce through Google → land back on `/home`, signed in.
   - **Magic link** → enter email → check inbox → click link → land back on `/home`, signed in.
4. Verify sync:
   - Run a drill. The attempt records locally AND should upsert to `user_progress` within ~1.5 s.
   - Check **Table Editor → user_progress**. You should see one row for your user.
5. Sign out, sign in on a different browser → progress should pull down and replace local.

## 7. What's next (not yet built)

These are deferred to later phases:

- **Phase 2**: friends, leaderboards, shared weak-spot review.
- **Phase 3**: realtime head-to-head Musābaqah matches via Supabase Realtime.
- **Profile editing** (display name, avatar override).
- **Export/import progress** for power users.

## Troubleshooting

- **"Supabase isn't configured"** on login page → env vars missing or dev server not restarted.
- **Magic link goes to localhost from production** → Site URL not set (step 4).
- **Google OAuth "redirect_uri_mismatch"** → the redirect URI in Google Cloud doesn't match Supabase's callback URL exactly. Copy it from Supabase again.
- **Sync not happening** → check browser console for RLS errors. The trigger in step 3 must have run; if not, re-run the migration.
- **Progress duplicated** → wipe `localStorage.removeItem('athar:merged:<userId>')` and reload to re-merge.
