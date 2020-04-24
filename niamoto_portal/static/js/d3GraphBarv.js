'use strict'

import * as d3 from 'd3'
import d3Legend from 'd3-svg-legend'
/**
 * Represents a graph one bar.
 * @constructor
 * @param {object} configuration - configuration default constains member config.
 */

// todo diviser en 2 graphs
export class GraphBarv {
  constructor(configuration) {
    /**
     * default configuration settings
     * @type {object}
     * @property {number} height - height svg.
     * @property {number} with - with svg.
     * @property {number} margin - margin svg.
     * @property {number} minValue - minimum value y
     * @property {number} maxValue - maximum value y
     * @property {number} majorTicks - number of ticks
     * @property {arrayr} color  - color for rectangle
     * @property {number} transitionMs - time of transition ms
     * @property {string} container - container name
     * @property {string} title - title svg
     * @property {string} xLabel - label axis x
     * @property {string} yLabel - label axis y
     * @property {array} value - values flux
     * @property {array} legend - legend text
     * @property {array} yDomain - mininimum and maximum value y
     * @property {number} marginLeft - margin left svg default
     * @property {array} colorText - corlor text  inside rectangle

     */

    this.config = {
      height: 200,
      width: 200,
      margin: 10,
      minValue: 0,
      maxValue: '',
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
      yDomain: [0, 100],
      marginLeft: 0.15,
      colorText: ['#000']
    }

    this.config = Object.assign(this.config, configuration)

    /**
     * default margin settings
     * @type {object}
     * @property {number} top
     * @property {number} right
     * @property {number} bottom
     * @property {number} left
     */
    this.margin = {
      top: this.config.height * 0.08,
      right: this.config.width * 0.03,
      bottom: this.config.height * 0.2,
      left: this.config.width * this.config.marginLeft
    }
    /**
     * height without margins
     * @type {number}
     */
    this.mheight = this.config.height - this.margin.top - this.margin.bottom
    /**
     * width without margins
     * @type {number}
     */
    this.mwidth = this.config.width - this.margin.left - this.margin.right

    /**
     * general svg
     */
    this.svg = d3.select(this.config.container).append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
    /**
     * show axis x
     */
    this.xAxis = this.svg.append('g')
      .attr('class', 'xAxis')
      .attr('transform', 'translate(' + this.margin.left + ',' + (this.mheight + this.margin.top) + ')')
    /**
     * show grid y
     */
    this.yGrid = this.svg.append('g')
      .attr('class', 'yGrid')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    /**
     * show axis y
     */
    this.yAxis = this.svg.append('g')
      .attr('class', 'yAxis')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    /**
     *
     */
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    this.svgLabel = this.svg.append('g')
      .attr('class', 'label')

    /**
     * Config Label y
     */
    this.svgLabel.append('text')
      .attr('class', 'yLabel')
      .attr('transform', 'rotate(-90)')
      .attr('y', 5)
      .attr('x', 0 - this.config.height * 0.5)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text(this.config.yLabel)

    /**
     * Config Label x
     */
    this.svgLabel.append('text')
      .attr('class', 'xLabel')
      .attr('y', this.config.height * 0.92)
      .attr('x', this.config.width * 0.55)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text(this.config.xLabel)

    /**
     *  Svg Legend
     */
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
      .shapePadding(5)
      .scale(colorScale)
      .shapeWidth(10)
      .shapeHeight(10)

    /** Show Legend */
    svgLegend.select('.legend')
      .call(legendColor)
  }

  /**
   * update graph with new value
   * @param {objet} response - json flux
   */
  update(response) {
    var stack = d3.stack()
      .keys(['data1', 'data2'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)
    var data = stack(response)

    // if (this.config.xDomain === '') {
    //   this.config.xDomain = response.map(d => d.class_name)
    // }
    // // if (this.config.maxValue === '') {
    // this.config.maxValue = d3.max(data, d => d3.max(d, d => d[1]))
    // // }

    var xScale = d3.scaleBand()
      .domain(response.map(d => d.class_name))
      .range([0, this.mwidth])
      .paddingInner(0.1)
      .paddingOuter(0.1)
      .round(true)

    var yScale = d3.scaleLinear()
      .domain(this.config.yDomain)
      .range([this.mheight, 0])

    var yGrid = g => g
      .call(d3.axisLeft(yScale)
        .tickSizeInner(-this.mwidth)
        .tickPadding(10)
      )
      .call(g => g.selectAll('.domain').remove())
      .call(g => g.selectAll('.tick text').remove())

    var xAxis = g => g
      .call(d3.axisBottom(xScale)
        .tickValues(response.map(d => d.class_name))
        .tickSizeOuter(0)
      )
    var yAxis = g => g
      .call(d3.axisLeft(yScale)
        .tickFormat(d => d + '%')
        .tickPadding(10)
        .ticks(10)
      )

    this.svg.selectAll('.yAxis').transition().call(yAxis)
    this.svg.selectAll('.yGrid').transition().call(yGrid)

    const axisGroup = this.svg.selectAll('.xAxis').call(xAxis)
    // const bandwidth = tickWidth(this.svg.selectAll('.xAxis'))

    // axisGroup
    //   .selectAll('text')
    //   .attr('transform', 'translate(0, ' + bandwidth / 2 + ')')

    // function tickWidth(selection) {
    //   const ticks = selection.selectAll('.tick text').nodes().map(function (d) {
    //     return d.textContent
    //   })
    //   return xScale(ticks[1]) - xScale(ticks[0])
    // }

    const layer = this.g.selectAll('g')
      .data(data)
      .join('g')
      .attr('fill', (d, i) => this.config.color[i])
      .attr('class', (d, i) => this.config.value[i])

    const rects = layer.selectAll('rect')
      .data(d => d)

    rects.enter()
      .append('rect')
      .attr('x', d => xScale(d.data.class_name))
      .attr('y', d => yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(d[0]) - yScale(d[1]))

    rects.transition()
      .duration(500)
      .attr('x', d => xScale(d.data.class_name))
      .attr('y', d => yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(d[0]) - yScale(d[1]))

    rects.exit()
      .transition()
      .duration(500)
      .remove()
  }
}