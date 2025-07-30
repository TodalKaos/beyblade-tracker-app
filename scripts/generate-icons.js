const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [
    { size: 16, name: 'icon-16x16.png' },
    { size: 32, name: 'icon-32x32.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons(sourcePath, outputDir) {
    try {
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log(`Processing source image: ${sourcePath}`);

        // Generate each icon size
        for (const { size, name } of sizes) {
            const outputPath = path.join(outputDir, name);

            await sharp(sourcePath)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
                })
                .png()
                .toFile(outputPath);

            console.log(`✓ Generated ${name} (${size}x${size})`);
        }

        console.log('\n🎉 All icons generated successfully!');
        console.log('Icons created in:', outputDir);

    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

// Get command line arguments
const sourcePath = process.argv[2];
const outputDir = process.argv[3] || './public/icons';

if (!sourcePath) {
    console.error('Usage: node generate-icons.js <source-image-path> [output-directory]');
    console.error('Example: node generate-icons.js ./my-logo.png ./public/icons');
    process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
    console.error(`Source image not found: ${sourcePath}`);
    process.exit(1);
}

generateIcons(sourcePath, outputDir);
