chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "sendToAPI",
      title: "Send Highlighted Text to API",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToAPI" && info.selectionText) {
      chrome.tabs.sendMessage(tab.id, { type: 'highlightText', text: info.selectionText });
    }
  });
  