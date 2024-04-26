const parties = {
  D: "Democrat",
  R: "Republican",
  I: "Independent"
};

const headers = [
  "Name",
  "Party",
  "State",
  "Years in Office",
  "% Votes with Party"
];

const table = document.getElementById("membersTable");
let selectedState = "";
document.addEventListener('DOMContentLoaded', function() {
    const chamber = getChamberParameter();  
    Promise.all([
        fetchStatesAndCreateDropdown(),
        fetchCongressDataIfNeeded(chamber)
    ]).then(([statesData, congressData]) => {
        makeStatesMenu(statesData);
        filterTable(congressData);  
    }).catch(error => {
        console.error("Error loading data:", error);
    });
});

function makeStatesMenu(statesData) {
    const stateDropdown = document.getElementById("stateDropdown");
    if (!stateDropdown) {
        console.error("State dropdown element not found");
        return;
    }

    stateDropdown.innerHTML = "";  
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a state";
    stateDropdown.appendChild(defaultOption);

    Object.entries(statesData).forEach(([abbr, name]) => {
        const option = document.createElement("option");
        option.value = abbr;
        option.textContent = name;
        stateDropdown.appendChild(option);
    });

    if (selectedState) {
        stateDropdown.value = selectedState;
    }
}

function makeTableHeader() {
  table.innerHTML = "";
  const headerRow = table.insertRow(0);
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.innerHTML = header;
    headerRow.appendChild(th);
  });
}

function makeMembersRows(filteredMembers) {
  filteredMembers.forEach((member) => {
    const row = table.insertRow();
    const memberUrl = member.url;
    const memberName = `${member.first_name} ${member.last_name}`;
    const linkMembers = memberUrl ? `<a href="${memberUrl}" target="_blank">${memberName}</a>` : memberName;

    const cell = row.insertCell();
    cell.innerHTML = linkMembers;

    const partyCell = row.insertCell();
    partyCell.innerHTML = parties[member.party];

    const stateCell = row.insertCell();
    stateCell.innerHTML = member.state;

    const seniorityCell = row.insertCell();
    seniorityCell.innerHTML = member.seniority;

    const votesCell = row.insertCell();
    votesCell.innerHTML = member.votes_with_party_pct ? `${member.votes_with_party_pct}%` : "N/A";
  });
}

const filterSenatorsByPartyAndState = (congressData) => {
  const checkedParties = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((checkbox) => checkbox.value);

  const selectedState = document.getElementById("stateDropdown").value;

  const filteredMembers = congressData ? congressData.filter((member) => {
    const partyFilter = checkedParties.includes(member.party);

    const stateFilter = selectedState === "" || member.state === selectedState;

    return partyFilter && stateFilter;
  }) : [];

  return filteredMembers;
};

function filterTable(congressData) {
  const filteredMembers = filterSenatorsByPartyAndState(congressData);
  makeTableHeader();
  makeMembersRows(filteredMembers);
}

function fetchStatesAndCreateDropdown() {
    return fetch("https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json")
    .then((response) => {
        if (!response.ok) throw new Error("Could not fetch states data");
        return response.json();
    })
    .catch((error) => {
        console.error("Fetch states data error:", error);
    });
}

