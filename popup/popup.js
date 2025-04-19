// Check if current tab is on LinkedIn jobs page when popup opens
document.addEventListener("DOMContentLoaded", () => {
  checkCurrentPage();
  updateJobCount();
  // Retrieve and set scraping state when popup opens
  checkScrapingState();
});

// Function to check if scraping is in progress
function checkScrapingState() {
  chrome.storage.local.get(["currentlyScraping"], function(result) {
    const isScraping = result.currentlyScraping === true;
    
    if (isScraping) {
      // Update UI to show scraping in progress
      document.getElementById("startButton").disabled = true;
      document.getElementById("startButton").classList.add("hidden");
      document.getElementById("stopButton").classList.remove("hidden");
      document.getElementById("progressBar").style.display = "block";
      
      // Get the last known progress if available
      chrome.storage.local.get(["scrapingProgress"], function(progressData) {
        const progress = progressData.scrapingProgress || 0;
        document.getElementById("progressBar").value = progress;
        document.getElementById("progressLabel").textContent = `${progress}%`;
      });
      
      const statusMessage = document.getElementById("statusMessage");
      statusMessage.textContent = "Scraping in progress...";
    }
  });
}

// Function to check if user is on the right page
function checkCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].url) {
      const isOnLinkedInJobs = tabs[0].url.includes("linkedin.com/jobs");
      const infoBox = document.getElementById("infoBox");
      
      if (!isOnLinkedInJobs) {
        infoBox.style.display = "block";
      } else {
        infoBox.style.display = "none";
      }
    }
  });
}

// Start button functionality
document.getElementById("startButton").addEventListener("click", () => {
  // Update UI for scraping in progress
  document.getElementById("startButton").disabled = true;
  document.getElementById("startButton").classList.add("hidden");
  document.getElementById("stopButton").classList.remove("hidden");
  document.getElementById("progressBar").style.display = "block";
  document.getElementById("progressBar").value = 0;
  document.getElementById("progressLabel").textContent = "0%";
  
  // Reset status message color
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = "Starting job scraping...";
  statusMessage.className = "status-message";

  // Store the scraping state so it persists if popup is closed
  chrome.storage.local.set({
    "currentlyScraping": true,
    "scrapingProgress": 0,
    "scrapingStartTime": new Date().toISOString()
  });

  // Send message to content script to start scraping
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].id) {
      const tabId = tabs[0].id;
      
      // First ping the content script to see if it's loaded
      chrome.tabs.sendMessage(tabId, { action: "ping" }, function(response) {
        if (chrome.runtime.lastError) {
          // Content script might not be loaded or accessible
          console.error("Error pinging content script:", chrome.runtime.lastError);
          showError("Cannot communicate with LinkedIn page. Please refresh the page and try again.");
          
          // Reset UI and scraping state
          document.getElementById("startButton").disabled = false;
          document.getElementById("startButton").classList.remove("hidden");
          document.getElementById("stopButton").classList.add("hidden");
          chrome.storage.local.set({"currentlyScraping": false});
          return;
        }
        
        if (response && response.status === "pong") {
          console.log("Content script responded to ping, starting scrape");
          // Now we can start scraping since we know the content script is loaded
          chrome.tabs.sendMessage(tabId, { action: "startScraping" }, function(startResponse) {
            console.log("Start scraping response:", startResponse);
            // No need to do anything with the response here, the content script will handle it
            // and send messages to update the UI
          });
        } else {
          showError("Failed to start scraping. Please try refreshing the page.");
          // Reset UI and scraping state
          document.getElementById("startButton").disabled = false;
          document.getElementById("startButton").classList.remove("hidden");
          document.getElementById("stopButton").classList.add("hidden");
          chrome.storage.local.set({"currentlyScraping": false});
        }
      });
    } else {
      showError("No active tab found. Please refresh the page and try again.");
      // Reset UI and scraping state
      document.getElementById("startButton").disabled = false;
      document.getElementById("startButton").classList.remove("hidden");
      document.getElementById("stopButton").classList.add("hidden");
      chrome.storage.local.set({"currentlyScraping": false});
    }
  });
});

// Stop button functionality
document.getElementById("stopButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].id) {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { action: "stopScraping" });
      
      // Update UI
      document.getElementById("stopButton").classList.add("hidden");
      document.getElementById("startButton").classList.remove("hidden");
      document.getElementById("startButton").disabled = false;
      document.getElementById("statusMessage").textContent = "Scraping stopped by user";
      
      // Reset scraping state in storage
      chrome.storage.local.set({
        "currentlyScraping": false,
        "scrapingProgress": 0
      });
    }
  });
});

// Search page button
document.getElementById("openSearchPageButton").addEventListener("click", () => {
  const pageURL = chrome.runtime.getURL("search/search-page.html");
  chrome.tabs.create({ url: pageURL });
});

