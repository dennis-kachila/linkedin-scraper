function sendJob(job) {
  chrome.runtime.sendMessage({ action: "job", message: job });
}

function sendMessageToPopup(message) {
  chrome.runtime.sendMessage({ action: "popupMessage", message: message });
}

function sendProgressPercentage(progressPercentage) {
  chrome.runtime.sendMessage({
    action: "progressPercentage",
    message: progressPercentage,
  });
}

<<<<<<< HEAD
function simulateRealScrollToEnd(element, duration) {
  const startScrollTop = element.scrollTop;
  const endScrollTop = element.scrollHeight - element.clientHeight;
=======
function sendErrorToPopup(error) {
  chrome.runtime.sendMessage({
    action: "error",
    message: error,
  });
}

function simulateRealScrollToEnd(element, duration) {
  const startScrollTop = element.scrollTop;
  // Removed endScrollTop calculation from here
>>>>>>> super-clean-branch

  const startTime = performance.now();
  const endTime = startTime + duration;

  function scrollStep(timestamp) {
<<<<<<< HEAD
=======
    // Calculate endScrollTop here so it's updated on each scroll step
    const endScrollTop = element.scrollHeight - element.clientHeight;
    
>>>>>>> super-clean-branch
    const currentTime = Math.min(timestamp, endTime);
    const elapsedTime = currentTime - startTime;
    const scrollFraction = elapsedTime / duration;
    const scrollTop =
      startScrollTop + (endScrollTop - startScrollTop) * scrollFraction;

    element.scrollTop = scrollTop;

    if (currentTime < endTime) {
      window.requestAnimationFrame(scrollStep);
    }
  }

  window.requestAnimationFrame(scrollStep);
}

async function scrapeJobDetails(card) {
<<<<<<< HEAD
  card.click();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const jobTitle = document.querySelector(
    ".job-details-jobs-unified-top-card__job-title"
  ).innerText;

  const jobLocation =
    document.querySelector(".job-details-jobs-unified-top-card__bullet")
      ?.textContent || "";

  const company = document.querySelector(
    ".job-details-jobs-unified-top-card__primary-description-without-tagline .app-aware-link"
  ).innerText;

  const numberOfApplicants = document.querySelector(
    ".tvm__text.tvm__text"
  )?.textContent;

  const postedSince = document.querySelector(
    ".job-details-jobs-unified-top-card__primary-description-without-tagline.mb2"
  )?.children[5].textContent;

  const jobDescription = document.querySelector(
    ".jobs-description-content__text"
  ).innerText;

  const linkedinJobId = window.location.href
    .split("currentJobId=")[1]
    .split("&")[0];

  const link = `https://www.linkedin.com/jobs/search/?currentJobId=${linkedinJobId}`;

  return {
    linkedinJobId,
    link,
    jobTitle,
    company,
    numberOfApplicants,
    jobLocation,
    postedSince,
    jobDescription,
  };
}

async function changePage(pageNumber) {
  // click button
  const pageButton = document.querySelector(
    `button[aria-label="Page ${pageNumber}"]`
  );
  pageButton.click();

  // give some time for page loading
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

async function scrapeLinkedInJobs() {
  const pageCountElements = [
    ...document.querySelectorAll(".artdeco-pagination__indicator"),
  ];

  const pageCount =
    pageCountElements.length > 0
      ? parseInt(
          pageCountElements[pageCountElements.length - 1].textContent.trim()
        )
      : 1;

  sendMessageToPopup(`Page Count: ${pageCount}`);

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const cardsListElement = document.querySelector(
      ".jobs-search-results-list"
    );
    await scrollProgressively();
    const cards = document.querySelectorAll(".job-card-container");

    const cardCount = cards.length;
    sendMessageToPopup(`Card Count: ${cardCount}`);

    for (let cardIndex = 0; cardIndex < cardCount; cardIndex++) {
      sendMessageToPopup(
        `Card (${cardIndex + 1}/${cardCount}) of page ${
          pageIndex + 1
        }/${pageCount}`
      );

      const jobDetails = await scrapeJobDetails(cards[cardIndex]);

      sendJob(jobDetails);

      const cardProgressPercentage = Math.round(
        ((cardIndex + 1) / cardCount) * 100
      );

      const pageProgressPercentage = Math.round((pageIndex / pageCount) * 100);

      const overallProgressPercentage = Math.round(
        pageProgressPercentage + cardProgressPercentage / pageCount
      );

      sendProgressPercentage(overallProgressPercentage);
    }

    if (pageIndex < pageCount - 1) {
      await changePage(pageIndex + 2);
    }
=======
  try {
    sendMessageToPopup("Clicking job card and waiting for details to load...");
    card.click();

    // Wait longer for job details to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Try multiple possible selectors for job title with updated selectors
    let jobTitle = "";
    const titleSelectors = [
      // Updated selectors based on the HTML structure
      "h1.t-24.t-bold.inline a", // Job title
      ".jobs-details__main-title", // Alternative job title selector
      // Other selectors can remain unchanged
      // Original selectors
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title",
      ".jobs-details-top-card__job-title",
      "h2.t-24", // Generic approach looking for heading with LinkedIn's title class
      ".jobs-unified-top-card__content h2",
      ".jobs-unified-top-card__title",
      // Added selectors for 2025 LinkedIn interface
      "h2.artdeco-typography--title",
      ".job-details-jobs-unified-top-card__job-title-link",
      ".jobs-unified-top-card__job-title-link",
      "h2[data-test-job-title]",
      ".job-view-title h2",
      ".jobs-details__main-title"
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobTitle = element.textContent.trim();
        break;
      }
    }

    if (!jobTitle) {
      // Try to find job title in page title
      const pageTitle = document.title || "";
      if (pageTitle.includes(" | ")) {
        jobTitle = pageTitle.split(" | ")[0].trim();
      } else {
        jobTitle = "Job Title Not Found";
        sendMessageToPopup("Warning: Job title not found");
      }
    }

    // Try multiple possible selectors for job location with updated selectors
    let jobLocation = "";
    const locationSelectors = [
      // Updated selectors based on the HTML structure
      ".job-details-jobs-unified-top-card__primary-description-container .tvm__text", // Job location
      ".jobs-unified-top-card__company-location", // Alternative location selector
      // Other selectors can remain unchanged
      // Original selectors
      ".job-details-jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__workplace-type",
      ".jobs-unified-top-card__subtitle-primary .jobs-unified-top-card__location",
      ".jobs-unified-top-card__metadata-container .jobs-unified-top-card__workplace-type",
      ".jobs-unified-top-card__subtitle-primary span[class*='location']",
      // Added selectors for 2025 LinkedIn interface
      ".jobs-unified-top-card__company-location",
      ".job-details-jobs-unified-top-card__primary-description span[class*='location']",
      ".job-details-jobs-unified-top-card__workplace-type",
      "span[class*='location']",
      ".jobs-company__location"
    ];

    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobLocation = element.textContent.trim();
        break;
      }
    }

    // Try to find any span that might contain location info
    if (!jobLocation) {
      const locationKeywords = ['remote', 'hybrid', 'on-site', 'kenya', 'nairobi', 'location'];
      const spans = document.querySelectorAll('span');
      
      for (const span of spans) {
        const text = span.textContent.toLowerCase().trim();
        if (text && locationKeywords.some(keyword => text.includes(keyword.toLowerCase()))) {
          jobLocation = span.textContent.trim();
          break;
        }
      }
    }

    // Try multiple possible selectors for company name with updated selectors
    let company = "";
    const companySelectors = [
      // Updated selectors based on the HTML structure
      ".job-details-jobs-unified-top-card__company-name a", // Company name
      ".jobs-unified-top-card__company-name",
      // Other selectors can remain unchanged
      // Original selectors
      ".job-details-jobs-unified-top-card__primary-description-without-tagline .app-aware-link",
      ".jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name a",
      ".jobs-unified-top-card__subtitle-primary a",
      ".jobs-unified-top-card__company-name span",
      ".jobs-unified-top-card__subtitle-primary span a",
      // Added selectors for 2025 LinkedIn interface
      "a[data-test-company-name]",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__subtitle-primary a[data-control-name='company_link']",
      "a.job-details-jobs-unified-top-card__company-link",
      ".jobs-company__name"
    ];

    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        company = element.textContent.trim();
        break;
      }
    }

    // If no company found through selectors, try to find it in the page title
    if (!company) {
      const pageTitle = document.title || "";
      const titleParts = pageTitle.split(" | ");
      if (titleParts.length > 1) {
        company = titleParts[1].trim();
      } else {
        company = "Company Not Found";
        sendMessageToPopup("Warning: Company name not found");
      }
    }

    // Try multiple possible selectors for number of applicants with updated selectors
    let numberOfApplicants = "";
    const applicantsSelectors = [
      // Original selectors
      ".tvm__text.tvm__text",
      ".jobs-unified-top-card__applicant-count",
      ".jobs-details-job-summary__text--ellipsis",
      ".jobs-unified-top-card__subtitle-secondary .jobs-unified-top-card__applicant-count",
      "span[class*='applicant-count']",
      ".jobs-company__box span:not([class])",
      // Added selectors for 2025 LinkedIn interface
      "span.job-details-jobs-unified-top-card__applicant-count",
      ".job-details-jobs-unified-top-card__subtitle-secondary span",
      "span[data-test-applicant-count]",
      ".jobs-unified-top-card__applicant-count-bullet",
      ".jobs-details__applicant-count"
    ];

    for (const selector of applicantsSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        const text = element.textContent.trim();
        if (text.includes("applicant") || text.match(/\d+/)) {
          numberOfApplicants = text;
          break;
        }
      }
    }

    // Posted since information - try multiple approaches with updated selectors
    let postedSince = "";
    try {
      const postedSinceSelectors = [
        // Original selectors
        ".job-details-jobs-unified-top-card__primary-description-without-tagline.mb2 > span:last-child",
        ".jobs-unified-top-card__posted-date",
        ".jobs-unified-top-card__subtitle-secondary .jobs-unified-top-card__posting-date",
        ".posted-time-ago__text",
        ".jobs-unified-top-card__subtitle-secondary span:not([class])",
        "span[class*='posted-time']",
        // Added selectors for 2025 LinkedIn interface
        "span.job-details-jobs-unified-top-card__posted-date",
        ".job-details-jobs-unified-top-card__subtitle-secondary span:last-child",
        ".jobs-unified-top-card__posted-date",
        "span[data-test-posted-date]",
        "span.job-search-card__listdate",
        ".job-card-container__metadata-item--posted-date"
      ];

      for (const selector of postedSinceSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          postedSince = element.textContent.trim();
          break;
        }
      }
      
      // Try to find any span that might contain date/time info
      if (!postedSince) {
        const dateKeywords = ['posted', 'ago', 'day', 'week', 'month', 'hour', 'minute'];
        const spans = document.querySelectorAll('span');
        
        for (const span of spans) {
          const text = span.textContent.toLowerCase().trim();
          if (text && dateKeywords.some(keyword => text.includes(keyword.toLowerCase()))) {
            postedSince = span.textContent.trim();
            break;
          }
        }
      }
    } catch (e) {
      postedSince = "Not available";
    }

    // Job description - try multiple possible selectors with updated selectors
    let jobDescription = "";
    const descriptionSelectors = [
      // Original selectors
      ".jobs-description-content__text",
      ".jobs-box__html-content",
      ".jobs-description__content",
      ".jobs-description .jobs-description-content",
      "#job-details span",
      // Added selectors for 2025 LinkedIn interface
      ".jobs-description",
      ".jobs-description__container",
      ".jobs-description-content",
      "div[data-test-job-description]",
      "#job-details",
      ".job-view-layout [class*='jobs-description']",
      ".display-flex.mt5 .jobs-box__html-content"
    ];

    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobDescription = element.textContent.trim();
        break;
      }
    }

    if (!jobDescription) {
      // Try to find any large text block that might be the job description
      const possibleDescriptionElements = document.querySelectorAll('.jobs-description p, .jobs-description div, .jobs-description span, [class*="description"] p, [class*="description"] div');
      if (possibleDescriptionElements.length > 0) {
        for (const element of possibleDescriptionElements) {
          if (element.textContent.trim().length > 100) { // If text is substantial
            jobDescription = element.textContent.trim();
            break;
          }
        }
      }
      
      if (!jobDescription) {
        // Search for any div with substantial text that might be a job description
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
          const text = div.textContent.trim();
          if (text.length > 200 && !div.querySelector('div')) { // Only leaf nodes with substantial text
            jobDescription = text;
            break;
          }
        }
        
        if (!jobDescription) {
          jobDescription = "Job description not available";
          sendMessageToPopup("Warning: Job description not found");
        }
      }
    }

    // Extract job ID from URL more robustly
    let linkedinJobId = "";
    try {
      const url = window.location.href;
      // Try different URL patterns
      if (url.includes("currentJobId=")) {
        linkedinJobId = url.split("currentJobId=")[1].split("&")[0];
      } else if (url.includes("/view/")) {
        linkedinJobId = url.split("/view/")[1].split("/")[0];
      } else if (url.match(/\d{10}/)) {
        // Extract 10-digit number that might be the job ID
        linkedinJobId = url.match(/\d{10}/)[0];
      }
      
      // Try to get job ID from data attributes if URL extraction fails
      if (!linkedinJobId) {
        const jobIdElement = document.querySelector('[data-job-id]');
        if (jobIdElement) {
          linkedinJobId = jobIdElement.getAttribute('data-job-id');
        }
      }
    } catch (e) {
      linkedinJobId = "unknown";
      sendMessageToPopup("Warning: Could not extract job ID from URL");
    }

    const link = linkedinJobId ? 
      `https://www.linkedin.com/jobs/search/?currentJobId=${linkedinJobId}` : 
      window.location.href;

    return {
      linkedinJobId,
      link,
      jobTitle,
      company,
      numberOfApplicants,
      jobLocation,
      postedSince,
      jobDescription,
      scrapedAt: new Date().toISOString()
    };
  } catch (error) {
    sendErrorToPopup(`Error scraping job details: ${error.message}`);
    // Return partial data even if there was an error
    return {
      linkedinJobId: "error",
      link: window.location.href,
      jobTitle: "Error while scraping",
      company: "Error while scraping",
      numberOfApplicants: "",
      jobLocation: "",
      postedSince: "",
      jobDescription: `Error occurred: ${error.message}`,
      scrapedAt: new Date().toISOString(),
      error: true
    };
  }
}

