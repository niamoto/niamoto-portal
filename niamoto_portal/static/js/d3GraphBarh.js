'use strict'

import * as d3 from 'd3'

export class GraphBarh {
  constructor (configuration) {
    // default configuration settings
    var config = {
      height: 200,
      width: 200,
      margin: 10,
      minValue: 0,
      maxValue: 100,
      majorTicks: 5,
      color: ['#444', '#aaa', '#eee'],
      transitionMs: 1000,
      displayUnit: 'Value',
      container: '',
      title: '',
      xLabel: '',
      yLabel: '',
      value: '',
      legend: ''
    }

    this.config = Object.assign(config, configuration)

    this.margin = {
      top: this.config.height * 0.003,
      right: this.config.width * 0.03,
      bottom: this.config.height * 0.2,
      left: this.config.width * 0.15
    }

    this.mheight = this.config.height - this.margin.top - this.margin.bottom
    this.mwidth = this.config.width - this.margin.left - this.margin.right

    this.svg = d3.select(this.config.container).append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

    this.xAxis = this.svg.append('g')
      .attr('class', 'xAxis')
      .attr('transform', 'translate(' + this.margin.left + ',' + (this.mheight + this.margin.top) + ')')
    this.xGrid = this.svg.append('g')
      .attr('class', 'xGrid')
      .attr('transform', 'translate(' + this.margin.left + ',' + (this.mheight + this.margin.top) + ')')

    this.yAxis = this.svg.append('g')
      .attr('class', 'yAxis')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    this.svgLabel = this.svg.append('g')
      .attr('class', 'label')

    // Label Y
    this.svgLabel.append('text')
      .attr('class', 'yLabel')
      .attr('transform', 'rotate(-90)')
      .attr('y', 5)
      .attr('x', 0 - this.config.height * 0.5)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text(this.config.yLabel)

    // Label X
    this.svgLabel.append('text')
      .attr('class', 'xLabel')
      .attr('y', this.config.height * 0.92)
      .attr('x', this.config.width * 0.55)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text(this.config.xLabel)

    // Legend

    const svgLegend = d3.select(this.config.container + 'Legend').append('svg')
      .attr('width', this.mwidth)
      .attr('height', this.mheight * 0.3)

    svgLegend.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + this.mwidth * 0.1 + ', ' + 0 + ')')
      .attr('dy', '.5em')
      .attr('dx', '.5em')

    var colorScale = d3.scaleOrdinal()
      .domain(this.config.value)
      .range(this.config.color)

    var legendColor = d3.legendColor()
      .shapePadding(5)
      .scale(colorScale)
      .shapeWidth(10)
      .shapeHeight(10)

    svgLegend.select('.legend')
      .call(legendColor)
  }

  render (newValue) {

  }

  update (response) {
    var stack = d3.stack()
      .keys(['forest', 'outForest'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)
    var data = stack(response)

    const yValue = response.map(d => d.class_name)
    const xMax = d3.max(data, d => d3.max(d, d => d[1]))

    var yScale = d3.scalePoint()
      .domain(yValue)
      .range([0, this.mheight])
      .padding(1)

    var xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, this.mwidth])

    var xGrid = g => g
      .call(d3.axisBottom(xScale)
        .tickSizeInner(-this.mheight)
        .ticks(6))
      .call(g => g.selectAll('.domain').remove())
      .call(g => g.selectAll('.tick text').remove())

    var xAxis = g => g
      .call(d3.axisBottom(xScale)
        .ticks(6, '0f')
        .tickSizeOuter(0)
      )

    var yAxis = g => g
      .call(d3.axisLeft(yScale)
        .tickValues(['100', '300', '500', '700', '900', '1100', '1300', '1500', '1700'])
        .tickSizeOuter(0)
      )

    this.svg.selectAll('.xAxis').transition().call(xAxis)
    this.svg.selectAll('.xGrid').transition().call(xGrid)

    this.svg.selectAll('.yAxis').call(yAxis)

    const layer = this.g.selectAll('g')
      .data(data)
      .join('g')
      .attr('fill', (d, i) => this.config.color[i])
      .attr('class', (d, i) => this.config.value[i])

    const rects = layer.selectAll('rect')
      .data(d => d)

    rects.enter()
      .append('rect')
      .attr('x', d => xScale(d[0]))
      .attr('y', (d, i) => yScale(d.data.class_name))
      .attr('width', d => xScale(d[1]) - xScale(d[0]))
      .attr('height', yScale.step())

    rects.transition()
      .duration(500)
      .attr('x', d => xScale(d[0]))
      .attr('y', (d, i) => yScale(d.data.class_name))
      .attr('width', d => xScale(d[1]) - xScale(d[0]))
      .attr('height', yScale.step())

    rects.exit()
      .transition()
      .duration(500)
      .remove()
  }
}
