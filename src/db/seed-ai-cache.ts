import { db } from './database';

/**
 * Pre-cached AI responses for common questions.
 * Used for offline mode when the AI API is unavailable.
 */
interface CachedQA {
  questionPattern: string;
  keywords: string[];
  response: string;
  category: 'etiquette' | 'phrases' | 'practical' | 'schedule' | 'emergency';
}

const CACHED_RESPONSES: CachedQA[] = [
  // === ETIQUETTE ===
  {
    questionPattern: 'temple etiquette',
    keywords: ['temple', 'shrine', 'etiquette', 'behavior', 'rules'],
    response: `**Temple & Shrine Etiquette:**

1. **Bow at the entrance** - Slight bow when entering the torii gate or temple grounds
2. **Remove shoes** when entering indoor areas (look for shoe racks)
3. **Don't step on thresholds** - Step over, not on them
4. **At shrines:**
   - Bow twice, clap twice, bow once (ni-hai, ni-hakushu, ichi-hai)
   - Ring the bell gently before praying
5. **At temples:**
   - No clapping - just bow and press hands together
   - Light incense by placing it in the burner
6. **Photography** - Look for signs; usually okay outdoors, restricted indoors
7. **Dress modestly** - Cover shoulders and knees when possible

Most temples and shrines are very welcoming to families with children!`,
    category: 'etiquette',
  },
  {
    questionPattern: 'restaurant etiquette',
    keywords: ['restaurant', 'dining', 'eat', 'chopsticks', 'tipping'],
    response: `**Restaurant Etiquette:**

1. **No tipping** - It's not customary and can cause confusion
2. **Say "itadakimasu"** before eating (I humbly receive)
3. **Say "gochisousama"** when finished (Thank you for the meal)
4. **Chopstick rules:**
   - Never stick chopsticks upright in rice (funeral ritual)
   - Don't pass food chopstick-to-chopstick
   - Don't point with chopsticks
5. **Slurping noodles** is acceptable and shows appreciation!
6. **Wait for everyone** before starting to eat
7. **At izakaya:** Wait for "kanpai" (cheers) before drinking
8. **With children:** Most restaurants are very accommodating

Hand towels (oshibori) are for hands only, not face or table.`,
    category: 'etiquette',
  },
  {
    questionPattern: 'onsen etiquette',
    keywords: ['onsen', 'hot spring', 'bath', 'naked', 'tattoo'],
    response: `**Onsen (Hot Spring) Etiquette:**

1. **Wash thoroughly** before entering the bath
2. **Be completely naked** - No swimsuits
3. **Keep towel out of water** - Place on head or edge
4. **No splashing or swimming** - It's for relaxing
5. **Stay quiet** - Peaceful atmosphere
6. **Tattoos:** Our ryokan is tattoo-friendly, but some public onsens aren't
7. **Hair up** - Tie long hair so it doesn't touch water
8. **Don't dive in** - Enter slowly

**For the Hakone ryokan:**
- Private baths available for families
- Children welcome in most baths
- Evening hours often quieter`,
    category: 'etiquette',
  },
  {
    questionPattern: 'train etiquette',
    keywords: ['train', 'subway', 'metro', 'bus', 'transport', 'priority'],
    response: `**Train & Transit Etiquette:**

1. **Queue properly** - Line up along platform markings
2. **Let passengers exit first**
3. **Keep quiet** - No phone calls, use silent mode
4. **No eating on trains** (except long-distance Shinkansen)
5. **Give up priority seats** for elderly, pregnant, disabled
6. **Don't block doors**
7. **Keep backpacks in front** or on luggage racks

**With strollers:**
- Allowed on all trains
- Look for wheelchair-accessible car
- Fold stroller if very crowded
- Priority seats often have more space

**IC Cards (Suica/Pasmo):**
- Tap once to enter, once to exit
- Reload at any station machine`,
    category: 'etiquette',
  },

  // === PHRASES ===
  {
    questionPattern: 'thank you',
    keywords: ['thank', 'thanks', 'grateful', 'appreciate'],
    response: `**Saying "Thank You" in Japanese:**

**Casual:**
- **Arigatou** (ah-ree-GAH-toh) ありがとう
  - For friends, informal situations

**Polite:**
- **Arigatou gozaimasu** (ah-ree-GAH-toh go-zai-MAS) ありがとうございます
  - For strangers, shops, restaurants

**Past tense (for completed help):**
- **Arigatou gozaimashita** ありがとうございました
  - "Thank you for what you did"

**Super casual (to friends):**
- **Domo** (DOH-moh) どうも
  - Very casual, like a quick "thanks"

**Tip:** When receiving your purchase or change, "arigatou gozaimasu" with a small bow is perfect!`,
    category: 'phrases',
  },
  {
    questionPattern: 'excuse me sorry',
    keywords: ['excuse', 'sorry', 'pardon', 'apology', 'sumimasen'],
    response: `**"Excuse me" / "Sorry" in Japanese:**

**Sumimasen** (soo-mee-mah-SEN) すみません
- Most versatile! Use it for:
  - "Excuse me" (getting attention)
  - "I'm sorry" (minor apology)
  - "Thank you" (for inconvenience caused)

**Gomen nasai** (go-men nah-SAI) ごめんなさい
- "I'm sorry" - more emotional apology
- Good for bumping into someone

**Shitsurei shimasu** (sheet-sue-RAY shee-MAHS) 失礼します
- "Excuse me" when leaving a room
- Or "pardon my rudeness"

**With kids:**
- Teach them "sumimasen" - it covers almost everything!`,
    category: 'phrases',
  },
  {
    questionPattern: 'hello goodbye',
    keywords: ['hello', 'hi', 'goodbye', 'bye', 'greeting', 'konnichiwa'],
    response: `**Greetings in Japanese:**

**Hello:**
- **Ohayou gozaimasu** (oh-HAI-yoh go-zai-MAS) おはようございます - Good morning (until ~10am)
- **Konnichiwa** (kon-NEE-chee-wah) こんにちは - Good afternoon/Hello
- **Konbanwa** (kon-BAN-wah) こんばんは - Good evening

**Goodbye:**
- **Sayounara** (sah-yoh-NAH-rah) さようなら - Goodbye (formal, long goodbye)
- **Ja ne** (jah-NEH) じゃね - See ya! (casual)
- **Mata ne** (MAH-tah-neh) またね - See you later!

**When entering/leaving shops:**
- **Irasshaimase!** - Staff greeting (no need to respond)
- Just a smile and nod is fine when leaving!`,
    category: 'phrases',
  },
  {
    questionPattern: 'how much price',
    keywords: ['how much', 'price', 'cost', 'pay', 'yen', 'ikura'],
    response: `**Asking About Prices:**

**"How much is this?"**
- **Kore wa ikura desu ka?** (KO-reh wah ee-KOO-rah DES-kah)
- これはいくらですか？

**"This one please"**
- **Kore kudasai** (KO-reh koo-dah-SAI)
- これください

**Numbers you'll hear:**
- Hyaku (100) 百
- Sen (1,000) 千
- Man (10,000) 万

**Tips:**
- Most shops display prices clearly
- Cash is still preferred at many places
- Convenience stores accept IC cards everywhere
- Tax is usually included (sometimes marked 税込)`,
    category: 'phrases',
  },

  // === PRACTICAL ===
  {
    questionPattern: 'wifi internet',
    keywords: ['wifi', 'wi-fi', 'internet', 'data', 'connection', 'hotspot'],
    response: `**WiFi & Internet in Japan:**

**You have a pocket WiFi device!**
- It should work throughout your trip
- Keep it charged (battery lasts ~8-10 hours)
- Connect all devices to it

**Backup options:**
- Free WiFi at most stations and convenience stores
- Many cafes and restaurants offer WiFi
- Look for "Free_Wi-Fi" networks

**If pocket WiFi has issues:**
- Check battery level
- Turn off and on again
- Move to a different area (signal varies)

**For emergencies:**
- 7-Eleven and FamilyMart have reliable free WiFi
- Hotel lobbies usually have good connections`,
    category: 'practical',
  },
  {
    questionPattern: 'bathroom toilet',
    keywords: ['bathroom', 'toilet', 'restroom', 'wc', 'washroom', 'loo'],
    response: `**Finding & Using Toilets:**

**Where to find them:**
- Every train station has toilets
- Convenience stores (7-Eleven, FamilyMart)
- Shopping centers and department stores
- Most parks and tourist areas

**Japanese toilet buttons:**
- 大 (dai) = Big flush
- 小 (sho) = Small flush
- 止 (tome) = Stop (for bidet)
- おしり = Rear spray
- ビデ = Front spray
- 乾燥 = Dryer

**Squat toilets:**
- Face the hood/cover
- Less common now, usually have Western option

**Tips:**
- Always carry tissues (some don't have toilet paper)
- "Sound Princess" (音姫) makes flushing sounds for privacy`,
    category: 'practical',
  },
  {
    questionPattern: 'money cash atm',
    keywords: ['money', 'cash', 'atm', 'withdraw', 'bank', 'yen', 'credit'],
    response: `**Money & Cash in Japan:**

**ATMs that accept foreign cards:**
- **7-Eleven** - Most reliable! Available 24/7
- Japan Post Bank (post offices)
- Family Mart

**Tips:**
- Japan is still largely cash-based
- Have ¥20,000-30,000 cash on hand
- Many small shops, shrines, and vending machines are cash only

**Credit cards:**
- Accepted at: Hotels, major stores, chain restaurants
- Often NOT accepted at: Small shops, shrines, some restaurants

**Current exchange rate:** Check your bank app
**No need to exchange at airport** - 7-Eleven ATMs have good rates

**Paying with IC card (Suica/Pasmo):**
- Works at convenience stores, vending machines, many shops`,
    category: 'practical',
  },

  // === EMERGENCY ===
  {
    questionPattern: 'emergency help police',
    keywords: ['emergency', 'help', 'police', 'hospital', 'ambulance', 'fire', 'lost', 'stolen'],
    response: `**Emergency Numbers & Help:**

**Emergency Numbers:**
- **110** - Police (keisatsu)
- **119** - Fire/Ambulance

**Non-emergency police:**
- Koban (交番) - Small police boxes everywhere
- They're helpful for directions too!

**Medical help:**
- Most pharmacies (薬局 yakkyoku) have some English
- Look for 🏥 to find clinics
- Hotels can recommend English-speaking doctors

**Lost items:**
- Check with train station staff first
- Items often returned to lost & found
- Koban can help file reports

**Lost child:**
- Stay calm, staff everywhere can help
- Kids often know to go to a koban or station
- All stations have PA systems

**Travel insurance:** Keep your policy number handy`,
    category: 'emergency',
  },
];

