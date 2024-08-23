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

    box.style.opacity = 0;
    box.style.transition = `opacity ${duration}s ease-in-out`;

    parentBox.appendChild(box);

    const startHeight = parentBox.clientHeight;
    parentBox.style.height = `${startHeight}px`;
    parentBox.style.transition = `height ${duration}s ease-in-out`;

    void parentBox.offsetHeight; // Trigger reflow

    const newHeight = startHeight + box.scrollHeight;
    parentBox.style.height = `${newHeight}px`;

    setTimeout(() => {
      box.style.opacity = 1;
    }, duration * 1000);
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

  // Display results
  const resultContainer = document.getElementById('result');
  const priceSection = document.getElementById('prices-section');
  const countryName = document.getElementById('country_name');

  countryName.textContent = capitalize(location);
  countryName.style.display = "flex";
  smoothExpand(resultContainer, countryName);

  document.getElementById('buy-price').textContent = `Buy Price: $${totalPrice.toLocaleString()}`;
  document.getElementById('rent-price').textContent = `Rent Per Month: $${estRent.toLocaleString()}`;

  priceSection.style.display = "flex";
  smoothExpand(resultContainer, priceSection);

  // Re-enable the submit button after 2 seconds
  setTimeout(() => {
    submitBtn.disabled = false;
  }, 2000);
});