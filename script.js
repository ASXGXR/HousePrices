// FUNCTIONS

// Capitalise Word
function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '';
}

// Button Delay
function disableButton(button, delay) {
  button.disabled = true;
  setTimeout(() => {
      button.disabled = false;
  }, delay * 1000);
}

// Smoothly Add Box
function smoothExpand(parentBox, addBox, duration = 1.5) {
  // Create box if string given
  const box = typeof addBox === 'string' 
    ? Object.assign(document.createElement('div'), { className: addBox.replace('.', '') })
    : addBox;

  // Set initial styles for the new box
  box.style.opacity = 0;
  box.style.transition = `opacity ${duration/1.5}s ease-in-out, max-height ${duration}s ease-in-out`;
  box.style.maxHeight = '0px';
  box.style.overflow = 'hidden';

  // Append the box, trigger reflow, and start the transition
  parentBox.appendChild(box);
  void parentBox.offsetHeight;
  box.style.maxHeight = '1000px'; // Large value to ensure expansion
  box.style.opacity = 1;

  // Cleanup: Once the transition is complete, remove the maxHeight to allow natural growth/shrinkage
  box.addEventListener('transitionend', function () {
      box.style.maxHeight = '';
      box.style.overflow = '';
  }, { once: true });
}

  
document.getElementById('property-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  // VARIABLES
  const buttonDelay = 2; //seconds
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const location = document.getElementById('location').value.trim().toLowerCase();
  const areaInput = document.getElementById('area').value.trim();
  const area = areaInput ? parseFloat(areaInput) : 100;
  const isCapital = document.getElementById('isCapital').checked;
  const hasHouse = document.getElementById('hasHouse').checked;

  if (submitBtn.disabled) return;
  disableButton(submitBtn, buttonDelay); // Disable the button temporarily

  // Fetch or calculate the average house price for the capital city
  let capitalPrice = localStorage.getItem(`${location}_capital_price`);

  if (capitalPrice && !isNaN(parseFloat(capitalPrice))) {
    capitalPrice = parseFloat(capitalPrice);
    console.log(`Using stored capital city price for ${location}: ${capitalPrice}.`);
  } else {
    try {
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
    } catch (error) {
      console.error('API error or local storage access issue:', error);
      capitalPrice = 0; // Fallback value
    }
  }

  // Price calculation
  const finalPrice = isCapital ? capitalPrice : Math.round(capitalPrice / 1.5);
  const difference = 0.04; // Diff between real world + in-game price
  let totalPrice = Math.round(area * finalPrice * difference);

  if (!hasHouse) {
    totalPrice = Math.round(totalPrice * 0.7);
  }

  const estRent = totalPrice > 0 ? Math.round(totalPrice / 20) : 0;

  // Getting Divs
  const resultContainer = document.getElementById('result');
  const countryName = document.getElementById('country_name');
  const cityType = document.getElementById('city_type');

  if (isCapital) {
    cityType.textContent = "Capital City";
  } else {
    cityType.textContent = "Sub-Capital";
  }

  // Changing Text
  countryName.textContent = capitalize(location);
  document.getElementById('buy-price').textContent = `Buy Price: $${totalPrice.toLocaleString()}`;
  document.getElementById('rent-price').textContent = `Rent Per Month: $${estRent.toLocaleString()}`;

  // Expanding Results Container
  resultContainer.style.display = "flex";
  smoothExpand(document.querySelector('.container'), resultContainer);
});