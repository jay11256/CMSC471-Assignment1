// Constants
const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const dataPath = "data/processed.csv" // CHANGE TO PATH TO DATA

let allData = []; // Initialize in init()
let filteredData = []; 


// PLACEHOLDER VARIABLES
let xVar = 'latitude'
let yVar = 'WDF5'
let sizeVar = 'AWND'

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
            // station,state,latitude,longitude,elevation,date,TMIN,TMAX,TAVG,AWND,WDF5,WSF5,SNOW,SNWD,PRCP,date_int
            station: d.station,
            state: d.state,
            latitude: +d.latitude,
            longitude: +d.longitude,
            elevation: +d.elevation,
            date: d.date,
            TMIN: +d.TMIN,
            TMAX: +d.TMAX,
            TAVG: +d.TAVG,
            AWND: +d.AWND,
            WDF5: +d.WDF5,
            WSF5: +d.WSF5,
            SNOW: +d.SNOW,
            SNWD: +d.SNWD,
            PRCP: +d.PRCP,
            date_int: +d.date_int


        }))
        .then(data => {
            // console.log(data)
            allData = data
            // Setup
            // selector(s)?

            // axes
            updateAxes()
            // vis (bubbles representing datapoints)

})
        .catch(error => console.error('Error loading data: ', error));
        
}


function setupSelector() {
    // Handles UI changes (sliders, dropdowns)
    // Anytime the user tweaks something, this function reacts.
    // May need to call updateAxes() and updateVis() here when needed!

}

function updateAxes(){
  // Draws the x-axis and y-axis
  // Adds ticks, labels, and makes sure everything lines up nicely
    svg.selectAll('.axis').remove()
    svg.selectAll('.labels').remove()
    xScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[xVar])])
        .range([0, width]);
    const xAxis = d3.axisBottom(xScale)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`) // Position at the bottom
        .call(xAxis);

    yScale = d3.scaleLinear()
        .domain([d3.max(allData, d => d[yVar]),0])
        .range([0, height]);
    const yAxis = d3.axisLeft(yScale)

    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);

    sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(allData, d => d[sizeVar])]) // Largest bubble = largest data point 
        .range([5, 20]); // Feel free to tweak these values if you want bigger or smaller bubbles

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text(xVar) // Displays the current x-axis variable
        .attr('class', 'labels')

    // Y-axis label (rotated)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text(yVar) // Displays the current y-axis variable
        .attr('class', 'labels')
}
function updateVis() {
    // Updates bubbles

    // Filter data
    // Define enter, update, exit behaviors

}



window.addEventListener('load', init);

// Create SVG
const svg = d3.selectAll('.vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

