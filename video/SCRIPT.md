# LinkLens — video script

The video renders **silent**, with kinetic captions carrying the narrative. This
document is the same script in read-aloud form, in case you want a voiceover
pass later, or want to present the story alongside the video at demo day.

Timings match `video/src/LinkLensVideo.tsx`.

---

## Act 1 — the email (0:00 – 0:16)

> It starts with an email that looks completely routine.

*A plain mail window. Acme Account Services. "Action required: verify your
account". A deadpan blue button: Continue to verification. Nothing is red.
Nothing is wrong-looking.*

**Read-aloud (~5s):**
> Every one of these starts the same way — with an email that looks completely
> routine.

---

## Act 2 — the theft (0:16 – 0:28)

> One click. Thirty seconds.
> And your credentials are gone — the page looked *identical*.

*The click. The browser. A flawless Acme login page. The email types itself in,
the password follows, Sign in. Then red, and a broken shield.*

> The only difference: **-secure.com**

**Read-aloud (~8s):**
> One click. Thirty seconds of typing. And your credentials are gone — because
> the page looked identical. The only tell was a domain you cannot read at
> thirteen pixels.

---

## Act 3 — the problem (0:28 – 0:52)

> Three sites. *One identical page.*
> The only signal is a string !13 pixels long!

*Three cards. Pixel-identical login pages. They all say `acme.com/login`. Then
they swap — and three different destinations slide into the address bars.*

**Read-aloud (~10s):**
> You cannot catch this by looking. Three different sites, one identical page.
> All the signal lives in a string thirteen pixels long, in the one place nobody
> looks.

---

## Act 4 — the reveal (0:52 – 1:04)

> *LinkLens.*
> Look closer at every link

*Deep purple. A lens opens, the shipped lockup resolves out of it. The first
still frame in the video.*

**Read-aloud (~5s):**
> So we built LinkLens. Look closer at every link.

---

## Act 5.1 — network layer (1:04 – 1:26)

> The request is matched at the *network layer* —
> before a single pixel of the page can load.

*A packet flies from a browser tab along a wire. A lens-and-shield gate. The
packet stops dead. BLOCKED. The rule that did it scrolls in underneath.*

```json
{ "action": { "type": "redirect", ... },
  "condition": { "urlFilter": "||mgeko.cc^" } }
```

**Read-aloud (~12s):**
> LinkLens hooks into the browser's own network layer. When a request matches a
> known-malicious pattern, the browser never issues it. The page does not load
> and then hide — it simply never arrives.

---

## Act 5.2 — the block page (1:26 – 1:48)

> Instead of the site, the tab lands on a *block page*.
> It names the domain, states the reason, and offers two honest choices.
> *Go Back to safety* is the default — the page never runs a single line of the
> attacker's code.

*The real block page. The cursor finds "Go Back to safety" and clicks it.*

**Read-aloud (~12s):**
> Instead of the site, the tab lands on a block page. It tells you what it
> blocked and why, and it gives you two honest choices. The safe one is the
> default — and the page never runs a line of the attacker's code.

---

## Act 5.3 — the side panel (1:48 – 2:12)

> And a side panel that stays with you on *every* page.
> *2,451* links blocked since install — counted on your own machine.

*The panel docks to the right of the browser and assembles itself: warning,
protection, counters, activity feed.*

**Read-aloud (~12s):**
> And a side panel that stays with you on every page. Every block, every
> decision, counted where you can see them. Two thousand four hundred and
> fifty-one links since I installed it.

---

## Act 5.4 — the override (2:12 – 2:28)

> Say yes, and LinkLens does *not* switch protection off.
> It installs a !scoped allow-rule! — this domain, this session, reversible.

*The cursor clicks "Continue anyway". The rule that gets installed slides in:
allow, `||acme-corp-secure.com^`. Badges: this domain only · dies with the
browser · reversible any time.*

**Read-aloud (~9s):**
> And if I'm wrong? "Continue anyway" doesn't turn protection off. It installs a
> scoped allow-rule for that one domain, for that session, and it's reversible
> in a click.

---

## Act 6 — the proof (2:28 – 2:44)

> Every one of those numbers was counted *on your own machine.*

**2,451** links blocked since install · **20** blocked this session · **0** bytes
of your browsing sent anywhere. ever.

**Read-aloud (~8s):**
> Two thousand four hundred and fifty-one. Twenty in this session alone. And
> zero — zero bytes of your browsing sent anywhere. Ever.

---

## Act 7 — reach (2:44 – 2:54)

> One codebase. *Seven browsers.*
> Chromium, Gecko and WebKit — from a single source tree.

*Chrome, Chromium, Edge, Brave, Opera, Firefox and Safari sweep out of a row and
into a ring, which orbits once and then collapses to a point.*

**Read-aloud (~7s):**
> One codebase, seven browsers — Chromium, Gecko and WebKit, from a single
> source tree. No account, no cloud, nothing tracked.

---

## Act 8 — close (2:54 – 3:00)

> Know what a link really is
> **Thank you**

*The collapsed ring is where the logo grows out of — one continuous move, no cut.*

---

## Timing notes

- Total **180s**. Acts 1–3 (the problem) run 52s, the product 84s, the close 44s.
- The video has **no audio**. If you add a voiceover, the captions should stay —
  they are what plays in a muted judging room.
- Scene boundaries and lengths are defined in `video/src/LinkLensVideo.tsx`.
