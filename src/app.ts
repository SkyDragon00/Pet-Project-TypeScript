import Fastify from "fastify";
import { listOrgRepos } from "./github.js";
import { 
  normalize, 
  filterByStars, 
  sortByUpdatedDesc, 
  sortByStarsDesc, 
  sortAlphabetically, 
  filterOutReposStartingWithH, 
  take, 
  sumStars 
} from "./core/transforms.js";

export function buildApp() {
  const app = Fastify();

  app.get("/", async (req, reply) => {
    return {
      message: "GitHub StackBuilders API",
      endpoints: {
        "GET /org/:org/repos?minStars=5": "Get repositories with more than minStars stars (default: 5)",
        "GET /org/:org/latest?limit=5": "Get latest updated repositories (default: 5)",
        "GET /org/:org/star-sum": "Get sum of all repository stars",
        "GET /org/:org/top-stars?limit=5": "Get top repositories by stars (default: 5)",
        "GET /org/:org/alphabetical": "Get all repositories alphabetically, excluding those starting with 'h'"
      },
      example: {
        repos: "/org/stackbuilders/repos",
        latest: "/org/stackbuilders/latest",
        starSum: "/org/stackbuilders/star-sum",
        topStars: "/org/stackbuilders/top-stars",
        alphabetical: "/org/stackbuilders/alphabetical"
      }
    };
  });

  app.get("/health", async (req, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  app.get("/org/:org/repos", async (req) => {
    const org = (req.params as any).org;
    const minStars = Number((req.query as any).minStars ?? 5);
    const raw = await listOrgRepos(org);
    const repos = raw.map(normalize);
    return filterByStars(minStars)(repos);
  });

  app.get("/org/:org/latest", async (req) => {
    const org = (req.params as any).org;
    const limit = Number((req.query as any).limit ?? 5);
    const raw = await listOrgRepos(org);
    const repos = raw.map(normalize);
    return take(limit)(sortByUpdatedDesc(repos));
  });

  app.get("/org/:org/star-sum", async (req) => {
    const org = (req.params as any).org;
    const raw = await listOrgRepos(org);
    const repos = raw.map(normalize);
    return { org, totalStars: sumStars(repos) };
  });

  // NEW: Top 5 repositories with more stars
  app.get("/org/:org/top-stars", async (req) => {
    const org = (req.params as any).org;
    const limit = Number((req.query as any).limit ?? 5);
    const raw = await listOrgRepos(org);
    const repos = raw.map(normalize);
    return take(limit)(sortByStarsDesc(repos));
  });

  // NEW: All repositories alphabetically, excluding those starting with 'h'
  app.get("/org/:org/alphabetical", async (req) => {
    const org = (req.params as any).org;
    const raw = await listOrgRepos(org);
    const repos = raw.map(normalize);
    return sortAlphabetically(filterOutReposStartingWithH(repos));
  });

  return app;
}