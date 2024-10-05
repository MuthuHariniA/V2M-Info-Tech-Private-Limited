document.getElementById('upload-btn').addEventListener('click', function() {
    const fileUpload = document.getElementById('file-upload').files[0];
    
    if (fileUpload) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const employeeData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            calculateSalaries(employeeData);
            enableDownload(employeeData);
        };
        
        reader.readAsArrayBuffer(fileUpload);
    } else {
        alert('Please upload a file!');
    }
});

function calculateSalaries(data) {
    const headers = data[0];
    const resultsDiv = document.getElementById('results');
    let tableHtml = '<table><thead><tr>';
    
    // Add headers for display (including Calculated Salary)
    headers.forEach(header => {
        tableHtml += `<th>${header}</th>`;
    });
    tableHtml += '<th>Calculated Salary</th></tr></thead><tbody>';
    
    // Process each employee's row data
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const employeeId = row[0];
        const name = row[1];
        const monthlySalary = row[2];
        const workingDays = row[3];
        const presentDays = row[4];
        const approvedPersonalLeave = row[7];
        const approvedCasualLeave = row[8];

        // Calculate total present days (present days + approved leaves)
        const totalPresentDays = presentDays + approvedPersonalLeave + approvedCasualLeave;
        const calculatedSalary = (totalPresentDays / workingDays) * monthlySalary;
        
        row.push(calculatedSalary.toFixed(2)); // Add the calculated salary to the row
        
        // Add row data to the HTML table for display
        tableHtml += '<tr>';
        row.forEach(cell => {
            tableHtml += `<td>${cell}</td>`;
        });
        tableHtml += '</tr>';
    }
    
    tableHtml += '</tbody></table>';
    resultsDiv.innerHTML = tableHtml;

    // Show the download button after calculation
    document.getElementById('download-btn').style.display = 'inline-block';
}

function enableDownload(data) {
    document.getElementById('download-btn').addEventListener('click', function() {
        // Prepare new data for Excel download (Employee ID, Name, and Calculated Salary only)
        const downloadData = [["Employee ID", "Name", "Calculated Salary"]]; // Add headers
        
        // Collect relevant data (only Employee ID, Name, and Calculated Salary)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const employeeId = row[0];
            const name = row[1];
            const calculatedSalary = row[row.length - 1]; // Calculated Salary is the last column
            
            downloadData.push([employeeId, name, calculatedSalary]);
        }
        
        // Create a new worksheet and workbook for download
        const ws = XLSX.utils.aoa_to_sheet(downloadData); // Convert array of arrays to a worksheet
        const wb = XLSX.utils.book_new(); // Create a new workbook
        XLSX.utils.book_append_sheet(wb, ws, "Results"); // Append worksheet to workbook

        // Download the Excel file
        XLSX.writeFile(wb, 'calculated_salaries.xlsx');
    });
}
