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
      if (request.method !== "GET") {
        return secure(new Response("Method Not Allowed", { status: 405 }), { Allow: "GET" });
      }

      try {
        const response = await fetch(
          "https://data-api.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A?format=csvdata&lastNObservations=1",
          { cf: { cacheTtl: 21600, cacheEverything: true } }
        );

        if (!response.ok) throw new Error("ECB request failed");

        const csv = await response.text();
        const lines = csv.trim().split(/\r?\n/);
        const header = lines.shift().split(",");
        const currencyIndex = header.indexOf("CURRENCY");
        const valueIndex = header.indexOf("OBS_VALUE");
        const dateIndex = header.indexOf("TIME_PERIOD");

        const rates = { EUR: 1 };
        let date = "";

        for (const line of lines) {
          const columns = line.split(",");
          if (
            currencyIndex >= 0 &&
            valueIndex >= 0 &&
            columns[currencyIndex] &&
            columns[valueIndex]
          ) {
            rates[columns[currencyIndex]] = Number(columns[valueIndex]);
            date = columns[dateIndex] || date;
          }
        }

        return secure(
          new Response(JSON.stringify({ date, rates, source: "BCE" }), {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "public, max-age=21600"
            }
          }),
          {
            "Access-Control-Allow-Origin": "https://simulateur.site",
            Vary: "Origin"
          }
        );
      } catch {
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

    const assetResponse = await env.ASSETS.fetch(request);
    const pathname = url.pathname;
    const needsEnhancements = /^(?:\/outil|\/conversion)\//.test(pathname) && assetResponse.headers.get("content-type")?.includes("text/html");
    if (!needsEnhancements) return secure(assetResponse);

    let hasEnhancements = false;
    const transformed = new HTMLRewriter()
      .on("script", {
        element(element) {
          const src = element.getAttribute("src");
          if (src === "/enter-calcul.js" || src === "https://simulateur.site/enter-calcul.js") hasEnhancements = true;
        }
      })
      .on("head", {
        element(element) {
          element.onEndTag(() => {
            if (!hasEnhancements) {
              element.before('<script src="/enter-calcul.js" defer></script>', { html: true });
            }
          });
        }
      })
      .transform(assetResponse);

    return secure(transformed);
  }
};
