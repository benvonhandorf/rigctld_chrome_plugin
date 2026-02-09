# rigctld_chrome_plugin - Project Documentation

## Overview

A Chrome browser extension that enables amateur radio operators to control their radios directly from POTA (Parks on the Air) and SOTA (Summits on the Air) spotter websites. The extension makes frequencies clickable and provides configurable alerts for spots matching specific criteria.

## Architecture

### Two-Component System

1. **Chrome Extension** (TypeScript/React)
2. **Native Messaging Host** (Python)

### Chrome Extension Components

#### Content Scripts
- [pota-spotter-content.ts](extension/src/pota-spotter-content.ts) - POTA website integration
- [sota-spotter-content.ts](extension/src/sota-spotter-content.ts) - SOTA website integration

**Responsibilities:**
- Parse spot data from DOM (frequency, mode, callsign, unit/location)
- Make frequency entries clickable
- Use MutationObserver to track DOM changes
- Highlight selected spots
- Send spot data to background service worker

#### Background Service Worker
- [background.ts](extension/src/background.ts) - Core extension logic

**Responsibilities:**
- Manage spot data across all open tabs
- Evaluate alerts based on user-configured criteria
- Communicate with native host for radio control
- Manage extension icon state (alert indicators)
- Persist data to Chrome storage
- Handle tab lifecycle (cleanup closed tabs)

#### Alert System
- [AlertEvaluator.tsx](extension/src/AlertEvaluator.tsx) - Alert matching logic
- [AlertConfiguration.ts](extension/src/AlertConfiguration.ts) - Alert configuration schema
- [Alert.tsx](extension/src/Alert.tsx) - Alert data structure

**Features:**
- Band filtering: 80m, 40m, 30m, 20m, 17m, 15m, 12m, 10m
- Mode filtering: CW, SSB, DIGITAL (FT4, FT8, PSK31, RTTY)
- Program filtering: POTA, SOTA
- Location/callsign/unit filtering
- Multi-criteria matching (all conditions must match)

#### User Interface
- **Popup** ([pages/Popup/](extension/src/pages/Popup/))
  - Display active alerts
  - Show tabs with spot counts (total, CW, SSB)
  - Navigate to and highlight specific spots

- **Options Page** ([pages/Options/](extension/src/pages/Options/))
  - Configure radio connections (rigctld/gqrx)
  - Create and manage alert rules
  - Enable/disable radios for control

#### Data Layer
- [repositories/DataCache.ts](extension/src/repositories/DataCache.ts) - In-memory cache
- [repositories/OptionRepository.ts](extension/src/repositories/OptionRepository.ts) - Settings management
- [repositories/RigRepository.ts](extension/src/repositories/RigRepository.ts) - Radio configuration
- [repositories/AlertRepository.ts](extension/src/repositories/AlertRepository.ts) - Alert configuration

### Native Messaging Host

#### Core Components
- [native_host.py](host/native_host.py) - Main message handler
  - Receives control messages via Chrome native messaging protocol
  - Routes commands to appropriate radio connection
  - Sends push notifications for alerts
  - Logs all operations to info.log

#### Radio Control
- [rigctld_connection.py](host/rigctld_connection.py) - Hamlib rigctld interface
- [gqrx_connection.py](host/gqrx_connection.py) - Gqrx SDR interface

**Communication:** TCP socket connections

**Mode/Passband Mapping:**
- CW → CW mode, 200Hz passband
- SSB → USB/LSB (frequency-dependent), 2600Hz passband
  - USB for frequencies > 10 MHz
  - LSB for frequencies ≤ 10 MHz
- FT8 → PKTUSB, 3000Hz passband

**Radio State Monitoring:**
- Frequency
- Mode and passband
- Power output (RF power level converted to mW)
- Break-in (QSK) status

#### Push Notifications
- [pushover_api.py](host/pushover_api.py) - Pushover integration
- Sends mobile notifications when new alerts match
- Configuration: push_notification_settings.json

## Data Flow

1. User visits POTA or SOTA spotter website
2. Content script parses spot cards from DOM
3. Content script sends spot data to background service worker
4. Background worker stores spots by tab ID
5. Background worker evaluates spots against alert configurations
6. When new matching alerts found:
   - Update extension icon (visual indicator)
   - Send notification via native host → Pushover
   - Store alerts in current alerts list
7. User clicks frequency in webpage:
   - Content script creates control message
   - Background worker forwards to native host
   - Native host sends commands to rigctld/gqrx
   - Radio tunes to frequency/mode
   - Spot data copied to clipboard

## Technology Stack

