// Constants
const margin = { top: 100, right: 60, bottom: 60, left: 100 };
const width = 600 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const stations = [
    'PATUXENT RIVER NAS',
    'HAGERSTOWN WASHINGTON CO AP',
    'BALTIMORE WASH INTL AP',
    'OCEAN CITY MUNI AP'
];
const mapping = {
    "TMIN": "Minimum Temperature (F)",
    "TMAX": "Maximum Temperature (F)",
    "AWND": "Average Wind Speed (MPH)",
    "WSF5": "Fastest Wind Speed (MPH)",
    "PRCP": "Precipitation (In)"
}
const options = ['TMIN', 'TMAX', 'AWND', 'WSF5', 'PRCP']
const dataPath = "data/processed.csv" // CHANGE TO PATH TO DATA
const parseDate = d3.timeParse("%Y-%m-%d")

t = 1000;
let allData = []; // Initialize in init()
let filteredData = [];

// PLACEHOLDER VARIABLES
let xVar = 'TMIN'
let yVar = 'AWND'
let sizeVar = 'PRCP'
let seasonVar = 'All'

// Handling Colors
const blank = "#DDDDDD";
const seasons = ["All", "Spring", "Summer", "Fall", "Winter"];
let seasonColors = [blank, "#2ca02c", "#ff7f0e", "#d62728", "#1f77b4"];
function getSeason(date) {
    const month = date.getMonth() + 1; // JS months: 0-11
    if (month >= 3 && month <= 4) return "Spring";
    else if (month >= 5 && month <= 7) return "Summer";
    else if (month >= 8 && month <= 11) return "Fall";
    else return "Winter"; // Dec, Jan, Feb
}
let colorScale = d3.scaleOrdinal()
    .domain(seasons)
    .range(seasonColors);

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
            date: parseDate(d.date),
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
            // const minDate = d3.min(data, d => d.date)
            // const maxDate = d3.max(data, d => d.date)
            // colorScale = colorScale.domain([minDate, maxDate])
            allData = data
            setupSelector()
            update()
        })
        .catch(error => console.error('Error loading data: ', error));
}

