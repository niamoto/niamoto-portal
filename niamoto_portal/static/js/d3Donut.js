'use strict'

import * as d3 from 'd3'
import * as d3Legend from 'd3-svg-legend'

/**
 * Represents a donut graph simple
 * @constructor
 * @param {object} configuration - configuration default constains member config.
 */


export class GraphDonut {

      /**
     * default configuration settings
     * @type {object}
     * @property {number} height - height svg.
     * @property {number} with - with svg.
     * @property {number} margin - margin svg.
     * @property {array} color  - color for rectangle
     * @property {number} transitionMs - time of transition ms
     * @property {string} container - container name
     * @property {string} title - title svg
     * @property {array} value - values flux
     * @property {array} legend - legend text
     * @property {number} marginLeft - margin left svg default
     * @property {array} colorText - corlor text  inside rectangle
     * @property {number} typeLegend - 1 horizontale -2 vertical
     * @property {number} toolTipShowLegend - Show toolTip T/F
     */
  config = {
    height: 200,
    width: 200,
    margin: 10,
    color: [
      '#5496c4', '#ffd24d', '#a29cc9', '#f96353', '#6cc6b7',
      '#fcac4f', '#a0d643', '#f99fcd', '#b068b1', '#b3b3b3'
    ],
    transitionMs: 1000,
    displayUnit: 'Value',
    container: '',
    title: '',
    value: '',
    legend: '',
    marginLeft: 0,
    colorText: ['#000'],
    typeLegend: 2,
    toolTipShowLegend:0
  }

  constructor(configuration) {


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
      top: this.config.height * 0.05,
      right: this.config.width * 0,
      bottom: this.config.height * 0.05,
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
     * height radius min mheight/mwidth
     * @type {float}
     */
    this.radius = Math.min(this.mwidth, this.mheight) / 2

    /**
     * main svg
     * @type {array}
     */
    this.svg = d3.select(this.config.container).append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

    /**
     * container element
     * @type {array}
     */
    this.g = this.svg.append('g')
    this.g.append('g')
      .attr('class', 'slices')
    this.g.append('g')
      .attr('class', 'labels')
    this.g.append('g')
      .attr('class', 'lines')
    this.g.attr('transform', 'translate(' + this.mwidth / 2 + ',' + (this.mheight / 2 + this.margin.top) + ')')

      /**
     * legend svg
     * @type {array}
     */
    this.svgLegend = d3.select(this.config.container + 'Legend').append('svg')
      .attr('width', this.mwidth)
      .attr('height', this.mheight * 0.3)

    if (this.config.typeLengend === 1) {
      this.svgLegend.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + this.mwidth * 0.1 + ', ' + 0 + ')')
    } else {
      this.svgLegend.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + this.mwidth * 0.1 + ', ' + 0 + ')')
        .attr('dy', '.5em')
        .attr('dx', '.5em')
    }

    this.legend()

    /**
     * div tooltip
     * @type {array}
     */
    this.tooltip = d3.select(this.config.container).append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);


  }

  /**
  * update legend
  * @method
   */
  legend(){

  // Legend

  var colorScale = d3.scaleOrdinal()
    .domain(this.config.legend)
    .range(this.config.color)

  var legendColor = d3Legend.legendColor()
  if (this.config.typeLegend === 1) {
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

  this.svgLegend.select('.legend')
    .call(legendColor)
  }

    /**
   * update graph with new value
   * @method
   * @param {objet} response - json flux
   */
  update(response) {

    var pie = d3.pie()
      .sort(null)
      .value(function (d) {
        return d.value
      })
      .startAngle(-Math.PI / 2)
      .endAngle(3 * Math.PI / 2)

    var radius = this.radius

    var arc = d3.arc()
      .outerRadius(this.radius * 1)
      .innerRadius(this.radius * 0.5)

    var outerArc = d3.arc()
      .innerRadius(this.radius * 0.75)
      .outerRadius(this.radius * 0.75)

    var outerArc2 = d3.arc()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9)

    var slice = this.svg.select('.slices')
      .selectAll('path.slice')
      .data(pie(response))

    slice.enter()
      .insert('path')
      .style('fill', (d, i) => this.config.color[i])
      .style('opacity', '1.0')
      .attr('class', 'slice')
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

    var texts = this.g.selectAll('text')
      .data(pie(response))

    texts.enter().append('text')
      .text(function (d) {
        return d.data.key
      })
      .attr('class', 'label')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '20px')
      .attr('fill', '#222')
      .text(function (d) {
        if (d.value !== 0) {
          return d3.format('.1%')(d.value / 100)
        }
      })
      .attr('transform', function (d) {
        var pos = outerArc.centroid(d)
        if (d.value < 6) {
          pos = outerArc2.centroid(d)
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1)
        }
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', function (d) {
        if (d.value < 6) {
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          return (midangle < Math.PI ? 'start' : 'end')
        } else {
          return 'middle'
        }
      })

    texts.transition().duration(500)
      .text(function (d) {
        if (d.value !== 0) {
          return d3.format('.1%')(d.value / 100)
        }
      })
      .attr('transform', function (d) {
        var pos = outerArc.centroid(d)
        if (d.value < 6) {
          pos = outerArc2.centroid(d)
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1)
        }
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', function (d) {
        if (d.value < 6) {
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          return (midangle < Math.PI ? 'start' : 'end')
        } else {
          return 'middle'
        }
      })

    texts.exit()
      .transition()
      .duration(500)
      .remove()

    var polylines = this.g.selectAll('polyline')
      .data(pie(response))

    polylines.enter().append('polyline')
      .attr('stroke', '#222')
      .style('fill', 'none')
      .attr('stroke-width', 1)
      .attr('points', function (d) {
        if (d.value < 6 && d.value > 0) {
          var posA = arc.centroid(d) // line insertion in the slice
          var posB = outerArc2.centroid(d) // line break: we use the other arc generator that has been built only for that
          var posC = outerArc2.centroid(d) // Label position = almost the same as posB
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
          posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1) // multiply by 1 or -1 to put it on the right or on the left
          return [posA, posB, posC]
        }
      })

    polylines.transition().duration(500)
      .attr('points', function (d) {
        if (d.value < 6 && d.value > 0) {
          var posA = arc.centroid(d) // line insertion in the slice
          var posB = outerArc2.centroid(d) // line break: we use the other arc generator that has been built only for that
          var posC = outerArc2.centroid(d) // Label position = almost the same as posB
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
          posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1) // multiply by 1 or -1 to put it on the right or on the left
          return [posA, posB, posC]
        }
      })

    polylines.exit()
      .transition()
      .duration(500)
      .remove()

 
    }
};