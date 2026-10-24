import fs from "node:fs";
import path from "node:path";
const licenses = {
  three: "LICENSE",
  cannon: "LICENSE",
  "dat.gui": "LICENSE",
  howler: "LICENSE.md",
};
fs.mkdirSync("public/licenses", { recursive: true });
for (const [name, file] of Object.entries(licenses))
  fs.copyFileSync(path.join("node_modules", name, file), `public/licenses/${name}.txt`);
const gsap = JSON.parse(fs.readFileSync("node_modules/gsap/package.json", "utf8"));
fs.writeFileSync(
  "public/licenses/gsap.txt",
  `GSAP ${gsap.version}\n${gsap.license}\nhttps://gsap.com/standard-license\n`,
);
for (const file of ["LICENSE.md", "SOURCE.md"]) fs.copyFileSync(file, "public/" + file);
