import { buildApp } from "./src/app";
async function t() {
  const app = await buildApp();
  await app.ready();
  
  const urls = [
    "/api/v2/detail/one-piece",
    "/api/v2/detail/test-slug",
    "/api/v2/detail/omae-gotoki-ga-maou-ni-kateru-to-omouna-to-yuusha-party-wo-tsuihou-sareta-node-outo-de-kimama-ni-kurashitai",
    "/api/v2/detail/short"
  ];
  
  for (const url of urls) {
    const res = await app.inject({ method: "GET", url });
    console.log(url, "=>", res.statusCode, res.statusCode === 200 ? "OK" : res.body.substring(0, 80));
  }
  
  // Also test the route directly without prefix
  const res2 = await app.inject({ method: "GET", url: "/detail/test-slug" });
  console.log("direct /detail/test-slug =>", res2.statusCode);
  
  await app.close();
}
t().catch(console.error);
