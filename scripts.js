import GLOBAL from "./global.js";

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
    const linkMembers = memberUrl
      ? `<a href="${memberUrl}" target="_blank">${memberName}</a>`
      : memberName;

    const cell = row.insertCell();
    cell.innerHTML = linkMembers;

    const partyCell = row.insertCell();
    partyCell.innerHTML = parties[member.party];

    const stateCell = row.insertCell();
    stateCell.innerHTML = member.state;

    const seniorityCell = row.insertCell();
    seniorityCell.innerHTML = member.seniority;

    const votesCell = row.insertCell();
    votesCell.innerHTML = member.votes_with_party_pct
      ? `${member.votes_with_party_pct}%`
      : "N/A";
  });
}

const filterSenatorsByPartyAndState = (congressData) => {
  const checkedParties = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((checkbox) => checkbox.value);

  const selectedState = document.getElementById("stateDropdown").value;

  const filteredMembers = congressData
    ? congressData.filter((member) => {
        const partyFilter = checkedParties.includes(member.party);

        const stateFilter =
          selectedState === "" || member.state === selectedState;

        return partyFilter && stateFilter;
      })
    : [];

  return filteredMembers;
};

function filterTable(congressData) {
  const filteredMembers = filterSenatorsByPartyAndState(congressData);
  makeTableHeader();
  makeMembersRows(filteredMembers);
}

function fetchStatesAndCreateDropdown() {
  return fetch(
    "https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json"
  )
    .then((response) => {
      if (!response.ok) throw new Error("Could not fetch states data");
      return response.json();
    })
    .catch((error) => {
      console.error("Fetch states data error:", error);
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

function getChamberParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("chamber") || "senate";
}

const chamberParameter = getChamberParameter();
setPageContent(chamberParameter);

// * Event Listeners

document.addEventListener("DOMContentLoaded", function () {
  const chamber = getChamberParameter();
  Promise.all([
    fetchStatesAndCreateDropdown(),
    GLOBAL.fetchCongressData(chamber)
  ])
    .then(([statesData, congressData]) => {
      makeStatesMenu(statesData);
      filterTable(congressData);
    })
    .catch((error) => {
      console.error("Error loading data:", error);
    });
});

document.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
  const chamber = getChamberParameter();
  checkbox.addEventListener("change", () => filterTable(GLOBAL.DATA[chamber]));
});

document.getElementById("stateDropdown").addEventListener("change", () => {
  const chamber = getChamberParameter();
  filterTable(GLOBAL.DATA[chamber]);
});

document.addEventListener("DOMContentLoaded", function () {
  const currentPageUrl = window.location.href;

  const navLinks = document.querySelectorAll(".navbar-nav a");
  navLinks.forEach((link) => {
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
    dropdownItems.forEach((item) => {
      if (item.href === currentPageUrl) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  } else {
    dropdownTitle.classList.remove("active");
    dropdownItems.forEach((item) => item.classList.remove("active"));
  }
});
