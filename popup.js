document.addEventListener("DOMContentLoaded", () => {
  const headingInput = document.getElementById("headingText");
  const infoInput = document.getElementById("infoText");
  const placeholderInput = document.getElementById("placeholderText");
  const hideSelect = document.getElementById("hideElement");
  const saveButton = document.getElementById("saveText");
  const status = document.getElementById("status");

  // Check if current tab is on chatgpt.com
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    if (!url.hostname.includes("chatgpt.com")) {
      // Disable inputs and button if not on chatgpt.com
      headingInput.disabled = true;
      infoInput.disabled = true;
      placeholderInput.disabled = true;
      hideSelect.disabled = true;
      saveButton.disabled = true;

      // Display a warning message
      status.style.display = "block";
      status.textContent = "Make sure you're on chatgpt.com";
      return;
    }

    // Load saved values if on chatgpt.com
    chrome.storage.sync.get(
      ["headingText", "infoText", "placeholderText", "hideElement"],
      (data) => {
        headingInput.value = data.headingText || "សួរស្ដី 🙋🏼";
        infoInput.value =
          data.infoText || "Please don't put too much expectation on me 😔 .";
        placeholderInput.value =
          data.placeholderText || "What's in your brain(🧠)? 🤔";
        hideSelect.value = data.hideElement || "show";
      }
    );

    // Save values and notify content script
    saveButton.addEventListener("click", () => {
      const newHeading = headingInput.value;
      const newInfo = infoInput.value;
      const newPlaceholder = placeholderInput.value;
      const newHideSetting = hideSelect.value;

      chrome.storage.sync.set(
        {
          headingText: newHeading,
          infoText: newInfo,
          placeholderText: newPlaceholder,
          hideElement: newHideSetting,
        },
        () => {
          status.style.display = "block";
          status.textContent = "Settings saved!";
          setTimeout(() => (status.style.display = "none"), 2000);

          // Notify content script
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "updateTexts",
              headingText: newHeading,
              infoText: newInfo,
              placeholderText: newPlaceholder,
              hideElement: newHideSetting,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Content script not available:",
                  chrome.runtime.lastError.message
                );
                status.style.display = "block";
                status.textContent = "Failed to apply changes.";
                setTimeout(() => (status.style.display = "none"), 2000);
              } else {
                console.log("Content script response:", response);
              }
            }
          );
        }
      );
    });
  });
});
