import { PrismaClient, PriceRange, RestaurantStatus } from "@prisma/client";

const prisma = new PrismaClient();

const restaurants = [
  {
    slug: "franklin-barbecue",
    name: "Franklin Barbecue",
    description:
      "The pilgrimage every brisket lover eventually makes. Aaron Franklin's post-oak-smoked brisket is the gold standard — peppery bark, rendered fat, and a line that starts before dawn.",
    address: "900 E 11th St, Austin, TX 78702",
    neighborhood: "East Austin",
    lat: 30.2701,
    lng: -97.7312,
    phone: "(512) 653-1187",
    website: "https://franklinbbq.com",
    priceRange: PriceRange.THREE,
    hours: {
      mon: null,
      tue: { open: "11:00", close: "15:00" },
      wed: { open: "11:00", close: "15:00" },
      thu: { open: "11:00", close: "15:00" },
      fri: { open: "11:00", close: "15:00" },
      sat: { open: "11:00", close: "15:00" },
      sun: { open: "11:00", close: "15:00" },
    },
    specialties: ["brisket", "pork ribs", "sausage", "turkey"],
    amenities: ["patio", "takeout"],
    featured: true,
  },
  {
    slug: "la-barbecue",
    name: "la Barbecue",
    description:
      "Beef ribs the size of your forearm and some of the best brisket in town, run by pitmaster LeAnn Mueller. A cold beer and a picnic table complete the experience.",
    address: "2027 E Cesar Chavez St, Austin, TX 78702",
    neighborhood: "East Austin",
    lat: 30.2554,
    lng: -97.7213,
    phone: "(512) 605-9696",
    website: "https://labarbecue.com",
    priceRange: PriceRange.THREE,
    hours: {
      mon: null,
      tue: null,
      wed: { open: "11:00", close: "18:00" },
      thu: { open: "11:00", close: "18:00" },
      fri: { open: "11:00", close: "18:00" },
      sat: { open: "11:00", close: "18:00" },
      sun: { open: "11:00", close: "18:00" },
    },
    specialties: ["beef ribs", "brisket", "sausage"],
    amenities: ["patio", "byob", "takeout"],
    featured: true,
  },
  {
    slug: "terry-blacks-barbecue",
    name: "Terry Black's Barbecue",
    description:
      "A sprawling Barton Springs Road institution serving Central Texas classics by the pound. No line-at-dawn required — walk in and load a tray with brisket, ribs, and sides.",
    address: "1003 Barton Springs Rd, Austin, TX 78704",
    neighborhood: "South Austin",
    lat: 30.2596,
    lng: -97.7559,
    phone: "(512) 394-5899",
    website: "https://terryblacksbbq.com",
    priceRange: PriceRange.THREE,
    hours: {
      mon: { open: "11:00", close: "21:00" },
      tue: { open: "11:00", close: "21:00" },
      wed: { open: "11:00", close: "21:00" },
      thu: { open: "11:00", close: "21:00" },
      fri: { open: "11:00", close: "21:00" },
      sat: { open: "11:00", close: "21:00" },
      sun: { open: "11:00", close: "21:00" },
    },
    specialties: ["brisket", "pork ribs", "beef ribs", "sausage"],
    amenities: ["patio", "full-bar", "takeout", "dine-in"],
    featured: true,
  },
  {
    slug: "kg-bbq",
    name: "KG BBQ",
    description:
      "Egyptian-Texan fusion from pitmaster Kareem El-Ghayesh — brisket rubbed with dukkah, boerewors sausage, and smoked-meat hawawshi. One of the most exciting new-school pits in Austin.",
    address: "7301 Burnet Rd, Austin, TX 78757",
    neighborhood: "North Austin",
    website: "https://www.kgbbqatx.com",
    priceRange: PriceRange.TWO,
    hours: {
      mon: null,
      tue: null,
      wed: null,
      thu: { open: "11:00", close: "20:00" },
      fri: { open: "11:00", close: "20:00" },
      sat: { open: "11:00", close: "20:00" },
      sun: { open: "11:00", close: "18:00" },
    },
    specialties: ["brisket", "sausage", "hawawshi"],
    amenities: ["patio", "takeout"],
    featured: false,
  },
  {
    slug: "interstellar-bbq",
    name: "Interstellar BBQ",
    description:
      "John Bates' northwest-Austin spot known for inventive sides (peach-cobbler beans!) and beautifully smoked brisket and pork belly. Weekend-only and worth the drive.",
    address: "12233 RM 620 N, Austin, TX 78750",
    neighborhood: "Northwest Austin",
    website: "https://www.interstellarbbq.com",
    priceRange: PriceRange.THREE,
    hours: {
      mon: null,
      tue: null,
      wed: null,
      thu: { open: "11:00", close: "15:00" },
      fri: { open: "11:00", close: "15:00" },
      sat: { open: "11:00", close: "15:00" },
      sun: { open: "11:00", close: "15:00" },
    },
    specialties: ["brisket", "pork belly", "sausage"],
    amenities: ["takeout", "dine-in"],
    featured: false,
  },
];

async function main() {
  for (const r of restaurants) {
    await prisma.restaurant.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        ...r,
        status: RestaurantStatus.PUBLISHED,
        sourceUrls: [],
      },
    });
  }
  console.log(`Seeded ${restaurants.length} restaurants.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