/**
 * Seed the AI cache with pre-generated responses
 */
export async function seedAICache(): Promise<void> {
  console.log('[AI Cache] Seeding pre-cached responses...');

  const now = new Date().toISOString();

  for (const qa of CACHED_RESPONSES) {
    await db.aiCache.put({
      id: `cached-${qa.questionPattern.replace(/\s+/g, '-').toLowerCase()}`,
      contextType: 'faq',
      contextKey: qa.category,
      questionPattern: qa.keywords.join('|'),
      response: qa.response,
      createdAt: now,
    });
  }

  console.log(`[AI Cache] Seeded ${CACHED_RESPONSES.length} cached responses`);
}

/**
 * Find a cached response for a user question
 * Uses simple keyword matching
 */
export function findCachedResponse(question: string): string | null {
  const lowerQuestion = question.toLowerCase();

  for (const qa of CACHED_RESPONSES) {
    // Check if any keyword matches
    const matchCount = qa.keywords.filter((kw) => lowerQuestion.includes(kw)).length;
    if (matchCount >= 2 || (matchCount >= 1 && qa.keywords.length <= 2)) {
      return qa.response;
    }
  }

  return null;
}

/**
 * Get all cached responses for a category
 */
export function getCachedResponsesByCategory(
  category: CachedQA['category']
): CachedQA[] {
  return CACHED_RESPONSES.filter((qa) => qa.category === category);
}
