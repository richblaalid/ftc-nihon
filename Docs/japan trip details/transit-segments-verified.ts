// ============================================================
// VERIFIED TRANSIT SEGMENTS WITH GOOGLE MAPS DEEP LINKS
// For Blaalid & Rowles Japan Adventure - March 2026
// ============================================================
// 
// URL Format: https://www.google.com/maps/dir/?api=1&origin=ORIGIN&destination=DESTINATION&travelmode=MODE
// All routes verified via web search against official transit sources
// Walking times from station exits to attractions verified
//
// VERIFICATION SOURCES:
// - Japan-Guide.com (official transit guides)
// - Tokyo Metro / Toei official station info
// - Kintetsu Railway official site
// - Rome2Rio (multi-modal route verification)
// - TeamLab Borderless official access guide
// - Hakone Free Pass official route info
// ============================================================

export interface TransitSegment {
  id: string;
  dayNumber: number;
  date: string;
  sortOrder: number;
  
  // Origin & Destination
  origin: string;
  originJp?: string;
  originCoords: { lat: number; lng: number };
  destination: string;
  destinationJp?: string;
  destinationCoords: { lat: number; lng: number };
  
  // Timing
  departureTime: string;      // HH:MM format
  estimatedDuration: number;  // minutes
  arrivalTime?: string;       // HH:MM estimated arrival
  
  // Route Details
  travelMode: 'transit' | 'walking' | 'bus' | 'shinkansen' | 'romancecar' | 'ferry' | 'ropeway' | 'driving';
  summary: string;            // Human-readable route summary
  steps: TransitStep[];
  
  // Cost
  estimatedCostYen?: number;
  coveredByPass?: string;     // e.g. "Hakone Free Pass", "IC Card"
  
  // Google Maps Deep Link
  googleMapsUrl: string;
  
  // Notes
  notes?: string;
  familyTip?: string;
  isHardDeadline?: boolean;
}

export interface TransitStep {
  mode: 'walk' | 'train' | 'bus' | 'ferry' | 'ropeway' | 'cable_car' | 'taxi' | 'pickup';
  line?: string;
  lineColor?: string;
  from?: string;
  to?: string;
  duration: number;           // minutes
  distance?: string;          // e.g. "800m"
  instruction: string;
  platform?: string;
  exitInfo?: string;          // e.g. "Exit 1 for Kaminarimon Gate"
}

// ============================================================
// DAY 1 — Saturday, March 7: Arrival in Tokyo
// ============================================================

