import assert from "node:assert/strict";
import test from "node:test";
import {
  bestAchievableScore,
  chapterBriefs,
  masteryGuides,
  missions,
  PASS_SCORE,
} from "../src/game-model.ts";

test("the complete 13-mission curriculum is present", () => {
  assert.equal(missions.length, 13);
  assert.deepEqual(
    missions.map((mission) => mission.chapter),
    [2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  );
});

test("every mastery gate is achievable", () => {
  for (const mission of missions) {
    assert.ok(
      bestAchievableScore(mission) >= PASS_SCORE,
      `${mission.id} cannot reach the pass score`,
    );
  }
});

test("every mission has a useful two-paragraph chapter briefing", () => {
  for (const mission of missions) {
    const brief = chapterBriefs[mission.id];
    assert.equal(brief.length, 2, `${mission.id} should have two chapter-summary paragraphs`);
    for (const paragraph of brief) {
      assert.ok(paragraph.length >= 300, `${mission.id} chapter briefing is too sparse`);
    }
  }
});

test("every mission has a substantive, cited mastery debrief", () => {
  for (const mission of missions) {
    const guide = masteryGuides[mission.id];
    assert.equal(guide.paragraphs.length, 2, `${mission.id} should have two debrief paragraphs`);
    for (const paragraph of guide.paragraphs) {
      assert.ok(paragraph.length >= 300, `${mission.id} debrief paragraph is too brief`);
    }
    assert.ok(guide.reading.length >= 2, `${mission.id} should cite at least two sections`);
    assert.ok(
      guide.reading.every(({ url }) => url.startsWith("https://otexts.com/fpppy/")),
      `${mission.id} contains a non-FPPPy reference`,
    );
  }
});