function fetchCongressDataIfNeeded(chamber) {
  let url = chamber === "house" ? 
    "https://api.propublica.org/congress/v1/117/house/members.json" :
    "https://api.propublica.org/congress/v1/117/senate/members.json";

  return fetch(url, {
    headers: { "X-API-Key": "9IkyH0aHLxluBFhFFPrGpTGlDuNGdKBFOSdJC04Y" }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Could not fetch ${chamber} data`);
    }
    return response.json();
  })
  .then(data => {
    if (data && data.results && data.results[0].members) {
      return data.results[0].members;
    } else {
      throw new Error(`Invalid JSON structure for ${chamber} data`);
    }
  })
  .catch(error => {
    console.error(`Error fetching ${chamber} JSON:`, error);
    throw error; 
  });
}

function setPageContent(chamber) {
  const pageContentElement = document.getElementById("pageContent");
  if (!pageContentElement) {
    console.error("Page content element not found.");
    return;
  }

  if (chamber === "senate") {
    pageContentElement.innerHTML = `
      <h1>Senators</h1>
      <p id="senateParagraph">First convened in 1789, the composition and powers of the Senate are established in Article One of the U.S. Constitution. Each state is represented by two senators, regardless of population, who serve staggered six-year terms. The Senate has several exclusive powers not granted to the House, including consenting to treaties as a precondition to their ratification and consenting to or confirming appointments of Cabinet secretaries, federal judges, other federal executive officials, military officers, regulatory officials, ambassadors, and other federal uniformed officers, as well as trial of federal officials impeached by the House.</p>`;
  } else if (chamber === "house") {
    pageContentElement.innerHTML = `
      <h1>Representatives</h1>
      <p id="houseParagraph">The major power of the House is to pass federal legislation that affects the entire country, although its bills must also be passed by the Senate and further agreed to by the U.S. President before becoming law (unless both the House and Senate re-pass the legislation with a two-thirds majority in each chamber). The House has some exclusive powers: the power to initiate revenue bills, to impeach officials (impeached officials are subsequently tried in the Senate), and to elect the U.S. President in case there is no majority in the Electoral College.</p>
      <p>Each U.S. state is represented in the House in proportion to its population as measured in the census, but every state is entitled to at least one representative.</p>`;
  } else {
    console.error("Invalid chamber specified.");
  }
}

function start() {
  const chamber = getChamberParameter();
  const chamberTitleElement = document.getElementById("chamberTitle");
  if (chamberTitleElement) {
    chamberTitleElement.textContent = chamber === "house" ? "House Members" : "Senate Members";
  }
  fetchCongressDataIfNeeded(chamber)
    .then((data) => {
      filterTable(data);
    })
    .catch((error) => console.error(error));
}

function getChamberParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("chamber") || "senate";
}

const chamberParameter = getChamberParameter();
setPageContent(chamberParameter);

start();

document.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => filterTable());
});

document.getElementById("stateDropdown").addEventListener("change", () => filterTable());

document.addEventListener("DOMContentLoaded", function() {
  const currentPageUrl = window.location.href;
  
  const navLinks = document.querySelectorAll(".navbar-nav a");
  navLinks.forEach(link => {
    if (link.href === currentPageUrl) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const dropdownTitle = document.querySelector(".dropdown-toggle");
  const dropdownItems = document.querySelectorAll(".dropdown-menu a");
  const isChamberPage = currentPageUrl.includes("members.html");
  if (isChamberPage) {
    dropdownTitle.classList.add("active");
    dropdownItems.forEach(item => {
      if (item.href === currentPageUrl) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  } else {
    dropdownTitle.classList.remove("active");
    dropdownItems.forEach(item => item.classList.remove("active"));
  }
});





















document.addEventListener("DOMContentLoaded", function() {
    function getParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const partyNames = {
        D: "Democratic",
        R: "Republican",
        I: "Independent",
        ID: "Independent" 
    };

    function fetchCongressData(chamber) {
        let url;
        if (chamber === "house") {
            url = "117-congress.json"; 
        } else {
            url = "117-senate.json"; 
        }
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not fetch ${chamber} data`);
                }
                return response.json();
            })
            .then(data => {
                if (chamber === "senate") {
                    senateData = data.results[0].members;
                    console.log("Senate Data:", senateData);
                    congressionalStatistics.senate.statistics.averageMissedVotes = calculateAverageMissedVotesByParty(senateData);
                    congressionalStatistics.senate.statistics.votesPercentage = calculateVotesWithPartyPercentage(senateData);
                } else if (chamber === "house") {
                    houseData = data.results[0].members;
                    console.log("House Data:", houseData);
                    congressionalStatistics.house.statistics.averageMissedVotes = calculateAverageMissedVotesByParty(houseData);
                    congressionalStatistics.house.statistics.votesPercentage = calculateVotesWithPartyPercentage(houseData);
                }

                updatePartyCountsTable(chamber);
                updateStatisticsAverageTable(chamber);
                updateLeastEngagedTable(chamber);
                updateMostEngagedTable(chamber);
                updateChamberHeader(chamber); 

                return data;
            })
            .catch(error => {
                console.error(`Error fetching ${chamber} JSON:`, error);
            });
    }

    function countMembersByParty(chamberData) {
        let partyCounts = {
            D: 0, 
            R: 0, 
            I: 0  
        };

        chamberData.forEach(member => {
            const party = member.party;
            if (party === "D") {
                partyCounts.D++;
            } else if (party === "R") {
                partyCounts.R++;
            } else if (party === "I") {
                partyCounts.I++;
            }
        });

        return partyCounts;
    }
    
    function calculateVotesWithPartyPercentage(members) {
        let partyVotesPercentage = {
            D: { total: 0, count: 0 },
            R: { total: 0, count: 0 },
            I: { total: 0, count: 0 }
        };

        members.forEach(member => {
            const party = member.party;
            const votesWithPartyPercentage = member.votes_with_party_pct;

            if (!isNaN(votesWithPartyPercentage)) {
                if (partyVotesPercentage[party]) {
                    partyVotesPercentage[party].total += votesWithPartyPercentage;
                    partyVotesPercentage[party].count++;
                }
            }
        });

        Object.keys(partyVotesPercentage).forEach(party => {
            const totalVotesPercentage = partyVotesPercentage[party].total;
            const memberCount = partyVotesPercentage[party].count;

            if (memberCount > 0) {
                partyVotesPercentage[party] = totalVotesPercentage / memberCount;
            } else {
                partyVotesPercentage[party] = 0; 
            }
        });

        return partyVotesPercentage;
    }

    function calculateLeastEngagedMembers(chamberData) {
        const filteredMembers = chamberData.filter(member => member.missed_votes !== null);

        const sortedMembers = filteredMembers.sort((a, b) => b.missed_votes - a.missed_votes);

        const numberOfMembersToShow = Math.ceil(sortedMembers.length * 0.1);

        return sortedMembers.slice(0, numberOfMembersToShow);
    }

    function calculateMostEngagedMembers(chamberData) {
        const filteredMembers = chamberData.filter(member => member.missed_votes !== null);

        const sortedMembers = filteredMembers.sort((a, b) => a.missed_votes - b.missed_votes);

        const numberOfMembersToShow = Math.ceil(sortedMembers.length * 0.1);

        return sortedMembers.slice(0, numberOfMembersToShow);
    }

    function updatePartyCountsTable(chamber) {
        const tbody = document.getElementById("statisticsTableBody");
        if (!tbody) {
            console.error("Table body not found for party counts table.");
            return;
        }

        tbody.innerHTML = "";

        let partyCounts;
        if (chamber === "senate") {
            partyCounts = countMembersByParty(senateData);
        } else if (chamber === "house") {
            partyCounts = countMembersByParty(houseData);
        } else {
            console.error("Invalid chamber:", chamber);
            return;
        }

        Object.entries(partyCounts).forEach(([party, count]) => {
            const row = document.createElement("tr");

            const partyCell = document.createElement("td");
            partyCell.textContent = partyNames[party]; 
            row.appendChild(partyCell);

            const countCell = document.createElement("td");
            countCell.textContent = count;
            row.appendChild(countCell);

            const percentageCell = document.createElement("td");
            percentageCell.textContent = congressionalStatistics[chamber].statistics.votesPercentage[party].toFixed(2) + "%";  
            row.appendChild(percentageCell);

            tbody.appendChild(row);
        });
    }

    function updateStatisticsAverageTable(chamber) {
        const tbody = document.getElementById("statisticsAverageTableBody");
        if (!tbody) {
            console.error("Table body not found for average missed votes table.");
            return;
        }

        tbody.innerHTML = "";

        let averageMissedVotes;
        if (chamber === "senate") {
            averageMissedVotes = congressionalStatistics.senate.statistics.averageMissedVotes;
        } else if (chamber === "house") {
            averageMissedVotes = congressionalStatistics.house.statistics.averageMissedVotes;
        } else {
            console.error("Invalid chamber:", chamber);
            return;
        }

        Object.entries(averageMissedVotes).forEach(([party, data]) => {
            const row = document.createElement("tr");

            const partyCell = document.createElement("td");
            partyCell.textContent = partyNames[party]; 
            row.appendChild(partyCell);

            const averageMissedVotesCell = document.createElement("td");
            averageMissedVotesCell.textContent = data.averageMissedVotes.toFixed(2);
            row.appendChild(averageMissedVotesCell);

            tbody.appendChild(row);
        });
    }

    function updateLeastEngagedTable(chamber) {
        const tbody = document.getElementById("leastEngagedTableBody");
        if (!tbody) {
            console.error("Table body not found for least engaged table.");
            return;
        }

        tbody.innerHTML = "";

        const leastEngagedMembers = calculateLeastEngagedMembers(chamber === "senate" ? senateData : houseData);
        const top10LeastEngagedMembers = leastEngagedMembers.slice(0, 10); 
        top10LeastEngagedMembers.forEach(member => {
            const row = document.createElement("tr");
            const memberName = `${member.first_name} ${member.last_name}`;
            row.innerHTML = `
                <td>${memberName}</td>
                <td>${member.missed_votes}</td>
                <td>${member.missed_votes_pct.toFixed(2)}%</td>
            `;
            tbody.appendChild(row);
        });
    }

    function updateMostEngagedTable(chamber) {
        const tbody = document.getElementById("mostEngagedTableBody");
        if (!tbody) {
            console.error("Table body not found for most engaged table.");
            return;
        }

        tbody.innerHTML = "";

        const mostEngagedMembers = calculateMostEngagedMembers(chamber === "senate" ? senateData : houseData);
        const top10MostEngagedMembers = mostEngagedMembers.slice(0, 10); 
        top10MostEngagedMembers.forEach(member => {
            const row = document.createElement("tr");
            const memberName = `${member.first_name} ${member.last_name}`;
            row.innerHTML = `
                <td>${memberName}</td>
                <td>${member.missed_votes}</td>
                <td>${member.missed_votes_pct.toFixed(2)}%</td>
            `;
            tbody.appendChild(row);
        });
    }

    function updateChamberHeader(chamber) {
        const chamberHeader = document.getElementById("chamberHeader");
        if (!chamberHeader) {
            console.error("Chamber header element not found.");
            return;
        }

        chamberHeader.textContent = chamber === "senate" ? "Senate at a Glance" : "House at a Glance";
    }

    let senateData = [];
    let houseData = [];

    let congressionalStatistics = {
        senate: {
            statistics: {
                averageMissedVotes: {},
                votesPercentage: {}
            }
        },
        house: {
            statistics: {
                averageMissedVotes: {},
                votesPercentage: {}
            }
        }
    };

    function calculateAverageMissedVotesByParty(members) {
        const partyAverages = {};

        members.forEach(member => {
            const party = member.party;
            const missedVotes = member.missed_votes;

            if (missedVotes !== undefined && missedVotes !== null) {
                if (!partyAverages[party]) {
                    partyAverages[party] = {
                        totalMissedVotes: 0,
                        memberCount: 0
                    };
                }

                partyAverages[party].totalMissedVotes += missedVotes;
                partyAverages[party].memberCount++;
            }
        });

        Object.keys(partyAverages).forEach(party => {
            const totalMissedVotes = partyAverages[party].totalMissedVotes;
            const memberCount = partyAverages[party].memberCount;

            if (memberCount > 0) {
                partyAverages[party].averageMissedVotes = totalMissedVotes / memberCount;
            } else {
                partyAverages[party].averageMissedVotes = NaN;
            }
        });

        return partyAverages;
    }

    const chamberParam = getParam('chamber');

    fetchCongressData(chamberParam);
});

