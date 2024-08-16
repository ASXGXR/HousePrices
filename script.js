document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  const location = document.getElementById('location').value.trim().toLowerCase();
  const area = 1;  // Default area value

  // Get price from storage
  let capitalPrice = localStorage.getItem(`${location}_capital`);
  
  // If found
  if (capitalPrice) {
    capitalPrice = parseFloat(capitalPrice);
    console.log(`Using stored capital city price for ${location}: ${capitalPrice}.`);
  
  } else { // Get from ChatGPT
    const capitalPrompt = `Estimate the average buying price of a house in the capital city of ${location}, in USD. In the format: "Average House Price in {city}: {single-price}", add nothing else, and don't do the square meter price`;

    const capitalApiResponse = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: capitalPrompt }),
    });

    const capitalResponseData = await capitalApiResponse.json();
    console.log(capitalResponseData);
    capitalPrice = parseFloat(capitalResponseData.message.match(/[\d,]+(\.\d+)?/)[0].replace(/,/g, ''));

    localStorage.setItem(`${location}_capital`, capitalPrice);
    console.log(`Stored capital city price for ${location}: ${capitalPrice}.`);
  }

  // Calculate sub-capital price as 1.5 times less than the capital price
  const subCapitalPrice = Math.round(capitalPrice / 1.5);

  // Calculate total prices and rents
  let capitalTotalPrice = Math.round(area * capitalPrice * 0.1);
  let capitalEstimatedRent = Math.round(capitalTotalPrice / 20);

  let subCapitalTotalPrice = Math.round(area * subCapitalPrice * 0.1);
  let subCapitalEstimatedRent = Math.round(subCapitalTotalPrice / 20);

  // Round to the nearest 10 if more than 1000
  if (capitalTotalPrice > 1000) {
      capitalTotalPrice = Math.round(capitalTotalPrice / 10) * 10;
  }
  if (capitalEstimatedRent > 1000) {
      capitalEstimatedRent = Math.round(capitalEstimatedRent / 10) * 10;
  }
  if (subCapitalTotalPrice > 1000) {
      subCapitalTotalPrice = Math.round(subCapitalTotalPrice / 10) * 10;
  }
  if (subCapitalEstimatedRent > 1000) {
      subCapitalEstimatedRent = Math.round(subCapitalEstimatedRent / 10) * 10;
  }

  // Display the results for both capital and sub-capital
  const country_name = document.getElementById('country_name')
  country_name.style.display = "flex";
  country_name.textContent = capitalize(location);
  document.getElementById('capital-price').textContent = `Buy Price: $${capitalTotalPrice.toLocaleString()}`;
  document.getElementById('capital-rent').textContent = `Rent Per Month: $${capitalEstimatedRent.toLocaleString()}`;
  document.getElementById('sub-capital-price').textContent = `Buy Price: $${subCapitalTotalPrice.toLocaleString()}`;
  document.getElementById('sub-capital-rent').textContent = `Rent Per Month: $${subCapitalEstimatedRent.toLocaleString()}`;
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