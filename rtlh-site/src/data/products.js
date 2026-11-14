/* =======================================================================
   RTLH PRODUCT CATALOG — the only file you need for day-to-day edits
   =======================================================================

   • CHANGE A PRICE ........ edit  price: 45          (AED, what the customer pays)
   • ENGRAVING SURCHARGE ... edit  textPrice / picturePrice inside personalise
                             (0 = engraving included in the price)
   • RENAME A PRODUCT ...... edit  name: "..."
   • HIDE A PRODUCT ........ set   hidden: true
   • HIDE ONE COLOR ........ add   hidden: true   inside that color's { }
   • BADGE ................. badge: "Bestseller"  or  badge: "New"  (or remove)
   • ADD A COLOR ........... 1) upload the photo to rtlh-site/assets-src/products/
                                (e.g. MagsafeMint.jpg)
                             2) add  { id: "mint", image: "MagsafeMint" },
                             3) add the color to COLORS below if it's new
   • TURN OFF TEXT ......... personalise: { text: false, ... }
   • TURN OFF PICTURES ..... personalise: { picture: false, ... }

   Gallery pictures: upload 101.jpg, 102.jpg … to rtlh-site/assets-src/gallery/
   — they show up in the picture chooser automatically.

   Keep the commas and quotation marks. After editing, commit — the site
   rebuilds itself in ~2 minutes. Checkout ALWAYS uses these prices (the
   payment server reads them from rtlh.art/catalog.json), so a customer can
   never change a price in their browser.
   ======================================================================= */

/* Color id: [name shown on site, swatch color] */
export const COLORS = {
  black: ["Black", "#1C1A18"],
  blue: ["Blue", "#3C5A73"],
  brown: ["Brown", "#6B4A34"],
  green: ["Green", "#3F5A4C"],
  navy: ["Navy", "#232C3E"],
  pink: ["Pink", "#E3AAB8"],
  red: ["Red", "#8E2F2F"],
  white: ["White", "#EFEAE0"],
  gray: ["Gray", "#8A867E"],
  gold: ["Gold", "#B99456"],
  silver: ["Silver", "#B9BAB6"],
  natural: ["Natural", "#D8CBB4"],
  mint: ["Mint", "#AFC7BC"],
  cream: ["Cream", "#E9DFC9"],
  burgundy: ["Burgundy", "#5E1F2E"],
  teal: ["Teal", "#6E97A0"],
  rose: ["Rose", "#B76E79"],
  lightblue: ["Light Blue", "#A9C6DE"],
  darkblue: ["Dark Blue", "#1F3A5F"],
  maroon: ["Maroon", "#5A1F28"],
  berry: ["Berry", "#8A2E5C"],
  crimson: ["Crimson", "#A3202E"],
  desertgold: ["Desert Gold", "#C8A15E"],
  lavender: ["Lavender", "#B9A7D6"],
  lemon: ["Lemon", "#EAD84A"],
  lightbrown: ["Light Brown", "#A57C5B"],
  lightpink: ["Light Pink", "#F0CFD6"],
  orange: ["Orange", "#D9822B"],
  purple: ["Purple", "#6B4C8A"],
  rosegold: ["Rose Gold", "#C48A86"],
  yellow: ["Yellow", "#E3B93C"],
  beige: ["Beige", "#D9C7A8"],
  cherry: ["Cherry", "#A2152B"],
  gravel: ["Gravel", "#8D8A85"],
  navyblue: ["Navy Blue", "#1F2A44"],
  newblue: ["Blue", "#2F6FB5"],
  titaniumgray: ["Titanium Gray", "#7E8083"],
  wine: ["Wine", "#6B1F2F"],
};

/* Fonts the customer can choose for text engraving. Remove a line to stop offering it. */
export const FONTS = [
  { id: "classic", label: "Classic", css: "'Cormorant Garamond', serif", sample: "Aa" },
  { id: "script", label: "Script", css: "'Great Vibes', cursive", sample: "Aa" },
  { id: "modern", label: "Modern", css: "'Manrope', sans-serif", sample: "AA", upper: true },
  { id: "arabic", label: "Arabic", css: "'Amiri', serif", sample: "أ", arabic: true },
];

