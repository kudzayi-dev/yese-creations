import config from "@payload-config";
import { getPayload } from "payload";

// Real customer feedback pulled from the yesecreations eBay seller feedback
// profile (https://www.ebay.co.uk/fdbk/feedback_profile/yesecreations),
// replacing the 3 fictional placeholder testimonials that were hardcoded in
// Reviews.tsx. eBay only ever shows a masked buyer handle (never a real
// name) on the public feedback profile, so `buyerHandle` carries that
// exactly as displayed there (e.g. "j***n") — see Feedback.ts for why that's
// modeled as a distinct card style rather than a missing name.
//
// Filtered out during sourcing: eBay's automated "Order delivered on time
// with no issues" feedback (not a real quote), feedback Theresa left/received
// as a BUYER on other sellers' listings (irrelevant to her own shop), and
// entries too short/generic to read as a genuine testimonial (e.g. "Amazing",
// "Great item"). All entries below are 5-star / "Verified purchase" — eBay's
// public profile doesn't expose a per-review star rating, only an aggregate
// positive percentage (100% at time of sourcing), so `rating: 5` reflects
// that aggregate rather than a per-review value that doesn't exist.
const FEEDBACK_SEED = [
  {
    quote:
      "My item arrived quickly, was well packaged and even had an added extra! It's just gorgeous \u{1F49E} I absolutely love it. Very happy customer, thankyou so much \u{1F60A}",
    productName: "Mini Crochet knitted Amigurumi Heart Hugging couple Plushie Keyring",
    buyerHandle: "o***y",
    cat: "Accessories",
    featured: false,
  },
  {
    quote:
      "Fast delivery, packaged well. I am very happy with my handmade crochete flower arrangement. They are just has the seller described. Beautiful shades of purple. Seller was even kind enough to accept my offer. It's certainly value for money.",
    productName: "Handmade crocheted purple flower arrangement in a vase",
    buyerHandle: "e***t",
    cat: "Bouquets",
    featured: false,
  },
  {
    quote:
      "Excellent ebayer - communicative, quick responses, personalised attention, and beautifully crafted item, designed exactly to my measurement specifications!",
    productName: "Handmade Crochet Coleus Plant Flower Home Decoration",
    buyerHandle: "7***n",
    cat: "Art",
    featured: false,
  },
  {
    quote: "Cute firm teddy which has been lovingly crocheted. Arrived in lovely packaging. Thank you so very much.",
    productName: "Small firm Crochet Teddy holding a Red Love Heart Amigurumi",
    buyerHandle: "n***2",
    cat: "Soft Toys",
    featured: false,
  },
  {
    quote:
      "Really well made demogorgon. Bought for my son as a birthday stocking filler and he loved it! Photos didn't do it justice, it's even better in the flesh. Well packaged and reasonable postage costs. Highly recommend.",
    productName: "Handmade Crochet Demogorgon Stranger Things Soft Figure",
    buyerHandle: "3***a",
    cat: "Soft Toys",
    featured: false,
  },
  {
    quote: "Item perfect, as described. Really quick delivery. Perfect present for someone.",
    productName: "Handmade Cherry blossom Crochet Flower Plant in a Soft Stuffed Vase",
    buyerHandle: "9***2",
    cat: "Bouquets",
    featured: false,
  },
  {
    quote:
      "Arrived today. Beautifully made with care and attention to detail. Wrapped well and sent on quickly. Super quality items skilfully made. Very good price for the work that had gone into making them. I am a very happy customer.",
    productName: "Mini Handmade Crochet Amigurumi Santa Christmas gift Keyring",
    buyerHandle: "a***n",
    cat: "Accessories",
    featured: false,
  },
  {
    quote: "Super quality hand knitted hat. Very fast delivery. Thank you.",
    productName: "Adult Unisex Orange and black Halloween handmade Crochet beanie hat",
    buyerHandle: "i***c",
    cat: "Hats",
    featured: false,
  },
  {
    quote:
      "Another great purchase from this seller who makes great knitted/crochet items. They are consistently beautiful quality and well made, with such lovely attention to detail. Sent out quickly. Beautifully wrapped/presented.",
    productName: "Mini Handmade Crochet Amigurumi Christmas gift Keyring",
    buyerHandle: "a***n",
    cat: "Accessories",
    featured: false,
  },
  {
    quote:
      "Outstanding Craftspersonship. Absolutely love. Thank you so much and the Flower key ring made me smile. Perfect Ebaying, highly recommend and I will definitely shop here again.",
    productName: "Adult orange halloween handmade Crochet beanie hat",
    buyerHandle: "n***t",
    cat: "Hats",
    featured: false,
  },
  {
    quote: "Gorgeous hat, Perfect Ebaying. Highly recommended.",
    productName: "Ladies Mustard and Brown Crochet Knitted Flower Beanie Warm Winter hat",
    buyerHandle: "n***t",
    cat: "Hats",
    featured: false,
  },
  {
    quote: "Great value and quality product with quick delivery, thank you.",
    productName: "Mini Crochet Grey Teddy Bear holding a Red Love Heart Amigurumi",
    buyerHandle: "m***3",
    cat: "Soft Toys",
    featured: false,
  },
  {
    quote: "Really nice and detailed, daughter will love it.",
    productName: "Handmade Crochet Rumi Doll From Huntrix Kpop Demon Hunters",
    buyerHandle: "a***2",
    cat: "Soft Toys",
    featured: false,
  },
  {
    quote:
      "This is an absolutely beautiful set \u{1F49C}. This is my second purchase and the quality is yet again, outstanding. They have been really well made by a very talented individual. It is superb value for money when you consider the materials used and the time spent creating them. I cannot recommend them highly enough.",
    productName: "Warm crochet winter flower beanie hat with a matching round scarf",
    buyerHandle: "3***a",
    cat: "Hats",
    featured: true,
  },
  {
    quote:
      "I love this summer hat it's a really talented price beautifully made really wonderful quality feels and looks \u{1F44D}",
    productName: "Handmade Ladies Crochet Bucket Hat / Sun Hat",
    buyerHandle: "3***o",
    cat: "Hats",
    featured: false,
  },
  {
    quote:
      "Fabulous crochet Santa. Expertly made. Lovely quality, very cute. Incredibly pleased with finding this seller. I also appreciate that you have thought to make Santa's of differing ethnicities. My daughter will love that I have sourced such a Santa for my grandson.",
    productName: "Mini Handmade Crochet Amigurumi Santa Christmas gift Keyring",
    buyerHandle: "a***n",
    cat: "Accessories",
    featured: true,
  },
  {
    quote: "Excellent quality hat. Really well made, fits perfectly and very warm and comfortable. Brilliant value for money.",
    productName: "Handmade Holly Beanie Bobble Pom Pom Crochet Christmas Winter hat",
    buyerHandle: "3***a",
    cat: "Hats",
    featured: false,
  },
  {
    quote:
      "Absolutely beautiful pot of flowers. Really well made, too nice to gift so they are now proudly on display at my house \u{1F601}.",
    productName: "3 Mini Handmade Orange Crochet Flower Plants in a Soft Stuffed Vase",
    buyerHandle: "3***a",
    cat: "Bouquets",
    featured: false,
  },
  {
    quote: "Theresa is a star, flowers are excellent quality and just what I needed, will be ordering more!",
    productName: "12Pcs Knitted Crochet Puff Flower Appliques",
    buyerHandle: "g***i",
    cat: "Accessories",
    featured: true,
  },
  {
    quote: "Gorgeous, soft and cuddly Christmas bear. Love the fact that the hat and scarf is removable. Really well made.",
    productName: "Handmade Green Christmas Crochet stuffed Teddy Bear",
    buyerHandle: "3***a",
    cat: "Soft Toys",
    featured: false,
  },
  {
    quote: "Lovely handmade beautiful quality.",
    productName: "Ladies Beanie Bobble Pom Pom Handmade Crochet Warm Winter hat",
    buyerHandle: "6***p",
    cat: "Hats",
    featured: false,
  },
  {
    quote: "It's beautiful, a lovely hand knitted Halloween hat. I will treasure it.",
    productName: "Adult orange halloween handmade Crochet beanie hat",
    buyerHandle: "c***1",
    cat: "Hats",
    featured: false,
  },
] as const;

