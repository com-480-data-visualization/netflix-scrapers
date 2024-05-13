// inspired by: https://observablehq.com/d/3b363d37f93bd20b
function plotNetwork(network, dimensions) {
    // extract parameters
    width = dimensions.width;
    height = dimensions.height;

    width_svg = width + margin.left + margin.right;
    height_svg = height + margin.top + margin.bottom;

    $('#viz_network').empty()
    var svg = d3.select("#viz_network")
                .append("svg")
                .attr("width", width_svg)
                .attr("height", height_svg);

    const nodes = Array.from(new Set(network.flatMap(l => [l.source, l.target])), id => ({id}));
    const links = network.map(d => Object.create(d));
    
    // simulate actor network
    const simulation = d3.forceSimulation(nodes)
                            .force("link", d3.forceLink(links).id(d => d.id).distance(function (d) {
                                return (d.is_ms) ? 150 : 200;
                            }))
                            .force("charge", d3.forceManyBody().strength(-400))
                            .force("x", d3.forceX())
                            .force("y", d3.forceY());

    drag = simulation => {
        return d3.drag()
                .on("start", function (event, d) {
                    if (!event.active) {
                        simulation.alphaTarget(0.3).restart();
                    }
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", function (event, d) {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", function (event, d) {
                    if (!event.active) {
                        simulation.alphaTarget(0);
                    }
                    d.fx = null;
                    d.fy = null;
                });
    };

    // draw links between actors
    const g = svg.append('g');
    const link = g.attr("fill", "none")
                    .attr("stroke-width", 2)
                    .selectAll("path")
                    .data(links)
                    .join("path")
                    .attr("stroke", function(d) {
                        return d.type;
                    });
    
    // determine node types and distinguish them with colors
    const nodesActors = []
    const nodesMS = []
    for (n of nodes) {
        let matches = $.grep(network, function (obj) {
            return obj.source == n.id;
        });
        if (matches.length == 0) {
            // actor or director
            nodesActors.push(n);
            continue;
        }
        let first_match = matches[0]
        if (first_match.is_ms == true) {
            nodesMS.push(n);
        } else {
            nodesActors.push(n);
        }
    }

    // draw nodes
    const nodeActor = g.append("g")
                    .attr("fill", "currentColor")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round")
                    .selectAll("g")
                    .data(nodesActors)
                    .join("g")
                    .call(drag(simulation));
    
    nodeActor.append("circle")
        .attr("fill", "blue")
        .attr("stroke", 'black')
        .attr("stroke-width", 1)
        .attr("r", 5);
    
    nodeActor.append("text")
        .attr("x", 8)
        .attr("y", "0.31em")
        .text(function (d) {
            return d.id;
        })
        .attr("color", "white")
        .style("font-weight", "bold")
        .style("visibility", "hidden");

    nodeActor.on("click", function(d)
    {
        d3.select(this).select("text").style("visibility", "visible") 
    })
    nodeActor.on("mouseover", function(d)
    {
        d3.select(this).select("text").style("visibility", "visible") 
    })
    .on("mouseout", function(d)
    {
        d3.select(this).select("text").style("visibility", "hidden") 
    });

    const nodeMS = g.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(nodesMS)
        .join("g")
        .call(drag(simulation));

    nodeMS.append("circle")
        .attr("fill", "purple")
        .attr("stroke", 'black')
        .attr("stroke-width", 1)
        .attr("r", 10);

    nodeMS.append("text")
        .attr("x", 12)
        .attr("y", "0.31em")
        .text(function (d) {
        return d.id;
        })
        .attr("color", "white")
        .style("font-weight", "bold");
    
    simulation.on("tick", () => {
        link.attr("d", function (d) {
            return `M${d.source.x}, ${d.source.y}
                    L${d.target.x}, ${d.target.y}`;
        });
        nodeActor.attr("transform", d => `translate(${d.x}, ${d.y})`);
        nodeMS.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    // zooming
    svg.call(d3.zoom()
                .extent([[0, 0], [width_svg, height_svg]])
                .scaleExtent([0.25, 8])
                .on("zoom", function ({transform}) {
                    g.attr("transform", transform);
                }));

    // color map
    height_svg = 50;
    svg = d3.select("#viz_network")
                .append('svg')
                .attr('width', width_svg)
                .attr('height', height_svg);
        
    var colors = ['red', 'yellow', 'green'];
    var l = colors.length - 1;

    var linear_gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'grad')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

    linear_gradient.selectAll('stop')
        .data(colors)
        .enter()
        .append('stop')
        .style('stop-color', function(d) { return d; })
        .attr('offset', function(d, i) {
            return 100 * (i / l) + '%';
        });

    svg.append('rect')
        .attr('x', 0)
        .attr('y', 20)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height_svg)
        .style('fill', 'url(#grad)');

    svg.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .text('0.0')
        .style("font-size", "10px")
        .style("font-weight", "bold");
    
    svg.append("text")
        .attr("x", (width + margin.left + margin.right - 20) / 2)
        .attr("y", 15)
        .text('5.0')
        .style("font-size", "10px")
        .style("font-weight", "bold");

    svg.append("text")
        .attr("x", width + margin.left + margin.right - 20)
        .attr("y", 15)
        .text('10.0')
        .style("font-size", "10px")
        .style("font-weight", "bold");

    svg.selectAll("text")
        .attr('fill', 'white');
    
    // legend
    svg = d3.select("#viz_network")
            .append('svg')
            .attr('width', width_svg)
            .attr('height', height_svg);
    
    svg.append('circle')
        .attr("cx", (width + margin.left + margin.right) / 4 - 25)
        .attr("cy", height_svg / 2)
        .attr("fill", "purple")
        .attr("stroke", 'black')
        .attr("stroke-width", 1)
        .attr("r", 10);

    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 4 - 5)
        .attr("y", height_svg / 2 + 2)
        .text('Movie / Show')
        .style("font-size", "8px")
        .style("font-weight", "bold");

    svg.append('circle')
        .attr("cx", 3 * (width + margin.left + margin.right) / 4 - 45)
        .attr("cy", height_svg / 2)
        .attr("fill", "blue")
        .attr("stroke", 'black')
        .attr("stroke-width", 1)
        .attr("r", 10);

    svg.append("text")
        .attr("x", 3 * (width + margin.left + margin.right) / 4 - 25)
        .attr("y", height_svg / 2 + 2)
        .text('Actor / Director')
        .style("font-size", "8px")
        .style("font-weight", "bold");

    svg.selectAll("text")
        .attr('fill', 'white');
}

