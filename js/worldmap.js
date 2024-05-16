// Took inspiration from Patrick's code and https://d3-graph-gallery.com/graph/choropleth_hover_effect.html
function worldMap(counts, person, dimensions) {

    width_svg = dimensions.width + margin.left + margin.right;
    height_svg = dimensions.height + margin.top + margin.bottom;

    $('#world_map').empty()
    var svg = d3.select("#world_map")
        .append("svg")
        .attr("width", width_svg)
        .attr("height", height_svg);

    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoNaturalEarth1()
        .scale(width_svg / 6)
        .center([0, 20])
        .translate([width_svg / 2, height_svg / 2]);

    // Data and color scale
    const data = new Map();
    max = 0;
    counts.forEach((value, key) => {
        const sum = value.actors + value.directors;
        data.set(key, sum);
        if (sum > max) {
            max = sum;
        }
    });

    const colorScale = d3.scaleLog()
        .domain([1, max])
        .range(["white", "red"]);

    // tooltips
    var tooltip = d3.select('#world_map')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('background-color', 'black')
        .style('border-radius', '15px')
        .style('padding', '12px')
        .style('color', 'white')
        .style('width', '275px');

    // Load external data and boot
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")]).then(function (loadData) {
        let topo = loadData[0]

        let mouseOver = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(50)
                .style("opacity", .85)
            d3.select(d)
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
            d3.select(d)
                .transition()
                .duration(200)
                .style("stroke", null)
        }

        var showTooltipCountry = function (event, d) {
            tooltip.transition().duration(duration_tooltip);
            text = 'Country: ' + d.properties.name + '<br>';
            info = counts.get(d.id);
            if (info != undefined) {
                text += 'Actors: ' + info.actors + '<br>';
                text += 'Directors: ' + info.directors + '<br>';
                text += 'Mean IMDB: ' + info.imdb + '<br>';
                text += 'Mean TMDB: ' + info.tmdb + '<br>';
            }
            tooltip.style("opacity", 1)
                .html(text)
                .style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px");
        }
        var showTooltipPoint = function (event, d) {
            tooltip.transition().duration(duration_tooltip);
            text = 'Name: ' + person.name + '<br>';
            text += 'Birthplace: ' + person.place + '<br>';
            tooltip.style("opacity", 1)
                .html(text)
                .style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px");
        }
        var moveTooltip = function (event, d) {
            tooltip.style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px");

        }
        var hideTooltip = function (event, d) {
            tooltip.transition()
                .duration(duration_tooltip)
                .style("opacity", 0);
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
                if (d.id == "USA") return "#8f0000";
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            })
            .style("stroke", "transparent")
            .attr("class", function (d) {
                return "Country"
            })
            .style("opacity", .8)
            .on("mouseover", function (event, d) {
                mouseOver(event.target);
                showTooltipCountry(event, d);
            })
            .on("mousemove", moveTooltip)
            .on("mouseleave", function (event, d) {
                mouseLeave(event.target);
                hideTooltip(event, d);
            });

        if (person.place != null) {
            // Convert latitude and longitude to SVG coordinates
            const [x, y] = projection([person.position.long, person.position.lat]);
            // Add a circle for the place of birth of the actor/director
            svg.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 5)
                .style("fill", "#FFFF00")
                .on("mouseover", showTooltipPoint)
                .on("mousemove", moveTooltip)
                .on("mouseleave", hideTooltip)
                .classed("blinking", true);
        } else {
            // Display a message that the birthplace was not found
            var alertText = svg.append("text")
                .attr("x", width_svg / 2)
                .attr("y", 0.1 * height_svg)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .style("font-style", "italic")
                .text("Birthplace not found.");
        }
    })
}
