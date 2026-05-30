const axios = require('axios');

const domains = [
  'https://otakudesu.blog',
  'https://otakudesu.io',
  'https://otakudesu.net',
  'https://otakudesu.boats',
  'https://otakudesu.cc',
];

async function main() {
  for (const base of domains) {
    try {
      const start = Date.now();
      const r = await axios.get(base + '/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' },
        timeout: 10000,
        maxRedirects: 5,
      });
      const ms = Date.now() - start;
      const hasDetpost = r.data.includes('detpost');
      const hasJdlflm = r.data.includes('jdlflm');
      console.log(`${base}: ${r.status} (${ms}ms) detpost=${hasDetpost} jdlflm=${hasJdlflm} size=${r.data.length}`);
    } catch (e) {
      console.log(`${base}: FAIL ${e.status || e.code || e.message}`);
    }
  }
}
main();