### Extension
- **Language:** TypeScript
- **UI Framework:** React 17
- **Component Library:** Material-UI (MUI) 5
- **Build Tool:** Webpack 5
- **Testing:** Jest with ts-jest
- **Chrome APIs:** Native Messaging, Storage, Tabs, Clipboard

### Native Host
- **Language:** Python 3
- **Dependencies:**
  - Native messaging protocol (stdin/stdout binary)
  - Socket communication (TCP)
  - JSON message encoding

### System Dependencies
- libcurl4-openssl-dev
- libssl-dev
- npm (for extension development)

## Key Features

1. **Clickable Frequencies:** Transform static frequency text into interactive elements
2. **Multi-Radio Support:** Control multiple radios simultaneously
3. **Configurable Alerts:** Filter by band, mode, program, location, callsign, unit
4. **Visual Feedback:** Extension icon changes to show alert status
5. **Spot Navigation:** Click alerts to highlight and scroll to spots in tabs
6. **Clipboard Integration:** Automatic spot data copying on frequency click
7. **Tab Management:** Track spots across multiple browser tabs
8. **Break-in Indication:** Visual indicator for QSK/break-in radio status

## File Structure

```
rigctld_chrome_plugin/
├── extension/                    # Chrome extension
│   ├── src/
│   │   ├── background.ts         # Service worker
│   │   ├── pota-spotter-content.ts
│   │   ├── sota-spotter-content.ts
│   │   ├── AlertEvaluator.tsx    # Alert matching logic
│   │   ├── Spot.ts               # Spot data interface
│   │   ├── Messages.ts           # Message type definitions
│   │   ├── pages/
│   │   │   ├── Popup/            # Extension popup UI
│   │   │   └── Options/          # Options page UI
│   │   └── repositories/         # Data management
│   ├── manifest.json             # Extension manifest (v3)
│   ├── package.json
│   ├── webpack.config.js
│   └── jest.config.ts
├── host/                         # Native messaging host
│   ├── native_host.py            # Main message handler
│   ├── rigctld_connection.py     # Hamlib interface
│   ├── gqrx_connection.py        # Gqrx interface
│   ├── pushover_api.py           # Push notifications
│   ├── install.sh                # Installation script
│   ├── requirements.txt
│   └── com.skyironstudio.rigctld_native_messaging_host.json
└── README.md
```

## Installation

### Extension Development
```bash
cd extension
npm install
make  # or: npm run build
```

### Extension Installation
1. Open Chrome → Tools → Extensions
2. Enable Developer Mode
3. Click "Load Unpacked Extension"
4. Select `extension/dist` directory
5. Copy the Extension ID

### Native Host Setup
1. Edit `host/com.skyironstudio.rigctld_native_messaging_host.json`
2. Replace extension ID in `allowed_extensions` with your copied ID
3. Run `cd host && ./install.sh`
4. Restart Chrome

### Radio Setup
- Configure rigctld or gqrx with network control enabled
- Default ports:
  - rigctld: 4532
  - gqrx: 7356

## Configuration

### Rig Setup (via Options Page)
- Name: Friendly identifier for the radio
- Type: rigctld or gqrx
- Hostname: Usually localhost
- Port: Control port number
- Enabled: Toggle radio for control

### Alert Configuration (via Options Page)
All specified fields must match for an alert to trigger:
- **Program:** POTA, SOTA, or both
- **Band:** 80m, 40m, 30m, 20m, 17m, 15m, 12m, 10m (select multiple)
- **Mode:** CW, SSB, DIGITAL (select multiple)
- **Location:** Text match on location field
- **Callsign:** Text match on callsign
- **Unit:** Text match on park/summit identifier

## Testing

```bash
cd extension
npm test
```

Tests cover:
- Alert evaluation logic
- Spot comparison/matching
- Object matching utilities

## Known Issues / Future Improvements

1. **Installation Complexity:** Multi-step manual process could be automated
2. **Audio Alerts:** Currently commented out in code (background.ts:40-43)
3. **Error Feedback:** Native host errors don't propagate to extension UI
4. **Documentation:** Could expand troubleshooting and configuration guides
5. **Platform Support:** install.sh may not work properly on macOS

## Recent Fixes

### Hot-Loader Dependency Conflict (Fixed - 2026-01-11)
**Issue:** Build failed with peer dependency conflict for `@hot-loader/react-dom@17.0.1` requiring exactly `react@17.0.1` while project used `react@17.0.2`.

**Root Cause:** React Hot Loader is a development tool for hot module replacement that is incompatible with Chrome extension architecture (extensions cannot use webpack-dev-server and must be manually reloaded).

