import { createWriteStream } from "node:fs";
import { SitemapStream } from "sitemap";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const distDir = "dist";
const baseUrl = "https://al-tomoh.com";

// Recursively scan static html files
function getHtmlPaths(dir) {
  let paths = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      paths = paths.concat(getHtmlPaths(full));
    } else if (stats.isFile() && name.endsWith(".html")) {
      let url = "/" + relative(distDir, full).replace(/index\.html$/, "").replace(/\\/g, "/");
      if (url === "") url = "/";
      paths.push(url);
    }
  }
  return paths;
}

const spaRoutes = [
  "/", 
  "/books",
  "/authors",
  "/about",
  "/contact"
];

const htmlPaths = getHtmlPaths(distDir);

// Merge and dedupe
const allPaths = Array.from(new Set([...htmlPaths, ...spaRoutes]));

const stream = new SitemapStream({ hostname: baseUrl });
const writeStream = createWriteStream(join(distDir, "sitemap.xml"));
stream.pipe(writeStream);

allPaths.forEach((url) => {
  stream.write({ url });
});
stream.end();

writeStream.on("finish", () => {
  console.log("✅ Sitemap generated with paths:", allPaths);
});
