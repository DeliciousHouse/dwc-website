export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content: string[];
};

export const posts: BlogPost[] = [
  {
    slug: "welcome-to-delicious-wines",
    title: "Welcome to Delicious Wines",
    excerpt:
      "What we’re building, how we pick bottles, and how to get the most out of your next pour.",
    date: "2026-01-11",
    content: [
      "Welcome to Delicious Wines. This blog is where we share how we taste, how we curate, and how we help you find bottles that match real moments in your week.",
      "We focus on balance and approachability. That means clear tasting notes, simple pairings, and bottles that deliver value without needing a special occasion.",
      "If you are new to wine, expect plain language and practical tips. If you are experienced, expect thoughtful picks and a few surprising regions to explore.",
    ],
  },
  {
    slug: "pairing-cheat-sheet",
    title: "A no-stress pairing cheat sheet",
    excerpt:
      "A few simple rules (and a couple fun exceptions) that make food + wine instantly easier.",
    date: "2026-01-11",
    content: [
      "Pairing does not have to be perfect. Start with weight: lighter foods match lighter wines, richer foods match fuller wines.",
      "Acid loves acid. If your dish has lemon, tomato, or vinegar, choose a wine with bright acidity like Sauvignon Blanc, dry Riesling, or Pinot Noir.",
      "When in doubt, pick one of two paths: a crisp white for contrast, or a soft red for harmony. Both can be right.",
    ],
  },
  {
    slug: "how-the-club-works",
    title: "How the Wine Club works",
    excerpt:
      "Quarterly shipments, flexible membership, and what to expect in each curated drop.",
    date: "2026-01-11",
    content: [
      "The club ships quarterly and each release is curated around a theme. You will see new producers, seasonal styles, and a mix of familiar and new regions.",
      "Membership is flexible. You can skip a shipment, update your preferences, or switch tiers whenever your calendar changes.",
      "Every delivery includes clear tasting notes and pairing ideas so you can enjoy the bottles without a lot of research.",
    ],
  },
  {
    slug: "winter-reds-guide",
    title: "Winter reds that feel like a warm fire",
    excerpt:
      "From spicy Syrah to plush Tempranillo, a cozy red lineup with serving tips and budget picks.",
    date: "2026-01-12",
    content: [
      "Winter calls for reds with depth and warmth. Look for Syrah, Grenache blends, and Tempranillo for a balance of spice and fruit.",
      "Serve reds a touch cooler than room temperature. A quick 10 minute chill keeps flavors fresh and avoids heavy alcohol burn.",
      "Value regions like Washington, Languedoc, and Rioja offer cozy reds without the high price tags of famous appellations.",
    ],
  },
  {
    slug: "budget-bottles-under-25",
    title: "12 bottle picks under $25",
    excerpt:
      "A practical list of weeknight-friendly wines, how to spot value regions, and smart labels.",
    date: "2026-01-12",
    content: [
      "Great wine under $25 is about smart sourcing. Look for regions with high quality and lower land costs like Portugal, Chile, and southern Italy.",
      "Check the back label for producer bottlings and specific regions. Those usually signal more care than generic blends.",
      "Keep a short list of reliable styles for weeknights: dry Riesling, Cotes du Rhone, and Garnacha from Spain are consistent winners.",
    ],
  },
  {
    slug: "tasting-notes-101",
    title: "Tasting notes 101: what those words mean",
    excerpt:
      "Decode descriptors like minerality, tannin, and bright fruit with easy examples.",
    date: "2026-01-13",
    content: [
      "Tasting notes are just shortcuts. Minerality can feel like wet stone or chalk. Tannin is the drying grip you feel from black tea or cocoa.",
      "Bright fruit usually means high acidity and crisp flavors like cranberry, cherry, or green apple. Ripe fruit is softer and rounder.",
      "Use notes as a guide, not a test. If you taste something different, you are still right.",
    ],
  },
  {
    slug: "weekend-hosting-wines",
    title: "Weekend hosting wines for any crowd",
    excerpt:
      "Easy-drinking crowd pleasers, glassware tips, and how much to buy per guest.",
    date: "2026-01-13",
    content: [
      "For a crowd, pick wines that are friendly and flexible. A dry sparkling, a crisp white, and a medium red cover most tastes.",
      "Plan for half a bottle per person if wine is the main beverage. If there are cocktails or beer too, a third of a bottle is usually enough.",
      "Do not stress about glassware. One all purpose wine glass works for both red and white and keeps hosting simple.",
    ],
  },
  {
    slug: "sparkling-beyond-celebrations",
    title: "Sparkling wine beyond celebrations",
    excerpt:
      "Brunch pairings, low-sugar options, and mid-week sparkling picks that feel special.",
    date: "2026-01-14",
    content: [
      "Sparkling wine is a great everyday option. It cuts through rich foods and lifts lighter dishes like salads and seafood.",
      "Look for Brut or Extra Brut for lower sugar. Cava, Cremant, and many Proseccos can be excellent values.",
      "Keep a bottle chilled and ready. Sparkling adds a little lift to weeknight dinners without much effort.",
    ],
  },
  {
    slug: "sustainable-wine-labels",
    title: "A practical guide to sustainable wine labels",
    excerpt:
      "Organic, biodynamic, and sustainable wine terms explained with how they impact flavor.",
    date: "2026-01-14",
    content: [
      "Organic usually means no synthetic pesticides in the vineyard. Biodynamic adds farm wide practices and a focus on soil health.",
      "Sustainable is broader. It can include water use, labor practices, and energy, not just farming inputs.",
      "Flavor impact varies by producer more than label. Use certifications as a signal of intent, then judge by taste.",
    ],
  },
];

export const getPostBySlug = (slug: string) =>
  posts.find((post) => post.slug === slug);
