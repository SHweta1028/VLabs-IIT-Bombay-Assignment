let chemicalInventory = [];
let sortOrder = 'ascending';

async function fetchChemicalData() {
    try {
        const response = await fetch('chemical_data.json');
        if (!response.ok) {
            throw new Error('Data fetch unsuccessful');
        }
        chemicalInventory = await response.json();
        renderChemicalTable();
    } catch (error) {
        console.error('Chemical data fetch failed:', error);
    }
}

function toggleAllSelections() {
    const selectAllIcon = document.getElementById("selectAll");
    selectAllIcon.classList.toggle("selected");
}

function renderChemicalTable() {
    const tableBody = document.getElementById("invoiceTableBody");
    tableBody.innerHTML = '';

    chemicalInventory.forEach((chemical, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="images/tick.svg" class="tick-icon" alt="Tick Icon"></td>
            <td>${chemical.id}</td>
            <td>${chemical.chemical_name}</td>
            <td>${chemical.vendor}</td>
            <td>${chemical.density}</td>
            <td>${chemical.viscosity}</td>
            <td>${chemical.packaging}</td>
            <td>${chemical.pack_size}</td>
            <td>${chemical.unit}</td>
            <td>${chemical.quantity}</td>
        `;
        tableBody.appendChild(row);

        const tickIcon = row.querySelector('.tick-icon');
        tickIcon.addEventListener('click', function () {
            this.src = this.classList.contains('selected') ? "images/tick.svg" : "images/blue_tick.svg";
            this.classList.toggle('selected');
            row.classList.toggle('selected-row');
        });
    });
}

function resetChemicalTable() {
    chemicalInventory.sort((a, b) => a.id - b.id);
    renderChemicalTable();
}

function sortChemicalTable(column, headerElement) {
    sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';

    chemicalInventory.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];
        if (!isNaN(valA)) valA = parseFloat(valA);
        if (!isNaN(valB)) valB = parseFloat(valB);
        return sortOrder === 'ascending' ? (valA > valB ? 1 : valA < valB ? -1 : 0) : (valA < valB ? 1 : valA > valB ? -1 : 0);
    });

    renderChemicalTable();

    const allHeaders = document.querySelectorAll('th');
    allHeaders.forEach(header => {
        header.querySelector('span').textContent = '';
    });

    const arrow = sortOrder === 'ascending' ? '▲' : '▼';
    headerElement.querySelector('span').textContent = arrow;
}

function addNewChemical() {
    const id = chemicalInventory.length ? chemicalInventory[chemicalInventory.length - 1].id + 1 : 1;
    const newChemical = {
        id,
        chemical_name: document.getElementById("chemicalName").value,
        vendor: document.getElementById("vendor").value,
        density: document.getElementById("density").value,
        viscosity: document.getElementById("viscosity").value,
        packaging: document.getElementById("packaging").value,
        pack_size: parseFloat(document.getElementById("packSize").value),
        unit: document.getElementById("unit").value,
        quantity: parseInt(document.getElementById("quantity").value)
    };

    chemicalInventory.push(newChemical);
    renderChemicalTable();
    document.getElementById("invoiceForm").reset();
    document.getElementById("invoiceForm").style.display = 'none';
}

function removeSelectedChemicals() {
    const selectedRows = document.querySelectorAll(".tick-icon.selected");
    selectedRows.forEach((selectedIcon) => {
        const row = selectedIcon.closest("tr");
        const rowIndex = Array.from(row.parentElement.children).indexOf(row);
        chemicalInventory.splice(rowIndex, 1);
    });
    renderChemicalTable();
}

function displayChemicalForm() {
    document.getElementById("invoiceForm").style.display = 'block';
}

function cancelChemicalAddition() {
    document.getElementById("invoiceForm").reset();
    document.getElementById("invoiceForm").style.display = 'none';
}

function moveChemicalUp() {
    const selectedCheckbox = document.querySelector('.tick-icon.selected');
    if (selectedCheckbox) {
        const selectedRow = selectedCheckbox.closest('tr');
        const prevRow = selectedRow.previousElementSibling;
        if (prevRow) {
            const selectedRowIndex = Array.from(selectedRow.parentNode.children).indexOf(selectedRow);
            const prevRowIndex = selectedRowIndex - 1;
            [chemicalInventory[selectedRowIndex], chemicalInventory[prevRowIndex]] = [chemicalInventory[prevRowIndex], chemicalInventory[selectedRowIndex]];
            selectedRow.parentNode.insertBefore(selectedRow, prevRow);
            renderChemicalTable();
        }
    }
}

function moveChemicalDown() {
    const selectedCheckbox = document.querySelector('.tick-icon.selected');
    if (selectedCheckbox) {
        const selectedRow = selectedCheckbox.closest('tr');
        const nextRow = selectedRow.nextElementSibling;
        if (nextRow) {
            const selectedRowIndex = Array.from(selectedRow.parentNode.children).indexOf(selectedRow);
            const nextRowIndex = selectedRowIndex + 1;
            [chemicalInventory[selectedRowIndex], chemicalInventory[nextRowIndex]] = [chemicalInventory[nextRowIndex], chemicalInventory[selectedRowIndex]];
            selectedRow.parentNode.insertBefore(nextRow, selectedRow);
            renderChemicalTable();
        }
    }
}

function saveTable() {
    // Generate CSV content from chemicalInventory array
    const csvContent = generateCSVContent(chemicalInventory);
    
    // Trigger CSV download
    downloadCSV(csvContent, 'chemical_inventory.csv');
}

// Function to generate CSV content from the chemicalInventory array
function generateCSVContent(data) {
    if (data.length === 0) {
        return ''; // Return empty string if no data
    }

    // Get headers from the chemicalInventory object keys
    const headers = ['ID', 'Chemical Name', 'Vendor', 'Density', 'Viscosity', 'Packaging', 'Pack Size', 'Unit', 'Quantity'];

    // Extract values from each chemical object in the chemicalInventory array
    const rows = data.map(chemical => [
        chemical.id,
        chemical.chemical_name,
        chemical.vendor,
        chemical.density,
        chemical.viscosity,
        chemical.packaging,
        chemical.pack_size,
        chemical.unit,
        chemical.quantity
    ]);

    // Join headers and rows into CSV format with line breaks
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csv;
}


function downloadCSV(csvContent, fileName) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
}



document.getElementById("invoiceForm").addEventListener("submit", function(event) {
    event.preventDefault();
    addNewChemical();
});

document.getElementById("cancelButton").addEventListener("click", cancelChemicalAddition);

fetchChemicalData();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}