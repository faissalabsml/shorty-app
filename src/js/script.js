// DOM ELEMENTS & VARIABLES
const menuBtn = document.querySelector(".navbar__menu-btn");
const menu = document.querySelector(".navbar__menu");
const shortenSection = document.querySelector(".shorten");
const shortenInputContainer = document.querySelector(".shorten__input");
const shortenInput = document.querySelector(".shorten__input__field");
const shortenBtn = document.querySelector(".shorten__btn");
const shortenedLinksContainer = document.querySelector(".shorten__results");
const loader = document.querySelector(".loader");
const errorMessage = document.querySelector(".error-message");

// MOVE SHORTEN CONTAINER HALF INPUT HEIGHT
const shortenInputHeight = shortenInputContainer.offsetHeight;
shortenSection.style.transform = `translateY(-${shortenInputHeight / 2}px)`;

// GET STORED LINKS FROM LOCAL STORAGE IF THERE'S ANY
const addedLinks = JSON.parse(window.localStorage.getItem("allLinks")) || [];

// MENU TOGGLE
const toggleMenu = function () {
  menuBtn.classList.toggle("active");
  menu.classList.toggle("active");
};

// API CALL
const getShortenedLink = async function (url) {
  try {
    const results = await fetch(`https://api.shrtco.de/v2/shorten?url=${url}`);
    const data = await results.json();

    if (!results.ok) throw new Error(`(${results.status}), ${data.error}`);

    return data.result;
  } catch (error) {
    // Display error message and hide it after few seconds
    errorMessage.textContent = error;
    errorMessage.classList.add("active");

    setTimeout(() => {
      errorMessage.classList.remove("active");
    }, 4000);
  }
};

// RENDER HTML
const displayShortenedLink = function (original, short) {
  return `
    <div class="shorten__results__item">
      <div class="shorten__results__original">
        <a href="${original}" class="original-link" target="_blank">${original}</a
        >
      </div>
      <div class="shorten__results__shorten-link">
        <a href="${short}" class="shorten-link" target="_blank">${short}</a>
        <div>
          <button class="copy btn">Copy</button>
          <button class="delete">&#10005;</button>
        </div>
      </div>
    </div>
  `;
};

// SAVE TO LOCAL STORAGE
const updateLocalStorage = function () {
  window.localStorage.setItem("allLinks", JSON.stringify(addedLinks));
};

// HANDLE SHORTENING LINKS
const shortenLink = async function () {
  // Get link from input field
  const value = shortenInput.value.trim();

  // Check for empty value
  if (!value) {
    shortenInputContainer.classList.add("warning");
    return;
  }

  // Remove error text
  shortenInputContainer.classList.remove("warning");

  // Display loader
  loader.style.display = "flex";

  // Fetch results from the API
  const result = await getShortenedLink(value);

  // Remove the loader
  loader.style.display = "none";

  // Add the result to the addedLinks array
  addedLinks.unshift({
    original_link: result.original_link,
    short_link: result.full_short_link,
  });

  // Display the result the result
  const html = displayShortenedLink(
    result.original_link,
    result.full_short_link
  );
  shortenedLinksContainer.insertAdjacentHTML("afterbegin", html);

  // Clear the input field
  shortenInput.value = "";

  // Save to local storage
  updateLocalStorage();
};

// HANDLE COPYING OR DELETING LINKS
const handleCopyAndDelete = function (e) {
  const copyBtn = e.target.closest(".copy");
  const deleteBtn = e.target.closest(".delete");
  const element = e.target.closest(".shorten__results__item");
  let selectedLink;

  if (copyBtn) {
    selectedLink = copyBtn.parentElement.previousElementSibling.textContent;

    navigator.clipboard.writeText(selectedLink).then(() => {
      copyBtn.textContent = "Copied!";
      copyBtn.style.backgroundColor = "hsl(257, 27%, 26%)";
    });
  }

  if (deleteBtn) {
    selectedLink = deleteBtn.parentElement.previousElementSibling.textContent;
    const index = addedLinks.findIndex(
      (link) => link.short_link === selectedLink
    );
    addedLinks.splice(index, 1);
    element.remove();

    updateLocalStorage();
  }
};

// INITIAL FUNCTION
const init = function () {
  if (!addedLinks.length) return;

  // Display saved links
  const html = addedLinks
    .map((link) => displayShortenedLink(link.original_link, link.short_link))
    .join("");

  shortenedLinksContainer.insertAdjacentHTML("beforeend", html);
};

// EVENT LISTENERS

// Open navigation menu on mobile
menuBtn.addEventListener("click", toggleMenu);

// Shorten link on click or on enter key press
shortenBtn.addEventListener("click", shortenLink);
shortenInput.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) shortenLink();
});
// Copy/delete link
shortenedLinksContainer.addEventListener("click", (e) =>
  handleCopyAndDelete(e)
);

// On load
window.addEventListener("load", init);
