import { request } from "undici";

const GITHUB_API = "https://api.github.com";

export type RawRepo = {
  name: string;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
};

export async function listOrgRepos(org: string): Promise<RawRepo[]> {
  let url = `${GITHUB_API}/orgs/${org}/repos?per_page=100&type=public&sort=updated&direction=desc`;
  const all: RawRepo[] = [];

  while (url) {
    const res = await request(url, {
      headers: {
        "User-Agent": "sb-pet-project",
        "Accept": "application/vnd.github+json"
      }
    });

    if (res.statusCode === 304) break;
    if (res.statusCode >= 400) throw new Error(`GitHub error ${res.statusCode}`);

    const page = (await res.body.json()) as RawRepo[];
    all.push(...page);

    const link = res.headers.link as string | undefined;
    const next = link?.split(",").find(p => p.includes('rel="next"'));
    url = next ? next.match(/<([^>]+)>/)?.[1] ?? "" : "";
  }

  return all;
}