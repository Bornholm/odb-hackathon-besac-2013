(function() {

  var chart = document.getElementById('chart');
  var vPadding = 20;
  var hPadding = 100;
  var width;
  var innerWidth;
  var height;
  var innerHeight;

  var svg = d3.select(chart).append('svg');
  var mainGroup = svg.append('g');

  function updateSize() {

    width = $(chart).width();
    innerWidth = width - hPadding*2;
    height = width * (7/16);
    innerHeight = height - vPadding*2;

    svg
      .attr('width', width)
      .attr('height', height);

  }

  updateSize();

  mainGroup.attr('transform', 'translate(' + hPadding + ',' + vPadding + ')');

  d3.csv('data/besac.csv', function(err, data) {

    

    var fields = Object.keys(data[0]).filter(function(k) {
      return ['année', 'code', 'url', 'nom', 'year.1'].indexOf(k) === -1;
    });

    var selectedField = fields[0];

    d3.select('#selector')
      .on('change', function() {
        selectedField = this.value;
        render(selectedField);
      })
      .selectAll('option')
      .data(fields)
      .enter()
      .append('option')
      .attr('value', function(d) {
        return d;
      })
      .text(function(d) {
        return d;
      });

    render(selectedField);

    $(window).resize(function() {
      updateSize();
      render(selectedField);
    });

    function render(field) {

      mainGroup.selectAll('*').remove();

      var pluck = data.map(function(d) {
        return +d[field];
      });

      var min = Math.min.apply(Math, pluck);
      var max = Math.max.apply(Math, pluck);

      var yScale = d3.scale.linear()
        .domain([min-(max*0.1), max+(max*0.1)])
        .range([innerHeight, 0]);

      var xScale = d3.scale.linear()
        .domain([1999, 2000 + data.length])
        .range([0, innerWidth]);

      var xAxis = d3.svg.axis()
        .orient('bottom')
        .scale(xScale)
        .ticks(data.length)
        .tickSize(1)
        .tickPadding(1)
        .tickFormat(function(d) {
          return d;
        })

      var yAxis = d3.svg.axis()
        .orient('left')
        .scale(yScale)
        .tickSize(1)
        .tickFormat(function(d) {
          return d;
        })
        .tickPadding(1);

      var baseLine = d3.svg.line()
        .x(function(d, i) {
          return xScale(+d.année);
        })
        .y(innerHeight)

      var line = d3.svg.line()
        .x(function(d, i) {
          return xScale(+d.année);
        })
        .y(function(d) {
          return yScale(+d[field])
        })

      mainGroup
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', function() {
          return 'translate(0,' + innerHeight + ')';
        })
        .call(xAxis);

      mainGroup
        .selectAll('.x-axis .tick line')
        .attr('y2', -innerHeight);

      mainGroup
        .append('g')
        .attr('class', 'y-axis')
        .call(yAxis)

      mainGroup
        .selectAll('.y-axis .tick line')
        .attr('x2', innerWidth);

      mainGroup
        .append('g')
        .selectAll('path')
        .data([data])
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('d', baseLine)
        .transition()
        .duration(500)
        .attr('d', line)

      var hint;

      mainGroup
        .append('g')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', 4)
        .attr('class', 'point')
        .attr('cx', function(d) {
          return xScale(+d.année)
        })
        .attr('cy', innerHeight)
        .on('mouseover', function(d) {
          var point = d3.select(this);
          hint = mainGroup.append('text');
          hint
            .attr('x', +point.attr('cx') +5)
            .attr('y', +point.attr('cy') +5)
            .attr('class', 'hint')
            .attr('text-anchor', 'start')
            .text(d[field]);
        })
        .on('mouseout', function(d) {
          if(hint) {
            hint.remove();
            hint = null;
          }
        })
        .transition()
        .duration(500)
        .attr('cy', function(d) {
          return yScale(+d[field]);
        });

      }

  });

}())