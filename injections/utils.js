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
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "8px";
    modalContent.style.textAlign = "center";
    modalContent.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    modalContent.style.position = "relative";

    const closeButton = document.createElement("button");
    closeButton.innerText = "x";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.background = "transparent";
    closeButton.style.border = "none";
    closeButton.style.fontSize = "16px";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", closeCustomModal);

    const modalText = document.createElement("p");
    modalText.innerText = message;

    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalText);
    if (isLoading) {
        const loadingSpinner = document.createElement("div");
        loadingSpinner.id = "loading-spinner";
        loadingSpinner.style.border = "4px solid #f3f3f3";
        loadingSpinner.style.borderTop = "4px solid #3498db";
        loadingSpinner.style.borderRadius = "50%";
        loadingSpinner.style.width = "24px";
        loadingSpinner.style.height = "24px";
        loadingSpinner.style.animation = "spin 2s linear infinite";
        loadingSpinner.style.margin = "20px auto";

        modalContent.appendChild(loadingSpinner);

        const style = document.createElement("style");
        style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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

console.log("All pages script loaded");

// Create the context menu when the content script is loaded
chrome.runtime.sendMessage({ type: 'createContextMenu' });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'highlightText') {
        console.log("Highlighted text:", message.text);

        // Create a custom modal to indicate text is being analyzed
        createCustomModal("Analyzing the selected text...", true);

        // Simulate an API call with a timeout
        setTimeout(() => {
            const isTrue = Math.random() > 0.5; // Randomly decide if true or false
            updateCustomModal(`The analysis result is: ${isTrue ? 'True' : 'False'}`, isTrue);
        }, 3000);
    }
});
