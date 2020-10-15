
let dataset;

d3.csv('wealth-health-2014.csv', d3.autoType)
    .then(d => {
        dataset = d;
        generateScatterplot();
    })

function generateScatterplot() {
    // === Margin Convention ===
    const margin = ({top: 40, right: 40, bottom: 40, left: 40})
    const width = 650 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;
    
    // Legend Position
    const legendX = width - 150;
    const legendY = 300;
    
    const svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
	    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    
    // === Scales ===
    // lists that contain income and life expectancy
    let incomeList = [];
    let lifeExpectancyList = [];
    let populationList = [];
    let regionList = [];
    
    // populate them by iterating ONCE
    dataset.forEach(element => {
        incomeList.push(element.Income);
        lifeExpectancyList.push(element.LifeExpectancy);
        populationList.push(element.Population);
        // ensure uniqueness
        if(!regionList.includes(element.Region)) {
            regionList.push(element.Region);
        }
    });
    
    // scales for income, lifeExpectancy, regions, and population
    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(incomeList))  // input pool from data
        .range([0, width]);             // output pool reflects the chart size

    const yScale = d3
        .scaleLinear()
        .domain([d3.max(lifeExpectancyList), d3.min(lifeExpectancyList)]) // invert domain to start from bottom
        .range([0, height]);
    
    const ordinalScale = d3
        .scaleOrdinal()
        .domain(regionList)
        .range(d3.schemeTableau10)

    const popScale = d3
        .scaleSqrt()
        .domain(d3.extent(populationList))
        .range([5, 20])

    // console.log(xScale(d3.max(incomeList))); // returns the chart width
    // console.log(yScale(d3.max(lifeExpectancyList))); // returns the chart width

    // === Axes ===
    const xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(5, "s")
        
    const yAxis = d3.axisLeft()
        .scale(yScale)

    // draw axes
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis)

    // axes labels
    svg.append("text")
        .attr("class", "axis x-title")
		.attr("x", width - 38)  // magic number 1
        .attr("y", height - 10) // magic number 2
		// add attrs such as alignment-baseline and text-anchor as necessary
        .text("Income")
    
    svg.append("text")
        .attr("class", "axis y-title")
		.attr("x", 10)
        .attr("y", 0)
        .attr("writing-mode", "vertical-lr")
		// add attrs such as alignment-baseline and text-anchor as necessary
		.text("Life Expectancy")
        
    // === Legend ===
    // legend squares
    svg.append("g").attr("class", "legend").selectAll(".legend-squares")
        .data(regionList)
        .enter()
        .append("rect")
        .attr("x", legendX)
        .attr("y", (d, i) => legendY + (i * 16) - 10)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => ordinalScale(d))
        .append("text")

    // legend labels
    svg.selectAll(".legend-labels")
     .data(regionList)
     .enter()
     .append("text")
     .text(d => d)
     .attr("font-family", "sans-serif")
     .attr("font-size", "11px")
     .attr("text-anchor", "middle")
     .attr("x", d => legendX + 18)
     .attr("y", (d, i) => legendY + (16 * i) + 2)
     .attr("text-anchor", "left")

    // === Circles ===
    // encode data with circles
    svg.selectAll(".city-circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "city-circle")
        .attr("cx", d => xScale(d.Income))
        .attr("cy", d => yScale(d.LifeExpectancy))
        .attr("r", d => popScale(d.Population))
        .attr("opacity", 0.5)
        .attr("fill", d => ordinalScale(d.Region))
        .on("mouseenter", (event, d) => {
            
            const pos = d3.pointer(event, window);
            
            // show tooltip
            d3.select("#tooltip")
                .style("left", pos[0] + "px")
                .style("top", pos[1] + "px")
                .html(
                    `<p>Country: ${d.Country} </p>` +
                    `<p>Life Expectancy: ${d3.format(".3s")(d.LifeExpectancy)} </p>` +
                    `<p>Income: ${d3.format(".4s")(d.Income)} </p>` +
                    `<p>Population: ${d3.format(".4s")(d.Population)} </p>` +
                    `<p>Region: ${d.Region} </p>`                   
                )

            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false);
            
        })
        .on("mouseout", function(d) {
            //Hide the tooltip
            d3.select("#tooltip").classed("hidden", true);
        });


}
