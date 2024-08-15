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

  const data = await response.json();

  console.log('OpenAI Response:', data); // Log the entire response for debugging

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No choices returned from OpenAI API');
  }

  const botMessage = data.choices[0].message.content;
  return botMessage;
}

