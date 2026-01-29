import { db } from './database';

/**
 * Pre-generated tour content for cultural sites on the itinerary.
 * Used for offline tour guide feature with optional TTS.
 */
export interface TourContent {
  id: string;
  locationId: string;
  title: string;
  titleJapanese?: string;
  type: 'temple' | 'shrine' | 'landmark' | 'museum' | 'city';
  city: string;
  content: string;
  highlights?: string[];
  etiquetteTips?: string[];
}

const TOUR_CONTENT: TourContent[] = [
  // === TOKYO ===
  {
    id: 'tour-senso-ji',
    locationId: 'senso-ji',
    title: 'Sensō-ji Temple',
    titleJapanese: '浅草寺',
    type: 'temple',
    city: 'Tokyo',
    content: `Sensō-ji is Tokyo's oldest temple, founded in 645 AD. Legend says two fishermen found a golden statue of Kannon, the goddess of mercy, in the Sumida River. Unable to return it to the water, they enshrined it here.

The iconic Kaminarimon ("Thunder Gate") with its massive red lantern is one of Japan's most photographed landmarks. The 250-meter Nakamise shopping street leading to the temple has been serving pilgrims for centuries.

The main hall was rebuilt in 1958 after WWII bombing, but maintains its traditional appearance. The five-story pagoda stands 53 meters tall. Incense smoke from the large cauldron is said to have healing properties - waft it over any part of your body needing wellness.

Despite being a Buddhist temple, Sensō-ji harmoniously includes Asakusa Shrine, demonstrating Japan's religious syncretism. The temple hosts spectacular festivals, including Sanja Matsuri in May.`,
    highlights: [
      'Kaminarimon Thunder Gate with its iconic lantern',
      'Nakamise shopping street - 250m of traditional shops',
      'Five-story pagoda visible throughout Asakusa',
      'Incense smoke believed to have healing powers',
    ],
    etiquetteTips: [
      'Bow at the entrance gate',
      'Light incense and waft smoke over yourself',
      'No clapping at Buddhist temples (only at Shinto shrines)',
      'Photos generally okay outside, restricted inside main hall',
    ],
  },
  {
    id: 'tour-meiji-shrine',
    locationId: 'meiji-shrine',
    title: 'Meiji Shrine',
    titleJapanese: '明治神宮',
    type: 'shrine',
    city: 'Tokyo',
    content: `Meiji Shrine is dedicated to Emperor Meiji and Empress Shōken, the leaders who opened Japan to the modern world in the late 1800s. Completed in 1920, it sits within 170 acres of forest - all 120,000 trees donated from across Japan.

Walking through the forested approach feels like entering another world, despite being minutes from Shibuya and Harajuku. The massive torii gates, made from 1,500-year-old cypress trees from Taiwan, mark the transition from urban chaos to sacred space.

The shrine represents Shinto's connection to nature and ancestor veneration. Emperor Meiji's reign (1868-1912) transformed Japan from a feudal society into a modern nation-state while preserving cultural traditions.

At New Year's, Meiji Shrine receives more visitors than any other shrine in Japan - over 3 million people in the first three days alone.`,
    highlights: [
      '170 acres of forest in the heart of Tokyo',
      'Giant torii gates from 1,500-year-old cypress',
      'Sake barrels donated by Japanese breweries',
      'Iris garden (beautiful in June)',
    ],
    etiquetteTips: [
      'Bow before passing through torii gates',
      'Walk on the sides of the path, not the center',
      'At the offering hall: bow twice, clap twice, bow once',
      'Quiet, respectful atmosphere expected',
    ],
  },
  {
    id: 'tour-tokyo-tower',
    locationId: 'tokyo-tower',
    title: 'Tokyo Tower',
    titleJapanese: '東京タワー',
    type: 'landmark',
    city: 'Tokyo',
    content: `Standing 333 meters tall, Tokyo Tower was completed in 1958 and held the record as Japan's tallest structure for over 50 years. Inspired by the Eiffel Tower but 13 meters taller, it symbolized Japan's post-war recovery and technological ambition.

The distinctive orange and white colors aren't just aesthetic - they're required by aviation safety regulations. The tower uses 28,000 liters of paint and requires repainting every 5 years.

Two observation decks offer panoramic views: the Main Deck at 150m and the Top Deck at 250m. On clear days, you can see Mount Fuji in the distance. The tower changes lighting schemes for different seasons and events.

Though newer Tokyo Skytree is now Japan's tallest structure, Tokyo Tower remains beloved as a retro symbol of Japan's economic miracle era.`,
    highlights: [
      '333m tall - 13m taller than the Eiffel Tower',
      'Iconic symbol of post-war Japanese optimism',
      'Two observation decks with city views',
      'Beautiful night illumination',
    ],
  },
  {
    id: 'tour-teamlab-borderless',
    locationId: 'teamlab-borderless',
    title: 'teamLab Borderless',
    titleJapanese: 'チームラボボーダレス',
    type: 'museum',
    city: 'Tokyo',
    content: `teamLab Borderless is an immersive digital art museum where artworks move from room to room, blend with visitors, and respond to touch. There are no maps because the experience is meant to be discovered through wandering.

Created by teamLab, a Japanese collective of artists, programmers, engineers, and designers, the 10,000 square meter space contains over 60 interactive artworks. The pieces "communicate" with each other and react to human presence.

The "Athletics Forest" section encourages physical engagement, while "Future Park" lets visitors become part of collaborative artworks. The EN Tea House serves tea in cups that bloom with digital flowers.

Borderless challenges the boundaries between art and viewer, physical and digital, self and other. It represents Japan's position at the intersection of technology and artistic expression.`,
    highlights: [
      'Over 60 interactive digital artworks',
      'Art that moves, changes, and responds to you',
      'EN Tea House with digital flower tea',
      'Athletics Forest for active exploration',
    ],
    etiquetteTips: [
      'Wear comfortable walking shoes (uneven floors)',
      'Allow 2-3 hours to explore',
      'Photography encouraged, no flash',
      'Some areas may be overwhelming for very young children',
    ],
  },

  // === HAKONE ===
  {
    id: 'tour-hakone-shrine',
    locationId: 'hakone-shrine',
    title: 'Hakone Shrine',
    titleJapanese: '箱根神社',
    type: 'shrine',
    city: 'Hakone',
    content: `Hakone Shrine has stood at the foot of Mount Hakone for over 1,250 years. Founded in 757, it became an important site for samurai who would pray here before battles and give thanks after victories.

The shrine's most famous feature is its red torii gate rising from Lake Ashi, creating one of Japan's most photographed scenes, especially with Mount Fuji in the background on clear days.

The main shrine sits in a thick cedar forest, reached by climbing stone steps. The atmosphere is mystical, with moss-covered stone lanterns and ancient trees creating dappled light.

Three deities are enshrined here: Ninigi-no-Mikoto, Konohanasakuya-hime, and Hikohohodemi-no-Mikoto. The shrine is believed to bring good fortune in relationships, career success, and travel safety.`,
    highlights: [
      'Iconic red torii gate in Lake Ashi',
      'Ancient cedar forest atmosphere',
      'Over 1,250 years of history',
      'Views of Mount Fuji on clear days',
    ],
    etiquetteTips: [
      'Bow at torii gate before entering',
      'Cleanse hands and mouth at the temizuya',
      'Shrine procedure: bow twice, clap twice, bow once',
      'Early morning visits are most peaceful',
    ],
  },
  {
    id: 'tour-owakudani',
    locationId: 'owakudani',
    title: 'Ōwakudani Valley',
    titleJapanese: '大涌谷',
    type: 'landmark',
    city: 'Hakone',
    content: `Ōwakudani, meaning "Great Boiling Valley," was created 3,000 years ago when Mount Hakone erupted. The volcanic activity continues today - steam vents, sulfurous fumes, and bubbling pools create an otherworldly landscape.

The area is famous for kuro-tamago (black eggs), regular eggs boiled in the hot springs. The sulfur turns the shells black, and legend says each egg adds seven years to your life. They taste like regular eggs but are a must-try experience.

The Hakone Ropeway provides stunning aerial views of the valley. On clear days, Mount Fuji dominates the horizon. The stark, barren landscape contrasts dramatically with Hakone's lush forests.

Volcanic gases can occasionally cause trail closures. The visitor center provides updates on conditions and explains the geology.`,
    highlights: [
      'Active volcanic valley with steam vents',
      'Famous black eggs (kuro-tamago)',
      'Ropeway with Mount Fuji views',
      '3,000 years of volcanic history',
    ],
    etiquetteTips: [
      'Check conditions before visiting (volcanic activity varies)',
      'Those with respiratory conditions should be cautious',
      'Stay on marked paths',
      'Try the black eggs - they\'re delicious!',
    ],
  },

  // === KYOTO ===
  {
    id: 'tour-kinkaku-ji',
    locationId: 'kinkaku-ji',
    title: 'Kinkaku-ji (Golden Pavilion)',
    titleJapanese: '金閣寺',
    type: 'temple',
    city: 'Kyoto',
    content: `Kinkaku-ji, the Temple of the Golden Pavilion, is one of Japan's most iconic images. The top two floors are completely covered in gold leaf, creating a stunning reflection in the surrounding pond.

Originally built in 1397 as a retirement villa for Shogun Ashikaga Yoshimitsu, it was converted to a Zen temple after his death. The current structure dates from 1955, rebuilt after a young monk set fire to the original in 1950 - an event that inspired Yukio Mishima's famous novel "The Temple of the Golden Pavilion."

Each floor represents a different architectural style: the first floor is Shinden style (palace), the second is Buke style (samurai), and the third is Chinese Zen style. A golden phoenix adorns the roof.

The surrounding garden is a masterpiece of Muromachi period design, with carefully placed rocks, islands, and plants meant to represent paradise.`,
    highlights: [
      'Gold leaf covering the top two floors',
      'Perfect reflection in Mirror Pond',
      'Garden designed to represent paradise',
      'Phoenix statue atop the roof',
    ],
    etiquetteTips: [
      'One-way walking route - follow the flow',
      'Best photos in morning or late afternoon',
      'Cannot enter the pavilion, viewing from outside only',
      'Temple grounds are wheelchair accessible',
    ],
  },
  {
    id: 'tour-fushimi-inari',
    locationId: 'fushimi-inari',
    title: 'Fushimi Inari Taisha',
    titleJapanese: '伏見稲荷大社',
    type: 'shrine',
    city: 'Kyoto',
    content: `Fushimi Inari Taisha is the head shrine of 30,000 Inari shrines across Japan. Founded in 711, it's dedicated to Inari, the Shinto god of rice, sake, and business prosperity.

The shrine is famous for its thousands of vermillion torii gates, creating tunnels that wind 4 kilometers up Mount Inari. These gates are donated by businesses and individuals seeking Inari's blessings - you'll see company names and dates inscribed on each one.

Fox statues guard the shrine - foxes are considered Inari's messengers. You'll see them holding keys (to rice granaries), jewels (symbolic wishes), scrolls, and rice sheaves.

The full hike to the summit takes 2-3 hours, but you can turn around at any point. The higher you climb, the fewer crowds you'll encounter. At the top, small shrines and rest stops with snacks reward dedicated climbers.`,
    highlights: [
      'Thousands of vermillion torii gates',
      'Fox statues as divine messengers',
      'Open 24 hours (magical at night)',
      'Mountain trail with mini-shrines',
    ],
    etiquetteTips: [
      'Wear comfortable walking shoes',
      'Stay to the left on busy sections',
      'Morning or dusk visits avoid crowds',
      'Respect the sacred atmosphere',
    ],
  },
  {
    id: 'tour-arashiyama-bamboo',
    locationId: 'arashiyama-bamboo',
    title: 'Arashiyama Bamboo Grove',
    titleJapanese: '嵐山竹林',
    type: 'landmark',
    city: 'Kyoto',
    content: `The Arashiyama Bamboo Grove is one of Kyoto's most otherworldly experiences. Towering bamboo stalks create a canopy that filters sunlight into an ethereal green glow, while the sound of swaying bamboo creates a natural melody.

The main path runs about 400 meters from Tenryū-ji Temple to Ōkōchi Sansō Villa. Japanese bamboo (madake) can grow over 20 meters tall and spread rapidly through underground rhizomes.

Historically, bamboo was essential to Japanese life - used for everything from tea whisks to building materials. Arashiyama's grove has been celebrated in literature and art for centuries.

The area is part of a larger district including the Togetsukyo Bridge, monkey park, and historic temples. The bamboo grove is particularly magical in early morning before crowds arrive, or during the December illumination events.`,
    highlights: [
      'Towering bamboo creating green-filtered light',
      'Sound of wind through bamboo',
      'Connected to Tenryū-ji Temple',
      'December illumination events',
    ],
    etiquetteTips: [
      'Visit at dawn for fewer crowds',
      'Stay on the path - bamboo is fragile',
      'Photography allowed, tripods discouraged when busy',
      'Connected to larger Arashiyama district',
    ],
  },
  {
    id: 'tour-gion',
    locationId: 'gion',
    title: 'Gion District',
    titleJapanese: '祇園',
    type: 'landmark',
    city: 'Kyoto',
    content: `Gion is Kyoto's most famous geisha district, where traditional wooden machiya townhouses line atmospheric streets. In the evening, you might glimpse maiko (apprentice geisha) and geiko (full geisha) hurrying to engagements.

The district grew around Yasaka Shrine in the 17th century, catering to travelers and pilgrims. Today, it preserves the atmosphere of old Kyoto with tea houses, traditional restaurants, and exclusive ochaya (geisha houses).

Hanami-koji Street is the main thoroughfare, lined with traditional establishments. The surrounding backstreets reveal hidden temples, shops selling traditional crafts, and centuries-old businesses.

Geisha culture is often misunderstood - geiko are highly trained traditional entertainers skilled in dance, music, conversation, and hosting. The training takes years, and their art form is considered a living treasure.`,
    highlights: [
      'Traditional machiya townhouses',
      'Possible geisha sightings in evening',
      'Yasaka Shrine at the district\'s heart',
      'Atmospheric backstreets and tea houses',
    ],
    etiquetteTips: [
      'Never block or chase geisha for photos',
      'Some private streets prohibit photography',
      'Respect residents and businesses',
      'Evening visits offer best atmosphere',
    ],
  },

  // === OSAKA ===
  {
    id: 'tour-osaka-castle',
    locationId: 'osaka-castle',
    title: 'Osaka Castle',
    titleJapanese: '大阪城',
    type: 'landmark',
    city: 'Osaka',
    content: `Osaka Castle played a crucial role in Japan's unification in the 16th century. Built by Toyotomi Hideyoshi in 1583, it was once the largest castle in Japan, symbolizing his power and ambition.

The current tower is a 1931 concrete reconstruction, though it houses an excellent museum tracing Japanese history and Hideyoshi's rise from peasant to ruler. The observation deck offers panoramic city views.

The castle grounds span over 60,000 square meters, surrounded by imposing stone walls and moats. Some stone walls feature massive boulders transported from distant quarries - a display of Hideyoshi's resources.

Spring brings over 3,000 cherry trees into bloom, making the castle one of Osaka's best hanami spots. The grounds are perfect for picnics and leisurely walks year-round.`,
    highlights: [
      'Impressive stone walls and moats',
      'Museum of Japanese history inside',
      'Observation deck with city views',
      'Beautiful cherry blossoms in spring',
    ],
  },
  {
    id: 'tour-dotonbori',
    locationId: 'dotonbori',
    title: 'Dōtonbori',
    titleJapanese: '道頓堀',
    type: 'landmark',
    city: 'Osaka',
    content: `Dōtonbori is the pulsing heart of Osaka's food and entertainment scene. The canal-side district explodes with neon signs, giant 3D billboards (the Glico running man is iconic), and the aromas of street food.

"Kuidaore" (eat until you drop) is Osaka's food philosophy, and nowhere embodies it better than Dōtonbori. Must-tries include takoyaki (octopus balls), okonomiyaki (savory pancakes), and kushikatsu (deep-fried skewers).

The area has been an entertainment district since the 1600s, originally centered on kabuki theaters. Today, restaurants, bars, and attractions line both sides of the canal, with pedestrian bridges offering prime photo spots.

Locals eat standing or walking, calling orders back and forth with friendly vendors. The energy is contagious - Dōtonbori captures Osaka's reputation as Japan's most outgoing, food-obsessed city.`,
    highlights: [
      'Glico running man sign',
      'Street food paradise (takoyaki, okonomiyaki)',
      'Neon-lit canal views',
      'Embodiment of Osaka\'s kuidaore culture',
    ],
    etiquetteTips: [
      'Try multiple small portions',
      'Eating while walking is acceptable here',
      'Evening visits are most atmospheric',
      'Some restaurants have English menus',
    ],
  },

  // === CITY OVERVIEWS ===
  {
    id: 'tour-city-tokyo',
    locationId: 'city-tokyo',
    title: 'About Tokyo',
    titleJapanese: '東京',
    type: 'city',
    city: 'Tokyo',
    content: `Tokyo is one of the world's most dynamic cities, home to over 13 million people in the city proper and 37 million in the greater metropolitan area. It seamlessly blends ultra-modern skyscrapers with serene temples and traditional neighborhoods.

The city was formerly known as Edo, capital of the Tokugawa shogunate for 265 years. When Emperor Meiji moved here in 1868, it was renamed Tokyo ("Eastern Capital"). Despite earthquakes, fires, and WWII bombing, Tokyo has continuously reinvented itself.

Each neighborhood has its own character: Shibuya's youth culture, Shinjuku's towers and nightlife, Asakusa's old-town charm, Ginza's luxury shopping, and Akihabara's electronics and anime. The world's busiest train system connects it all.

Tokyo consistently ranks among the world's best cities for food, with more Michelin stars than any other city. From ¥200 ramen to high-end kaiseki, the quality at every price point is exceptional.`,
    highlights: [
      'World\'s largest metropolitan area',
      'Incredible food at every price point',
      'Efficient and extensive transit system',
      'Unique blend of traditional and cutting-edge',
    ],
  },
  {
    id: 'tour-city-hakone',
    locationId: 'city-hakone',
    title: 'About Hakone',
    titleJapanese: '箱根',
    type: 'city',
    city: 'Hakone',
    content: `Hakone has been a resort destination for centuries, prized for its hot springs, mountain scenery, and views of Mount Fuji. Located just 90 minutes from Tokyo, it offers a complete change of pace from the capital.

The area sits within the collapsed caldera of an ancient volcano. This geology creates the hot springs (onsen) for which Hakone is famous - there are 17 different hot spring sources with varying mineral compositions.

Traditional ryokan inns offer the quintessential Japanese experience: tatami rooms, futon beds, multi-course kaiseki dinners, and the ritual of the hot spring bath. The Yoshimatsu Ryokan where you're staying is one of these treasured establishments.

The Hakone Free Pass allows unlimited use of trains, buses, boats, and ropeways - a fun way to experience Lake Ashi, the Hakone Ropeway, and the volcanic Ōwakudani valley.`,
    highlights: [
      '17 different hot spring sources',
      'Mount Fuji views on clear days',
      'Traditional ryokan experience',
      'Easy day trip or overnight from Tokyo',
    ],
  },
  {
    id: 'tour-city-kyoto',
    locationId: 'city-kyoto',
    title: 'About Kyoto',
    titleJapanese: '京都',
    type: 'city',
    city: 'Kyoto',
    content: `Kyoto was Japan's capital for over 1,000 years (794-1868) and remains the country's cultural heart. With 17 UNESCO World Heritage Sites, 2,000 temples, and countless traditional arts, Kyoto preserves living history.

Unlike most Japanese cities, Kyoto was largely spared from WWII bombing - reportedly removed from the atomic bomb target list due to its cultural significance. This preservation makes it unique in showing pre-war Japanese urban landscape.

The city is organized in a grid pattern modeled on ancient Chinese capitals. Traditional neighborhoods like Gion, Higashiyama, and Arashiyama feel transported from the Edo period.

Kyoto remains the center of traditional Japanese arts: tea ceremony, ikebana (flower arranging), textile arts like Nishijin weaving, and traditional crafts. Many craft families have practiced their arts for generations.`,
    highlights: [
      '1,000+ years as Japan\'s capital',
      '17 UNESCO World Heritage Sites',
      'Center of traditional Japanese arts',
      'Historic neighborhoods preserved intact',
    ],
  },
  {
    id: 'tour-city-osaka',
    locationId: 'city-osaka',
    title: 'About Osaka',
    titleJapanese: '大阪',
    type: 'city',
    city: 'Osaka',
    content: `Osaka is Japan's third-largest city and its culinary capital. The local saying "kuidaore" (eat until you drop) captures the city's food obsession. Osakans are known for being more direct, humorous, and outgoing than residents of other Japanese cities.

Historically, Osaka was Japan's merchant capital while Kyoto housed the emperor and Tokyo the shogun. This commercial heritage created a practical, down-to-earth culture that persists today.

The city is famous for street foods: takoyaki (octopus balls), okonomiyaki (savory pancakes), kushikatsu (deep-fried skewers), and countless others. Portions are generous, prices are reasonable, and quality is exceptional.

Osaka Castle anchors the city historically, while modern districts like Dōtonbori and Shinsekai offer vibrant nightlife. The Universal Studios theme park draws visitors from across Asia.`,
    highlights: [
      'Japan\'s food capital (kuidaore culture)',
      'Friendly, outgoing local character',
      'Great value dining',
      'Vibrant nightlife and entertainment',
    ],
  },
];

