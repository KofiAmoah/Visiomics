function scatter2(filePath) {
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d){return d.corr_miRNA143_mrna;},
xScale = d3.scale.linear().range([0,width]),
xMap = function(d){return xScale(xValue(d));},
xAxis = d3.svg.axis().scale(xScale).orient("bottom");

//setup y
var yValue = function(d){return d["corr_miRNA143_protein"];},
yScale = d3.scale.linear().range([height,0]),
yMap = function(d) {return yScale(yValue(d));},
yAxis = d3.svg.axis().scale(yScale).orient("left");

//Setup color (deleted)
// add the graph canvas to the body of the webpage
var svg = d3.select("#viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // hover over tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    // load data
d3.tsv(filePath, function(error, data) {
  //set variable. Replace spaces with commas
  
  //var commas = data.replace(/ /g, ",");
  //change string to parsed values
  data.forEach(function(d) {
    d.corr_miRNA143_mrna = +d.corr_miRNA143_mrna;
    d["corr_miRNA143_protein"] = +d["corr_miRNA143_protein"];
  });
// don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-.02, d3.max(data, xValue)+.02]);
  yScale.domain([d3.min(data, yValue)-.02, d3.max(data, yValue)+.02]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("corr_miRNA143_mrna");

      // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("corr_miRNA143_protein");

      // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 2)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .attr("fill", "lightsteelblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["GeneSymbol"] + "<br/> (" + xValue(d) 
          + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px")
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
               
      });
      function EY(data){
        var EY = 0;
        for(var i= 0; i < data.length; i++){
          EY += data[i]["corr_miRNA143_protein"];
        }
        return EY;
      }

      function EX(data){
        var EX = 0;
        for(var i= 0; i < data.length; i++){
          EX += data[i]["corr_miRNA143_mrna"];
        }
        return EX;
      }

      function EXY(data){
        var EXY = 0;
        for(var i=0; i < data.length; i++){
          EXY += (data[i]["corr_miRNA143_mrna"] * data[i]["corr_miRNA143_mrna"])
        }
        return EXY
      }

      function EXTwo(data){
        var EXTwo = 0;
        for(var i= 0; i < data.length; i++){
          EXTwo += Math.pow(data[i]["corr_miRNA143_mrna"],2);
        }
        return EXTwo;
      }

      var slope = (data.length*(EXY(data))-(EX(data))*(EY(data)))/(data.length*EXTwo(data) - Math.pow(EX(data), 2));
      var intercept = (EY(data) - slope*EX(data))/data.length;

       
      x1 = d3.min(data, function(d) {
        return d["corr_miRNA143_mrna"];
      });
      

       
        x2 = d3.max(data, function(d) {
          return d["corr_miRNA143_mrna"];
        });
    
      var y1 = intercept + slope*(x1);
      var y2 = intercept + slope*(x2);

     


 var line = svg.append("line")
 .attr("x1", xScale(x1))
 .attr("y1", yScale(y1))
.attr("x2", xScale(x2))
.attr("y2", yScale(y2))
.attr("stroke-width", 2)
.attr("stroke", "blue")
});
};