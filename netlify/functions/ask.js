// netlify/functions/ask.js
// Кілтсіз "stub": сайтта сыртқы ЖИ қолданылмайды.
// (index.html ішіндегі түсіндірме offline түрде беріледі)

export default async (req) => {
  return new Response(
    JSON.stringify({
      ok: true,
      mode: "offline",
      answer:
        "Бұл жобада сыртқы ЖИ (API) қолданылмайды. Түсіндірме сайттың ішінде (offline) беріледі.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
