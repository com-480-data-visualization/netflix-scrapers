// constants
const margin = {top: 20, right: 30, bottom: 20, left: 30}
const width = 800  - margin.left - margin.right
const height = 600 - margin.top - margin.bottom

const rating_min = 0.0
const rating_max = 10.0
const offset_year = 1
const duration_animation = 750

function getMin(data, key) {
    return data.reduce(function(res, obj) {
        return (obj[key] < res[key]) ? obj : res;
    })[key]
}

function getMax(data, key) {
    return data.reduce(function(res, obj) {
        return (obj[key] > res[key]) ? obj : res;
    })[key]
}

// https://d3-graph-gallery.com/graph/connectedscatter_select.html
function plotScoresPerYear(scores_per_year, mean_scores_per_year) {
    // TODO: handle 1 movie
    // svg and axis
    var svg = d3.select("#viz_scores_per_year")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`)
    
    year_min_curr = getMin(scores_per_year, 'year') - offset_year
    year_max_curr = getMax(scores_per_year, 'year') + offset_year

    const x = d3.scaleLinear()
                .domain([year_min_curr, year_max_curr +1])
                .range([0, width])
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
    
    const y = d3.scaleLinear()
                .domain([rating_min, rating_max])
                .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
    
    
    // display mean line
    var value = $("#score_type").val()
    const line = svg.append('g')
                    .append("path")
                        .datum(mean_scores_per_year)
                        .attr("d", d3.line()
                            .x(d => x(d.year))
                            .y(d => y(d[value])))
                        .attr("stroke", "black")
                        .style("stroke-width", 4)
                        .style("fill", "none")

    // display individual scores               
    const dot = svg.selectAll('circle.firstSet')
                    .data(scores_per_year)
                    .join('circle')
                        .attr("cx", d => x(d.year))
                        .attr("cy", d => y(d[value]))
                        .attr("r", 7)
                        .style("fill", "#00d4c6")
                    

    // display mean scores   
    const dot_mean = svg.selectAll('circle.secondSet')
                        .data(mean_scores_per_year)
                        .join('circle')
                            .attr("cx", d => x(d.year))
                            .attr("cy", d => y(d[value]))
                            .attr("r", 7)
                            .style("fill", "red")
    
    // update graph based on score type
    d3.select('#score_type').on('change', function (event, d) {
        value = $("#score_type").val()

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

function init() {
    // TODO: remove entries with no ratings
    // TODO: maybe read with d3.csv()

    // load data
    movies_and_shows = []
    credits = []
    $.ajax({
        url: 'data/titles.csv',
        async: false,
        success: function (csvd) {
            movies_and_shows = $.csv.toObjects(csvd)
        },
        dataType: "text",
        complete: function () {
            console.log('Loaded credits successfully.')
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
            console.log('Loaded movies and shows successfully.')
        }
    })

    // for testing
    name_actor = 'Kareena Kapoor Khan'
    credits_filtered = credits.filter(credit => credit.name == name_actor)

    // get scores
    scores_per_year = []
    for (credit of credits_filtered) {
        ms_id = credit.id
        ms = movies_and_shows.filter(ms => ms.id == ms_id)[0]

        score_imdb = parseFloat(ms.imdb_score)
        score_tmdb = parseFloat(ms.tmdb_score)
        year = parseInt(ms.release_year)
        scores_per_year.push({
            imdb: score_imdb, 
            tmdb: score_tmdb, 
            year: year
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

    plotScoresPerYear(scores_per_year, mean_scores_per_year)
}

init()