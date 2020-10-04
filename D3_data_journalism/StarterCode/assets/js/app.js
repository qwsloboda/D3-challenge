// @TODO: YOUR CODE HERE!

function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(hairData, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);  //width define at beginning of main code
  
    return xLinearScale;
  
  }
  
  // function used for updating xAxis var upon click on axis label
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
  
  // function used for updating circles group with a transition to
  // new circles upon click on axis label
  function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }
  
  // Added by Erin
  // Note:  as compared to renderCircles, the attr iterator needs to match what is created initially
  // So above I use "cx" and below I use "x" -  this must match where I defined it in Section 8A ("cx") and Section 8B ("x")
  function rendertextCircles(textcirclesGroup, newXScale, chosenXAxis) {
  
      textcirclesGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));
    
      return textcirclesGroup;
    }
  
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, circlesGroup) {
  
    var label;
  
    if (chosenXAxis === "poverty") {
      label = "In Poverty (%)";
    }
    else {
      label = "# of Albums:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
      });

    //Note:  Below circlesGroup is having the tooltip added but other objects could also have the tool tip added
    // I could add the functionality below because for some reason a second called object as long as an input will work despite not being returned
    // or call this function with a different object as its focus (input) instead of circlesGroup; the 2nd option is probably better
  
    circlesGroup.call(toolTip);
  
    // added 'this
    // https://github.com/Caged/d3-tip/issues/231#issuecomment-459758872    
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }





//########################  3.  SVG Setup ###################################//

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// xScale uses width so xScale() can only be called below this point
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);






// #################### 4.  BRING in Data  ###############//

// Initial Params - includes any axis selection that has multiple options
var chosenXAxis = "poverty";


// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(censusData, err) {
  if (err) throw err;
   
  // parse data - set values to numerical data types
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    //data.num_albums = +data.num_albums;
  });

  // Data Exploration (Section 1)
  // console.log(hairData)



// #################### 5.  chartGroup Append Title   ###############//


  // append y title to left side of chartGroup
  var yTitle = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");



// #################### 6.  chartGroup Append xAxis Object  ###############//

  // xLinearScale function above csv import; Note:  xLinearScale is a function contains scaled data specific to the defined axis
  // Important note:  xScale uses width that is defined above; xScale can only be called below width in the code
  // scaling function: https://www.d3indepth.com/scales/
  var xLinearScale = xScale(censusData, chosenXAxis);
  // Create initial axis functions; generates the scaled axis
  var bottomAxis = d3.axisBottom(xLinearScale);
  // append x axis; adds x axis chart data tick marks to chartgroup
  // for future axis value changes then the renderAxes() function needs called
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


// #################### 7.  chartGroup Append yAxis Object  ###############//

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.healthcare)])
    .range([height, 0]);
  // Create initial axis functions; sets pixel location for data scale
  var leftAxis = d3.axisLeft(yLinearScale);
  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);





// #################### 8.  chartGroup Append cirlclesGroupAll Object  ###############//

  // New by Erin - provide data first to object 
  // case is important - selectAll() works but SelectAll() would produce a type error - the capitalizaton makes a difference
  var circlesGroupAll = chartGroup
      .selectAll("circlesGroup")
      .data(censusData)
      .enter()
    
  

    // #################### 8A.  circlesGroupAll Append cirlcles Object  ###############//

        // modified by Erin - data is already bound to circlesGroupAll and now I am adding the 'circles' with one circle for each data
        // note that the attributes are "cx" and "cy"; the data is being scaled by the scaling functions defined above; see it is a function
        // the centers of the circles are also coming from the specific x data group 'chosenXAxis'
        // append initial circles
        var circlesGroup = circlesGroupAll
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", 20)
            .attr("fill", "blue")
            .attr("opacity", ".5");

    // #################### 8B.  circlesGroupAll Append text Object  ###############//

        // added by Erin - I wanted to add text to the circles - probably several ways of doing this but here is one.
        // data is bound to ciclesGroupAll like above and now I add a text element at "x" and "y", not the difference from above.
        // added round function to make the numbers in the cirlces have no decimals; this is a random data selection; I just wanted something inside the circles. If you want to see why these values are like they are then you need to back-calculate what xScale and transpose is doing
        var textcirclesGroup = circlesGroupAll
            .append("text")
            .text((d) => Math.round(xLinearScale(d[chosenXAxis])))
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d.healthcare));


// #################### 9.  chartGroup Append labelsGroup Object  ###############//
  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);


    // #################### 9A.  labelsGroup Append xlabel Object  ###############//

        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");


    // #################### 9B.  labelsGroup Append xlabel Object  ###############//

        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "poverty") // value to grab for event listener
            .classed("inactive", true)
            .text("In Poverty (%)");


// #################### 10.  circlesGroup/Tooltip - no clue why it is this way  ###############//
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  var textcirclesGroup = updateToolTip(chosenXAxis, textcirclesGroup)





// #################### 11.  ADD updates upon clicking axis text  ###############//

  // x axis labels event listener
  // if you comment out the entire labelsGroup section then you can see that the plot populates but does not update when selecting the axis
  // note that above this section, only the updateToolTip and xScale functions are called of all the user created functions at the top of the script
  // the other functions at the top of the page are used to re-define the data applied to the xLinearScale function, xAxis object, circlesGroup object, textcirclesGroup object, circlesGroup object
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        // New - updates text labels within circles
        textcirclesGroup = rendertextCircles(textcirclesGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        textcirclesGroup = updateToolTip(chosenXAxis, textcirclesGroup)

        // changes classes to change bold text
        if (chosenXAxis === "num_albums") {
          albumsLabel
            .classed("active", true)
            .classed("inactive", false);
          hairLengthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          albumsLabel
            .classed("active", false)
            .classed("inactive", true);
          hairLengthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});