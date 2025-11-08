#!/bin/bash

# Script to create ZIP file of WordPress theme
# Usage: bash create-zip.sh

echo "Creating WordPress theme ZIP file..."

# Check if zip command is available
if command -v zip &> /dev/null; then
    cd wordpress-theme
    zip -r narayane-sena-theme.zip narayane-sena/
    echo "✓ ZIP file created: wordpress-theme/narayane-sena-theme.zip"
    echo "File size: $(du -h narayane-sena-theme.zip | cut -f1)"
elif command -v python3 &> /dev/null; then
    echo "Using Python to create ZIP..."
    python3 << 'EOF'
import zipfile
import os

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.join('narayane-sena', os.path.relpath(file_path, 'wordpress-theme/narayane-sena'))
            ziph.write(file_path, arcname)

zipf = zipfile.ZipFile('wordpress-theme/narayane-sena-theme.zip', 'w', zipfile.ZIP_DEFLATED)
zipdir('wordpress-theme/narayane-sena/', zipf)
zipf.close()
print('✓ ZIP file created: wordpress-theme/narayane-sena-theme.zip')
EOF
else
    echo "❌ Neither 'zip' nor 'python3' command found."
    echo ""
    echo "Alternative options:"
    echo "1. Download the 'narayane-sena' folder to your computer"
    echo "2. Compress it locally:"
    echo "   - Windows: Right-click → Send to → Compressed folder"
    echo "   - Mac: Right-click → Compress"
    echo "   - Linux: zip -r narayane-sena.zip narayane-sena/"
    echo ""
    echo "Or use the tar.gz file already created:"
    echo "   wordpress-theme/narayane-sena-theme.tar.gz"
    exit 1
fi

echo ""
echo "Ready to upload to WordPress!"
echo "Follow the instructions in INSTALLATION-GUIDE.md"