export const ALL_PRODUCTS = [
  {
    slug: "the-porte", name: "The Porte", badge: "Bestseller",
    adminName: "MagSafe",           // name used in your RTLH Admin app
    hidden: false,
    category: "Tech", price: 75,
    short: "MagSafe card holder, engraved on the back.",
    description: "A leather MagSafe card holder for the essentials — cards, cash, and a name engraved quietly into the back.",
    details: ["Snaps onto the back of a MagSafe iPhone", "Cards and cash", "Text or picture engraving"],
    mainImage: "MagsafeMain",
    colors: [
      { id: "navy", image: "MagsafeNavy" },
      { id: "green", image: "MagsafeGreen" },
      { id: "pink", image: "MagsafePink" },
      { id: "berry", image: "MagsafeBerry" },
      { id: "black", image: "MagsafeBlack" },
      { id: "crimson", image: "MagsafeCrimson" },
      { id: "desertgold", image: "MagsafeDesertGold" },
      { id: "gray", image: "MagsafeGray" },
      { id: "lavender", image: "MagsafeLavender" },
      { id: "lemon", image: "MagsafeLemon" },
      { id: "lightblue", image: "MagsafeLightBlue" },
      { id: "lightbrown", image: "MagsafeLightBrown" },
      { id: "lightpink", image: "MagsafeLightPink" },
      { id: "orange", image: "MagsafeOrange" },
      { id: "purple", image: "MagsafePurple" },
      { id: "red", image: "MagsafeRed" },
      { id: "rosegold", image: "MagsafeRoseGold" },
      { id: "silver", image: "MagsafeSilver" },
      { id: "white", image: "MagsafeWhite" },
      { id: "yellow", image: "MagsafeYellow" },
    ],
    personalise: { text: true, maxChars: 16, picture: true, textPrice: 0, picturePrice: 0 },
  },
  {
    slug: "magsafe-with-stand", name: "MagSafe With Stand", badge: "New",
    adminName: "MagSafe With Stand",
    hidden: false,
    category: "Tech", price: 95,
    short: "MagSafe card holder with a fold-out stand.",
    description: "A leather MagSafe card holder with a built-in foldable stand — carry your cards, and prop up your phone wherever you are.",
    details: ["MagSafe card holder", "Built-in foldable stand", "Text or picture engraving"],
    mainImage: "MagfoldMain",
    colors: [
      { id: "brown", image: "MagfoldBrown" },
      { id: "crimson", image: "MagfoldCrimson" },
      { id: "lightpink", image: "MagfoldLightPink" },
      { id: "navyblue", image: "MagfoldNavyblue" },
      { id: "newblue", image: "MagfoldNewblue" },
      { id: "titaniumgray", image: "MagfoldTitaniumgray" },
      { id: "white", image: "MagfoldWhite" },
      { id: "wine", image: "MagfoldWine" },
    ],
    personalise: { text: true, maxChars: 16, picture: true, textPrice: 0, picturePrice: 0 },
  },
  {
    slug: "the-heartpiece", name: "The Heartpiece", badge: "Bestseller",
    hidden: false,
    category: "Charms", price: 45,
    short: "Heart bag charm on a long leather strap.",
    description: "A heart-shaped bag charm on a long leather strap — engraved to hold a name, a date, or a quiet inside joke.",
    details: ["Leather heart on a long strap", "Eight colours", "Text or picture engraving"],
    mainImage: "TheHeartpieceMain",
    colors: [
      { id: "black", image: "TheHeartpieceBlack" },
      { id: "blue", image: "TheHeartpieceBlue" },
      { id: "brown", image: "TheHeartpieceBrown" },
      { id: "green", image: "TheHeartpieceGreen" },
      { id: "navy", image: "TheHeartpieceNavy" },
      { id: "pink", image: "TheHeartpiecePink" },
      { id: "red", image: "TheHeartpieceRed" },
      { id: "gray", image: "TheHeartpieceGray" },
    ],
    personalise: { text: true, maxChars: 24, picture: true, textPrice: 0, picturePrice: 0 },
  },
  {
    slug: "the-heart-mirror", name: "The Heart Mirror",
    hidden: false,
    category: "Vanity", price: 45,
    short: "Heart-shaped compact mirror in soft leather.",
    description: "The heart silhouette, reimagined as a compact mirror. Soft edges, a warm leather base, and room for an engraved line.",
    details: ["Compact heart mirror", "Leather back with pull tab", "Text or picture engraving"],
    mainImage: "HeartMirrorMain",
    colors: [
      { id: "mint", image: "HeartMirrorBlue" },
      { id: "pink", image: "HeartMirrorPink" },
      { id: "red", image: "HeartMirrorRed" },
      { id: "cream", image: "HeartMirrorWhite" },
    ],
    personalise: { text: true, maxChars: 18, picture: true, textPrice: 0, picturePrice: 0 },
  },
  {
    slug: "the-foldable-mirror", name: "The Foldable Mirror",
    hidden: false,
    category: "Vanity", price: 40,
    short: "Stand-up travel mirror with a leather cover.",
    description: "A stand-up travel mirror in soft leather, engraved on the cover — a small ceremony for an everyday object.",
    details: ["Stand-up travel mirror", "Soft leather cover", "Text or picture engraving"],
    mainImage: "FoldableMirrorMain",
    colors: [
      { id: "mint", image: "FoldableMirrorGreen", },
      { id: "pink", image: "FoldableMirrorPink", },
      { id: "white", image: "FoldableMirrorWhite", },
    ],
    personalise: { text: true, maxChars: 20, picture: true, textPrice: 0, picturePrice: 0 },
  },
  {
    slug: "the-voyage-tag", name: "The Voyage Tag",
    hidden: false,
    category: "Travel", price: 45,
    short: "Full-grain leather bag tag, engraved with initials.",
    description: "Full-grain leather, engraved with initials — a quiet marker of where a journey belongs.",
    details: ["Full-grain leather", "Initials or a short name", "Text or picture engraving"],
    mainImage: "TheVoyageTagMain",
    colors: [
      { id: "blue", image: "TheVoyageTagBlue" },
      { id: "brown", image: "TheVoyageTagBrown" },
      { id: "pink", image: "TheVoyageTagPink" },
      { id: "red", image: "TheVoyageTagRed" },
      { id: "white", image: "TheVoyageTagWhite" },
    ],
    personalise: { text: true, maxChars: 22, picture: true, textPrice: 0, picturePrice: 0 },
  },
  {
    slug: "the-heart-necklace", name: "The Heart Necklace",
    adminName: "The Necklace",
    hidden: false,
    category: "Jewelry", price: 110,
    short: "Gold heart pendant, engraved with one initial.",
    description: "A delicate gold heart pendant on a fine chain — the smallest gesture, made to be worn every day.",
    details: ["Gold heart pendant", "Fine chain", "One engraved initial"],
    mainImage: "NecklaceMain",
    colors: [{ id: "gold", image: "NecklaceMain" }],
    gallery: ["Necklace1", "Necklace2"],
    personalise: { text: true, maxChars: 1, picture: true, textPrice: 0, picturePrice: 0 },
  },
  {
    slug: "the-card-holder", name: "The Card Holder",
    adminName: "RTLH Card Holder",
    hidden: false,
    category: "Leather Goods", price: 180,
    short: "Slim four-slot saffiano card holder.",
    description: "A slim, four-slot card holder in saffiano leather, personalized with initials where the hand naturally rests.",
    details: ["Saffiano leather", "Four card slots", "Text or picture engraving"],
    mainImage: "RTLHCardHolderMain",
    colors: [
      { id: "black", image: "RTLHCardHolderBlack" },
      { id: "burgundy", image: "RTLHCardHolderBurgendy" },
      { id: "gray", image: "RTLHCardHolderGray" },
      { id: "navy", image: "RTLHCardHolderNavy" },
    ],
    gallery: ["RTLHWallet"],
    personalise: { text: true, maxChars: 20, picture: true, textPrice: 0, picturePrice: 0 },
  },
  {
    // Photos "Cardholder*.png". Hidden until you set the real name, price and description.
    slug: "the-cardholder", name: "The Cardholder",
    adminName: "The Cardholder",
    hidden: true,
    category: "Leather Goods", price: 0,           // <-- SET PRICE
    short: "Leather card holder.",
    description: "A leather card holder, personalized with your initials.",   // <-- EDIT
    details: ["Leather card holder", "Text or picture engraving"],
    mainImage: "CardholderMain",
    colors: [
      { id: "beige", image: "CardholderBeige" },
      { id: "blue", image: "CardholderBlue" },
      { id: "pink", image: "CardholderPink" },
    ],
    personalise: { text: true, maxChars: 20, picture: true, textPrice: 0, picturePrice: 0 },
  },
];

/* ----------------------------------------------------------------------
   Nothing below needs editing.
   ---------------------------------------------------------------------- */
export const PRODUCTS = ALL_PRODUCTS
  .filter((p) => !p.hidden && p.price > 0)
  .map((p) => ({ ...p, colors: p.colors.filter((c) => !c.hidden) }))
  .filter((p) => p.colors.length > 0);

export const CATEGORIES = Array.from(new Set(PRODUCTS.map((p) => p.category)));

export const colorName = (id) => (COLORS[id] ? COLORS[id][0] : id);
export const colorHex = (id) => (COLORS[id] ? COLORS[id][1] : "#ccc");
export const findProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);

/** Price of one unit with the chosen personalisation. */
export function unitPrice(product, mode) {
  const p = product.personalise || {};
  if (mode === "text") return product.price + (p.textPrice || 0);
  if (mode === "photo") return product.price + (p.picturePrice || 0);
  return product.price;
}

/** True while no product charges extra for engraving (used for "free engraving" wording). */
export const ENGRAVING_FREE = PRODUCTS.every((p) => !p.personalise?.textPrice && !p.personalise?.picturePrice);
