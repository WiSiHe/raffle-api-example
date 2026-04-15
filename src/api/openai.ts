const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_API_KEY;

export async function fetchOpenAICompletion(messages: Array<{ role: string; content: string }>) {
  if (!OPENAI_API_KEY) {
    throw new Error("VITE_OPEN_AI_API_KEY is not set.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-nano",
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function streamOpenAICompletion(
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void
) {
  if (!OPENAI_API_KEY) {
    throw new Error("VITE_OPEN_AI_API_KEY is not set.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-nano",
      messages,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI request failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  if (!reader) return;

  let buffer = "";

  const processLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "data: [DONE]") return;

    if (trimmed.startsWith("data:")) {
      const payload = trimmed.replace(/^data:\s*/, "").trim();
      if (!payload) return;

      try {
        const parsed = JSON.parse(payload);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      } catch (e) {
        // Silently skip partial/malformed frames unless they clearly look like JSON
        if (payload.includes("{")) {
          console.warn("[OpenAI] Stream JSON parse error:", payload, e);
        }
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        processLine(line);
      }
    }

    if (done) {
      // Final decoder flush and buffer process
      buffer += decoder.decode();
      if (buffer) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          processLine(line);
        }
      }
      break;
    }
  }
}

