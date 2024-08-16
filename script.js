// script.js
document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const location = document.getElementById('location').value.trim();
  const isCapital = document.getElementById('isCapital').checked;
  // const area = parseFloat(document.getElementById('area').value);
  const area = 1;

  // Check if the price is already stored in localStorage
  let price = localStorage.getItem(location);

  if (price) {
    // If stored, parse the string back to a number
    price = parseFloat(price);
    console.log(`Using stored price for ${location}: ${price} per sq meter.`);
  } else {
    // If not stored, fetch from the API
    const prompt = `Estimate the average buying price of a house in the capital city of ${location}, in USD. In the format: "Price: {single-price}", add nothing else, and don't do the square meter price`;
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
    price = parseFloat(responseData.message.match(/[\d,]+(\.\d+)?/)[0].replace(/,/g, ''));

    // Store the fetched price in localStorage
    localStorage.setItem(location, price);
    console.log(`Stored price for ${location}: ${price} per sq meter.`);
  }

  // Calculate total price and rent
  let totalPrice = Math.round(area * price * 0.1);
  if (!isCapital) {
      totalPrice = Math.round(totalPrice / 1.5);
  }
  const estimatedRent = Math.round(totalPrice / 20);

  // Display the results
  document.getElementById('price').textContent = `Property Price: $${totalPrice.toLocaleString()} USD`;
  document.getElementById('rent').textContent = `Estimated Rent: $${estimatedRent.toLocaleString()} USD`;
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