const fs = require('fs');
const path = require('path');

// Regex to match emojis
const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

function walk(dir) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                if (!file.includes('node_modules') && !file.includes('.git')) {
                    results = results.concat(walk(file));
                }
            } else {
                if (/\.(jsx?|tsx?)$/.test(file)) {
                    results.push(file);
                }
            }
        });
    } catch (e) {
        // Ignore errors
    }
    return results;
}

const files = [...walk('src'), ...walk('technician-frontend/src')];
let foundCount = 0;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(emojiRegex);
        if (matches) {
            // Find unique emojis
            const uniqueEmojis = [...new Set(matches)].filter(e => e.trim() !== '' && e !== '©' && e !== '®');
            if (uniqueEmojis.length > 0) {
                console.log(`${file}: ${uniqueEmojis.join(' ')}`);
                foundCount++;
            }
        }
    } catch (e) { }
});

if (foundCount === 0) console.log("No emojis found.");
