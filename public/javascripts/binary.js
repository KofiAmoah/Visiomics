function createBoxPlot(filePath) {
	var width = window.innerWidth * 0.5;
	var height = window.innerHeight * 0.5;
	var margin = {left: 0.1 * width,
	    bottom: 0.1 * height,
	    right: 0.1 * width,
	    top: 0.1 * height
	};

	var svgContainer = d3.select("#viz")
	  .append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
	  .append('g')
	    .attr("id", "chart")
	    .attr("transform", "translate(" + margin.left + ','
	        + margin.top + ')');

	var x = d3.scale.ordinal();
	var y = d3.scale.linear()
		.range([height, margin.top]);//+5 to make it cross x-axis

	d3.tsv(filePath, function(data) {
		var keys = d3.keys(data[0]);
	    var IDs = keys[0];
	    var group = keys[1];
	    var measure = keys[2];

		var zeros = new Array();
		var ones = new Array();

		//Compare objects by RAB10_Protein_Exp Values
		function compare(a, b) {
			if (a[measure] < b[measure]) {
				return -1;
			} else if (a[measure] > b[measure]) {
				return 1;
			} else {
				return 0;
			}
		}

		data.forEach(function(d) {
			d[group] = +d[group];
			d[measure] = +d[measure];

			if (d[group] === 0) {
				zeros.push(d);
			} else {
				ones.push(d);
			}
		});

		//Sort zeros and ones from min to max RAB10 Values
		zeros.sort(compare);
		ones.sort(compare);

		q1Position = function(array) {
			var position = (array.length + 1) / 4;
			if (position % Math.floor(position) === 0) {
				return Math.floor((position + position - 1) / 2); 
			} else {
				return Math.floor(position);
			}
		};

		q3Position = function(array) {
			var position = (3 * (array.length + 1)) / 4;
			if (position % Math.floor(position) === 0) {
				return Math.floor((position + position - 1) / 2); 
			} else {
				return Math.floor(position);
			}
		};

		/*
			Looking at the example box plot Jing sent, the whiskers 
			were not based on the iqr, but I calculated it anyways 
			in case we have to use the iqr for the position of the 
			whiskers. Currently the whiskers are based on the min
			 and max values of the datasets
		*/
		function iqr(array) {
			return (array[q3Position(array)][measure] - 
				array[q1Position(array)][measure]);
		};

		x.domain(data.map(function(d) {
			return d[group];
		}))
			.rangeRoundBands([width, 0], 0.2, 0.2);
		/* 
			For the y axis domain I did not do d3,extent because
			I wanted to leave some room for the min and max values 
			on the axis...This provides some space for the lower
			bars of the whiskers, which may be very close to the x-axis
		*/
		y.domain([d3.min(data, function(d) {
			return d[measure] - 0.1;
		}), d3.max(data, function(d) {
			return d[measure] + 0.1;
		})]);

		var xAxis = svgContainer.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(-5," + height + ")")
			.call(d3.svg.axis().scale(x)
				.orient("bottom")
				.ticks([d3.max(data, function(d) {
					return d[group];
				})])
				.tickPadding(5).tickSize(1,1));

		var yAxis = svgContainer.append("g")
			.attr("class", "y-axis")
			.call(d3.svg.axis().scale(y)
				.orient("left")
				.ticks([d3.max(data, function(d) {
					return d[measure];
				})])
				.tickSize(1,1).tickPadding(5));

		var boxWidth = Math.round(x.rangeBand());

		//Draw the boxes
		var zerosBox = svgContainer.append("g")
			.attr("id", "zerosBox");
		var onesBox = svgContainer.append("g")
			.attr("id", "onesBox");

		//Draw whiskers first, behind the  boxes
		var zerosWhiskers = zerosBox.append("line")
			.attr("x1", x(zeros[q3Position(zeros)][group]) + boxWidth/2)
			.attr("y1", y(d3.max(zeros, function(d) {
				return d[measure];
			})))
			.attr("x2", x(zeros[q1Position(zeros)][group]) + boxWidth/2)
			.attr("y2", y(d3.min(zeros, function(d) {
				return d[measure];
			})))
			.style("stroke", "grey")
			.style("stroke-dasharray", ("5, 5"));

		zerosBox.append("line")
		  	.attr("x1", x(zeros[q3Position(zeros)][group]) + boxWidth/4)
		  	.attr("y1", y(d3.max(zeros, function(d) {
				return d[measure];
			})))
		  	.attr("x2", x(zeros[q3Position(zeros)][group]) + (3 * boxWidth/4))
		  	.attr("y2", y(d3.max(zeros, function(d) {
				return d[measure];
			})))
		  	.style("stroke", "grey");

		zerosBox.append("line")
		  	.attr("x1", x(zeros[q1Position(zeros)][group]) + boxWidth/4)
		  	.attr("y1", y(d3.min(zeros, function(d) {
				return d[measure];
			})))
		  	.attr("x2", x(zeros[q1Position(zeros)][group]) + (3 * boxWidth/4))
		  	.attr("y2", y(d3.min(zeros, function(d) {
				return d[measure];
			})))
		  	.style("stroke", "grey");

		 //Tooltips
	    var zerosTip = d3.tip()
	        .attr("class", "d3-tip")
	        .html(function() {
	            return "Median: " + d3.median(zeros, function(d) {
	            	return d[measure];
	            })
	            + "<br>Upper Quartile: " + zeros[q3Position(zeros)][measure]
	            + "<br>Lower Quartile: " + zeros[q1Position(zeros)][measure]
	            + "<br>Interquartile Range: " + iqr(zeros)
	        });

	    var onesTip = d3.tip()
	        .attr("class", "d3-tip")
	        .html(function() {
	            return "Median: " + d3.median(ones, function(d) {
	            	return d[measure];
	            })
	            + "<br>Upper Quartile: " + ones[q3Position(ones)][measure]
	            + "<br>Lower Quartile: " + ones[q1Position(ones)][measure]
	            + "<br>Interquartile Range: " + iqr(ones)
	        });

	    var sampleTip = d3.tip()
	    	.attr("class", "d3-tip")
	    	.html(function(d) {
	            return d["Sample"] + "<br>KRAS_Mutation: " + d3.round(d[group], 3) 
	                + "<br>RAB10_Protein_Exp: " + d3.round(d[measure], 3);
	             });

	    svgContainer.call(zerosTip);
	    svgContainer.call(onesTip);
	    svgContainer.call(sampleTip);

		var onesWhiskers = onesBox.append("line")
			.attr("x1", x(ones[q3Position(ones)][group]) + boxWidth/2)
			.attr("y1", y(d3.max(ones, function(d) {
				return d[measure];
			})))
			.attr("x2", x(ones[q1Position(ones)][group]) + boxWidth/2)
			.attr("y2", y(d3.min(ones, function(d) {
				return d[measure];
			})))
			.style("stroke", "grey")
			.style("stroke-dasharray", ("5, 5"));

		onesBox.append("line")
		  	.attr("x1", x(ones[q3Position(ones)][group]) + boxWidth/4)
		  	.attr("y1", y(d3.max(ones, function(d) {
				return d[measure];
			})))
		  	.attr("x2", x(ones[q3Position(ones)][group]) + (3 * boxWidth/4))
		  	.attr("y2", y(d3.max(ones, function(d) {
				return d[measure];
			})))
		  	.style("stroke", "grey");

		onesBox.append("line")
		  	.attr("x1", x(ones[q1Position(ones)][group]) + boxWidth/4)
		  	.attr("y1", y(d3.min(ones, function(d) {
				return d[measure];
			})))
		  	.attr("x2", x(ones[q1Position(ones)][group]) + (3 * boxWidth/4))
		  	.attr("y2", y(d3.min(ones, function(d) {
				return d[measure];
			})))
		  	.style("stroke", "grey");

		//Draw the boxes
		zerosBox.append("rect")
			.attr('x', x(zeros[q3Position(zeros)][group]))
			.attr('y', y(zeros[q3Position(zeros)][measure]))
			.attr("height", y(zeros[q1Position(zeros)][measure]) - 
				y(zeros[q3Position(zeros)][measure]))
			.attr("width", boxWidth)
			.style("stroke", "black")
			.style("fill", "white")
			.on("click", zerosTip.show)
			.on("mouseout", zerosTip.hide);

		zerosBox.append("line")
			.attr("x1", x(zeros[q3Position(zeros)][group]))
			.attr("y1", y(d3.median(zeros, function(d) {
				return d[measure];
			})))
			.attr("x2", x(zeros[q3Position(zeros)][group]) + boxWidth)
			.attr("y2", y(d3.median(zeros, function(d) {
				return d[measure];
			})))
			.style("stroke", "black")
			.style("stroke-width", 3);

		onesBox.append("rect")
			.attr('x', x(ones[q3Position(ones)][group]))
			.attr('y', y(ones[q3Position(ones)][measure]))
			.attr("height", y(ones[q1Position(ones)][measure]) - 
				y(ones[q3Position(ones)][measure]))
			.attr("width", boxWidth)
			.style("stroke", "black")
			.style("fill", "white")
			.on("click", onesTip.show)
			.on("mouseout", onesTip.hide);

		onesBox.append("line")
			.attr("x1", x(ones[q3Position(ones)][group]))
			.attr("y1", y(d3.median(ones, function(d) {
				return d[measure];
			})))
			.attr("x2", x(ones[q3Position(ones)][group]) + boxWidth)
			.attr("y2", y(d3.median(ones, function(d) {
				return d[measure];
			})))
			.style("stroke", "black")
			.style("stroke-width", 3);

		//Draw individual circles...randomize x-values
		svgContainer.selectAll(".sample")
			.data(data).enter()
		  .append("circle")
		  	.attr("class", "sample")
		  	.attr('r', 5)
		  	.attr("cx", function(d) {
		  		return x(d[group]) + 1/4 * boxWidth + (Math.random() * 1/2 * boxWidth);
		  	})
		  	.attr("cy", function(d) {
		  		return y(d[measure]);
		  	})
		  	.style("stroke", "black")
		  	.style("fill", "orange")
		  	.on("click", sampleTip.show)
		  	.on("mouseout", sampleTip.hide);

		//Label the axes and title
		svgContainer.append("text")
	        .attr('x', width/2)
	        .attr('y', height + margin.top/2)
	        .attr("font-size", "80%")
	        .style("text-anchor", "middle")
	        .text(group);

	    svgContainer.append("text")
	        .attr('x', -height/2)
	        .attr('y', -margin.left/2)
	        .attr("font-size", "80%")
	        .attr("transform", "rotate(-90)")
	        .style("text-anchor", "middle")
	        .text(measure);

	    svgContainer.append("text")
	    	.attr('x', width/2)
	    	.attr('y', (margin.top/2))
	    	.text(group + " vs " + measure + ": Binary")
	        .style("text-decoration", "underline")
	        .style("font-weight", "bolder")
	        .style("text-anchor", "middle");
	});
};