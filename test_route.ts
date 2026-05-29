import { buildApp } from "./src/app";
async function t() {
  const app = await buildApp();
  await app.ready();
  const res = await app.inject({
    method: "GET",
    url: "/api/v2/detail/omae-gotoki-ga-maou-ni-kateru-to-omouna-to-yuusha-party-wo-tsuihou-sareta-node-outo-de-kimama-ni-kurashitai"
  });
  console.log("STATUS:", res.statusCode);
  console.log("BODY:", JSON.stringify(JSON.parse(res.body), null, 2).substring(0, 300));
  await app.close();
}
t();
