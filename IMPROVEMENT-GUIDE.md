# Bae Watch — Improvement Guide (UX audit + games redesign)

Two expert passes over the app: a top-down UX audit of every page/component, and
a couples-game designer's redesign of the games. Distilled into what to build.

---

## PART 1 — UX AUDIT

**One-line verdict:** The *contextual* cards (repair flow, partner-sync check-in,
manual-page-of-the-day, love-language loop) are ship-quality. The gap is
everything *evergreen*: Home is a long, flat, redundant scroll of pretty-but-inert
cards. Cut duplicates, wire the dead ends, let the great conditional cards rise.

### Home screen — the priority fix
Home renders up to **21 stacked cards** in a hardcoded order; most always-on cards
are display-only dead ends.

- **Dead ends that look tappable but do nothing:** "Suggested Actions" (3 fake
  hover-animated buttons, no onClick), InsightCard's "Get more prompts" button,
  the SafetyHeader notification bell (decorative, always shows an unread dot),
  Weekly-Recap stat tiles, and the RelationshipWeatherWidget body. Nothing that
  lifts on hover should do nothing on tap.
- **Severe metric duplication:** connection level appears in ~4 places (weather
  widget, standalone ConnectionLevelWidget, weekly recap, weather again); cup
  fullness in 3. Cut the standalone `ConnectionLevelWidget` and "Partner Cup"
  card from Home (move to Insights/Weather). Two repair entry points coexist
  (rainy-weather banner + permanent "Had a disagreement?" card) — keep one.
- **Inverted hierarchy:** four substantial features (Manual, Timeline, Growth,
  Date Night) are demoted to an 11px-label icon strip, while a *fake* "Suggested
  Actions" card gets a full hero lower down.
- **Fixes:** (1) priority-driven ordering so the most actionable contextual card
  floats under the vitals hero; (2) make stat tiles drill down (check-ins →
  Insights history, connection → trend, top mood → filtered history); (3)
  time-aware greeting (it says "Good morning" at 11pm); (4) surface state on the
  quick-link strip ("Manual · 2 of 4", "Growth · 1 due soon").

### Highest-value cross-app fixes
1. **Kill Home dead ends** — wire or remove the fake buttons/bell listed above.
2. **De-dupe Home vitals** — removes ~4 cards + 3 duplicate metrics.
3. **Priority-driven Home ordering** instead of a fixed list.
4. **Give static stats drill-downs** — every metric answers "and then what?"
5. **Fix MemoriesPage taxonomy bug** — the filter chips
   (`milestone/gesture/repair/favorites/important/photo`) and the add-form
   `<select>` (`favorites/comfort/important/dislikes/food`) are two different
   lists, so memories tagged comfort/food/dislikes are unreachable and
   milestone/gesture/repair chips can never be filled. Unify to one taxonomy.
6. **DailyQuestion → two-player reveal** — both answer, then reveal to each other;
   today it's solo journaling that punts the couple moment to real life. (Also:
   the `questions` array is duplicated verbatim in HomePage.jsx and
   DailyQuestionPage.jsx — extract to a shared module.)
7. **DatePlanner: close the loop** — planned dates carry no date/time, so
   "planned" does nothing. Add scheduling + surface as Home reminders (with
   Timeline anniversaries).
8. **Deprecate guess-your-partner fields in ProfileEdit** (partner mood/need/cup
   slider) that feed the fake Home InsightCard; drive from real synced check-ins.
9. **Fix BottomNavigation truthfulness** — Insights/Timeline/Growth/DatePlanner
   hardcode `activeTab="home"` so the wrong tab highlights; the center `+` opens
   the prompt library instead of *creating* something.
10. **Make `Card` honest** — only apply the hover-lift when an `onClick` exists,
    so static cards stop pretending to be tappable.

### Per-page quick notes
- **CheckIn** (excellent) — add today's-entry history/edit; guard duplicate
  same-day entries; `grid-cols-4` labels wrap awkwardly.
- **Chat** (strong) — add timestamps, read indicators, pagination past 50.
- **Repair** (crown jewel) — commitment regex silently fails on freeform edits;
  resource links point at generic homepages; add a real 20-min time-out timer.
- **UnderstandingMe** (strong) — `origins` field is collected but never surfaced;
  result card needs a "Send to {partner}" action.
- **LoveLanguages page vs quiz** — both set `yourLoveLanguage`; they can conflict
  silently. Decide which wins.
- **Manual** (strong, buried) — `alwaysWorks` may not be surfaced anywhere; add
  per-field save; nudge partner to fill theirs.