async function changePage(pageNumber) {
  try {
    sendMessageToPopup(`Trying to navigate to page ${pageNumber}...`);
    
    // Try to find the pagination button with multiple selector patterns
    const selectors = [
      `button[aria-label="Page ${pageNumber}"]`,
      `li[data-test-pagination-page-btn="${pageNumber}"] button`,
      `.artdeco-pagination__button--${pageNumber}`,
      `.artdeco-pagination__indicator--number:nth-child(${pageNumber}) button`
    ];
    
    let pageButton = null;
    for (const selector of selectors) {
      pageButton = document.querySelector(selector);
      if (pageButton) break;
    }
    
    if (!pageButton) {
      sendMessageToPopup(`Warning: Could not find page ${pageNumber} button`);
      return false;
    }
    
    pageButton.click();
    sendMessageToPopup(`Clicked page ${pageNumber}, waiting for it to load...`);
    
    // Wait longer for page to load - LinkedIn can be slow sometimes
    await new Promise((resolve) => setTimeout(resolve, 4000));
    return true;
  } catch (error) {
    sendErrorToPopup(`Error navigating to page ${pageNumber}: ${error.message}`);
    return false;
  }
}

async function scrapeLinkedInJobs() {
  try {
    console.log("Starting LinkedIn job scraping...");
    sendMessageToPopup("Starting LinkedIn job scraping...");
    
    // Debug info about page
    console.log("Current URL:", window.location.href);
    console.log("Document title:", document.title);
    
    // Look for pagination elements with updated selectors
    let pageCountElements = [];
    const paginationSelectors = [
      ".artdeco-pagination__indicator",
      ".artdeco-pagination__pages--number li",
      ".jobs-search-results-list__pagination li",
      // Add selectors for 2025 LinkedIn interface
      ".artdeco-pagination__indicator--number",
      ".artdeco-pagination__indicator.artdeco-pagination__indicator--number",
      // Additional selectors that might work in newer versions
      ".jobs-search-two-pane__pagination li",
      "[data-test-pagination-page-btn]",
      ".jobs-search-results__pagination button"
    ];
    
    for (const selector of paginationSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`Testing pagination selector ${selector}: found ${elements.length} elements`);
      if (elements.length > 0) {
        pageCountElements = [...elements];
        console.log(`Using pagination selector: ${selector}`);
        break;
      }
    }

    // If no pagination found, default to 1 page
    const pageCount = pageCountElements.length > 0
      ? parseInt(pageCountElements[pageCountElements.length - 1].textContent.trim()) || 1
      : 1;
    
    console.log(`Found ${pageCount} page(s) of job listings`);
    sendMessageToPopup(`Found ${pageCount} page(s) of job listings`);
    
    // Initialize total job counter
    let totalJobsScraped = 0;

    // Process each page
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      // Check if scraping should stop
      if (window.stopScraping) {
        sendMessageToPopup("Scraping stopped as requested");
        break;
      }

      sendMessageToPopup(`Processing page ${pageIndex + 1} of ${pageCount}`);
      
      // Try to find job list container with updated selectors
      let jobListContainer = null;
      const containerSelectors = [
        // Original selectors
        ".jobs-search-results-list",
        ".jobs-search-results__list",
        ".scaffold-layout__list-container",
        ".jobs-search__results-list",
        // Added selectors for 2025 LinkedIn interface
        ".jobs-search-results-container",
        "div.scaffold-layout__list",
        "ul.jobs-search-results__list",
        "main.scaffold-layout__main" // Parent container that may contain the list
      ];
      
      for (const selector of containerSelectors) {
        jobListContainer = document.querySelector(selector);
        if (jobListContainer) break;
      }
      
      if (!jobListContainer) {
        sendMessageToPopup("Warning: Could not find job list container. Using document body as fallback.");
        // Fallback to document.body if no container found
        jobListContainer = document.body;
      }
      
      // Scroll to load all jobs on this page
      await scrollProgressively();
      
      // Try different selectors for job cards with updated selectors
      let cards = [];
      const cardSelectors = [
        // Original selectors
        ".job-card-container",
        ".jobs-search-results__list-item",
        ".jobs-search-two-pane__job-card-container",
        ".occludable-update",
        // Added selectors for 2025 LinkedIn interface
        "li.jobs-search-results__list-item",
        "div.job-card-container",
        "div.job-card-list__entity-lockup",
        "div[data-job-id]", // Some job cards have data-job-id attribute
        "div.jobs-search-results__list-item" // Generic class name
      ];
      
      for (const selector of cardSelectors) {
        cards = document.querySelectorAll(selector);
        if (cards.length > 0) {
          sendMessageToPopup(`Found ${cards.length} job cards using selector: ${selector}`);
          break;
        }
      }
      
      // Try a more generic approach if no cards found using predefined selectors
      if (cards.length === 0) {
        // Look for elements that might be job cards based on common patterns
        const possibleCards = document.querySelectorAll('div[class*="job-card"], li[class*="job"], div[data-job-id]');
        if (possibleCards.length > 0) {
          cards = possibleCards;
          sendMessageToPopup(`Found ${cards.length} job cards using generic approach`);
        } else {
          sendErrorToPopup("No job cards found on this page. LinkedIn's page structure may have changed.");
          continue;
        }
      }
      
      const cardCount = cards.length;
      
      sendMessageToPopup(`Found ${cardCount} job card(s) on this page`);
      
      // Process each job card
      for (let cardIndex = 0; cardIndex < cardCount; cardIndex++) {
        // Check if scraping should stop
        if (window.stopScraping) {
          sendMessageToPopup("Scraping stopped as requested");
          break;
        }

        sendMessageToPopup(
          `Processing job ${cardIndex + 1}/${cardCount} on page ${pageIndex + 1}/${pageCount}`
        );
        
        try {
          const jobDetails = await scrapeJobDetails(cards[cardIndex]);
          
          // Store job in Chrome storage
          sendJob(jobDetails);
          totalJobsScraped++;
          
          // Calculate progress for better user feedback
          const cardProgressPercentage = Math.round(((cardIndex + 1) / cardCount) * 100);
          const pageProgressPercentage = Math.round((pageIndex / pageCount) * 100);
          const overallProgressPercentage = Math.round(
            pageProgressPercentage + (cardProgressPercentage / pageCount)
          );
          
          sendProgressPercentage(overallProgressPercentage);
          sendMessageToPopup(`Total jobs scraped so far: ${totalJobsScraped}`);
          
          // Add a short delay between each job to avoid overloading
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          sendErrorToPopup(`Error processing job card ${cardIndex + 1}: ${error.message}`);
        }
      }
      
      // Navigate to next page if not on the last page
      if (pageIndex < pageCount - 1) {
        const navigatedSuccessfully = await changePage(pageIndex + 2);
        if (!navigatedSuccessfully) {
          sendMessageToPopup("Could not navigate to next page, stopping pagination");
          break;
        }
      }
    }
    
    sendMessageToPopup(`Scraping completed. Total jobs scraped: ${totalJobsScraped}`);

    // Final update to signal completion
    chrome.runtime.sendMessage({
      action: "scrapingComplete",
      message: `Job scraping completed successfully! Found ${totalJobsScraped} jobs`
    });
    
    return totalJobsScraped;
  } catch (error) {
    sendErrorToPopup(`Error during scraping process: ${error.message}`);
    // Set progress bar to reflect error state
    sendProgressPercentage(0);
    throw error;
>>>>>>> super-clean-branch
  }
}