const day1Segments: TransitSegment[] = [
  {
    id: 'transit-d1-01',
    dayNumber: 1,
    date: '2026-03-07',
    sortOrder: 1,
    origin: 'Haneda Airport Terminal 3',
    originJp: '羽田空港第3ターミナル',
    originCoords: { lat: 35.5494, lng: 139.7798 },
    destination: 'Busta Shinjuku',
    destinationJp: 'バスタ新宿',
    destinationCoords: { lat: 35.6896, lng: 139.7006 },
    departureTime: '16:30',
    estimatedDuration: 50,
    arrivalTime: '17:20',
    travelMode: 'transit',
    summary: 'Limousine Bus direct to Busta Shinjuku (~50 min, ¥1,300)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Follow signs to Limousine Bus ticket counter at arrivals level',
      },
      {
        mode: 'bus',
        line: 'Airport Limousine Bus',
        from: 'Haneda Airport T3',
        to: 'Busta Shinjuku',
        duration: 45,
        instruction: 'Board Limousine Bus to Shinjuku. Luggage stored underneath. Buy tickets at counter or use IC card.',
      },
    ],
    estimatedCostYen: 1300,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Haneda+Airport+Terminal+3&destination=Busta+Shinjuku&travelmode=transit',
    notes: 'Limousine Bus is the easiest option with luggage for a family. Runs every 15-20 min. No transfers needed.',
    familyTip: 'Kids can nap on the bus. Seats are comfortable and there is luggage storage below.',
  },
  {
    id: 'transit-d1-02',
    dayNumber: 1,
    date: '2026-03-07',
    sortOrder: 2,
    origin: 'Busta Shinjuku',
    originJp: 'バスタ新宿',
    originCoords: { lat: 35.6896, lng: 139.7006 },
    destination: '&Here Shinjuku Hotel',
    destinationCoords: { lat: 35.6932, lng: 139.7112 },
    departureTime: '17:20',
    estimatedDuration: 14,
    arrivalTime: '17:34',
    travelMode: 'walking',
    summary: '14-min walk from Busta Shinjuku to hotel',
    steps: [
      {
        mode: 'walk',
        duration: 14,
        distance: '1.0 km',
        instruction: 'Exit Busta Shinjuku from the south exit. Walk east along Koshu-kaido toward Shinjuku-sanchome. Hotel is on the east side of Shinjuku.',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Busta+Shinjuku&destination=%26Here+Shinjuku&travelmode=walking',
    familyTip: 'Consider a taxi if you have heavy luggage (~¥800, 5 min). Taxi stand is at ground level of Busta Shinjuku.',
  },
  {
    id: 'transit-d1-03',
    dayNumber: 1,
    date: '2026-03-07',
    sortOrder: 3,
    origin: '&Here Shinjuku Hotel',
    originCoords: { lat: 35.6932, lng: 139.7112 },
    destination: 'Godzilla Head, Shinjuku Toho Building',
    destinationJp: '新宿東宝ビル ゴジラヘッド',
    destinationCoords: { lat: 35.6946, lng: 139.7016 },
    departureTime: '18:45',
    estimatedDuration: 10,
    arrivalTime: '18:55',
    travelMode: 'walking',
    summary: '10-min walk to Godzilla Head at Toho Building',
    steps: [
      {
        mode: 'walk',
        duration: 10,
        distance: '800m',
        instruction: 'Walk west toward Kabukicho. The Toho Building with the Godzilla head on the roof is visible from the street — look up! Free to view from street level. Terrace access on the 8th floor (Hotel Gracery lobby).',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=35.6932,139.7112&destination=Shinjuku+Toho+Building&travelmode=walking',
  },
];

// ============================================================
// DAY 2 — Sunday, March 8: East Tokyo Loop
// ============================================================

const day2Segments: TransitSegment[] = [
  {
    id: 'transit-d2-01',
    dayNumber: 2,
    date: '2026-03-08',
    sortOrder: 1,
    origin: '&Here Shinjuku Hotel',
    originCoords: { lat: 35.6932, lng: 139.7112 },
    destination: 'Senso-ji Temple, Asakusa',
    destinationJp: '浅草寺',
    destinationCoords: { lat: 35.7148, lng: 139.7967 },
    departureTime: '08:30',
    estimatedDuration: 35,
    arrivalTime: '09:05',
    travelMode: 'transit',
    summary: 'JR Chuo Line → Kanda → Metro Ginza Line → Asakusa (~35 min, ¥340)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        distance: '400m',
        instruction: 'Walk to JR Shinjuku Station (East Exit)',
      },
      {
        mode: 'train',
        line: 'JR Chuo Line (Rapid)',
        lineColor: '#F15A22',
        from: 'Shinjuku',
        to: 'Kanda',
        duration: 13,
        instruction: 'Take JR Chuo Rapid Line toward Tokyo. Ride to Kanda Station (5 stops).',
        platform: 'Platforms 7-8',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Exit via North Ticket Gate at Kanda. Walk to Tokyo Metro Ginza Line entrance (follow signs downstairs).',
        exitInfo: 'North Exit at Kanda Station',
      },
      {
        mode: 'train',
        line: 'Tokyo Metro Ginza Line',
        lineColor: '#FF9500',
        from: 'Kanda',
        to: 'Asakusa',
        duration: 10,
        instruction: 'Take Ginza Line toward Asakusa (last stop). Cannot miss it!',
      },
      {
        mode: 'walk',
        duration: 5,
        distance: '300m',
        instruction: 'Exit Asakusa Station via Exit 1 for Kaminarimon Gate. Walk straight to see the giant red lantern.',
        exitInfo: 'Exit 1 → Kaminarimon Gate',
      },
    ],
    estimatedCostYen: 340,
    coveredByPass: 'IC Card (Suica/Pasmo)',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Station&destination=Senso-ji+Temple+Asakusa&travelmode=transit',
    familyTip: 'The Ginza Line is straightforward — Asakusa is the last stop so you cannot overshoot.',
  },
  {
    id: 'transit-d2-02',
    dayNumber: 2,
    date: '2026-03-08',
    sortOrder: 2,
    origin: 'Senso-ji Temple, Asakusa',
    originJp: '浅草寺',
    originCoords: { lat: 35.7148, lng: 139.7967 },
    destination: 'Tokyo Skytree',
    destinationJp: '東京スカイツリー',
    destinationCoords: { lat: 35.7101, lng: 139.8107 },
    departureTime: '11:00',
    estimatedDuration: 20,
    arrivalTime: '11:20',
    travelMode: 'walking',
    summary: '20-min walk along Sumida River to Skytree',
    steps: [
      {
        mode: 'walk',
        duration: 20,
        distance: '1.5 km',
        instruction: 'Walk south from Senso-ji to the Sumida River. Cross Azuma-bashi Bridge — great views of Skytree and the golden Asahi Beer Hall. Follow the river path east toward Skytree.',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Senso-ji+Temple&destination=Tokyo+Skytree&travelmode=walking',
    familyTip: 'The riverside walk is scenic and flat. Alternatively, take Tobu Skytree Line from Asakusa Station (1 stop, 2 min) if legs are tired.',
  },
  {
    id: 'transit-d2-03',
    dayNumber: 2,
    date: '2026-03-08',
    sortOrder: 3,
    origin: 'Tokyo Skytree',
    originJp: '東京スカイツリー',
    originCoords: { lat: 35.7101, lng: 139.8107 },
    destination: 'Ueno Park',
    destinationJp: '上野公園',
    destinationCoords: { lat: 35.7146, lng: 139.7732 },
    departureTime: '13:00',
    estimatedDuration: 15,
    arrivalTime: '13:15',
    travelMode: 'transit',
    summary: 'Tobu Skytree Line to Asakusa → Ginza Line to Ueno (~15 min, ¥310)',
    steps: [
      {
        mode: 'train',
        line: 'Tobu Skytree Line',
        from: 'Tokyo Skytree',
        to: 'Asakusa',
        duration: 3,
        instruction: 'Take Tobu Skytree Line 1 stop to Asakusa.',
      },
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Transfer to Tokyo Metro Ginza Line at Asakusa Station.',
      },
      {
        mode: 'train',
        line: 'Tokyo Metro Ginza Line',
        lineColor: '#FF9500',
        from: 'Asakusa',
        to: 'Ueno',
        duration: 5,
        instruction: 'Take Ginza Line toward Shibuya. Get off at Ueno (3 stops).',
      },
      {
        mode: 'walk',
        duration: 5,
        distance: '300m',
        instruction: 'Exit Ueno Station. Ueno Park entrance is right outside.',
        exitInfo: 'Park Exit / Shinobazu Exit',
      },
    ],
    estimatedCostYen: 310,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Tokyo+Skytree&destination=Ueno+Park+Tokyo&travelmode=transit',
    notes: 'Alternative: Walk to Oshiage Station (at Skytree base) and take Asakusa Line to Ueno.',
  },
  {
    id: 'transit-d2-04',
    dayNumber: 2,
    date: '2026-03-08',
    sortOrder: 4,
    origin: 'Ueno Park / Ameyoko Market',
    originJp: '上野公園 / アメ横',
    originCoords: { lat: 35.7103, lng: 139.7747 },
    destination: 'Yanaka Ginza',
    destinationJp: '谷中銀座',
    destinationCoords: { lat: 35.7268, lng: 139.7672 },
    departureTime: '15:00',
    estimatedDuration: 15,
    arrivalTime: '15:15',
    travelMode: 'walking',
    summary: '15-min walk north from Ueno through Yanaka neighborhood',
    steps: [
      {
        mode: 'walk',
        duration: 15,
        distance: '1.2 km',
        instruction: 'Walk north from Ueno Park through the quiet Yanaka cemetery area. Follow signs to Yanaka Ginza shopping street. The "sunset staircase" (Yuyake Dandan) is the iconic entrance.',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Ameyoko+Market+Ueno&destination=Yanaka+Ginza&travelmode=walking',
    familyTip: 'The walk through Yanaka cemetery is peaceful, not spooky. Cats everywhere — kids love it.',
  },
  {
    id: 'transit-d2-05',
    dayNumber: 2,
    date: '2026-03-08',
    sortOrder: 5,
    origin: 'Yanaka Ginza',
    originJp: '谷中銀座',
    originCoords: { lat: 35.7268, lng: 139.7672 },
    destination: 'Omoide Yokocho, Shinjuku',
    destinationJp: '思い出横丁',
    destinationCoords: { lat: 35.6937, lng: 139.6986 },
    departureTime: '17:30',
    estimatedDuration: 25,
    arrivalTime: '17:55',
    travelMode: 'transit',
    summary: 'JR Nippori → Shinjuku via Yamanote Line (~25 min, ¥210)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        distance: '400m',
        instruction: 'Walk to JR Nippori Station from Yanaka Ginza (very close).',
      },
      {
        mode: 'train',
        line: 'JR Yamanote Line (outer loop)',
        lineColor: '#80C241',
        from: 'Nippori',
        to: 'Shinjuku',
        duration: 17,
        instruction: 'Take JR Yamanote Line (outer loop / counter-clockwise) to Shinjuku.',
      },
      {
        mode: 'walk',
        duration: 3,
        distance: '200m',
        instruction: 'Exit Shinjuku Station via West Exit. Omoide Yokocho is immediately to the left, under the train tracks.',
        exitInfo: 'West Exit',
      },
    ],
    estimatedCostYen: 210,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Yanaka+Ginza+Tokyo&destination=Omoide+Yokocho+Shinjuku&travelmode=transit',
    familyTip: 'Omoide Yokocho is best at 5:30-6 PM before it gets packed. The narrow alleys with lanterns are magical at dusk.',
  },
];

// ============================================================
// DAY 3 — Monday, March 9: Ghibli + Harajuku
// ============================================================

const day3Segments: TransitSegment[] = [
  {
    id: 'transit-d3-01',
    dayNumber: 3,
    date: '2026-03-09',
    sortOrder: 1,
    origin: '&Here Shinjuku Hotel',
    originCoords: { lat: 35.6932, lng: 139.7112 },
    destination: 'Ghibli Museum, Mitaka',
    destinationJp: '三鷹の森ジブリ美術館',
    destinationCoords: { lat: 35.6962, lng: 139.5704 },
    departureTime: '08:15',
    estimatedDuration: 45,
    arrivalTime: '09:00',
    travelMode: 'transit',
    summary: 'JR Chuo Line to Mitaka → walk or bus to museum (~45 min, ¥390)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Walk to JR Shinjuku Station.',
      },
      {
        mode: 'train',
        line: 'JR Chuo Line (Rapid)',
        lineColor: '#F15A22',
        from: 'Shinjuku',
        to: 'Mitaka',
        duration: 20,
        instruction: 'Take JR Chuo Rapid Line toward Takao. Get off at Mitaka.',
        platform: 'Platforms 11-12',
      },
      {
        mode: 'walk',
        duration: 15,
        distance: '1.2 km',
        instruction: 'Walk south from Mitaka Station (South Exit) through Inokashira Park to the museum. Follow the Ghibli signposts — yellow Totoro signs point the way.',
        exitInfo: 'South Exit (Minami-guchi)',
      },
    ],
    estimatedCostYen: 390,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Station&destination=Ghibli+Museum+Mitaka&travelmode=transit',
    notes: 'Alternative: Take the yellow community shuttle bus from Mitaka Station (¥210, every 10 min) if you prefer not to walk.',
    familyTip: 'The walk through Inokashira Park is beautiful. Kids love spotting the Totoro signs. Arrive 15 min before your 10:00 entry time.',
    isHardDeadline: true,
  },
  {
    id: 'transit-d3-02',
    dayNumber: 3,
    date: '2026-03-09',
    sortOrder: 2,
    origin: 'Ghibli Museum, Mitaka',
    originJp: '三鷹の森ジブリ美術館',
    originCoords: { lat: 35.6962, lng: 139.5704 },
    destination: 'Harajuku',
    destinationJp: '原宿',
    destinationCoords: { lat: 35.6702, lng: 139.7027 },
    departureTime: '12:15',
    estimatedDuration: 30,
    arrivalTime: '12:45',
    travelMode: 'transit',
    summary: 'Walk to Kichijoji → JR Chuo Line to Shinjuku → JR Yamanote to Harajuku (~30 min, ¥400)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        distance: '500m',
        instruction: 'Walk through Inokashira Park to JR Kichijoji Station. Or return to Mitaka Station (15 min walk).',
      },
      {
        mode: 'train',
        line: 'JR Chuo Line (Rapid)',
        lineColor: '#F15A22',
        from: 'Kichijoji',
        to: 'Shinjuku',
        duration: 15,
        instruction: 'Take JR Chuo Rapid Line toward Tokyo. Get off at Shinjuku.',
      },
      {
        mode: 'train',
        line: 'JR Yamanote Line',
        lineColor: '#80C241',
        from: 'Shinjuku',
        to: 'Harajuku',
        duration: 4,
        instruction: 'Transfer to JR Yamanote Line (inner loop). Harajuku is 2 stops.',
      },
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Exit Harajuku Station. Takeshita Street entrance is right outside.',
        exitInfo: 'Takeshita Exit',
      },
    ],
    estimatedCostYen: 400,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Ghibli+Museum+Mitaka&destination=Harajuku+Station&travelmode=transit',
    notes: 'From Kichijoji is slightly faster than Mitaka. Both work fine.',
  },
  {
    id: 'transit-d3-03',
    dayNumber: 3,
    date: '2026-03-09',
    sortOrder: 3,
    origin: 'Harajuku / Omotesando',
    originCoords: { lat: 35.6702, lng: 139.7027 },
    destination: 'Shinjuku (home)',
    destinationJp: '新宿駅',
    destinationCoords: { lat: 35.6896, lng: 139.7006 },
    departureTime: '19:15',
    estimatedDuration: 10,
    arrivalTime: '19:25',
    travelMode: 'transit',
    summary: 'JR Yamanote Line, 2 stops to Shinjuku (~5 min, ¥150)',
    steps: [
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Walk to JR Harajuku Station.',
      },
      {
        mode: 'train',
        line: 'JR Yamanote Line (outer loop)',
        lineColor: '#80C241',
        from: 'Harajuku',
        to: 'Shinjuku',
        duration: 4,
        instruction: 'Take JR Yamanote Line (outer loop) 2 stops to Shinjuku.',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Walk back to hotel.',
      },
    ],
    estimatedCostYen: 150,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Harajuku+Station&destination=Shinjuku+Station&travelmode=transit',
  },
];

