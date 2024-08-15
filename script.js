async function getOpenAIResponse(prompt) {
  const response = await fetch('/.netlify/functions/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  console.log(data); // This will log the generated text to the console
}

getOpenAIResponse("Tell me a joke");
