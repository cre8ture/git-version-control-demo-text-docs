const loadButton = document.getElementById('load-button');
const textArea = document.getElementById('text-area');
const sidePanel = document.getElementById('side-panel');

// Create a hidden file input element
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.style.display = 'none';

// Append the file input to the body (or any other parent element)
document.body.appendChild(fileInput);

loadButton.addEventListener('click', () => {
    // Trigger the file input's click event
    fileInput.click();
  });
fileInput.addEventListener('change', () => {
  const selectedFile = fileInput.files[0];
  
  if (selectedFile) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      textArea.value = event.target.result; // Set textarea value to file content
    };
    
    reader.readAsText(selectedFile); // Read the file as text
  }
});

// // Toggle the side panel
// document.addEventListener('click', (event) => {
//   if (event.target === sidePanel) {
//     sidePanel.classList.remove('open');
//   }
// });

// textArea.addEventListener('focus', () => {
//   sidePanel.classList.remove('open');
// });

// document.addEventListener('click', (event) => {
//   if (event.target === loadButton) {
//     sidePanel.classList.toggle('open');
//   }
// });