import whois from 'whois-json';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { domainNames } = req.body;
    const extensions = ['.net', '.co', '.co.in', '.in', '.us'];
    const results = [];

    if (!domainNames || domainNames.length === 0) {
        return res.status(400).json({ error: 'Please provide a list of domain names.' });
    }

    // Vercel Hobby plan has a 10-second timeout for functions.
    // We'll process requests in parallel to be faster.
    const checkPromises = [];

    for (const name of domainNames) {
        for (const ext of extensions) {
            const fullDomain = name + ext;
            const promise = whois(fullDomain, { timeout: 4000 }) // Add timeout
                .then(whoisData => {
                    const isRegistered = Array.isArray(whoisData) ? whoisData.length > 0 : !!whoisData;
                    return { domain: fullDomain, isAvailable: !isRegistered };
                })
                .catch(() => {
                    // If whois fails (e.g., timeout or "No match"), assume it's available
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
