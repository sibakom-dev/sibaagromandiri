const fs = require('fs');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync('../Siba Agro Mandiri – Siba Agro Mandiri.html', 'utf-8');
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

// 1. Fix asset paths
// They currently look like: href="./Siba Agro Mandiri – Siba Agro Mandiri_files/..."
// or src="./Siba Agro Mandiri – Siba Agro Mandiri_files/..."
function fixAssetPaths(node) {
    const attrNames = ['href', 'src', 'data-src', 'srcset'];
    node.querySelectorAll('*').forEach(el => {
        attrNames.forEach(attr => {
            if (el.hasAttribute(attr)) {
                let val = el.getAttribute(attr);
                if (val.includes('Siba Agro Mandiri – Siba Agro Mandiri_files')) {
                    val = val.replace('./Siba Agro Mandiri – Siba Agro Mandiri_files/', '/assets/');
                    val = val.replace('Siba Agro Mandiri – Siba Agro Mandiri_files/', '/assets/');
                    el.setAttribute(attr, val);
                }
            }
        });
    });
}
fixAssetPaths(document);

// Update nav links
document.querySelectorAll('a').forEach(a => {
    let href = a.getAttribute('href') || '';
    if (href.includes('#aboutus')) a.setAttribute('href', '/about/');
    else if (href.includes('#produk')) a.setAttribute('href', '/product/');
    else if (href.includes('#media')) a.setAttribute('href', '/gallery/');
    else if (href.includes('#kontak')) a.setAttribute('href', '/contact/');
    else if (href === 'https://sibaagromandiri.com/' || href === '/') a.setAttribute('href', '/');
});

// Remove injected extension scripts/css (like newsvd_dialog, vimeo_tool, etc)
document.querySelectorAll('#vimeo_tool, #vtPopupMenu').forEach(el => el.remove());

// Find sections
const aboutSection = document.querySelector('#aboutus');
const productSection = document.querySelector('#produk');
const mediaSection = document.querySelector('#media');
const contactSection = document.querySelector('#kontak');

// The main elementor div wrapping everything
const mainContent = document.querySelector('[data-elementor-type="wp-page"]');
let indexContentHtml = '';

if (mainContent) {
    // We want the things before #aboutus to be in index.md
    let current = mainContent.firstElementChild;
    while (current && current !== aboutSection && !current.querySelector('#aboutus')) {
        indexContentHtml += current.outerHTML + '\n';
        current = current.nextElementSibling;
    }
} else {
    console.log("Could not find elementor main container!");
}

function writePage(filename, title, content) {
    const frontmatter = `---
layout: layout.njk
title: ${title}
---
`;
    fs.writeFileSync(filename, frontmatter + content);
}

writePage('src/index.md', 'Home', indexContentHtml);
writePage('src/about.md', 'About Us', aboutSection ? aboutSection.outerHTML : '');
writePage('src/product.md', 'Our Product', productSection ? productSection.outerHTML : '');
writePage('src/gallery.md', 'Gallery', mediaSection ? mediaSection.outerHTML : '');
writePage('src/contact.md', 'Contact Us', contactSection ? contactSection.outerHTML : '');

// Now prepare the layout
// Remove the content from body
if (mainContent) {
    mainContent.innerHTML = '{{ content | safe }}';
}

const headHtml = document.head.innerHTML;
// Reconstruct html skeleton
const layoutHtml = `<!DOCTYPE html>
<html lang="en-US">
<head>
${headHtml}
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body class="${document.body.className}">
${document.body.innerHTML}
</body>
</html>
`;

fs.writeFileSync('src/_includes/layout.njk', layoutHtml);

console.log("Extraction complete.");
