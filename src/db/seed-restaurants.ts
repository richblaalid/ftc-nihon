/**
 * Restaurant data seeder
 *
 * Transforms the Japan_Restaurants_MapReady.json data into the Restaurant
 * format and seeds it into IndexedDB.
 */

import { db } from './database';
import type { Restaurant, MealAssignment, MealType, MealPriority } from '@/types/database';

/**
 * Raw restaurant data from JSON
 */
interface RawRestaurant {
  id: string;
  name: string;
  nameJapanese?: string;
  type?: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  addressJapanese?: string;
  nearestStation?: string;
  phone?: string;
  hours?: string;
  priceRange?: string;
  kidFriendly?: boolean;
  notes?: string;
  assignedMeals?: Array<{
    day: number;
    date: string;
    meal: string;
    priority: string;
  }>;
}

/**
 * Raw JSON structure
 */
interface RestaurantJson {
  metadata: {
    version: string;
    lastUpdated: string;
  };
  restaurants: {
    tokyo: RawRestaurant[];
    hakone: RawRestaurant[];
    kyoto: RawRestaurant[];
    osaka: RawRestaurant[];
  };
}

/**
 * Transform raw JSON restaurant to our Restaurant type
 */
function transformRestaurant(raw: RawRestaurant, city: string): Restaurant {
  const now = new Date().toISOString();

  // Transform assigned meals to our format
  const assignedMeals: MealAssignment[] | null = raw.assignedMeals?.map((m) => ({
    day: m.day,
    date: m.date,
    meal: m.meal as MealType,
    priority: m.priority as MealPriority,
  })) ?? null;

  // Get first assignment for legacy fields
  const firstAssignment = raw.assignedMeals?.[0];

  return {
    id: raw.id,
    name: raw.name,
    nameJapanese: raw.nameJapanese ?? null,
    type: raw.type ?? null,
    address: raw.address ?? null,
    addressJapanese: raw.addressJapanese ?? null,
    locationLat: raw.coordinates?.lat ?? null,
    locationLng: raw.coordinates?.lng ?? null,
    nearestStation: raw.nearestStation ?? null,
    phone: raw.phone ?? null,
    hours: raw.hours ?? null,
    priceRange: raw.priceRange ?? null,
    isKidFriendly: raw.kidFriendly ?? false,
    notes: raw.notes ?? null,
    googleMapsUrl: null, // Will be generated from coordinates if needed
    websiteUrl: null,
    whatToOrder: null,
    backupAlternative: null,
    city,
    assignedMeals: assignedMeals ? JSON.stringify(assignedMeals) : null,
    // Legacy fields
    dayNumber: firstAssignment?.day ?? null,
    meal: (firstAssignment?.meal as MealType) ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Transform all restaurants from JSON structure
 */
export function transformJsonToRestaurants(json: RestaurantJson): Restaurant[] {
  const restaurants: Restaurant[] = [];

  // Process each city
  const cities = ['tokyo', 'hakone', 'kyoto', 'osaka'] as const;

  for (const city of cities) {
    const cityRestaurants = json.restaurants[city] ?? [];
    for (const raw of cityRestaurants) {
      restaurants.push(transformRestaurant(raw, capitalizeFirst(city)));
    }
  }

  return restaurants;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Seed restaurants from embedded JSON data
 *
 * Note: We embed the data directly to avoid async import issues in the browser.
 * The JSON is small enough (~25KB) that this is acceptable.
 */
export async function seedRestaurantsFromJson(): Promise<void> {
  // Check if already seeded
  const count = await db.restaurants.count();
  if (count > 0) {
    console.log(`[seed-restaurants] Already seeded (${count} restaurants)`);
    return;
  }

  console.log('[seed-restaurants] Seeding restaurant data...');

  // Embedded restaurant data from Japan_Restaurants_MapReady.json
  const restaurantData: RestaurantJson = {
    metadata: {
      version: '3.0-MapReady',
      lastUpdated: '2026-01-27',
    },
    restaurants: {
      tokyo: [
        {
          id: 'tsunahachi',
          name: 'Tsunahachi Shinjuku',
          nameJapanese: 'つな八 新宿本店',
          type: 'Tempura',
          coordinates: { lat: 35.6908459, lng: 139.7034867 },
          address: '3-31-8 Shinjuku, Shinjuku-ku, Tokyo',
          addressJapanese: '〒160-0022 東京都新宿区新宿3-31-8',
          nearestStation: 'Shinjuku-sanchome Station (2 min)',
          phone: '+81-3-3352-1012',
          hours: '11:00-22:00',
          priceRange: '¥1,500-3,000',
          kidFriendly: true,
          notes: 'Est. 1924. Counter seating - watch chefs work.',
          assignedMeals: [
            { day: 2, date: '2026-03-07', meal: 'dinner', priority: 'primary' },
          ],
        },
        {
          id: 'ichiran-shinjuku',
          name: 'Ichiran Shinjuku Central East',
          nameJapanese: '一蘭 新宿中央東口店',
          type: 'Ramen',
          coordinates: { lat: 35.690612, lng: 139.702817 },
          address: 'B1F Peace Building, 3-34-11 Shinjuku',
          addressJapanese: '〒160-0022 東京都新宿区新宿3-34-11 ピースビルB1F',
          nearestStation: 'Shinjuku Station East Exit (3 min)',
          phone: '+81-50-1808-2529',
          hours: '24 hours',
          priceRange: '¥1,000-1,500',
          kidFriendly: true,
          notes: 'Individual booths, customizable. Vending machine ordering.',
          assignedMeals: [
            { day: 2, date: '2026-03-07', meal: 'dinner', priority: 'alternative' },
            { day: 6, date: '2026-03-11', meal: 'dinner', priority: 'primary' },
          ],
        },
        {
          id: 'omoide-yokocho',
          name: 'Omoide Yokocho (Memory Lane)',
          nameJapanese: '思い出横丁',
          type: 'Yokocho',
          coordinates: { lat: 35.6938, lng: 139.6989 },
          address: '1-2 Nishishinjuku, Shinjuku-ku',
          addressJapanese: '〒160-0023 東京都新宿区西新宿1-2',
          nearestStation: 'Shinjuku Station West Exit (1 min)',
          hours: '17:00-24:00 (varies)',
          priceRange: '¥1,000-2,500',
          kidFriendly: false,
          notes: '60+ stalls. Smoky, atmospheric. Adults recommended.',
          assignedMeals: [
            { day: 3, date: '2026-03-08', meal: 'dinner', priority: 'primary' },
          ],
        },
        {
          id: 'torikizoku-kabukicho',
          name: 'Torikizoku Kabukicho',
          nameJapanese: '鳥貴族 新宿歌舞伎町店',
          type: 'Izakaya/Yakitori',
          coordinates: { lat: 35.6949, lng: 139.7032 },
          address: '6F, 1-17-12 Kabukicho, Shinjuku-ku',
          addressJapanese: '〒160-0021 東京都新宿区歌舞伎町1-17-12 6F',
          nearestStation: 'Seibu-Shinjuku Station (3 min)',
          phone: '+81-3-3200-9332',
          hours: '17:00-04:00',
          priceRange: '¥1,500-2,500',
          kidFriendly: true,
          notes: 'ALL ITEMS ¥360! Tablet ordering in English.',
          assignedMeals: [
            { day: 4, date: '2026-03-09', meal: 'dinner', priority: 'primary' },
          ],
        },
        {
          id: 'fuunji',
          name: 'Fuunji',
          nameJapanese: '風雲児',
          type: 'Ramen/Tsukemen',
          coordinates: { lat: 35.6875, lng: 139.6995 },
          address: '1F Hokuto Daiichi Bldg, 2-14-3 Yoyogi, Shibuya-ku',
          addressJapanese: '〒151-0053 東京都渋谷区代々木2-14-3 北斗第一ビル 1F',
          nearestStation: 'Shinjuku Station South Exit (8 min)',
          phone: '+81-6-6413-8480',
          hours: '11:00-15:00, 17:00-21:00 (Closed Sun)',
          priceRange: '¥1,000-1,500',
          kidFriendly: true,
          notes: 'EXPECT 30-60 MIN QUEUE. Same price all sizes.',
          assignedMeals: [
            { day: 4, date: '2026-03-09', meal: 'dinner', priority: 'alternative' },
          ],
        },
        {
          id: 'afuri-harajuku',
          name: 'AFURI Harajuku',
          nameJapanese: '阿夫利 原宿店',
          type: 'Ramen',
          coordinates: { lat: 35.6708, lng: 139.7073 },
          address: '1F Grandeforesta, 3-63-1 Sendagaya, Shibuya-ku',
          addressJapanese: '〒151-0051 東京都渋谷区千駄ヶ谷3-63-1 グランデフォレスタ 1F',
          nearestStation: 'Harajuku Station (5 min)',
          phone: '+81-3-6438-1910',
          hours: '10:00-23:00',
          priceRange: '¥1,000-1,500',
          kidFriendly: true,
          notes: 'Light yuzu ramen. Vegan options. Cashless.',
          assignedMeals: [
            { day: 4, date: '2026-03-09', meal: 'lunch', priority: 'primary' },
          ],
        },
        {
          id: 'marion-crepes',
          name: 'Marion Crepes Takeshita',
          nameJapanese: 'マリオンクレープ 竹下通り店',
          type: 'Crepes/Dessert',
          coordinates: { lat: 35.6716, lng: 139.7027 },
          address: 'Takeshita Street, Jingumae, Shibuya-ku',
          addressJapanese: '〒150-0001 東京都渋谷区神宮前1丁目 竹下通り',
          nearestStation: 'Harajuku Station (1 min)',
          hours: '10:30-20:00',
          priceRange: '¥500-800',
          kidFriendly: true,
          notes: 'Iconic Harajuku crepes since 1976.',
          assignedMeals: [
            { day: 4, date: '2026-03-09', meal: 'snack', priority: 'primary' },
          ],
        },
        {
          id: 'gyukatsu-motomura',
          name: 'Gyukatsu Motomura Harajuku',
          nameJapanese: '牛かつ もと村 原宿店',
          type: 'Gyukatsu',
          coordinates: { lat: 35.6695, lng: 139.7045 },
          address: 'Harajuku area, Shibuya-ku',
          nearestStation: 'Harajuku Station',
          hours: '11:00-22:00',
          priceRange: '¥1,500-2,500',
          kidFriendly: true,
          notes: 'Cook beef cutlet yourself on hot stone. Fun for kids!',
          assignedMeals: [
            { day: 4, date: '2026-03-09', meal: 'lunch', priority: 'alternative' },
          ],
        },
        {
          id: 'syabu-yo-akihabara',
          name: 'Syabu-YŌ Akihabara',
          nameJapanese: 'しゃぶ葉 秋葉原店',
          type: 'Shabu-shabu',
          coordinates: { lat: 35.6984, lng: 139.7731 },
          address: 'Akihabara area, Chiyoda-ku',
          nearestStation: 'Akihabara Station',
          hours: '11:00-23:00',
          priceRange: '¥2,000-3,500',
          kidFriendly: true,
          notes: '🤖 ROBOT SERVERS! All-you-can-eat hot pot.',
          assignedMeals: [
            { day: 5, date: '2026-03-10', meal: 'lunch', priority: 'primary' },
          ],
        },
        {
          id: 'ebisu-yokocho',
          name: 'Ebisu Yokocho',
          nameJapanese: '恵比寿横丁',
          type: 'Yokocho',
          coordinates: { lat: 35.6469, lng: 139.7102 },
          address: '1-7-4 Ebisu, Shibuya-ku',
          addressJapanese: '〒150-0013 東京都渋谷区恵比寿1-7-4',
          nearestStation: 'Ebisu Station West Exit (3 min)',
          hours: '17:00-05:00 (varies)',
          priceRange: '¥2,000-4,000',
          kidFriendly: false,
          notes: 'Very local, 20+ stalls. Adults recommended.',
          assignedMeals: [
            { day: 5, date: '2026-03-10', meal: 'dinner', priority: 'primary' },
          ],
        },
        {
          id: 'afuri-ebisu',
          name: 'AFURI Ebisu (Original)',
          nameJapanese: '阿夫利 恵比寿店',
          type: 'Ramen',
          coordinates: { lat: 35.6484, lng: 139.7109 },
          address: '1F 117 Building, 1-1-7 Ebisu, Shibuya-ku',
          addressJapanese: '〒150-0013 東京都渋谷区恵比寿1-1-7 117ビル 1F',
          nearestStation: 'Ebisu Station (3 min)',
          phone: '+81-3-5795-0750',
          hours: '11:00-05:00',
          priceRange: '¥1,000-1,500',
          kidFriendly: true,
          notes: 'Original AFURI. Cashless only. Open late.',
          assignedMeals: [
            { day: 5, date: '2026-03-10', meal: 'dinner', priority: 'alternative' },
          ],
        },
        {
          id: 'yanaka-ginza',
          name: 'Yanaka Ginza Shopping Street',
          nameJapanese: '谷中銀座商店街',
          type: 'Shopping Street',
          coordinates: { lat: 35.7272, lng: 139.7645 },
          address: '3 Yanaka, Taito-ku',
          addressJapanese: '〒110-0001 東京都台東区谷中3丁目',
          nearestStation: 'Nippori Station (5 min)',
          hours: '10:00-19:00 (varies)',
          priceRange: '¥200-800/item',
          kidFriendly: true,
          notes: 'Cat-themed! Croquettes, menchi-katsu. Famous sunset stairs.',
          assignedMeals: [
            { day: 3, date: '2026-03-08', meal: 'snack', priority: 'primary' },
          ],
        },
        {
          id: 'matsuya',
          name: 'Matsuya (Gyudon Chain)',
          nameJapanese: '松屋',
          type: 'Fast Food/Gyudon',
          coordinates: { lat: 35.6896, lng: 139.7006 },
          address: 'Various locations - Shinjuku area',
          hours: '24 hours (most)',
          priceRange: '¥400-800',
          kidFriendly: true,
          notes: 'Quick, cheap, everywhere. Free miso soup.',
          assignedMeals: [
            { day: 6, date: '2026-03-11', meal: 'dinner', priority: 'alternative' },
          ],
        },
      ],
      hakone: [
        {
          id: 'yoshimatsu-ryokan',
          name: 'Takumino Yado Yoshimatsu',
          nameJapanese: '匠の宿 吉松',
          type: 'Ryokan',
          coordinates: { lat: 35.2319, lng: 139.1047 },
          address: '521 Yumoto, Hakone-machi, Ashigarashimo-gun',
          addressJapanese: '〒250-0311 神奈川県足柄下郡箱根町湯本521',
          phone: '+81-460-85-5566',
          priceRange: 'INCLUDED',
          kidFriendly: true,
          notes: 'KAISEKI DINNER & BREAKFAST INCLUDED. Call before 5pm for pickup.',
          assignedMeals: [
            { day: 7, date: '2026-03-12', meal: 'dinner', priority: 'INCLUDED' },
            { day: 8, date: '2026-03-13', meal: 'breakfast', priority: 'INCLUDED' },
            { day: 8, date: '2026-03-13', meal: 'dinner', priority: 'INCLUDED' },
            { day: 9, date: '2026-03-14', meal: 'breakfast', priority: 'INCLUDED' },
          ],
        },
      ],
      kyoto: [
        {
          id: 'nishiki-market',
          name: 'Nishiki Market',
          nameJapanese: '錦市場',
          type: 'Market',
          coordinates: { lat: 35.005, lng: 135.7649 },
          address: '609 Nishidaimonji-cho, Nakagyo-ku, Kyoto',
          addressJapanese: '〒604-8054 京都市中京区西大文字町609',
          nearestStation: 'Shijo Station (3 min)',
          phone: '+81-75-211-3882',
          hours: '9:00-18:00 (varies)',
          priceRange: '¥500-2,000',
          kidFriendly: true,
          notes: '400+ years! NO EATING WHILE WALKING - eat where you buy.',
          assignedMeals: [
            { day: 10, date: '2026-03-15', meal: 'lunch', priority: 'primary' },
          ],
        },
        {
          id: 'ippudo-kyoto',
          name: 'Ippudo Kyoto Nishiki',
          nameJapanese: '一風堂 京都錦小路店',
          type: 'Ramen',
          coordinates: { lat: 35.0045, lng: 135.7655 },
          address: 'Near Nishiki Market, Nakagyo-ku',
          nearestStation: 'Shijo Station',
          hours: '11:00-22:00',
          priceRange: '¥900-1,500',
          kidFriendly: true,
          notes: 'Reliable backup for familiar food. English menu.',
          assignedMeals: [
            { day: 10, date: '2026-03-15', meal: 'lunch', priority: 'alternative' },
          ],
        },
        {
          id: 'pontocho',
          name: 'Pontocho Alley',
          nameJapanese: '先斗町',
          type: 'Restaurant Alley',
          coordinates: { lat: 35.0062, lng: 135.7707 },
          address: 'Pontocho, Nakagyo-ku, Kyoto',
          addressJapanese: '〒604-8016 京都市中京区先斗町',
          nearestStation: 'Kawaramachi Station (3 min)',
          hours: '17:00-23:00 (varies)',
          priceRange: '¥3,000-10,000+',
          kidFriendly: true,
          notes: 'Historic geisha district. Riverside terraces in summer.',
          assignedMeals: [
            { day: 11, date: '2026-03-16', meal: 'dinner', priority: 'primary' },
          ],
        },
        {
          id: 'arabica-arashiyama',
          name: '% Arabica Arashiyama',
          nameJapanese: 'アラビカ 京都 嵐山',
          type: 'Coffee',
          coordinates: { lat: 35.0142, lng: 135.6778 },
          address: '3-47 Sagatenryuji Susukinobabacho, Ukyo-ku',
          addressJapanese: '〒616-8385 京都市右京区嵯峨天龍寺芒ノ馬場町3-47',
          nearestStation: 'Arashiyama Station',
          hours: '8:00-18:00',
          priceRange: '¥500-800',
          kidFriendly: true,
          notes: 'Instagram-famous riverside coffee. Go early.',
          assignedMeals: [
            { day: 11, date: '2026-03-16', meal: 'snack', priority: 'primary' },
          ],
        },
      ],
      osaka: [
        {
          id: 'dotonbori',
          name: 'Dotonbori',
          nameJapanese: '道頓堀',
          type: 'Street Food District',
          coordinates: { lat: 34.6687, lng: 135.5013 },
          address: 'Dotonbori, Chuo-ku, Osaka',
          addressJapanese: '〒542-0071 大阪市中央区道頓堀',
          nearestStation: 'Namba Station Exit 14 (2 min)',
          phone: '+81-6-6211-4542',
          hours: '11:00-late (varies)',
          priceRange: '¥500-3,000',
          kidFriendly: true,
          notes: 'THE iconic Osaka food street. Glico sign, giant crab.',
          assignedMeals: [
            { day: 12, date: '2026-03-17', meal: 'dinner', priority: 'primary' },
          ],
        },
        {
          id: 'wanaka-takoyaki',
          name: 'Wanaka Takoyaki',
          nameJapanese: 'わなか たこ焼き',
          type: 'Takoyaki',
          coordinates: { lat: 34.6685, lng: 135.5025 },
          address: 'Dotonbori area, Chuo-ku',
          hours: '10:00-23:00',
          priceRange: '¥500-800',
          kidFriendly: true,
          notes: 'Crispiest takoyaki in Dotonbori.',
          assignedMeals: [
            { day: 12, date: '2026-03-17', meal: 'snack', priority: 'primary' },
          ],
        },
        {
          id: 'mizuno-okonomiyaki',
          name: 'Mizuno Okonomiyaki',
          nameJapanese: '美津の お好み焼き',
          type: 'Okonomiyaki',
          coordinates: { lat: 34.6684, lng: 135.502 },
          address: '1-4-15 Dotonbori, Chuo-ku',
          addressJapanese: '〒542-0071 大阪市中央区道頓堀1-4-15',
          nearestStation: 'Namba Station',
          phone: '+81-6-6212-6360',
          hours: '11:00-22:00',
          priceRange: '¥1,200-2,000',
          kidFriendly: true,
          notes: 'Est. 1945! Famous yamaimo-style. EXPECT LINES.',
          assignedMeals: [
            { day: 12, date: '2026-03-17', meal: 'dinner', priority: 'alternative' },
          ],
        },
        {
          id: 'kuromon-market',
          name: 'Kuromon Market',
          nameJapanese: '黒門市場',
          type: 'Market',
          coordinates: { lat: 34.6627, lng: 135.5063 },
          address: '2-4-1 Nipponbashi, Chuo-ku',
          addressJapanese: '〒542-0073 大阪市中央区日本橋2-4-1',
          nearestStation: 'Nipponbashi Station (5 min)',
          hours: '9:00-18:00',
          priceRange: '¥1,000-5,000',
          kidFriendly: true,
          notes: "'Osaka's Kitchen' - 170+ shops. Fresh sashimi, wagyu.",
          assignedMeals: [
            { day: 13, date: '2026-03-18', meal: 'lunch', priority: 'primary' },
          ],
        },
        {
          id: 'tower-knives',
          name: 'Tower Knives Osaka',
          nameJapanese: 'タワーナイブズ大阪',
          type: 'Knife Shop',
          coordinates: { lat: 34.652, lng: 135.5058 },
          address: '1-7-23 Nipponbashi, Chuo-ku',
          addressJapanese: '〒542-0073 大阪市中央区日本橋1-7-23',
          nearestStation: 'Nipponbashi Station',
          phone: '+81-6-6644-8870',
          hours: '10:00-19:00',
          priceRange: '¥5,000-50,000+',
          kidFriendly: true,
          notes: 'FREE ENGRAVING! English staff. Great souvenirs.',
          assignedMeals: [
            { day: 13, date: '2026-03-18', meal: 'afternoon', priority: 'primary' },
          ],
        },
      ],
    },
  };

  const restaurants = transformJsonToRestaurants(restaurantData);

  // Bulk insert all restaurants
  await db.restaurants.bulkPut(restaurants);

  console.log(`[seed-restaurants] Seeded ${restaurants.length} restaurants`);
}

/**
 * Get restaurant options for a specific day and meal
 */
export async function getRestaurantOptionsForMeal(
  dayNumber: number,
  meal: MealType
): Promise<{ primary: Restaurant | null; alternatives: Restaurant[] }> {
  const allRestaurants = await db.restaurants.toArray();

  let primary: Restaurant | null = null;
  const alternatives: Restaurant[] = [];

  for (const restaurant of allRestaurants) {
    if (!restaurant.assignedMeals) continue;

    const assignments: MealAssignment[] = JSON.parse(restaurant.assignedMeals);

    for (const assignment of assignments) {
      if (assignment.day === dayNumber && assignment.meal === meal) {
        if (assignment.priority === 'primary' || assignment.priority === 'INCLUDED') {
          primary = restaurant;
        } else {
          alternatives.push(restaurant);
        }
        break; // Only count once per restaurant
      }
    }
  }

  return { primary, alternatives };
}