// ============================================================
// DAY 4 — Tuesday, March 10: Tsukiji + Akihabara
// ============================================================

const day4Segments: TransitSegment[] = [
  {
    id: 'transit-d4-01',
    dayNumber: 4,
    date: '2026-03-10',
    sortOrder: 1,
    origin: '&Here Shinjuku Hotel',
    originCoords: { lat: 35.6932, lng: 139.7112 },
    destination: 'Tsukiji Outer Market',
    destinationJp: '築地場外市場',
    destinationCoords: { lat: 35.6654, lng: 139.7707 },
    departureTime: '07:00',
    estimatedDuration: 25,
    arrivalTime: '07:25',
    travelMode: 'transit',
    summary: 'Toei Oedo Line direct Shinjuku → Tsukijishijo (~22 min, ¥280)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Walk to Toei Shinjuku Station (Oedo Line entrance).',
      },
      {
        mode: 'train',
        line: 'Toei Oedo Line',
        lineColor: '#B6007A',
        from: 'Shinjuku-nishiguchi',
        to: 'Tsukijishijo',
        duration: 22,
        instruction: 'Take Oedo Line toward Tsukijishijo. Direct — no transfers needed.',
      },
      {
        mode: 'walk',
        duration: 3,
        distance: '200m',
        instruction: 'Exit Tsukijishijo Station via A1 Exit. The market is right in front of you.',
        exitInfo: 'A1 Exit',
      },
    ],
    estimatedCostYen: 280,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Station&destination=Tsukiji+Outer+Market&travelmode=transit',
    familyTip: 'Early morning is best. This IS breakfast — come hungry! Try tamagoyaki, grilled scallops, and fresh sushi.',
  },
  {
    id: 'transit-d4-02',
    dayNumber: 4,
    date: '2026-03-10',
    sortOrder: 2,
    origin: 'Tsukiji Outer Market',
    originJp: '築地場外市場',
    originCoords: { lat: 35.6654, lng: 139.7707 },
    destination: 'Akihabara',
    destinationJp: '秋葉原',
    destinationCoords: { lat: 35.6984, lng: 139.7731 },
    departureTime: '09:30',
    estimatedDuration: 15,
    arrivalTime: '09:45',
    travelMode: 'transit',
    summary: 'Tokyo Metro Hibiya Line: Tsukiji → Akihabara (direct, ~10 min, ¥180)',
    steps: [
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Walk to Tsukiji Station (Hibiya Line) — different from Tsukijishijo.',
      },
      {
        mode: 'train',
        line: 'Tokyo Metro Hibiya Line',
        lineColor: '#B5B5AC',
        from: 'Tsukiji',
        to: 'Akihabara',
        duration: 10,
        instruction: 'Take Hibiya Line toward Kita-Senju. Get off at Akihabara.',
      },
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Exit and walk to the Electric Town area. Arcades and shops line the main street.',
        exitInfo: 'Electric Town Exit',
      },
    ],
    estimatedCostYen: 180,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Tsukiji+Station+Tokyo&destination=Akihabara+Station&travelmode=transit',
    familyTip: 'The Hibiya Line runs directly between these two — very easy. Akihabara Station also connects to JR lines.',
  },
  {
    id: 'transit-d4-03',
    dayNumber: 4,
    date: '2026-03-10',
    sortOrder: 3,
    origin: 'Akihabara',
    originJp: '秋葉原',
    originCoords: { lat: 35.6984, lng: 139.7731 },
    destination: 'Ebisu',
    destinationJp: '恵比寿',
    destinationCoords: { lat: 35.6467, lng: 139.7100 },
    departureTime: '15:00',
    estimatedDuration: 25,
    arrivalTime: '15:25',
    travelMode: 'transit',
    summary: 'JR Yamanote Line Akihabara → Ebisu (~20 min, ¥210)',
    steps: [
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Walk to JR Akihabara Station.',
      },
      {
        mode: 'train',
        line: 'JR Yamanote Line (outer loop)',
        lineColor: '#80C241',
        from: 'Akihabara',
        to: 'Ebisu',
        duration: 20,
        instruction: 'Take JR Yamanote Line (outer loop) to Ebisu. 10 stops but no transfers.',
      },
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Exit Ebisu Station. Ebisu Yokocho is a few minutes walk east.',
        exitInfo: 'East Exit',
      },
    ],
    estimatedCostYen: 210,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Akihabara+Station&destination=Ebisu+Station+Tokyo&travelmode=transit',
  },
];

// ============================================================
// DAY 5 — Wednesday, March 11: TeamLab + Shibuya
// ============================================================

