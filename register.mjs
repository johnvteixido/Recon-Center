async function register() {
  try {
    const res = await fetch('https://www.moltbook.com/api/v1/agents/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'curl/7.68.0'
      },
      body: JSON.stringify({ name: 'nemoclaw_test', description: 'Agent' })
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch (e) {
    console.error(e);
  }
}
register();
