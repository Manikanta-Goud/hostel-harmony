const fs = require('fs');
const glob = require('fs');

const files = [
    'x:/hostel-manag_from_GITHUB/hostel-harmony/src/pages/Expenses.tsx',
    'x:/hostel-manag_from_GITHUB/hostel-harmony/src/pages/StaffOverview.tsx',
    'x:/hostel-manag_from_GITHUB/hostel-harmony/src/pages/Requirements.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/format\(parseISO\(([^)]+)\),\s*('[^']+')\)/g, "((d) => (isValid(d) ? format(d, $2) : 'N/A'))(parseISO($1))");
    
    // Make sure isValid is imported from date-fns
    if (!content.includes('isValid') && content.includes('date-fns')) {
        content = content.replace(/import \{([^}]+)\}\s+from\s+'date-fns';/, (match, imports) => {
            if (!imports.includes('isValid')) {
                return `import { ${imports.trim()}, isValid } from 'date-fns';`;
            }
            return match;
        });
    }
    
    fs.writeFileSync(file, content);
});

console.log('Fixed parseISO in all files');
