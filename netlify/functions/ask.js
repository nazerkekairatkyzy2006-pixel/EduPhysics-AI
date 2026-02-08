export default async () => {
  return new Response(
    JSON.stringify({ ok: true, message: "AI API disabled. Offline explanations only." }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
