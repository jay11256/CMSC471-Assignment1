// Constants
const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const us = FileAttachment("states-albers-10m.json").json()
console.log("map loaded")
const path = d3.geoPath();

const g = svg.append("g");

const states = g.append("g")
    .attr("fill", "#444")
    .attr("cursor", "pointer")
.selectAll("path")
.data(topojson.feature(us, us.objects.states).features)
.join("path")
    .on("click", clicked)
    .attr("d", path);