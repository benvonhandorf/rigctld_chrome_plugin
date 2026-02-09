# Asset Generation Guide

This guide explains how to generate all required icons and images for the Chrome Web Store and extension.

## Icon Files Needed

### Extension Icons (in `extension/public/images/`)

These icons are used in the Chrome toolbar, extensions page, and store listing.

| File | Size | Purpose |
|------|------|---------|
| `icon16.png` | 16x16 | Favicon, small toolbar |
| `icon24.png` | 24x24 | Toolbar icon (default) |
| `icon32.png` | 32x32 | Toolbar icon (high-DPI) |
| `icon48.png` | 48x48 | Extensions management page |
| `icon128.png` | 128x128 | Chrome Web Store, installation |

### Generate from SVG

Use the `icon.svg` in this directory as the source. Generate PNGs using:

```bash
# Using Inkscape (recommended)
cd store-assets
for size in 16 24 32 48 128; do
  inkscape -w $size -h $size icon.svg -o ../extension/public/images/icon${size}.png
done

# Or using ImageMagick
for size in 16 24 32 48 128; do
  convert -background none -density 384 icon.svg -resize ${size}x${size} ../extension/public/images/icon${size}.png
done

# Or using rsvg-convert (librsvg)
for size in 16 24 32 48 128; do
  rsvg-convert -w $size -h $size icon.svg > ../extension/public/images/icon${size}.png
done
```

### Status Icons (Toolbar States)

The extension uses different icons to show status. These already exist but could be updated:

| File | Purpose |
|------|---------|
| `signal_empty.png` | Default state - no alerts |
| `signal_alert.png` | Alert active |
| `signal_empty_bk.png` | Default with break-in enabled |
| `signal_alert_bk.png` | Alert with break-in enabled |

To create consistent status icons, you can modify `icon.svg`:
- **Empty**: Green indicator dot (current)
- **Alert**: Change indicator dot to red/orange (#ff5722)
- **Break-in variants**: Add a small "BK" badge or different background

## Chrome Web Store Assets

These go in the `store-assets/` directory and are uploaded separately to the Developer Dashboard.

### Required

| File | Size | Notes |
|------|------|-------|
| `store-icon-128.png` | 128x128 | Same as icon128.png |
| `screenshot-1.png` | 1280x800 or 640x400 | At least 1 required |

### Recommended Screenshots

Capture these scenarios for the store listing:

1. **POTA Spotter Page** (`screenshot-pota.png`)
   - Show pota.app with spots visible
   - Highlight the clickable frequency buttons added by the extension

2. **Extension Options** (`screenshot-options.png`)
   - Show the Radio Configuration section
   - Show a configured radio with connection status

3. **Alert Configuration** (`screenshot-alerts.png`)
   - Show the Alert Configuration section
   - Display an example alert setup

4. **Popup with Alerts** (`screenshot-popup.png`)
   - Show the extension popup
   - Display active alerts if possible

### Screenshot Tips

- Use a clean browser profile
- Set browser zoom to 100%
- Crop to exact dimensions (1280x800 recommended)
- Highlight key features with arrows/annotations if needed

### Promotional Tiles (Optional)

| File | Size | Purpose |
|------|------|---------|
| `promo-small.png` | 440x280 | Small promotional tile |
| `promo-large.png` | 920x680 | Large promotional tile |
| `promo-marquee.png` | 1400x560 | Marquee (featured) tile |

These should include:
- Extension icon
- "Radio Control" text
- Tagline: "Click spots to tune your rig"
- Ham radio imagery (optional)

## Quick Setup Script

After generating the icons, rebuild and test:

```bash
# Generate icons (using Inkscape)
cd store-assets
for size in 16 24 32 48 128; do
  inkscape -w $size -h $size icon.svg -o ../extension/public/images/icon${size}.png
done

# Copy 128px icon for store
cp ../extension/public/images/icon128.png store-icon-128.png

# Rebuild extension
cd ../extension
npm run build

# Create distribution ZIP
cd dist
zip -r ../../store-assets/radio-control-extension.zip .
```

## Verification Checklist

Before submitting to Chrome Web Store:

- [ ] All icon sizes generated (16, 24, 32, 48, 128)
- [ ] Icons display correctly at small sizes
- [ ] At least 1 screenshot captured
- [ ] Screenshot shows extension functionality clearly
- [ ] Extension ZIP created from dist/ folder
- [ ] Tested extension loads correctly from ZIP
- [ ] Store listing text reviewed (see store-listing.md)
