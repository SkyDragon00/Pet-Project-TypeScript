import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import { 
  normalize, 
  filterByStars, 
  sortByUpdatedDesc, 
  sortByStarsDesc, 
  sortAlphabetically, 
  filterOutReposStartingWithH, 
  take, 
  sumStars 
} from "../src/core/transforms.js";

const load = async () => JSON.parse(await fs.readFile("fixtures/stackbuilders-repos.json", "utf8"));

describe("pure transforms", () => {
  it("filters repos with > 5 stars", async () => {
    const raw = await load();
    const repos = raw.map(normalize);
    const result = filterByStars(5)(repos);
    expect(result.every(r => r.stars > 5)).toBe(true);
  });

  it("returns last 5 updated", async () => {
    const raw = await load();
    const repos = raw.map(normalize);
    const latest5 = take(5)(sortByUpdatedDesc(repos));
    expect(latest5.length).toBeLessThanOrEqual(5);
    // monotonic by updatedAt
    for (let i = 1; i < latest5.length; i++) {
      expect(latest5[i-1].updatedAt >= latest5[i].updatedAt).toBe(true);
    }
  });

  it("sums stars", async () => {
    const raw = await load();
    const repos = raw.map(normalize);
    const total = sumStars(repos);
    expect(Number.isInteger(total)).toBe(true);
  });

  it("sorts repos by stars in descending order", async () => {
    const raw = await load();
    const repos = raw.map(normalize);
    const sorted = sortByStarsDesc(repos);
    
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i-1].stars >= sorted[i].stars).toBe(true);
    }
    
    expect(sorted[0].name).toBe("tutorialspoint");
  });

  it("sorts repos alphabetically", async () => {
    const raw = await load();
    const repos = raw.map(normalize);
    const sorted = sortAlphabetically(repos);
    
    const names = sorted.map(r => r.name);
    const expectedNames = [...names].sort();
    expect(names).toEqual(expectedNames);
    
    expect(sorted[0].name).toBe("cassava-conduit");
  });

  it("filters out repos starting with h", async () => {
    const raw = await load();
    const repos = raw.map(normalize);
    const filtered = filterOutReposStartingWithH(repos);
    
    expect(filtered.length).toBe(7);
    expect(filtered.some(r => r.name === "hapistrano")).toBe(false);
    
    filtered.forEach(repo => {
      expect(repo.name.toLowerCase().startsWith('h')).toBe(false);
    });
  });

  it("gets top 5 repos by stars", async () => {
    const raw = await load();
    const repos = raw.map(normalize);
    const top5 = take(5)(sortByStarsDesc(repos));
    
    expect(top5.length).toBe(5);
    expect(top5[0].name).toBe("tutorialspoint");
    expect(top5[1].name).toBe("hapistrano");
    expect(top5[2].name).toBe("stache");
  });

  it("combines alphabetical sorting with h-filter", async () => {
    const raw = await load();
    const repos = raw.map(normalize);
    const result = sortAlphabetically(filterOutReposStartingWithH(repos));
    
    expect(result.length).toBe(7);
    expect(result.some(r => r.name === "hapistrano")).toBe(false);
    
    // Should be alphabetically sorted
    const names = result.map(r => r.name);
    const expectedNames = [...names].sort();
    expect(names).toEqual(expectedNames);
  });
});