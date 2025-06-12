// script.js (CORRECTED VERSION)

document.getElementById('checkButton').addEventListener('click', () => {
    const domainListText = document.getElementById('domainList').value;
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');
    const checkButton = document.getElementById('checkButton');

    // Kan7ido AY IMTIDAD mkhdom bih, machi ghir .com
    const extensionsToRemove = /(\.com|\.net|\.co|\.co\.in|\.in|\.us)$/;

    const domainNames = domainListText.split('\n')
        .map(d => d.trim().toLowerCase().replace(extensionsToRemove, '')) // <<<=== HNA FIN KAYN L-TBDIL L-MOHIM
        .filter(d => d.length > 0 && d.indexOf('.') === -1); // Kan-checkiw bli ism safi bla point

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

        data.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            
            const statusClass = item.isAvailable ? 'available' : 'registered';
            const statusText = item.isAvailable ? 'Available' : 'Registered';
            
            resultItem.innerHTML = `
                <span>${item.domain}</span>
                <span class="status ${statusClass}">${statusText}</span>
            `;
            resultsDiv.appendChild(resultItem);
        });
    })
    .catch(error => {
        loader.style.display = 'none';
        checkButton.disabled = false;
        resultsDiv.innerHTML = `<p style="color: red;">An unexpected error occurred. This can happen if the check takes too long on Vercel's free plan. Try with a smaller list.</p>`;
        console.error('Fetch Error:', error);
    });
});
