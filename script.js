// FUNCTIONS

// Capitalise
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

// Get Margin + Padding
function getBoxMarginAndPadding(box) {
  const computedStyle = window.getComputedStyle(box);

  const margin = {
    top: computedStyle.marginTop,
    right: computedStyle.marginRight,
    bottom: computedStyle.marginBottom,
    left: computedStyle.marginLeft
  };

  const padding = {
    top: computedStyle.paddingTop,
    right: computedStyle.paddingRight,
    bottom: computedStyle.paddingBottom,
    left: computedStyle.paddingLeft
  };

  return { margin, padding };
}

// Add Margin + Padding
function reapplyMarginAndPadding(box, margin, padding) {
  box.style.marginTop = margin.top;
  box.style.marginRight = margin.right;
  box.style.marginBottom = margin.bottom;
  box.style.marginLeft = margin.left;

  box.style.paddingTop = padding.top;
  box.style.paddingRight = padding.right;
  box.style.paddingBottom = padding.bottom;
  box.style.paddingLeft = padding.left;
}

// Smoothly Add Box
function smoothExpand(parentBox, addBox, duration = 1.5) {
  // Create box if string given
  const box = typeof addBox === 'string' 
    ? Object.assign(document.createElement('div'), { className: addBox.replace('.', '') })
    : addBox;

  // Set initial styles for the new box
  box.style.opacity = 0;
  box.style.transition = `opacity ${duration/1.5}s ease-in-out`;
  box.style.maxHeight = '0px';
  box.style.overflow = 'hidden';

  // Append the box to measure height
  parentBox.appendChild(box);

  // Measure the final height of the new box
  const boxHeight = box.scrollHeight;

  // Trigger a reflow, then expand the box smoothly
  void box.offsetHeight;
  box.style.transition = `opacity ${duration/1.5}s ease-in-out, max-height ${duration}s ease-in-out`;
  box.style.maxHeight = `${boxHeight}px`; // Expand to full height
  box.style.opacity = 1; // Fade in

  // Once the transition is complete, cleanup
  box.addEventListener('transitionend', function () {
    box.style.maxHeight = ''; // Reset max-height to allow natural growth/shrinkage
    box.style.overflow = '';
  }, { once: true });
}


function addPronounce(pronounce,pronounceBox) {
  // Create and configure new box
  let newBox = document.createElement("div");
  newBox.className = "pronunciation-text";
  newBox.textContent = pronounce;
  newBox.style.opacity = "0.4";
  
  // Find the existing .input-container.input2 element
  let existingContainer = document.querySelector(`.input-container.input${pronounceBox}`);
  
  // Clear current pronunciation boxes and create a new one
  clearPronounce();
  let pronunciationBox = document.createElement("div");
  pronunciationBox.className = "pronunciation-box";
  pronunciationBox.style.height = '0px'; // Start with 0 height
  pronunciationBox.appendChild(newBox); // Append new pronunciation text

  // Append the pronunciation box before char-limit
  let charLimitElement = document.getElementById(`char-limit${pronounceBox}`);
  existingContainer.insertBefore(pronunciationBox, charLimitElement);

  // Smooth transition
  setTimeout(() => {
    pronunciationBox.style.height = newBox.scrollHeight + 'px'; // Set to the height of the content
    pronunciationBox.style.opacity = '1';
  }, 10);
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
  smoothExpand(document.querySelector('.container'), resultContainer);
});