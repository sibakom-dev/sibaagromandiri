const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src', '_includes', 'layout.njk');
let content = fs.readFileSync(layoutPath, 'utf8');

// Replace URLs with root slash
content = content.replace(/https:\/\/sibaagromandiri\.com/g, '');

// Clean up some WP-specific lines that we found
content = content.replace(/<link rel="alternate" type="application\/rss\+xml" title="Siba Agro Mandiri » Feed" href="\/feed\/">\n/g, '');
content = content.replace(/<link rel="alternate" type="application\/rss\+xml" title="Siba Agro Mandiri » Comments Feed" href="\/comments\/feed\/">\n/g, '');
content = content.replace(/<link rel="alternate" title="oEmbed \(JSON\)" type="application\/json\+oembed" href="\/assets\/wp\/0b95e422_embed%3A%2F%2F%2F">\n/g, '');
content = content.replace(/<link rel="alternate" title="oEmbed \(XML\)" type="text\/xml\+oembed" href="\/assets\/wp\/0b95e422_embed%3A%2F%2F%2F&amp;format=xml">\n/g, '');
content = content.replace(/<link rel="https:\/\/api\.w\.org\/" href="\/assets\/wp\/92691e29_wp-json"><link rel="alternate" title="JSON" type="application\/json" href="\/assets\/wp\/92691e29_wp-jsonwp\/v2\/pages\/95"><link rel="EditURI" type="application\/rsd\+xml" title="RSD" href="\/xmlrpc\.php\?rsd">\n/g, '');
content = content.replace(/<link rel="canonical" href="\/">\n/g, '');
content = content.replace(/<link rel="shortlink" href="\/">\n/g, '');

fs.writeFileSync(layoutPath, content, 'utf8');
console.log('Cleaned layout.njk');
