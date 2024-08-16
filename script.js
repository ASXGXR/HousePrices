// script.js
document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const location = document.getElementById('location').value.trim();
  const isCapital = document.getElementById('isCapital').checked;
  const area = parseFloat(document.getElementById('area').value);

  const prompt = `Get the average square meter price of properties in ${location} in USD.`;
  const adjustedPrompt = isCapital 
      ? prompt 
      : `${prompt} It is not the capital city, so adjust the price accordingly.`;

  const apiResponse = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: adjustedPrompt }),
  });

  const responseData = await apiResponse.json();
  const pricePerSqMeter = parseFloat(responseData.message.match(/\d+(\.\d+)?/)[0]);

  let totalPrice = area * pricePerSqMeter * 0.1;
  if (!isCapital) {
      totalPrice /= 1.5;
  }
  const estimatedRent = totalPrice / 20;

  document.getElementById('price').textContent = `Property Price: $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  document.getElementById('rent').textContent = `Estimated Rent: $${estimatedRent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;  
});