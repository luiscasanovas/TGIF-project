function getDefaultChamber() {
    return 'senate';
}
import GLOBAL from "./global.js";

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
let senateData = [];
let houseData = [];
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

const chamberParam = getParam('chamber') || getDefaultChamber();
    GLOBAL.fetchCongressData(chamberParam).then(data => {
                if (chamberParam === "senate") {
                    senateData = data;
                } else if (chamberParam === "house") {
                    houseData = data;
                }

                updatePartyCountsTable(chamberParam);
                updateLeastLoyalTable(chamberParam);
                updateMostLoyalTable(chamberParam);
                updateChamberHeader(chamberParam); 

                return data;
            })
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