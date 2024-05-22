

function showBubbleChart(year, imdbRange) {
    // Your D3 code to draw the bubble chart


        document.getElementById('back-button').style.display = 'block';

        $.ajax({
        url: 'data/others/detailed_data.json',
        dataType: 'json',
        async: false,
        success: function(data) {
            const filteredData = data.filter(item => item.rating_range === imdbRange && item.release_year === year);

            // Aggregate actors by genre for total count and top actors
            const genreMap = {};
            filteredData.forEach(item => {
                item.genres.forEach((genre, index) => {
                    if (!genreMap[genre]) {
                        genreMap[genre] = {
                            totalActors: [],
                            topActors: []
                        };
                    }

                    genreMap[genre].totalActors.push({
                        name: item.name[index],
                        score: item.imdb_score[index]
                    });
                });
            });

            // Sort and slice for top 10 actors
            Object.keys(genreMap).forEach(genre => {
                genreMap[genre].topActors = genreMap[genre].totalActors
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);
            });

            const genres = Object.keys(genreMap).map(genre => ({
                genre: genre,
                actors: genreMap[genre].totalActors,
                topActors: genreMap[genre].topActors,
                total: genreMap[genre].totalActors.length
            }));
            const diameter = 400;
            const svg = d3.select("#chart-container").html('') // Clear the previous chart
                    .append("svg")
                    .attr("width", diameter)
                    .attr("height", diameter);


            const bubble = d3.pack()
                .size([diameter, diameter])
                .padding(2);

            const root = d3.hierarchy({children: genres}).sum(d => d.total);  // Sum using the total number of actors

            const bubbleLayout = d3.pack()
                .size([diameter, diameter])
                .padding(2);

            const nodes = bubbleLayout(root).leaves();  // Generating nodes



            const node = svg.selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${d.x}, ${d.y})`);

            node.append("circle")
                .attr("r", d => d.r)
                .style("fill", (d, i) => d3.schemeCategory10[i % 10]);

            node.append("text")
                .attr("dy", ".2em")
                .style("text-anchor", "middle")
                .text(d => d.data.genre.substring(0, d.r / 3))
                .attr("font-size", d => d.r / 5);

                node.on("click", d => {
        const data = d.target.__data__;
        console.log(data);
        const infoDiv = document.getElementById("info");
        if (data.data.topActors) {
            // Create HTML content for the list of top actors
            let content = `<h3>Top Actors in ${data.data.genre}</h3><ul>`;
            data.data.topActors.forEach(actor => {
                content += `<li>${actor.name} (Score: ${actor.score})</li>`;
            });
            content += `<p>Total Actors: ${data.data.total}</p>`;
            content += '</ul>';

            // Display the content in the info div
            infoDiv.innerHTML = content;
            infoDiv.style.display = 'block'; // Make the info div visible
        } else {
            infoDiv.innerHTML = '<p>No actor data available for this genre.</p>';
            infoDiv.style.display = 'block';
        }
    });
  },
  error: function(jqXHR, textStatus, errorThrown) {
         console.error('Error loading JSON data:', textStatus, errorThrown);
     },
     complete: function() {
         console.log('Loaded movies and shows successfully.');
     }
        });

}

function loadDaviz() {
    // Your D3 code to draw the bar chart (Daviz)
    $.ajax({
        url: 'data/others/detailed_data.json',
        dataType: 'json',
        async: false,
        success: function(data) {
            //console.log(data);
            let release_years = [...new Set(data.map(item => item.release_year))].sort();
            //release_years=release_years.filter(item=> item.release_year>=2000);
            const ranges = [...new Set(data.map(item => item.rating_range))];
            //console.log(ranges);
            const traces = ranges.map(range => {
    let countsPerYear = new Array(release_years.length).fill(0);
    let namesPerYear = new Array(release_years.length).fill('');
    let genresPerYear=new Array(release_years.length).fill('');
    let custom=new Array(release_years.length).fill()

    // Go through each year and calculate the total counts and names for that year and range.
    release_years.forEach((year, index) => {
    // Filter the data for the current year and rating range.
    let itemsForYearAndRange = data.filter(item => item.rating_range === range && item.release_year === year);

    // Assuming item.name is an array of names, sum the lengths for the count.
    countsPerYear[index] = itemsForYearAndRange
        .map(item => item.name.length)
        .reduce((a, b) => a + b, 0);

    // Join the names for custom data, assuming each item.name is an array of actor names.
    namesPerYear[index] = itemsForYearAndRange
        .flatMap(item => item.name) // Flatten the array of names arrays into a single array.
        .join(', '); // Join all names with a comma.
    genresPerYear[index] = itemsForYearAndRange.flatMap(item => item.genres).join(', ');
    custom[index]= { genre: genresPerYear[index], names: namesPerYear[index]}

    });


                return {
                    x: release_years,
                    y: countsPerYear,
                    name: range,
                    type: 'bar',
                    customdata: custom, // Include name as custom data
                    hoverinfo: 'y+name'
                };

            }
          );
          //console.log(traces);



            const layout = {
                barmode: 'stack',
                hovermode: 'closest',
                title: 'Number of name in IMDb Rating Ranges per release_year',
                xaxis: {title: 'release_year'},
                yaxis: {title: 'Number of name'},
                legend: {title: 'IMDb Rating Range'}
            };

            Plotly.newPlot('chart-container', traces, layout);

            document.getElementById('chart-container').on('plotly_click', function(data){
              const imdbRange = data.points[0].data.name;
              const year = data.points[0].x;
              showBubbleChart(year, imdbRange);
            //window.location.href = `index.html?range=${encodeURIComponent(imdbRange)}&year=${encodeURIComponent(year)}`;
              });
            },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error loading JSON data:', textStatus, errorThrown);
        },
        complete: function() {
            console.log('Loaded movies and shows successfully.');
        }
        });
  // This will switch to the bubble chart
}


function showDaviz() {
    diameter=400;
    const svg = d3.select("#chart-container").html('') // Clear the previous chart
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter);

    document.getElementById('back-button').style.display = 'none';
    const infoDiv = document.getElementById("info");
    infoDiv.style.display = 'none';
    loadDaviz(); // Reload or refresh Daviz if necessary
}
