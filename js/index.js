// constants
const margin = {top: 20, right: 30, bottom: 20, left: 30}
const width = 800  - margin.left - margin.right
const height = 600 - margin.top - margin.bottom
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

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
function plotScoresPerYear(scores_per_year, mean_scores_per_year, mean_scores) {
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

function prepareData(name_individual) {
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
    plotScoresPerYear(scores_per_year, mean_scores_per_year, mean_scores)
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
        prepareData(name_individual)

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
    prepareData(name_individual)
}

init()