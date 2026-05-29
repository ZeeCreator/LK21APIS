import { buildApp } from "./src/app";
async function t() {
  const app = await buildApp();
  await app.ready();
  const slug = "omae-gotoki-ga-maou-ni-kateru-to-omouna-to-yuusha-party-wo-tsuihou-sareta-node-outo-de-kimama-ni-kurashitai";
  const res = await app.inject({ method: "GET", url: "/api/v2/detail/" + slug });
  console.log("STATUS:", res.statusCode);
  const body = JSON.parse(res.body);
  if (res.statusCode === 200) {
    console.log("SUCCESS! Title:", body.data?.title);
  } else if (res.statusCode === 500) {
    console.log("Controller reached! Scraper error:", body.message?.substring(0, 120));
  } else {
    console.log("UNEXPECTED:", res.body?.substring(0, 200));
  }
  await app.close();
}
t().catch(console.error);
