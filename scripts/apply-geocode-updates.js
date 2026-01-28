#!/usr/bin/env node
/**
 * Script to apply geocoded coordinates to seed-data.ts
 * Filters out incorrect results before applying
 *
 * Run with: node scripts/apply-geocode-updates.js
 */

const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, 'geocode-results.json');
const seedDataPath = path.join(__dirname, '../src/db/seed-data.ts');

// Load geocode results
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Names to skip due to incorrect geocoding
const skipNames = [
  'Check-in at &Here Shinjuku',      // Got Saitama coords instead of Shinjuku
  'Togetsukyo Bridge & Monkey Park', // Got Tokyo coords instead of Kyoto
];

// Filter to only valid updates
const validUpdates = results.filter(r =>
  r.changed &&
  !r.error &&
  !skipNames.includes(r.name)
);

console.log(`Found ${validUpdates.length} valid updates to apply\n`);

// Load seed-data.ts
let content = fs.readFileSync(seedDataPath, 'utf8');

// Apply each update
let updated = 0;
for (const update of validUpdates) {
  const oldLat = update.currentLat;
  const oldLng = update.currentLng;
  const newLat = update.newLat;
  const newLng = update.newLng;

  // Build patterns to find and replace coordinates
  // Handle both forms: 35.1234 and 35.12345678
  const latPattern = new RegExp(`locationLat: ${oldLat}([0-9]*)`, 'g');
  const lngPattern = new RegExp(`locationLng: ${oldLng}([0-9]*)`, 'g');

  const originalContent = content;

  // Replace lat/lng with new values
  content = content.replace(latPattern, `locationLat: ${newLat}`);
  content = content.replace(lngPattern, `locationLng: ${newLng}`);

  if (content !== originalContent) {
    console.log(`✓ Updated: ${update.name}`);
    console.log(`  ${oldLat}, ${oldLng} → ${newLat}, ${newLng}`);
    updated++;
  } else {
    console.log(`✗ Could not find coords for: ${update.name}`);
    console.log(`  Looking for: ${oldLat}, ${oldLng}`);
  }
}

// Write updated content
fs.writeFileSync(seedDataPath, content);

console.log(`\n=== SUMMARY ===`);
console.log(`Updates applied: ${updated}`);
console.log(`Skipped (bad data): ${skipNames.length}`);
console.log(`\nUpdated: ${seedDataPath}`);
