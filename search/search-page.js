document.addEventListener("DOMContentLoaded", function () {
  let table;
  let jobs = [];

  // Initialize the datatable with enhanced features
  initializeDataTable();

  // Listen for storage changes
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "local" && changes.jobs) {
      loadJobsTable();
    }
  });

  // Set up DataTables with advanced features
  function initializeDataTable() {
    table = $("#jobsTable").DataTable({
      paging: true,
      pageLength: 25,
      lengthMenu: [10, 25, 50, 100, 250],
      searching: true,
      ordering: true,
      info: true,
      responsive: true,
      dom: 'Blfrtip',
      buttons: [
        'copy', 
        'csv', 
        'excel',
        {
          text: 'Filter by Description',
          action: function () {
            showDescriptionFilterDialog();
          }
        }
      ],
      columnDefs: [
        { width: "15%", targets: 0 }, // Job Title
        { width: "10%", targets: 1 }, // Location
        { width: "10%", targets: 2 }, // Company
        { width: "8%", targets: 3 }, // Posted Since
        { width: "12%", targets: 4 }, // Applicants
        { width: "5%", targets: 5 }, // Link
        { width: "40%", targets: 6, orderable: false } // Description (not sortable)
      ]
    });

    loadJobsTable();
    
    // Add search box placeholder
    $('.dataTables_filter input').attr('placeholder', 'Search all columns...');

    // Add description-specific search
    $('#jobsTable_filter').append(
      '<div class="advanced-search">' +
      '<input type="text" id="descriptionSearchInput" placeholder="Search in job descriptions...">' +
      '<button id="descriptionSearchButton">Search Description</button>' +
      '</div>'
    );

    // Set up description search button
    $('#descriptionSearchButton').on('click', function() {
      const searchText = $('#descriptionSearchInput').val().toLowerCase();
      
      if (!searchText) return;
      
      // Custom filtering for description column
      $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const description = data[6].toLowerCase();
        return description.includes(searchText);
      });
      
      table.draw();
      
      // Remove the filter after drawing
      $.fn.dataTable.ext.search.pop();
    });
  }

  // Load jobs from storage into the table
  function loadJobsTable() {
    chrome.storage.local.get("jobs", function (result) {
      jobs = result.jobs || [];

      if (jobs && jobs.length > 0) {
        // Clear existing table rows
        table.clear();

        // Create table rows from the jobs data
        jobs.forEach(function (job, index) {
          // Format the description for better readability
          const formattedDescription = formatJobDescription(job.jobDescription);
          
          // Create a clickable link
          const linkHTML = `<a href="${job.link}" target="_blank" class="job-link" title="Open job on LinkedIn">View <i class="fas fa-external-link-alt"></i></a>`;
          
          // Add Job No. (index + 1) to make it 1-based instead of 0-based
          table.row.add([
            index + 1, // Job No.
            job.jobTitle || "N/A",
            job.jobLocation || "N/A",
            job.company || "N/A",
            job.postedSince || "N/A",
            job.numberOfApplicants || "N/A",
            linkHTML,
            formattedDescription
          ]);
        });
        
        // Draw the table with the new data
        table.draw();

        // Update the title with the count of jobs
        document.getElementById("pageTitle").innerText = `LinkedIn Jobs (${jobs.length})`;
        document.querySelector(".title").innerText = `LinkedIn Jobs (${jobs.length})`;
      } else {
        document.getElementById("pageTitle").innerText = "LinkedIn Jobs (0)";
        document.querySelector(".title").innerText = "LinkedIn Jobs (0)";
      }
    });
  }
  
  // Format job description for better display
  function formatJobDescription(description) {
    if (!description) return "No description available";
    
    // Escape HTML and convert newlines to <br>
    let formattedDesc = description
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
      
    // Highlight common keywords
    const keywords = [
      "requirements", "qualifications", "skills", "experience", 
      "education", "responsibilities", "preferred", "required",
      "benefits", "salary", "compensation", "remote", "hybrid"
    ];
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formattedDesc = formattedDesc.replace(
        regex, 
        match => `<span class="keyword">${match}</span>`
      );
    });
    
    return `<div class="description-content">${formattedDesc}</div>`;
  }
  
  // Show dialog for filtering by job description keywords
  function showDescriptionFilterDialog() {
    // Create modal if it doesn't exist
    if (!document.getElementById('filterModal')) {
      const modal = document.createElement('div');
      modal.id = 'filterModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Filter by Keywords in Description</h2>
          <p>Enter keywords to filter jobs by their description (comma-separated):</p>
          <input type="text" id="keywordInput" placeholder="e.g., remote, python, senior">
          <div class="suggestions">
            <span>Common keywords:</span>
            <button class="keyword-tag">remote</button>
            <button class="keyword-tag">junior</button>
            <button class="keyword-tag">senior</button>
            <button class="keyword-tag">experience</button>
            <button class="keyword-tag">salary</button>
          </div>
          <div class="modal-actions">
            <button id="applyFilter">Apply Filter</button>
            <button id="clearFilter">Clear Filter</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Set up event listeners
      document.querySelector('#filterModal .close').onclick = function() {
        modal.style.display = 'none';
      };
      
      document.querySelectorAll('.keyword-tag').forEach(btn => {
        btn.onclick = function() {
          const input = document.getElementById('keywordInput');
          const currentValue = input.value;
          input.value = currentValue ? `${currentValue}, ${btn.innerText}` : btn.innerText;
        };
      });
      
      document.getElementById('applyFilter').onclick = function() {
        const keywords = document.getElementById('keywordInput').value
          .split(',')
          .map(k => k.trim().toLowerCase())
          .filter(k => k);
        
        if (keywords.length) {
          // Apply filter to the table
          $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
            const description = data[6].toLowerCase();
            return keywords.some(keyword => description.includes(keyword));
          });
          
          table.draw();
          modal.style.display = 'none';
        }
      };
      
      document.getElementById('clearFilter').onclick = function() {
        // Clear all custom filters
        $.fn.dataTable.ext.search.splice(0, $.fn.dataTable.ext.search.length);
        table.draw();
        modal.style.display = 'none';
      };
    }
    
    document.getElementById('filterModal').style.display = 'block';
  }
  
  // Clear local storage event
  document.getElementById("clearLocalStorageButton").addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all job data? This cannot be undone.")) {
      chrome.storage.local.remove("jobs", function () {
        console.log("Jobs data removed from chrome.storage.local");
        
        // Clear table and show message
        table.clear().draw();
        document.getElementById("pageTitle").innerText = "LinkedIn Jobs (0)";
        document.querySelector(".title").innerText = "LinkedIn Jobs (0)";
        
        // Show alert
        alert("All job data has been cleared.");
      });
    }
  });
});
