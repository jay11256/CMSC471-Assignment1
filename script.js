// Constants
const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const dataPath = "data/" // CHANGE TO PATH TO DATA

let allData = []; // Initialize in init()
let filteredData = [];

// Init
function init() {

    // Initialize data
    // 

    d3.csv(dataPath,
        d => ({

            // Change variable names (and convert some to numeric using +)
            // Ex: 
            // country: d.country,
            // year: +d.year

        }))
        .then(data =>
            allData = data

            // Setup
            // selector(s)?

            // axes
            // vis (bubbles representing datapoints)

        )
        .catch(error => console.error('Error loading data: ', error));
}


function setupSelector() {
    // Handles UI changes (sliders, dropdowns)
    // Anytime the user tweaks something, this function reacts.
    // May need to call updateAxes() and updateVis() here when needed!

}

function updateAxes() {
    // Draws the x-axis and y-axis
    // Adds ticks, labels, and makes sure everything lines up nicely
}

function updateVis() {
    // Updates bubbles

    // Filter data
    // Define enter, update, exit behaviors

}



window.addEventListener('load', init);

// Create SVG
const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

