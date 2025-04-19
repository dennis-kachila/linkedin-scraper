chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "popupMessage") {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message.message;
    
    // Log the message for debugging
    console.log(`Status update: ${message.message}`);
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "progressPercentage") {
    const progressBar = document.getElementById("progressBar");

    // Check if the element is hidden
    if (getComputedStyle(progressBar).display === "none") {
      progressBar.style.display = "block"; // Display the element
    }

    progressBar.value = message.message;
    progressBar.textContent = message.message + "%";
    
    // Update title to show progress
    document.title = `LinkedIn Scraper (${message.message}%)`;
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "error") {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = `Error: ${message.message}`;
    statusMessage.style.color = "#e74c3c"; // Red color for errors
    
    // Log the error for debugging
    console.error(`Error: ${message.message}`);
    
    // Re-enable start button to allow retrying
    const startButton = document.getElementById("startButton");
    if (startButton) {
      startButton.disabled = false;
      startButton.classList.remove("hidden");
    }
    
    // Hide stop button
    const stopButton = document.getElementById("stopButton");
    if (stopButton) {
      stopButton.classList.add("hidden");
    }
  }
});

// Add listener for job count updates
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "updateJobCount") {
    const searchCount = document.getElementById("searchCount");
    if (searchCount) {
      searchCount.textContent = `(${message.count})`;
    }
  }
});

// Add listener for scraping completion
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "scrapingComplete") {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message.message;
    statusMessage.style.color = "#2ecc71"; // Green color for success
    
    // Re-enable start button
    const startButton = document.getElementById("startButton");
    if (startButton) {
      startButton.disabled = false;
      startButton.classList.remove("hidden");
    }
    
    // Hide stop button
    const stopButton = document.getElementById("stopButton");
    if (stopButton) {
      stopButton.classList.add("hidden");
    }
    
    // Update search count to reflect new jobs
    // Use the provided job count if available, otherwise request it
    if (message.totalJobsStored !== undefined) {
      const searchCount = document.getElementById("searchCount");
      if (searchCount) {
        searchCount.textContent = `(${message.totalJobsStored})`;
      }
    } else {
      chrome.runtime.sendMessage({ action: "getJobCount" }, function(response) {
        if (response && response.count !== undefined) {
          const searchCount = document.getElementById("searchCount");
          if (searchCount) {
            searchCount.textContent = `(${response.count})`;
          }
        }
      });
    }
  }
});

