/**
 * LinkedIn Job Scraper - Data Export Utilities
 * Functions for exporting job data to various formats
 */

// Export jobs to JSON
function exportToJson(jobs) {
  const jsonData = JSON.stringify(jobs, null, 2);
  downloadFile(jsonData, "linkedin-jobs.json", "application/json");
}

// Export jobs to JSON Lines format (for large datasets)
function exportToJsonLines(jobs) {
  const jsonLinesData = jobs.map(job => JSON.stringify(job)).join('\n');
  downloadFile(jsonLinesData, "linkedin-jobs.jsonl", "application/x-jsonlines");
}

// Export jobs to Excel-compatible format
function exportToExcel(jobs) {
  // Create XML for Excel
  let excelXml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
  excelXml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
  excelXml += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
  excelXml += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
  excelXml += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
  excelXml += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
  excelXml += '<Worksheet ss:Name="LinkedIn Jobs">';
  excelXml += '<Table>';
  
  // Headers
  excelXml += '<Row>';
  const headers = ["Job Title", "Company", "Location", "Posted Since", 
                   "Applicants", "Job ID", "Link", "Description", "Scraped At"];
  
  headers.forEach(header => {
    excelXml += `<Cell><Data ss:Type="String">${header}</Data></Cell>`;
  });
  excelXml += '</Row>';
  
  // Job data
  jobs.forEach(job => {
    excelXml += '<Row>';
    [
      escapeXml(job.jobTitle || ""),
      escapeXml(job.company || ""),
      escapeXml(job.jobLocation || ""),
      escapeXml(job.postedSince || ""),
      escapeXml(job.numberOfApplicants || ""),
      escapeXml(job.linkedinJobId || ""),
      escapeXml(job.link || ""),
      escapeXml(job.jobDescription || ""),
      escapeXml(job.scrapedAt || "")
    ].forEach(value => {
      excelXml += `<Cell><Data ss:Type="String">${value}</Data></Cell>`;
    });
    excelXml += '</Row>';
  });
  
  excelXml += '</Table></Worksheet></Workbook>';
  downloadFile(excelXml, "linkedin-jobs.xml", "application/vnd.ms-excel");
}

// Helper function to escape XML characters
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Generic file download function
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}