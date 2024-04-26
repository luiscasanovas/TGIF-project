function getDefaultChamber() {
    return 'senate';
}

import GLOBAL from "./global.js";

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

document.addEventListener("DOMContentLoaded", function() {
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

const chamberParam = getParam('chamber') || getDefaultChamber();

    GLOBAL.fetchCongressData(chamberParam).then(data => {
        if (chamberParam === "senate") {
            senateData = data;
            congressionalStatistics.senate.statistics.averageMissedVotes = calculateAverageMissedVotesByParty(senateData);
            congressionalStatistics.senate.statistics.votesPercentage = calculateVotesWithPartyPercentage(senateData);
        } else if (chamberParam === "house") {
            houseData = data;
            congressionalStatistics.house.statistics.averageMissedVotes = calculateAverageMissedVotesByParty(houseData);
            congressionalStatistics.house.statistics.votesPercentage = calculateVotesWithPartyPercentage(houseData);
        }

        updatePartyCountsTable(chamberParam);
        updateStatisticsAverageTable(chamberParam);
        updateLeastEngagedTable(chamberParam);
        updateMostEngagedTable(chamberParam);
        updateChamberHeader(chamberParam);
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