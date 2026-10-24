# TOX: live toxicology case lecture

A web version of the TOX lecture. The presenter screen runs the slides; the audience joins on their phones by QR code and answers each case question in a 30-second round. Correct answers score 500–1,000 points depending on speed, and a leaderboard shows after every question. Every answer slide has clickable evidence cards (trial summaries with PubMed links), readable on the big screen and on phones.

- Presenter: `index.html`
- Phones: `play.html` (the QR code on the lobby screen links here with the game PIN filled in)

## Running a session

1. Open the site on the presentation laptop, press **F** for full screen.
2. The lobby shows the QR code and PIN. Names appear as people join; click a name to remove it.
3. Press **→** (or a clicker's next button) to move through the lecture. On a question slide, each press advances: open the round, reveal the answer, leaderboard, next slide.
4. To end a round early (say someone left and the rest have answered), click **End round** next to the timer, or press **E** or →.
5. **J** shows the join code at any time. **H** hides the live answer counts. **?** lists all keys.

After each question's leaderboard comes its discussion slide: why each option is right or wrong, 2–3 background points, and QR codes to the core papers. Phones show the same papers as tap-to-open links. Questions 7 and 8 share one discussion slide, because explaining 7 gives away 8.

After editing any file, run `python3 stamp.py` before committing so browsers load the new version.

Optional: `index.html?dur=20` for 20-second rounds.

## Rehearsing alone

In the lobby, **Add 5 practice players** adds bots that answer every round. Remove them before the real session.

To rehearse without Firebase on one computer, open `index.html?local=1` and the join link it shows in a second tab.

## Setup (one time)

- `js/config.js`: Firebase web config.
- `database.rules.json`: paste into Firebase console, Realtime Database, Rules tab, then Publish.
- Firebase Authentication: Anonymous sign-in enabled; the site's domain listed under Authorized domains.

Free Firebase plan limit: 100 simultaneous connections (the presenter plus up to ~99 phones).

## Content

Slides and questions live in `js/slides.js`. Evidence cards and references in `js/refs.js` are generated from the lecture's reference database.