async function seedFeedback() {
  const payload = await getPayload({ config });

  // Look up category ids by name — cat is now a relationship, same
  // migration as Products.cat in seed.ts. Categories are expected to
  // already exist (seeded by `pnpm seed`); throw loudly if one is missing
  // rather than silently creating a duplicate/mistyped category.
  const categoryIdByName = new Map<string, number>();
  const allCategories = await payload.find({ collection: "categories", limit: 0 });
  for (const c of allCategories.docs) {
    categoryIdByName.set(c.name, c.id);
  }

  let created = 0;
  let updated = 0;

  for (const entry of FEEDBACK_SEED) {
    const catId = categoryIdByName.get(entry.cat);
    if (catId === undefined) {
      throw new Error(
        `No category id found for "${entry.cat}" — has \`pnpm seed\` been run first? Known categories: ${[...categoryIdByName.keys()].join(", ")}`,
      );
    }

    const data = {
      source: "ebay" as const,
      quote: entry.quote,
      rating: 5,
      productName: entry.productName,
      cat: catId,
      buyerHandle: entry.buyerHandle,
      verified: true,
      featured: entry.featured,
    };

    // Idempotency key: quote + buyerHandle together, since neither alone is
    // guaranteed unique (a few buyers left feedback on more than one order).
    const existing = await payload.find({
      collection: "feedback",
      where: {
        and: [{ quote: { equals: entry.quote } }, { buyerHandle: { equals: entry.buyerHandle } }],
      },
      limit: 1,
    });

    const found = existing.docs[0];
    if (found) {
      await payload.update({ collection: "feedback", id: found.id, data });
      updated++;
      console.log(`  feedback ~ ${entry.buyerHandle} — ${entry.productName}`);
    } else {
      await payload.create({ collection: "feedback", data });
      created++;
      console.log(`  feedback + ${entry.buyerHandle} — ${entry.productName}`);
    }
  }

  console.log(`\nSeeded feedback: ${created} created, ${updated} updated.`);
}

try {
  await seedFeedback();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
