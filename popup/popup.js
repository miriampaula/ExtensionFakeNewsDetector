document.addEventListener('DOMContentLoaded', () => {
  const englishOption = document.getElementById('english-option');
  const multilingualOption = document.getElementById('multilingual-option');

  // Load the current settings
  chrome.storage.sync.get(['languageOption'], (result) => {
    if (result.languageOption === 'multilingual') {
      multilingualOption.checked = true;
    } else {
      englishOption.checked = true;
    }
  });

  // Save the settings when an option is selected
  englishOption.addEventListener('change', () => {
    if (englishOption.checked) {
      chrome.storage.sync.set({ languageOption: 'english' }, () => {
        console.log('Language option set to English');
      });
    }
  });

  multilingualOption.addEventListener('change', () => {
    if (multilingualOption.checked) {
      chrome.storage.sync.set({ languageOption: 'multilingual' }, () => {
        console.log('Language option set to Multilingual');
      });
    }
  });
});
