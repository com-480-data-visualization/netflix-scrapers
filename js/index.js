// constants
const margin = {top: 20, right: 30, bottom: 20, left: 30}
/*const width = window.innerWidth / 2 - margin.left - margin.right //800  - margin.left - margin.right
const height = window.innerHeight / 2 - margin.left - margin.right//600 - margin.top - margin.bottom
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;*/

const rating_min = 0.0
const rating_max = 10.0
const offset_year = 1
const duration_animation = 1000
const duration_tooltip = 200
const offset_tooltip = 10

const year_min = 1950
const year_max = 2022

movies_and_shows = []
credits = []

function getMin(data, key) {
    return data.reduce(function(res, obj) {
        return (obj[key] < res[key]) ? obj : res
    })[key]
}

function getMax(data, key) {
    return data.reduce(function(res, obj) {
        return (obj[key] > res[key]) ? obj : res
    })[key]
}

// https://d3-graph-gallery.com/graph/connectedscatter_select.html
function plotScoresPerYear(scores_per_year, mean_scores_per_year, mean_scores, width, height) {
    // TODO: handle 1 movie
    // svg and axis
    $('#viz_scores_per_year').empty()
    var svg = d3.select("#viz_scores_per_year")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)

    year_min_curr = (scores_per_year.length > 0) ? getMin(scores_per_year, 'year') - offset_year : year_min
    year_max_curr = (scores_per_year.length > 0) ? getMax(scores_per_year, 'year') + offset_year : year_max

    const x = d3.scaleLinear()
                .domain([year_min_curr, year_max_curr])
                .range([0, width])
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)
                .tickSize(-height)
                .tickFormat(d3.format("d"))
                .tickPadding(10))
        .call(g => g.append("text")
            .attr("x", width - 4)
            .attr("y", -4)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "currentColor")
            .text("Year"))
    
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
            .text('Score'))

    if (scores_per_year.length == 0) {
        svg.append('rect')
            .attr('x', width / 4)
            .attr('y', height / 4)
            .attr('width', width / 2)
            .attr('height', height / 2)
            .attr('stroke', 'black')
            .attr('stroke-width', 5)
            .attr('fill', 'none')

        svg.append("text")
            .attr("x", width / 2) 
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(d => "Not enough data to visualize :/")
            .style("font-size", "24px")
            .style("font-weight", "bold")

        return
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
                        .style('width', '250px')
    var showTooltip = function (event, d) {
        tooltip.transition()
                .duration(duration_tooltip)
        text = 'Title: ' + d.title + ' (Rated: ' + ((d.age_certification != '') ? d.age_certification : '-') + ')<br>'
        text += 'Runtime: ' + d.runtime + ' min.<br>'
        text += 'Description: ' + d.description
        tooltip.style("opacity", 1)
                .html(text)
                .style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px")          
    }
    var moveTooltip = function(event, d) {
        tooltip.style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px")
  
      }
    var hideTooltip = function(event, d) {
        tooltip.transition()
                .duration(duration_tooltip)
                .style("opacity", 0)
      }
    

    // display mean line
    var value = $("#score_type").val()

    // overall mean
    const line_generator = d3.line()
                                .x(d => d.x)
                                .y(d => y(d.y))

    const mean_line = svg.append('g')
        .append('path')
        .attr('d', line_generator([
            { x: 0, y: mean_scores[value]}, 
            { x: width, y: mean_scores[value]}
        ]))
        .attr('stroke', '#fa712d')
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-dasharray', '10,10')

    const line = svg.append('g')
                    .append("path")
                    .datum(mean_scores_per_year)
                    .attr("d", d3.line()
                        .x(d => x(d.year))
                        .y(d => y(d[value])))
                    .attr("stroke", "black")
                    .style("stroke-width", 5)
                    .style("fill", "none")
    

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
                    .on("mouseover", showTooltip )
                    .on("mousemove", moveTooltip )
                    .on("mouseleave", hideTooltip )
                    

    // display mean scores   
    const dot_mean = svg.selectAll('circle.secondSet')
                        .data(mean_scores_per_year)
                        .join('circle')
                            .attr("cx", d => x(d.year))
                            .attr("cy", d => y(d[value]))
                            .attr("r", 5)
                            .style("fill", "red")
                            .style("stroke", "black") 
                            .style("stroke-width", 2)
    
    // update graph based on score type
    d3.select('#score_type').on('change', function (event, d) {
        value = $("#score_type").val()

        mean_line
            .transition()
            .duration(duration_animation)
            .attr("d", line_generator([
                { x: 0, y: mean_scores[value]}, 
                { x: width, y: mean_scores[value]}]))

        line.datum(mean_scores_per_year)
            .transition()
            .duration(duration_animation)
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d[value])))
        

        dot.data(scores_per_year)
            .transition()
            .duration(duration_animation)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d[value]))
        
        dot_mean.data(mean_scores_per_year)
                .transition()
                .duration(duration_animation)
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(d[value]))
    })
}

