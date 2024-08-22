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
  const areaInput = document.getElementById('area').value.trim(); 
  const area = areaInput ? parseFloat(areaInput) : null; // Get the area in square meters or null if empty
  const isCapital = document.getElementById('isCapital').checked; // Check if 'Capital City' is ticked
  const isEmptyPlot = document.getElementById('isEmptyPlot').checked; // Check if 'Empty Plot' is ticked

  // Prevent multiple clicks
  if (submitButton.disabled) {
    return; // If button is disabled, do nothing
  }
  submitButton.disabled = true; // Disable the button
  
  let capitalPrice;
  if (area) {
    // Area is provided, get price per square meter
    let capitalPricePerSqMeter = localStorage.getItem(`${location}_capital_price_per_sq_meter`);
    
    if (capitalPricePerSqMeter && !isNaN(parseFloat(capitalPricePerSqMeter))) {
      capitalPricePerSqMeter = parseFloat(capitalPricePerSqMeter);
      console.log(`Using stored capital city price per square meter for ${location}: ${capitalPricePerSqMeter}.`);
    
    } else { 
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

      capitalPricePerSqMeter = parseFloat(capitalResponseData.message.replace(/[^0-9.]/g, ''));

      localStorage.setItem(`${location}_capital_price_per_sq_meter`, capitalPricePerSqMeter);
      console.log(`Stored capital city price per square meter for ${location}: ${capitalPricePerSqMeter}.`);
    }

    // Calculate total prices and rents based on area in square meters
    capitalPrice = Math.round(area * capitalPricePerSqMeter);
    const subCapitalPrice = Math.round(capitalPrice / 1.5);

  } else {
    // Area is not provided, get average house price
    capitalPrice = localStorage.getItem(`${location}_capital`);
    
    if (capitalPrice && !isNaN(parseFloat(capitalPrice))) {
      capitalPrice = parseFloat(capitalPrice);
      console.log(`Using stored capital city house price for ${location}: ${capitalPrice}.`);
    
    } else {
      const capitalPrompt = `Estimate the average buying price of a house in the capital city of ${location}, in USD. In the format: "Average House Price in {city}: {single-price}", add nothing else, and don't do the square meter price.`;
      const capitalApiResponse = await fetch('/.netlify/functions/openai', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: capitalPrompt }),
      });

      const capitalResponseData = await capitalApiResponse.json();
      console.log(capitalResponseData);

      capitalPrice = parseFloat(capitalResponseData.message.replace(/[^0-9.]/g, ''));

      localStorage.setItem(`${location}_capital`, capitalPrice);
      console.log(`Stored capital city house price for ${location}: ${capitalPrice}.`);
    }
  }

  // Adjustments based on checkboxes
  if (!isCapital) {
    capitalPrice = Math.round(capitalPrice / 1.5); // Adjust price if not in the capital
  }

  if (isEmptyPlot) {
    capitalPrice = Math.round(capitalPrice * 0.8); // Adjust price if it is an empty plot
  }

  // Calculate estimated rent
  const capitalEstimatedRent = Math.round(capitalPrice / 20);
  const subCapitalEstimatedRent = Math.round(capitalPrice / 30); // Assuming sub-capital rent is lower

  // Display results
  document.getElementById('capital-price').textContent = `Buy Price: $${capitalPrice.toLocaleString()}`;
  document.getElementById('capital-rent').textContent = `Rent Per Month: $${capitalEstimatedRent.toLocaleString()}`;
  document.getElementById('sub-capital-price').textContent = `Buy Price: $${Math.round(capitalPrice / 1.5).toLocaleString()}`;
  document.getElementById('sub-capital-rent').textContent = `Rent Per Month: $${subCapitalEstimatedRent.toLocaleString()}`;

  // Displaying Country Name
  const country_name = document.getElementById('country_name');
  country_name.style.display = "flex";
  country_name.textContent = capitalize(location);

  // Re-enable the submit button after 2 seconds
  setTimeout(() => {
    submitButton.disabled = false;
  }, 2000);
});