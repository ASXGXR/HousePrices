async function getOpenAIResponse(prompt) {
  const response = await fetch('/.netlify/functions/openai', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  console.log(data);
}

getOpenAIResponse("Tell me a joke");