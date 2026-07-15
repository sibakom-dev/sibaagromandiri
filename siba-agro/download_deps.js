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
            return resolve(); // Already downloaded
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
                resolve(); // resolve anyway to not break
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
    const regex = /https:\/\/sibaagromandiri\.com\/wp-[a-zA-Z0-9\-\.\/\_\?\=\&]+/g;
    let match;
    const urlsToDownload = new Set();
    
    while ((match = regex.exec(content)) !== null) {
        urlsToDownload.add(match[0]);
    }
    
    console.log('Found ' + urlsToDownload.size + ' unique URLs in ' + filePath);
    
    for (const url of urlsToDownload) {
        // Strip query params for filename
        const cleanUrl = url.split('?')[0];
        const ext = path.extname(cleanUrl) || '.bin';
        const hash = crypto.createHash('md5').update(url).digest('hex');
        const filename = hash.substring(0, 8) + '_' + path.basename(cleanUrl);
        const destPath = path.join(assetsDir, filename);
        
        console.log('Downloading ' + url + ' -> ' + filename);
        await downloadFile(url, destPath);
        
        // Replace in content
        // We replace globally in the content
        content = content.split(url).join('/assets/wp/' + filename);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
}

async function main() {
    await processFile(path.join(baseDir, '_includes', 'layout.njk'));
    await processFile(path.join(baseDir, 'assets', 'poppins.css'));
    console.log('Done!');
}

main();
