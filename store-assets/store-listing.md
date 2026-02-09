# Chrome Web Store Listing

## Extension Name
Radio Control

## Short Description (132 characters max)
Control your ham radio directly from POTA and SOTA spotter websites. Click a spot to instantly tune your rig to that frequency.

## Detailed Description
Radio Control connects your web browser to your amateur radio equipment, letting you tune your radio with a single click from popular spotting websites.

**Supported Spotter Sites:**
- POTA (Parks on the Air) - pota.app
- SOTA (Summits on the Air) - sotawatch.sota.org.uk

**Features:**
- One-click frequency tuning from spotted activations
- Support for multiple radios simultaneously
- Configurable alerts for spots matching your interests
- Filter alerts by band, mode, or program
- Works with Rigctld (Hamlib) and Gqrx

**How It Works:**
1. Install the extension and native messaging host
2. Configure your radio connection (Rigctld or Gqrx)
3. Browse POTA or SOTA spotter pages
4. Click any spot to instantly tune your radio

**Requirements:**
- Rigctld (from Hamlib) or Gqrx running and connected to your radio
- Native messaging host installed (see documentation)
- Linux or macOS

**For Amateur Radio Operators:**
This extension streamlines the process of working Parks on the Air and Summits on the Air activations. No more manually copying frequencies - just click and work the station!

73 de the developer

## Category
Productivity

## Language
English

## Website
https://github.com/[your-username]/rigctld_chrome_plugin

## Privacy Policy URL
(Required if extension requests sensitive permissions)

---

# Required Assets Checklist

## Icons (Required)
- [ ] 128x128 PNG - Store listing icon

## Screenshots (Required - at least 1)
- [ ] 1280x800 or 640x400 PNG/JPG
- Suggested screenshots:
  1. POTA spotter page with extension active, showing clickable spots
  2. Extension options page showing radio configuration
  3. Alert configuration screen
  4. Popup showing current alerts

## Promotional Images (Optional but Recommended)
- [ ] Small promo tile: 440x280 PNG
- [ ] Large promo tile: 920x680 PNG
- [ ] Marquee promo tile: 1400x560 PNG

---

# Developer Account Setup

1. Go to https://chrome.google.com/webstore/devconsole
2. Pay one-time $5 developer registration fee
3. Verify your email and identity
4. Create a new item and upload the extension ZIP

# Packaging the Extension

```bash
cd extension
npm run build
cd dist
zip -r ../radio-control-extension.zip .
```

Upload `radio-control-extension.zip` to the Chrome Web Store Developer Dashboard.