document.addEventListener("DOMContentLoaded", function() {
  const currentPageUrl = window.location.href;
  
  const navLinks = document.querySelectorAll(".navbar-nav a");
  navLinks.forEach(link => {
    if (link.href === currentPageUrl) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const dropdownTitle = document.querySelector(".dropdown-toggle");
  const dropdownItems = document.querySelectorAll(".dropdown-menu a");
  const isChamberPage = currentPageUrl.includes("attendance.html");
  if (isChamberPage) {
    dropdownTitle.classList.add("active");
    dropdownItems.forEach(item => {
      if (item.href === currentPageUrl) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  } else {
    dropdownTitle.classList.remove("active");
    dropdownItems.forEach(item => item.classList.remove("active"));
  }
});


































document.addEventListener("DOMContentLoaded", function() {
    function getParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const partyNames = {
        D: "Democratic",
        R: "Republican",
        I: "Independent",
        ID: "Independent" 
    };

    function fetchCongressData(chamber) {
        let url;
        if (chamber === "house") {
            url = "117-congress.json"; 
        } else {
            url = "117-senate.json"; 
        }
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not fetch ${chamber} data`);
                }
                return response.json();
            })
            .then(data => {
                if (chamber === "senate") {
                    senateData = data.results[0].members;
                } else if (chamber === "house") {
                    houseData = data.results[0].members;
                }

                updatePartyCountsTable(chamber);
                updateLeastLoyalTable(chamber);
                updateMostLoyalTable(chamber);
                updateChamberHeader(chamber); 

                return data;
            })
            .catch(error => {
                console.error(`Error fetching ${chamber} JSON:`, error);
            });
    }

    function countMembersByParty(chamberData) {
        let partyCounts = {
            D: 0, 
            R: 0, 
            I: 0  
        };

        chamberData.forEach(member => {
            const party = member.party;
            if (party === "D") {
                partyCounts.D++;
            } else if (party === "R") {
                partyCounts.R++;
            } else if (party === "I") {
                partyCounts.I++;
            }
        });

        return partyCounts;
    }
    
    function calculateVotesWithPartyPercentage(members) {
        let partyVotesPercentage = {
            D: { total: 0, count: 0 },
            R: { total: 0, count: 0 },
            I: { total: 0, count: 0 }
        };

        members.forEach(member => {
            const party = member.party;
            const votesWithPartyPercentage = member.votes_with_party_pct;

            if (!isNaN(votesWithPartyPercentage)) {
                if (partyVotesPercentage[party]) {
                    partyVotesPercentage[party].total += votesWithPartyPercentage;
                    partyVotesPercentage[party].count++;
                }
            }
        });

        Object.keys(partyVotesPercentage).forEach(party => {
            const totalVotesPercentage = partyVotesPercentage[party].total;
            const memberCount = partyVotesPercentage[party].count;

            if (memberCount > 0) {
                partyVotesPercentage[party] = totalVotesPercentage / memberCount;
            } else {
                partyVotesPercentage[party] = 0; 
            }
        });

        return partyVotesPercentage;
    }

    function calculateLeastLoyalMembers(chamberData) {
        const filteredMembers = chamberData.filter(member => member.votes_with_party_pct !== null);

        const sortedMembers = filteredMembers.sort((a, b) => a.votes_with_party_pct - b.votes_with_party_pct);

        const numberOfMembersToShow = Math.ceil(sortedMembers.length * 0.1);

        return sortedMembers.slice(0, numberOfMembersToShow);
    }

    function calculateMostLoyalMembers(chamberData) {
        const filteredMembers = chamberData.filter(member => member.votes_with_party_pct !== null);

        const sortedMembers = filteredMembers.sort((a, b) => b.votes_with_party_pct - a.votes_with_party_pct);

        const numberOfMembersToShow = Math.ceil(sortedMembers.length * 0.1);

        return sortedMembers.slice(0, numberOfMembersToShow);
    }

    function updatePartyCountsTable(chamber) {
        const tbody = document.getElementById("statisticsTableBody");
        if (!tbody) {
            console.error("Table body not found for party counts table.");
            return;
        }

        tbody.innerHTML = "";

        let partyCounts;
        if (chamber === "senate") {
            partyCounts = countMembersByParty(senateData);
        } else if (chamber === "house") {
            partyCounts = countMembersByParty(houseData);
        } else {
            console.error("Invalid chamber:", chamber);
            return;
        }

        Object.entries(partyCounts).forEach(([party, count]) => {
            const row = document.createElement("tr");

            const partyCell = document.createElement("td");
            partyCell.textContent = partyNames[party]; 
            row.appendChild(partyCell);

            const countCell = document.createElement("td");
            countCell.textContent = count;
            row.appendChild(countCell);

            const percentageCell = document.createElement("td");
            percentageCell.textContent = calculateVotesWithPartyPercentage(chamber === "senate" ? senateData : houseData)[party].toFixed(2) + "%";  
            row.appendChild(percentageCell);

            tbody.appendChild(row);
        });
    }

    function updateLeastLoyalTable(chamber) {
    const tbody = document.getElementById("leastLoyalTableBody");
    if (!tbody) {
        console.error("Table body not found for least loyal table.");
        return;
    }

    tbody.innerHTML = "";

    const leastLoyalMembers = calculateLeastLoyalMembers(chamber === "senate" ? senateData : houseData);
    const top10LeastLoyalMembers = leastLoyalMembers.slice(0, 10); 
    top10LeastLoyalMembers.forEach(member => {
        const row = document.createElement("tr");
        const memberName = `${member.first_name} ${member.last_name}`;
        row.innerHTML = `
            <td>${memberName}</td>
            <td>${member.total_votes}</td>
            <td>${member.votes_against_party_pct.toFixed(2)}%</td>
        `;
        tbody.appendChild(row);
    });
}

function updateMostLoyalTable(chamber) {
    const tbody = document.getElementById("mostLoyalTableBody");
    if (!tbody) {
        console.error("Table body not found for most loyal table.");
        return;
    }

    tbody.innerHTML = "";

    const mostLoyalMembers = calculateMostLoyalMembers(chamber === "senate" ? senateData : houseData);
    const top10MostLoyalMembers = mostLoyalMembers.slice(0, 10); 
    top10MostLoyalMembers.forEach(member => {
        const row = document.createElement("tr");
        const memberName = `${member.first_name} ${member.last_name}`;
        row.innerHTML = `
            <td>${memberName}</td>
            <td>${member.total_votes}</td>
            <td>${member.votes_with_party_pct.toFixed(2)}%</td>
        `;
        tbody.appendChild(row);
    });
}

    function updateChamberHeader(chamber) {
        const chamberHeader = document.getElementById("chamberHeader");
        if (!chamberHeader) {
            console.error("Chamber header not found.");
            return;
        }

        if (chamber === "senate") {
            chamberHeader.textContent = "Senate at a Glance";
        } else if (chamber === "house") {
            chamberHeader.textContent = "House at a Glance";
        } else {
            console.error("Invalid chamber:", chamber);
        }
    }

    const chamberParam = getParam("chamber") || "senate"; 
    fetchCongressData(chamberParam);
});
document.addEventListener("DOMContentLoaded", function() {
  const currentPageUrl = window.location.href;
  
  const navLinks = document.querySelectorAll(".navbar-nav a");
  navLinks.forEach(link => {
    if (link.href === currentPageUrl) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const dropdownTitle = document.querySelector(".dropdown-toggle");
  const dropdownItems = document.querySelectorAll(".dropdown-menu a");
  const isChamberPage = currentPageUrl.includes("loyalty.html") || currentPageUrl.includes("loyalty.html");
  if (isChamberPage) {
    dropdownTitle.classList.add("active");
    dropdownItems.forEach(item => {
      if (item.href === currentPageUrl) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  } else {
    dropdownTitle.classList.remove("active");
    dropdownItems.forEach(item => item.classList.remove("active"));
  }
});