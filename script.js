// script.js (VERSION LI KAT-AFFICHI GHIR LES DOMAINES L-MSJJLIN)

document.getElementById('checkButton').addEventListener('click', () => {
    const domainListText = document.getElementById('domainList').value;
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');
    const checkButton = document.getElementById('checkButton');

    const extensionsToRemove = /(\.com|\.net|\.co|\.co\.in|\.in|\.us)$/;

    const domainNames = domainListText.split('\n')
        .map(d => d.trim().toLowerCase().replace(extensionsToRemove, ''))
        .filter(d => d.length > 0 && d.indexOf('.') === -1);

    if (domainNames.length === 0) {
        resultsDiv.innerHTML = '<p style="color: red;">Please enter at least one valid domain name (without extension).</p>';
        return;
    }

    loader.style.display = 'block';
    resultsDiv.innerHTML = '';
    checkButton.disabled = true;

    fetch('/api/check-domains', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domainNames }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        loader.style.display = 'none';
        checkButton.disabled = false;
        
        if (data.error) {
            resultsDiv.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
            return;
        }

        // <<<=== HNA FIN KAYN L-TBDIL L-ASASSI ===>>>
        // 1. Kanfiltriw bach nakhdo ghir les items li MHOMCH mota7in (ya3ni msjjlin)
        const registeredDomains = data.filter(item => !item.isAvailable); // isAvailable = false

        // 2. Kancheckiw wach lqina chi wahd
        if (registeredDomains.length === 0) {
            resultsDiv.innerHTML = '<p>Good news! No registered domains were found for these names.</p>';
        } else {
            // 3. Kan-affichiw ghir dok li lqina msjjlin
            registeredDomains.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                
                const statusClass = 'registered';
                const statusText = 'Registered';
                
                resultItem.innerHTML = `
                    <span>${item.domain}</span>
                    <span class="status ${statusClass}">${statusText}</span>
                `;
                resultsDiv.appendChild(resultItem);
            });
        }
    })
    .catch(error => {
        loader.style.display = 'none';
        checkButton.disabled = false;
        resultsDiv.innerHTML = `<p style="color: red;">An unexpected error occurred. This can happen if the check takes too long. Try with a smaller list.</p>`;
        console.error('Fetch Error:', error);
    });
});
