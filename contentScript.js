const modifyElementText = (selector, newText) => {
  const element = document.querySelector(selector);
  if (element && element.textContent !== newText) {
    element.textContent = newText;
  }
};

const hideOrShowElement = (selector, action) => {
  const element = document.querySelector(selector);
  if (element) {
    element.style.display = action === "hide" ? "none" : "";
  }
};

const updatePlaceholderCSS = (newPlaceholder) => {
  let styleTag = document.getElementById("dynamic-placeholder-style");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "dynamic-placeholder-style";
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = `
    p.placeholder::after {
      --tw-content: "${newPlaceholder}" !important;
      content: var(--tw-content) !important;
    }
  `;
};

const applyModifications = (settings) => {
  modifyElementText(
    "h1[style*='--vt-splash-screen-headline']",
    settings.headingText || "សួរស្ដី 🙋🏼"
  );

  modifyElementText(
    "div.w-full.text-center.text-xs.text-token-text-secondary div div",
    settings.infoText || "Please don't put too much expectation on me 😔 ."
  );

  updatePlaceholderCSS(
    settings.placeholderText || "What's in your brain(🧠)? 🤔"
  );

  hideOrShowElement(
    "div.flex.flex-col.py-2.empty\\:hidden.dark\\:border-white\\/20",
    settings.hideElement || "show"
  );
};

const observeDOMChanges = () => {
  if (!document.body) {
    setTimeout(observeDOMChanges, 100);
    return;
  }

  const observer = new MutationObserver(() => {
    chrome.storage.sync.get(
      ["headingText", "infoText", "placeholderText", "hideElement"],
      (settings) => {
        applyModifications(settings);
      }
    );
  });

  observer.observe(document.body, { childList: true, subtree: true });

  chrome.storage.sync.get(
    ["headingText", "infoText", "placeholderText", "hideElement"],
    (settings) => {
      applyModifications(settings);
    }
  );
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateTexts") {
    applyModifications(message);
    sendResponse({ status: "Texts updated!" });
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", observeDOMChanges);
} else {
  observeDOMChanges();
}
