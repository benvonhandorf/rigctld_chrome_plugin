#!/bin/bash
# Native messaging host installer for Radio Control extension

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
HOST_NAME=com.skyironstudio.rigctld_native_messaging_host

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

echo "Target directory: $TARGET_DIR"

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    echo "Install it with: sudo apt install python3 python3-venv python3-pip"
    exit 1
fi

# Create Python virtual environment if it doesn't exist
if [ ! -d "$DIR/env" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$DIR/env"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
"$DIR/env/bin/pip" install -q -r "$DIR/requirements.txt"

# Create target directory
mkdir -p "$TARGET_DIR"

# Copy and configure the manifest
echo "Installing native messaging host manifest..."
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR/"

# Update host path in the manifest
HOST_PATH="$DIR/native_host.sh"
if [ "$(uname -s)" = "Darwin" ]; then
    sed -i '' "s|HOST_PATH|$HOST_PATH|" "$TARGET_DIR/$HOST_NAME.json"
else
    sed -i "s|HOST_PATH|$HOST_PATH|" "$TARGET_DIR/$HOST_NAME.json"
fi

# Set permissions
chmod o+r "$TARGET_DIR/$HOST_NAME.json"
chmod +x "$DIR/native_host.sh"
chmod +x "$DIR/native_host.py"

echo ""
echo "Installation complete!"
echo ""
echo "Manifest installed to: $TARGET_DIR/$HOST_NAME.json"
echo "Host script: $DIR/native_host.sh"
echo ""
echo "Please restart Chrome for changes to take effect."
