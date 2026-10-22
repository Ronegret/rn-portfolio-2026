import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const serverDir = resolve("dist", "server");
const workerPath = resolve(serverDir, "index.js");

const aliases = {
  "/Zodi": "/zodi-bto/index.html",
  "/zodi": "/zodi/index.html",
  "/zodi-bto": "/zodi-bto/index.html",
  "/dedicalo-play": "/dedicalo-play/index.html",
  "/pdf": "/pdf-rodd/index.html",
  "/PDF": "/PDF/index.html",
  "/pdf-rodd": "/pdf-rodd/index.html",
  "/pdf-rodd/app": "/PDF/index.html",
  "/aquae": "/aquae/index.html",
  "/Aquae": "/aquae/index.html",
  "/ccse": "/ccse/index.html",
  "/CCSE": "/ccse/index.html",
  "/cv": "/cv/index.html",
  "/dedicalo": "/dedicalo/index.html",
  "/invitoo": "/invitoo/index.html",
  "/Invitoo": "/invitoo/index.html",
  "/paratumundo": "/paratumundo/index.html",
  "/ParaTuMundo": "/paratumundo/index.html",
  "/te-atiendo": "/te-atiendo/index.html",
  "/teatiendo": "/te-atiendo/index.html",
  "/TeAtiendo": "/te-atiendo/index.html",
  "/tomapoly": "/tomapoly/index.html",
  "/travel-of-vapers": "/travel-of-vapers/index.html",
  "/TravelOfVapers": "/travel-of-vapers/index.html",
  "/just-enjoy": "/just-enjoy/index.html",
  "/iberdata": "/iberdata/index.html",
};

const worker = `const aliases = ${JSON.stringify(aliases, null, 2)};

function withSlashVariants(pathname) {
  const clean = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return aliases[clean] || pathname;
}

function assetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const mappedPath = withSlashVariants(url.pathname);
    const asset = await env.ASSETS.fetch(assetRequest(request, mappedPath));

    if (asset.status !== 404) {
      const response = new Response(asset.body, asset);
      if ((mappedPath.startsWith("/assets/") || mappedPath.startsWith("/_astro/"))) {
        response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
      }
      return response;
    }

    if (!url.pathname.includes(".")) {
      return env.ASSETS.fetch(assetRequest(request, "/index.html"));
    }

    return asset;
  }
};
`;

await mkdir(serverDir, { recursive: true });
await writeFile(workerPath, worker);
console.log(workerPath);
