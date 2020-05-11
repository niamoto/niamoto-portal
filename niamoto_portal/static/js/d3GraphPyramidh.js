'use strict'

import * as d3 from 'd3'
import d3Legend from 'd3-svg-legend'

// todo diviser en 2 graphs
export class GraphPyramidh {
  constructor(configuration) {
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
      legend: '',
      yDomain: '',
      marginLeft: 0.15,
      colorText: ['#000'],
      typeLegend: 2
    }

    this.config = Object.assign(config, configuration)

    this.margin = {
      top: this.config.height * 0.003,
      right: this.config.width * 0.04,
      bottom: this.config.height * 0.2,
      left: this.config.width * this.config.marginLeft
    }

    this.mheight = this.config.height - this.margin.top - this.margin.bottom

    this.mwidth = this.config.width - this.margin.left - this.margin.right
    this.mwidthMiddle = this.mwidth / 2

    this.svg = d3.select(this.config.container).append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

    this.xAxisLeft = this.svg.append('g')
      .attr('class', 'xAxisLeft')
      .attr('transform', 'translate(' + this.margin.left + ',' + (this.mheight + this.margin.top) + ')')
    this.xGridLeft = this.svg.append('g')
      .attr('class', 'xGridLeft')
      .attr('transform', 'translate(' + this.margin.left + ',' + (this.mheight + this.margin.top) + ')')

    // this.yAxisLeft = this.svg.append('g')
    // .attr('class', 'yAxisLeft')
    // .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    this.xAxisRight = this.svg.append('g')
      .attr('class', 'xAxisRight')
      .attr('transform', 'translate(' + (this.mwidthMiddle + this.margin.left) + ',' + (this.mheight + this.margin.top) + ')')
    this.xGridRight = this.svg.append('g')
      .attr('class', 'xGridRight')
      .attr('transform', 'translate(' + (this.mwidthMiddle + this.margin.left) + ',' + (this.mheight + this.margin.top) + ')')
    this.yGrid = this.svg.append('g')
      .attr('class', 'yGrid')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    this.yAxisRight = this.svg.append('g')
      .attr('class', 'yAxisRight')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    this.dataRight = this.svg.append('g')
      .attr('transform', 'translate(' + (this.mwidthMiddle + this.margin.left) + ',' + this.margin.top + ')')
      .attr('class', 'dataRight')
    this.dataLeft = this.svg.append('g')
      .attr('transform', 'translate(' + (this.mwidthMiddle + this.margin.left) + ',' + this.margin.top + ')scale(-1,1)')
      .attr('class', 'dataLeft')
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

    var legendColor = d3Legend.legendColor()
    if (this.config.typeLengend === 1) {
      legendColor.scale(colorScale)
        .shapeWidth(70)
        .shapeHeight(7)
        .orient('horizontal')
        .labelAlign('start')
        .labelWrap(30)
    } else {
      legendColor.shapePadding(0)
        .scale(colorScale)
        .shapeWidth(10)
        .shapeHeight(10)
    }

