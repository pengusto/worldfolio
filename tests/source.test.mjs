import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
test("original geometry, sounds and font bytes are preserved", () => {
  const recovered = JSON.parse(fs.readFileSync("RECOVERY-MANIFEST.json", "utf8"));
  const entries = recovered.filter((e) => /^(models|sounds|fonts)\//.test(e.path));
  assert.ok(entries.length > 100);
  for (const e of entries) {
    const actual = fs.readFileSync("public/" + e.path);
    assert.equal(crypto.createHash("sha256").update(actual).digest("hex"), e.sha256, e.path);
  }
});
test("profile is local, validated and keeps its public project links", () => {
  const profile = JSON.parse(fs.readFileSync("profile.json", "utf8"));
  assert.equal(profile.username, "pengusto");
  assert.equal(profile.pinnedRepos.length, 8);
  for (const repo of profile.pinnedRepos)
    assert.match(repo.url, /^https:\/\/github\.com\/pengusto\/[\w.-]+$/);
  assert.ok(fs.existsSync("public/" + profile.avatarUrl));
  const source = fs.readFileSync("src/Runtime.js", "utf8");
  assert.doesNotMatch(source, /\/api\/portfolio-template|\bfetch\s*\(|HTMLImageElement\.prototype/);
  assert.match(source, /getHelper\(\)/);
});
test("built output contains creator notices and no credentials or local machine paths", () => {
  assert.ok(fs.existsSync("dist/LICENSE.md"));
  assert.ok(fs.existsSync("dist/SOURCE.md"));
  const html = fs.readFileSync("dist/index.html", "utf8");
  assert.match(html, /Template direction by Bruno SIMON/);
  assert.match(html, /github\.com\/brunosimon\/folio-2019/);
  for (const name of fs.readdirSync("dist/assets").filter((n) => /\.(?:js|css|map)$/.test(n))) {
    const source = fs.readFileSync("dist/assets/" + name, "utf8");
    assert.doesNotMatch(
      source,
      /eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_|\/Users\//,
      name,
    );
  }
  for (const name of ["three", "gsap", "cannon", "dat.gui", "howler"])
    assert.ok(fs.existsSync("dist/licenses/" + name + ".txt"));
});
