console.log("YouTube script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'highlightText') {
    console.log("Highlighted text:", message.text);

    // Fetch the stored setting
    chrome.storage.sync.get(['languageOption'], async (result) => {
      const useMultilingual = result.languageOption === 'multilingual';
      const apiUrl = 'http://localhost:5000/api/truth'; // Same URL for both cases
      const selectedLanguage = useMultilingual ? 'Multilingual' : 'English';

      // Create a custom modal to indicate text is being analyzed
      createCustomModal(`Analyzing the selected text... (Language: ${selectedLanguage})`, true);

      try {
        // Prepare the body of the request
        const requestBody = useMultilingual ? { text: message.text, language: 'multilingual' } : { text: message.text, language: 'english' };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        const isTrue = result.model_response === 'true';
        updateCustomModal(`The analysis result is: ${isTrue ? 'True' : 'False'} (Language: ${selectedLanguage})`, isTrue);

        // Close the modal after 2 seconds
        setTimeout(() => {
          closeCustomModal();
        }, 2000);

      } catch (error) {
        console.error('Error fetching accuracy:', error);
        updateCustomModal('Error analyzing the text.', false);
      }
    });
  }
});

function createCustomModal(message, isLoading) {
  const existingModal = document.getElementById("custom-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "custom-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "10000";

  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.padding = "30px";
  modalContent.style.borderRadius = "10px";
  modalContent.style.textAlign = "center";
  modalContent.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
  modalContent.style.position = "relative";
  modalContent.style.maxWidth = "400px";
  modalContent.style.width = "90%";
  modalContent.style.animation = "fadeIn 0.3s ease";

  const closeButton = document.createElement("button");
  closeButton.innerText = "×";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.background = "transparent";
  closeButton.style.border = "none";
  closeButton.style.fontSize = "24px";
  closeButton.style.cursor = "pointer";
  closeButton.style.color = "#888";
  closeButton.addEventListener("click", closeCustomModal);

  const modalText = document.createElement("p");
  modalText.innerText = message;
  modalText.style.fontSize = "18px";
  modalText.style.color = "#333";
  modalText.style.marginBottom = "20px";

  modalContent.appendChild(closeButton);
  modalContent.appendChild(modalText);
  if (isLoading) {
    const loadingSpinner = document.createElement("div");
    loadingSpinner.id = "loading-spinner";
    loadingSpinner.style.border = "4px solid #f3f3f3";
    loadingSpinner.style.borderTop = "4px solid #3498db";
    loadingSpinner.style.borderRadius = "50%";
    loadingSpinner.style.width = "40px";
    loadingSpinner.style.height = "40px";
    loadingSpinner.style.animation = "spin 1s linear infinite";
    loadingSpinner.style.margin = "20px auto";

    modalContent.appendChild(loadingSpinner);

    const style = document.createElement("style");
    style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    `;
    document.head.appendChild(style);
  }

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function updateCustomModal(message, isTrue) {
  const modal = document.getElementById("custom-modal");
  if (modal) {
    const modalText = modal.querySelector("p");
    if (modalText) {
      modalText.innerText = message;
    }

    const loadingSpinner = modal.querySelector("#loading-spinner");
    if (loadingSpinner) {
      loadingSpinner.remove();
    }

    const resultIcon = document.createElement("div");
    resultIcon.style.margin = "20px auto";
    resultIcon.style.fontSize = "48px";
    resultIcon.innerHTML = isTrue ? "&#10003;" : "&#10007;"; // Check mark or cross
    resultIcon.style.color = isTrue ? "green" : "red";
    modalText.appendChild(resultIcon);
  }
}

function closeCustomModal() {
  const modal = document.getElementById("custom-modal");
  if (modal) {
    modal.remove();
  }
}