    svgLegend.select('.legend')
      .call(legendColor)
  }

  render(newValue) {

  }

  update(response) {
    var data = response

    if (this.config.yDomain === '') {
      this.config.yDomain = response.map(d => d.class_name)
    }

    var yScale = d3.scalePoint()
      .domain(response.map(d => d.class_name))
      .range([0, this.mheight])
      .padding(1)

    var xScaleRight = d3.scaleLinear()
      .domain([0, this.config.maxValue])
      .range([0, this.mwidthMiddle])

    var xScaleLeft = d3.scaleLinear()
      .domain([0, this.config.maxValue])
      .range([this.mwidthMiddle, 0])

    var xGridRight = g => g
      .call(d3.axisBottom(xScaleRight)
        .tickSizeInner(-this.mheight)
        .ticks(6))
      .call(g => g.selectAll('.domain').remove())
      .call(g => g.selectAll('.tick text').remove())

    var xGridLeft = g => g
      .call(d3.axisBottom(xScaleLeft)
        .tickSizeInner(-this.mheight)
        .ticks(6))
      .call(g => g.selectAll('.domain').remove())
      .call(g => g.selectAll('.tick text').remove())

    var yGrid = g => g
      .call(d3.axisLeft(yScale)
        .tickValues(this.config.yDomain)
        .tickSizeInner(-this.mwidth)
      )
      .call(g => g.selectAll('.domain').remove())
      .call(g => g.selectAll('.tick text').remove())

    var xAxisRight = g => g
      .call(d3.axisBottom(xScaleRight)
        .ticks(6, '0f')
        .tickSizeOuter(0)
      )

    var xAxisLeft = g => g
      .call(d3.axisBottom(xScaleLeft)
        .ticks(6, '0f')
        .tickSizeOuter(0)
      )
    var yAxisRight = g => g
      .call(d3.axisLeft(yScale)
        .tickValues(this.config.yDomain)
        .tickSizeOuter(0)
      )

    // var yAxisLeft = g => g
    //   .call(d3.axisRight(yScale)
    //     .tickValues(this.config.yDomain)
    //     .tickSizeOuter(0)
    //   )
    this.svg.selectAll('.xAxisRight').transition().call(xAxisRight)
    this.svg.selectAll('.xGridRight').transition().call(xGridRight)
    this.svg.selectAll('.xAxisLeft').transition().call(xAxisLeft)
    this.svg.selectAll('.xGridLeft').transition().call(xGridLeft)
    this.svg.selectAll('.yGrid').transition().call(yGrid)

    const axisGroupRight = this.svg.selectAll('.yAxisRight').call(yAxisRight)
    const bandwidthRight = tickWidth(this.svg.selectAll('.yAxisRight'))
    // const axisGroupLeft = this.svg.selectAll('.yAxisLeft').call(yAxisLeft)
    // const bandwidthLeft = tickWidth(this.svg.selectAll('.yAxisLeft'))

    axisGroupRight
      .selectAll('text')
      .attr('transform', 'translate(0, ' + bandwidthRight / 2 + ')')

    // axisGroupLeft
    // .selectAll('text')
    // .attr('transform', 'translate(0, ' + bandwidthLeft / 2 + ')')

    function tickWidth(selection) {
      const ticks = selection.selectAll('.tick text').nodes().map(function (d) {
        return d.textContent
      })
      return yScale(ticks[1]) - yScale(ticks[0])
    }

    const layerRight = this.dataRight
      // .attr('transform', 'translate(' + (this.mwidthMiddle + this.margin.left) + ',' + this.margin.top + ')')
      .attr('fill', this.config.color[1])
      .attr('class', this.config.value[1])

    const rectsRight = layerRight.selectAll('rect')
      .data(data)

    rectsRight.enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.class_name))
      .attr('width', d => xScaleRight(d.data2))
      .attr('height', yScale.step())

    rectsRight.transition()
      .duration(500)
      .attr('x', 0)
      .attr('y', d => yScale(d.class_name))
      .attr('width', d => xScaleRight(d.data2))
      .attr('height', yScale.step())

    rectsRight.exit()
      .transition()
      .duration(500)
      .remove()

    const layerLeft = this.dataLeft
      // .attr('transform', 'translate(' + (this.mwidthMiddle + this.margin.left) + ',' + this.margin.top + ')scale(-1,1)')
      .attr('fill', this.config.color[0])
      .attr('class', this.config.value[0])

    const rectsLeft = layerLeft.selectAll('rect')
      .data(data)

    rectsLeft.enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.class_name))
      .attr('width', d => xScaleLeft(100 - d.data1))
      .attr('height', yScale.step())

    rectsLeft.transition()
      .duration(500)
      .attr('x', 0)
      .attr('y', d => yScale(d.class_name))
      .attr('width', d => xScaleLeft(100 - d.data1))
      .attr('height', yScale.step())

    rectsLeft.exit()
      .transition()
      .duration(500)
      .remove()
  }
}