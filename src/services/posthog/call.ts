"use server";

export async function runQuery(
  hogql: string,
  host: string,
  projectId: string,
  personalKey: string
) {
  const url = `${host}/api/projects/${projectId}/query/`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${personalKey}`,
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query: hogql,
      },
      name: "custom-hogql-query",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PostHog Query Error ${res.status}: ${err}`);
  }

  return res.json();
}