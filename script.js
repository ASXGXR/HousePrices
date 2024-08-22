// script.js
document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  // FUNCTIONS
  function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  
  // VARIABLES
  const submitButton = event.target.querySelector('button[type="submit"]');
  const location = document.getElementById('location').value.trim().toLowerCase();
  const area = parseFloat(document.getElementById('area').value); // Get the area in square meters
  // Get price from storage
  let capitalPricePerSqMeter = localStorage.getItem(`${location}_capital_price_per_sq_meter`);


  // Prevent multiple clicks
  if (submitButton.disabled) {
    return; // If button is disabled, do nothing
  }
  submitButton.disabled = true; // Disable the button
  

  // Check if capitalPricePerSqMeter is a valid number
  if (capitalPricePerSqMeter && !isNaN(parseFloat(capitalPricePerSqMeter))) {
    capitalPricePerSqMeter = parseFloat(capitalPricePerSqMeter);
    console.log(`Using stored capital city price per square meter for ${location}: ${capitalPricePerSqMeter}.`);
  
  } else { 
    // Get from ChatGPT if not a valid number or doesn't exist
    const capitalPrompt = `Estimate the average price per square meter of a house in the capital city of ${location}, in USD. In the format: "Average Price per Square Meter in {city}: {price}", add nothing else.`;
    const capitalApiResponse = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: capitalPrompt }),
    });

    const capitalResponseData = await capitalApiResponse.json();
    console.log(capitalResponseData);

    // Getting price from response
    capitalPricePerSqMeter = parseFloat(capitalResponseData.message.replace(/[^0-9.]/g, ''));

    // Store the valid capitalPricePerSqMeter in localStorage
    localStorage.setItem(`${location}_capital_price_per_sq_meter`, capitalPricePerSqMeter);
    console.log(`Stored capital city price per square meter for ${location}: ${capitalPricePerSqMeter}.`);
  }

  // Calculate sub-capital price per square meter as 1.5 times less than the capital price
  const subCapitalPricePerSqMeter = Math.round(capitalPricePerSqMeter / 1.5);

  // Calculate total prices and rents based on area in square meters
  let capitalTotalPrice = Math.round(area * capitalPricePerSqMeter);
  let capitalEstimatedRent = Math.round(capitalTotalPrice / 20);

  let subCapitalTotalPrice = Math.round(area * subCapitalPricePerSqMeter);
  let subCapitalEstimatedRent = Math.round(subCapitalTotalPrice / 20);

  // Round number
  const roundTo = 100;
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
