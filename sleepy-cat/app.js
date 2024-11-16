const img = document.getElementById("img");

// URLs for small and large images from Netlify Images
const smallURL = "/.netlify/images?url=/sleepy-cat.webp&w=100";
const largeURL = "/.netlify/images?url=/sleepy-cat.webp&w=500";

img.addEventListener("click", () => {
  // Check if the image is currently small or large by src
  if (img.src === smallURL) {
    img.src = largeURL;
    img.classList.add("expanded");
  } else {
    img.src = smallURL;
    img.classList.remove("expanded");
  }
});
