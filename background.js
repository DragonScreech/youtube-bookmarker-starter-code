chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes(".agilixbuzz.com")) {
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
    });
  }
});