function setupSelector() {
    d3.selectAll(".variable")
        .each(function () {
            d3.select(this).selectAll("myOptions")
                .data(options)
                .enter()
                .append("option")
                .text(d => mapping[d])
                .attr("value", d => d)
        })
        .on("change", function (event) {
            // placeholder?
            console.log(d3.select(this).property("id"))
            console.log(d3.select(this).property("value"))
            if (d3.select(this).property("id") === "xVariable") {
                xVar = d3.select(this).property("value")
            }
            if (d3.select(this).property("id") === "yVariable") {
                yVar = d3.select(this).property("value")
            }
            if (d3.select(this).property('id') === "sizeVariable") {
                sizeVar = d3.select(this).property("value")
            }
            update();
        })
    d3.select("#xVariable").property("value", xVar)
    d3.select("#yVariable").property("value", yVar)
    d3.select("#sizeVariable").property("value", sizeVar)

    d3.selectAll("#seasonVariable")
        .each(function() {
            d3.select(this).selectAll("seasonOptions")
                .data(seasons)
                .enter()
                .append("option")
                .text(d => d)
                .attr("value", d => d)
        })
        .on("change", function (event) {
            seasonVar = d3.select(this).property("value");
            seasonColors = [blank, blank, blank, blank, blank];
            switch (seasonVar) {
                case "All":
                    seasonColors = [blank, "#2ca02c", "#ff7f0e", "#d62728", "#1f77b4"];
                    break;
                case "Spring":
                    seasonColors[1] = "#2ca02c";
                    break;
                case "Summer":
                    seasonColors[2] = "#ff7f0e";
                    break;
                case "Fall":
                    seasonColors[3] = "#d62728";
                    break;
                case "Winter":
                    seasonColors[4] = "#1f77b4";
                    break;
            }

            colorScale = d3.scaleOrdinal()
                .domain(seasons)
                .range(seasonColors);
            update();
        })
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
        .range([4, 7]); // Feel free to tweak these values if you want bigger or smaller bubbles

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text(mapping[xVar]) // Displays the current x-axis variable
        .attr('class', 'labels')

    // Y-axis label (rotated)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text(mapping[yVar]) // Displays the current y-axis variable
        .attr('class', 'labels')

    // Plot Title
    let title;
    switch (svg) {
        case svgPatuxent:
            title = "Patuxent";
            break;
        case svgHagerstown:
            title = "Hagerstown";
            break;
        case svgBaltimore:
            title = "Baltimore";
            break;
        case svgOcean:
            title = "Ocean City";
            break;
    }
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text(title) // Displays the current title
        .attr('class', 'labels titles')
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
        .data(currentData, d => d.date_int)
        .join(
            function (enter) {
                return enter
                    .append('circle')
                    .attr('class', 'points')
                    .attr('cx', d => xScale(d[xVar]))
                    .attr('cy', d => yScale(d[yVar]))
                    .attr('fill', d => colorScale(getSeason(d.date)))
                    .style('opacity', 0.5)
                    .attr('r', 0)
                    // .on('mouseover', function (event, d) {
                    //     d3.selectAll('.points')
                    //         .style('opacity', p => p.date_int === d.date_int ? 1 : 0.1)
                    //         .style('stroke', p => p.date_int === d.date_int ? 'black' : 'none')
                    //         .style('stroke-width', p => p.date_int === d.date_int ? 2 : 0);
                    // })
                    // .on('mouseout', function () {
                    //     resetPoints();
                    // })
                    .transition()
                    .duration(t)
                    .attr('r', d => sizeScale(d[sizeVar]));
            },
            function (update) {
                return update
                    .transition()
                    .duration(t)
                    .attr('cx', d => xScale(d[xVar]))
                    .attr('cy', d => yScale(d[yVar]))
                    .attr('r', d => sizeScale(d[sizeVar]))
                    .attr('fill', d => colorScale(getSeason(d.date)))
            },
            function (exit) {
                return exit
                    .transition()
                    .duration(t)
                    .attr('r', 0)
                    .remove();
            }
        );
}

function addLegend(svg) {
    let size = 10;
    let squares = svg.selectAll(".legendSquare")
        .data(seasons.slice(1));

    squares.join(
        enter => enter.append("rect")
            .attr("class", "legendSquare legends")
            .attr("y", -margin.top/2 + 15)
            .attr("x", (d,i) => i*(size+70)+15)
            .attr("width", size)
            .attr("height", size)
            .attr("fill", d => colorScale(d)),

        update => update
            .transition()
            .duration(t)
            .attr("fill", d => colorScale(d))
    );

    let labels = svg.selectAll(".legendLabel")
        .data(seasons.slice(1));
    labels.join(
        enter => enter.append("text")
            .attr("class", "legendLabel legends")
            .attr("y", -margin.top/2 + size + 15)
            .attr("x", (d,i) => i*(size+70)+30)
            .attr("text-anchor", "left")
            .style("font-size", "13px")
            .text(d => d)
            .style("fill", d => colorScale(d)),
        update => update
            .transition()
            .duration(t)
            .style("fill", d => colorScale(d))
    );
}

function makeBrush(svg, stationData) {
    let brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("brush end", function (event) {
            if (!event.selection) {
                resetPoints();
                return;
            }

            let x0 = event.selection[0][0];
            let y0 = event.selection[0][1];
            let x1 = event.selection[1][0];
            let y1 = event.selection[1][1];

            let selectedDates = [];

            stationData.forEach(function (d) {
                let cx = xScale(d[xVar]);
                let cy = yScale(d[yVar]);

                if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
                    selectedDates.push(d.date_int);
                }
            });

            d3.selectAll('.points')
                .style('opacity', d => selectedDates.includes(d.date_int) ? 1 : 0.1)
                .style('stroke', d => selectedDates.includes(d.date_int) ? 'black' : 'none')
                .style('stroke-width', d => selectedDates.includes(d.date_int) ? 2 : 0);
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

    addLegend(svgPatuxent);
    addLegend(svgHagerstown);
    addLegend(svgBaltimore);
    addLegend(svgOcean);
    
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

