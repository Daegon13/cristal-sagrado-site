const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const STORAGE_KEY = "cristal_campaign_v1";
const MAX_AGE_MS = 30 * 60 * 1000;
const token = (value) => typeof value === "string" && value.length <= 40 && /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(value) && !/\d{7,}/.test(value);

export function safeCampaign(search) {
  const query = new URLSearchParams(search);
  const campaign = Object.fromEntries(KEYS.filter((key) => token(query.get(key))).map((key) => [key, query.get(key)]));
  return ["utm_source", "utm_medium", "utm_campaign"].every((key) => campaign[key]) && ["instagram", "ig"].includes(campaign.utm_source) && ["bio", "story", "reel", "post"].includes(campaign.utm_medium) ? campaign : null;
}

export function campaignUrl(href, campaign, origin) {
  if (!campaign) return href;
  if (href.startsWith("#")) return href;
  let url;
  try { url = new URL(href, origin); } catch { return href; }
  if (url.origin !== origin || url.pathname.includes("/admin/") || /\.(?:pdf|webp|png|jpe?g|svg|html)$/i.test(url.pathname) || url.searchParams.has("utm_source")) return href;
  for (const [key, value] of Object.entries(campaign)) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function preserveCampaignOnInternalLinks() {
  let campaign = safeCampaign(location.search);
  try {
    if (campaign) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ campaign, at: Date.now() }));
    else {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Date.now() - saved.at < MAX_AGE_MS) campaign = safeCampaign(new URLSearchParams(saved.campaign).toString());
    }
  } catch { /* La navegación sigue funcionando cuando el almacenamiento está deshabilitado. */ }
  if (!campaign) return;
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || link.hasAttribute("download")) return;
    const updated = campaignUrl(link.getAttribute("href"), campaign, location.origin);
    if (updated !== link.getAttribute("href")) link.href = updated;
  }, true);
}
