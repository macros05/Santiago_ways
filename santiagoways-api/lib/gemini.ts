const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export type GeminiResponse = {
  text: string;
  raw: unknown;
};

export async function geminiGenerate(opts: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
}): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = opts.model ?? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

  if (!apiKey) {
    return {
      text: 'IA no configurada en este entorno. Activa GEMINI_API_KEY en el servidor.',
      raw: null,
    };
  }

  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { role: 'system', parts: [{ text: opts.systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: opts.userPrompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.8,
      topP: 0.95,
      maxOutputTokens: 800,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  return { text: text.trim(), raw: json };
}
