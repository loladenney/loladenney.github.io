
const image = document.querySelector('.dragon-img');

// Function to check if the mouse is over the leftmost 100 pixels of the image
function isMouseOverDragonHead(event) {
    const rect = image.getBoundingClientRect(); // Get the position and size of the image
    const mouseX = event.clientX; // Get the X position of the mouse

    // Check if the mouse is in the leftmost 100 pixels
    return mouseX >= rect.left && mouseX <= rect.left + 200;
}

// Change the image on mouse move (while the mouse is over the image)
image.addEventListener('mousemove', function(event) {
    if (isMouseOverDragonHead(event)) {
        image.src = 'assets/dragon_header_eating.png';  // Change to the hover image
        image.style.cursor = 'url(assets/scared_cursor.png), auto';
    } else {
        image.src = 'assets/dragon_header.png';  // Reset to the original image when the mouse moves away
        image.style.cursor = 'url(assets/neutral_cursor.png), auto';
    }
});

image.addEventListener('mouseleave', function() {
    image.src = 'assets/dragon_header.png';  // Revert to the original image when the mouse leaves the image
    image.style.cursor = 'url(assets/neutral_cursor.png), auto';
});