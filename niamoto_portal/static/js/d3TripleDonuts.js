'use strict'

import * as d3 from 'd3'
import d3Legend from 'd3-svg-legend'

export class GraphDonut {
  constructor(configuration) {
    // default configuration settings
    this.config = {
      height: 200,
      width: 200,
      margin: 10,
      minValue: 0,
      maxValue: '',
      majorTicks: 5,
      color: [
        '#5496c4', '#ffd24d', '#a29cc9', '#f96353', '#6cc6b7',
        '#fcac4f', '#a0d643', '#f99fcd', '#b068b1', '#b3b3b3'
      ],
      transitionMs: 1000,
      displayUnit: 'Value',
      container: '',
      title: '',
      xLabel: '',
      yLabel: '',
      value: '',
      legend: '',
      yDomain: '',
      marginLeft: 0,
      colorText: ['#000']
    }

    this.config = Object.assign(this.config, configuration)

    this.margin = {
      top: this.config.height * 0.05,
      right: this.config.width * 0,
      bottom: this.config.height * 0.05,
      left: this.config.width * this.config.marginLeft
    }

    this.mheight = this.config.height - this.margin.top - this.margin.bottom
    this.mwidth = this.config.width - this.margin.left - this.margin.right
    this.radius = Math.min(this.mwidth, this.mheight) / 2

    this.svg = d3.select(this.config.container).append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

    this.g = this.svg.append('g')
    //   .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    this.g.append('g')
      .attr('class', 'slices')
    this.g.append('g')
      .attr('class', 'labels')
    this.g.append('g')
      .attr('class', 'lines')
    this.g.attr('transform', 'translate(' + this.mwidth / 2 + ',' + (this.mheight / 2 + this.margin.top) + ')')

    // Legend

    const svgLegend = d3.select(this.config.container + 'Legend').append('svg')
      .attr('width', this.mwidth)
      .attr('height', this.mheight * 0.3)

    svgLegend.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + this.mwidth * 0.1 + ', ' + 0 + ')')
    // .attr('dy', '.5em')
    // .attr('dx', '.5em')

    var colorScale = d3.scaleOrdinal()
      .domain(this.config.legend)
      .range(this.config.color)

    var legendColor = d3Legend.legendColor()
      // .shapePadding(50)
      .scale(colorScale)
      .shapeWidth(70)
      .shapeHeight(7)
      .orient('horizontal')
      .labelAlign('start')
      .labelWrap(30)

    svgLegend.select('.legend')
      .call(legendColor)
  }

  createPie(parameters) {
    var pie = d3.pie()
      .sort(null)
      .value(function (d) {
        return d.value
      })
      .startAngle(-Math.PI / 2)
      .endAngle(3 * Math.PI / 2)
    var value = this.config.value
    const radiusMedium = (parameters.radiusOut + parameters.radiusIn) / 2

    var arc = d3.arc()
      .outerRadius(this.radius * parameters.radiusOut)
      .innerRadius(this.radius * parameters.radiusIn)

    var outerArc = d3.arc()
      .innerRadius(this.radius * radiusMedium)
      .outerRadius(this.radius * radiusMedium)

    var outerArc2 = d3.arc()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9)

    var slice = this.svg.select('.slices')
      .selectAll('path.slice.' + parameters.name)
      .data(pie(parameters.response))

    slice.enter()
      .insert('path')
      .style('fill', (d, i) => parameters.color[i])
      .style('opacity', '1.0')
      .attr('class', 'slice ' + parameters.name)
      .transition()
      .duration(1000)

      .attrTween('d', function (d) {
        this._current = {
          endAngle: Math.PI,
          index: 0,
          padAngle: 0,
          startAngle: Math.PI,
          value: null
        }
        var interpolate = d3.interpolate(this._current, d)
        this._current = interpolate(0)
        return function (t) {
          return arc(interpolate(t))
        }
      })

    slice.transition()
      .duration(1000)
      .attrTween('d', function (d) {
        this._current = this._current || d
        var interpolate = d3.interpolate(this._current, d)
        this._current = interpolate(0)
        return function (t) {
          return arc(interpolate(t))
        }
      })

    slice.exit()
      .transition()
      .duration(1000)
      .attrTween('d', function (d) {
        this._current = this._current || d
        var dest = {
          endAngle: this._current.endAngle,
          index: 0,
          padAngle: 0,
          startAngle: this._current.endAngle,
          value: null
        }
        var interpolate = d3.interpolate(this._current, dest)
        this._current = interpolate(0)
        return function (t) {
          return arc(interpolate(t))
        }
      })
      .remove()

    var texts = this.g.selectAll('text.' + parameters.name)
      .data(pie(parameters.response))
    var labels = this.g.selectAll('text.label' + parameters.name)
      .data(pie(parameters.response))

    texts.enter().append('text')
      .text(function (d) {
        return d.data.key
      })
      .attr('class', parameters.name)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '.6em')
      .attr('fill', '#fff')
      .text(function (d, i) {
        if (d.value !== 0 && i !== 1) {
          return d3.format('.0%')(d.value / 100)
        }
      })
      .attr('transform', function (d) {
        var pos = outerArc.centroid({
          endAngle: -1.45,
          startAngle: d.startAngle
        })
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', 'middle')

    texts.transition().duration(500)
      .text(function (d, i) {
        if (d.value !== 0 && i !== 1) {
          return d3.format('.0%')(d.value / 100)
        }
      })
      .attr('transform', function (d) {
        var pos = outerArc.centroid({
          endAngle: -1.45,
          startAngle: d.startAngle
        })
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', 'middle')

    labels.enter().append('text')
      .text(function (d) {
        return d.data.key
      })
      .attr('class', parameters.name)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '.8em')
      .attr('fill', '#222')
      .text(function (d, i) {
        if (d.value !== 0 && i !== 1) {
          return value[parameters.id]
        }
      })
      .attr('transform', function (d) {
        var pos = outerArc.centroid({
          endAngle: 3.14,
          startAngle: 3.14
        })
        pos[0] = radiusMedium * 0.9
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', 'middle')

    labels.transition().duration(500)
      .text(function (d, i) {
        if (d.value !== 0 && i !== 1) {
          return value[parameters.id]
        }
      })
      .attr('transform', function (d) {
        var pos = outerArc.centroid({
          endAngle: 3.14,
          startAngle: 3.14
        })
        pos[0] = radiusMedium * 0.9
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', 'middle')

    texts.exit()
      .transition()
      .duration(500)
      .remove()

    labels.exit()
      .transition()
      .duration(500)
      .remove()
  }

  update(response) {
    this.createPie({
      id: 1,
      name: 'data1',
      response: response.data1,
      color: response.color1,
      radiusIn: 0.76,
      radiusOut: 1
    })
    this.createPie({
      id: 2,
      name: 'data2',
      response: response.data2,
      color: response.color2,
      radiusIn: 0.51,
      radiusOut: 0.75
    })
    this.createPie({
      id: 3,
      name: 'data3',
      response: response.data3,
      color: response.color3,
      radiusIn: 0.24,
      radiusOut: 0.5
    })
  }
};