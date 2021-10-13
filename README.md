# rigctrld_chrome_plugin
Plugin to allow quickly setting frequencies/modes from chrome for POTA/SOTA/RBN


## Installation

Is currently a mess.

- In chrome, go to Tools -> Extensions.
- Enable developer mode.
- Select "Load Unpacked Extension"
- Point it at the `/extension` directory.
- Copy the extension ID from this page.
- Edit `./host/com.skyironstudio.rigctld_native_messaging_host.json`
- Replace ID in the `allowed_extensions` chrome-extension URI with the ID you copied from your local installation.
- Save the file and close it.
- In `./host`, execute `install.sh`.  This might work properly on macs, but possibly not.
- Restart Chrome.

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