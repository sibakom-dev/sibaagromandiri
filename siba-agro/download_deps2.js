const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const baseDir = path.join(__dirname, 'src');
const assetsDir = path.join(baseDir, 'assets', 'wp');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) {
            return resolve();
        }
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                file.close();
                fs.unlink(dest, () => {});
                console.error('Failed to download ' + url + ': ' + response.statusCode);
                resolve();
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            console.error('Error downloading ' + url + ': ' + err.message);
            resolve();
        });
    });
}

async function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Match URLs with or without escaped slashes
    const regex = /https:(?:\\\/\\\/|\/\/)sibaagromandiri\.com(?:\\\/|\/)wp-[a-zA-Z0-9\-\.\/\_\?\=\&\\\\]+/g;
    let match;
    const urlsToDownload = new Set();
    
    while ((match = regex.exec(content)) !== null) {
        urlsToDownload.add(match[0]);
    }
    
    if (urlsToDownload.size === 0) return;
    
    console.log('Found ' + urlsToDownload.size + ' unique URLs in ' + filePath);
    
    for (const url of urlsToDownload) {
        const unescapedUrl = url.replace(/\\\//g, '/');
        const cleanUrl = unescapedUrl.split('?')[0];
        const hash = crypto.createHash('md5').update(unescapedUrl).digest('hex');
        const filename = hash.substring(0, 8) + '_' + path.basename(cleanUrl);
        const destPath = path.join(assetsDir, filename);
        
        console.log('Downloading ' + unescapedUrl + ' -> ' + filename);
        await downloadFile(unescapedUrl, destPath);
        
        // Replace in content
        // Handle escaped and unescaped versions
        content = content.split(url).join('/assets/wp/' + filename);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
}

async function main() {
    await processFile(path.join(baseDir, '_includes', 'layout.njk'));
    
    const assetsFolder = path.join(baseDir, 'assets');
    const files = fs.readdirSync(assetsFolder);
    for (const file of files) {
        if (file.endsWith('.css')) {
            await processFile(path.join(assetsFolder, file));
        }
    }
    console.log('Done!');
}

main();
