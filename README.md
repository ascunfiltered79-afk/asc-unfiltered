# ASC UNFILTERED — MULTI-PAGE WEBSITE 🎭

This is a new version of ASC Unfiltered that uses **real separate HTML pages**. When someone clicks The Feed, their browser navigates from the homepage to `feed.html` instead of scrolling to a section of one giant page.

## IMPORTANT: The exact GitHub layout

Upload the **CONTENTS** of this ZIP directly to the **top level (root)** of the `asc-unfiltered` repository. **Do not upload the ZIP itself or an enclosing folder.**

```text
asc-unfiltered/                <-- your GitHub repository
├── index.html                <-- HOME PAGE: GitHub opens this first
├── feed.html                 <-- THE FEED
├── vault.html                <-- ANONYMOUS CONFESSIONS
├── memes.html                <-- MEMES
├── polls.html                <-- POLLS
├── diaries.html              <-- CAMPUS DIARIES
├── tea.html                  <-- CAMPUS TEA
├── ask.html                  <-- ASK THE MASK
├── admin.html                <-- ADMIN DASHBOARD
├── assets/
│   ├── campus.webp
│   ├── masked-admin.webp
│   └── favicon.svg
├── js/
│   ├── site.js               <-- shared page behavior
│   ├── admin.js
│   ├── config.js
│   ├── data.js
│   └── service.js
├── database/
│   └── schema.sql
├── .nojekyll
├── README.md
└── START_HERE.txt
```

**The file order in the GitHub file list does not matter.** GitHub opens `index.html` first because that name is the default homepage. The other pages open when clicked.

## EASY WAY TO REPLACE THE OLD WEBSITE (NO DELETING THE REPOSITORY)

1. Download and **Extract All** from `ASC-Unfiltered-Multipage-GitHub.zip`.
2. Open the extracted `ASC-Unfiltered-Multipage` folder. Inside, you should see `index.html`, `feed.html`, etc.
3. Go to https://github.com/ascunfiltered79-afk/asc-unfiltered
4. Click **Add file → Upload files**.
5. Select everything **inside** the extracted folder (Ctrl+A), including the `assets`, `js`, and `database` folders, and drag it onto GitHub.
6. GitHub recognizes existing file paths and updates them; new HTML pages are added. Choose **Commit changes**.
7. GitHub **Settings → Pages**: set Deploy from a branch, branch `main`, folder `/(root)`, and leave Custom domain blank.
8. After deployment, visit https://ascunfiltered79-afk.github.io/asc-unfiltered/ and press Ctrl+Shift+R if you see a cached version.

If GitHub web upload refuses replacement of same-name files, open `index.html` on GitHub, click the pencil Edit button, paste the updated file content and Commit; then repeat for `admin.html`. Most normal GitHub upload flows do allow committing updated files.

## Styling reliability

All public pages include the CSS inside their own `<style>` block. They **do not depend on a separate `css/styles.css` path**. `admin.html` also has embedded CSS. This avoids the missing stylesheet problem from the earlier version.

## DEMO versus LIVE

When `js/config.js` contains blank Supabase settings, the site runs in **local demo mode**: fake sample posts appear in Feed; user submissions, poll votes, approvals and new posts are stored only in the current browser. **Other students on other devices will not be able to submit into your queue until you connect Supabase.** The demo Admin page is NOT password protected.

For real shared submissions, private moderation, voting and reporting:

1. Create a Supabase project at https://supabase.com
2. Run the SQL in `database/schema.sql` in Supabase's SQL Editor. Review and understand the policies before launching.
3. Create your own admin account in Supabase Authentication, then add its user ID to the `site_admins` table as described in the schema and original README.
4. In `js/config.js`, fill `supabaseUrl` and the **public anon/publishable key only**. NEVER put a secret/service_role key into frontend JavaScript or GitHub.
5. Upload and commit the edited `js/config.js`.
6. Test submission on one device and admin approval on another, and test reporting / moderation, before inviting students.

## Content and safety

This unofficial student site should never publish private details, accusations, bullying, or photos without consent. Student submissions go through admin approval. The website makes clear it is not affiliated with the college. Direct file uploads are not implemented, only external HTTPS media links.
