---
title: Homepage & content sections
sidebar_position: 3
---

# Homepage & content sections

This one's a bit different from the other guides, so it's worth reading in
full: **the homepage's marketing sections are not editable from the admin
panel today.** Here's exactly what that means in practice, so you know what
you can change yourself and what needs a developer.

## What you CAN change yourself, right now

- **The "Shop the collection" grid** — every product shown here, in every
  category, comes straight from your **Products** list in the admin panel.
  Add, edit, or remove a product there and the grid updates immediately.
  See the [Managing products](/managing-products) guide.
- **Product photos** — uploaded per-product, also covered in that guide.

That's genuinely most of what changes week to week on a handmade-goods
shop: new pieces, new photos, price changes, sold-out items.

## What's currently fixed in the code

Everything else on the homepage — the hero heading ("Crochet & painted
keepsakes..."), the manifesto section, the "made entirely by me / one-of-one
pieces" pills, the trust band statistics, the customer reviews/testimonials,
the footer text, and the newsletter section — is written directly into the
website's code rather than pulled from the admin panel. That was a deliberate
choice early on to match the original design exactly, but it does mean a
text change to any of those sections needs a developer to edit and redeploy
the code — it isn't a self-service edit today.

If this is going to be a recurring need (e.g. you expect to update the
homepage copy seasonally, or want to run limited-time banners), it's worth
asking the developer about adding a small "site content" area to the admin
panel for just those sections — that's a reasonably contained addition, but
it isn't built yet, so don't go looking for it.

## Practical tips for requesting a copy change

Since these sections live in code, the fastest way to get a change made
correctly is to be precise about which section and give the exact new
wording, e.g.:

> "In the hero section, change 'Last bouquet in 48h' to 'Last bouquet in
> 24h'."

rather than "update the homepage a bit" — the person making the change can't
see your intent, only the instruction.

## Section reference

For your own orientation, top to bottom, the homepage is made up of: **Nav**
(logo, links, basket icon) → **Hero** (headline, intro, stats) →
**Manifesto** (the big italic statement lines) → **Promise** (the row of
small icon + text items) → **Trust band** (the dark strip with numbers) →
**Shop the collection** (your live product grid — the one part you control)
→ **Gallery** (original artworks) → **Story** → **Reviews** → **Newsletter /
footer**. Knowing these names helps when describing which part you'd like
changed.
