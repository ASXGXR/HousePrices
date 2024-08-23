document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  // FUNCTIONS
  function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function smoothExpand(parentBox, addBox, duration = 0.5) {
    // Check if addBox is a string (i.e. a selector like '.box')
    let box;
    if (typeof addBox === 'string') {
        // Create a new div with the provided class
        box = document.createElement('div');
        box.className = addBox.replace('.', '');
    } else {
        // If addBox is already an element, use it directly
        box = addBox;
    }

    // Set initial styles for the animation
    box.style.opacity = 0;
    box.style.transition = `opacity ${duration}s ease-in-out`;

    // Append the new box to the parent
    parentBox.appendChild(box);

    // Smoothly expand the parentBox to accommodate the new box
    const startHeight = parentBox.clientHeight;
    parentBox.style.height = `${startHeight}px`;
    parentBox.style.transition = `height ${duration}s ease-in-out`;

    // Trigger a reflow to ensure the styles are applied
    void parentBox.offsetHeight;

    // Calculate the new height with the added box
    const newHeight = startHeight + box.scrollHeight;
    parentBox.style.height = `${newHeight}px`;

    // Fade in the new box
    setTimeout(() => {
        box.style.opacity = 1;
    }, duration * 1000);
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
    const prompt = `Estimate the average price per square meter of a house in the capital city of ${location}, in USD. In the format: "Average SQM Price in {city}: {single-price}", add nothing else.`;
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
  let totalPrice = Math.round(area * finalPrice * 0.1);

  // Adjust for Empty Plot
  if (isEmptyPlot) {
    totalPrice = Math.round(totalPrice * 0.8); // Adjust price if it is an empty plot
  }

  // Calculate estimated rent
  const estRent = Math.round(totalPrice / 20);

  // Display results based on whether it's a capital city or sub-capital
  const resultContainer = document.getElementById('result');
  const capitalSection = document.getElementById('capital-section');
  const subCapitalSection = document.getElementById('sub-capital-section');

  if (isCapital) {
      // Update text content
      document.getElementById('capital-price').textContent = `Buy Price: $${totalPrice.toLocaleString()}`;
      document.getElementById('capital-rent').textContent = `Rent Per Month: $${estRent.toLocaleString()}`;

      // Smoothly expand and show the capital section, hide the sub-capital section
      capitalSection.style.display = "block";
      smoothExpand(resultContainer, capitalSection);
      subCapitalSection.style.display = "none";
  } else {
      // Update text content
      document.getElementById('sub-capital-price').textContent = `Buy Price: $${totalPrice.toLocaleString()}`;
      document.getElementById('sub-capital-rent').textContent = `Rent Per Month: $${estRent.toLocaleString()}`;

      // Smoothly expand and show the sub-capital section, hide the capital section
      subCapitalSection.style.display = "block";
      smoothExpand(resultContainer, subCapitalSection);
      capitalSection.style.display = "none";
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