#!/usr/bin/env node
/**
 * Script to find activities and restaurants missing Google Maps URLs
 * Run with: node scripts/find-missing-maps-urls.js
 */

const fs = require('fs');
const path = require('path');

const seedDataPath = path.join(__dirname, '../src/db/seed-data.ts');
const content = fs.readFileSync(seedDataPath, 'utf8');

console.log('=== ACTIVITIES MISSING GOOGLE MAPS URL ===\n');

// Match activity blocks with null googleMapsUrl
const activityBlocks = content.match(/{\s*id:\s*genId\('act'\)[\s\S]*?updatedAt:\s*now,?\s*}/g) || [];
let actCount = 0;

activityBlocks.forEach(block => {
  if (block.includes('googleMapsUrl: null')) {
    const dayMatch = block.match(/dayNumber:\s*(\d+)/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const locationMatch = block.match(/locationName:\s*'([^']+)'/);

    if (nameMatch) {
      actCount++;
      const day = dayMatch ? dayMatch[1] : '?';
      const name = nameMatch[1];
      const location = locationMatch ? locationMatch[1] : '';
      const searchQuery = location || name;

      console.log(`Day ${day}: ${name}`);
      console.log(`  Location: ${location || '(none)'}`);
      console.log(`  Search: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery + ' Japan')}`);
      console.log('');
    }
  }
});

console.log(`Total activities missing: ${actCount}\n`);

console.log('=== RESTAURANTS MISSING GOOGLE MAPS URL ===\n');

// Match restaurant blocks with null googleMapsUrl
const restaurantBlocks = content.match(/{\s*id:\s*'[^']*'[\s\S]*?meal:\s*null,?\s*\n\s*createdAt[\s\S]*?updatedAt:\s*now,?\s*}/g) || [];
let restCount = 0;

restaurantBlocks.forEach(block => {
  if (block.includes('googleMapsUrl: null')) {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const cityMatch = block.match(/city:\s*'([^']+)'/);
    const districtMatch = block.match(/district:\s*'([^']+)'/);

    if (nameMatch) {
      restCount++;
      const name = nameMatch[1];
      const city = cityMatch ? cityMatch[1] : '';
      const district = districtMatch ? districtMatch[1] : '';
      const searchQuery = `${name} ${district} ${city}`.trim();

      console.log(`${name} - ${city}${district ? ` (${district})` : ''}`);
      console.log(`  Search: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery + ' Japan')}`);
      console.log('');
    }
  }
});

console.log(`Total restaurants missing: ${restCount}\n`);

console.log('=== SUMMARY ===');
console.log(`Activities missing Google Maps URL: ${actCount}`);
console.log(`Restaurants missing Google Maps URL: ${restCount}`);
console.log(`Total: ${actCount + restCount}`);
