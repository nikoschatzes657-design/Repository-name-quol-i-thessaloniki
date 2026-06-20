const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function fetchCommunitiesByBbox(bounds, level = "ot") {
  const url = `${API}/api/communities?level=${encodeURIComponent(level)}&bbox=${bounds.getWest()}&bbox=${bounds.getSouth()}&bbox=${bounds.getEast()}&bbox=${bounds.getNorth()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`API ${resp.status}`);
  return resp.json();
}

export async function fetchAllCommunities(level = "ot") {
  const url = `${API}/api/communities?level=${encodeURIComponent(level)}&bbox=-180&bbox=-90&bbox=180&bbox=90`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`API ${resp.status}`);
  return resp.json();
}
