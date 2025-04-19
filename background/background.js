<<<<<<< HEAD
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "job") {
    chrome.storage.local.get('jobs', function (result) {
      const existingJobs = result.jobs || [];
      const newJobs = [...existingJobs, message.message];
      chrome.storage.local.set({ jobs: newJobs });
    });
  }
=======
// Constants
const STORAGE_LIMIT_BUFFER = 4.5 * 1024 * 1024; // 4.5MB limit for Chrome storage (5MB limit with buffer)
const MAX_ERROR_RETRY = 3;

// Track errors for retry logic
let errorCounter = 0;
let jobsProcessed = 0;
let totalJobsScraping = 0;

// Helper to check storage size
async function getStorageSize() {
  return new Promise((resolve) => {
    chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
      resolve(bytesInUse);
    });
  });
}

// Handle storage cleanup if needed
async function ensureStorageSpace() {
  const bytesInUse = await getStorageSize();
  
  // If we're approaching the limit, remove older jobs
  if (bytesInUse > STORAGE_LIMIT_BUFFER) {
    console.warn(`Storage space running low: ${bytesInUse} bytes used`);
    
    return new Promise((resolve) => {
      chrome.storage.local.get('jobs', function(result) {
        const jobs = result.jobs || [];
        
        if (jobs.length > 50) {
          // Keep the 50 most recent jobs
          const newJobs = jobs.slice(-50);
          chrome.storage.local.set({ jobs: newJobs }, resolve);
          console.info(`Reduced jobs from ${jobs.length} to ${newJobs.length} to save storage space`);
        } else {
          // If less than 50 jobs, just clear older data that might be unused
          chrome.storage.local.remove(['oldLogs', 'tempData'], resolve);
        }
      });
    });
  }
  
  return Promise.resolve();
}

// Process and store job data
async function processJobData(job) {
  try {
    // Ensure we have space to store data
    await ensureStorageSpace();
    
    // Get existing jobs
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('jobs', function(result) {
        try {
          const existingJobs = result.jobs || [];
          
          // Check if this job already exists (avoid duplicates)
          const isDuplicate = existingJobs.some(existingJob => 
            existingJob.linkedinJobId === job.linkedinJobId && job.linkedinJobId !== "unknown" && job.linkedinJobId !== "error"
          );
          
          if (isDuplicate) {
            console.log(`Job ID ${job.linkedinJobId} already exists, skipping`);
            return resolve(false);
          }
          
          // Add timestamp if not present
          if (!job.scrapedAt) {
            job.scrapedAt = new Date().toISOString();
          }
          
          // Store the new job
          const newJobs = [...existingJobs, job];
          chrome.storage.local.set({ jobs: newJobs }, () => {
            if (chrome.runtime.lastError) {
              console.error(`Storage error: ${chrome.runtime.lastError.message}`);
              reject(chrome.runtime.lastError);
            } else {
              // Increment successfully processed jobs counter
              jobsProcessed++;
              
              // Update search count in the popup immediately
              updateJobCountDisplay(newJobs.length);
              
              resolve(true);
            }
          });
        } catch (err) {
          console.error('Error processing job data:', err);
          reject(err);
        }
      });
    });
  } catch (err) {
    console.error('Error in processJobData:', err);
    return false;
  }
}

// Update job count display in the popup
function updateJobCountDisplay(count) {
  chrome.runtime.sendMessage({
    action: "updateJobCount",
    count: count
  });
}

// Reset counters when starting a new scraping session
function resetScrapingCounters() {
  jobsProcessed = 0;
  totalJobsScraping = 0;
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Handle job data
  if (message.action === "job") {
    processJobData(message.message)
      .then(isNewJob => {
        if (chrome.runtime.lastError) {
          console.error(`Error processing job: ${chrome.runtime.lastError.message}`);
          errorCounter++;
          
          // If too many errors, notify user
          if (errorCounter > MAX_ERROR_RETRY) {
            chrome.runtime.sendMessage({
              action: "error",
              message: "Too many storage errors. Try clearing some jobs."
            });
          }
        } else if (isNewJob) {
          // Reset error counter on success
          errorCounter = 0;
        }
      })
      .catch(err => {
        console.error('Job processing failed:', err);
      });
    
    return true;
  }
  
  // Handle scraping start and reset counters
  if (message.action === "startScraping") {
    resetScrapingCounters();
    return true;
  }
  
  // Forward popup messages
  if (message.action === "popupMessage" || message.action === "progressPercentage" || 
      message.action === "error") {
    chrome.runtime.sendMessage(message);
    return true;
  }
  
  // Handle scraping completion with job count
  if (message.action === "scrapingComplete") {
    // Get the final count to update the message
    chrome.storage.local.get('jobs', function(result) {
      const totalJobs = result.jobs ? result.jobs.length : 0;
      
      // Create updated message with correct count
      const updatedMessage = {
        action: "scrapingComplete",
        message: `Job scraping completed successfully! Found ${jobsProcessed} jobs`,
        jobCount: jobsProcessed,
        totalJobsStored: totalJobs
      };
      
      // Send updated completion message
      chrome.runtime.sendMessage(updatedMessage);
      
      // Also update the search count
      updateJobCountDisplay(totalJobs);
    });
    
    return true;
  }
  
  // Return true for async responses
  return true;
});

// Export jobs to CSV when requested
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "exportJobs") {
    chrome.storage.local.get('jobs', function(result) {
      try {
        const jobs = result.jobs || [];
        sendResponse({ success: true, jobs: jobs });
      } catch (error) {
        console.error("Export error:", error);
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; // Indicates async response
  }
  
  // Handle request for job count
  if (message.action === "getJobCount") {
    chrome.storage.local.get('jobs', function(result) {
      const count = result.jobs ? result.jobs.length : 0;
      sendResponse({ count: count });
    });
    return true; // Indicates async response
  }
  
  // Handle clearing job data
  if (message.action === "clearJobs") {
    chrome.storage.local.set({ jobs: [] }, function() {
      sendResponse({ success: true });
      updateJobCountDisplay(0);
    });
    return true; // Indicates async response
  }
>>>>>>> super-clean-branch
});
