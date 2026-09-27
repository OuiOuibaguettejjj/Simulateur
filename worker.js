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
    const isHtml = assetResponse.headers.get("content-type")?.includes("text/html");
    if (!isHtml) return secure(assetResponse);

    const needsCalculatorEnhancements = /^(?:\/outil|\/conversion)\//.test(pathname);
    const nonce = crypto.randomUUID().replaceAll("-", "");
    let hasEnhancements = false;
    let hasAdsense = false;
    let hasAdsenseMeta = false;

    const transformed = new HTMLRewriter()
      .on("script", {
        element(element) {
          const src = element.getAttribute("src");
          element.setAttribute("nonce", nonce);

          if (src === "/enter-calcul.js" || src === "https://simulateur.site/enter-calcul.js") {
            hasEnhancements = true;
          }

          if (src?.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
            hasAdsense = true;
          }
        }
      })
      .on("meta", {
        element(element) {
          if (
            element.getAttribute("name")?.toLowerCase() === "google-adsense-account" &&
            element.getAttribute("content") === "ca-pub-2924580037451268"
          ) {
            hasAdsenseMeta = true;
          }
        }
      })
      .on("head", {
        element(element) {
          element.onEndTag(endTag => {
            if (!hasAdsenseMeta) {
              endTag.before(
                '<meta name="google-adsense-account" content="ca-pub-2924580037451268">',
                { html: true }
              );
            }

            if (!hasAdsense) {
              endTag.before(
                '<script async nonce="' + nonce + '" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2924580037451268" crossorigin="anonymous"></script>',
                { html: true }
              );
            }

            if (needsCalculatorEnhancements && !hasEnhancements) {
              endTag.before('<script nonce="' + nonce + '" src="/enter-calcul.js" defer></script>', { html: true });
            }
          });
        }
      })
      .transform(assetResponse);

    const adsenseCsp = [
      "default-src 'self' https:",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'nonce-" + nonce + "' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:"
    ].join("; ");

    return secure(transformed, { "Content-Security-Policy": adsenseCsp });
  }
};
