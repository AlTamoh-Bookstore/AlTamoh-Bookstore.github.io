import { createWriteStream } from "node:fs";
import { SitemapStream } from "sitemap";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const distDir = "dist";
const baseUrl = "https://al-tomoh.com";

// Recursively scan files in dist
function getPaths(dir) {
  let paths = [];
  for (const file of readdirSync(dir)) {
    const fullPath = join(dir, file);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      paths = paths.concat(getPaths(fullPath));
    } else if (stats.isFile() && file.endsWith(".html")) {
      const url = "/" + relative(distDir, fullPath).replace(/index\.html$/, "").replace(/\\/g, "/");
      paths.push(url === "/" ? "/" : url);
    }
  }
  return paths;
}

const links = getPaths(distDir).map((url) => ({ url }));

const stream = new SitemapStream({ hostname: baseUrl });
const writeStream = createWriteStream(join(distDir, "sitemap.xml"));
stream.pipe(writeStream);

links.forEach((link) => stream.write(link));
stream.end();

writeStream.on("finish", () => {
  console.log("✅ Sitemap generated at dist/sitemap.xml");
});
