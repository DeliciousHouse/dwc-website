export type SiteImageId =
  | "logoInverted"
  | "heroVineyard"
  | "storyBarrel"
  | "clubGrapes"
  | "tastingGlasses"
  | "contactVineyard";

export type SiteImage = {
  id: SiteImageId;
  localPath: string; // Public path (served from /public)
  alt: string;
  width: number;
  height: number;
  focalPoint?: { x: number; y: number }; // 0..1
  creditText: string;
  creditUrl: string;
};

export const siteImages: Record<SiteImageId, SiteImage> = {
  logoInverted: {
    id: "logoInverted",
    localPath: "/invert_DW_logo.png",
    alt: "Delicious Wines logo",
    width: 512,
    height: 512,
    creditText: "Delicious Wines",
    creditUrl: "https://github.com/DeliciousHouse/dwc-website",
  },

  heroVineyard: {
    id: "heroVineyard",
    localPath: "/media/stock/hero-vineyard.jpg",
    alt: "Sunlit vineyard rows at golden hour",
    width: 1300,
    height: 867,
    focalPoint: { x: 0.5, y: 0.35 },
    creditText: "Delicious Wines (local stock)",
    creditUrl: "https://github.com/DeliciousHouse/dwc-website",
  },
  storyBarrel: {
    id: "storyBarrel",
    localPath: "/media/stock/story-barrel.jpg",
    alt: "Winery barrel room detail",
    width: 1425,
    height: 1900,
    focalPoint: { x: 0.5, y: 0.5 },
    creditText: "Delicious Wines (local stock)",
    creditUrl: "https://github.com/DeliciousHouse/dwc-website",
  },
  clubGrapes: {
    id: "clubGrapes",
    localPath: "/media/stock/club-grapes.jpg",
    alt: "Grapes on the vine with leaves",
    width: 6000,
    height: 3376,
    focalPoint: { x: 0.45, y: 0.4 },
    creditText: "Delicious Wines (local stock)",
    creditUrl: "https://github.com/DeliciousHouse/dwc-website",
  },
  tastingGlasses: {
    id: "tastingGlasses",
    localPath: "/media/stock/tasting-glasses.jpg",
    alt: "Wine glasses on a tasting table",
    width: 550,
    height: 775,
    creditText: "Delicious Wines (local stock)",
    creditUrl: "https://github.com/DeliciousHouse/dwc-website",
  },
  contactVineyard: {
    id: "contactVineyard",
    localPath: "/media/stock/contact-vineyard.jpg",
    alt: "Vineyard landscape",
    width: 4167,
    height: 3376,
    creditText: "Delicious Wines (local stock)",
    creditUrl: "https://github.com/DeliciousHouse/dwc-website",
  },
};

export function getSiteImage(id: SiteImageId): SiteImage {
  return siteImages[id];
}

