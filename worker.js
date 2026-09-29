const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
};

function secure(response, extra = {}) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/devises") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return secure(new Response("Method Not Allowed", { status: 405 }), { Allow: "GET, HEAD" });
      }

      try {
        const response = await fetch(
          "https://data-api.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A?format=csvdata&lastNObservations=1",
          {
            cf: { cacheTtl: 21600, cacheEverything: true },
            signal: AbortSignal.timeout(10000)
          }
        );

        if (!response.ok) throw new Error("ECB request failed");

        const csv = await response.text();
        const lines = csv.trim().split(/\r?\n/);
        const header = lines.shift().split(",");
        const currencyIndex = header.indexOf("CURRENCY");
        const valueIndex = header.indexOf("OBS_VALUE");
        const dateIndex = header.indexOf("TIME_PERIOD");

        const rates = { EUR: 1 };
        const dates = { EUR: null };

        for (const line of lines) {
          const columns = line.split(",");
          if (
            currencyIndex >= 0 &&
            valueIndex >= 0 &&
            columns[currencyIndex] &&
            columns[valueIndex]
          ) {
            const value = Number(columns[valueIndex]);
            if (!Number.isFinite(value)) continue;
            const currency = columns[currencyIndex];
            rates[currency] = value;
            dates[currency] = columns[dateIndex] || null;
          }
        }

        return secure(
          new Response(JSON.stringify({ dates, rates, source: "BCE" }), {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "public, max-age=21600"
            }
          }),
          {
            "Access-Control-Allow-Origin": "https://simulateur.site",
            "Vary": "Origin",
            "Link": '</.well-known/api-catalog>; rel="api-catalog", </api/devises/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.1", </api/devises/docs/>; rel="service-doc"; type="text/html", </api/devises>; rel="describedby"'
          }
        );
      } catch (error) {
        console.error({ event: "ecb_exchange_rates_fetch_failed", message: error instanceof Error ? error.message : String(error) });
        return secure(
          new Response(JSON.stringify({ error: "source_unavailable" }), {
            status: 502,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "no-store"
            }
          })
        );
      }
    }

    return secure(await env.ASSETS.fetch(request));
  }
};
