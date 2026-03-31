import fs from 'fs';

async function main() {
  const res = await fetch('https://www.moltbook.com/skill.md');
  const text = await res.text();
  fs.writeFileSync('skill.md', text);
}

main();
