export type MarketplaceType = "olx" | "vinted";

const MARKETPLACE_HOSTS: Record<MarketplaceType, readonly string[]> = {
  olx: ["olx.pl"],
  vinted: ["vinted.pl"],
};

export function getMarketplaceType(url: URL): MarketplaceType | null {
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const hostname = url.hostname.toLowerCase();
  for (const [type, hosts] of Object.entries(MARKETPLACE_HOSTS) as Array<
    [MarketplaceType, readonly string[]]
  >) {
    if (hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
      return type;
    }
  }
  return null;
}

export function getSafeExternalListingUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return getMarketplaceType(url) ? url.toString() : null;
  } catch {
    return null;
  }
}
