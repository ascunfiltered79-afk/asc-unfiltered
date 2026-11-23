# ASC UNFILTERED — Behind The Mask 🎭

A mobile-friendly, unofficial, student-run website for Amar Singh College in Srinagar. Includes a masked-admin look, the real campus photo, memes and stories, a moderated confession vault, campus tea, anonymous questions, media links, polls, reports, and a private admin dashboard.

**This is an unofficial community project. It is not operated by Amar Singh College.**

## 1. Run the demo immediately

No build step and no npm installation are required.

**Simple method (VS Code):**
1. Unzip the download.
2. Open the `asc-unfiltered` folder in VS Code.
3. Install the **Live Server** extension in VS Code (if needed).
4. Right-click `index.html` → **Open with Live Server**.
5. The public site appears. Open `admin.html` to test approving stories, adding posts and creating polls.

**Or using Python (Windows/macOS):**

```bash
cd asc-unfiltered
python -m http.server 8000
```

Visit `http://localhost:8000` and `http://localhost:8000/admin.html`.

> Important: Until you connect Supabase, this is **DEMO MODE**. Submissions, votes and moderation are saved in the browser's `localStorage`. They are **not shared across devices** and the demo admin is **not password protected**. The example feed posts are clearly marked as examples. Do not invite students to use the demo for actual submissions.

## 2. Publish the files to GitHub Pages

1. Sign in to [github.com](https://github.com/).
2. Choose **New repository**. Name it `asc-unfiltered` and set **Public**.
3. Open the repo, select **Add file → Upload files**.
4. **Unzip this ZIP first**, then upload **all files and folders inside** `asc-unfiltered` — including `index.html`, `admin.html`, `css`, `js`, `assets`, and `database`. Do not upload only the `.zip` file. `index.html` must be in the repository's root.
5. Click **Commit changes**.
6. Open **Settings → Pages**. Under Build and deployment, choose **Deploy from a branch**. Select `main` and `/ (root)`, then **Save**.
7. Your website's URL will look like `https://YOUR-USERNAME.github.io/asc-unfiltered/`.

GitHub Pages hosts the public website, but **does not provide a database or secure admin accounts**. Complete the next section to make student submissions work across phones.

## 3. Connect a real database and moderated admin account (Supabase)

The frontend is already wired for Supabase. The SQL file sets up **Row Level Security (RLS)** so anonymous visitors can send **pending** submissions but cannot publish their own stories, see pending stories, or edit content. Only an authorized admin can moderate.

1. Visit [supabase.com](https://supabase.com/) and create a project.
2. Open **SQL Editor** → new query, paste the full content of `database/schema.sql`, and run it once.
3. Open **Authentication → Users**, create your own admin account with a strong password, and **copy the user's UUID**. The Supabase dashboard may label this **Add user**.
4. Back in **SQL Editor**, run this with the actual UUID:

```sql
insert into public.site_admins (user_id)
values ('PASTE-YOUR-ADMIN-USER-UUID-HERE')
on conflict (user_id) do nothing;
```

5. Find the **Project URL** and **publishable key** (or older public `anon` key) in **Project Settings → API / API Keys**.
6. Edit `js/config.js`:

```js
export const CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY',
  instagramUrl: 'https://www.instagram.com/asc.unfiltered/',
  siteTitle: 'ASC UNFILTERED',
};
```

7. Save `js/config.js` and commit it to GitHub. GitHub Pages will deploy the updated website. Go to your site and confirm that the header says **LIVE COMMUNITY**. Sign in at `/admin.html` using your admin email and password.
8. Make a test confession from one browser. Open `admin.html`, approve it, then refresh the main page in another browser. It should appear for both users.

**Key security rule:** The public **publishable/anon** key is allowed in a frontend because the database RLS restricts access. **NEVER** put a Supabase `service_role`, secret key, or admin password into `config.js` or GitHub.

## 4. Daily workflow

- A student chooses **Enter the Vault**, selects Confession, Meme, Campus Tea, Question or Media, and submits text plus an optional HTTPS media link.
- Their post stays `pending`; nobody else sees it.
- You sign in to `admin.html`, check the **Pending** tab, and click **Approve** or **Reject**.
- Approved posts appear in the public feed. The **Published** tab can unpublish them.
- Students can report an approved post. You can review and clear reports in the **Reports** tab.
- Use **+ New Post** for your own college updates, captions and reels. Use **Polls** to create or close poll questions.

**Images & reels:** The initial version accepts **URLs**, not file uploads. For photos, use a public direct HTTPS image URL (e.g. ending in `.jpg`, `.png` or `.webp`). Reel links appear as clickable links rather than embedded video. To publish an image you own, you can also upload it to your GitHub repository's `assets` directory and use its full public GitHub Pages image URL.

## 5. Personalization

- Change Instagram account link: `js/config.js` → `instagramUrl`.
- Change brand colors, fonts and mobile layout: `css/styles.css`.
- Change the homepage sections, text and disclaimer: `index.html`.
- Replace the supplied assets: `assets/campus.webp`, `assets/masked-admin.webp`.
- Change demo example posts and demo poll: `js/data.js` (only for local demo).
- To update the favicon replace `assets/favicon.svg`.

## 6. Important launch and safety notes

- The submission form **does not request a student's name or account**, but neither GitHub Pages nor third-party services provide a guarantee of absolute anonymity. Do not promise total anonymity or privacy beyond this design.
- Remove bullying, doxxing, private chat screenshots, identifiable gossip, defamation and allegations about real people. Publish only appropriate, approved content with permission.
- The public submission and report endpoints are intentionally open to anonymous visitors. **Before a large public launch**, add CAPTCHA, bot protection and server-side rate limits (such as via Supabase Edge Functions or a similar backend) to prevent spam and denial of service.
- **Poll voting is limited only once per browser via local storage**. This is convenient but is not a fraud-resistant voting system. Users can clear browser storage or switch browsers; don't use results as official surveys.
- URLs may link to external websites. Review submitted links carefully before approving.
- GitHub Pages and public source repositories are visible to others. Only public project settings belong in the repository.
- Edit or withdraw submitted content when requested and follow applicable privacy policies and laws.
- The demo mode's admin area has no authentication. **Never rely on that mode for public submissions**.

## Project structure

```text
asc-unfiltered/
├── index.html              Public student website
├── admin.html              Admin moderation dashboard
├── css/styles.css          Responsive design
├── js/config.js            Site and Supabase settings
├── js/data.js              Demo examples and utility functions
├── js/service.js           Supabase + demo data handling
├── js/app.js               Public site features
├── js/admin.js             Admin dashboard features
├── assets/campus.webp      Supplied college photograph
├── assets/masked-admin.webp Supplied masked-admin art
├── assets/favicon.svg      Site icon
├── database/schema.sql     Supabase database and RLS
└── .nojekyll               GitHub Pages compatibility
```

Built as a static site that works on GitHub Pages. No React, npm or compilation required.