// Export button functionality
document.getElementById("exportButton").addEventListener("click", () => {
  chrome.storage.local.get("jobs", function (result) {
    const jobs = result.jobs || [];
    
    if (jobs.length === 0) {
      showError("No jobs to export. Please scrape some jobs first.");
      return;
    }
    
    // Generate CSV data
    try {
      const csvContent = convertToCSV(jobs);
      downloadCSV(csvContent, "linkedin-jobs-export.csv");
      
      // Show success message
      const statusMessage = document.getElementById("statusMessage");
      statusMessage.textContent = `Successfully exported ${jobs.length} jobs!`;
      statusMessage.className = "status-message success";
    } catch (error) {
      showError(`Failed to export jobs: ${error.message}`);
    }
  });
});

// Help button functionality
document.getElementById("helpButton").addEventListener("click", () => {
  const helpURL = chrome.runtime.getURL("help.html") || 
                 "https://github.com/YOUR-USERNAME/linkedin-scraper/blob/main/README.md";
  chrome.tabs.create({ url: helpURL });
});

// Clear data button
document.getElementById("clearDataButton").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all scraped job data? This cannot be undone.")) {
    chrome.storage.local.remove("jobs", function() {
      updateJobCount();
      const statusMessage = document.getElementById("statusMessage");
      statusMessage.textContent = "All job data cleared successfully";
      statusMessage.className = "status-message";
    });
  }
});

// Helper function to update job count
function updateJobCount() {
  chrome.storage.local.get("jobs", function (result) {
    const jobs = result.jobs || [];
    const jobsCount = jobs.length;
    document.getElementById("searchCount").innerText = "(" + jobsCount + ")";
  });
}

// Update job count when storage changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === "local" && changes.jobs) {
    const newJobs = changes.jobs.newValue || [];
    const jobsCount = newJobs.length;
    document.getElementById("searchCount").innerText = "(" + jobsCount + ")";
  }
});

// Listen for messages from content script or background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Popup received message:', message);
  
  // Handle progress updates
  if (message.action === "progressUpdate" || message.action === "progressPercentage") {
    const progress = message.progress || message.message;
    const progressBar = document.getElementById("progressBar");
    const progressLabel = document.getElementById("progressLabel");
    
    if (progressBar && progressLabel) {
      progressBar.value = progress;
      progressLabel.textContent = `${progress}%`;
      
      // Save progress state so it persists when popup is closed
      chrome.storage.local.set({
        "scrapingProgress": progress
      });
    }
  }
  
  // Handle error messages
  if (message.action === "error") {
    showError(message.message);
    
    // Reset UI if there's an error
    document.getElementById("startButton").disabled = false;
    document.getElementById("startButton").classList.remove("hidden");
    document.getElementById("stopButton").classList.add("hidden");
  }
  
  // Handle scraping completed
  if (message.action === "scrapingComplete") {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message.message;
    statusMessage.className = "status-message success";
    
    // Reset UI when completed
    document.getElementById("startButton").disabled = false;
    document.getElementById("startButton").classList.remove("hidden");
    document.getElementById("stopButton").classList.add("hidden");
    document.getElementById("progressBar").value = 100;
    document.getElementById("progressLabel").textContent = "100%";
    
    // Update job count display
    updateJobCount();
  }
  
  // Handle general status messages
  if (message.action === "popupMessage") {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message.message;
    statusMessage.className = "status-message";
  }
  
  // Handle job count update
  if (message.action === "updateJobCount") {
    document.getElementById("searchCount").innerText = "(" + message.count + ")";
  }
  
  return true;
});

// Helper function to show error messages
function showError(message) {
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = message;
  statusMessage.className = "status-message error";
}

// CSV export functions
function convertToCSV(jobs) {
  // Define CSV headers
  const headers = [
    "Job Title",
    "Company",
    "Location",
    "Posted Since",
    "Number of Applicants",
    "Job Description",
    "LinkedIn Job ID",
    "Link",
    "Scraped At"
  ];
  
  // Create CSV content
  let csvContent = headers.join(",") + "\n";
  
  // Add job data rows
  jobs.forEach(job => {
    const row = [
      escapeCsvValue(job.jobTitle),
      escapeCsvValue(job.company),
      escapeCsvValue(job.jobLocation),
      escapeCsvValue(job.postedSince),
      escapeCsvValue(job.numberOfApplicants),
      escapeCsvValue(job.jobDescription),
      escapeCsvValue(job.linkedinJobId),
      escapeCsvValue(job.link),
      escapeCsvValue(job.scrapedAt)
    ];
    
    csvContent += row.join(",") + "\n";
  });
  
  return csvContent;
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  
  // Convert to string and escape quotes
  const stringValue = String(value);
  const escapedValue = stringValue.replace(/"/g, '""');
  
  // Wrap in quotes if contains comma, newline, or quotes
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes("\"")) {
    return `"${escapedValue}"`;
  }
  
  return escapedValue;
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
