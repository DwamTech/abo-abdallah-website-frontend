const refreshInterval = 5;

const styles = `
  @font-face{font-family:Kufi;src:url('/media/maintenance/noto-kufi-arabic-arabic-wght-normal.woff2') format('woff2');font-weight:100 900;font-display:swap}
  @font-face{font-family:Naskh;src:url('/media/maintenance/noto-naskh-arabic-arabic-wght-normal.woff2') format('woff2');font-weight:400 700;font-display:swap}
  *{box-sizing:border-box}
  body{margin:0;min-block-size:100svh;display:grid;place-items:center;padding:clamp(1rem,4vw,3rem);color:#2d1e18;background:#f8f3e9;background-image:radial-gradient(ellipse at 50% 0,#fdfbf6 10%,transparent 65%);font-family:Naskh,serif}
  main{inline-size:min(100%,43rem);padding:clamp(1.5rem,5.5vw,3.75rem);border:1px solid #dfd0b7;border-block-start:3px solid #bf9650;border-radius:1.5rem;background:#fdfbf6;box-shadow:0 20px 60px #36251b1f;text-align:center}
  .logo{display:block;inline-size:clamp(9rem,42vw,14rem);block-size:auto;margin:0 auto 1.75rem}
  .mark{display:grid;place-items:center;inline-size:3.25rem;block-size:3.25rem;margin:0 auto 1rem;border:1px solid #dfd0b7;border-radius:50%;background:#f8f3e9;color:#795725}
  .mark svg{inline-size:1.5rem;block-size:1.5rem}
  h1{margin:0;font-family:Kufi,sans-serif;font-size:clamp(1.4rem,4vw,2.1rem);line-height:1.7;font-weight:760;text-wrap:balance}
  p{margin:.75rem auto 1.5rem;max-inline-size:32rem;color:#67493a;font-size:clamp(1.15rem,2.5vw,1.375rem);line-height:1.9}
  a{display:inline-block;padding:.55rem 1.3rem;border:1px solid #67493a;border-radius:.6rem;font-family:Kufi,sans-serif;font-size:.84rem;color:#39271f;text-decoration:none}
  a:hover{background:#eee4d2}a:focus-visible{outline:3px solid #a67a35;outline-offset:3px}
`;

export function maintenanceResponse(closed: boolean, head = false) {
  const title = closed
    ? "نعمل على تطوير الموقع"
    : "يتعذر الوصول إلى الموقع مؤقتًا";
  const description = closed
    ? "نعمل حاليًا على إجراء بعض التحديثات والصيانة لتقديم تجربة أفضل لكم. شكرًا لتفهمكم، ونسعد بزيارتكم مجددًا قريبًا."
    : "تعذّر التحقق من حالة الموقع في الوقت الحالي. يرجى إعادة المحاولة بعد قليل.";

  return new Response(
    head
      ? null
      : `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#2d1e18">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="${refreshInterval}">
  <title>${title} | المكتبة البكرية</title>
  <link rel="icon" href="/icon.svg">
  <style>${styles}</style>
</head>
<body>
  <main>
    <img class="logo" src="/media/images/elmaktaba_elbakrya.png" width="834" height="299" alt="المكتبة البكرية">
    <span class="mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.9 5.2l-5.4 5.4a2.1 2.1 0 1 0 3 3l5.4-5.4a4 4 0 0 0 5.2-5.9l-2.4 2.4-2.5-2.5z"/><path d="M19 3v4m-2-2h4"/></svg></span>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="">إعادة المحاولة</a>
  </main>
</body>
</html>`,
    {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "CDN-Cache-Control": "no-store",
        "Retry-After": String(refreshInterval),
        "X-Website-Maintenance": closed ? "closed" : "unavailable",
      },
    },
  );
}

// Install before hydration so a restored document always checks the current state.
export const maintenanceHistoryScript = `
  (() => {
    let pending;
    function check() {
      pending?.abort();
      const controller = new AbortController();
      pending = controller;
      fetch(location.href, { method: "HEAD", cache: "no-store", signal: controller.signal })
        .then(response => {
          if (response.status === 503 && response.headers.has("x-website-maintenance")) {
            location.reload();
          }
        })
        .catch(() => {});
    }
    addEventListener("pageshow", event => { if (event.persisted) check(); });
    addEventListener("popstate", check);
  })();
`;
