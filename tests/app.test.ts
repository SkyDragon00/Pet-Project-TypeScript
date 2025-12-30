import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildApp } from "../src/app.js";
import fs from "node:fs/promises";

vi.mock("../src/github.js", () => ({
  listOrgRepos: vi.fn()
}));

import { listOrgRepos } from "../src/github.js";

describe("API Routes", () => {
  let app: ReturnType<typeof buildApp>;
  let mockRepos: any[];

  beforeEach(async () => {
    app = buildApp();
    mockRepos = JSON.parse(
      await fs.readFile("fixtures/stackbuilders-repos.json", "utf8")
    );
    
    vi.mocked(listOrgRepos).mockResolvedValue(mockRepos);
  });

  describe("GET /org/:org/repos", () => {
    it("returns repositories with more than default 5 stars", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/org/stackbuilders/repos"
      });

      expect(response.statusCode).toBe(200);
      const repos = JSON.parse(response.body);
      
      expect(repos.length).toBe(6); 
      expect(repos.every((r: any) => r.stars > 5)).toBe(true);
      
      expect(repos[0]).toMatchObject({
        name: expect.any(String),
        stars: expect.any(Number),
        updatedAt: expect.any(String),
        url: expect.any(String)
      });
    });

    it("returns repositories with more than custom minimum stars", async () => {
      const response = await app.inject({
        method: "GET", 
        url: "/org/stackbuilders/repos?minStars=50"
      });

      expect(response.statusCode).toBe(200);
      const repos = JSON.parse(response.body);
      
      expect(repos.length).toBe(2);
      expect(repos.every((r: any) => r.stars > 50)).toBe(true);
    });

    it("calls listOrgRepos with correct organization", async () => {
      await app.inject({
        method: "GET",
        url: "/org/stackbuilders/repos"
      });

      expect(listOrgRepos).toHaveBeenCalledWith("stackbuilders");
    });
  });

  describe("GET /org/:org/latest", () => {
    it("returns last 5 updated repositories by default", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/org/stackbuilders/latest"
      });

      expect(response.statusCode).toBe(200);
      const repos = JSON.parse(response.body);
      
      expect(repos.length).toBe(5);
      
      for (let i = 1; i < repos.length; i++) {
        expect(new Date(repos[i-1].updatedAt) >= new Date(repos[i].updatedAt)).toBe(true);
      }
      
      expect(repos[0].name).toBe("tutorialspoint");
    });

    it("returns custom number of latest repositories", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/org/stackbuilders/latest?limit=3"
      });

      expect(response.statusCode).toBe(200);
      const repos = JSON.parse(response.body);
      
      expect(repos.length).toBe(3);
      
      for (let i = 1; i < repos.length; i++) {
        expect(new Date(repos[i-1].updatedAt) >= new Date(repos[i].updatedAt)).toBe(true);
      }
    });
  });

  describe("GET /", () => {
    it("returns API documentation", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/"
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.body);
      
      expect(result).toMatchObject({
        message: expect.any(String),
        endpoints: expect.any(Object),
        example: expect.any(Object)
      });
      
      expect(result.message).toBe("GitHub StackBuilders API");
    });
  });

  describe("GET /health", () => {
    it("returns health status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health"
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.body);
      
      expect(result).toMatchObject({
        status: "ok",
        timestamp: expect.any(String)
      });
    });
  });

  describe("GET /org/:org/star-sum", () => {
    it("returns sum of all repository stars", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/org/stackbuilders/star-sum"
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.body);
      
      expect(result).toMatchObject({
        org: "stackbuilders",
        totalStars: expect.any(Number)
      });
      
      expect(result.totalStars).toBe(315);
    });

    it("returns correct organization name in response", async () => {
      const response = await app.inject({
        method: "GET", 
        url: "/org/someorg/star-sum"
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.body);
      expect(result.org).toBe("someorg");
    });
  });

  // NEW TESTS for the added features
  describe("GET /org/:org/top-stars", () => {
    it("returns top 5 repositories with most stars by default", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/org/stackbuilders/top-stars"
      });

      expect(response.statusCode).toBe(200);
      const repos = JSON.parse(response.body);
      
      expect(repos.length).toBe(5);
      
      // Check that repos are sorted by stars in descending order
      for (let i = 1; i < repos.length; i++) {
        expect(repos[i-1].stars >= repos[i].stars).toBe(true);
      }
      
      expect(repos[0].name).toBe("tutorialspoint"); // Highest stars (123)
      expect(repos[1].name).toBe("hapistrano"); // Second highest (89)
    });

    it("returns custom number of top repositories by stars", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/org/stackbuilders/top-stars?limit=3"
      });

      expect(response.statusCode).toBe(200);
      const repos = JSON.parse(response.body);
      
      expect(repos.length).toBe(3);
      expect(repos[0].name).toBe("tutorialspoint");
      expect(repos[1].name).toBe("hapistrano");
      expect(repos[2].name).toBe("stache");
    });
  });

  describe("GET /org/:org/alphabetical", () => {
    it("returns repositories alphabetically excluding those starting with h", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/org/stackbuilders/alphabetical"
      });

      expect(response.statusCode).toBe(200);
      const repos = JSON.parse(response.body);
      
      // Should exclude "hapistrano" (starts with 'h')
      expect(repos.length).toBe(7);
      expect(repos.some((r: any) => r.name === "hapistrano")).toBe(false);
      
      // Check alphabetical order
      const names = repos.map((r: any) => r.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
      
      // First should be "cassava-conduit" alphabetically
      expect(repos[0].name).toBe("cassava-conduit");
    });

    it("filters out all repositories starting with h (case insensitive)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/org/stackbuilders/alphabetical"
      });

      expect(response.statusCode).toBe(200);
      const repos = JSON.parse(response.body);
      
      repos.forEach((repo: any) => {
        expect(repo.name.toLowerCase().startsWith('h')).toBe(false);
      });
    });
  });
});