**Resolution:** Removed unnecessary hot-loader dependencies:
- Removed `@hot-loader/react-dom` from devDependencies
- Removed `react-hot-loader` from dependencies
- Removed webpack alias `'react-dom': '@hot-loader/react-dom'` from webpack.config.js
- Removed `react-hot-loader/babel` plugin from .babelrc

Build now works with standard React 17.0.2.

### Dependency Updates (2026-01-11)
**Updated packages** to their latest compatible versions within safe upgrade paths:

**Major updates:**
- Babel packages: 7.15.x → 7.26.x (build tools, safe update)
- Webpack: 5.73.0 → 5.97.1 (build tool updates)
- Webpack CLI: 4.9.0 → 5.1.4 (CLI improvements)
- Webpack Dev Server: 4.3.1 → 5.2.2 (dev server updates)
- Babel Loader: 8.2.2 → 9.2.1 (loader updates)
- Copy Webpack Plugin: 9.0.1 → 12.0.2 (build plugin updates)
- @fontsource/roboto: 4.5.1 → 5.2.9 (font package update)
- @emotion packages: 11.3.x/11.4.x → 11.14.0 (emotion styling)
- @types/chrome: 0.0.159 → 0.0.277 (updated type definitions)

**Kept at current versions to avoid breaking changes:**
- MUI (Material-UI): Staying at 5.x (MUI v6+ has breaking changes)
- TypeScript: Staying at 4.9.5 (stable, compatible with Jest 29)
- react-router-dom: Staying at 5.x (v6+ has different API)
- uuid: Staying at 8.x (newer versions have ESM-only exports)

All tests pass and build works successfully with updated dependencies.

### React 18 Upgrade (2026-01-11)
**Upgraded React from 17.0.2 → 18.3.1** with full migration to modern patterns.

**Updated packages:**
- **react**: 17.0.2 → **18.3.1**
- **react-dom**: 17.0.2 → **18.3.1**
- **@types/react**: 17.0.90 → **18.3.18**
- **@types/react-dom**: 17.0.26 → **18.3.5**
- **jest**: 27.5.1 → **29.7.0**
- **babel-jest**: 27.5.1 → **29.7.0**
- **ts-jest**: 27.1.5 → **29.2.5**
- **@types/jest**: 27.5.2 → **29.5.14**
- Added **jest-environment-jsdom** 29.7.0 (required for Jest 29)

**Code changes made:**
1. **Migrated to createRoot API** (React 18 requirement)
   - [Popup/index.tsx](extension/src/pages/Popup/index.tsx): Replaced `ReactDOM.render()` with `createRoot()` pattern
   - [Options/index.tsx](extension/src/pages/Options/index.tsx): Replaced `ReactDOM.render()` with `createRoot()` pattern
   - Created persistent root instances to handle dynamic re-renders

2. **Added missing key props** (React 18 stricter warnings)
   - [Popup/Alerts.tsx](extension/src/pages/Popup/Alerts.tsx): Added `key={alert.alert_id}`
   - [Popup/TabsDisplay.tsx](extension/src/pages/Popup/TabsDisplay.tsx): Added `key={tab.tab_id}`
   - [Popup/RigConfigurationDisplay.tsx](extension/src/pages/Popup/RigConfigurationDisplay.tsx): Added `key={rig.id}`
   - [Options/RigConfigurationDisplay.tsx](extension/src/pages/Options/RigConfigurationDisplay.tsx): Added `key={rig.id}`
   - [Options/AlertConfigurationDisplay.tsx](extension/src/pages/Options/AlertConfigurationDisplay.tsx): Added `key={alertConfigurationItem.alert_id}`
   - [Options/AlertEntry.tsx](extension/src/pages/Options/AlertEntry.tsx): Added keys for program/mode/band lists
   - [Options/AlertConfigurationItemDisplay.tsx](extension/src/pages/Options/AlertConfigurationItemDisplay.tsx): Fixed malformed JSX and added `key={item}`

**Benefits of React 18:**
- Automatic batching for better performance
- Concurrent rendering capabilities
- Improved TypeScript support
- Modern foundation for future updates

**Verification:**
- ✅ All 31 tests passing
- ✅ Build successful (popup: 526KB, options: 769KB)
- ✅ No breaking changes to functionality
- ✅ Ready for Chrome extension deployment

### UI/UX Styling Improvements (2026-01-11)
**Enhanced visual design** with professional CSS styling for better user experience.

**Popup Page Improvements** ([Popup/index.css](extension/src/pages/Popup/index.css)):
- Set proper popup dimensions (400px wide, min 300px height)
- Added section headers with color coding:
  - Blue for "Active Tabs"
  - Red for "Current Alerts"
  - Green for "Radio Control"
