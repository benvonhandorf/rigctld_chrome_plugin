
build:
	npx webpack-cli --mode=production
	date

test:
	npx jest test

clean:
	rm -rf dist

# Generate icons from SVG source
icons:
	@echo "Generating icons from SVG..."
	@command -v inkscape >/dev/null 2>&1 || { echo "inkscape not found, trying rsvg-convert..."; \
		command -v rsvg-convert >/dev/null 2>&1 || { echo "Error: Install inkscape or librsvg2-bin"; exit 1; }; }
	@if command -v inkscape >/dev/null 2>&1; then \
		for size in 16 24 32 48 128; do \
			inkscape -w $$size -h $$size ../store-assets/icon.svg -o public/images/icon$$size.png; \
		done; \
	else \
		for size in 16 24 32 48 128; do \
			rsvg-convert -w $$size -h $$size ../store-assets/icon.svg > public/images/icon$$size.png; \
		done; \
	fi
	@echo "Icons generated successfully"

# Full package for Chrome Web Store
package: clean icons build
	@echo "Creating extension package..."
	@mkdir -p ../store-assets
	cd dist && zip -r ../../store-assets/radio-control-extension.zip .
	@cp public/images/icon128.png ../store-assets/store-icon-128.png
	@echo ""
	@echo "Package created: store-assets/radio-control-extension.zip"
	@echo "Store icon copied: store-assets/store-icon-128.png"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Take screenshots of the extension in use"
	@echo "  2. Upload to https://chrome.google.com/webstore/devconsole"

# Quick package without regenerating icons
package-quick: clean build
	@echo "Creating extension package..."
	@mkdir -p ../store-assets
	cd dist && zip -r ../../store-assets/radio-control-extension.zip .
	@echo "Package created: store-assets/radio-control-extension.zip"

.PHONY: build test clean icons package package-quick
