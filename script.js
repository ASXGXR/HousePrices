// script.js
document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const location = document.getElementById('location').value.trim();
  const isCapital = document.getElementById('isCapital').checked;
  // const area = parseFloat(document.getElementById('area').value);
  const area = 1;

  const prompt = `Estimate the average buying price of a house in the capital city of ${location}, in USD. In the format: "Price: {single-price}", add nothing else, and don't do the square meter price`;

  const apiResponse = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt }),
  });

  const responseData = await apiResponse.json();
  console.log(responseData);
  const price = parseFloat(responseData.message.match(/[\d,]+(\.\d+)?/)[0].replace(/,/g, ''));
  console.log(price);

  let totalPrice = Math.round(area * price * 0.1);
  if (!isCapital) {
      totalPrice = Math.round(totalPrice / 1.5);
  }
  const estimatedRent = Math.round(totalPrice / 20);

  document.getElementById('price').textContent = `Property Price: $${totalPrice.toLocaleString()}`;
  document.getElementById('rent').textContent = `Estimated Rent: $${estimatedRent.toLocaleString()}`;
});





// WITH SQUARE METERS
//
// // script.js
// document.getElementById('property-form').addEventListener('submit', async function(event) {
//   event.preventDefault();

//   const location = document.getElementById('location').value.trim();
//   const isCapital = document.getElementById('isCapital').checked;
//   const area = parseFloat(document.getElementById('area').value);

//   const prompt = `Get the average square meter price of properties in ${location} in USD.`;
//   const adjustedPrompt = isCapital 
//       ? prompt 
//       : `${prompt} It is not the capital city, so adjust the price accordingly.`;

//   const apiResponse = await fetch('/.netlify/functions/openai', {
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ prompt: adjustedPrompt }),
//   });

//   const responseData = await apiResponse.json();
//   console.log(responseData);
//   const pricePerSqMeter = parseFloat(responseData.message.match(/\d+(\.\d+)?/)[0]);

//   let totalPrice = Math.round(area * pricePerSqMeter * 0.1);
//   if (!isCapital) {
//       totalPrice = Math.round(totalPrice / 1.5);
//   }
//   const estimatedRent = Math.round(totalPrice / 20);

//   document.getElementById('price').textContent = `Property Price: $${totalPrice.toLocaleString()}`;
//   document.getElementById('rent').textContent = `Estimated Rent: $${estimatedRent.toLocaleString()}`;
// });