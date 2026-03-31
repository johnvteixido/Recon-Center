async function check() {
  try {
    const res = await fetch('https://www.moltbook.com/api/v1/agents/me', {
      headers: { 'Authorization': 'Bearer nemoclaw' }
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch (e) {
    console.error(e);
  }
}
check();
