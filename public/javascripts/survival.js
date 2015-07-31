/**
 * Checks whether the user is using Internet Explorer.
 */ 
function isIE(){
	var ms_ie = false;
	var ua = window.navigator.userAgent;
	var old_ie = ua.indexOf('MSIE ');
	var new_ie = ua.indexOf('Trident/');

	if ((old_ie > -1) || (new_ie > -1)) ms_ie = true;
	
	return ms_ie;
}

d3.selection.prototype.moveToFront = function(){
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

/**
 * Reads and checks for errors the data supplied in the form and then graphs it.
 */ 

function getInputDataAndDrawKM(){
    // Parameters.
    var id = "#viz", width = 600, height = 470, margin = 50; 

    //Load data and draw the Kaplan Meier plot.
    //var inputData = getInputData(fileName);;
    //console.log(inputData);
    if (typeof(inputData) == "string"){
        // We've got an error message. The user supplied incorrectly formatted data.
        //message(inputData);
    }
    else{ 
        if (d3.select("svg") != false){
            d3.select("svg").remove();
        }

        var vis = d3.select(id)
                    .append("svg:svg")
                    .attr("width",  width)
                    .attr("height", height);
        var g = vis.append("svg:g");

        // Create the scaling transformations for the two axes.
        var xTransform = d3.scale.linear()
                                 .domain([0, d3.max(inputData.times)])
                                 .range([0 + margin, width - margin]);
        var yTransform = d3.scale.linear()
                                 .domain([1, 0])
                                 .range([0 + margin/2, height - margin]);

        // X-axis.
        var xAxis = d3.svg.axis().scale(xTransform).orient("bottom");
        g.append("g")
         .attr("class", "axis")
         .attr("transform", "translate(0," + (height - margin) + ")")
         .call(xAxis);

        // Y-axis.
        var yAxis = d3.svg.axis().scale(yTransform).orient("left");
        g.append("g")
         .attr("class", "axis")
         .attr("transform", "translate(" + margin + ",0)")
         .call(yAxis);

        // X-axis label.
        g.append("text")
         .attr("text-anchor", "end")
         .attr("x", width / 2)
         .attr("y", height - 12)
         .text("Time");         
        
        // Y-axis label.        
        g.append("text")
         .attr("text-anchor", "end")
         .attr("x", -160)
         .attr("dy", ".75em")
         .attr("transform", "rotate(-90)")
         .text("Survival Probability");
    
        // Draw the survival estimates and confidence intervals. The confidence intervals must be drawn first, otherwise
        // they will obscure the lines, preventing the mouseover effects defined on the survival estimates (the lines). 
        groups = unique(inputData.groups);
		if (inputData.ciType != "none"){
			for (var igrp = 0; igrp < groups.length; igrp++){
				var cmp = compare(x=inputData.groups, operator="eq", val=groups[igrp]);
				drawKMCI(g, subset(inputData.times, cmp), subset(inputData.events, cmp), inputData.z, inputData.ciType, xTransform, yTransform, igrp);
			}
		}
        for (var igrp = 0; igrp < groups.length; igrp++){
            var cmp = compare(x=inputData.groups, operator="eq", val=groups[igrp]);
            var groupName = subset(inputData.groups, cmp)[0];
            drawKM(g, subset(inputData.times, cmp), subset(inputData.events, cmp), xTransform, yTransform, igrp, groupName);
        }
    }
}

/**
 * Reads and checks for errors the data supplied in the form.
 * Returns: 
 *  * "times":  Array of event or censoring times (non-negative ints or floats).
 *  * "events": Array of Booleans (true for event, false for censoring). This array will be the same length as the array of times.
 *  * "groups": Array of strings. Will be of zero length if no groups were supplied. Otherwise this array will be 
 *              the same length as the array of times and events.
 *  * "ciType": "ordinary", "log", "loglog" or "none".
 *  * "z":      The z-score to use for the confidence intervals, e.g. 1.96.
 */ 

function getInputData(fileName){
    var times = new Array();
    var events = new Array();
    var groups = new Array();
    var ciType = "ordinary";
    var z = 1.3 //Approximately 90% confidence

    $.ajax({
        url: window.location.href,
        //data: fileName,
        async: false,
        success: function(){
            d3.tsv(fileName, function(data) {
                var keys = d3.keys(data[0]);
                var time = keys[1];
                var evnt = keys[2];
                var group = keys[3];

                data.forEach(function(d) {
                    d[time] = +d[time];

                    times.push(d[time]);
                    events.push(d[evnt] == 1);
                    groups.push(d[group]);
                });
                inputData = {
                    "times": times,
                    "events": events,
                    "groups": groups,
                    "ciType": ciType,
                    "z": z
                };

                getInputDataAndDrawKM();
            });
        }
    });	
};

/**
 * Draws a confidence interval for the Kaplan-Meier estimate of the survival curve obtained from the  
 * supplied array of times and events. 
 */ 
function drawKMCI(g, times, events, z, ciType, xTransform, yTransform, groupNum){
    km = kaplanMeier(times, events);
    //console.log(km);
    
    if (ciType == "ordinary") ci = ciKaplanMeier(km.kaplanMeier, km.greenwoodSE,       z, ciType);
    if (ciType == "log")      ci = ciKaplanMeier(km.kaplanMeier, km.greenwoodSELog,    z, ciType);
    if (ciType == "loglog")   ci = ciKaplanMeier(km.kaplanMeier, km.greenwoodSELogLog, z, ciType);
    
    ciLowerStep = stepFnData(km.time, ci[0]);
    ciUpperStep = stepFnData(km.time, ci[1]);
    
    var lineFunction = d3.svg.line()
                         .x(function(d){return d[0];})
                         .y(function(d){return d[1];})
                         .interpolate("linear");

     // Draw the confidence intervals.
    var areaData = joinArrays(arrayOf2DimArrays(ciLowerStep["x"], ciLowerStep["y"], xTransform, yTransform), 
                              arrayOf2DimArrays(ciUpperStep["x"], ciUpperStep["y"], xTransform, yTransform).reverse());
    g.append("path")
     .attr("class", "survarea survarea" + groupNum)
     .attr("d", lineFunction(areaData)); 
}

/**
 * Draws a Kaplan-Meier estimate of the survival curve obtained from the supplied array of times and events.
 */ 
function drawKM(g, times, events, xTransform, yTransform, groupNum, groupName){
    var km = kaplanMeier(times, events);
    var kmStep = stepFnData(joinArrays([0], km.time), joinArrays([1], km.kaplanMeier));
    var lineFunction = d3.svg.line()
                         .x(function(d){return d[0];})
                         .y(function(d){return d[1];})
                         .interpolate("linear");
    var highlight_fn = function(){
		if (isIE()){
			// IE doesn't handle z-indexes in D3 very well.
			d3.selectAll(".survline"   + groupNum).classed("active", true);
			d3.selectAll(".survcircle" + groupNum).classed("active", true);
		}
		else {
			d3.selectAll(".survline"   + groupNum).classed("active", true).moveToFront();
			d3.selectAll(".survcircle" + groupNum).classed("active", true).moveToFront();
		}
        d3.selectAll(".survarea"   + groupNum).classed("active", true);
        //message("Highlighted Group:  " + groupName);
    }
    var dehighlight_fn = function(){
        d3.selectAll(".survline"   + groupNum).classed("active", false);
        d3.selectAll(".survcircle" + groupNum).classed("active", false);
        d3.selectAll(".survarea"   + groupNum).classed("active", false);
        //clearMessage();
    }
    
    // Draw the lines.
    g.append("path")
        .attr("class", "survline survline" + groupNum)
        .attr("d", lineFunction(arrayOf2DimArrays(kmStep["x"], kmStep["y"], xTransform, yTransform)))
        .on("mouseover", highlight_fn) 
        .on("mouseout",  dehighlight_fn);
	 
    // Draw circles to show censoring.    
    var hasCensoring = compare(km.nCensored, "gt", 0)
    g.selectAll("circle")
        .data(arrayOf2DimArrays(subset(km.time, hasCensoring), subset(km.kaplanMeier, hasCensoring), xTransform, yTransform))
        .enter()
      .append("circle")
        .attr("class", "survcircle survcircle" + groupNum)
        .attr("cx", function(d){return d[0];})
        .attr("cy", function(d){return d[1];})
        .attr("r", 3)     
        .on("mouseover", highlight_fn)
        .on("mouseout",  dehighlight_fn);
}

/**
 * Turns an array of x-axis values and an array of y-axis values into a pair of arrays that give the  
 * coordinates of a derived step function.
 * E.g. x=[1, 2] and y=[7, 6] -> [[1, 2, 2], [7, 7, 6]]
 */
function stepFnData(x, y){
    var stepx = [], stepy = [];
    for (var i = 0; i < x.length; i++){
        if ((i > 0) && !isNaN(y[i-1])){
            stepx.push(x[i]);
            stepy.push(y[i-1]);
        }
        if (!isNaN(y[i])){
            stepx.push(x[i]);
            stepy.push(y[i]);
        }
    }
    return {"x": stepx, "y": stepy};
};