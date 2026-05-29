import { buildApp } from "./src/app";
async function t() {
  const app = await buildApp();
  await app.ready();
  
  // Test with progressively longer slugs to find the limit
  const tests = [
    "a".repeat(50),
    "a".repeat(60),
    "a".repeat(70),
    "a".repeat(80),
    "a".repeat(90),
    "a".repeat(100),
    "a".repeat(107),
    "a".repeat(108),
  ];
  
  for (const slug of tests) {
    const res = await app.inject({ method: "GET", url: "/api/v2/detail/" + slug });
    const ok = res.statusCode === 200 || (res.statusCode === 500 && res.body.includes("Failed to retrieve"));
    console.log(`${slug.length} chars => ${res.statusCode} ${ok ? "OK (controller reached)" : "ROUTE NOT FOUND"}`);
  }
  
  // Also test the exact long slug
  const longSlug = "omae-gotoki-ga-maou-ni-kateru-to-omouna-to-yuusha-party-wo-tsuihou-sareta-node-outo-de-kimama-ni-kurashitai";
  const res = await app.inject({ method: "GET", url: "/api/v2/detail/" + longSlug });
  console.log(`"${longSlug.substring(0,20)}..." (${longSlug.length} chars) => ${res.statusCode}`);
  if (res.statusCode === 404) {
    console.log("  BODY:", JSON.stringify(JSON.parse(res.body), null, 2));
  }
  
  await app.close();
}
t().catch(console.error);
