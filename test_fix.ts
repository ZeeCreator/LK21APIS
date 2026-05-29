import { buildApp } from "./src/app";
async function t() {
  const app = await buildApp();
  await app.ready();
  const longSlug = "omae-gotoki-ga-maou-ni-kateru-to-omouna-to-yuusha-party-wo-tsuihou-sareta-node-outo-de-kimama-ni-kurashitai";
  const res = await app.inject({ method: "GET", url: "/api/v2/detail/" + longSlug });
  console.log("STATUS:", res.statusCode);
  if (res.statusCode === 500) {
    const body = JSON.parse(res.body);
    console.log("Controller reached! Message:", body.message?.substring(0, 120));
  } else {
    console.log("Body:", res.body?.substring(0, 120));
  }
  await app.close();
}
t().catch(console.error);
