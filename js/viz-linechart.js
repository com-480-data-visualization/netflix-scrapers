// constants
const rating_min = 0.0
const rating_max = 10.0
const offset_year = 1
const duration_animation = 1000
const duration_tooltip = 200
const offset_tooltip = 10

const year_min = 1950
const year_max = 2022

// inspired by: https://d3-graph-gallery.com/graph/connectedscatter_select.html
function plotScoresPerYear(scores, dimensions) {
    // extract parameters
    scores_per_year = scores.scores_per_year;
    mean_scores_per_year = scores.mean_scores_per_year;
    mean_scores = scores.mean_scores;
    width = dimensions.width;
    height = dimensions.height;

    $('#viz_scores_per_year').empty()
    var svg = d3.select("#viz_scores_per_year")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top / 3})`);

    var year_min_curr = (scores_per_year.length > 0) ? getMin(scores_per_year, 'year') - offset_year : year_min;
    var year_max_curr = (scores_per_year.length > 0) ? getMax(scores_per_year, 'year') + offset_year : year_max;

    // x axis
    const x = d3.scaleLinear()
                .domain([year_min_curr, year_max_curr])
                .range([0, width]);
    const x_axis = svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)
                .tickSize(-height)
                .tickFormat(d3.format("d"))
                .tickPadding(10));

    // adjust labeling based on window size
    if (width <= 800) {
        x_axis.selectAll('text')
        .attr('transform', 'rotate(90)')
        .attr("x", 16)
        .attr("y", -4);
    }
    
    x_axis.call(g => g.append("text")
            .attr("x", width - 4)
            .attr("y", -4)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "currentColor")
            .text("Year"));
        
    // y axis
    const y = d3.scaleLinear()
                .domain([rating_min, rating_max])
                .range([height, 0]);
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickPadding(10))
        .call(g => g.append("text")
            .attr("x", 30)    
            .attr("y", 10)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "currentColor")
            .text('Score'));

    if (scores_per_year.length == 0) {
        svg.append('rect')
            .attr('x', width / 4)
            .attr('y', height / 4)
            .attr('width', width / 2)
            .attr('height', height / 2)
            .attr('stroke', 'black')
            .attr('stroke-width', 5)
            .attr('fill', 'none');

        svg.append("text")
            .attr("x", width / 2) 
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(d => "Not enough data to visualize :/")
            .style("font-size", "12px")
            .style("font-weight", "bold");
        return;
    }

    // tooltips
    var tooltip = d3.select('#viz_scores_per_year')
                    .append('div')
                        .style('opacity', 0)
                        .attr('class', 'tooltip')
                        .style('background-color', 'black')
                        .style('border-radius', '15px')
                        .style('padding', '12px')
                        .style('color', 'white')
                        .style('width', '250px');
    var showTooltip = function (event, d) {
        tooltip.transition().duration(duration_tooltip);
        text = 'Title: ' + d.title + ' (Rated: ' + ((d.age_certification != '') ? d.age_certification : '-') + ')<br>';
        text += 'Runtime: ' + d.runtime + ' min.<br>';
        text += 'Description: ' + d.description;
        tooltip.style("opacity", 1)
                .html(text)
                .style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px");       
    }
    var moveTooltip = function(event, d) {
        tooltip.style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px");
  
    }
    var hideTooltip = function(event, d) {
        tooltip.transition()
                .duration(duration_tooltip)
                .style("opacity", 0);
    }
    

    // display mean line
    var value = $('input[type=radio][name="score_type_linechart"]').val().toLowerCase();

    // overall mean
    const line_generator = d3.line()
                                .x(d => d.x)
                                .y(d => y(d.y));

    const mean_line = svg.append('g')
        .append('path')
        .attr('d', line_generator([
            { x: 0, y: mean_scores[value]}, 
            { x: width, y: mean_scores[value]}
        ]))
        .attr('stroke', '#fa712d')
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-dasharray', '10,10');

    const line = svg.append('g')
                    .append("path")
                    .datum(mean_scores_per_year)
                    .attr("d", d3.line()
                        .x(d => x(d.year))
                        .y(d => y(d[value])))
                    .attr("stroke", "purple")
                    .style("stroke-width", 5)
                    .style("fill", "none");
    

    // display individual scores               
    const dot = svg.selectAll('circle.firstSet')
                    .data(scores_per_year)
                    .join('circle')
                        .attr("cx", d => x(d.year))
                        .attr("cy", d => y(d[value]))
                        .attr("r", 10)
                        .style("fill", "#00d4c6")
                        .style("stroke", "black") 
                        .style("stroke-width", 2)
                    .on("mouseover", showTooltip)
                    .on("mousemove", moveTooltip)
                    .on("mouseleave", hideTooltip);
                    

    // display mean scores   
    const dot_mean = svg.selectAll('circle.secondSet')
                        .data(mean_scores_per_year)
                        .join('circle')
                            .attr("cx", d => x(d.year))
                            .attr("cy", d => y(d[value]))
                            .attr("r", 5)
                            .style("fill", "red")
                            .style("stroke", "black") 
                            .style("stroke-width", 2);
    
    // update graph based on score type
    $('input[type=radio][name="score_type_linechart"]').on('change', function (event, d) {
        value = $(this).val().toLowerCase();
        
        mean_line.transition()
            .duration(duration_animation)
            .attr("d", line_generator([
                { x: 0, y: mean_scores[value]}, 
                { x: width, y: mean_scores[value]}]));

        line.datum(mean_scores_per_year)
            .transition()
            .duration(duration_animation)
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d[value])));
        

        dot.data(scores_per_year)
            .transition()
            .duration(duration_animation)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d[value]));
        
        dot_mean.data(mean_scores_per_year)
                .transition()
                .duration(duration_animation)
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(d[value]));
    });

    svg.selectAll("text")
        .attr('fill', 'white');

    // legend
    var height_svg = 100;
    svg = d3.select("#viz_scores_per_year")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height_svg);

    svg.append('circle')
        .attr("cx", (width + margin.left + margin.right) / 4 - 17)
        .attr("cy", height_svg / 3)
        .attr("r", 10)
        .style("fill", "#00d4c6")
        .style("stroke", "black") 
        .style("stroke-width", 2);

    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 4)
        .attr("y", height_svg / 3 + 2)
        .text('Movie / Show')
        .style("font-size", "8px")
        .style("font-weight", "bold");

    svg.append('circle')
        .attr("cx", 3 * (width + margin.left + margin.right) / 4 - 65)
        .attr("cy", height_svg / 3)
        .attr("r", 5)
        .style("fill", "red")
        .style("stroke", "black") 
        .style("stroke-width", 2);

    svg.append("text")
        .attr("x", 3 * (width + margin.left + margin.right) / 4 - 45)
        .attr("y", height_svg / 3 + 2)
        .text('Mean Score (Year X)')
        .style("font-size", "8px")
        .style("font-weight", "bold");
    
    svg.append("line")
        .attr("x1", (width + margin.left + margin.right) / 2 - 75)
        .attr("y1", 2 * height_svg / 3)
        .attr("x2", (width + margin.left + margin.right) / 2 - 25)
        .attr("y2", 2 * height_svg / 3)
        .attr('stroke', '#fa712d')
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-dasharray', '10,10');

    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2 - 5)
        .attr("y", 2 * height_svg / 3 + 2)
        .text('Overall Mean Score')
        .style("font-size", "8px")
        .style("font-weight", "bold");

    svg.selectAll("text")
        .attr('fill', 'white');
}