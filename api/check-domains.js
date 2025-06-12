// api/check-domains.js (VERSION MSLL7A O DQIQA)

import whois from 'whois-json';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { domainNames } = req.body;
    const extensions = ['.net', '.co', '.co.in', '.in', '.us'];

    if (!domainNames || domainNames.length === 0) {
        return res.status(400).json({ error: 'Please provide a list of domain names.' });
    }

    const checkPromises = [];

    for (const name of domainNames) {
        for (const ext of extensions) {
            const fullDomain = name + ext;
            const promise = whois(fullDomain, { timeout: 4000, follow: 1, verbose: true })
                .then(whoisData => {
                    // <<<=== HADA HOWA L-ISLAH L-MOHIM ===>>>
                    let isRegistered = false; // Kanbdaw b l-principe anaho mamssjelch

                    // L-maktaba katrje3 Array awla Object. N-testiw les deux.
                    if (Array.isArray(whoisData)) {
                        // Ila kan array, khasso ikon 3amer bach ngolo msjjel
                        isRegistered = whoisData.length > 0;
                    } 
                    else if (typeof whoisData === 'object' && whoisData !== null) {
                        // Ila kan objet, khasso ikon 3amer b les propriétés.
                        // Objet khawi {} kay3ni l-domaine mota7.
                        // Hada howa l-check li kayṣell7 l-mochkil dyalk:
                        if (Object.keys(whoisData).length > 0) {
                            // precaution: nchofo wach fih chi message dyal error
                            const responseText = JSON.stringify(whoisData).toLowerCase();
                            if (!responseText.includes('no match for') && !responseText.includes('not found')) {
                                isRegistered = true;
                            }
                        }
                    }
                    
                    return { domain: fullDomain, isAvailable: !isRegistered };
                })
                .catch(error => {
                    // L-catch block db ghadi ichd ghir les errors l-7qiqiyin (bhal timeout awla "No match" error)
                    // F ay 7ala, hada kay3ni l-domaine mota7
                    // console.warn(`WHOIS for ${fullDomain} failed, assuming available. Error: ${error.message}`);
                    return { domain: fullDomain, isAvailable: true };
                });
            checkPromises.push(promise);
        }
    }

    try {
        const allResults = await Promise.all(checkPromises);
        res.status(200).json(allResults);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process domain checks.' });
    }
}
