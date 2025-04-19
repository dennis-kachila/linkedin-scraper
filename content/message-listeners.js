<<<<<<< HEAD
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "startScraping") {
    scrapeLinkedInJobs()
      .then((data) => {})
      .catch((err) => {
        console.error(err);
      });
  }

=======
// Console logging to debug start
console.log("LinkedIn Scraper content script loaded", window.location.href);

// Listen for messages from the popup/background
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Message received in content script:", message);
  
  if (message.action === "startScraping") {
    // First check if we're on a LinkedIn jobs page
    const isOnLinkedInPage = window.location.href.includes("linkedin.com");
    const isOnJobsPage = window.location.href.includes("/jobs") || 
                          window.location.href.includes("linkedin.com/jobs") || 
                          document.querySelector('.jobs-search-results') !== null;
    
    if (!isOnLinkedInPage) {
      console.error("Not on LinkedIn page");
      chrome.runtime.sendMessage({
        action: "error",
        message: "Please navigate to a LinkedIn page first"
      });
      sendResponse({ status: "error", message: "Not on LinkedIn page" });
      return true;
    }
    
    if (!isOnJobsPage) {
      console.warn("Not on a typical jobs page, but will attempt to scrape anyway");
      chrome.runtime.sendMessage({
        action: "popupMessage",
        message: "Not on a typical jobs page. Will attempt to scrape anyway."
      });
    }
    
    // Reset the stop flag if it was set previously
    window.stopScraping = false;
    
    // Notify the background script to reset counters
    chrome.runtime.sendMessage({
      action: "startScraping"
    });
    
    // Send initial status message
    chrome.runtime.sendMessage({
      action: "popupMessage",
      message: "Starting LinkedIn job scraper..."
    });
    
    console.log("Starting scrapeLinkedInJobs function");
    
    // Start the scraping process - wrap in try/catch to catch any initialization errors
    try {
      scrapeLinkedInJobs()
        .then((totalJobs) => {
          console.log("Scraping completed successfully", totalJobs);
          // Use the actual count from scraping process
          chrome.runtime.sendMessage({
            action: "scrapingComplete",
            message: `Job scraping completed successfully! Found ${totalJobs || 0} jobs.`,
            jobCount: totalJobs || 0
          });
          sendResponse({ status: "complete", totalJobs: totalJobs });
        })
        .catch((err) => {
          console.error("Scraping error:", err);
          chrome.runtime.sendMessage({
            action: "error",
            message: `Scraping failed: ${err.message || "Unknown error"}`
          });
          sendResponse({ status: "error", error: err.message });
        });
    } catch (initError) {
      console.error("Error initializing scraping:", initError);
      chrome.runtime.sendMessage({
        action: "error",
        message: `Failed to start scraping: ${initError.message || "Unknown error"}`
      });
      sendResponse({ status: "error", error: initError.message });
    }
    
    // Return true to indicate we want to send a response asynchronously
    return true;
  }

  // Add handler for stopping scraping if needed
  if (message.action === "stopScraping") {
    console.log("Received stop scraping message");
    chrome.runtime.sendMessage({
      action: "popupMessage",
      message: "Stopping scraping process..."
    });
    
    // Signal the scraper to stop
    window.stopScraping = true;
    sendResponse({ status: "stopped" });
  }
  
  // Simple ping-pong to check if content script is working
  if (message.action === "ping") {
    console.log("Ping received, sending pong");
    sendResponse({ status: "pong", location: window.location.href });
    return true;
  }

  // Always return true for async response
>>>>>>> super-clean-branch
  return true;
});
