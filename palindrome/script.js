const input = document.getElementById("word-input");
const stick = document.getElementById("stick");
const lettersContainer = document.getElementById("letters");

let isDragging = false;
let angle = 0;
let lastX = 0;

// Create letter elements
function updateLetters(word) {
    lettersContainer.innerHTML = "";
    for (let char of word) {
        let span = document.createElement("span");
        span.classList.add("letter");
        span.textContent = char;
        lettersContainer.appendChild(span);
    }
}

// Handle mouse/touch movement
function startDrag(event) {
    isDragging = true;
    lastX = event.clientX || event.touches[0].clientX;
}

function stopDrag() {
    isDragging = false;
}

function rotate(event) {
    if (!isDragging) return;
    let currentX = event.clientX || event.touches[0].clientX;
    let deltaX = currentX - lastX;
    angle += deltaX * 0.3; // Adjust sensitivity
    lastX = currentX;

    // Apply rotation
    stick.style.transform = `rotate(${angle}deg)`;

    // Update letter arrangement
    let progress = Math.abs(angle) / 180; // Normalize rotation
    if (progress > 1) progress = 1;

    let word = input.value;
    let reversedWord = word.split("").reverse().join("");
    let interpolatedWord = word.split("").map((_, i) => {
        return progress < 0.5 ? word[i] : reversedWord[i];
    }).join("");

    updateLetters(interpolatedWord);
}

// Event listeners
input.addEventListener("input", () => updateLetters(input.value));
stick.addEventListener("mousedown", startDrag);
stick.addEventListener("touchstart", startDrag);
window.addEventListener("mouseup", stopDrag);
window.addEventListener("touchend", stopDrag);
window.addEventListener("mousemove", rotate);
window.addEventListener("touchmove", rotate);

// Initialize with an example
input.value = "diva";
updateLetters("diva");