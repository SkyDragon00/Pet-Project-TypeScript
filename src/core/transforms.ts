import { Repo } from "./types.js";

export const normalize = (r: any): Repo => ({
  name: r.name,
  stars: r.stargazers_count,
  updatedAt: r.updated_at,
  url: r.html_url
});

export const filterByStars = (min: number) => (rs: Repo[]) =>
  rs.filter(r => r.stars > min);

export const sortByUpdatedDesc = (rs: Repo[]) =>
  [...rs].sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1);

export const sortByStarsDesc = (rs: Repo[]) =>
  [...rs].sort((a, b) => b.stars - a.stars);

export const sortAlphabetically = (rs: Repo[]) =>
  [...rs].sort((a, b) => a.name.localeCompare(b.name));

export const filterOutReposStartingWithH = (rs: Repo[]) =>
  rs.filter(r => !r.name.toLowerCase().startsWith('h'));

export const take = (n: number) => (rs: Repo[]) => rs.slice(0, n);

export const sumStars = (rs: Repo[]) =>
  rs.reduce((acc, r) => acc + r.stars, 0);