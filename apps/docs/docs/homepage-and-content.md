---
title: Homepage & content sections
sidebar_position: 3
---

# Homepage & content sections

This one's a bit different from the other guides, so it's worth reading in
full: **most of the homepage's marketing copy is still fixed in the code,
but customer reviews and a handful of "not ready yet" sections are now
things you can control yourself from the admin panel.** Here's exactly what
that means in practice.

## What you CAN change yourself, right now

- **The "Shop the collection" grid** — every product shown here, in every
  category, comes straight from your **Products** list in the admin panel.
  Add, edit, or remove a product there and the grid updates immediately.
  See the [Managing products](/managing-products) guide.
- **Product photos** — uploaded per-product, also covered in that guide.
- **Customer reviews ("Kind words")** — go to `/admin` → **Feedback**. This
  is the list behind both the homepage's review strip and the full
  `/feedback` page. You can:
  - Add a new review (star rating, quote, which product it's about).
  - Tick **Featured** on 2–3 of your favourites to choose what shows on the
    homepage — everything (featured or not) shows on the full `/feedback`
    page.
  - Edit or remove any entry.

  At launch, this list was seeded with real feedback pulled from the eBay
  shop's public feedback profile — eBay only ever shows a masked buyer name
  (like "j\*\*\*n"), never a real one, so those entries show a "Verified eBay
  purchase" badge instead of a name. Once you start collecting reviews
  directly through this site with real customer names, mark those with
  **Source: App** so they show a real name on the card.
- **Whether "Original Artworks", "How I make each piece", "Studio Journal"
  and "Bespoke" show on the homepage** — go to `/admin` → **Site Settings**
  → **Homepage sections**. Each one is a simple on/off switch. Turn a
  section on the moment it's actually ready (real photos, finished copy,
  etc.) — no developer needed, and there's nothing to "publish", it's live
  the moment you save. The Bespoke switch also hides/shows its nav link, so
  the menu never points at a section that isn't there.
- **Whether eBay-sourced reviews show at all** — also in **Site Settings**,
  under **Feedback**: "Show eBay-sourced reviews". This is on by default
  since that's most of what you have right now. Once you've collected enough
  real, in-app reviews (Source: App) to stand on their own, switch this off
  — the eBay-sourced entries stay safely in the Feedback list, they just stop
  being shown to customers. No need to delete or re-tag anything.

That covers most of what changes week to week or month to month on a
handmade-goods shop: new pieces, new photos, new reviews, and turning
sections on once they're ready.

## What's still fixed in the code

The hero heading ("Crochet & painted keepsakes..."), the manifesto section,
the "made entirely by me / one-of-one pieces" pills, the trust band
statistics, "My Story", the footer text, and the newsletter section are
still written directly into the website's code. That was a deliberate
choice early on to match the original design exactly, but it does mean a
text change to any of those needs a developer to edit and redeploy the
code — it isn't a self-service edit today.

If this is going to be a recurring need (e.g. you expect to update the
homepage copy seasonally, or want to run limited-time banners), it's worth
asking the developer about extending the same on/off, self-service pattern
used for reviews and the homepage sections above — it's a reasonably
contained addition, but it isn't built for these particular sections yet.

## Practical tips for requesting a copy change

Since these sections live in code, the fastest way to get a change made
correctly is to be precise about which section and give the exact new
wording, e.g.:

> "In the hero section, change 'Last bouquet in 48h' to 'Last bouquet in
> 24h'."

rather than "update the homepage a bit" — the person making the change can't
see your intent, only the instruction.

## Two real pages, not just homepage sections

"My Story" and "Kind words" aren't only sections you scroll past on the
homepage — they're also real, standalone pages at `/about` and `/feedback`.
That matters for two reasons: they can be shared as direct links (e.g. in an
email or on social media), and they show up properly in Google search
results with their own title and description, rather than being buried
partway down the homepage. Clicking "Our Story" or "Feedback" in the site's
navigation from anywhere other than the homepage takes you straight to
these.

## Section reference

For your own orientation, top to bottom, the homepage is made up of: **Nav**
(logo, links, basket icon) → **Hero** (headline, intro, stats) →
**Manifesto** (the big italic statement lines) → **Promise** (the row of
small icon + text items) → **Trust band** (the dark strip with numbers) →
**Shop the collection** (your live product grid — the one part you've always
controlled) → **Original Artworks**, **How I make each piece** and **Studio
Journal** (each hidden until you switch it on in Site Settings) → **My
Story** → **Bespoke** (also hidden until switched on) → **Kind words**
(your live reviews — the ones marked Featured) → **Newsletter / footer**.
Knowing these names helps when describing which part you'd like changed.
