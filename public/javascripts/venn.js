function createVenn (file1, file2) {
  var tooltip = d3.select("#viz").append("div")
    .attr("class", "venn-tooltip")
    .style("opacity", 0);

    var tooltip2 = d3.select("#viz").append("div")
    .attr("class", "venn-tooltip")
    .style("opacity", 0);

    var tooltip3 = d3.select("#viz").append("div")
    .attr("class", "venn-tooltip")
    .style("opacity", 0);
;
  queue()
  .defer(d3.text, file1)
  .defer(d3.text, file2)
  .await(function(error,file1,file2){
    
    var f1 = file1.split("\n");
    var f2 = file2.split("\n");
    var inter = new Array();
    var Gene1= new Array();
    var Gene2= new Array();

    for(var i=0, l=file1.split("\n").length; i < l; i++){
    if(file2.split("\n").indexOf(file1.split("\n")[i]) > -1){
      inter.push(file1.split("\n")[i]);
var section= inter.join("\n")
};
    }
    for(var i=0, l=file1.split("\n").length; i < l; i++){
    if(inter.indexOf(file1.split("\n")[i]) == -1){
      Gene1.push(file1.split("\n")[i]);
};
    }
   for(var i=0, l=file2.split("\n").length; i < l; i++){
    if(inter.indexOf(file2.split("\n")[i]) == -1){
      Gene2.push(file2.split("\n")[i]);
var section= inter.join("\n")
var Group1= Gene1.join("\n")
var Group2= Gene2.join("\n")
    
   
};
    }
 
var w = 960,
    h = 500;
 
var svg = d3.select("#viz").append("svg")
    .attr("width", w)
    .attr("height", h);
 
svg.append("svg:circle")
    .attr("cx", 350)
    .attr("cy", 250)
    .attr("r", (file1.split("\n").length)/2)
    .style("fill", "brown")
    .style("fill-opacity", ".5");
 
svg.append("svg:circle")
    .attr("cx", 600)
    .attr("cy", 250)
    .attr("r", (file2.split("\n").length)/2)
    .style("fill", "steelblue")
    .style("fill-opacity", ".5");


 
var circle = svg.append("circle")
.attr("cx", 350)
.attr("cy", 250)
.attr("r", (file1.split("\n").length)/2)
.style("opacity", 0)


      svg.append("text")
      .attr("x",350)
      .attr("y", 250)
      .text(Group1.split("\n").length)
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(Group1)
               .attr("x",350)
               .attr("y", 250)
      })
      .on("click", function(d) {
          tooltip.transition()
               .duration(300)
               .style("opacity", 0);

             });

      

var circle2 = svg.append("circle")
.attr("cx", 600)
.attr("cy", 250)
.attr("r",(file2.split("\n").length)/2)
.style("opacity",0)


svg.append("text")
      .attr("x",600)
      .attr("y", 250)
      .text(Group2.split("\n").length)
      .on("mouseover", function(d) {
          tooltip2.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip2.html(Group2)
               .attr("x",600)
               .attr("y", 250)
      })
      .on("click", function(d) {
          tooltip2.transition()
               .duration(300)
               .style("opacity", 0);

             });

var intersection = svg.append("circle")
.attr("cx", ((350+(file1.split("\n").length/2))/2)+((600-(file2.split("\n").length/2))/2))
.attr("cy", 250)
.attr("r", 70)
.style("opacity", 0)

svg.append("text")
      .attr("x",((350+(file1.split("\n").length/2))/2)+((600-(file2.split("\n").length/2))/2))
      .attr("y", 250)
      .text(section.split("\n").length)
      .on("mouseover", function(d) {
          tooltip3.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip3.html(section)
               .attr("x",((350+(file1.split("\n").length/2))/2)+((600-(file2.split("\n").length/2))/2))
               .attr("y", 250)
      })
      .on("click", function(d) {
          tooltip3.transition()
               .duration(300)
               .style("opacity", 0);

             });
  });
}