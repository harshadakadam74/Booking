
const url = 'http://localhost:4545/api/v1/auth/login';
const body = JSON.stringify({ email: 'test-user-unique@example.com', password: 'pass1234' });

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    console.log('status', res.status);
    console.log(await res.text());
  } catch (error) {
    console.error('ERR', error.message);
    process.exit(1);
  }
})();