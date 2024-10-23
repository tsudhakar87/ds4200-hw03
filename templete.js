// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    let width = 600,
        height = 400;

    let margin = {
        top: 30,
        bottom: 50,
        left: 50,
        right: 30
    }

    // Create the SVG container
    let svg = d3.select('#scatterplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightyellow');

    // Set up scales for x and y axes
    let xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength), d3.max(data, d => d.PetalLength)])
        .range([margin.left, width - margin.right]);

    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth), d3.max(data, d => d.PetalWidth)])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add x-axis
    let xAxis = svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    let yAxis = svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Add circles for each data point
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.PetalLength))
        .attr('cy', d => yScale(d.PetalWidth))
        .attr('r', 3)
        .attr('fill', d => colorScale(d.Species));

    // Add x-axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10) // Adjusted y position
        .text('Petal Length')
        .style('text-anchor', 'middle');

    // Add y-axis label
    svg.append('text')
        .attr('x', -(height / 2))
        .attr('y', 15) // Adjusted y position
        .attr('transform', 'rotate(-90)')
        .text('Petal Width')
        .style('text-anchor', 'middle');

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("circle")
        .attr("cx", width - 100)
        .attr("cy", 10)
        .attr("r", 7)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width - 90)
        .attr("y", 15)
        .text(d => d)
        .style("text-anchor", "start");

});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    let width = 600,
        height = 400;

    let margin = {
        top: 30,
        bottom: 50,
        left: 50,
        right: 30
    }

    // Create the SVG container
    let svg = d3.select('#boxplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightyellow');

    // Set up scales for x and y axes
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength)]) 
        .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Species))]) 
        .range([margin.left, width - margin.right])
        .padding(0.2);

    // Add scales
    // Add x-axis
    let xAxis = svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    let yAxis = svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

     // Add x-axis label
     svg.append('text')
     .attr('x', width / 2)
     .attr('y', height - 10) // Adjusted y position
     .text('Species')
     .style('text-anchor', 'middle');

    // Add y-axis label
    svg.append('text')
     .attr('x', -(height / 2))
     .attr('y', 15) // Adjusted y position
     .attr('transform', 'rotate(-90)')
     .text('Petal Length')
     .style('text-anchor', 'middle');

    // Rollup function to calculate quartiles for each species
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const min = d3.min(values);
        const max = d3.max(values);
        return { q1, median, q3, min, max };
    };

    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // Draw boxplot for each species
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species); // X position based on species
        const boxWidth = xScale.bandwidth();

        // Draw vertical line (min to max)
        svg.append('line')
            .attr('x1', x + boxWidth / 2)
            .attr('x2', x + boxWidth / 2)
            .attr('y1', yScale(quartiles.min))
            .attr('y2', yScale(quartiles.max))
            .attr('stroke', 'black');

        // Draw the box (q1 to q3)
        svg.append('rect')
            .attr('x', x)
            .attr('y', yScale(quartiles.q3))
            .attr('width', boxWidth)
            .attr('height', yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr('stroke', 'black')
            .attr('fill', 'lightblue');

        // Draw the median line
        svg.append('line')
            .attr('x1', x)
            .attr('x2', x + boxWidth)
            .attr('y1', yScale(quartiles.median))
            .attr('y2', yScale(quartiles.median))
            .attr('stroke', 'black');
    });
});