- Styled data table with proper borders, padding, and hover states
- Enhanced alert cards with hover effects (lift animation + shadow)
- Improved matched field highlighting (red badge style)
- Added empty state messages for better UX
- Consistent spacing and padding throughout

**Options Page Improvements** ([Options/index.css](extension/src/pages/Options/index.css)):
- Clean white cards on light gray background
- Section headers with colored bottom borders
- Maximum width constraint (900px) for readability
- Proper form field spacing and layout
- Visual separator between existing items and new entry forms
- Hover effects on cards and delete buttons
- Better typography hierarchy (h1, h2 styling)
- Improved checkbox group layout

**Visual Enhancements:**
- Smooth transitions for all interactive elements
- Consistent Material Design color palette
- Professional spacing using 8px grid system
- Clear hover states indicating clickability
- Better visual hierarchy with typography
- Responsive feedback for all user actions

**Benefits:**
- ✨ Professional appearance matching modern UI standards
- 👆 Clear affordances showing what's clickable
- 📊 Better information hierarchy and scannability
- 🎨 Consistent visual language throughout
- ⚡ Smooth interactions with CSS transitions
- 💬 Helpful empty states when no data present

### Component Layout Improvements (2026-01-11 - Phase 2)
**Enhanced component layouts** with icons and improved information architecture.

**Component Updates:**

1. **AlertSummary** ([Popup/AlertSummary.tsx](extension/src/pages/Popup/AlertSummary.tsx)):
   - Two-row layout: Callsign + Frequency on top row
   - Icons for metadata: 📍 unit, 📻 mode, 🗺️ location
   - Proper frequency formatting (3 decimal places)
   - Conditional rendering (only show fields that exist)
   - Better use of horizontal space

2. **RigDisplay** ([Options/RigDisplay.tsx](extension/src/pages/Options/RigDisplay.tsx)):
   - Icons: 📻 for radio name, 🌐 for connection
   - Side-by-side layout: Info on left, toggle on right
   - Larger card width (600px) for better readability
   - Dynamic label: "Enabled" vs "Disabled" on switch
   - Visual hierarchy with font sizes (18px name, 14px connection)

3. **RigDisplaySimple** ([Popup/RigDisplaySimple.tsx](extension/src/pages/Popup/RigDisplaySimple.tsx)):
   - Compact design for popup space constraints
   - Icon: 📻 for consistency
   - Horizontal layout with small switch
   - Reduced padding for space efficiency

**Code Improvements:**
- Refactored render functions for flexibility (inline vs block)
- Null checks prevent rendering empty fields
- Consistent icon usage across all components
- FlexBox layouts for responsive alignment

**Bundle Impact:**
- Popup: 528KB → **501KB** (-27KB, -5.1%)
- Options: 771KB (no change)
- All 31 tests passing ✅

## Message Protocol

### Extension → Native Host

**Control Message:**
```json
{
  "type": "control",
  "rig": {
    "name": "IC-7300",
    "type": "rigctld",
    "config": {
      "host": "localhost",
      "port": 4532
    }
  },
  "spot": {
    "frequency": 14062000,
    "mode": "CW",
    "callsign": "W1AW",
    "unit": "K-0001",
    "location": "Colorado",
    "program": "pota"
  }
}
```

**Notify Alerts Message:**
```json
{
  "type": "alerts",
  "alerts": [
    {
      "alert_id": "abc123",
      "alert_fields": ["band", "mode"],
      "frequency": 7032000,
      "mode": "CW",
      "callsign": "K7ABC",
      "program": "pota"
    }
  ]
}
```

### Native Host → Extension

**Radio State Response:**
```json
{
  "response_code": 0,
  "frequency": 14062000,
  "mode": "CW",
  "passband": 200,
  "power_level": 0.5,
  "power_mw": 50000,
  "break_in": true
}
```

## Development Notes

### Content Script DOM Parsing
- POTA uses Vuetify framework (v-card, v-menu classes)
- Frequency regex: `/(?<frequency>\d+(?:.?\d+)?)\s*(?<units>[k]?)Hz\s*(?:\((?<mode>\w+)\))?/`
- Uses MutationObserver with 100ms debounce for performance
- Handles dynamic spot updates without page reload

### Alert Persistence
- Spots stored by tab ID in Chrome local storage
- Alerts rebuilt on startup from stored spots
- Vestigial alert cleanup when tabs close
- Alert indicator persists until user views popup

### Extension Icon States
- `signal_empty.png` - No alerts
- `signal_alert.png` - Active alerts
- `signal_empty_bk.png` - No alerts, break-in enabled
- `signal_alert_bk.png` - Active alerts, break-in enabled

## License

See [LICENSE](LICENSE) file for details.

## Author

AB4EN (callsign from package.json description)