- **Weather** (better than Home) — overlaps Home + Insights heavily.
- **Insights/Timeline/Growth/DatePlanner** — read-only; add actions; Growth
  claims "partner sees this / cheer on" with no partner-side view — verify or
  it's a false promise.
- **ConversationCoach** — the center-nav `+` destination; claims tailoring it
  doesn't do; not AI-personalized despite Bae existing.
- **Onboarding / PartnerInvite** — best-executed flows; production-grade.

---

## PART 2 — GAMES REDESIGN

**Core problem:** all three games live in local React state and never touch the
live Firestore sync that makes the app special. They're single-player worksheets
that mention a partner — the exact "question → answer → repeat" loop to avoid.

- **Love Questions** — the typed `answers` array is never read back, scored, sent,
  or saved. AI does one clever thing then hands you a textarea.
- **How Well Do You Know {partner}?** — best instinct ("your partner is the answer
  key"), but honor-system single-device; the magic (partner *secretly* recorded
  the real answer, you find out if you matched) needs the second phone and isn't
  used.
- **Gratitude Challenge** — not a game; three text boxes. The polished note isn't
  even delivered, though ChatPage has a live messages collection right there.

**The one primitive to build:** a live game-session doc at
`relationships/{id}/games/{sessionId}` (or a `currentGame` field), both phones
`onSnapshot` it, each writes only its own `answers.{uid}`, a `status` field drives
the phase machine — **exactly** how `repairRequest` already flips
`choosing → chosen → null` across devices. 80% of the plumbing exists.

### Concepts (built for two synced phones)
1. **Simultaneous Reveal ("Snap")** — both answer the same Bae prompt *blind*;
   answers flip face-up at the same instant, no editing after. Bae drops one line
   on the match/gap. *Cheapest meaningful upgrade; reuses `generateLoveQuestion`.*
2. **Bae Bets (prediction market)** — wager 1–3 hearts on how your partner rated
   their week; the answer key is *already in Firestore* (`latestCheckIn`,
   `cupFullness`). Wrong high-confidence bets softly surface blind spots. *No new
   logging.*
3. **Emoji Charades / Draw-My-Feeling** — encode a shared memory (from
   `memories`/`timeline`) in emoji only; partner guesses. Recycles real history.
4. **Co-op vs the App ("Beat Bae")** — team up *against* Bae's challenges; wins
   nudge `connectionLevel`. Enforces "us vs the problem."
5. **Async Surprise Drops** — plant a note (polished via `polishGratitudeNote`);
   partner opens it later and taps "It landed 💛" (reuses `recordLanguageWin`).
   Fits real life; closes the loop Gratitude leaves open.
6. **Two Truths & a Bae** — Bae writes one convincing lie; partner spots it.
7. **60-Second Sync** — shared countdown off a `startedAt` timestamp; rapid
   either/or; match % at the buzzer.
8. **Role-Swap ("Answer As Me")** — answer as your partner; they grade the
   impersonation. Perspective-taking as play.

**Build first two:** (1) **Simultaneous Reveal** — cheapest, fixes the flattest
game, and *establishes the shared game-session doc* everything else inherits.
(2) **Async Surprise Drops** — different (async) axis, highest reuse
(`polishGratitudeNote` + `recordLanguageWin` + `repairRequest`-style delivery).

---

## PART 3 — SHIPPED THIS PASS
- **AI usage limits** — each user gets **2** AI card generations ("get it right in
  2"), shown as a live counter on Understanding Me; button disables at 0. Small
  caps defined for other AI features (`AI_LIMITS` in AppContext).
- **xneelo AI proxy** — `server/xneelo/baewatch-ai.php` + README so the OpenAI key
  lives on your server, never in the browser bundle. Includes a server-side daily
  call ceiling. (See PART 4.)

## PART 4 — SECURITY: the OpenAI key
The key was scraped off the Vercel bundle and OpenAI disabled it. Action plan in
`server/xneelo/README.md`: regenerate the key (set a spend limit), drop the PHP
proxy on xneelo with the key in a file *above* web root, point
`VITE_AI_PROXY_URL` at it, and leave `VITE_OPENAI_API_KEY` empty. The app already
routes through the proxy when that var is set — no code change needed.

## PART 5 — DAY-2 PERSONALITY QUESTIONS (girlfriend's idea)
Design: don't front-load it. Day 1 = love language + attachment (already gated).
On the user's **second distinct day** of use, Home surfaces a "Day 2: your
personality" card unlocking a short type quiz (see `src/services/personalityQuiz.js`).
Result stored on the profile and folded into Bae's `coupleContext`, so cards and
games get sharper. Keeps onboarding light while deepening the model over time.
