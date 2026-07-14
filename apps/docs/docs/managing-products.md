---
title: Managing products
sidebar_position: 2
---

# Managing products

Everything shoppers see — the shop grid, the product page, the little
overlay that pops up when they click a product — all comes from one list of
products in the admin panel. Edit it there and the whole site updates.

## Where to find it

Go to `/admin` and click **Products** in the left-hand menu. You'll see a
table of everything currently in the shop.

## Adding a new product

Click **Create New** at the top of the Products list, then fill in:

- **Name** — the product's title, e.g. "Goddess Amigurumi Doll".
- **Category** — pick from the existing categories (Bouquets, Home,
  Plushies, Bags, Accessories, Prints). This controls which filter chip it
  shows up under on the shop page.
- **Price (£)** — just type the price in pounds, e.g. `24.99`. You don't
  need to worry about pence or any conversion — that's handled for you.
- **Short description** — the one-line summary shown under the name on the
  product card, e.g. "Hand-crocheted cotton, approx 28cm". Keep it short —
  it's meant to be read at a glance.
- **Badge** (optional) — if you want a little label on the card (Bestseller,
  New, Limited, Popular), pick it here. Leave it blank for no badge.

Everything else on the form (colour theme, placeholder icon) only matters
if you haven't uploaded real photos yet — see below.

The product's **web address** (the URL people visit, e.g.
`/product/goddess-amigurumi-doll`) is generated automatically from the name.
You don't need to set this yourself — it's filled in the first time you
save, and changing the name afterwards won't change the address (so any
links people have already shared keep working).

## Adding photos

Scroll to **Product photos** and upload one or more images. The first photo
you upload is the one used on the shop grid card; all of them appear in the
gallery on the product's own page.

If you haven't uploaded any photos yet, the product shows a generated
placeholder graphic instead (a coloured icon) so the page still looks
finished while you're waiting on real photography. There's no rush to add
photos — nothing breaks if a product goes live without them — but real
photos always look better and are worth adding as soon as you have them.

## Filling in the product page details

Further down the form are the fields that make up the full product page
(the page you get to by clicking through from the shop grid):

- **Product story** — the longer description on the product page. If you
  leave this blank, a simple description is generated automatically from
  your short description, so it's fine to skip this at first and come back
  to it later.
- **Details** — a list of bullet points, e.g. "100% cotton yarn", "Approx
  28cm tall". Click **Add Detail** to add more lines.
- **Care instructions** — a short paragraph on how to look after the piece,
  e.g. "Spot clean only with a damp cloth."
- **How it's made** — a short line shown above the product name, e.g. "6–8
  hours by hand" or "an original, 1 of 1".

## SEO fields (optional, but worth doing)

Near the bottom, in the sidebar, there are two optional fields:

- **Page title (SEO)** — what shows up as the browser tab title and in
  Google search results. If you leave it blank, the product name is used.
- **Search description (SEO)** — the snippet shown under your listing in
  Google search results. If you leave it blank, the product story is used
  instead.

You don't have to fill these in for the product to work — they just help
the page look better when it's found through search engines.

## Editing or removing a product

Click any row in the Products list to open and edit it — changes go live
as soon as you save. To take a product off the shop entirely, delete it
from the list (use the checkbox and the delete action, or open it and use
the delete option in the top-right). There's no "hide without deleting"
option at the moment — if you want to temporarily stop selling something
without losing its content, the simplest approach is to remove its Badge
and leave a note for yourself, or ask about adding a proper "hidden" toggle
if this comes up often.

## Keeping categories and details consistent

The category and badge options are fixed lists (not free text) so that the
shop's filter chips and card badges always work correctly and never end up
with typos like "Bouquet" vs "Bouquets" splitting your products across two
filters that should be one. If you need an entirely new category, that's a
small code change — ask the person who built the site to add it, rather
than trying to type a new one into the Category field (it won't be there to
select).
