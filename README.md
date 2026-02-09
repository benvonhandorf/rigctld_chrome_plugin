# rigctrld_chrome_plugin
Plugin to allow quickly setting frequencies/modes from chrome for POTA/SOTA/RBN


## Installation

### Option 1: Install from Chrome Web Store (Recommended)

1. Install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID)
2. Install the native messaging host:
   ```bash
   curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/rigctld_chrome_plugin/main/host/install-remote.sh | bash
   ```
3. Restart Chrome

### Option 2: Build from Source (Developers)

#### System Requirements

```bash
sudo apt install libcurl4-openssl-dev libssl-dev npm librsvg2-bin
```

#### Build the Extension

```bash
cd extension
npm install
make package
```

#### Load the Extension

1. In Chrome, go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/dist` directory
5. Note your extension ID from this page

#### Configure Native Host

Since you're building from source, you'll have a different extension ID than the published version. Update the native host manifest with your local ID:

1. Edit `host/com.skyironstudio.rigctld_native_messaging_host.json`
2. Replace the extension ID in `allowed_origins` with your local ID:
   ```json
   "allowed_origins": [
     "chrome-extension://YOUR_LOCAL_EXTENSION_ID/"
   ]
   ```
3. Install the native host:
   ```bash
   cd host
   ./install.sh
   ```
4. Restart Chrome



## Configuration

### Rig setup

For each radio you wish to control, you will need to configure that rig in the options.

This chrome extension is currently capable of talking to [Rigctld from the Ham Radio Control Library](https://hamlib.github.io/) or [Gqrx](https://gqrx.dk/).  The following instructions assume you have already installed, configured, enabled and tested the one you want to use.  

- Open the extension options page by going to Tools -> Extensions in Chrome.
- In the Rigs section, enter a name for the radio.,
- Enter the hostname and port number for your communication.  The default port for Rigctld is `4532`.   The default port for Gqrx is `7356`.
- Save the rig.
- Ensure the rig is enabled for control.  

Note that you can have multiple radios under control at the same time, which can be useful for diversity reception.

### Alert configuration

The extensions can be configured to alert you when an open tab sees a spot that you are interested in.  You can configure as many alerts as you wish.  If a spot matches multiple alerts it will be associated with the first one that matches.

Alerts are composed of multiple fields that must all match for a spot to trigger the alert.

Note that the following fields are evaluated to true if the spot matches any of the selected options.  
- Band
- Program
- Mode

Alerts will cause the extension icon to change.  Other alerting options can be configured in the extension options