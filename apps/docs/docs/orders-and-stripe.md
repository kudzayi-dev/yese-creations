---
title: Orders & Stripe basics
sidebar_position: 4
---

# Orders & Stripe basics

This guide explains where an order's information lives, how its status
changes, and where to look when something needs checking.

## The short version

- **Stripe** processes the actual card payment. That's all it does.
- **Your admin panel** is where the order itself lives — the customer's
  name, delivery address, phone number, what they bought, and the order
  status. This is the place to check when you need to know what to post out
  and where.

Your customers' contact and shipping details are stored in your own admin
panel, not just inside Stripe — so you always have them to hand for
packing and posting, even if you never log into Stripe at all.

## Where to find orders

In `/admin`, click **Orders** in the left-hand menu. Each row is one order,
showing its status, the customer's email, and the total. Click a row to see
the full details: name, delivery address, phone, exactly what they ordered
(with quantities and prices), and the shipping method they chose.

## How an order's status changes

Every order starts as **Pending payment** the moment a customer submits the
checkout form — before Stripe has even confirmed the card went through.
Within a few seconds, one of two things happens automatically:

- The payment succeeds → the order flips to **Paid**. This is your signal
  to pack and post it.
- The payment fails (declined card, etc.) → the order flips to **Payment
  failed**. Nothing needs posting for these; the customer will typically
  try again or get in touch.

You don't need to do anything to make this happen — it updates itself as
soon as Stripe confirms the outcome. If you ever see an order stuck on
"Pending payment" for more than a few minutes, that usually means the
customer abandoned checkout before paying, rather than a problem on your
end — it's safe to ignore or delete stale pending orders after a day or so.

There's also a **Refunded** status available on each order, but — and this
is worth knowing — it isn't set automatically today. If you issue a refund
through Stripe (see below), you'll need to manually change the order's
status to Refunded in the admin panel yourself as a reminder to yourself and
anyone else looking at the order list. Ask your developer if you'd like this
automated later.

## Issuing a refund

Refunds are done through Stripe directly, not through your admin panel —
your admin panel doesn't take payments or move money, only Stripe does.

1. Log into your Stripe Dashboard (stripe.com — you'll have been given
   separate login details for this; it's not the same login as `/admin`).
2. Find the payment (search by customer email or amount, or use the
   PaymentIntent ID — visible on the order's page in `/admin` for
   cross-referencing).
3. Open it and use the **Refund** action.
4. Come back to `/admin`, open the matching order, and set its status to
   **Refunded** so your own records stay accurate.

## Why it's split this way

Keeping customer contact and shipping details in your own admin panel
(rather than only in Stripe) means you're never dependent on your Stripe
account to know who ordered what and where to send it — that data is yours,
in the system you already use every day for products. Stripe, meanwhile,
only ever sees the minimum it needs to run the charge (email, and the
name/address on the card payment itself) — it was never designed to be a
customer database, and this setup doesn't ask it to be one.

## If a payment seems to have gone wrong

If a customer says they were charged but you don't see a Paid order, or an
order says Paid but the customer says they weren't charged, this is the one
area worth involving your developer — it usually means checking Stripe's
own event log against what's in `/admin`, which needs a bit of technical
digging rather than a quick admin-panel fix.
