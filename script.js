// Constants
const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 500 - margin.left - margin.right;
const height = 350 - margin.top - margin.bottom;

const stations = [
    'PATUXENT RIVER NAS',
    'HAGERSTOWN WASHINGTON CO AP',
    'BALTIMORE WASH INTL AP',
    'OCEAN CITY MUNI AP'
];
const colorScale = d3.scaleOrdinal(stations, d3.schemeSet2); // d3.schemeSet2 is a set of predefined colors. 

const dataPath = "data/processed.csv" // CHANGE TO PATH TO DATA

t = 1000;
let allData = []; // Initialize in init()
let filteredData = [];

// PLACEHOLDER VARIABLES
let xVar = 'TMIN'
let yVar = 'AWND'
let sizeVar = 'PRCP'

// Init
function init() {

    // Initialize data
    d3.csv(dataPath,
        d => ({
            // Change variable names (and convert some to numeric using +)
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

            update()

        })
        .catch(error => console.error('Error loading data: ', error));

}


function setupSelector() {
    // Handles UI changes (sliders, dropdowns)
    // Anytime the user tweaks something, this function reacts.
    // May need to call updateAxes() and updateVis() here when needed!

}

function updateAxes(svg) {
    
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
        .domain([d3.max(allData, d => d[yVar]), 0])
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
function resetPoints() {
    d3.selectAll('.points')
        .style('opacity', 0.5)
        .style('stroke', 'none')
        .style('stroke-width', 0);
}

function updateVis(svg, stationData = allData) {
    let currentData = stationData;

    svg.selectAll('.points')
        .data(currentData, d => d.date)
        .join(
            function(enter) {
                return enter
                    .append('circle')
                    .attr('class', 'points')
                    .attr('cx', d => xScale(d[xVar]))
                    .attr('cy', d => yScale(d[yVar]))
                    .style('fill', d => colorScale(d.station))
                    .style('opacity', 0.5)
                    .attr('r', 0)
                    .on('mouseover', function(event, d) {
                        d3.selectAll('.points')
                            .style('opacity', function(p) {
                                if (p.date === d.date) {
                                    return 1;
                                } else {
                                    return 0.1;
                                }
                            })
                            .style('stroke', function(p) {
                                if (p.date === d.date) {
                                    return 'black';
                                } else {
                                    return 'none';
                                }
                            })
                            .style('stroke-width', function(p) {
                                if (p.date === d.date) {
                                    return 2;
                                } else {
                                    return 0;
                                }
                            });
                    })
                    .on('mouseout', function() {
                        resetPoints();
                    })
                    .transition()
                    .duration(t)
                    .attr('r', d => sizeScale(d[sizeVar]));
            },
            function(update) {
                return update
                    .transition()
                    .duration(t)
                    .attr('cx', d => xScale(d[xVar]))
                    .attr('cy', d => yScale(d[yVar]))
                    .attr('r', d => sizeScale(d[sizeVar]))
                    .style('fill', d => colorScale(d.station));
            },
            function(exit) {
                return exit
                    .transition()
                    .duration(t)
                    .attr('r', 0)
                    .remove();
            }
        );
}


function makeBrush(svg, stationData) {
    let brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("brush end", function(event) {
            if (!event.selection) {
                resetPoints();
                return;
            }

            let x0 = event.selection[0][0];
            let y0 = event.selection[0][1];
            let x1 = event.selection[1][0];
            let y1 = event.selection[1][1];

            let selectedDates = [];

            stationData.forEach(function(d) {
                let cx = xScale(d[xVar]);
                let cy = yScale(d[yVar]);

                if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
                    selectedDates.push(d.date);
                }
            });

            d3.selectAll('.points')
                .style('opacity', function(d) {
                    if (selectedDates.includes(d.date)) {
                        return 1;
                    } else {
                        return 0.1;
                    }
                })
                .style('stroke', function(d) {
                    if (selectedDates.includes(d.date)) {
                        return 'black';
                    } else {
                        return 'none';
                    }
                })
                .style('stroke-width', function(d) {
                    if (selectedDates.includes(d.date)) {
                        return 2;
                    } else {
                        return 0;
                    }
                });
        });

    svg.selectAll(".brush").remove();

    svg.append("g")
        .attr("class", "brush")
        .call(brush);
}

function update() {
    let patuxentData = allData.filter(d => d.station === 'PATUXENT RIVER NAS');
    let hagerstownData = allData.filter(d => d.station === 'HAGERSTOWN WASHINGTON CO AP');
    let baltimoreData = allData.filter(d => d.station === 'BALTIMORE WASH INTL AP');
    let oceanData = allData.filter(d => d.station === 'OCEAN CITY MUNI AP');

    updateAxes(svgPatuxent);
    updateAxes(svgHagerstown);
    updateAxes(svgBaltimore);
    updateAxes(svgOcean);

    updateVis(svgPatuxent, patuxentData);
    updateVis(svgHagerstown, hagerstownData);
    updateVis(svgBaltimore, baltimoreData);
    updateVis(svgOcean, oceanData);

    makeBrush(svgPatuxent, patuxentData);
    makeBrush(svgHagerstown, hagerstownData);
    makeBrush(svgBaltimore, baltimoreData);
    makeBrush(svgOcean, oceanData);
}
window.addEventListener('load', init);

// Create SVGs
const svgPatuxent = d3.select('#visP')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const svgHagerstown = d3.select('#visH')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const svgBaltimore = d3.select('#visB')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const svgOcean = d3.select('#visO')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

