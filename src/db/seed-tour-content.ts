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
  audioUrl?: string;
  audioDurationSeconds?: number;
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
    audioUrl: '/audio/tour-senso-ji.mp3',
    audioDurationSeconds: 229,
    content: `Welcome to Sensō-ji, the oldest temple in all of Tokyo. This place has been standing for nearly fourteen hundred years, since the year 645 AD. To put that in perspective, that's more than a thousand years before anyone from Europe had ever set foot in Japan.

The origin story is one of Tokyo's great legends. Two brothers, humble fishermen named Hinokuma Hamanari and Hinokuma Takenari, were casting their nets in the Sumida River one morning when they pulled up something extraordinary: a tiny golden statue of Kannon, the Buddhist goddess of mercy. They tried throwing it back, but every time they cast their nets, the statue returned. The village chief recognized this as a sign, shaved his head, became a monk, and converted his home into a small temple to house the statue. That humble beginning became the magnificent complex you see today.

As you approach, the first thing you'll notice is the Kaminarimon, the Thunder Gate. That enormous red lantern hanging in the center weighs about 700 kilograms, which is roughly the weight of a small car. The lantern is actually collapsible and can be folded up during typhoons. On either side stand two fierce guardian statues: Fujin, the god of wind, on the right, and Raijin, the god of thunder, on the left. They're here to protect the temple, and if you look closely, you might notice they have some pretty wild facial expressions.

Beyond the gate stretches Nakamise-dori, a 250-meter shopping street that has been serving visitors for centuries. This is one of the oldest shopping streets in Japan, and the stalls sell everything from freshly made senbei rice crackers to traditional Japanese fans and beautiful silk pouches. The smell of freshly grilled treats fills the air, so come hungry. Look for the ningyo-yaki, little cakes shaped like temple lanterns and pagodas filled with sweet red bean paste. They're delicious and cost just a few hundred yen.

At the end of Nakamise, you'll pass through the Hozomon gate and enter the temple grounds proper. The five-story pagoda rises 53 meters into the sky and is especially stunning when lit up at night. In front of the main hall sits a large incense cauldron called the jokoro. You'll see people wafting the smoke over their heads and bodies. This is an old tradition: the smoke is believed to have healing properties. If your knees are tired from walking, wave the smoke over them. If you want to feel smarter, wave it over your head. The kids might enjoy this part, turning healing smoke into a little game.

The main hall houses the original golden Kannon statue, though it's kept hidden from public view. In fact, no one has seen the actual statue in centuries, and some historians debate whether it still exists. What you can see inside is beautiful regardless: gold-leaf decorations, hanging lanterns, and the atmosphere of centuries of prayer and devotion.

One fascinating detail about Sensō-ji is that it sits right next to Asakusa Shrine, a Shinto shrine. In most countries, having two different religious buildings side by side might seem unusual, but in Japan this is completely natural. Most Japanese people practice both Buddhism and Shintoism, visiting temples and shrines for different occasions. This peaceful coexistence is one of the beautiful things about Japanese spiritual life.

If you're visiting in March, you're in luck. The temple grounds often have early cherry blossoms, and the area is far less crowded than during peak cherry blossom season in late March and April. The morning light hitting the red-painted buildings is particularly beautiful, and you might catch monks performing their morning rituals before the crowds arrive.`,
    highlights: [
      'Kaminarimon Thunder Gate with its 700-kilogram red lantern',
      'Nakamise-dori - 250m of traditional shops and street snacks',
      'Five-story pagoda, stunning when illuminated at night',
      'Incense cauldron with healing smoke tradition',
      'Nearly 1,400 years of continuous history',
      'Peaceful coexistence of Buddhist temple and Shinto shrine',
    ],
    etiquetteTips: [
      'Bow slightly when passing through the main gates',
      'Light incense and waft smoke over yourself for good health',
      'No clapping at Buddhist temples (clapping is for Shinto shrines only)',
      'Photos are welcome outside but restricted inside the main hall',
      'Remove hats and sunglasses when entering the inner temple',
    ],
  },
  {
    id: 'tour-meiji-shrine',
    locationId: 'meiji-shrine',
    title: 'Meiji Shrine',
    titleJapanese: '明治神宮',
    type: 'shrine',
    city: 'Tokyo',
    audioUrl: '/audio/tour-meiji-shrine.mp3',
    audioDurationSeconds: 196,
    content: `Meiji Shrine is one of those rare places where the center of a gigantic city simply vanishes. Within seconds of passing under the first massive torii gate, the noise of Harajuku and Shibuya fades away, replaced by birdsong and the soft crunch of gravel underfoot. You are standing in a forest of 120,000 trees, and what's remarkable is that every single one of them was planted by hand.

When Emperor Meiji died in 1912, the Japanese people wanted to honor the leader who had transformed their country from an isolated feudal society into a modern world power. Over 100,000 volunteers came from across Japan, each bringing native trees from their home regions. They carefully designed the forest to become self-sustaining, and a century later it thrives without any artificial maintenance. Ecologists study it as one of the world's great examples of a successfully engineered natural ecosystem.

The approach to the shrine takes you down a wide gravel path flanked by towering camphor and cedar trees. Along the way, you'll notice two distinctive displays. On one side, rows of sake barrels wrapped in straw, donated by Japanese breweries from across the country. On the other side, wine barrels from Burgundy, France, a nod to Emperor Meiji's efforts to build bridges between Japan and the West. The emperor was known for his love of both Japanese and Western culture, and these contrasting offerings perfectly capture that duality.

The massive torii gates you pass through are made from 1,500-year-old Japanese cypress trees harvested from forests in Taiwan, which was a Japanese territory during the Meiji era. The current gates are actually replacements; the originals were destroyed by lightning in 1966, and it took years to find cypress trees large enough to replace them.

At the main shrine, you'll find a simple but elegant Shinto worship space. This is where you can try the traditional Shinto prayer ritual: approach the offering box, toss in a coin (five-yen coins are considered lucky because the word for five yen, "go-en," sounds like the word for good fortune), then bow twice deeply, clap your hands twice, make a silent wish, and bow once more.

One thing the kids might enjoy is writing an ema, a small wooden plaque where you can write a wish or prayer. You'll see hundreds of them hanging near the shrine, covered in wishes written in dozens of languages. They come in the shape of a camphor leaf, unique to Meiji Shrine.

If you're visiting in March, keep an eye out for early-blooming plum blossoms in the shrine's inner garden. The garden, which requires a small entrance fee, features an iris garden that Emperor Meiji himself designed for Empress Shoken. While the irises bloom in June, the garden is peaceful and beautiful year-round. You might also spot traditional Shinto weddings taking place on weekends; it's not unusual to see a bride in an elaborate white kimono processing through the shrine grounds.

Meiji Shrine receives more visitors at New Year's than any other shrine in Japan, over three million people in just the first three days. Visiting outside of those peak times, like during your March trip, means you can enjoy the serenity that makes this place so special.`,
    highlights: [
      '170 acres of hand-planted forest in central Tokyo',
      'Giant torii gates from 1,500-year-old cypress trees',
      'Sake barrels and French wine barrels side by side',
      'Ema wish plaques in the shape of camphor leaves',
      'Most visited shrine in Japan at New Year (3 million visitors)',
      'Inner garden designed by Emperor Meiji for the Empress',
    ],
    etiquetteTips: [
      'Bow before passing through torii gates',
      'Walk on the sides of the path, not the center (reserved for the gods)',
      'At the offering hall: bow twice, clap twice, bow once',
      'Quiet, respectful atmosphere expected throughout',
      'Five-yen coins are considered lucky offerings',
    ],
  },
  {
    id: 'tour-tokyo-tower',
    locationId: 'tokyo-tower',
    title: 'Tokyo Tower',
    titleJapanese: '東京タワー',
    type: 'landmark',
    city: 'Tokyo',
    audioUrl: '/audio/tour-tokyo-tower.mp3',
    audioDurationSeconds: 179,
    content: `Standing 333 meters tall and painted in a striking orange-red and white, Tokyo Tower is one of the most recognizable landmarks in the world and a beloved symbol of Japan's postwar miracle. When it was completed in 1958, just thirteen years after the devastation of World War II, it was the tallest freestanding tower on earth. It was built to serve as a broadcast antenna, but it quickly became something much bigger: a symbol of a nation rising from the ashes.

Here's a fun fact: Tokyo Tower was deliberately designed to be 13 meters taller than the Eiffel Tower, which was its direct inspiration. The Japanese engineers wanted to make a statement, and they managed to do it while using only about half the steel. The entire structure weighs 4,000 tons compared to the Eiffel Tower's 7,300 tons, a testament to Japanese engineering efficiency. Some of the steel used in its construction was recycled from American tanks left over from the Korean War, adding another layer to the tower's story of transformation and renewal.

Those distinctive orange-and-white stripes are not just for looks. They're required by Japan's aviation safety regulations to make the tower visible to aircraft. Maintaining that appearance is a monumental task: repainting Tokyo Tower takes about 28,000 liters of paint and a full five years to complete. By the time painters finish at the top, it's almost time to start again at the bottom.

Two observation decks offer panoramic views of the sprawling city below. The Main Deck sits at 150 meters and the Top Deck at 250 meters. On clear winter and early spring days, you have an excellent chance of spotting Mount Fuji to the southwest, its snow-capped peak floating above the urban landscape. March is actually one of the better months for Fuji views, as the crisp air can provide surprisingly good visibility.

At night, Tokyo Tower transforms with seasonal lighting displays. The standard "landmark light" bathes the tower in warm orange using 180 floodlights, while the "diamond veil" uses 276 LED lights to create shimmering color patterns. Special lighting events mark holidays, sports victories, and awareness campaigns.

Though the newer Tokyo Skytree, completed in 2012, now claims the title of Japan's tallest structure at 634 meters, Tokyo Tower holds a special place in Japanese hearts. It's appeared in countless movies, anime, and manga, from Godzilla films to Sailor Moon. For many Japanese people, Tokyo Tower represents not just a building but an entire era of optimism and possibility.

The area around the base, called Foot Town, houses shops, restaurants, and a small aquarium. There's also a shrine on the grounds, because in Japan even a modern steel tower can have a sacred space.`,
    highlights: [
      '333 meters tall, 13 meters taller than the Eiffel Tower',
      'Built from recycled Korean War-era steel in just 18 months',
      'Iconic symbol of Japan\'s postwar economic miracle',
      'Two observation decks with potential Mount Fuji views',
      'Requires 28,000 liters of paint and 5 years to repaint',
      'Stunning seasonal night illumination displays',
    ],
    etiquetteTips: [
      'Early morning visits have shorter queues',
      'Check visibility forecasts for Mount Fuji views',
      'Top Deck requires a separate timed ticket',
      'Photography is encouraged from both observation decks',
    ],
  },
  {
    id: 'tour-teamlab-borderless',
    locationId: 'teamlab-borderless',
    title: 'teamLab Borderless',
    titleJapanese: 'チームラボボーダレス',
    type: 'museum',
    city: 'Tokyo',
    audioUrl: '/audio/tour-teamlab-borderless.mp3',
    audioDurationSeconds: 179,
    content: `teamLab Borderless is unlike any museum you've ever visited. There are no frames on walls, no ropes keeping you at a distance, and no set route to follow. Instead, you walk into a vast dark space where digital art flows around you, over you, and through you. Artworks leave their rooms, merge with works in other rooms, and respond to your presence. It's like stepping inside a living painting.

The museum is the creation of teamLab, a Japanese collective of about 600 people including artists, programmers, engineers, mathematicians, and architects. Founded in 2001, the group explores the intersection of art, technology, and nature, and they have become one of the most influential art collectives in the world. Their philosophy is that there is no boundary between the viewer and the artwork, hence the name "Borderless."

The experience spans over 10,000 square meters of interconnected spaces containing more than 60 individual artworks. Flowers bloom and scatter on walls and floors as you walk past. Schools of digital fish swim around your feet and dart away if you move too quickly. Waterfalls cascade from ceiling to floor and the water appears to flow around objects in its path. At one point, you may find yourself standing in a room where the entire space, walls, floor, ceiling, is covered in flowing, ever-changing digital projections.

One of the most popular rooms is the Crystal Universe, an infinity-mirror room filled with thousands of LED lights that create the sensation of floating in outer space. Another favorite is the Athletics Forest, where the floor becomes a trampoline-like surface and digital creatures respond to your jumping and movement. Kids tend to love this section, where being active and physical is part of the art experience.

Don't miss the EN Tea House, where you can sit down and enjoy a bowl of matcha tea. When the tea is poured into your cup, digital flowers bloom on the surface of the liquid and continue blooming as long as tea remains. Each cup creates a unique flower pattern, and the experience is both beautiful and delicious.

A few practical tips for your visit: wear comfortable shoes because you'll be walking on uneven and sometimes soft surfaces. Dark, solid-colored clothing works best because it becomes part of the projections. White clothes will make you glow in certain rooms, which can be fun but also makes it harder to see the art on your body. The museum is kept cool and dark, so bring a light layer.

Allow at least two to three hours to explore, and don't worry about trying to see everything in order. The magic of Borderless is in the wandering and discovering. Some rooms you'll stumble into only once; others you may pass through several times and see completely different artworks each time. The art literally moves around the space, so your experience is unique to your particular journey through the museum.`,
    highlights: [
      'Over 60 interactive digital artworks across 10,000 square meters',
      'Art that moves between rooms and responds to your presence',
      'EN Tea House where digital flowers bloom on your matcha',
      'Crystal Universe infinity-mirror room',
      'Athletics Forest for active, physical art experiences',
      'Every visit is unique because the art constantly migrates',
    ],
    etiquetteTips: [
      'Wear comfortable shoes for uneven and soft surfaces',
      'Dark clothing lets you see projections better on your body',
      'Photography encouraged, but no flash or tripods',
      'Allow 2-3 hours minimum to explore',
      'Some rooms may be overwhelming for very young children',
    ],
  },
  {
    id: 'tour-imperial-palace',
    locationId: 'imperial-palace',
    title: 'Imperial Palace East Gardens',
    titleJapanese: '皇居東御苑',
    type: 'landmark',
    city: 'Tokyo',
    audioUrl: '/audio/tour-imperial-palace.mp3',
    audioDurationSeconds: 165,
    content: `The Imperial Palace East Gardens sit on what was once the innermost circle of Edo Castle, the greatest fortress ever built in Japan. For two and a half centuries, from 1603 to 1868, this was the seat of power for the Tokugawa shoguns who ruled Japan during its long period of isolation from the outside world. Today, these gardens are one of the few places where you can walk freely on the palace grounds and see the massive stone foundations that tell the story of that extraordinary era.

As you enter through the Ōte-mon gate, you're following the same path that feudal lords once took when summoned to appear before the shogun. The gate itself is a classic example of a masugata, a defensive box-gate design where attackers would be trapped in a small courtyard and fired upon from all sides. The enormous stones in the walls were transported from the Izu Peninsula, over 100 kilometers away, by sea and then dragged through the streets of Edo by hundreds of workers. Some of these stones weigh over 100 tons, and if you look carefully, you can spot the carved family crests of the feudal lords who were responsible for each section of the wall.

The most dramatic feature is the base of the former castle keep, or tenshu-dai. The original keep was the tallest castle tower ever built in Japan, standing over 50 meters high and visible from miles around. It burned down in the Great Meireki Fire of 1657, a devastating blaze that destroyed much of Edo and killed an estimated 100,000 people. The shogunate decided not to rebuild the tower, redirecting the funds to help the city recover instead. You can climb the stone base and imagine the magnificent five-story tower that once stood there, gleaming white against the sky.

The gardens themselves are beautifully designed with different sections that bloom in different seasons. In March, you'll catch plum blossoms giving way to the very first cherry blossoms. The Ninomaru Garden features a traditional Japanese landscape design with a pond, waterfall, and carefully placed stones. There's also a lovely grove of about 260 trees representing species from all 47 of Japan's prefectures, a living symbol of national unity.

For the kids, the wide open lawns are perfect for a little running around after the more structured temple visits. The contrast between the massive stone walls and the peaceful gardens makes this one of Tokyo's most unique spaces, where you can feel the weight of history while enjoying a quiet morning walk.

The gardens are free to enter and relatively uncrowded compared to other major Tokyo attractions, especially on weekday mornings. They're closed on Mondays and Fridays, so plan your visit accordingly.`,
    highlights: [
      'Built on the foundations of mighty Edo Castle',
      'Massive stone walls with carved feudal lord crests',
      'Base of Japan\'s tallest-ever castle keep (destroyed 1657)',
      'Free admission to a peaceful oasis in central Tokyo',
      'Trees from all 47 Japanese prefectures in one garden',
      'Plum and early cherry blossoms in March',
    ],
    etiquetteTips: [
      'Closed Mondays and Fridays — check schedule before visiting',
      'Bags may be inspected at the entrance gate',
      'Stay on marked paths in the garden areas',
      'No picnicking is allowed on the grounds',
    ],
  },
  {
    id: 'tour-shibuya-crossing',
    locationId: 'shibuya-crossing',
    title: 'Shibuya Crossing & Hachikō',
    titleJapanese: '渋谷スクランブル交差点',
    type: 'landmark',
    city: 'Tokyo',
    audioUrl: '/audio/tour-shibuya-crossing.mp3',
    audioDurationSeconds: 170,
    content: `You're standing at the most famous intersection on earth. Shibuya Crossing is a scramble crossing, meaning that when the lights change, all vehicle traffic stops in every direction and pedestrians flood the intersection from all sides at once. During peak times, up to 3,000 people cross in a single light cycle, weaving around each other with a kind of choreographed chaos that somehow never results in collisions. It's mesmerizing to watch and even more thrilling to walk through.

The crossing exists because Shibuya Station is one of the busiest in the world, serving over 2.4 million passengers daily. When the station expanded in the 1960s, traffic engineers realized that traditional crosswalks couldn't handle the pedestrian volume, so they invented this all-directions-at-once approach. It has since become the symbol of Tokyo's organized energy: millions of people moving in apparent chaos but with an underlying order that just works.

Before or after you cross, look for the small bronze statue of a dog sitting near the station's Hachikō Exit. This is Hachikō, and his story is one of the most beloved in Japan. Hachikō was an Akita dog who belonged to Professor Ueno Hidesaburō of Tokyo Imperial University. Every day, Hachikō would walk to Shibuya Station to greet his owner returning from work. In 1925, Professor Ueno died suddenly at the university and never came home. But Hachikō continued coming to the station every single day, waiting for his owner, for the next nine years until his own death in 1935.

The station workers and commuters grew to love the faithful dog, and his story became a national symbol of loyalty. The original statue was erected in 1934, while Hachikō was still alive, and the dog reportedly attended his own unveiling ceremony. The current statue is a replacement from 1948, as the original was melted down for metal during World War II. Today, the statue is the most popular meeting spot in Tokyo, and you'll almost always see people gathered around it.

For the best views of the crossing in action, look up at the surrounding buildings. The Shibuya Sky observation deck on the new Scramble Square building offers a bird's-eye view from 230 meters up. At street level, the Starbucks on the second floor of the Tsutaya building at the northwest corner has window seats overlooking the crossing, though getting a seat can require patience.

Shibuya itself is a fascinating neighborhood that captures Tokyo's youthful energy. The area around the station is filled with department stores, fashion boutiques, restaurants, and nightlife. It's particularly vibrant in the evening when the neon signs light up and the crossing becomes even more dramatic.`,
    highlights: [
      'Up to 3,000 people cross in a single light cycle',
      'The world\'s most famous pedestrian scramble crossing',
      'Hachikō statue — Tokyo\'s most beloved meeting spot',
      'Shibuya Sky offers bird\'s-eye views from 230 meters',
      'Symbol of Tokyo\'s organized chaos and energy',
      'Especially dramatic and neon-lit in the evening',
    ],
    etiquetteTips: [
      'Keep moving while crossing — don\'t stop for photos in the middle',
      'Stay aware of other pedestrians and keep to the flow',
      'The Hachikō statue area gets very crowded — be patient',
      'Shibuya is a great area for evening exploration',
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
    audioUrl: '/audio/tour-hakone-shrine.mp3',
    audioDurationSeconds: 159,
    content: `Hakone Shrine has stood among the ancient cedars at the foot of Mount Hakone for over 1,250 years. Founded in 757 by a monk named Mangan, it became one of the most important shrines in the Kantō region, the area that includes modern-day Tokyo. For centuries, samurai warriors would stop here to pray before heading into battle, and they would return to give thanks after their victories. Even Minamoto no Yoritomo, the first shogun of Japan, was a devoted patron.

The shrine's most famous feature is the red torii gate that appears to float on the surface of Lake Ashi. This "Peace Torii" was erected in 1952 to commemorate Japan's return to independence after the post-war occupation. On calm mornings, when the lake is still and mist hangs low, the gate and its reflection create one of Japan's most magical scenes. If Mount Fuji decides to show itself behind the gate, you'll understand why photographers travel from around the world for this shot. March mornings can offer surprisingly clear conditions, so keep your camera ready.

To reach the main shrine, you'll climb a stone staircase flanked by towering cryptomeria cedar trees, some of them over 800 years old. The trunks of these giants can be three or four meters in diameter, and their canopy creates a green cathedral effect that filters the sunlight into soft beams. Moss covers the stone lanterns that line the path, and the air is cool and fragrant with cedar. It feels like walking into a scene from a Studio Ghibli film.

At the top, the shrine buildings are painted in striking vermillion red, contrasting beautifully with the surrounding green forest. Three deities are enshrined here: Ninigi-no-Mikoto, the grandson of the sun goddess Amaterasu; Konohanasakuya-hime, the goddess of Mount Fuji and cherry blossoms; and Hikohohodemi-no-Mikoto. Together they are believed to bring good fortune in relationships, career success, and safe travels, making this a particularly fitting stop during your Japan journey.

Near the shrine, you'll find a small area where you can draw omikuji, paper fortune slips. If you get a good fortune, keep it. If you get a bad one, tie it to the rack provided, which is said to transfer the bad luck away from you. The kids might enjoy this little ritual of discovering their fortune.

The walk down to the lakeside torii is a highlight in itself, a narrow path through the forest that opens suddenly to the lakeshore with the red gate framing the water. It's a short walk, but one of those moments that stays with you long after the trip.`,
    highlights: [
      'Iconic red torii gate appearing to float on Lake Ashi',
      'Over 1,250 years of history as a samurai prayer site',
      'Ancient cedar forest with 800-year-old trees',
      'Mount Fuji views across the lake on clear mornings',
      'Believed to bring luck in travel, relationships, and career',
      'Atmospheric moss-covered stone lanterns along the approach',
    ],
    etiquetteTips: [
      'Bow at the torii gate before entering',
      'Cleanse hands and mouth at the temizuya water basin',
      'Shrine worship: bow twice, clap twice, bow once',
      'Early morning visits are most peaceful and photogenic',
      'Stay on the stone path when walking through the forest',
    ],
  },
  {
    id: 'tour-owakudani',
    locationId: 'owakudani',
    title: 'Ōwakudani Valley',
    titleJapanese: '大涌谷',
    type: 'landmark',
    city: 'Hakone',
    audioUrl: '/audio/tour-owakudani.mp3',
    audioDurationSeconds: 160,
    content: `Ōwakudani means "Great Boiling Valley," and once you see it, you'll understand why. About 3,000 years ago, Mount Hakone had its last major eruption, and the explosive force collapsed part of the mountain and created this stark, steaming landscape. Sulfurous gases still pour from vents in the earth, hot springs bubble up from below, and the hillside is stained yellow and white from mineral deposits. The smell of sulfur fills the air, an unmistakable rotten-egg scent that tells you the earth beneath your feet is very much alive.

What makes Ōwakudani so fascinating is the contrast. Just minutes away, Hakone is all green forests and tranquil lakes. Here, it looks like another planet, more Mars than Japan. The barren, rocky landscape stretches across the mountainside, punctuated by plumes of white steam that rise like geysers. On clear days, Mount Fuji looms in the background, its perfect white cone making the volcanic devastation in the foreground seem even more dramatic.

The most popular experience here is eating the famous kuro-tamago, or black eggs. These are regular chicken eggs boiled in the volcanic hot springs at temperatures around 80 degrees Celsius. The sulfur in the water reacts with the iron in the eggshell and turns it completely black. Inside, the egg looks and tastes like a normal hard-boiled egg, perhaps just slightly creamier. The real magic is in the legend: each black egg you eat is said to add seven years to your life. They're sold in bags of five at the vendor near the steam vents, so with a little math, one bag could theoretically add 35 years. The kids will probably enjoy both the novelty of eating black food and the idea of gaining extra years.

The Hakone Ropeway that brings you up to Ōwakudani is an experience in itself. The gondola rises over the forested valley, passing directly over active steam vents. The views are spectacular in every direction, with Lake Ashi behind you and the volcanic landscape ahead. On exceptional days, the view of Mount Fuji from the ropeway is one of the best in all of Japan.

Keep in mind that Ōwakudani can occasionally close when volcanic gas levels are too high. The visitor center monitors conditions in real time and will post updates if areas are restricted. People with respiratory conditions, particularly asthma, should exercise caution near the steam vents, as the sulfur concentration can be intense. For everyone else, it's a safe and unforgettable experience that lets you feel the raw power hiding beneath Japan's serene landscape.`,
    highlights: [
      'Active volcanic valley created by eruption 3,000 years ago',
      'Famous black eggs said to add 7 years to your life each',
      'Hakone Ropeway with aerial views of the steam vents',
      'Mount Fuji views on clear days',
      'Stark, otherworldly landscape with sulfur steam vents',
      'Dramatic contrast with Hakone\'s surrounding green forests',
    ],
    etiquetteTips: [
      'Check conditions before visiting — volcanic activity can close trails',
      'People with asthma or respiratory conditions should be cautious',
      'Stay on marked paths and behind safety barriers',
      'Try the black eggs — they\'re delicious and a must-do!',
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
    audioUrl: '/audio/tour-kinkaku-ji.mp3',
    audioDurationSeconds: 165,
    content: `Kinkaku-ji, the Temple of the Golden Pavilion, is one of the most breathtaking sights in all of Japan. The top two floors are completely covered in real gold leaf, and when the sunlight catches them just right, the building seems to glow. Its reflection in the Mirror Pond below creates a double image that has inspired artists, poets, and photographers for over six centuries.

The original pavilion was built in 1397 as a retirement villa for Shogun Ashikaga Yoshimitsu, one of the most powerful and cultured rulers in Japanese history. Yoshimitsu had already stepped down from his official position, but he continued to rule from this stunning lakeside retreat, receiving foreign ambassadors and hosting lavish parties. When he died in 1408, the villa was converted into a Zen Buddhist temple following his wishes.

Each floor of the pavilion represents a different architectural style, reflecting the blending of cultures that characterized the Muromachi period. The ground floor, called the Chamber of Dharma Waters, is in the Shinden palace style used by the Heian-era aristocracy. The second floor, the Tower of Sound Waves, is in the Bukke samurai style. And the top floor, the Cupola of the Ultimate, is built in Chinese Zen style. A golden phoenix perches on the very top, symbolizing the renewal that comes with each era.

The building you see today is actually a reconstruction from 1955. In 1950, a young monk named Hayashi Yoken set fire to the original pavilion, claiming he was overwhelmed by its beauty to the point of madness. The event shocked Japan and inspired Yukio Mishima's famous novel "The Temple of the Golden Pavilion," one of the most celebrated works of modern Japanese literature. The rebuilt version used even more gold leaf than the original, and a major restoration in 2003 added additional layers to make it even more brilliant.

The surrounding garden is a masterpiece of Muromachi-period design, carefully arranged to create a landscape that represents the Buddhist concept of paradise. Islands in the pond represent famous locations from Chinese and Japanese mythology. The arrangement of rocks and plants has been preserved for centuries, and every element is placed with intention. In March, you may see plum blossoms in the garden, adding soft pink accents to the gold and green.

A walking path takes you around the pond and through the garden, and you'll notice that the pavilion looks different from every angle, a deliberate design choice. Near the exit, there's a small tea garden where you can enjoy matcha tea and traditional sweets while contemplating what you've just seen.`,
    highlights: [
      'Top two floors covered in real gold leaf',
      'Perfect reflection in Mirror Pond (Kyōko-chi)',
      'Three architectural styles representing different eras',
      'Garden designed to represent Buddhist paradise',
      'Golden phoenix atop the roof symbolizing renewal',
      'Rebuilt in 1955 after the famous 1950 arson',
    ],
    etiquetteTips: [
      'Follow the one-way walking route around the pond',
      'Best photos in morning light or late afternoon golden hour',
      'You cannot enter the pavilion — viewing is from outside only',
      'Enjoy matcha tea at the garden tea house near the exit',
    ],
  },
  {
    id: 'tour-fushimi-inari',
    locationId: 'fushimi-inari',
    title: 'Fushimi Inari Taisha',
    titleJapanese: '伏見稲荷大社',
    type: 'shrine',
    city: 'Kyoto',
    audioUrl: '/audio/tour-fushimi-inari.mp3',
    audioDurationSeconds: 172,
    content: `Fushimi Inari Taisha is the head shrine of over 30,000 Inari shrines scattered across Japan, and it is best known for its seemingly endless tunnels of vermillion torii gates winding up the forested slopes of Mount Inari. Walking through these gates is one of the most iconic experiences in Japan, a mesmerizing passage through thousands of blazing orange portals that seem to stretch on forever.

The shrine was founded in 711 AD, making it over 1,300 years old. It is dedicated to Inari, the Shinto deity of rice, sake, and worldly prosperity. Since rice was the foundation of the Japanese economy for most of history, Inari became one of the most widely worshipped deities in the country. Today, Inari is also considered the patron of business success, and you'll see this reflected in who donates the torii gates.

Each of the roughly 10,000 gates was donated by a Japanese business or individual seeking Inari's blessings. If you look at the back of each gate, you'll see the donor's name and the date of donation inscribed in black characters. Small gates cost around 400,000 yen (about $2,700), while the largest gates can cost over a million yen. The gates are continuously being added and replaced, so the trail is always evolving.

You'll notice fox statues everywhere at the shrine. These are not the deity but rather Inari's messengers. Look closely and you'll see each fox holds something different in its mouth: a key to the rice granary, a jewel representing spiritual wisdom, a scroll of sacred text, or a sheaf of rice. Their expressions range from fierce to playful, and spotting the different objects makes for a fun scavenger hunt with kids.

The full hike up Mount Inari and back takes about two to three hours and climbs roughly 233 meters in elevation. But here's the secret: you don't have to go all the way. The most densely packed and photogenic sections of gates are in the first 20 to 30 minutes of the climb. After that, the crowds thin out dramatically, and you'll find yourself walking through peaceful forest with scattered smaller shrines and stone foxes peeking out from the undergrowth.

The shrine is open 24 hours a day, which means visiting at dawn or dusk can be magical. In the early morning, with mist drifting between the gates and birdsong echoing through the forest, it feels like a portal to another world. Even during busier midday hours, the sheer number of gates means you can usually find a quiet stretch if you walk far enough.

At various points along the trail, small rest stops sell inari-zushi (sushi rice in sweet fried tofu pouches, named after the deity), hot tea, and snacks. These little oases are perfect for catching your breath and soaking in the atmosphere.`,
    highlights: [
      'Roughly 10,000 vermillion torii gates winding up Mount Inari',
      'Each gate donated by a business or individual seeking blessings',
      'Fox statues as divine messengers holding keys, jewels, and scrolls',
      'Over 1,300 years of history as Japan\'s most important Inari shrine',
      'Open 24 hours — magical at dawn and dusk',
      'Rest stops along the trail serving inari-zushi and hot tea',
    ],
    etiquetteTips: [
      'Wear comfortable walking shoes for the mountain trail',
      'Stay to the left on busy sections so others can pass',
      'Morning or late afternoon visits avoid the biggest crowds',
      'The full hike is 2-3 hours, but you can turn back anytime',
    ],
  },
  {
    id: 'tour-arashiyama-bamboo',
    locationId: 'arashiyama-bamboo',
    title: 'Arashiyama Bamboo Grove',
    titleJapanese: '嵐山竹林',
    type: 'landmark',
    city: 'Kyoto',
    audioUrl: '/audio/tour-arashiyama-bamboo.mp3',
    audioDurationSeconds: 155,
    content: `Walking into the Arashiyama Bamboo Grove is like stepping into another world. Towering stalks of moso bamboo rise 20 meters or more on either side of you, their tops swaying gently and meeting overhead to create a living green cathedral. Sunlight filters through the dense canopy in shifting patterns, and the sound of the wind moving through thousands of bamboo stalks creates a soft, hollow music that the Japanese government has officially recognized as one of the country's "100 Soundscapes to Preserve."

The main path runs about 400 meters from the edge of Tenryū-ji Temple's northern gate to the villa of Ōkōchi Sansō. Moso bamboo, the species that dominates this grove, is one of the fastest-growing plants on Earth. Under the right conditions, it can grow up to a meter per day. But don't worry, the grove isn't going to swallow you up during your visit. The bamboo here is carefully maintained by local caretakers who thin the groves and clear fallen stalks.

Bamboo has been central to Japanese culture for centuries, used in everything from tea ceremony utensils and calligraphy brushes to building materials and musical instruments. In Japanese folklore, the story of Princess Kaguya tells of a bamboo cutter who finds a tiny glowing princess inside a bamboo stalk. It's considered one of the oldest Japanese narratives and has been adapted into films, manga, and a gorgeous Studio Ghibli movie that the kids might enjoy watching when you get home.

Arashiyama itself has been a popular destination since the Heian period, over a thousand years ago, when Kyoto's aristocrats built their country retreats here. The district still retains that sense of elegant escape. Beyond the bamboo grove, you'll find the beautiful Togetsukyo Bridge, which translates as "Moon Crossing Bridge," a name inspired by the way moonlight appears to cross the river. The bridge has been rebuilt many times over the centuries but retains its classic wooden design.

For the best experience, try to visit the bamboo grove early in the morning, ideally before 9 AM when the tour buses begin arriving. In the early hours, you may have the path nearly to yourself, and the quality of light filtering through the bamboo is at its most ethereal. March mornings tend to be cool and crisp, which adds to the atmosphere.

The grove connects naturally to Tenryū-ji Temple, one of Kyoto's great Zen temples, whose garden is considered one of the finest in Japan. The temple and the bamboo path together make for a memorable morning of walking through some of Kyoto's most beautiful scenery.`,
    highlights: [
      'Bamboo stalks rising 20+ meters creating a green cathedral',
      'Sound of wind through bamboo — an official Japanese soundscape',
      'Moso bamboo can grow up to one meter per day',
      'Connected to Tenryū-ji Temple and its renowned garden',
      'Togetsukyo "Moon Crossing" Bridge nearby',
      'Inspiration for the Princess Kaguya folklore and Ghibli film',
    ],
    etiquetteTips: [
      'Visit before 9 AM for fewer crowds and best light',
      'Stay on the path — bamboo roots are fragile and easily damaged',
      'Photography welcome, but tripods discouraged when busy',
      'The grove connects to Tenryū-ji Temple (separate admission)',
    ],
  },
  {
    id: 'tour-gion',
    locationId: 'gion',
    title: 'Gion District',
    titleJapanese: '祇園',
    type: 'landmark',
    city: 'Kyoto',
    audioUrl: '/audio/tour-gion.mp3',
    audioDurationSeconds: 178,
    content: `Gion is the most famous geisha district in Japan, a place where the wooden machiya townhouses, stone-paved lanes, and paper lanterns look almost exactly as they did hundreds of years ago. Walking through Gion in the evening, when the soft glow of lanterns illuminates the wooden facades, is like slipping through a crack in time back to old Kyoto.

The district grew up around Yasaka Shrine in the 17th century, originally serving pilgrims and travelers with tea houses and entertainment. Over time, it became the center of Kyoto's geisha culture, a refined world of art, music, and hospitality that has survived for over three centuries. Today, Gion is home to around 80 working geiko (the Kyoto word for geisha) and about 80 maiko (apprentice geiko), though you'd need to look carefully to spot them.

Geisha culture is widely misunderstood outside Japan. Geiko are not what Western stereotypes might suggest. They are highly skilled traditional entertainers who undergo years of rigorous training in classical dance, musical instruments like the shamisen, the art of conversation, tea ceremony, flower arrangement, and the subtle art of hosting. A maiko typically begins training around age 15 or 16, and the full journey to becoming a geiko takes about five years. Their elaborate kimono, white makeup, and distinctive hairstyles are part of a living art form that is recognized as an important cultural heritage.

Hanami-koji is Gion's main street, a beautiful lane lined with traditional tea houses and restaurants. Many of these establishments are invitation-only ochaya, where geiko entertain guests over multi-course meals. You can't just walk in off the street; you need an introduction from an existing patron. This exclusivity isn't meant to be unwelcoming; it's how a centuries-old tradition of trust and personal relationship sustains itself.

The surrounding backstreets are equally charming and much more accessible. Wander the narrow lanes south of Hanami-koji and you'll discover tiny temples, shops selling traditional fans and incense, centuries-old sweet shops, and the occasional glimpse through a doorway into a private courtyard garden.

If you're walking through Gion around 5:30 or 6:00 PM, you have the best chance of seeing maiko and geiko making their way to evening engagements. They move quickly, in a distinctive pigeon-toed walk dictated by their tight obi belts and wooden geta sandals. It's fine to look and admire from a respectful distance, but please never block their path or follow them for photographs. This has become such a problem that parts of Gion have enacted photography bans on private streets.

Nearby, Nishiki Market, often called "Kyoto's Kitchen," runs for five blocks and sells everything from pickled vegetables and fresh tofu to beautiful Japanese knives and ceramics. It's a wonderful place to graze and pick up unique food souvenirs.`,
    highlights: [
      'Traditional wooden machiya townhouses and stone-paved lanes',
      'Home to about 80 geiko and 80 maiko (apprentice geisha)',
      'Hanami-koji main street with exclusive ochaya tea houses',
      'Atmospheric backstreets with hidden temples and craft shops',
      'Best chance for geisha sightings around 5:30-6:00 PM',
      'Nearby Nishiki Market — "Kyoto\'s Kitchen" for food and crafts',
    ],
    etiquetteTips: [
      'Never block, follow, or chase geiko/maiko for photos',
      'Some private streets now ban photography — respect signs',
      'Evening visits (from 5 PM) offer the best atmosphere',
      'Wander the backstreets for the most authentic experience',
    ],
  },
  {
    id: 'tour-kiyomizudera',
    locationId: 'kiyomizudera',
    title: 'Kiyomizu-dera Temple',
    titleJapanese: '清水寺',
    type: 'temple',
    city: 'Kyoto',
    audioUrl: '/audio/tour-kiyomizudera.mp3',
    audioDurationSeconds: 166,
    content: `Kiyomizu-dera, the "Pure Water Temple," clings to the side of Mount Otowa in eastern Kyoto and offers one of the most spectacular views in all of Japan. The temple's main hall extends out over a steep hillside on a massive wooden platform supported by 139 pillars, and not a single nail was used in its construction. Standing on that platform and looking out over the sea of treetops with Kyoto spreading to the horizon beyond is an experience that takes your breath away.

The temple was founded in 778, making it older than Kyoto itself. According to legend, a monk named Enchin had a dream in which he was told to seek the source of the Otowa waterfall. He traveled into the mountains, found the waterfall, and met an old hermit who had been guarding it for centuries. The hermit entrusted the site to Enchin and disappeared. The waterfall still flows today, and visitors line up to drink from its three streams, each believed to grant a different blessing: longevity, success in school, and luck in love. The tradition says you should only drink from one or two streams; drinking from all three is considered greedy.

The famous wooden stage, or butai, extends 13 meters out from the main hall and stands about 13 meters above the hillside below. It was originally built as a performance stage for sacred dances offered to the deity Kannon, the same goddess of mercy worshipped at Sensō-ji in Tokyo. There's a Japanese expression, "jumping off the stage at Kiyomizu," which is the equivalent of the English phrase "taking the leap." During the Edo period, people actually jumped from the stage believing they'd be granted a wish if they survived. Records show 234 people jumped between 1694 and 1864, with a survival rate of about 85 percent, which is surprisingly high but still prompted authorities to eventually ban the practice.

The current buildings date from 1633, rebuilt by the third Tokugawa shogun after a fire. The main hall and stage were recently restored in a major project completed in 2020 that refreshed the iconic cypress-bark roof to its original warm brown color.

In March, the hillside below the temple begins showing the first hints of cherry blossom color, and the plum trees around the temple grounds may be in full bloom. The combination of the vermillion pagoda, the vast wooden stage, and delicate blossoms against the Kyoto skyline is the reason this temple is one of the most photographed places in Japan.

The approach to the temple winds up through the charming streets of Higashiyama, lined with pottery shops, sweet shops, and traditional restaurants. The walk itself is half the fun, and the narrow stone-paved lanes feel timeless.`,
    highlights: [
      'Massive wooden stage jutting out 13 meters over the hillside',
      'Built without a single nail — 139 pillars support the platform',
      'Otowa waterfall with three streams for longevity, success, and love',
      'Over 1,200 years of history, older than Kyoto itself',
      'Panoramic views of Kyoto from the wooden platform',
      'Charming Higashiyama approach streets with shops and pottery',
    ],
    etiquetteTips: [
      'Choose only one or two waterfall streams to drink from, not all three',
      'Remove shoes before entering any temple buildings',
      'The approach streets get crowded midday — mornings are calmer',
      'Respect the sacred atmosphere on the main stage platform',
    ],
  },
  {
    id: 'tour-tenryu-ji',
    locationId: 'tenryu-ji',
    title: 'Tenryū-ji Temple',
    titleJapanese: '天龍寺',
    type: 'temple',
    city: 'Kyoto',
    audioUrl: '/audio/tour-tenryu-ji.mp3',
    audioDurationSeconds: 158,
    content: `Tenryū-ji, the Temple of the Heavenly Dragon, is the most important Zen temple in the Arashiyama district and holds the top rank among Kyoto's five great Zen temples. Its garden, designed by the legendary monk Musō Soseki in the 14th century, is considered one of the finest examples of Japanese garden design in existence and has been designated a UNESCO World Heritage Site.

The temple was built in 1339 by Ashikaga Takauji, the first shogun of the Muromachi period, on the site of a former imperial villa. Takauji ordered its construction to appease the spirit of Emperor Go-Daigo, who had died in exile after a bitter power struggle. Legend says a monk named Musō Soseki had a dream in which a golden dragon rose from the nearby Ōi River, and this vision gave the temple its name: Tenryū-ji, Temple of the Heavenly Dragon.

The Sōgenchi Pond Garden is the temple's masterpiece and the main reason to visit. Designed by Musō Soseki himself, the garden incorporates the mountains behind it as "borrowed scenery," a technique called shakkei that makes the garden appear to extend naturally into the surrounding landscape. The pond is shaped to suggest a Chinese character, and carefully placed rocks represent waterfalls, mountains, and islands from Chinese mythology. What's extraordinary is that this garden looks almost exactly as it did nearly 700 years ago. While the temple buildings have been destroyed and rebuilt eight times, including during the Ōnin War and the anti-Buddhist movement of the Meiji era, the garden has survived virtually unchanged.

Sit on the veranda of the main hall and simply look. Zen gardens are designed not just for walking through but for contemplation. The arrangement of every rock, every tree, every ripple in the pond is intentional. In March, you'll see plum blossoms and perhaps the first cherry blooms reflected in the still water, with the Arashiyama mountains rising green and misty behind them.

The temple's northern gate opens directly into the Arashiyama Bamboo Grove, making these two attractions a natural pair. Many visitors walk through the bamboo first and then enter Tenryū-ji from the back, but approaching from the front entrance gives you the full experience of the garden as Musō Soseki intended it to be seen.

Inside the main hall, a dramatic painting of a dragon covers the ceiling. This is the "Cloud Dragon" painting, a later addition that captures the temple's founding legend. The dragon's eyes are said to follow you as you move around the room, a common technique in East Asian painting that never fails to impress.`,
    highlights: [
      'Top-ranked among Kyoto\'s five great Zen temples',
      'Sōgenchi Pond Garden — nearly unchanged for 700 years',
      '"Borrowed scenery" technique incorporating the Arashiyama mountains',
      'UNESCO World Heritage Site',
      'Cloud Dragon ceiling painting with eyes that follow you',
      'Northern gate connects directly to the Bamboo Grove',
    ],
    etiquetteTips: [
      'Remove shoes before entering any temple buildings',
      'Take time to sit and contemplate the garden from the veranda',
      'The garden is designed to be viewed, not walked through',
      'Photography is welcome in the garden but restricted inside buildings',
    ],
  },

  // === NARA ===
  {
    id: 'tour-todai-ji',
    locationId: 'todai-ji',
    title: 'Tōdai-ji Temple',
    titleJapanese: '東大寺',
    type: 'temple',
    city: 'Kyoto',
    audioUrl: '/audio/tour-todai-ji.mp3',
    audioDurationSeconds: 163,
    content: `Tōdai-ji temple is home to the largest bronze Buddha statue in the world, and the building that houses it, the Daibutsuden or Great Buddha Hall, is the largest wooden structure in the world. Let those facts sink in for a moment. The building you're about to enter is the biggest wooden building on the planet, and the Buddha sitting inside weighs approximately 500 tons and stands 15 meters tall. And here's the humbling part: the current hall, rebuilt in 1709, is actually about 30 percent smaller than the original.

The temple was completed in 752, during the Nara period when this city served as Japan's capital. Emperor Shōmu ordered the Buddha's construction after a series of devastating plagues, earthquakes, and political crises. He believed that a monumental statue of Vairocana Buddha, the cosmic Buddha who illuminates the entire universe, could protect the nation and bring peace. The casting of the statue required virtually all of Japan's copper supply and took years of work by thousands of artisans. The dedication ceremony in 752 was attended by dignitaries from across Asia, making it one of the great international events of the ancient world.

As you approach the Daibutsuden through the massive Nandaimon gate, look up at the two towering guardian statues, the Niō, flanking the entrance. These 8-meter-tall wooden sculptures are masterworks of Kamakura-period artistry, carved in just 69 days by the great sculptor Unkei and his workshop. The level of detail in their muscular forms and fierce expressions is astonishing, especially considering they were carved from assembled blocks of Japanese cypress.

Inside the hall, the Great Buddha sits in serene meditation, one hand raised in a gesture that means "fear not." The statue's face alone is over 5 meters long, and each eye is over a meter wide. To the sides sit two smaller attendant statues that would be considered enormous in any other context but seem modest next to the main figure.

Look for the pillar near the back of the hall that has a hole cut through its base. The hole is exactly the same size as one of the Great Buddha's nostrils, and it's a tradition that anyone who can squeeze through it is guaranteed enlightenment in their next life. Kids and smaller adults usually succeed; taller visitors sometimes get entertainingly stuck. It's one of the most fun traditions in any Japanese temple.

The temple complex also includes a lovely garden, a museum of Buddhist art treasures, and excellent views over Nara Park. The deer that roam the park freely are considered divine messengers of the Kasuga Shrine and have been protected for over a thousand years.`,
    highlights: [
      'World\'s largest bronze Buddha — 15 meters tall, 500 tons',
      'Daibutsuden is the largest wooden structure on Earth',
      'Niō guardian statues carved in just 69 days by master sculptor Unkei',
      'Pillar hole tradition: squeeze through for enlightenment',
      'Built in 752 to protect Japan during a national crisis',
      'Surrounded by Nara\'s sacred free-roaming deer',
    ],
    etiquetteTips: [
      'Remove shoes if entering any secondary temple buildings',
      'Photography is allowed inside the Great Buddha Hall',
      'Be respectful of the solemn atmosphere despite the crowds',
      'The pillar hole line can be long — go early for shorter waits',
    ],
  },
  {
    id: 'tour-nara-park',
    locationId: 'nara-park',
    title: 'Nara Park & Sacred Deer',
    titleJapanese: '奈良公園',
    type: 'landmark',
    city: 'Kyoto',
    audioUrl: '/audio/tour-nara-park.mp3',
    audioDurationSeconds: 168,
    content: `Nara Park is home to over 1,200 wild deer who roam freely among the temples, shrines, and tree-lined paths of this ancient capital. These aren't just any deer. In Shinto mythology, a deity arrived in Nara riding a white deer, and ever since, the deer of Nara have been considered divine messengers and protected by law. For most of history, killing a deer in Nara was a capital offense. Even today, they hold the status of National Natural Treasures.

The deer are Sika deer, a species native to East Asia. They're smaller and more delicate than North American deer, with spotted coats in summer that turn a uniform brown in winter. In March, during your visit, you'll see them in their winter coats, and some of the males will still have their antlers, which they shed in spring. The antlers are ceremonially cut each October in a tradition dating back to the 1600s, partly to protect visitors and partly to preserve this ancient ritual.

You can buy special deer crackers called shika-senbei from vendors stationed throughout the park. These rice bran crackers are blessed at Kasuga Shrine and are the only approved food for the deer. When you hold one up, many of the deer will bow their heads before accepting the treat. They've learned that bowing gets them crackers faster, and while it looks like Japanese politeness, it's actually just very clever conditioning. Still, it's adorable and makes for wonderful photos, especially with kids.

A few practical tips for interacting with the deer: hold the cracker high and to the side rather than in front of your body, as some deer can be pushy when hungry. If a deer is getting too assertive, simply show your empty hands, palms out, and they'll usually lose interest and wander away. Don't tease them by hiding crackers or pulling them away, as this can make them nippy. Most of the deer are gentle, but they are wild animals, so treat them with respect.

The park itself covers an enormous 500 hectares and includes some of Japan's most important cultural sites. Beyond Tōdai-ji, you can visit Kasuga Taisha, a stunning Shinto shrine famous for its thousands of stone and bronze lanterns. The approach to Kasuga is lined with moss-covered stone lanterns that create one of the most atmospheric walks in Japan. There's also the Nara National Museum, which houses one of the country's finest collections of Buddhist art.

In March, the park is particularly beautiful. Plum blossoms are in full bloom, and the deer grazing beneath flowering trees against the backdrop of ancient temple roofs creates scenes that look like they belong in a painting. The park is spacious enough that even on busy days, you can find quiet corners where it's just you, the trees, and the deer.`,
    highlights: [
      'Over 1,200 free-roaming Sika deer — National Natural Treasures',
      'Deer bow for shika-senbei crackers (blessed at Kasuga Shrine)',
      'Deer have been sacred in Nara for over 1,000 years',
      'Kasuga Taisha Shrine with thousands of stone lanterns',
      '500-hectare park with Tōdai-ji, shrines, and museums',
      'Plum blossoms and deer create painterly March scenes',
    ],
    etiquetteTips: [
      'Buy only official shika-senbei crackers to feed the deer',
      'Show empty palms to deer that get too pushy',
      'Don\'t tease, chase, or grab the deer — they are wild animals',
      'Keep bags closed — deer will investigate open bags for food',
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
    audioUrl: '/audio/tour-osaka-castle.mp3',
    audioDurationSeconds: 174,
    content: `Osaka Castle is the landmark that defined a nation. Built in 1583 by Toyotomi Hideyoshi, the man who unified Japan after a century of civil war, this was once the largest and most formidable castle in the country. Hideyoshi's story is extraordinary: born a peasant with no family name, he rose through military ranks by sheer ability and cunning until he controlled all of Japan. The castle he built was meant to show the world the extent of his power, and even today, standing beneath its massive stone walls, you feel it.

The stone walls are perhaps the most impressive feature. Some of the individual stones weigh over 100 tons, transported from quarries across western Japan by thousands of workers. The largest stone, called the Octopus Stone because of its shape, measures about 60 square meters on its exposed face and weighs an estimated 130 tons. Feudal lords competed to demonstrate their loyalty by providing the biggest stones for the walls, and you can still see the carved family crests that mark which clan contributed each section.

The castle has been destroyed and rebuilt multiple times. Hideyoshi's original was burned during the siege of 1615, when the Tokugawa forces finally defeated his son and heirs. The Tokugawas rebuilt it on an even grander scale, but that version was struck by lightning and destroyed in 1665. The current tower is a 1931 concrete reconstruction, the first castle in Japan to use modern materials for restoration, which was considered revolutionary at the time.

Inside, eight floors house an excellent museum tracing Hideyoshi's rise and the history of Osaka. The top floor observation deck provides panoramic views of the city, and on clear days you can see all the way to the mountains that ring the Osaka plain. The museum does a good job of bringing Hideyoshi to life as a character: clever, ambitious, sometimes cruel, but always fascinating.

The castle grounds span over 60,000 square meters, surrounded by double moats and walls. In March, the grounds come alive with over 3,000 cherry trees that make this one of Osaka's premier hanami, or cherry blossom viewing, spots. Even before the main cherry season, plum blossoms in the Plum Grove offer beautiful early-spring color. The combination of delicate pink blossoms against the castle's dramatic silhouette is unforgettable.

For the kids, the castle grounds offer wide-open spaces for running around, and the moats sometimes have interesting wildlife including turtles and koi fish. The museum has some interactive displays, and the sheer scale of the stone walls tends to impress visitors of all ages. Walking along the moat gives you a sense of the castle's defensive engineering and the tremendous effort that went into its construction.`,
    highlights: [
      'Massive stone walls with stones weighing over 100 tons each',
      'Built by Toyotomi Hideyoshi, the peasant who unified Japan',
      'Eight-floor museum tracing Hideyoshi\'s extraordinary rise',
      'Observation deck with panoramic Osaka city views',
      '3,000+ cherry trees make it a premier spring hanami spot',
      'Double moats and 60,000+ square meter grounds',
    ],
    etiquetteTips: [
      'The museum inside has elevator access for strollers',
      'Photography is allowed throughout the grounds and museum',
      'The grounds are free to enter; tower admission is separate',
      'Allow extra time if cherry blossoms are in bloom',
    ],
  },
  {
    id: 'tour-dotonbori',
    locationId: 'dotonbori',
    title: 'Dōtonbori',
    titleJapanese: '道頓堀',
    type: 'landmark',
    city: 'Osaka',
    audioUrl: '/audio/tour-dotonbori.mp3',
    audioDurationSeconds: 177,
    content: `Welcome to Dōtonbori, the beating heart of Osaka's legendary food scene and possibly the most exciting street in Japan. The moment you arrive, your senses are overwhelmed: enormous neon signs blaze in every color, giant 3D figures of crabs, dragons, and puffer fish jut out from building facades, the smell of grilling meat and batter fills the air, and everywhere you look, people are eating, laughing, and having the time of their lives.

The district runs along both sides of the Dōtonbori canal, which was dug in the early 1600s by a merchant named Yasui Dōton, who tragically died in battle before seeing his canal completed. The area around the canal quickly became the entertainment district of Osaka, originally centered on kabuki theaters and bunraku puppet shows. Over the centuries, the theaters gave way to restaurants and bars, but the spirit of entertainment never left. Osakans have a saying: "kuidaore," which means "eat until you drop," and Dōtonbori is where they put that philosophy into practice.

The most iconic sight is the Glico Running Man sign, a neon billboard showing an athlete crossing a finish line with his arms raised. This sign has stood at the Ebisu Bridge since 1935, though it has been redesigned several times. It's the unofficial symbol of Osaka and the most popular selfie spot in the city. The current version, installed in 2014, uses 140,000 LED lights and cost $27 million to build.

For food, here are the essential Osaka street foods to try. Takoyaki are crispy-on-the-outside, gooey-on-the-inside balls of batter filled with chunks of octopus, topped with a special brown sauce, mayonnaise, and dancing bonito flakes. They're served in boats of six or eight and eaten with toothpicks. Okonomiyaki is a thick savory pancake made with batter, shredded cabbage, and your choice of toppings, usually pork, shrimp, or squid, then grilled on a flat iron and decorated with sauce and mayo in artistic zigzag patterns. Kushikatsu are skewers of meat, vegetables, and other ingredients battered and deep-fried until golden, served with a communal dipping sauce. The number one rule of kushikatsu: never double-dip, it's a serious faux pas.

The canal itself is beautiful at night, with the neon signs reflecting on the water and the Ebisu Bridge creating a focal point for the crowds. Tour boats glide down the canal, and street performers entertain the crowds along the waterfront promenade.

Unlike Tokyo, where eating while walking is generally frowned upon, Osaka embraces it wholeheartedly. Dōtonbori vendors expect you to eat standing right there at their counter or walking along with your takoyaki boat. The atmosphere is casual, loud, and joyful, perfectly reflecting Osaka's reputation as Japan's most outgoing and down-to-earth city.`,
    highlights: [
      'Iconic Glico Running Man neon sign (since 1935)',
      'Must-try takoyaki, okonomiyaki, and kushikatsu',
      'Giant 3D signs of crabs, dragons, and puffer fish',
      'Canal-side atmosphere with neon reflections at night',
      'Embodiment of Osaka\'s "kuidaore" eat-till-you-drop culture',
      'Walking and eating openly encouraged here',
    ],
    etiquetteTips: [
      'Never double-dip your kushikatsu in the communal sauce',
      'Try multiple small portions to sample more variety',
      'Evening visits from 6 PM onward are most atmospheric',
      'Cash is king at many street food stalls',
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
    audioUrl: '/audio/tour-city-tokyo.mp3',
    audioDurationSeconds: 45,
    content: `Tokyo is one of the world's most dynamic cities, home to over 13 million people and 37 million in the greater metropolitan area. Once called Edo, it served as the Tokugawa shogunate's capital for 265 years before becoming Tokyo, "Eastern Capital," when Emperor Meiji arrived in 1868.

Each neighborhood has its own character: Shibuya's youth culture, Shinjuku's towers, Asakusa's old-town charm, and Ginza's luxury shopping. The world's busiest train system connects them all with remarkable precision. Tokyo has more Michelin stars than any other city on earth, with exceptional food at every price point from 200-yen ramen to high-end kaiseki.`,
    highlights: [
      'World\'s largest metropolitan area (37 million people)',
      'More Michelin stars than any city on earth',
      'Efficient and extensive transit system',
      'Unique blend of ancient tradition and cutting-edge technology',
    ],
  },
  {
    id: 'tour-city-hakone',
    locationId: 'city-hakone',
    title: 'About Hakone',
    titleJapanese: '箱根',
    type: 'city',
    city: 'Hakone',
    audioUrl: '/audio/tour-city-hakone.mp3',
    audioDurationSeconds: 38,
    content: `Hakone has been a beloved resort destination for centuries, prized for its hot springs, mountain scenery, and views of Mount Fuji. Just 90 minutes from Tokyo, it sits within the collapsed caldera of an ancient volcano, creating 17 different hot spring sources with unique mineral compositions.

Traditional ryokan inns offer tatami rooms, futon beds, multi-course kaiseki dinners, and the ritual of the hot spring bath. The Hakone Free Pass lets you ride trains, buses, boats, and ropeways through the region, including Lake Ashi and the volcanic Ōwakudani valley.`,
    highlights: [
      '17 different hot spring sources',
      'Mount Fuji views on clear days',
      'Traditional ryokan experience',
      'Hakone Free Pass for trains, boats, and ropeways',
    ],
  },
  {
    id: 'tour-city-kyoto',
    locationId: 'city-kyoto',
    title: 'About Kyoto',
    titleJapanese: '京都',
    type: 'city',
    city: 'Kyoto',
    audioUrl: '/audio/tour-city-kyoto.mp3',
    audioDurationSeconds: 42,
    content: `Kyoto served as Japan's capital for over 1,000 years and remains its cultural heart, with 17 UNESCO World Heritage Sites, 2,000 temples, and living traditions in tea ceremony, flower arrangement, and textile arts. Largely spared from WWII bombing, it uniquely preserves pre-war Japanese urban landscape.

The city is laid out in a grid modeled on ancient Chinese capitals, with neighborhoods like Gion, Higashiyama, and Arashiyama feeling transported from the Edo period. Many craft families have practiced their arts for generations, and traditional apprenticeships in everything from ceramics to geisha arts continue today.`,
    highlights: [
      '1,000+ years as Japan\'s imperial capital',
      '17 UNESCO World Heritage Sites',
      'Center of living traditional Japanese arts',
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
    audioUrl: '/audio/tour-city-osaka.mp3',
    audioDurationSeconds: 44,
    content: `Osaka is Japan's third-largest city and undisputed culinary capital. The local philosophy of "kuidaore" — eat until you drop — captures a food obsession that goes back centuries. While Kyoto housed the emperor and Tokyo the shogun, Osaka was the merchant capital, creating a practical, down-to-earth culture that persists today.

Osakans are known for being more direct, humorous, and outgoing than other Japanese. The city is famous for takoyaki, okonomiyaki, and kushikatsu, with generous portions at reasonable prices. Osaka Castle anchors the city historically, while modern districts like Dōtonbori and Shinsekai offer vibrant nightlife and entertainment.`,
    highlights: [
      'Japan\'s food capital — the kuidaore culture',
      'Friendly, outgoing local character',
      'Great value dining at every level',
      'Vibrant nightlife and entertainment districts',
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
        audioUrl: tour.audioUrl,
        audioDurationSeconds: tour.audioDurationSeconds,
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
