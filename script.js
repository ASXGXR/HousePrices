document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  // FUNCTIONS
  function capitalize(word) {
    return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '';
  }

  function smoothExpand(parentBox, addBox, duration = 0.5) {
    let box;
    if (typeof addBox === 'string') {
      box = document.createElement('div');
      box.className = addBox.replace('.', '');
    } else {
      box = addBox;
    }

    // Initially hide the box
    box.style.opacity = 0;
    box.style.transition = `opacity ${duration}s ease-in-out`;

    // Append the box to the parent container
    parentBox.appendChild(box);

    // Measure the full height of the container after adding the new box
    const newHeight = parentBox.scrollHeight;

    // Set the container height explicitly before the transition
    parentBox.style.height = `${parentBox.clientHeight}px`;
    parentBox.style.transition = `height ${duration}s ease-in-out`;

    // Trigger reflow to ensure the transition happens
    void parentBox.offsetHeight;

    // Animate to the new height
    parentBox.style.height = `${newHeight}px`;

    // Fade in the added box
    setTimeout(() => {
        box.style.opacity = 1;
    }, 50); // Start the fade-in slightly after height transition starts
  }

  // VARIABLES
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const location = document.getElementById('location').value.trim().toLowerCase();
  const areaInput = document.getElementById('area').value.trim();
  const area = areaInput ? parseFloat(areaInput) : 100;
  const isCapital = document.getElementById('isCapital').checked;
  const isEmptyPlot = document.getElementById('isEmptyPlot').checked;

  if (submitBtn.disabled) return;

  submitBtn.disabled = true;

  // Fetch or calculate the average house price for the capital city
  let capitalPrice = localStorage.getItem(`${location}_capital_price`);

  if (capitalPrice && !isNaN(parseFloat(capitalPrice))) {
    capitalPrice = parseFloat(capitalPrice);
    console.log(`Using stored capital city price for ${location}: ${capitalPrice}.`);
  } else {
    const prompt = `Estimate the average price per square meter of a house in the capital city of ${location}, in USD. In the format: "Average SQM Price in {city}: {single-price}", add nothing else.`;

    const apiResponse = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const responseData = await apiResponse.json();
    console.log(responseData);

    capitalPrice = parseFloat(responseData.message.replace(/[^0-9.]/g, ''));
    localStorage.setItem(`${location}_capital_price`, capitalPrice);
    console.log(`Stored capital city price for ${location}: ${capitalPrice}.`);
  }

  // Price calculation
  const finalPrice = isCapital ? capitalPrice : Math.round(capitalPrice / 1.5);
  let totalPrice = Math.round(area * finalPrice * 0.1);

  if (isEmptyPlot) {
    totalPrice = Math.round(totalPrice * 0.8);
  }

  const estRent = Math.round(totalPrice / 20);

  // Getting Divs
  const resultContainer = document.getElementById('result');
  const countryName = document.getElementById('country_name');
  const cityType = document.getElementById('city_type');

  if (isCapital) {
    cityType.textContent = "Capital City"
  } else {
    cityType.textContent = "Sub-Capital"
  }

  // Changing Text
  countryName.textContent = capitalize(location);
  document.getElementById('buy-price').textContent = `Buy Price: $${totalPrice.toLocaleString()}`;
  document.getElementById('rent-price').textContent = `Rent Per Month: $${estRent.toLocaleString()}`;

  // Expanding Results Container
  resultContainer.style.display = "flex";
  smoothExpand(document.querySelector('.container'), resultContainer);
  
  // Re-enable the submit button after 2 seconds
  setTimeout(() => {
    submitBtn.disabled = false;
  }, 2000);
});