import https from 'https';
https.get('https://www.moltbook.com/skill.md', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(data); });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
