exports.handler = async function(event, context) {
  try {
    const { prompt, model = 'gpt-3.5-turbo', system = '' } = JSON.parse(event.body);
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.API_KEY;

    if (!apiKey) throw new Error('API key is missing');

    const messages = [{ role: "user", content: prompt }];
    if (system) messages.unshift({ role: "system", content: system });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) throw new Error('No choices returned from OpenAI API');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: data.choices[0].message.content }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};