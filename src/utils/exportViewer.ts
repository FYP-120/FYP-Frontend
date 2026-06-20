/**
 * Utility function to open a PDF in a new browser tab.
 * Supports both jsPDF instances and raw Blobs.
 */
export function openPdfInNewTab(pdfDocOrBlob: any, filename: string) {
  try {
    let blob: Blob;
    if (pdfDocOrBlob && typeof pdfDocOrBlob.output === "function") {
      pdfDocOrBlob.setProperties({
        title: filename.replace(".pdf", ""),
      });
      blob = pdfDocOrBlob.output("blob");
    } else if (pdfDocOrBlob instanceof Blob) {
      blob = pdfDocOrBlob;
    } else {
      throw new Error("Invalid PDF data provided.");
    }

    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
      alert("Popup blocker prevented opening the PDF in a new tab. Please allow popups for this site.");
    }
  } catch (err) {
    console.error("Failed to open PDF in a new tab:", err);
    alert("Could not open the PDF report. Please try again.");
  }
}

/**
 * Utility function to display an Excel spreadsheet preview in a new tab with functional download.
 */
export function openExcelInNewTab(
  blob: Blob,
  filename: string,
  title: string,
  headers: string[],
  rows: any[][]
) {
  try {
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Popup blocker prevented opening the Excel preview in a new tab. Please allow popups for this site.");
      return;
    }

    // Generate responsive HTML for a beautiful grid preview with a download button
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${filename}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --brand-500: #6366f1;
      --brand-600: #4f46e5;
      --accent-500: #10b981;
      --accent-600: #059669;
      --danger-500: #f43f5e;
      --warning-500: #f59e0b;
      --bg-page: #f8fafc;
      --bg-surface: #ffffff;
      --bg-elevated: #f1f5f9;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --border-subtle: #e2e8f0;
      --border-default: #cbd5e1;
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
      --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-page: #09090b;
        --bg-surface: #18181b;
        --bg-elevated: #27272a;
        --text-primary: #fafafa;
        --text-secondary: #a1a1aa;
        --text-muted: #71717a;
        --border-subtle: #27272a;
        --border-default: #3f3f46;
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.35);
      }
    }

    body {
      margin: 0;
      padding: 1.5rem;
      background-color: var(--bg-page);
      color: var(--text-primary);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
    }

    .container {
      width: 100%;
      max-width: 1100px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 1.5rem;
      box-shadow: var(--shadow-xl);
      padding: 1.75rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title-area {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-container {
      background-color: rgba(16, 185, 129, 0.12);
      color: var(--accent-500);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.875rem;
      flex-shrink: 0;
    }

    .icon-container svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .info-area h1 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 750;
      letter-spacing: -0.01em;
      color: var(--text-primary);
    }

    .info-area p {
      margin: 0.15rem 0 0 0;
      font-size: 0.775rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .download-btn {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, var(--accent-600), var(--accent-500));
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 0.875rem;
      font-size: 0.825rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
      transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .download-btn:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(16, 185, 129, 0.35);
    }

    .search-input-wrapper {
      position: relative;
      width: 100%;
    }

    .search-input {
      width: 100%;
      padding: 0.675rem 1rem;
      border-radius: 0.875rem;
      border: 1px solid var(--border-default);
      background-color: var(--bg-elevated);
      color: var(--text-primary);
      font-size: 0.825rem;
      font-weight: 500;
      outline: none;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--brand-500);
      background-color: var(--bg-surface);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border-subtle);
      border-radius: 1rem;
      background-color: var(--bg-surface);
      max-height: calc(100vh - 240px);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.825rem;
      text-align: left;
    }

    thead {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    th {
      background-color: var(--bg-elevated);
      color: var(--text-secondary);
      font-weight: 650;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      text-transform: uppercase;
      font-size: 0.725rem;
      letter-spacing: 0.05em;
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-primary);
      white-space: nowrap;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background-color: var(--bg-elevated);
    }

    .no-results {
      text-align: center;
      padding: 3.5rem;
      color: var(--text-muted);
      font-size: 0.825rem;
      font-weight: 500;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.325rem;
      border-radius: 9999px;
      padding: 0.2rem 0.55rem;
      font-size: 0.725rem;
      font-weight: 600;
    }

    .badge-present {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--accent-500);
    }

    .badge-absent {
      background-color: rgba(244, 63, 94, 0.1);
      color: var(--danger-500);
    }

    .badge-late {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--warning-500);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-area">
        <div class="icon-container">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="info-area">
          <h1>${title}</h1>
          <p>File: ${filename} &bull; Total Rows: ${rows.length}</p>
        </div>
      </div>
      <a href="${blobUrl}" download="${filename}" class="download-btn">
        <svg style="width: 1.15rem; height: 1.15rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Spreadsheet
      </a>
    </div>

    <div class="search-input-wrapper">
      <input type="text" id="searchInput" class="search-input" placeholder="Filter spreadsheet data... (Type to search columns)">
    </div>

    <div class="table-container">
      <table id="previewTable">
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              r => `
            <tr>
              ${r
                .map(cell => {
                  const val = cell !== undefined && cell !== null ? String(cell) : "";
                  let content = val;
                  if (val === "Present") {
                    content = `<span class="badge badge-present">Present</span>`;
                  } else if (val === "Absent") {
                    content = `<span class="badge badge-absent">Absent</span>`;
                  } else if (val === "Late") {
                    content = `<span class="badge badge-late">Late</span>`;
                  }
                  return `<td>${content}</td>`;
                })
                .join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <div id="noResults" class="no-results" style="display: none;">
        No matching records found.
      </div>
    </div>
  </div>

  <script>
    const searchInput = document.getElementById('searchInput');
    const table = document.getElementById('previewTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const noResults = document.getElementById('noResults');

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      let hasMatches = false;

      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(q)) {
          row.style.display = '';
          hasMatches = true;
        } else {
          row.style.display = 'none';
        }
      });

      noResults.style.display = hasMatches ? 'none' : '';
    });
  </script>
</body>
</html>
`;
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  } catch (err) {
    console.error("Failed to open Excel in a new tab:", err);
    alert("Could not render spreadsheet preview. Please download the file directly instead.");
  }
}
