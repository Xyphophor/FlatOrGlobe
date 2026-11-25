import test from "node:test";
import assert from "node:assert/strict";
import { sentences, paragraphs } from "./paragraphs.js";

test("sentences: initials, abbreviations and decimals do not split", () => {
  assert.deepEqual(sentences("J. Meeus wrote it. The air was 2.5 K colder. St. Vincent Gulf is wide."), ["J. Meeus wrote it.", "The air was 2.5 K colder.", "St. Vincent Gulf is wide."]);
  assert.deepEqual(sentences("See Stedman et al. Optics 279 (2007). Then Fig. 3 shows it."), ["See Stedman et al. Optics 279 (2007).", "Then Fig. 3 shows it."]);
});
test("a short text stays one paragraph; an explicit blank line is kept", () => {
  assert.deepEqual(paragraphs("One. Two. Three."), ["One. Two. Three."]);
  assert.deepEqual(paragraphs("First paragraph.\n\nSecond one."), ["First paragraph.", "Second one."]);
});
test("a long text is cut between sentences into paragraphs of a few sentences, the last one not tiny", () => {
  const s = "This is a sentence of a reasonable length that carries some information about the thing. ";
  const text = s.repeat(11).trim(), ps = paragraphs(text);
  assert.ok(ps.length >= 3 && ps.length <= 5, String(ps.length));
  assert.equal(ps.join(" "), text);
  for (const p of ps) { assert.ok(p.endsWith("."), p); assert.ok(p.length >= 90); }
});
