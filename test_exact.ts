import { buildApp } from "./src/app";
async function t() {
  const app = await buildApp();
  await app.ready();
  
  // Binary search for the limit
  for (const len of [100, 101, 102, 103, 104, 105, 106, 107, 108]) {
    const slug = "a".repeat(len);
    const res = await app.inject({ method: "GET", url: "/api/v2/detail/" + slug });
    const ok = res.statusCode === 200 || (res.statusCode === 500 && res.body.includes("Failed"));
    console.log(`${len} => ${ok ? "OK" : "ROUTE NOT FOUND (404)"}`);
  }
  await app.close();
}
t().catch(console.error);
