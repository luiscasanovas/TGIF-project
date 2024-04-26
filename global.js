const DATA = {
  house: [],
  senate: []
}
function fetchCongressData(chamber) {
  const url =
    chamber === "house"
      ? "https://api.propublica.org/congress/v1/117/house/members.json"
      : "https://api.propublica.org/congress/v1/117/senate/members.json";

  if (chamber === "house" && DATA.house.lengh > 0) {
    return DATA.house;
  } else if (chamber === "senate" && DATA.senate.lengh > 0) {
    return DATA.senate;
  }

  return fetch(url, {
    headers: {
      "X-API-Key": "9IkyH0aHLxluBFhFFPrGpTGlDuNGdKBFOSdJC04Y"
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not fetch ${chamber} data`);
      }
      return response.json();
    })
    .then((response) => {
      if (response && response.results && response.results[0].members) {
        if (chamber === "house") {
          DATA.house = response.results[0].members;
        } else {
          DATA.senate = response.results[0].members;
        }

        return response.results[0].members
      } else {
        throw new Error(`Invalid JSON structure for ${chamber} data`);
      }
    })
    .catch((error) => console.error(error));
}
const GLOBAL = {
  fetchCongressData: fetchCongressData,
  DATA: DATA
};
  function setActiveState() {
    var currentPage = window.location.pathname;

    var dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(function(toggle) {
      toggle.classList.remove('active');
    });

     if (currentPage === '/' || currentPage === '/index.html') {
        document.querySelector('.navbar-brand').classList.add('active'); 
    } else if (currentPage.includes('members.html')) {
        document.getElementById('navbarDropdown1').classList.add('active'); 
    } else if (currentPage.includes('attendance.html')) {
        document.getElementById('navbarDropdown2').classList.add('active'); 
    } else if (currentPage.includes('loyalty.html')) {
        document.getElementById('navbarDropdown3').classList.add('active'); 
    }
}

  window.onload = setActiveState;

export default GLOBAL;