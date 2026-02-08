// netlify/functions/ask.js
export default async (req, context) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    const key = process.env.PPLX_API_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: "Нет PPLX_API_KEY в Netlify" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await req.json();

    // Простая сборка промпта
    const prompt =
`Сен физика мұғалімі-тюторсың. Тіл: қазақша.
Тақырып: ${body.topic || "Тұрақты электр тогы"}.
Сұрақ: ${body.question}
Нұсқалар: ${Array.isArray(body.options) ? body.options.map((o,i)=>`${String.fromCharCode(65+i)}. ${o}`).join(" | ") : ""}
Оқушы таңдауы: ${body.chosen}
Дұрыс жауап: ${body.correct}
Қате тег: ${body.tag || "-"}
Қысқа түсіндірме (берілген): ${body.short_explain || "-"}

Тапсырма:
1) Дұрыс жауап неге дұрыс екенін түсіндір (формула/логикамен).
2) Оқушы таңдаған қате жауап неге қате екенін түсіндір (қай жерде шатастырады).
3) 2–3 қысқа кеңес бер.
4) Соңында 1 шағын ұқсас есеп/мини-сұрақ бер де, жауабын да бірден көрсет.`;

    // Perplexity API: модель атауы аккаунтқа қарай өзгеруі мүмкін.
    // Көп жағдайда "sonar" / "sonar-pro" сияқты жұмыс істейді.
    const pplxRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a helpful physics tutor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });

    const json = await pplxRes.json().catch(()=> ({}));
    if (!pplxRes.ok) {
      return new Response(JSON.stringify({ error: json?.error?.message || "Perplexity error", raw: json }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const answer =
      json?.choices?.[0]?.message?.content ||
      json?.choices?.[0]?.text ||
      "";

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
