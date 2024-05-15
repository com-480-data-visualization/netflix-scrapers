function worldMap(dataCounts, dimensions) {

    width_svg = dimensions.width + margin.left + margin.right;
    height_svg = dimensions.height + margin.top + margin.bottom;

    // The svg
    $('#world_map').empty()

    var svg = d3.select("#world_map")
        .append("svg")
        .attr("width", width_svg)
        .attr("height", height_svg);

    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoNaturalEarth1()
        .scale(width_svg / 6)
        .center([0,20])
        .translate([width_svg / 2, height_svg / 2]);

    // Data and color scale
    const data = new Map();
    const colorScale = d3.scaleThreshold()
        .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
        .range(d3.schemeBlues[7]);

    // Load external data and boot
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) {
            data.set(d.code, +d.pop)
        })]).then(function(loadData){
        let topo = loadData[0]

        let mouseOver = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(50)
                .style("opacity", .85)
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
        }

        let mouseLeave = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(50)
                .style("opacity", 1)
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", null)
        }

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            })
            .style("stroke", "transparent")
            .attr("class", function(d){ return "Country" } )
            .style("opacity", .8)
            .on("mouseover", mouseOver )
            .on("mouseleave", mouseLeave )

    })
}
