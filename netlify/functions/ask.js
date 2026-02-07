export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { question, studentSummary } = JSON.parse(event.body || "{}");
    if (!question) {
      return { statusCode: 400, body: JSON.stringify({ error: "Нет вопроса" }) };
    }

    const apiKey = process.env.PPLX_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Нет PPLX_API_KEY в Netlify" }) };
    }

    const system = `Ты тьютор по физике (10 класс). Отвечай кратко и понятно.
Используй только краткое резюме ученика (limited memory) ниже, не проси личные данные.
Если видишь типичную ошибку — назови ее и дай 1 мини-пример.
Резюме: ${JSON.stringify(studentSummary || {})}`;

    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: system },
          { role: "user", content: question }
        ]
      })
    });

    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ answer: answer || "Жауап шықпады" })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Серверная ошибка" }) };
  }
}
