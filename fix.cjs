const fs = require('fs');
const file = 'x:/hostel-manag_from_GITHUB/hostel-harmony/src/pages/Expenses.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{([^}]+)\?\s*format\(parseISO\(\1\),\s*('[^']+')\)\s*:\s*'N\/A'\}/g;

content = content.replace(regex, (match, p1, p2) => {
    return '{(() => { try { const d = parseISO(' + p1 + '); return isValid(d) ? format(d, ' + p2 + ') : "N/A"; } catch { return "N/A"; } })()}';
});

fs.writeFileSync(file, content);
console.log('Done replacing format');
