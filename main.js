function fetchCongressDataIfNeeded(chamber) {
    if (senatorsData !== null) {
        return Promise.resolve(senatorsData);
    }

    let url = chamber === "house" ? "https://api.propublica.org/congress/v1/117/house/members.json"
                                  : "https://api.propublica.org/congress/v1/117/senate/members.json";

    return fetch(url, {
        headers: {
            "X-API-Key": "9IkyH0aHLxluBFhFFPrGpTGlDuNGdKBFOSdJC04Y"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Could not fetch ${chamber} data`);
        }
        return response.json();
    })
    .then(data => {
        if (data && data.results && data.results[0].members) {
            senatorsData = data.results[0].members;
            return senatorsData;  // Just returning the fetched senators data
        } else {
            throw new Error(`Invalid JSON structure for ${chamber} data`);
        }
    })
    .catch(error => {
        console.error(`Error fetching ${chamber} JSON:`, error);
        throw error;
    });
}