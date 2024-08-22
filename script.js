document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  // FUNCTIONS
  function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  // VARIABLES
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const location = document.getElementById('location').value.trim().toLowerCase();
  const areaInput = document.getElementById('area').value.trim(); 
  const area = areaInput ? parseFloat(areaInput) : 100; // Use default area of 100 if none provided
  const isCapital = document.getElementById('isCapital').checked; // Check if 'Capital City' is ticked
  const isEmptyPlot = document.getElementById('isEmptyPlot').checked; // Check if 'Empty Plot' is ticked

  // Prevent multiple clicks
  if (submitBtn.disabled) {
    return; // If button is disabled, do nothing
  }
  submitBtn.disabled = true; // Disable the button
  
  // Fetch or calculate the average house price for the capital city
  let capitalPrice = localStorage.getItem(`${location}_capital_price`);
  
  if (capitalPrice && !isNaN(parseFloat(capitalPrice))) {
    capitalPrice = parseFloat(capitalPrice);
    console.log(`Using stored capital city price for ${location}: ${capitalPrice}.`);
  
  } else { 
    const prompt = `Estimate the average buying price of a house in the capital city of ${location}, in USD. In the format: "Average House Price in {city}: {single-price}", add nothing else.`;
    const apiResponse = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    const responseData = await apiResponse.json();
    console.log(responseData);

    capitalPrice = parseFloat(responseData.message.replace(/[^0-9.]/g, ''));

    localStorage.setItem(`${location}_capital_price`, capitalPrice);
    console.log(`Stored capital city price for ${location}: ${capitalPrice}.`);
  }

  // Adjust price if the location is not the capital city
  let finalPrice = isCapital ? capitalPrice : Math.round(capitalPrice / 1.5);

  // Calculate total price based on area in square meters
  let totalPrice = Math.round(area * finalPrice);

  // Adjust for Empty Plot
  if (isEmptyPlot) {
    totalPrice = Math.round(totalPrice * 0.8); // Adjust price if it is an empty plot
  }

  // Calculate estimated rent
  const estRent = Math.round(totalPrice / 20);

  // Display results based on whether it's a capital city or sub-capital
  if (isCapital) {
    document.getElementById('capital-section').style.display = "block";
    document.getElementById('sub-capital-section').style.display = "none";

    document.getElementById('capital-price').textContent = `Buy Price: $${totalPrice.toLocaleString()}`;
    document.getElementById('capital-rent').textContent = `Rent Per Month: $${estRent.toLocaleString()}`;
  } else {
    document.getElementById('capital-section').style.display = "none";
    document.getElementById('sub-capital-section').style.display = "block";

    document.getElementById('sub-capital-price').textContent = `Buy Price: $${totalPrice.toLocaleString()}`;
    document.getElementById('sub-capital-rent').textContent = `Rent Per Month: $${estRent.toLocaleString()}`;
  }

  // Displaying Country Name
  const countryName = document.getElementById('country_name');
  countryName.style.display = "flex";
  countryName.textContent = capitalize(location);

  // Re-enable the submit button after 2 seconds
  setTimeout(() => {
    submitBtn.disabled = false;
  }, 2000);
});