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
  
  let propertyPrice;
  if (area) {
    // Area is provided, get price per square meter
    let pricePerSqMeter = localStorage.getItem(`${location}_${isCapital ? 'capital' : 'subcapital'}_price_per_sq_meter`);
    
    if (pricePerSqMeter && !isNaN(parseFloat(pricePerSqMeter))) {
      pricePerSqMeter = parseFloat(pricePerSqMeter);
      console.log(`Using stored ${isCapital ? 'capital' : 'sub-capital'} city price per square meter for ${location}: ${pricePerSqMeter}.`);
    
    } else { 
      const prompt = `Estimate the average price per square meter of a house in ${isCapital ? 'the capital city of' : 'a non-capital city in'} ${location}, in USD. In the format: "Average Price per Square Meter in {city}: {price}", add nothing else.`;
      const apiResponse = await fetch('/.netlify/functions/openai', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
      });

      const responseData = await apiResponse.json();
      console.log(responseData);

      pricePerSqMeter = parseFloat(responseData.message.replace(/[^0-9.]/g, ''));

      localStorage.setItem(`${location}_${isCapital ? 'capital' : 'subcapital'}_price_per_sq_meter`, pricePerSqMeter);
      console.log(`Stored ${isCapital ? 'capital' : 'sub-capital'} city price per square meter for ${location}: ${pricePerSqMeter}.`);
    }

    // Calculate total price based on area in square meters
    propertyPrice = Math.round(area * pricePerSqMeter);

  } else {
    // Area is not provided, get average house price
    propertyPrice = localStorage.getItem(`${location}_${isCapital ? 'capital' : 'subcapital'}`);
    
    if (propertyPrice && !isNaN(parseFloat(propertyPrice))) {
      propertyPrice = parseFloat(propertyPrice);
      console.log(`Using stored ${isCapital ? 'capital' : 'sub-capital'} city house price for ${location}: ${propertyPrice}.`);
    
    } else {
      const prompt = `Estimate the average buying price of a house in ${isCapital ? 'the capital city of' : 'a non-capital city in'} ${location}, in USD. In the format: "Average House Price in {city}: {single-price}", add nothing else, and don't do the square meter price.`;
      const apiResponse = await fetch('/.netlify/functions/openai', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
      });

      const responseData = await apiResponse.json();
      console.log(responseData);

      propertyPrice = parseFloat(responseData.message.replace(/[^0-9.]/g, ''));

      localStorage.setItem(`${location}_${isCapital ? 'capital' : 'subcapital'}`, propertyPrice);
      console.log(`Stored ${isCapital ? 'capital' : 'sub-capital'} city house price for ${location}: ${propertyPrice}.`);
    }
  }

  // Adjust for Empty Plot
  if (isEmptyPlot) {
    propertyPrice = Math.round(propertyPrice * 0.8); // Adjust price if it is an empty plot
  }

  // Calculate estimated rent
  const estimatedRent = Math.round(propertyPrice / 20);

  // Display results based on whether it's a capital city or sub-capital
  if (isCapital) {
    document.getElementById('capital-price').textContent = `Buy Price: $${propertyPrice.toLocaleString()}`;
    document.getElementById('capital-rent').textContent = `Rent Per Month: $${estimatedRent.toLocaleString()}`;
    document.getElementById('sub-capital-price').textContent = '';
    document.getElementById('sub-capital-rent').textContent = '';
  } else {
    document.getElementById('sub-capital-price').textContent = `Buy Price: $${propertyPrice.toLocaleString()}`;
    document.getElementById('sub-capital-rent').textContent = `Rent Per Month: $${estimatedRent.toLocaleString()}`;
    document.getElementById('capital-price').textContent = '';
    document.getElementById('capital-rent').textContent = '';
  }

  // Displaying Country Name
  const country_name = document.getElementById('country_name');
  country_name.style.display = "flex";
  country_name.textContent = capitalize(location);

  // Re-enable the submit button after 2 seconds
  setTimeout(() => {
    submitButton.disabled = false;
  }, 2000);
});