function scrollProgressively() {
<<<<<<< HEAD
  const timeToCall = 2000;
  return new Promise((res) => {
    const jobs = document.querySelectorAll(".job-card-container");
    const jobsCount = jobs.length;
    jobs[jobsCount - 1].scrollIntoView({ behaviour: "smooth" });
    setTimeout(async () => {
      if (
        document.querySelectorAll(".job-card-container").length != jobsCount
      ) {
        res(scrollProgressively());
      } else {
        return res({ status: "end of scroll" });
      }
    }, timeToCall);
=======
  const timeToCall = 4000; // Increased to give more time for LinkedIn to load content
  return new Promise((res) => {
    try {
      sendMessageToPopup("Scrolling to load all job listings...");
      
      // Try to find job container with multiple selectors
      let jobContainer = null;
      const containerSelectors = [
        // Original selectors
        ".jobs-search-results-list",
        ".jobs-search-results__list",
        ".jobs-search__results-list",
        ".scaffold-layout__list-container",
        // Additional selectors for 2023-2025 LinkedIn interface
        ".jobs-search-results-container",
        ".jobs-list",
        "ul.jobs-search-results__list",
        "div.scaffold-layout__list",
        "main.scaffold-layout__main",
        // Selectors based on the electrical_Jobs_LinkedIn.html structure
        ".scaffold-layout__detail",
        ".jobs-search__job-details--container",
        ".jobs-details",
        ".jobs-search__job-details",
        // Very generic selectors as fallback
        "[role='main']",
        "[data-test-search-results-container]"
      ];
      
      for (const selector of containerSelectors) {
        jobContainer = document.querySelector(selector);
        if (jobContainer) {
          sendMessageToPopup(`Found job container using selector: ${selector}`);
          break;
        }
      }
      
      if (!jobContainer) {
        // If we can't find a specific container, use the main body as fallback
        sendMessageToPopup("Warning: Could not find job container for scrolling. Using document.body as fallback");
        jobContainer = document.body;
      }
      
      // Try to get job cards with multiple selectors
      let jobs = [];
      const jobCardSelectors = [
        // Original selectors
        ".job-card-container",
        ".jobs-search-results__list-item",
        ".occludable-update",
        ".jobs-search-two-pane__job-card-container",
        // Additional selectors for 2023-2025 LinkedIn interface
        "li.jobs-search-results__list-item",
        "div.job-card-container",
        "li.artdeco-list__item",
        // From electrical_Jobs_LinkedIn.html structure
        ".job-details-jobs-unified-top-card__container--two-pane",
        ".jobs-search__job-details--container",
        ".jobs-details__main-content",
        "div[data-job-id]",
        // Generic selectors that might match job listings
        "div[class*='job-card']",
        "li[class*='job']",
        "article[class*='job']",
        // Additional generic selectors
        ".jobs-search-results-list__list-item",
        ".job-view-layout"
      ];
      
      for (const selector of jobCardSelectors) {
        jobs = document.querySelectorAll(selector);
        if (jobs.length > 0) {
          sendMessageToPopup(`Found initial job cards using selector: ${selector}`);
          break;
        }
      }
      
      if (jobs.length === 0) {
        // Look for job titles which are highly likely to be part of job cards
        const jobTitleSelectors = [
          ".job-details-jobs-unified-top-card__job-title",
          ".t-24.t-bold.inline",
          "h1.t-24",
          "h2.t-24",
          "h2.t-16",
          "a[href*='/jobs/view/']"
        ];

        for (const selector of jobTitleSelectors) {
          const titleElements = document.querySelectorAll(selector);
          if (titleElements.length > 0) {
            // If we find job titles, we'll treat their parent containers as job cards
            jobs = [];
            titleElements.forEach(title => {
              // Get parent container that's likely the job card
              let parent = title.parentNode;
              for (let i = 0; i < 5; i++) { // Go up to 5 levels up to find appropriate container
                if (parent && parent.tagName !== 'BODY') {
                  jobs.push(parent);
                  break;
                }
                if (parent) parent = parent.parentNode;
              }
            });
            
            if (jobs.length > 0) {
              sendMessageToPopup(`Found ${jobs.length} job cards by looking for job titles`);
              break;
            }
          }
        }
        
        // If still no jobs found, check if we're on a single job view and treat it as one job
        if (jobs.length === 0 && window.location.href.includes('/jobs/view/')) {
          const jobContainer = document.querySelector('.jobs-details') || 
                              document.querySelector('.job-view-layout') ||
                              document.querySelector('.scaffold-layout__detail');
          
          if (jobContainer) {
            jobs = [jobContainer];
            sendMessageToPopup('Found a single job details view');
          }
        }
        
        // Last resort: look for any clickable elements that might be job cards
        if (jobs.length === 0) {
          const possibleJobElements = document.querySelectorAll('a[href*="/jobs/view/"], a[href*="currentJobId="], [data-entity-urn*="jobPosting"]');
          if (possibleJobElements.length > 0) {
            jobs = possibleJobElements;
            sendMessageToPopup(`Found ${jobs.length} potential job cards using URL patterns`);
          } else {
            sendMessageToPopup("Warning: No job cards found for scrolling. Trying to scroll anyway");
          }
        }
      }
      
      const jobsCount = jobs.length;
      sendMessageToPopup(`Initial job count: ${jobsCount}`);
      
      // More aggressive scrolling approach
      let currentPosition = 0;
      const scrollDistance = Math.floor(window.innerHeight * 0.7); // 70% of viewport height
      let consecutiveNoChangeCounts = 0;
      const MAX_SCROLL_ATTEMPTS = 15; // Limit the number of scroll attempts
      let scrollAttempts = 0;
      
      function incrementalScroll() {
        scrollAttempts++;
        currentPosition += scrollDistance;
        
        // Safely scroll the container
        try {
          // Try multiple scroll methods since LinkedIn's infinite scroll can be tricky
          jobContainer.scrollTo({
            top: currentPosition,
            behavior: "smooth"
          });
          
          // Also try window.scrollTo as a fallback
          window.scrollTo({
            top: currentPosition,
            behavior: "smooth"
          });
          
          // As another fallback, try scrollBy
          try {
            jobContainer.scrollBy({
              top: scrollDistance,
              behavior: "smooth"
            });
          } catch (e) {
            // Ignore error if scrollBy not supported
          }
          
          sendMessageToPopup(`Scrolled to position ${currentPosition}px (attempt ${scrollAttempts}/${MAX_SCROLL_ATTEMPTS})`);
        } catch (e) {
          sendMessageToPopup(`Warning: Error during scroll operation: ${e.message}`);
        }
        
        // Check if we've reached the end or max attempts
        const atBottom = currentPosition >= jobContainer.scrollHeight - jobContainer.clientHeight;
        const reachedMaxAttempts = scrollAttempts >= MAX_SCROLL_ATTEMPTS;
        
        if (atBottom || reachedMaxAttempts) {
          // We've reached the bottom or max attempts, wait a bit and then check final count
          setTimeout(() => {
            let finalJobsCount = 0;
            let finalSelector = "";
            
            // Check all possible selectors to get the maximum count
            for (const selector of jobCardSelectors) {
              const finalJobs = document.querySelectorAll(selector);
              if (finalJobs.length > finalJobsCount) {
                finalJobsCount = finalJobs.length;
                finalSelector = selector;
              }
            }
            
            // Also check for job titles as final fallback
            const jobTitles = document.querySelectorAll('h1.t-24, h2.t-24, a[href*="/jobs/view/"]');
            if (jobTitles.length > finalJobsCount) {
              finalJobsCount = jobTitles.length;
              finalSelector = "job title elements";
            }
            
            // Also check for job URLs as fallback
            const jobUrls = document.querySelectorAll('a[href*="/jobs/view/"], a[href*="currentJobId="]');
            if (jobUrls.length > finalJobsCount) {
              finalJobsCount = jobUrls.length;
              finalSelector = "job URL links";
            }
            
            if (reachedMaxAttempts) {
              sendMessageToPopup(`Reached maximum scroll attempts (${MAX_SCROLL_ATTEMPTS}). Found ${finalJobsCount} jobs using ${finalSelector}`);
            } else {
              sendMessageToPopup(`Reached bottom of page. Found ${finalJobsCount} jobs using ${finalSelector}`);
            }
            
            return res({
              status: reachedMaxAttempts ? "max attempts reached" : "complete",
              jobsCount: finalJobsCount
            });
          }, timeToCall);
        } else {
          // Wait and check if more jobs loaded
          setTimeout(() => {
            let newJobsCount = 0;
            let bestSelector = "";
            
            // Check all possible job card selectors
            for (const selector of jobCardSelectors) {
              const newJobs = document.querySelectorAll(selector);
              if (newJobs.length > newJobsCount) {
                newJobsCount = newJobs.length;
                bestSelector = selector;
              }
            }
            
            // Also check for job titles
            const jobTitles = document.querySelectorAll('h1.t-24, h2.t-24, a[href*="/jobs/view/"]');
            if (jobTitles.length > newJobsCount) {
              newJobsCount = jobTitles.length;
              bestSelector = "job title elements";
            }
            
            // Also check for job URLs as fallback
            const jobUrls = document.querySelectorAll('a[href*="/jobs/view/"], a[href*="currentJobId="]');
            if (jobUrls.length > newJobsCount) {
              newJobsCount = jobUrls.length;
              bestSelector = "job URL links";
            }
            
            if (newJobsCount > jobsCount) {
              // More jobs loaded, continue scrolling
              consecutiveNoChangeCounts = 0; // Reset no-change counter
              sendMessageToPopup(`More jobs loaded (${jobsCount} → ${newJobsCount}) using ${bestSelector}, continuing to scroll...`);
              incrementalScroll();
            } else {
              // No new jobs found
              consecutiveNoChangeCounts++;
              
              if (consecutiveNoChangeCounts >= 3) {
                // If we've tried scrolling 3 times with no new jobs, we're probably at the end
                sendMessageToPopup(`No new jobs after 3 scroll attempts. Ending with ${newJobsCount} jobs found.`);
                return res({
                  status: "no more jobs loading",
                  jobsCount: newJobsCount
                });
              } else if (atBottom === false) {
                // No new jobs but we're not at bottom yet, keep scrolling
                sendMessageToPopup(`No new jobs yet (attempt ${consecutiveNoChangeCounts}/3), continuing to scroll...`);
                incrementalScroll();
              } else {
                // We're at bottom and no more jobs loading
                sendMessageToPopup(`Reached end of job listings. Found ${newJobsCount} jobs total.`);
                return res({
                  status: "end of scroll",
                  jobsCount: newJobsCount
                });
              }
            }
          }, timeToCall);
        }
      }
      
      // Start the incremental scrolling process
      incrementalScroll();
    } catch (error) {
      sendErrorToPopup(`Error during scroll operation: ${error.message}`);
      return res({ status: "error", error: error.message });
    }
>>>>>>> super-clean-branch
  });
}
