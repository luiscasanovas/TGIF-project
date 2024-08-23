# Congressional Statistics Dashboard

## Overview

This web application provides an interactive dashboard for analyzing data on members of the U.S. Congress. Users can view statistics such as party representation, voting behavior, and engagement levels for both the Senate and the House of Representatives.

## Features

- **Party Representation**: Displays the number of representatives from each party and their average voting alignment with their party.
- **Average Missed Votes**: Shows the average number of missed votes per party.
- **Least Engaged Members**: Lists the members with the highest number of missed votes.
- **Most Engaged Members**: Lists the members with the lowest number of missed votes.

## Requirements

- A modern web browser (e.g., Chrome, Firefox, Edge)
- Internet connection to fetch data from the provided JSON files

## Files

- `index.html`: The main HTML file containing the structure and layout of the dashboard.
- `styles.css`: CSS file for styling the dashboard.
- `statistics.js`: JavaScript file handling data fetching, processing, and updating the dashboard.

## How to Use

1. **Set Up Data Files**
   - Ensure that the JSON files `117-congress.json` and `117-senate.json` are available in the same directory as `index.html`. These files contain data on members of the House and Senate, respectively.

2. **Open the Application**
   - Open `index.html` in a web browser. The application will load and display the dashboard.

3. **Interact with the Dashboard**
   - The dashboard will automatically fetch data from the JSON files and display:
     - **Party Counts Table**: Number of representatives from each party and their percentage of voting alignment.
     - **Average Missed Votes Table**: Average number of missed votes for each party.
     - **Least Engaged Members Table**: Members with the highest number of missed votes.
     - **Most Engaged Members Table**: Members with the lowest number of missed votes.

4. **Change Chamber**
   - Modify the `chamber` query parameter in the URL to view data for either the Senate or the House. For example:
     - `index.html?chamber=senate` to view Senate data
     - `index.html?chamber=house` to view House data

## Code Structure

- **HTML (index.html)**
  - Contains the main layout and structure of the dashboard, including tables for displaying statistics.
  
- **CSS (styles.css)**
  - Provides styles for the dashboard to ensure a clean and readable layout.

- **JavaScript (statistics.js)**
  - Handles fetching data from JSON files, calculating statistics, and updating the dashboard tables.
  
## Example Usage

To view data for the Senate:
1. Open `index.html?chamber=senate` in your browser.
2. The dashboard will display Senate-specific statistics.

To view data for the House:
1. Open `index.html?chamber=house` in your browser.
2. The dashboard will display House-specific statistics.



## Acknowledgments

- The data for this application is sourced from publicly available JSON files.

