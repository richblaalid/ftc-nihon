// @ts-nocheck
/**
 * Generate compact PDF itinerary with full daily schedule
 * Run with: npx tsx scripts/generate-itinerary-pdf.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Read and parse the seed data file to extract activities
const seedDataPath = path.join(__dirname, '../src/db/seed-data.ts');
const seedContent = fs.readFileSync(seedDataPath, 'utf-8');

// Extract activities array using regex (simplified parsing)
function extractActivities(): Activity[] {
  // Find the activities array section
  const activitiesMatch = seedContent.match(/export const activities: Activity\[\] = \[([\s\S]*?)\n\];/);
  if (!activitiesMatch || !activitiesMatch[1]) return [];

  const activitiesSection = activitiesMatch[1];
  const activities: Activity[] = [];

  // Parse each activity object - look for key fields
  const activityBlocks = activitiesSection.split(/\n  \{/);

  for (const block of activityBlocks) {
    const dayMatch = block.match(/dayNumber:\s*(\d+)/);
    const dateMatch = block.match(/date:\s*'([^']+)'/);
    const timeMatch = block.match(/startTime:\s*'([^']+)'/);
    const durationMatch = block.match(/durationMinutes:\s*(\d+)/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const categoryMatch = block.match(/category:\s*'([^']+)'/);

    if (dayMatch && dateMatch && timeMatch && nameMatch && categoryMatch) {
      activities.push({
        dayNumber: parseInt(dayMatch[1]),
        date: dateMatch[1],
        startTime: timeMatch[1],
        durationMinutes: durationMatch ? parseInt(durationMatch[1]) : 30,
        name: nameMatch[1],
        category: categoryMatch[1],
      });
    }
  }

  return activities;
}

interface Activity {
  dayNumber: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  name: string;
  category: string;
}

interface DayInfo {
  dayNumber: number;
  date: string;
  dayOfWeek: string;
  title: string;
  location: string;
  type: string;
}

interface Accommodation {
  name: string;
  address: string;
  checkInTime: string;
  checkOutTime: string;
  confirmationNumber: string;
  pinCode: string | null;
  phone: string;
  startDate: string;
  endDate: string;
  instructions: string;
}

// Accommodations data
const accommodations: Accommodation[] = [
  {
    name: '&Here Shinjuku',
    address: '2-15-14-2 Shinjuku, Tokyo 160-0022',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    confirmationNumber: '5464976388',
    pinCode: '5562',
    phone: '+81 3-6384-2040',
    startDate: '2026-03-07',
    endDate: '2026-03-12',
    instructions: 'Bus to Busta Shinjuku, 14-min walk. Cash NOT accepted.',
  },
  {
    name: 'Yoshimatsu Ryokan',
    address: '521 Hakone, Kanagawa 250-0521',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    confirmationNumber: 'XEVXZWUZ / 9SPM1U1T',
    pinCode: null,
    phone: '0460-83-6661',
    startDate: '2026-03-12',
    endDate: '2026-03-14',
    instructions: 'CALL for pickup from Hakonemachi Port. Kaiseki dinner included.',
  },
  {
    name: 'Fujinoma Machiya',
    address: '476-11 Tenshitsukinuke 4chome, Kyoto 600-8456',
    checkInTime: '15:00',
    checkOutTime: '10:00',
    confirmationNumber: '6306540803',
    pinCode: '5278',
    phone: '+81 90-8161-3870',
    startDate: '2026-03-14',
    endDate: '2026-03-17',
    instructions: 'Check-in at MACHIYA INNS desk. PAY ¥8,400 CASH.',
  },
  {
    name: 'MIMARU Osaka Shinsaibashi',
    address: '1-7-9 Higashishinsaibashi, Osaka 542-0083',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    confirmationNumber: '5937762447',
    pinCode: '7761',
    phone: '+81 6-4256-4010',
    startDate: '2026-03-17',
    endDate: '2026-03-21',
    instructions: 'FULLY PAID. Near Dotonbori.',
  },
];

// Day info data
const dayInfo: DayInfo[] = [
  { dayNumber: 0, date: '2026-03-06', dayOfWeek: 'Fri', title: 'Departure Day', location: 'MSP → Transit', type: 'travel' },
  { dayNumber: 1, date: '2026-03-07', dayOfWeek: 'Sat', title: 'Arrival in Tokyo', location: 'Tokyo', type: 'travel' },
  { dayNumber: 2, date: '2026-03-08', dayOfWeek: 'Sun', title: 'East Tokyo Loop', location: 'Tokyo', type: 'explore' },
  { dayNumber: 3, date: '2026-03-09', dayOfWeek: 'Mon', title: 'Ghibli + Harajuku', location: 'Tokyo', type: 'explore' },
  { dayNumber: 4, date: '2026-03-10', dayOfWeek: 'Tue', title: 'Tsukiji + Akihabara', location: 'Tokyo', type: 'explore' },
  { dayNumber: 5, date: '2026-03-11', dayOfWeek: 'Wed', title: 'TeamLab + Shibuya', location: 'Tokyo', type: 'explore' },
  { dayNumber: 6, date: '2026-03-12', dayOfWeek: 'Thu', title: 'Tokyo → Hakone', location: 'Hakone', type: 'travel' },
  { dayNumber: 7, date: '2026-03-13', dayOfWeek: 'Fri', title: 'Hakone Full Day', location: 'Hakone', type: 'explore' },
  { dayNumber: 8, date: '2026-03-14', dayOfWeek: 'Sat', title: 'Hakone → Kyoto', location: 'Kyoto', type: 'travel' },
  { dayNumber: 9, date: '2026-03-15', dayOfWeek: 'Sun', title: 'Kyoto with Mico', location: 'Kyoto', type: 'guided' },
  { dayNumber: 10, date: '2026-03-16', dayOfWeek: 'Mon', title: 'Arashiyama', location: 'Kyoto', type: 'explore' },
  { dayNumber: 11, date: '2026-03-17', dayOfWeek: 'Tue', title: 'Kyoto → Osaka', location: 'Osaka', type: 'travel' },
  { dayNumber: 12, date: '2026-03-18', dayOfWeek: 'Wed', title: 'Osaka with Mico', location: 'Osaka', type: 'guided' },
  { dayNumber: 13, date: '2026-03-19', dayOfWeek: 'Thu', title: 'Mountain Day Trip', location: 'Kyoto Mountains', type: 'guided' },
  { dayNumber: 14, date: '2026-03-20', dayOfWeek: 'Fri', title: "Nara + Sumo (Emma's Bday!)", location: 'Nara/Osaka', type: 'mixed' },
  { dayNumber: 15, date: '2026-03-21', dayOfWeek: 'Sat', title: 'Departure Day', location: 'Osaka → MSP', type: 'travel' },
];

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    transit: '🚃',
    food: '🍜',
    temple: '⛩️',
    shrine: '⛩️',
    shopping: '🛍️',
    activity: '📍',
    hotel: '🏨',
  };
  return emojis[category] || '📍';
}

function generateHTML(activities: Activity[]): string {
  // Group activities by day
  const activitiesByDay: Record<number, Activity[]> = {};
  activities.forEach(act => {
    if (!activitiesByDay[act.dayNumber]) {
      activitiesByDay[act.dayNumber] = [];
    }
    activitiesByDay[act.dayNumber].push(act);
  });

  // Sort each day's activities by startTime
  Object.keys(activitiesByDay).forEach(day => {
    activitiesByDay[parseInt(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FTC: Nihon Itinerary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 9pt;
      line-height: 1.3;
      color: #333;
      padding: 15px;
    }
    .header {
      text-align: center;
      padding: 10px 0 15px;
      border-bottom: 2px solid #F46B55;
      margin-bottom: 15px;
    }
    .header h1 { font-size: 20pt; color: #F46B55; margin-bottom: 3px; }
    .header .dates { font-size: 11pt; color: #666; }

    h2 { font-size: 12pt; color: #F46B55; margin: 12px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }

    .accommodations {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }
    .acc {
      background: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      font-size: 8pt;
    }
    .acc-name { font-weight: bold; font-size: 9pt; margin-bottom: 2px; }
    .acc-dates { color: #F46B55; font-size: 8pt; margin-bottom: 3px; }
    .acc-info { color: #666; }
    .acc-info strong { color: #333; }

    .day {
      page-break-inside: avoid;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    .day-header {
      background: linear-gradient(135deg, #F46B55, #F5B800);
      color: white;
      padding: 6px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .day-title { font-weight: bold; font-size: 10pt; }
    .day-meta { font-size: 8pt; opacity: 0.9; }

    .schedule {
      padding: 6px 8px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px 12px;
    }
    .schedule-item {
      display: flex;
      gap: 6px;
      padding: 2px 0;
      font-size: 8pt;
    }
    .time {
      color: #666;
      min-width: 32px;
      font-family: monospace;
      font-size: 7.5pt;
    }
    .name { flex: 1; }
    .emoji { width: 12px; text-align: center; }

    .no-activities {
      padding: 8px;
      color: #888;
      font-style: italic;
      font-size: 8pt;
    }

    .footer {
      text-align: center;
      padding: 10px;
      color: #888;
      font-size: 7pt;
      border-top: 1px solid #ddd;
      margin-top: 10px;
    }

    @media print {
      body { padding: 10px; }
      .day { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FTC: Nihon</h1>
    <div class="dates">March 6-21, 2026 • 4 Adults, 3 Kids</div>
  </div>

  <h2>Accommodations</h2>
  <div class="accommodations">
    ${accommodations.map(acc => `
    <div class="acc">
      <div class="acc-name">${acc.name}</div>
      <div class="acc-dates">${formatDateShort(acc.startDate)} - ${formatDateShort(acc.endDate)}</div>
      <div class="acc-info">
        <strong>Conf:</strong> ${acc.confirmationNumber}${acc.pinCode ? ` PIN: ${acc.pinCode}` : ''}<br>
        <strong>Tel:</strong> ${acc.phone}<br>
        ${acc.instructions}
      </div>
    </div>
    `).join('')}
  </div>

  <h2>Daily Schedule</h2>
  ${dayInfo.map(day => {
    const dayActivities = activitiesByDay[day.dayNumber] || [];

    return `
  <div class="day">
    <div class="day-header">
      <span class="day-title">Day ${day.dayNumber}: ${day.title}</span>
      <span class="day-meta">${day.dayOfWeek} ${formatDateShort(day.date)} • ${day.location}</span>
    </div>
    ${dayActivities.length > 0 ? `
    <div class="schedule">
      ${dayActivities.map(act => `
      <div class="schedule-item">
        <span class="time">${act.startTime}</span>
        <span class="emoji">${getCategoryEmoji(act.category)}</span>
        <span class="name">${act.name}</span>
      </div>
      `).join('')}
    </div>
    ` : `<div class="no-activities">Guided tour or travel day - see notes</div>`}
  </div>
    `;
  }).join('')}

  <div class="footer">
    Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • FTC: Nihon App
  </div>
</body>
</html>`;

  return html;
}

// Extract activities and generate HTML
const activities = extractActivities();
console.log(`Found ${activities.length} activities`);

const html = generateHTML(activities);
const outputPath = path.join(__dirname, '../itinerary.html');
fs.writeFileSync(outputPath, html);
console.log(`HTML generated: ${outputPath}`);
