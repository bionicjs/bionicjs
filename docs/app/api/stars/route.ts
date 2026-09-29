export const revalidate = 3600;

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  try {
    const res = await fetch("https://api.github.com/repos/bionicjs/bionicjs", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      return Response.json(
        { stars: null, message: "GitHub API unavailable" },
        { status: res.status, headers }
      );
    }
    const data = (await res.json()) as { stargazers_count?: number };
    return Response.json({ stars: data.stargazers_count ?? 0 }, { headers });
  } catch {
    return Response.json({ stars: null }, { status: 200, headers });
  }
}