/**
 * Seed the database with tour content
 */
export async function seedTourContent(): Promise<void> {
  console.log('[Tour Content] Seeding tour guide content...');

  const now = new Date().toISOString();

  for (const tour of TOUR_CONTENT) {
    await db.aiCache.put({
      id: tour.id,
      contextType: 'tour',
      contextKey: tour.locationId,
      questionPattern: tour.title,
      response: JSON.stringify({
        title: tour.title,
        titleJapanese: tour.titleJapanese,
        type: tour.type,
        city: tour.city,
        content: tour.content,
        highlights: tour.highlights,
        etiquetteTips: tour.etiquetteTips,
      }),
      createdAt: now,
    });
  }

  console.log(`[Tour Content] Seeded ${TOUR_CONTENT.length} tour entries`);
}

/**
 * Get tour content for a location
 */
export function getTourContent(locationId: string): TourContent | null {
  const tour = TOUR_CONTENT.find((t) => t.locationId === locationId);
  return tour ?? null;
}

/**
 * Get city overview
 */
export function getCityOverview(city: string): TourContent | null {
  const cityId = `city-${city.toLowerCase()}`;
  return TOUR_CONTENT.find((t) => t.locationId === cityId) ?? null;
}

/**
 * Get all tour content for a city
 */
export function getTourContentByCity(city: string): TourContent[] {
  return TOUR_CONTENT.filter(
    (t) => t.city.toLowerCase() === city.toLowerCase() && t.type !== 'city'
  );
}

/**
 * Get all available tour content location IDs
 */
export function getAllTourLocationIds(): string[] {
  return TOUR_CONTENT.map((t) => t.locationId);
}
