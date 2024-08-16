// script.js
document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const submitButton = event.target.querySelector('button[type="submit"]');

  // Disable the button to prevent multiple clicks
  if (submitButton.disabled) {
    return; // If button is disabled, do nothing
  }

  submitButton.disabled = true; // Disable the button

  function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  
  const location = document.getElementById('location').value.trim().toLowerCase();
  const area = 1;  // Default area value

  // Get price from storage
  let capitalPrice = localStorage.getItem(`${location}_capital`);
  
  // Check if capitalPrice is a valid number
  if (capitalPrice && !isNaN(parseFloat(capitalPrice))) {
    capitalPrice = parseFloat(capitalPrice);
    console.log(`Using stored capital city price for ${location}: ${capitalPrice}.`);
  } else { 
    // Get from ChatGPT if not a valid number or doesn't exist
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

    // Store the valid capitalPrice in localStorage
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

  // Round number
  const roundTo = 100
  if (capitalTotalPrice > roundTo) {
      capitalTotalPrice = Math.round(capitalTotalPrice / roundTo) * roundTo;
  }
  if (capitalEstimatedRent > roundTo) {
      capitalEstimatedRent = Math.round(capitalEstimatedRent / roundTo) * roundTo;
  }
  if (subCapitalTotalPrice > roundTo) {
      subCapitalTotalPrice = Math.round(subCapitalTotalPrice / roundTo) * roundTo;
  }
  if (subCapitalEstimatedRent > roundTo) {
      subCapitalEstimatedRent = Math.round(subCapitalEstimatedRent / roundTo) * roundTo;
  }

  // Displaying Country Name
  const country_name = document.getElementById('country_name');
  country_name.style.display = "flex";
  country_name.textContent = capitalize(location);
  
  // Display the results for both capital and sub-capital
  document.getElementById('capital-price').textContent = `Buy Price: $${capitalTotalPrice.toLocaleString()}`;
  document.getElementById('capital-rent').textContent = `Rent Per Month: $${capitalEstimatedRent.toLocaleString()}`;
  document.getElementById('sub-capital-price').textContent = `Buy Price: $${subCapitalTotalPrice.toLocaleString()}`;
  document.getElementById('sub-capital-rent').textContent = `Rent Per Month: $${subCapitalEstimatedRent.toLocaleString()}`;

  // Re-enable the submit button after 2 seconds
  setTimeout(() => {
    submitButton.disabled = false;
  }, 2000);
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