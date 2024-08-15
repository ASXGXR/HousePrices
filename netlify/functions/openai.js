exports.handler = async function(event, context) {
  try {
    const { prompt, model = 'gpt-3.5-turbo', system = '' } = JSON.parse(event.body);

    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    const botMessage = await chatgptRequest(model, system, prompt, apiKey);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: botMessage }),
    };
  } catch (error) {
    console.error('Error in function:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};

async function chatgptRequest(model, system, prompt, key) {
  const messages = [];

  if (system) {
    messages.push({
      role: "system",
      content: system,
    });
  }

  messages.push({
    role: "user",
    content: prompt,
  });

  const requestBody = JSON.stringify({
    model: model,
    messages: messages,
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: requestBody,
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}