#!/bin/bash
# Remote installer for Radio Control native messaging host
# Usage: curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/rigctld_chrome_plugin/main/host/install-remote.sh | bash

set -e

REPO_URL="https://raw.githubusercontent.com/YOUR_USERNAME/rigctld_chrome_plugin/main/host"
INSTALL_DIR="$HOME/.local/share/radio-control-native-host"
HOST_NAME="com.skyironstudio.rigctld_native_messaging_host"

echo "Installing Radio Control native messaging host..."

# Determine target directory based on OS and user
if [ "$(uname -s)" = "Darwin" ]; then
    if [ "$(whoami)" = "root" ]; then
        TARGET_DIR="/Library/Google/Chrome/NativeMessagingHosts"
    else
        TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
    fi
else
    if [ "$(whoami)" = "root" ]; then
        TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
    else
        TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
    fi
fi

echo "Installation directory: $INSTALL_DIR"
echo "Manifest directory: $TARGET_DIR"

# Check for required tools
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    echo "Install it with: sudo apt install python3 python3-venv python3-pip"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo "Error: curl is required but not installed."
    exit 1
fi

# Create installation directory
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Download native host files
echo "Downloading native host files..."
curl -sSL "$REPO_URL/native_host.py" -o native_host.py
curl -sSL "$REPO_URL/native_host.sh" -o native_host.sh
curl -sSL "$REPO_URL/rigctld_connection.py" -o rigctld_connection.py
curl -sSL "$REPO_URL/gqrx_connection.py" -o gqrx_connection.py
curl -sSL "$REPO_URL/pushover_api.py" -o pushover_api.py
curl -sSL "$REPO_URL/requirements.txt" -o requirements.txt
curl -sSL "$REPO_URL/${HOST_NAME}_template.json" -o "$HOST_NAME.json"
curl -sSL "$REPO_URL/push_notification_settings_template.json" -o "push_notification_settings.json"

# Make scripts executable
chmod +x native_host.py native_host.sh

# Create Python virtual environment
echo "Setting up Python environment..."
python3 -m venv env
./env/bin/pip install -q -r requirements.txt

# Update native_host.sh to use correct path
cat > native_host.sh << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "$0" )" && pwd )"
exec "$DIR/env/bin/python3" "$DIR/native_host.py"
EOF
chmod +x native_host.sh

# Create target directory and install manifest
mkdir -p "$TARGET_DIR"
cp "$HOST_NAME.json" "$TARGET_DIR/"

# Update host path in the manifest
HOST_PATH="$INSTALL_DIR/native_host.sh"
if [ "$(uname -s)" = "Darwin" ]; then
    sed -i '' "s|HOST_PATH|$HOST_PATH|" "$TARGET_DIR/$HOST_NAME.json"
else
    sed -i "s|HOST_PATH|$HOST_PATH|" "$TARGET_DIR/$HOST_NAME.json"
fi

chmod o+r "$TARGET_DIR/$HOST_NAME.json"

echo ""
echo "Installation complete!"
echo ""
echo "Native host installed to: $INSTALL_DIR"
echo "Manifest installed to: $TARGET_DIR/$HOST_NAME.json"
echo ""
echo "Please restart Chrome for changes to take effect."
echo ""
echo "To uninstall, run:"
echo "  rm -rf $INSTALL_DIR"
echo "  rm $TARGET_DIR/$HOST_NAME.json"
