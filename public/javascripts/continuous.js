function createScatter(filePath) {

var width = window.innerWidth * 0.5;
var height = window.innerHeight * 0.5;
var margin = {left: 0.1 * width,
    bottom: 0.1 * height,
    right: 0.1 * width,
    top: 0.1 * height
};            

//Scales
var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

//Leaving a margin for the title and y-axis labels
var svgContainer = d3.select('#viz').append('svg')
    .attr("height", height + margin.bottom + margin.top)
    .attr("width", width + margin.left + margin.right)
  .append('g')
    .attr("id", "chart")
    .attr("transform", "translate(" + margin.left + ','
        + margin.top + ')');

var gene1 = "";
var gene2 = "";
var analysisID = -1;

//Loading data file and plotting the dots
d3.tsv(filePath, function(data) {
    var keys = d3.keys(data[0]);
    var IDs = keys[0];
    var xValues = keys[1]
    var yValues = keys[2]
    
    data.forEach(function(d) {
        d[xValues] = +d[xValues]; // x-values
        d[yValues] = +d[yValues]; // y-values
    });

    x.domain(d3.extent(data, function(d) {
        return d[xValues];
    }));
    y.domain(d3.extent(data, function(d) {
        return d[yValues];
    }))

    //Plotting the x and y axes
    var xAxis = svgContainer.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(-5," + height + ")")
      .call(d3.svg.axis().scale(x).orient("bottom").ticks([d3.max(data, function(d) {
        return d[xValues];
      })])
      .tickPadding(5).tickSize(1,1));

    var yAxis = svgContainer.append("g")
      .attr("class", "y-axis")
      .call(d3.svg.axis().scale(y).orient("left").ticks([d3.max(data, function(d) {
        return d[yValues];
      })])
        .tickPadding(5).tickSize(1,1));

    //Tooltips
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
            return d[IDs] + "<br>" + xValues + ": " + d3.round(d[xValues], 2) 
                + "<br>" + yValues + ": " + d3.round(d[yValues], 2);
        });

    svgContainer.call(tip);

    //Title
    svgContainer.append("text")
        .attr('x', width/2)
        .attr('y', -(margin.top/2))
        .text(xValues + " vs " + yValues + ": Continuous")
        .style("text-decoration", "underline")
        .style("font-weight", "bolder")
        .style("text-anchor", "middle");

    // Draw trendline behind circles
    var trendline = svgContainer.append("line")
        .attr("id", "trendline");
   
    //Draw circles
    svgContainer.selectAll(".sample")
        .data(data).enter()
      .append("circle")
        .attr("class", "sample")
        .attr('r', 5)
        .attr("cx", function(d) {return x(d[xValues]); })
        .attr("cy", function(d) {return y(d[yValues]); })
        .style("stroke", "black")
        .style("fill", "orange")
        .on("click", tip.show)
        .on("mouseout", tip.hide);  

    //Label x-axis
    svgContainer.append("text")
        .attr('x', width/2)
        .attr('y', height + margin.top)
        .attr("font-size", "80%")
        .style("text-anchor", "middle")
        .text(xValues);

    //Label y-axis
    svgContainer.append("text")
        .attr('x', -height/2)
        .attr('y', 2 * -margin.left/3)
        .attr("font-size", "80%")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text(yValues);


    //Trendline Calculations

    //Mean of x and y values...
    var meanX = d3.mean(data, function(d) {
        return d[xValues];
    });
    var meanY = d3.mean(data, function(d) {
        return d[yValues];
    });

    //Standard deviation of x and y values
    var stanDevX = d3.deviation(data, function(d) {
        return d[xValues];
    });
    var stanDevY = d3.deviation(data, function(d) {
        return d[yValues];
    });

    //Correlation...Looked up this formula on wikiHow
    /*
    var correlation = d3.sum(data, function(d) {
        (d[xValues] - meanX) * (d[yValues]) - meanY}) / 
        Math.sqrt(d3.sum(data, function(d) {return Math.pow((d[xValues] - meanX), 2); }) 
            * d3.sum(data, function(d) {return Math.pow((d[yValues] - meanY), 2); })
            );
    //*/

    //This correlation formula is from http://www.stat.yale.edu/Courses/1997-98/101/correl.htm
    var correlation = (1 / (data.length - 1)) * d3.sum(data, function(d) {
        return ((d[xValues] - meanX) / stanDevX) * ((d[yValues] - meanY) / stanDevY);
    });

    var slope = correlation * (stanDevX / stanDevY);
    var yIntercept = meanY - (slope * meanX);

    //Let x1 and x2 be the smallest and largest x-values in the dataset respectively
    // Calculate y1 an y2 from x1 and x2 based on the slope and y intercept above
    // y = mx + c
    var x1 = d3.min(data, function(d) {
        return d[xValues];
    });
    var x2 = d3.max(data, function(d) {
        return d[xValues];
    });

    var y1 = (slope * x1) + yIntercept;
    var y2 = (slope * x2) + yIntercept;

    //Determine the sign of the y-intercept
    var sign = (yIntercept >= 0) ? "+" : "-";

    var lineTip = d3.tip()
        .attr("class", "d3-tip")
        .html("y = " + d3.round(slope, 2) 
            + "x " + sign + " " + d3.round(yIntercept, 2));

    svgContainer.call(lineTip);

    //Adding trendline attrbutes. Trendline is defined above
    trendline.attr("x1", x(x1))
        .attr("y1", y(y1))
        .attr("x2", x(x2))
        .attr("y2", y(y2))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", lineTip.show)
        .on("mouseout", lineTip.hide);

    svgContainer.append("text")
        .attr('x', width/2)
        .attr('y', height - margin.bottom)
        .attr("font-size", "80%")
        //.style("text-anchor", "end")
        .text("Pearson Correlation: " + d3.round(correlation, 4));
});

};
