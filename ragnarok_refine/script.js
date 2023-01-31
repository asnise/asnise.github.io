const slideshowImage = document.getElementById("slideshow-image");
let imageIndex = 0;
let images = [];

fetch("/wait/")
  .then(response => response.json())
  .then(fileList => {
    console.log(fileList);
  });