const day5Segments: TransitSegment[] = [
  {
    id: 'transit-d5-01',
    dayNumber: 5,
    date: '2026-03-11',
    sortOrder: 1,
    origin: '&Here Shinjuku Hotel',
    originCoords: { lat: 35.6932, lng: 139.7112 },
    destination: 'TeamLab Borderless, Azabudai Hills',
    destinationJp: 'チームラボボーダレス 麻布台ヒルズ',
    destinationCoords: { lat: 35.6600, lng: 139.7392 },
    departureTime: '11:15',
    estimatedDuration: 30,
    arrivalTime: '11:45',
    travelMode: 'transit',
    summary: 'Metro to Kamiyacho Station → direct walk to Azabudai Hills (~30 min, ¥280)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Walk to Shinjuku-sanchome Station.',
      },
      {
        mode: 'train',
        line: 'Tokyo Metro Marunouchi Line',
        lineColor: '#F62E36',
        from: 'Shinjuku-sanchome',
        to: 'Kasumigaseki',
        duration: 12,
        instruction: 'Take Marunouchi Line toward Ogikubo to Kasumigaseki.',
      },
      {
        mode: 'train',
        line: 'Tokyo Metro Hibiya Line',
        lineColor: '#B5B5AC',
        from: 'Kasumigaseki',
        to: 'Kamiyacho',
        duration: 2,
        instruction: 'Transfer to Hibiya Line. Kamiyacho is 1 stop.',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Use Exit 5 at Kamiyacho — directly connected to Azabudai Hills underground. Follow signs to Garden Plaza B, B1 floor. TeamLab entrance is right there.',
        exitInfo: 'Exit 5 → Azabudai Hills (direct underground connection)',
      },
    ],
    estimatedCostYen: 280,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Station&destination=teamLab+Borderless+Azabudai+Hills&travelmode=transit',
    notes: 'Kamiyacho Station Exit 5 connects directly underground to Azabudai Hills. No need to go outside.',
    familyTip: 'Arrive 15 min before your 12:00 entry slot. Lockers at entrance — store bags. Avoid skirts (mirrored floors). Budget 2-3 hours inside.',
    isHardDeadline: true,
  },
  {
    id: 'transit-d5-02',
    dayNumber: 5,
    date: '2026-03-11',
    sortOrder: 2,
    origin: 'Azabudai Hills',
    originJp: '麻布台ヒルズ',
    originCoords: { lat: 35.6600, lng: 139.7392 },
    destination: 'Shibuya',
    destinationJp: '渋谷',
    destinationCoords: { lat: 35.6580, lng: 139.7016 },
    departureTime: '15:15',
    estimatedDuration: 20,
    arrivalTime: '15:35',
    travelMode: 'transit',
    summary: 'Hibiya Line from Kamiyacho → Ebisu → walk/transfer to Shibuya (~20 min, ¥180)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Walk through Azabudai Hills back to Kamiyacho Station Exit 5.',
      },
      {
        mode: 'train',
        line: 'Tokyo Metro Hibiya Line',
        lineColor: '#B5B5AC',
        from: 'Kamiyacho',
        to: 'Ebisu',
        duration: 8,
        instruction: 'Take Hibiya Line toward Naka-Meguro to Ebisu Station.',
      },
      {
        mode: 'train',
        line: 'JR Yamanote Line',
        lineColor: '#80C241',
        from: 'Ebisu',
        to: 'Shibuya',
        duration: 2,
        instruction: 'Transfer to JR Yamanote Line. Shibuya is 1 stop.',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Exit toward Shibuya Crossing (Hachiko Exit).',
        exitInfo: 'Hachiko Exit for Shibuya Crossing',
      },
    ],
    estimatedCostYen: 180,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Azabudai+Hills+Tokyo&destination=Shibuya+Crossing&travelmode=transit',
    notes: 'Alternative: Take Hibiya Line to Roppongi, then walk or take Ginza Line from Roppongi-Itchome.',
  },
  {
    id: 'transit-d5-03',
    dayNumber: 5,
    date: '2026-03-11',
    sortOrder: 3,
    origin: 'Shibuya',
    originJp: '渋谷',
    originCoords: { lat: 35.6580, lng: 139.7016 },
    destination: 'Shinjuku (home)',
    destinationJp: '新宿',
    destinationCoords: { lat: 35.6896, lng: 139.7006 },
    departureTime: '19:30',
    estimatedDuration: 10,
    arrivalTime: '19:40',
    travelMode: 'transit',
    summary: 'JR Yamanote Line, 2 stops (~5 min, ¥150)',
    steps: [
      {
        mode: 'train',
        line: 'JR Yamanote Line (outer loop)',
        lineColor: '#80C241',
        from: 'Shibuya',
        to: 'Shinjuku',
        duration: 5,
        instruction: 'Take JR Yamanote Line 2 stops to Shinjuku.',
      },
    ],
    estimatedCostYen: 150,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shibuya+Station&destination=Shinjuku+Station&travelmode=transit',
  },
];

// ============================================================
// DAY 6 — Thursday, March 12: Tokyo → Hakone
// ============================================================

const day6Segments: TransitSegment[] = [
  {
    id: 'transit-d6-01',
    dayNumber: 6,
    date: '2026-03-12',
    sortOrder: 1,
    origin: 'Shinjuku Station (Odakyu)',
    originJp: '新宿駅（小田急）',
    originCoords: { lat: 35.6896, lng: 139.6994 },
    destination: 'Hakone-Yumoto Station',
    destinationJp: '箱根湯本駅',
    destinationCoords: { lat: 35.2318, lng: 139.1061 },
    departureTime: '12:00',
    estimatedDuration: 80,
    arrivalTime: '13:20',
    travelMode: 'romancecar',
    summary: 'Odakyu Romancecar Shinjuku → Hakone-Yumoto (~80 min)',
    steps: [
      {
        mode: 'walk',
        duration: 10,
        instruction: 'Go to Odakyu Shinjuku Station. Buy Hakone Free Pass at the Odakyu Sightseeing Service Center (ground floor). The pass covers the Romancecar supplement too if purchased together.',
      },
      {
        mode: 'train',
        line: 'Odakyu Romancecar',
        lineColor: '#1E90FF',
        from: 'Shinjuku',
        to: 'Hakone-Yumoto',
        duration: 80,
        instruction: 'Board the Romancecar. Reserved seats — check your car/seat number. Beautiful views of Hakone mountains toward the end.',
      },
    ],
    estimatedCostYen: 2470,
    coveredByPass: 'Hakone Free Pass + Romancecar supplement (¥1,110)',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Station&destination=Hakone-Yumoto+Station&travelmode=transit',
    notes: 'Hakone Free Pass (¥6,100/adult from Shinjuku) covers ALL Hakone transport for 3 days: Romancecar (with supplement), buses, ropeways, pirate ship, cable car.',
    familyTip: 'Book Romancecar seats in advance. Front car has panoramic windows. Kids love the mountain scenery.',
  },
  {
    id: 'transit-d6-02',
    dayNumber: 6,
    date: '2026-03-12',
    sortOrder: 2,
    origin: 'Hakone-Yumoto Station',
    originJp: '箱根湯本駅',
    originCoords: { lat: 35.2318, lng: 139.1061 },
    destination: 'Hakonemachi Port',
    destinationJp: '箱根町港',
    destinationCoords: { lat: 35.1920, lng: 139.0226 },
    departureTime: '13:30',
    estimatedDuration: 210,
    arrivalTime: '17:00',
    travelMode: 'transit',
    summary: 'Hakone Loop: Bus → Switchback Train → Cable Car → Ropeway → Pirate Ship to Hakonemachi (~3.5 hrs scenic journey)',
    steps: [
      {
        mode: 'bus',
        line: 'Hakone Tozan Bus',
        from: 'Hakone-Yumoto',
        to: 'Gora or scenic stops',
        duration: 30,
        instruction: 'Option A: Take switchback train to Gora, then cable car + ropeway. Option B: Bus directly. The Hakone Free Pass covers all options.',
      },
      {
        mode: 'cable_car',
        from: 'Gora',
        to: 'Sounzan',
        duration: 10,
        instruction: 'Cable car climbs steeply through forested hillside.',
      },
      {
        mode: 'ropeway',
        from: 'Sounzan',
        to: 'Togendai (via Owakudani)',
        duration: 25,
        instruction: 'Hakone Ropeway over volcanic Owakudani valley. Spectacular views of Mt. Fuji on clear days.',
      },
      {
        mode: 'ferry',
        line: 'Hakone Pirate Ship',
        from: 'Togendai',
        to: 'Hakonemachi Port',
        duration: 30,
        instruction: 'Board the Pirate Ship across Lake Ashi. Beautiful lakeside views.',
      },
    ],
    coveredByPass: 'Hakone Free Pass',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Hakone-Yumoto+Station&destination=Hakonemachi+Port&travelmode=transit',
    notes: 'Don\'t try to rush. Enjoy the journey. The scenic circuit IS the activity.',
    familyTip: 'Kids absolutely love the pirate ship and the ropeway gondolas. Buy black eggs at Owakudani (adds 7 years to your life, legend says).',
  },
];

