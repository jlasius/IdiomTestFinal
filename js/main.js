// Shared utility function for accessibility
function updateAriaLive(message) {
  const ariaLiveRegion = document.getElementById("aria-live-region");
  if (!ariaLiveRegion) {
    const newAriaLiveRegion = document.createElement("div");
    newAriaLiveRegion.id = "aria-live-region";
    newAriaLiveRegion.setAttribute("aria-live", "polite");
    newAriaLiveRegion.setAttribute("aria-atomic", "true");
    newAriaLiveRegion.style.position = "absolute";
    newAriaLiveRegion.style.left = "-9999px";
    document.body.appendChild(newAriaLiveRegion);
  }
  document.getElementById("aria-live-region").textContent = message;
}

// Go back to the previous page
window.goBack = function () {
  window.history.back();
};

// Flashcards functionality
let currentIndex = 0;
let shuffledIdioms = [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

window.flipCard = function () {
  const translationText = document.getElementById("translation-text");
  translationText.classList.toggle("d-none");

  // Update aria-expanded attribute for screen readers
  const isExpanded = !translationText.classList.contains("d-none");
  translationText.setAttribute("aria-expanded", isExpanded);
};

window.nextCard = function () {
  currentIndex = (currentIndex + 1) % shuffledIdioms.length;
  displayIdiom(shuffledIdioms[currentIndex]);
  updateAriaLive("Next card loaded.");
};

window.previousCard = function () {
  currentIndex = (currentIndex - 1 + shuffledIdioms.length) % shuffledIdioms.length;
  displayIdiom(shuffledIdioms[currentIndex]);
  updateAriaLive("Previous card loaded.");
};

// Load idioms from JSON for flashcards
fetch('js/idioms.json')
  .then(response => response.json())
  .then(data => {
    const idioms = data.categories;
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    if (category) {
      const categoryData = idioms.find(cat => cat.name.toLowerCase().includes(category));
      if (categoryData) {
        // Randomize the idioms array
        shuffledIdioms = shuffleArray(categoryData.idioms);

        document.getElementById("category-title").textContent = categoryData.name;

        // Display first idiom
        displayIdiom(shuffledIdioms[currentIndex]);

        // Add keyboard event listeners for flashcards
        document.addEventListener("keydown", (event) => {
          switch (event.code) {
            case "Space": // Flip card on spacebar
              event.preventDefault(); // Prevent scrolling
              flipCard();
              break;
            case "ArrowLeft": // Previous card on left arrow
              event.preventDefault(); // Prevent scrolling
              previousCard();
              break;
            case "ArrowRight": // Next card on right arrow
              event.preventDefault(); // Prevent scrolling
              nextCard();
              break;
          }
        });

        // Add swipe functionality for mobile devices
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener("touchstart", (event) => {
          touchStartX = event.touches[0].clientX;
        });

        document.addEventListener("touchend", (event) => {
          touchEndX = event.changedTouches[0].clientX;
          handleSwipe();
        });

        function handleSwipe() {
          const swipeThreshold = 50; // Minimum swipe distance in pixels
          const swipeDistance = touchEndX - touchStartX;

          if (swipeDistance > swipeThreshold) {
            // Swipe right → go to the previous card
            previousCard();
          } else if (swipeDistance < -swipeThreshold) {
            // Swipe left → go to the next card
            nextCard();
          }
        }
      }
    }
  })
  .catch(error => console.error("Error loading idioms:", error));

// Glossary functionality
function displayIdiom(idiom) {
  const idiomText = document.getElementById("idiom-text");
  const translationText = document.getElementById("translation-text");

  // Display the idiom (centered)
  idiomText.textContent = idiom.idiom;

  // Display the translation, explanation, and examples (left-aligned)
  translationText.innerHTML = `
    <div class="translation"><strong>Translation</strong> ${idiom.translation}</div>
    <div class="explanation"><strong>Explanation</strong> ${idiom.explanation}</div>
    <div class="examples">
      <div><strong>BM</strong> ${idiom.example.BM}</div>
      <div><strong>English</strong> ${idiom.example.English}</div>
    </div>
  `;

  // Hide the translation initially
  translationText.classList.add("d-none");
  translationText.setAttribute("aria-expanded", false);

  // Update aria-live region for screen readers
  updateAriaLive(`Displaying idiom: ${idiom.idiom}`);
}

// Load idioms for glossary
fetch('js/idioms.json')
  .then(response => response.json())
  .then(data => {
    const glossary = document.getElementById("glossary");
    data.categories.forEach(category => {
      const categorySection = document.createElement("div");
      categorySection.classList.add("category-section");
      categorySection.innerHTML = `
        <h2>${category.name}</h2>
        <ul>
          ${category.idioms.map(idiom => `
            <li>
              <strong>${idiom.idiom}</strong>: ${idiom.translation}<br>
              <em>${idiom.explanation}</em><br>
              <span class="example">BM: ${idiom.example.BM}</span><br>
              <span class="example">English: ${idiom.example.English}</span>
            </li>
          `).join('')}
        </ul>
      `;
      glossary.appendChild(categorySection);
    });
  })
  .catch(error => console.error('Error loading idioms:', error));



