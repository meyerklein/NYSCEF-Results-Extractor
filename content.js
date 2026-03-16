const table = document.querySelector('table.NewSearchResults');

const btn = document.createElement('button');
btn.innerText = "Copy";
btn.style.cssText = `
    margin: 10px 0;
    padding: 8px 16px;
    background-color: #0056b3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
`;

// Insert button — either before the table or after the search results block
if (table) {
    table.parentNode.insertBefore(btn, table);
} else {
    // No table = no results page. Insert after .DocumentBlock or h1.PageHeading
    const docBlock = document.querySelector('.DocumentBlock');
    const heading = document.querySelector('h1.PageHeading');
    const anchor = docBlock || heading;
    if (anchor && anchor.parentNode) {
        btn.innerText = "📋 Copy NYSCEF (No Results)";
        anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    } else {
        // Ultimate fallback — fixed position
        btn.style.cssText += `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 99999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        btn.innerText = "📋 Copy NYSCEF (No Results)";
        document.body.appendChild(btn);
    }
}

// Helper function to return null if the text is missing or empty
const cleanValue = (val) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed === '' ? null : trimmed;
};

btn.addEventListener('click', (e) => {
    e.preventDefault();

    // If no table exists, copy null to indicate no results
    if (!table) {
        navigator.clipboard.writeText('null').then(() => {
            btn.innerText = "✅ No Results — Copied null";
            btn.style.backgroundColor = "#6b7280";
            setTimeout(() => {
                btn.innerText = "Copy";
                btn.style.backgroundColor = "#0056b3";
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            btn.innerText = "❌ Error Copying";
        });
        return;
    }

    const rows = document.querySelectorAll('table.NewSearchResults tbody tr');
    const extractedData = [];

    rows.forEach(row => {
        const tds = row.querySelectorAll('td');
        if (tds.length < 4) return;

        // --- Column 1: Case #, Link, and Received Date ---
        const aTag = tds[0].querySelector('a');
        const caseNumber = aTag ? aTag.innerText : null;
        const documentLink = aTag ? aTag.href : null;
        
        // Safely find the text strictly after the <br> tag
        let receivedDate = null;
        let passedBr1 = false;
        for (let node of tds[0].childNodes) {
            if (node.nodeName === 'BR') {
                passedBr1 = true;
            } else if (passedBr1 && node.nodeType === Node.TEXT_NODE) {
                const txt = node.textContent.trim();
                if (txt) {
                    receivedDate = txt;
                    break;
                }
            }
        }

        // --- Column 2: eFiling Status and Case Status ---
        // Safely find the text strictly before the <br> tag
        let eFilingStatus = null;
        for (let node of tds[1].childNodes) {
            if (node.nodeName === 'BR') break;
            if (node.nodeType === Node.TEXT_NODE) {
                const txt = node.textContent.replace(/\u00A0/g, ' ').trim();
                if (txt) {
                    eFilingStatus = txt;
                    break;
                }
            }
        }
        const caseStatusSpan = tds[1].querySelector('span');
        const caseStatus = caseStatusSpan ? caseStatusSpan.innerText : null;

        // --- Column 3: Caption ---
        const caption = tds[2].innerText;

        // --- Column 4: Court and Case Type ---
        // Safely find the text strictly before the <br> tag
        let court = null;
        for (let node of tds[3].childNodes) {
            if (node.nodeName === 'BR') break;
            if (node.nodeType === Node.TEXT_NODE) {
                const txt = node.textContent.trim();
                if (txt) {
                    court = txt;
                    break;
                }
            }
        }
        const caseTypeSpan = tds[3].querySelector('span');
        const caseType = caseTypeSpan ? caseTypeSpan.innerText : null;

        // Push the cleaned data to the array
        extractedData.push({
            caseNumber: cleanValue(caseNumber),
            receivedDate: cleanValue(receivedDate),
            eFilingStatus: cleanValue(eFilingStatus),
            caseStatus: cleanValue(caseStatus),
            caption: cleanValue(caption),
            court: cleanValue(court),
            caseType: cleanValue(caseType),
            documentLink: cleanValue(documentLink)
        });
    });

    // If table exists but has no data rows, copy null
    if (extractedData.length === 0) {
        navigator.clipboard.writeText('null').then(() => {
            btn.innerText = "✅ No Results — Copied null";
            btn.style.backgroundColor = "#6b7280";
            setTimeout(() => {
                btn.innerText = "Copy";
                btn.style.backgroundColor = "#0056b3";
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            btn.innerText = "❌ Error Copying";
        });
        return;
    }

    // Convert to JSON and copy to clipboard
    const jsonString = JSON.stringify(extractedData, null, 2);
    
    navigator.clipboard.writeText(jsonString).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "✅ Copied to Clipboard!";
        btn.style.backgroundColor = "#28a745";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "#0056b3";
        }, 3000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        btn.innerText = "❌ Error Copying";
    });
});