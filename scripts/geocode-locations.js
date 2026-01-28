#!/usr/bin/env node
/**
 * Script to geocode locations using OpenStreetMap Nominatim API
 * Extracts search queries from googleMapsUrl and gets accurate lat/lng
 *
 * Run with: node scripts/geocode-locations.js
 *
 * Outputs JSON with accurate coordinates that can be used to update seed-data.ts
 */

const fs = require('fs');
const path = require('path');

const seedDataPath = path.join(__dirname, '../src/db/seed-data.ts');
const content = fs.readFileSync(seedDataPath, 'utf8');

// Extract location data from activities
function extractLocations() {
  const locations = [];

  // Match activity blocks
  const activityBlocks = content.match(/{\s*id:\s*genId\('act'\)[\s\S]*?updatedAt:\s*now,?\s*}/g) || [];

  activityBlocks.forEach(block => {
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const dayMatch = block.match(/dayNumber:\s*(\d+)/);
    const urlMatch = block.match(/googleMapsUrl:\s*'([^']+)'/);
    const latMatch = block.match(/locationLat:\s*([\d.]+)/);
    const lngMatch = block.match(/locationLng:\s*([\d.]+)/);
    const locationNameMatch = block.match(/locationName:\s*'([^']+)'/);
    const addressMatch = block.match(/locationAddress:\s*'([^']+)'/);

    if (nameMatch && urlMatch) {
      // Extract search query from Google Maps URL
      const url = urlMatch[1];
      let searchQuery = '';

      if (url.includes('?q=')) {
        searchQuery = decodeURIComponent(url.split('?q=')[1].replace(/\+/g, ' '));
      } else if (url.includes('/search/')) {
        searchQuery = decodeURIComponent(url.split('/search/')[1].split('?')[0].replace(/\+/g, ' '));
      }

      if (searchQuery) {
        locations.push({
          type: 'activity',
          name: nameMatch[1],
          day: dayMatch ? parseInt(dayMatch[1]) : null,
          locationName: locationNameMatch ? locationNameMatch[1] : null,
          address: addressMatch ? addressMatch[1] : null,
          googleMapsUrl: url,
          searchQuery: searchQuery,
          currentLat: latMatch ? parseFloat(latMatch[1]) : null,
          currentLng: lngMatch ? parseFloat(lngMatch[1]) : null,
        });
      }
    }
  });

  // Match restaurant blocks
  const restaurantSection = content.match(/export const restaurants[\s\S]*?(?=export const |$)/);
  if (restaurantSection) {
    const restaurantBlocks = restaurantSection[0].match(/{\s*id:\s*'[^']*'[\s\S]*?updatedAt:\s*now,?\s*}/g) || [];

    restaurantBlocks.forEach(block => {
      const idMatch = block.match(/id:\s*'([^']+)'/);
      const nameMatch = block.match(/name:\s*'([^']+)'/);
      const urlMatch = block.match(/googleMapsUrl:\s*'([^']+)'/);
      const latMatch = block.match(/locationLat:\s*([\d.]+)/);
      const lngMatch = block.match(/locationLng:\s*([\d.]+)/);
      const cityMatch = block.match(/city:\s*'([^']+)'/);

      if (nameMatch && urlMatch) {
        const url = urlMatch[1];
        let searchQuery = '';

        if (url.includes('?q=')) {
          searchQuery = decodeURIComponent(url.split('?q=')[1].replace(/\+/g, ' '));
        } else if (url.includes('maps.app.goo.gl') || url.includes('g.page')) {
          // Short URLs - use restaurant name + city as search
          searchQuery = `${nameMatch[1]} ${cityMatch ? cityMatch[1] : ''} Japan`.trim();
        }

        if (searchQuery) {
          locations.push({
            type: 'restaurant',
            id: idMatch ? idMatch[1] : null,
            name: nameMatch[1],
            city: cityMatch ? cityMatch[1] : null,
            googleMapsUrl: url,
            searchQuery: searchQuery,
            currentLat: latMatch ? parseFloat(latMatch[1]) : null,
            currentLng: lngMatch ? parseFloat(lngMatch[1]) : null,
          });
        }
      }
    });
  }

  return locations;
}

// Geocode a single location using OpenStreetMap Nominatim API
async function geocode(query) {
  // Add "Japan" to query if not already present for better results
  const searchQuery = query.toLowerCase().includes('japan') ? query : `${query}, Japan`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FTC-Nihon-Travel-App/1.0 (https://github.com/ftc-nihon)',
      },
    });
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        formattedAddress: data[0].display_name,
      };
    } else {
      console.error(`  Geocoding failed for "${query}": No results`);
      return null;
    }
  } catch (error) {
    console.error(`  Geocoding error for "${query}":`, error.message);
    return null;
  }
}

// Rate limit helper - wait between API calls
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Extracting locations from seed-data.ts...\n');

  const locations = extractLocations();
  console.log(`Found ${locations.length} locations with Google Maps URLs\n`);

  const results = [];
  let updated = 0;
  let unchanged = 0;
  let failed = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    console.log(`[${i + 1}/${locations.length}] ${loc.type}: ${loc.name}`);
    console.log(`  Query: "${loc.searchQuery}"`);

    const geocoded = await geocode(loc.searchQuery);

    if (geocoded) {
      const latDiff = loc.currentLat ? Math.abs(geocoded.lat - loc.currentLat) : 999;
      const lngDiff = loc.currentLng ? Math.abs(geocoded.lng - loc.currentLng) : 999;

      // Check if coordinates changed significantly (more than 0.001 degrees ~ 100m)
      if (latDiff > 0.001 || lngDiff > 0.001) {
        console.log(`  ✓ Updated: ${geocoded.lat}, ${geocoded.lng}`);
        console.log(`    (was: ${loc.currentLat}, ${loc.currentLng})`);
        updated++;
      } else {
        console.log(`  = Unchanged: ${geocoded.lat}, ${geocoded.lng}`);
        unchanged++;
      }

      results.push({
        ...loc,
        newLat: geocoded.lat,
        newLng: geocoded.lng,
        formattedAddress: geocoded.formattedAddress,
        changed: latDiff > 0.001 || lngDiff > 0.001,
      });
    } else {
      console.log(`  ✗ Failed to geocode`);
      failed++;
      results.push({
        ...loc,
        newLat: null,
        newLng: null,
        changed: false,
        error: true,
      });
    }

    // Rate limit: Nominatim requires max 1 request per second
    await sleep(1100);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total locations: ${locations.length}`);
  console.log(`Updated coordinates: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Failed: ${failed}`);

  // Output results to JSON file
  const outputPath = path.join(__dirname, 'geocode-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);

  // Output just the changes
  const changes = results.filter(r => r.changed && !r.error);
  if (changes.length > 0) {
    console.log('\n=== LOCATIONS NEEDING UPDATE ===\n');
    changes.forEach(c => {
      console.log(`${c.type}: ${c.name}`);
      console.log(`  Old: ${c.currentLat}, ${c.currentLng}`);
      console.log(`  New: ${c.newLat}, ${c.newLng}`);
      console.log('');
    });
  }
}

main().catch(console.error);