// ============================================================
// DAY 7 — Friday, March 13: Hakone Full Day
// ============================================================

const day7Segments: TransitSegment[] = [
  {
    id: 'transit-d7-01',
    dayNumber: 7,
    date: '2026-03-13',
    sortOrder: 1,
    origin: 'Hakonemachi Port',
    originJp: '箱根町港',
    originCoords: { lat: 35.1920, lng: 139.0226 },
    destination: 'Togendai',
    destinationJp: '桃源台',
    destinationCoords: { lat: 35.2266, lng: 139.0012 },
    departureTime: '09:00',
    estimatedDuration: 30,
    arrivalTime: '09:30',
    travelMode: 'ferry',
    summary: 'Pirate Ship across Lake Ashi (~30 min)',
    steps: [
      {
        mode: 'ferry',
        line: 'Hakone Pirate Ship',
        from: 'Hakonemachi Port',
        to: 'Togendai Port',
        duration: 30,
        instruction: 'Board pirate ship for scenic lake crossing. Mt. Fuji visible on clear mornings.',
      },
    ],
    coveredByPass: 'Hakone Free Pass',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Hakonemachi+Port&destination=Togendai+Port+Hakone&travelmode=transit',
  },
  {
    id: 'transit-d7-02',
    dayNumber: 7,
    date: '2026-03-13',
    sortOrder: 2,
    origin: 'Togendai',
    originJp: '桃源台',
    originCoords: { lat: 35.2266, lng: 139.0012 },
    destination: 'Owakudani',
    destinationJp: '大涌谷',
    destinationCoords: { lat: 35.2450, lng: 139.0197 },
    departureTime: '09:45',
    estimatedDuration: 15,
    arrivalTime: '10:00',
    travelMode: 'ropeway',
    summary: 'Hakone Ropeway up to Owakudani (~15 min)',
    steps: [
      {
        mode: 'ropeway',
        line: 'Hakone Ropeway',
        from: 'Togendai',
        to: 'Owakudani',
        duration: 15,
        instruction: 'Spectacular ride over volcanic valley. Gondola fits 18 people.',
      },
    ],
    coveredByPass: 'Hakone Free Pass',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Togendai+Station+Hakone&destination=Owakudani&travelmode=transit',
  },
  {
    id: 'transit-d7-03',
    dayNumber: 7,
    date: '2026-03-13',
    sortOrder: 3,
    origin: 'Owakudani',
    originJp: '大涌谷',
    originCoords: { lat: 35.2450, lng: 139.0197 },
    destination: 'Gora',
    destinationJp: '強羅',
    destinationCoords: { lat: 35.2429, lng: 139.0493 },
    departureTime: '11:30',
    estimatedDuration: 30,
    arrivalTime: '12:00',
    travelMode: 'transit',
    summary: 'Ropeway to Sounzan + Cable Car down to Gora (~30 min)',
    steps: [
      {
        mode: 'ropeway',
        line: 'Hakone Ropeway',
        from: 'Owakudani',
        to: 'Sounzan',
        duration: 15,
        instruction: 'Continue ropeway downhill to Sounzan Station.',
      },
      {
        mode: 'cable_car',
        line: 'Hakone Tozan Cable Car',
        from: 'Sounzan',
        to: 'Gora',
        duration: 10,
        instruction: 'Switch to cable car for steep descent to Gora.',
      },
    ],
    coveredByPass: 'Hakone Free Pass',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Owakudani&destination=Gora+Station+Hakone&travelmode=transit',
  },
  {
    id: 'transit-d7-04',
    dayNumber: 7,
    date: '2026-03-13',
    sortOrder: 4,
    origin: 'Gora',
    originJp: '強羅',
    originCoords: { lat: 35.2429, lng: 139.0493 },
    destination: 'Hakone Open-Air Museum',
    destinationJp: '箱根彫刻の森美術館',
    destinationCoords: { lat: 35.2399, lng: 139.0505 },
    departureTime: '13:15',
    estimatedDuration: 10,
    arrivalTime: '13:25',
    travelMode: 'walking',
    summary: '10-min walk from Gora to Open-Air Museum',
    steps: [
      {
        mode: 'walk',
        duration: 10,
        distance: '700m',
        instruction: 'Walk downhill from Gora Station toward Chokoku-no-Mori. Well signposted.',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Gora+Station+Hakone&destination=Hakone+Open+Air+Museum&travelmode=walking',
    notes: 'OPTIONAL — skip if behind schedule.',
  },
  {
    id: 'transit-d7-05',
    dayNumber: 7,
    date: '2026-03-13',
    sortOrder: 5,
    origin: 'Gora area',
    originCoords: { lat: 35.2429, lng: 139.0493 },
    destination: 'Hakone Shrine',
    destinationJp: '箱根神社',
    destinationCoords: { lat: 35.2038, lng: 139.0275 },
    departureTime: '14:30',
    estimatedDuration: 30,
    arrivalTime: '15:00',
    travelMode: 'transit',
    summary: 'Bus from Gora toward Moto-Hakone / Hakone Shrine (~30 min)',
    steps: [
      {
        mode: 'bus',
        line: 'Hakone Tozan Bus',
        from: 'Gora',
        to: 'Moto-Hakone',
        duration: 25,
        instruction: 'Take bus toward Moto-Hakone / Hakonemachi. Get off at Moto-Hakone.',
      },
      {
        mode: 'walk',
        duration: 5,
        distance: '400m',
        instruction: 'Walk to Hakone Shrine. The famous lakeside torii gate is along the shore path.',
      },
    ],
    coveredByPass: 'Hakone Free Pass',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Gora+Station+Hakone&destination=Hakone+Shrine&travelmode=transit',
    familyTip: 'The lakeside torii gate (red gate in the water) is the iconic photo spot. Best light in late afternoon.',
  },
];

// ============================================================
// DAY 8 — Saturday, March 14: Hakone → Kyoto
// ============================================================

const day8Segments: TransitSegment[] = [
  {
    id: 'transit-d8-01',
    dayNumber: 8,
    date: '2026-03-14',
    sortOrder: 1,
    origin: 'Hakonemachi Port area',
    originCoords: { lat: 35.1920, lng: 139.0226 },
    destination: 'Odawara Station',
    destinationJp: '小田原駅',
    destinationCoords: { lat: 35.2564, lng: 139.1554 },
    departureTime: '09:30',
    estimatedDuration: 60,
    arrivalTime: '10:30',
    travelMode: 'transit',
    summary: 'Bus from Hakonemachi to Odawara Station (~50 min)',
    steps: [
      {
        mode: 'bus',
        line: 'Hakone Tozan Bus',
        from: 'Hakonemachi',
        to: 'Odawara Station',
        duration: 50,
        instruction: 'Take direct bus from Hakonemachi Port to Odawara Station. Scenic route through Hakone.',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Enter Odawara Station. Find Shinkansen gates.',
      },
    ],
    coveredByPass: 'Hakone Free Pass (bus portion)',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Hakonemachi+Port+Hakone&destination=Odawara+Station&travelmode=transit',
    notes: 'Alternative: Hakone Tozan Bus to Hakone-Yumoto, then Odakyu train to Odawara (~60-70 min total).',
  },
  {
    id: 'transit-d8-02',
    dayNumber: 8,
    date: '2026-03-14',
    sortOrder: 2,
    origin: 'Odawara Station',
    originJp: '小田原駅',
    originCoords: { lat: 35.2564, lng: 139.1554 },
    destination: 'Kyoto Station',
    destinationJp: '京都駅',
    destinationCoords: { lat: 34.9858, lng: 135.7588 },
    departureTime: '12:00',
    estimatedDuration: 120,
    arrivalTime: '14:00',
    travelMode: 'shinkansen',
    summary: 'Tokaido Shinkansen Odawara → Kyoto (~2 hrs)',
    steps: [
      {
        mode: 'train',
        line: 'Tokaido Shinkansen (Hikari)',
        lineColor: '#0072BC',
        from: 'Odawara',
        to: 'Kyoto',
        duration: 120,
        instruction: 'Board Hikari Shinkansen. Book via SmartEX app. Mt. Fuji is on the RIGHT side (seats D/E) about 15 min after departure.',
        platform: 'Shinkansen platforms',
      },
    ],
    estimatedCostYen: 11000,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Odawara+Station&destination=Kyoto+Station&travelmode=transit',
    familyTip: 'Grab ekiben (train bento boxes) at Odawara Station before boarding. Kids love choosing their own lunch box.',
  },
  {
    id: 'transit-d8-03',
    dayNumber: 8,
    date: '2026-03-14',
    sortOrder: 3,
    origin: 'Kyoto Station',
    originJp: '京都駅',
    originCoords: { lat: 34.9858, lng: 135.7588 },
    destination: 'MACHIYA INNS Check-in Desk (Gojo area)',
    destinationCoords: { lat: 34.9976, lng: 135.7584 },
    departureTime: '14:15',
    estimatedDuration: 20,
    arrivalTime: '14:35',
    travelMode: 'transit',
    summary: 'Bus or taxi from Kyoto Station to Machiya check-in (~15-20 min)',
    steps: [
      {
        mode: 'bus',
        line: 'Kyoto City Bus',
        from: 'Kyoto Station',
        to: 'Gojo Karasuma or Gojo Kawaramachi',
        duration: 15,
        instruction: 'Take Bus #5 or #26 northbound. Get off near Gojo area. Or take a taxi (¥800, 10 min).',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Walk to MACHIYA INNS check-in desk.',
      },
    ],
    estimatedCostYen: 700,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Kyoto+Station&destination=Fujinoma+Machiya+Kyoto&travelmode=transit',
    notes: 'Check-in desk closes at 19:00. PAY ¥8,400 CASH accommodation tax.',
    isHardDeadline: true,
  },
];

// ============================================================
// DAY 9 — Sunday, March 15: Kyoto Guided (Mico handles transit)
// ============================================================

const day9Segments: TransitSegment[] = [
  {
    id: 'transit-d9-01',
    dayNumber: 9,
    date: '2026-03-15',
    sortOrder: 1,
    origin: 'Fujinoma Machiya House',
    originCoords: { lat: 34.9960, lng: 135.7560 },
    destination: 'Kiyomizudera Temple',
    destinationJp: '清水寺',
    destinationCoords: { lat: 34.9949, lng: 135.7850 },
    departureTime: '08:30',
    estimatedDuration: 25,
    arrivalTime: '08:55',
    travelMode: 'transit',
    summary: 'Bus or taxi to Kiyomizudera (~20 min)',
    steps: [
      {
        mode: 'bus',
        line: 'Kyoto City Bus #207 or #100',
        from: 'Near Machiya',
        to: 'Kiyomizu-michi',
        duration: 15,
        instruction: 'Take bus to Kiyomizu-michi or Gojo-zaka stop.',
      },
      {
        mode: 'walk',
        duration: 10,
        distance: '800m',
        instruction: 'Walk uphill through the approach streets (Matsubara-dori). Shops open early — browse on the way up.',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=34.9960,135.7560&destination=Kiyomizudera+Temple+Kyoto&travelmode=transit',
    notes: 'Mico guides this day — he will handle routing and pacing.',
  },
  {
    id: 'transit-d9-02',
    dayNumber: 9,
    date: '2026-03-15',
    sortOrder: 2,
    origin: 'Gion / Nishiki Market area',
    originCoords: { lat: 35.0036, lng: 135.7691 },
    destination: 'Sanjusangendo Temple',
    destinationJp: '三十三間堂',
    destinationCoords: { lat: 34.9877, lng: 135.7717 },
    departureTime: '14:00',
    estimatedDuration: 15,
    arrivalTime: '14:15',
    travelMode: 'transit',
    summary: 'Bus or walk south from Gion to Sanjusangendo (~15 min)',
    steps: [
      {
        mode: 'bus',
        line: 'Kyoto City Bus #206 or #100',
        from: 'Gion',
        to: 'Sanjusangendo-mae',
        duration: 10,
        instruction: 'Short bus ride south. Or walk ~20 min through quiet streets.',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Nishiki+Market+Kyoto&destination=Sanjusangendo+Kyoto&travelmode=transit',
  },
  {
    id: 'transit-d9-03',
    dayNumber: 9,
    date: '2026-03-15',
    sortOrder: 3,
    origin: 'Sanjusangendo Temple',
    originJp: '三十三間堂',
    originCoords: { lat: 34.9877, lng: 135.7717 },
    destination: 'Fushimi Inari Shrine',
    destinationJp: '伏見稲荷大社',
    destinationCoords: { lat: 34.9671, lng: 135.7727 },
    departureTime: '16:00',
    estimatedDuration: 15,
    arrivalTime: '16:15',
    travelMode: 'transit',
    summary: 'JR Nara Line or Keihan Line to Fushimi Inari (~10-15 min)',
    steps: [
      {
        mode: 'train',
        line: 'JR Nara Line',
        from: 'Tofukuji',
        to: 'Inari',
        duration: 5,
        instruction: 'Walk to nearby JR Tofukuji Station. Take JR Nara Line 1 stop to Inari Station. The shrine is RIGHT outside the station exit.',
      },
    ],
    estimatedCostYen: 150,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Sanjusangendo+Kyoto&destination=Fushimi+Inari+Shrine&travelmode=transit',
    familyTip: 'The thousands of orange torii gates are the most photogenic spot in all of Japan. Go as far up the trail as energy allows.',
  },
];

// ============================================================
// DAY 10 — Monday, March 16: Arashiyama + Golden Pavilion
// ============================================================

const day10Segments: TransitSegment[] = [
  {
    id: 'transit-d10-01',
    dayNumber: 10,
    date: '2026-03-16',
    sortOrder: 1,
    origin: 'Fujinoma Machiya House',
    originCoords: { lat: 34.9960, lng: 135.7560 },
    destination: 'Togetsukyo Bridge, Arashiyama',
    destinationJp: '渡月橋',
    destinationCoords: { lat: 35.0118, lng: 135.6778 },
    departureTime: '08:15',
    estimatedDuration: 35,
    arrivalTime: '08:50',
    travelMode: 'transit',
    summary: 'JR San-in Line to Saga-Arashiyama Station (~30 min, ¥240)',
    steps: [
      {
        mode: 'walk',
        duration: 10,
        instruction: 'Walk to nearest JR station (JR Kyoto Station or bus to Nijo Station).',
      },
      {
        mode: 'train',
        line: 'JR San-in (Sagano) Line',
        lineColor: '#822B95',
        from: 'Kyoto',
        to: 'Saga-Arashiyama',
        duration: 16,
        instruction: 'Take JR San-in Line to Saga-Arashiyama Station.',
      },
      {
        mode: 'walk',
        duration: 10,
        distance: '800m',
        instruction: 'Walk south to Togetsukyo Bridge.',
      },
    ],
    estimatedCostYen: 240,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Kyoto+Station&destination=Togetsukyo+Bridge+Arashiyama&travelmode=transit',
  },
  {
    id: 'transit-d10-02',
    dayNumber: 10,
    date: '2026-03-16',
    sortOrder: 2,
    origin: 'Arashiyama area',
    originCoords: { lat: 35.0118, lng: 135.6778 },
    destination: 'Kinkaku-ji (Golden Pavilion)',
    destinationJp: '金閣寺',
    destinationCoords: { lat: 35.0394, lng: 135.7292 },
    departureTime: '13:45',
    estimatedDuration: 35,
    arrivalTime: '14:20',
    travelMode: 'transit',
    summary: 'Bus #93 from Arashiyama to Kinkaku-ji (~35 min, ¥230)',
    steps: [
      {
        mode: 'bus',
        line: 'Kyoto City Bus #93',
        from: 'Arashiyama Tenryuji-mae',
        to: 'Kinkakuji-michi',
        duration: 30,
        instruction: 'Take Bus #93 directly from Arashiyama to Kinkakuji-michi bus stop.',
      },
      {
        mode: 'walk',
        duration: 5,
        distance: '300m',
        instruction: 'Walk north to Kinkaku-ji entrance.',
      },
    ],
    estimatedCostYen: 230,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Arashiyama+Kyoto&destination=Kinkaku-ji+Golden+Pavilion&travelmode=transit',
    notes: 'Last entry at Kinkaku-ji is 4:30 PM.',
  },
  {
    id: 'transit-d10-03',
    dayNumber: 10,
    date: '2026-03-16',
    sortOrder: 3,
    origin: 'Kinkaku-ji (Golden Pavilion)',
    originJp: '金閣寺',
    originCoords: { lat: 35.0394, lng: 135.7292 },
    destination: 'Fujinoma Machiya area',
    destinationCoords: { lat: 34.9960, lng: 135.7560 },
    departureTime: '15:30',
    estimatedDuration: 30,
    arrivalTime: '16:00',
    travelMode: 'transit',
    summary: 'Bus #205 or #101 back to Shijo-Karasuma area (~30 min, ¥230)',
    steps: [
      {
        mode: 'bus',
        line: 'Kyoto City Bus #205 or #101',
        from: 'Kinkakuji-michi',
        to: 'Shijo-Karasuma',
        duration: 25,
        instruction: 'Take bus southbound toward central Kyoto.',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Walk to Machiya.',
      },
    ],
    estimatedCostYen: 230,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Kinkaku-ji+Kyoto&destination=34.9960,135.7560&travelmode=transit',
  },
];

// ============================================================
// DAY 11 — Tuesday, March 17: Kyoto → Osaka
// ============================================================

const day11Segments: TransitSegment[] = [
  {
    id: 'transit-d11-01',
    dayNumber: 11,
    date: '2026-03-17',
    sortOrder: 1,
    origin: 'Fujinoma Machiya area',
    originCoords: { lat: 34.9960, lng: 135.7560 },
    destination: 'MIMARU Shinsaibashi East, Osaka',
    destinationJp: 'MIMARU大阪心斎橋EAST',
    destinationCoords: { lat: 34.6718, lng: 135.5072 },
    departureTime: '12:00',
    estimatedDuration: 60,
    arrivalTime: '13:00',
    travelMode: 'transit',
    summary: 'Hankyu Line: Kyoto-Kawaramachi → Osaka-Umeda, then Metro to Shinsaibashi (~60 min, ¥720)',
    steps: [
      {
        mode: 'walk',
        duration: 10,
        instruction: 'Walk to Hankyu Kyoto-Kawaramachi Station (or take a bus).',
      },
      {
        mode: 'train',
        line: 'Hankyu Kyoto Line (Limited Express)',
        lineColor: '#81312F',
        from: 'Kyoto-Kawaramachi',
        to: 'Osaka-Umeda',
        duration: 43,
        instruction: 'Take Hankyu Limited Express to Osaka-Umeda. Direct, no transfers. ¥400.',
      },
      {
        mode: 'train',
        line: 'Osaka Metro Midosuji Line',
        lineColor: '#E5171F',
        from: 'Umeda',
        to: 'Shinsaibashi',
        duration: 6,
        instruction: 'Transfer to Osaka Metro Midosuji Line. Shinsaibashi is 3 stops south.',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Walk to MIMARU hotel.',
      },
    ],
    estimatedCostYen: 720,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Kyoto-Kawaramachi+Station&destination=MIMARU+Osaka+Shinsaibashi+East&travelmode=transit',
    notes: 'Alternative: JR Special Rapid from Kyoto Station to Osaka Station (~30 min, ¥580) then Metro. Hankyu is cheaper and starts closer to the Machiya.',
  },
];

// ============================================================
// DAY 12 — Wednesday, March 18: Osaka Guided (walking day)
// ============================================================

const day12Segments: TransitSegment[] = [
  {
    id: 'transit-d12-01',
    dayNumber: 12,
    date: '2026-03-18',
    sortOrder: 1,
    origin: 'MIMARU Shinsaibashi East',
    originCoords: { lat: 34.6718, lng: 135.5072 },
    destination: 'Kuromon Market',
    destinationJp: '黒門市場',
    destinationCoords: { lat: 34.6638, lng: 135.5069 },
    departureTime: '09:00',
    estimatedDuration: 10,
    arrivalTime: '09:10',
    travelMode: 'walking',
    summary: '10-min walk south to Kuromon Market',
    steps: [
      {
        mode: 'walk',
        duration: 10,
        distance: '800m',
        instruction: 'Walk south from hotel along Sakai-suji toward Kuromon Market. The covered arcade entrance is well signposted.',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=MIMARU+Osaka+Shinsaibashi+East&destination=Kuromon+Market+Osaka&travelmode=walking',
    familyTip: 'Kuromon is "Osaka\'s Kitchen." Try fresh sashimi, takoyaki, grilled wagyu skewers, and fresh fruit.',
  },
];

// ============================================================
// DAY 13 — Thursday, March 19: Mountain Day Trip (Private Driver)
// No public transit needed
// ============================================================

// ============================================================
// DAY 14 — Friday, March 20: Nara + Sumo (Emma's Birthday!)
// ============================================================

const day14Segments: TransitSegment[] = [
  {
    id: 'transit-d14-01',
    dayNumber: 14,
    date: '2026-03-20',
    sortOrder: 1,
    origin: 'MIMARU Shinsaibashi East',
    originCoords: { lat: 34.6718, lng: 135.5072 },
    destination: 'Kintetsu Nara Station',
    destinationJp: '近鉄奈良駅',
    destinationCoords: { lat: 34.6810, lng: 135.8270 },
    departureTime: '08:00',
    estimatedDuration: 45,
    arrivalTime: '08:45',
    travelMode: 'transit',
    summary: 'Metro to Namba → Kintetsu Nara Line Rapid Express (~45 min, ¥870)',
    steps: [
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Walk to Shinsaibashi Station.',
      },
      {
        mode: 'train',
        line: 'Osaka Metro Midosuji Line',
        lineColor: '#E5171F',
        from: 'Shinsaibashi',
        to: 'Namba',
        duration: 2,
        instruction: 'Take Midosuji Line 1 stop south to Namba.',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Transfer to Osaka-Namba Station (Kintetsu). Follow signs — it\'s connected underground.',
      },
      {
        mode: 'train',
        line: 'Kintetsu Nara Line (Rapid Express)',
        lineColor: '#D2000D',
        from: 'Osaka-Namba',
        to: 'Kintetsu Nara',
        duration: 36,
        instruction: 'Take Rapid Express to Kintetsu Nara. Direct, no transfers. ¥680.',
      },
    ],
    estimatedCostYen: 870,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shinsaibashi+Station+Osaka&destination=Kintetsu+Nara+Station&travelmode=transit',
    familyTip: 'Kintetsu Nara Station is much closer to Nara Park than JR Nara Station. Worth the extra fare.',
  },
  {
    id: 'transit-d14-02',
    dayNumber: 14,
    date: '2026-03-20',
    sortOrder: 2,
    origin: 'Kintetsu Nara Station',
    originJp: '近鉄奈良駅',
    originCoords: { lat: 34.6810, lng: 135.8270 },
    destination: 'Todai-ji Temple',
    destinationJp: '東大寺',
    destinationCoords: { lat: 34.6890, lng: 135.8399 },
    departureTime: '08:50',
    estimatedDuration: 15,
    arrivalTime: '09:05',
    travelMode: 'walking',
    summary: '15-min walk through Nara Park to Todai-ji',
    steps: [
      {
        mode: 'walk',
        duration: 15,
        distance: '1.2 km',
        instruction: 'Walk east through Nara Park toward Todai-ji. You\'ll start encountering deer immediately. The Great South Gate (Nandaimon) is the dramatic entrance to the temple complex.',
      },
    ],
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Kintetsu+Nara+Station&destination=Todai-ji+Temple+Nara&travelmode=walking',
    familyTip: 'Buy deer crackers (shika senbei, ¥200) from the vendors along the way. The deer bow when you show them a cracker!',
  },
  {
    id: 'transit-d14-03',
    dayNumber: 14,
    date: '2026-03-20',
    sortOrder: 3,
    origin: 'Kintetsu Nara Station',
    originJp: '近鉄奈良駅',
    originCoords: { lat: 34.6810, lng: 135.8270 },
    destination: 'EDION Arena Osaka',
    destinationJp: 'エディオンアリーナ大阪',
    destinationCoords: { lat: 34.6766, lng: 135.5119 },
    departureTime: '12:45',
    estimatedDuration: 50,
    arrivalTime: '13:35',
    travelMode: 'transit',
    summary: 'Kintetsu Nara → Namba → Metro to Namba-nishi (~50 min, ¥870)',
    steps: [
      {
        mode: 'train',
        line: 'Kintetsu Nara Line (Rapid Express)',
        lineColor: '#D2000D',
        from: 'Kintetsu Nara',
        to: 'Osaka-Namba',
        duration: 36,
        instruction: 'Take Rapid Express back to Osaka-Namba.',
      },
      {
        mode: 'walk',
        duration: 10,
        distance: '800m',
        instruction: 'Walk from Namba to EDION Arena Osaka (formerly Osaka Prefectural Gymnasium). Near Namba Parks.',
      },
    ],
    estimatedCostYen: 870,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Kintetsu+Nara+Station&destination=EDION+Arena+Osaka&travelmode=transit',
    notes: 'Leave Nara by 12:30-12:45 at the latest. Top-division sumo bouts start ~15:00.',
    isHardDeadline: true,
  },
];

// ============================================================
// DAY 15 — Saturday, March 21: Departure Day ✈️
// ============================================================

const day15Segments: TransitSegment[] = [
  {
    id: 'transit-d15-01',
    dayNumber: 15,
    date: '2026-03-21',
    sortOrder: 1,
    origin: 'MIMARU Shinsaibashi East',
    originCoords: { lat: 34.6718, lng: 135.5072 },
    destination: 'Shin-Osaka Station',
    destinationJp: '新大阪駅',
    destinationCoords: { lat: 34.7335, lng: 135.5001 },
    departureTime: '09:30',
    estimatedDuration: 20,
    arrivalTime: '09:50',
    travelMode: 'transit',
    summary: 'Metro Midosuji Line to Shin-Osaka (~15 min, ¥280)',
    steps: [
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Walk to Shinsaibashi Station.',
      },
      {
        mode: 'train',
        line: 'Osaka Metro Midosuji Line',
        lineColor: '#E5171F',
        from: 'Shinsaibashi',
        to: 'Shin-Osaka',
        duration: 14,
        instruction: 'Take Midosuji Line northbound to Shin-Osaka (end of line). 7 stops.',
      },
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Follow signs to Shinkansen gates. Buy ekiben (train bento) at the station.',
      },
    ],
    estimatedCostYen: 280,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shinsaibashi+Station+Osaka&destination=Shin-Osaka+Station&travelmode=transit',
    familyTip: 'Shin-Osaka Station has great food shops and ekiben vendors. Last chance for Japanese snacks!',
  },
  {
    id: 'transit-d15-02',
    dayNumber: 15,
    date: '2026-03-21',
    sortOrder: 2,
    origin: 'Shin-Osaka Station',
    originJp: '新大阪駅',
    originCoords: { lat: 34.7335, lng: 135.5001 },
    destination: 'Shinagawa Station',
    destinationJp: '品川駅',
    destinationCoords: { lat: 35.6284, lng: 139.7387 },
    departureTime: '10:30',
    estimatedDuration: 140,
    arrivalTime: '12:50',
    travelMode: 'shinkansen',
    summary: 'Tokaido Shinkansen Shin-Osaka → Shinagawa (~2h 20min)',
    steps: [
      {
        mode: 'train',
        line: 'Tokaido Shinkansen (Nozomi)',
        lineColor: '#0072BC',
        from: 'Shin-Osaka',
        to: 'Shinagawa',
        duration: 140,
        instruction: 'Board Nozomi Shinkansen. Book via SmartEX app. Shinagawa is the stop BEFORE Tokyo Station. Get off here — not Tokyo.',
      },
    ],
    estimatedCostYen: 13870,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shin-Osaka+Station&destination=Shinagawa+Station&travelmode=transit',
    notes: 'Routed through Shinagawa (not Tokyo) for direct Keikyu Line access to Haneda — no transfers with luggage.',
    familyTip: 'Last Shinkansen ride! Mt. Fuji visible on RIGHT side (D/E seats) about 1.5 hours into the journey.',
  },
  {
    id: 'transit-d15-03',
    dayNumber: 15,
    date: '2026-03-21',
    sortOrder: 3,
    origin: 'Shinagawa Station',
    originJp: '品川駅',
    originCoords: { lat: 35.6284, lng: 139.7387 },
    destination: 'Haneda Airport Terminal 3',
    destinationJp: '羽田空港第3ターミナル',
    destinationCoords: { lat: 35.5494, lng: 139.7798 },
    departureTime: '13:00',
    estimatedDuration: 20,
    arrivalTime: '13:20',
    travelMode: 'transit',
    summary: 'Keikyu Line direct to Haneda Terminal 3 (~18 min, ¥410)',
    steps: [
      {
        mode: 'walk',
        duration: 5,
        instruction: 'Follow signs from Shinkansen gates to Keikyu Line. Well signposted in English.',
      },
      {
        mode: 'train',
        line: 'Keikyu Airport Line',
        lineColor: '#E60012',
        from: 'Shinagawa',
        to: 'Haneda Airport Terminal 3',
        duration: 13,
        instruction: 'Take Keikyu Airport Express direct to Haneda Airport Terminal 3. No transfers!',
      },
      {
        mode: 'walk',
        duration: 3,
        instruction: 'Exit to International Terminal departures. Check-in and head to gate.',
      },
    ],
    estimatedCostYen: 410,
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=Shinagawa+Station&destination=Haneda+Airport+Terminal+3&travelmode=transit',
    notes: 'This is WHY we routed through Shinagawa — the Keikyu Line is direct with no transfers. Easy with luggage and kids. 4+ hours buffer at Haneda.',
    isHardDeadline: true,
  },
];

// ============================================================
// EXPORT ALL SEGMENTS
// ============================================================

export const allTransitSegments: TransitSegment[] = [
  ...day1Segments,
  ...day2Segments,
  ...day3Segments,
  ...day4Segments,
  ...day5Segments,
  ...day6Segments,
  ...day7Segments,
  ...day8Segments,
  ...day9Segments,
  ...day10Segments,
  ...day11Segments,
  ...day12Segments,
  // Day 13 = private driver, no segments
  ...day14Segments,
  ...day15Segments,
];

// Total: 41 verified transit segments with Google Maps deep links