// https://observablehq.com/d/3b363d37f93bd20b
function plotNetwork(network, width, height) {
    // TODO: use ids to link nodes and label names of actor/director and character name
    // TODO: color based on rating
    // TODO: make size of circles different based on if it's a movie/show or an actor/director
    const types = Array.from(new Set(network.map(d => d.type)))
    const nodes = Array.from(new Set(network.flatMap(l => [l.source, l.target])), id => ({id}))
    const links = network.map(d => Object.create(d))
    console.log(nodes)

    const color = d3.scaleOrdinal(types, d3.schemeCategory10)
    console.log(links)
    console.log(color)
    const simulation = d3.forceSimulation(nodes)
                            .force("link", d3.forceLink(links).id(d => d.id))
                            .force("charge", d3.forceManyBody().strength(-400))
                            .force("x", d3.forceX())
                            .force("y", d3.forceY())
    
    $('#viz_network').empty()
    var svg = d3.select("#viz_network")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)

    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
            M${d.source.x},${d.source.y}
            L${d.target.x},${d.target.y}
        `;
    }

    drag = simulation => {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x
            d.fy = d.y
        }
        
        function dragged(event, d) {
            d.fx = event.x
            d.fy = event.y
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null
            d.fy = null
        }
        
        return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
    }
    const g = svg.append('g')
    const link = g.attr("fill", "none")
                    .attr("stroke-width", 2)
                    .selectAll("path")
                    .data(links)
                    .join("path")
                        .attr("stroke", function(d) {
                            //console.log(d)
                            return d.type
                        })
    
    const node = g.append("g")
                    .attr("fill", "currentColor")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round")
                    .selectAll("g")
                    .data(nodes)
                    .join("g")
                        .call(drag(simulation))
              
    node.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", 4)
    
    node.append("text")
        .attr("x", 8)
        .attr("y", "0.31em")
        .text(function (d) {
            return d.id
        })
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);
              
    simulation.on("tick", () => {
        link.attr("d", linkArc)
        node.attr("transform", d => `translate(${d.x},${d.y})`)
    })
    svg.call(d3.zoom()
                .extent([[0, 0], [width, height]])
                .scaleExtent([0.25, 8])
                .on("zoom", zoomed))
          
    function zoomed({transform}) {
        g.attr("transform", transform);
    }
}

function getColor(percentage) {
	red = (percentage < 50.0) ? 255 : Math.round(510 - 5.1 * percentage)
    green = (percentage < 50.0) ? Math.round(5.1 * percentage) : 255 
    blue = 0
	hue = (0x10000 * red + 0x100 * green + blue).toString(16)
	color = '#' + ('000000' + hue).slice(-6)
    return color
}

function prepareData(name_individual, width, height) {
    credits_filtered = credits.filter(credit => credit.name == name_individual)

    // get scores
    scores_per_year = []
    for (credit of credits_filtered) {
        ms_id = credit.id
        result = movies_and_shows.filter(ms => ms.id == ms_id)
        if (result.length == 0) {
            // TODO: maybe avoid this by removing entries in credits as well
            console.log('Movie with id ' + ms_id + ' doesn\'t have IMDB/TMDB scores. Skipping ...')
            continue
        }
        ms = result[0]
        score_imdb = parseFloat(ms.imdb_score)
        score_tmdb = parseFloat(ms.tmdb_score)
        year = parseInt(ms.release_year)
        scores_per_year.push({
            imdb: score_imdb, 
            tmdb: score_tmdb, 
            year: year,
            title: ms.title,
            description: ms.description,
            type: (ms.type == 'MOVIE') ? 'Movie' : 'Show',
            age_certification: ms.age_certification,
            runtime: ms.runtime
        })
    }

    // get mean scores
    years = new Set(scores_per_year.map(object => object['year']))
    mean_scores_per_year = []
    for (year of years) {
        scores = scores_per_year.filter(object => object.year == year)
        l = scores.length
        mean_score_imdb = scores.reduce((acc, curr) => acc + curr.imdb, 0) / l
        mean_score_tmdb = scores.reduce((acc, curr) => acc + curr.tmdb, 0) / l
        mean_scores_per_year.push({
            imdb: mean_score_imdb, 
            tmdb: mean_score_tmdb, 
            year: year
        })
    }

    // sort before plotting
    scores_per_year.sort((a, b) => a.year - b.year)
    mean_scores_per_year.sort((a, b) => a.year - b.year)
    l = mean_scores_per_year.length
    mean_scores = {
        imdb: mean_scores_per_year.reduce((acc, curr) => acc + curr.imdb, 0) / l,
        tmdb: mean_scores_per_year.reduce((acc, curr) => acc + curr.tmdb, 0) / l
    }
    plotScoresPerYear(scores_per_year, mean_scores_per_year, mean_scores, width, height)


    //plotNetwork()
    network = []
    
    for (credit of credits_filtered) {
        // find movie ratings
        ms_id = credit.id
        person_id = credit.person_id
        character = credit.character
        result = movies_and_shows.filter(ms => ms.id == ms_id)
        if (result.length == 0) {
            // TODO: maybe avoid this by removing entries in credits as well
            console.log('Movie with id ' + ms_id + ' doesn\'t have IMDB/TMDB scores. Skipping ...')
            continue
        }
        ms = result[0]
        title = ms.title
        score_imdb = parseFloat(ms.imdb_score)
        score_tmdb = parseFloat(ms.tmdb_score)


        // find all actors and directors of movie
        result = credits.filter(ms => ms.id == ms_id && ms.person_id != person_id)
        
        color = getColor((score_imdb / 10.0) * 100)

        network.push({
            /*sourc_name: name_individual + ' (' + character + ')',
            source: person_id,
            target: ms_id,
            target_name: title,*/
            source: name_individual,
            target: title,
            imdb: score_imdb,
            tmdb: score_tmdb,
            type: color,//credit.type
            is_ms: false
        })
        for (person of result) {
            network.push({
                /*source_name: title,
                source: ms_id,
                target_name: person.name + ' (' + person.character + ')',
                target: person.person_id,*/
                source: title,
                target: person.name,
                imdb: score_imdb,
                tmdb: score_tmdb,
                type: color,
                is_ms: true//person.type
            })
        }
    }
    plotNetwork(network, width, height)
    
}

function init() {
    // load data // TODO: maybe read with d3.csv()
    $.ajax({
        url: 'data/titles.csv',
        async: false,
        success: function (csvd) {
            // entries must have IMDB and TMDB ratings // TODO: mandatory?
            movies_and_shows = $.csv.toObjects(csvd).filter(obj => obj['imdb_score'] != '' && obj['tmdb_score'] != '' )
        },
        dataType: "text",
        complete: function () {
            console.log('Loaded movies and shows successfully.')
        }
    })

    $.ajax({
        url: 'data/credits.csv',
        async: false,
        success: function (csvd) {
            credits = $.csv.toObjects(csvd)
        },
        dataType: "text",
        complete: function () {
            console.log('Loaded credits successfully.')
        }
    })

    $('#individual').bind("enterKey",function(e){
        name_individual = $('#individual').val()
        result = credits.filter(object => object.name == name_individual)

        if (result.length == 0) {
            alert('No entries for "' + name_individual, '".')
            return
        }
        window_data = getWindowData()
        width = window_data[0]
        height = window_data[1]
        prepareData(name_individual, width, height)

     });
     $('#individual').keyup(function(e){
         if(e.keyCode == 13)
         {
             $(this).trigger("enterKey");
         }
     });

    // default value
    name_individual = 'Kareena Kapoor Khan'
    $('#individual').val(name_individual)
    window_data = getWindowData()
    width = window_data[0]
    height = window_data[1]
    prepareData(name_individual, width, height)
}


function getWindowData() {
    width = window.innerWidth * (2 / 3) - margin.left - margin.right
    height = window.innerHeight * (2 / 3) - margin.left - margin.right
    return [width, height]
}

function animateMenuIcon(bars) {
    bars.classList.toggle('change')
}

init()

window.onresize = () => {
    name_individual = $('#individual').val()
    window_data = getWindowData()
    width = window_data[0]
    height = window_data[1]
    prepareData(name_individual, width, height)
};