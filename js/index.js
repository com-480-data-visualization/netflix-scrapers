// constants
const margin = {top: 20, right: 30, bottom: 20, left: 30};

// nav bar
function animateMenuIcon(bars) {
    bars.classList.toggle('change');
    $('.topnav').toggleClass('hide');
}

function addNavListeners() {
    var links = document.getElementsByClassName("nav-link");
    for (link of links) {
        link.addEventListener("click", function() {
            var current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }
}

movies_and_shows = []
credits = []
credits_names = []

function prepareData(name_individual, dimensions) {
    // extract parameters
    width = dimensions.width;
    height = dimensions.height;

    credits_filtered = credits.filter(credit => credit.name == name_individual);

    // get scores
    scores_per_year = [];
    for (credit of credits_filtered) {
        ms_id = credit.id;
        result = movies_and_shows.filter(ms => ms.id == ms_id);
        if (result.length == 0) {
            console.log('Movie with id ' + ms_id + ' doesn\'t have IMDB/TMDB scores. Skipping ...');
            continue;
        }
        ms = result[0];
        score_imdb = parseFloat(ms.imdb_score);
        score_tmdb = parseFloat(ms.tmdb_score);
        year = parseInt(ms.release_year);
        scores_per_year.push({
            imdb: score_imdb, 
            tmdb: score_tmdb, 
            year: year,
            title: ms.title,
            description: ms.description,
            type: (ms.type == 'MOVIE') ? 'Movie' : 'Show',
            age_certification: ms.age_certification,
            runtime: ms.runtime
        });
    }

    // get mean scores
    years = new Set(scores_per_year.map(object => object['year']));
    mean_scores_per_year = [];
    for (year of years) {
        scores = scores_per_year.filter(object => object.year == year);
        l = scores.length;
        mean_score_imdb = scores.reduce((acc, curr) => acc + curr.imdb, 0) / l;
        mean_score_tmdb = scores.reduce((acc, curr) => acc + curr.tmdb, 0) / l;
        mean_scores_per_year.push({
            imdb: mean_score_imdb, 
            tmdb: mean_score_tmdb, 
            year: year
        });
    }

    // sort before plotting
    scores_per_year.sort((a, b) => a.year - b.year);
    mean_scores_per_year.sort((a, b) => a.year - b.year);
    l = mean_scores_per_year.length;
    mean_scores = {
        imdb: mean_scores_per_year.reduce((acc, curr) => acc + curr.imdb, 0) / l,
        tmdb: mean_scores_per_year.reduce((acc, curr) => acc + curr.tmdb, 0) / l
    };
    scores = {
        scores_per_year: scores_per_year,
        mean_scores_per_year: mean_scores_per_year,
        mean_scores: mean_scores
    };
    plotScoresPerYear(scores, dimensions);

    network = [];
    
    for (credit of credits_filtered) {
        // find movie ratings
        ms_id = credit.id;
        person_id = credit.person_id;
        role = credit.role;
        result = movies_and_shows.filter(ms => ms.id == ms_id);
        if (result.length == 0) {
            // TODO: maybe avoid this by removing entries in credits as well
            console.log('Movie with id ' + ms_id + ' doesn\'t have IMDB/TMDB scores. Skipping ...');
            continue;
        }
        ms = result[0];
        title = ms.title;
        score_imdb = parseFloat(ms.imdb_score);
        score_tmdb = parseFloat(ms.tmdb_score);


        // find all actors and directors of movie
        result = credits.filter(ms => ms.id == ms_id && ms.person_id != person_id);
        
        var score_type = $('input[type=radio][name="score_type_network"]').val();
        var percentage = (((score_type == 'IMDB') ? score_imdb : score_tmdb) / 10.0) * 100;
        var color = getColor(percentage);

        network.push({
            source: name_individual,
            target: title,
            imdb: score_imdb,
            tmdb: score_tmdb,
            type: color,
            is_ms: false,
            role: role
        });
        for (person of result) {
            network.push({
                source: title,
                target: person.name,
                imdb: score_imdb,
                tmdb: score_tmdb,
                type: color,
                is_ms: true,
                role: 'none'
            });
        }
    }
    
    plotNetwork(network, dimensions);

    // update colors
    $('input[type=radio][name="score_type_network"]').on('change', function (event, d) {
        var score_type = $(this).val();
        for (n of network) {
            var percentage = (((score_type == 'IMDB') ? n.imdb : n.tmdb) / 10.0) * 100;
            var color = getColor(percentage);
            n.type = color;
        }
        plotNetwork(network, dimensions);
    });
}

function init() {
    // load data // TODO: maybe read with d3.csv()
    $.ajax({
        url: 'data/titles.csv',
        async: false,
        success: function (csvd) {
            // entries must have IMDB and TMDB ratings // TODO: mandatory?
            movies_and_shows = $.csv.toObjects(csvd).filter(obj => obj['imdb_score'] != '' && obj['tmdb_score'] != '' );
        },
        dataType: "text",
        complete: function () {
            console.log('Loaded movies and shows successfully.');
        }
    })

    $.ajax({
        url: 'data/credits.csv',
        async: false,
        success: function (csvd) {
            credits = $.csv.toObjects(csvd);
            credits_names = [...new Set(credits.map(credit => credit.name))];
        },
        dataType: "text",
        complete: function () {
            console.log('Loaded credits successfully.');
        }
    })

    $('#individual').bind("enterKey",function(e){
        name_individual = $('#individual').val()
        result = credits.filter(object => object.name == name_individual);

        if (result.length == 0) {
            alert('No entries for "' + name_individual, '".');
            return
        }
        dimensions = getWindowData();
        prepareData(name_individual, dimensions);

    });
    $('#individual').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });
    addNavListeners();
    $('#menu-icon').toggleClass('change');

    // default value
    $('#search-results').html('');
    name_individual = 'Kareena Kapoor Khan';
    $('#individual').val(name_individual);
    dimensions = getWindowData();
    prepareData(name_individual, dimensions);
}

function getWindowData() {
    dimensions = {
        width: window.innerWidth * (2 / 3) - margin.left - margin.right,
        height: window.innerHeight * (2 / 3) - margin.left - margin.right
    }
    return dimensions;
}

function selectName(name) {
    $('#search-results').html('');
    $('#individual').val(name);
    dimensions = getWindowData();
    prepareData(name, dimensions);
}

function autocompleteSearch(input) {
    if (input == '') {
        return [];
    }
    var regex = new RegExp(input);
    return credits_names.filter(function (name) {
        if (name.match(regex)) {
            return name;
        }
    });
}

function showResults(value) {
    $('#search-results').html('');
    var results = '';
    var names = autocompleteSearch(value);
    for (n of names) {
        results += '<li><a onclick="selectName(this.text)">' + n + '</a></li>';
    }
    $('#search-results').html(results);
}

init()
window.onresize = () => {
    name_individual = $('#individual').val();
    dimensions = getWindowData();
    prepareData(name_individual, dimensions);
};