import * as d3 from 'd3'
import * as d3Legend from 'd3-svg-legend'
import color from '../../css/source/partials/_color_js.scss'

export function initPhenologyHisto() {
  const month = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
    'aout', 'septembre', 'octobre', 'novembre', 'decembre'
  ]

  const label = ['Fleur', 'Fruit']
  const colors = [color.phenologyFlower, color.phenologyFruit]

  var height = $('#phenologyHisto').height()
  var width = $('#phenologyHisto').width()
  var margin = {
    top: height * 0.08,
    right: width * 0.07,
    bottom: height * 0.19,
    left: width * 0.12
  }
  const mheight = height - margin.top - margin.bottom - 25
  const mwidth = width - margin.left - margin.right

  // create canvas
  const svg = d3.select('#phenologyHisto').append('svg')
    .attr('width', width)
    .attr('height', height)
  const svgLegend = d3.select('#phenologyHistoLegend').append('svg')
    .attr('width', width)
    .attr('height', height * 0.3)

  const xDomain = month
  const yDomain = [0, 100]

  // Scale
  const xScale = d3.scaleBand()
    .range([0, mwidth])
    .domain(xDomain)
    .padding(0.1)

  const yScale = d3.scaleLinear()
    .range([mheight, 0])
    .domain(yDomain)

  // Axis
  const xAxis = d3.axisBottom(xScale).ticks(10)
  const yAxis = d3.axisLeft(yScale).ticks(5)

  // create data
  var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  // create Axis
  svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + (mheight + margin.top) + ')')
    .attr('class', 'xAxis')
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-65)')
  svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('class', 'yAxis')
    .call(yAxis)

  const svgLabel = svg.append('g')
    .attr('class', 'label')

  // x axis label
  // svg.append('text')
  //   .attr('class', 'xLabel')
  //   .attr('transform', 'translate(' +
  //     (width / 2) + ' ,' +
  //     (height) + ')')
  //   .style('text-anchor', 'middle')
  //   .text('Fruit/Fleur')

  // y axis label
  svgLabel.append('text')
    .attr('class', 'yLabel')
    .attr('transform', 'rotate(-90)')
    .attr('y', margin.left - 50)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Fréquence')

  // Legend
  svgLegend.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + width * 0.1 + ', ' + 0 + ')')

  var colorScale = d3.scaleOrdinal()
    .domain(label)
    .range(colors)

  var legendColor = d3Legend.legendColor()
    .shapePadding(5)
    .scale(colorScale)
    .shapeWidth(10)
    .shapeHeight(10)

  svgLegend.select('.legend')
    .call(legendColor)

  // Update Data for trigger
  $('#taxon_treeview').on('taxonSelected', function (event, data) {
    updateData(data)
  })

  function updateData(taxon) {
    var dataFleur = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    var dataFruit = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    switch (taxon.phenology.length) {
      case 1:
        if (taxon.phenology[0].phenology == 'fleur') {
          dataFleur = [
            taxon.phenology[0].january,
            taxon.phenology[0].february,
            taxon.phenology[0].march,
            taxon.phenology[0].april,
            taxon.phenology[0].may,
            taxon.phenology[0].june,
            taxon.phenology[0].july,
            taxon.phenology[0].august,
            taxon.phenology[0].september,
            taxon.phenology[0].october,
            taxon.phenology[0].november,
            taxon.phenology[0].december
          ]
        } else {
          dataFruit = [
            taxon.phenology[0].january,
            taxon.phenology[0].february,
            taxon.phenology[0].march,
            taxon.phenology[0].april,
            taxon.phenology[0].may,
            taxon.phenology[0].june,
            taxon.phenology[0].july,
            taxon.phenology[0].august,
            taxon.phenology[0].september,
            taxon.phenology[0].october,
            taxon.phenology[0].november,
            taxon.phenology[0].december
          ]
        };
        break
      case 2:
        dataFruit = [
          taxon.phenology[0].january,
          taxon.phenology[0].february,
          taxon.phenology[0].march,
          taxon.phenology[0].april,
          taxon.phenology[0].may,
          taxon.phenology[0].june,
          taxon.phenology[0].july,
          taxon.phenology[0].august,
          taxon.phenology[0].september,
          taxon.phenology[0].october,
          taxon.phenology[0].november,
          taxon.phenology[0].december
        ]
        dataFleur = [
          taxon.phenology[1].january,
          taxon.phenology[1].february,
          taxon.phenology[1].march,
          taxon.phenology[1].april,
          taxon.phenology[1].may,
          taxon.phenology[1].june,
          taxon.phenology[1].july,
          taxon.phenology[1].august,
          taxon.phenology[1].september,
          taxon.phenology[1].october,
          taxon.phenology[1].november,
          taxon.phenology[1].december
        ]
        break
    }

    var data = []
    for (var i = 0; i < month.length; i++) {
      data[i] = {
        fleur: dataFleur[i],
        fruit: dataFruit[i],
        mois: month[i]
      }
    }

    // Fleur
    var rects = g.selectAll('.bar1').data(data)
    // Fruit
    var rect1s = g.selectAll('.bar2').data(data)

    rects.enter().append('rect')
      .attr('class', 'bar1')
      .attr('x', d => xScale(d.mois))
      .attr('y', d => yScale(d.fleur))
      .style('fill', colors[0])
      .attr('width', d => xScale.bandwidth() / 2)
      .attr('height', d => mheight - yScale(d.fleur))

    rect1s.enter().append('rect')
      .attr('class', 'bar2')
      .attr('x', d => xScale(d.mois) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.fruit))
      .style('fill', colors[1])
      .attr('width', d => xScale.bandwidth() / 2)
      .attr('height', d => mheight - yScale(d.fruit))

    rects.transition()
      .duration(500)
      .attr('y', d => yScale(d.fleur))
      .attr('height', d => mheight - yScale(d.fleur))

    rect1s.transition()
      .duration(500)
      .attr('y', d => yScale(d.fruit))
      .attr('height', d => mheight - yScale(d.fruit))

    rects.exit().remove()
    rect1s.exit().remove()
  };
};