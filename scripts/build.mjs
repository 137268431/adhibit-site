import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const srcDir = join(root, "src");
const assetsDir = join(root, "assets");
const distDir = join(root, "dist");
const docsDir = join(root, "docs");

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function escapeClosingScriptTag(source) {
  return source.replaceAll("</script>", "<\\/script>");
}

async function dataUri(assetName) {
  const filePath = join(assetsDir, assetName);
  const buffer = await readFile(filePath);
  const mime = mimeTypes[extname(assetName).toLowerCase()];
  if (!mime) {
    throw new Error(`Unsupported asset type: ${assetName}`);
  }
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function build() {
  const [htmlSource, cssSource, jsSource] = await Promise.all([
    readFile(join(srcDir, "index.html"), "utf8"),
    readFile(join(srcDir, "styles.css"), "utf8"),
    readFile(join(srcDir, "main.js"), "utf8")
  ]);

  let html = htmlSource
    .replace("<!-- styles -->", `<style>${cssSource}</style>`)
    .replace("<!-- scripts -->", `<script>${escapeClosingScriptTag(jsSource)}</script>`);

  const assetMatches = [...html.matchAll(/src="assets\/([^"]+)"/g)];
  for (const [, assetName] of assetMatches) {
    html = html.replaceAll(`src="assets/${assetName}"`, `src="${await dataUri(assetName)}"`);
  }

  const worker = `const html = ${JSON.stringify(html)};\n\nexport default {\n  async fetch(request) {\n    const url = new URL(request.url);\n    if (url.pathname === "/healthz") {\n      return new Response("ok", { headers: { "content-type": "text/plain; charset=utf-8" } });\n    }\n    if (url.pathname !== "/" && url.pathname !== "/support" && url.pathname !== "/privacy") {\n      return Response.redirect(url.origin + "/support", 302);\n    }\n    return new Response(html, {\n      headers: {\n        "content-type": "text/html; charset=utf-8",\n        "cache-control": "public, max-age=300",\n        "x-robots-tag": "index, follow"\n      }\n    });\n  }\n};\n`;

  await mkdir(distDir, { recursive: true });
  await mkdir(docsDir, { recursive: true });
  await writeFile(join(distDir, "index.html"), html);
  await writeFile(join(distDir, "worker.js"), worker);
  await writeFile(join(docsDir, "index.html"), html);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
