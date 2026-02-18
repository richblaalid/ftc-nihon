#!/usr/bin/env python3
"""
Generate tour guide audio files using edge-tts (free Microsoft Edge TTS).

Usage:
  pip install edge-tts
  python scripts/generate-audio.py                    # Generate all entries
  python scripts/generate-audio.py senso-ji           # Generate one entry
  python scripts/generate-audio.py --list-voices      # List available voices
  python scripts/generate-audio.py --voice en-US-AriaNeural  # Use specific voice

Recommended voices for tour narration:
  en-US-JennyNeural   - Warm, friendly (default)
  en-US-AriaNeural    - Clear, professional
  en-US-AnaNeural     - Younger, energetic
"""

import asyncio
import json
import os
import re
import sys

try:
    import edge_tts
except ImportError:
    print("edge-tts not installed. Run: pip install edge-tts")
    sys.exit(1)

# Path to seed-tour-content.ts
SEED_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'db', 'seed-tour-content.ts')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')

# Default settings
DEFAULT_VOICE = "en-US-JennyNeural"
DEFAULT_RATE = "+0%"
DEFAULT_PITCH = "+0Hz"


def extract_tour_entries(filepath: str) -> list[dict]:
    """Parse tour entries from the TypeScript seed file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    entries = []

    # Find all entries with locationId and content
    # Use regex to extract locationId, title, and content fields
    pattern = r"locationId:\s*'([^']+)'.*?title:\s*'([^']+)'.*?content:\s*`([^`]+)`"
    matches = re.finditer(pattern, content, re.DOTALL)

    for match in matches:
        location_id = match.group(1)
        title = match.group(2)
        text = match.group(3).strip()
        entries.append({
            'locationId': location_id,
            'title': title,
            'content': text,
        })

    return entries


async def list_voices():
    """List available English voices."""
    voices = await edge_tts.list_voices()
    en_voices = [v for v in voices if v['Locale'].startswith('en-')]
    print(f"\nAvailable English voices ({len(en_voices)}):\n")
    for v in sorted(en_voices, key=lambda x: x['ShortName']):
        gender = v.get('Gender', '?')
        print(f"  {v['ShortName']:30s}  {gender:8s}  {v.get('FriendlyName', '')}")


async def generate_audio(entry: dict, voice: str, rate: str, pitch: str, output_dir: str):
    """Generate MP3 for a single tour entry."""
    location_id = entry['locationId']
    title = entry['title']
    text = f"{title}. {entry['content']}"

    filename = f"tour-{location_id}.mp3"
    filepath = os.path.join(output_dir, filename)

    print(f"  Generating: {filename} ({len(text)} chars)...", end=" ", flush=True)

    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(filepath)

    size_kb = os.path.getsize(filepath) / 1024
    size_mb = size_kb / 1024
    print(f"Done ({size_mb:.1f} MB)" if size_mb >= 1 else f"Done ({size_kb:.0f} KB)")

    return filepath


async def main():
    args = sys.argv[1:]

    # Handle --list-voices
    if '--list-voices' in args:
        await list_voices()
        return

    # Parse voice option
    voice = DEFAULT_VOICE
    if '--voice' in args:
        idx = args.index('--voice')
        if idx + 1 < len(args):
            voice = args[idx + 1]
            args = [a for i, a in enumerate(args) if i != idx and i != idx + 1]

    # Parse rate option
    rate = DEFAULT_RATE
    if '--rate' in args:
        idx = args.index('--rate')
        if idx + 1 < len(args):
            rate = args[idx + 1]
            args = [a for i, a in enumerate(args) if i != idx and i != idx + 1]

    # Remaining args are location IDs to filter
    filter_ids = [a for a in args if not a.startswith('--')]

    # Extract entries from seed file
    entries = extract_tour_entries(SEED_FILE)
    if not entries:
        print("Error: No tour entries found in seed file")
        sys.exit(1)

    # Filter if specific IDs requested
    if filter_ids:
        entries = [e for e in entries if e['locationId'] in filter_ids]
        if not entries:
            print(f"Error: No entries found for: {', '.join(filter_ids)}")
            print(f"Available: {', '.join(e['locationId'] for e in extract_tour_entries(SEED_FILE))}")
            sys.exit(1)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Tour Guide Audio Generator")
    print(f"  Voice: {voice}")
    print(f"  Rate:  {rate}")
    print(f"  Output: {OUTPUT_DIR}")
    print(f"  Entries: {len(entries)}")
    print()

    total_size = 0
    for entry in entries:
        filepath = await generate_audio(entry, voice, rate, pitch=DEFAULT_PITCH, output_dir=OUTPUT_DIR)
        total_size += os.path.getsize(filepath)

    total_mb = total_size / (1024 * 1024)
    print(f"\nDone! Generated {len(entries)} files ({total_mb:.1f} MB total)")


if __name__ == '__main__':
    asyncio.run(main())
