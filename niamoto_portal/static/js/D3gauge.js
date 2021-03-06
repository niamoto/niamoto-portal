'use strict'

import * as d3 from 'd3'

/**
 * Represents a graph gauge.
 * @constructor
 * @param {object} configuration - configuration default constains member config.
 */
export class Gauge {


  /**
   * default configuration settings
   * @type {object}
   * @property {number} height - height svg.
   * @property {number} with - with svg.
   * @property {number} margin - margin svg.
   * @property {number} minValue - minimum value y
   * @property {number} maxValue - maximum value y
   * @property {number} majorTicks - number of ticks
   * @property {array} color  - color for rectangle
   * @property {number} transitionMs - time of transition ms
   * @property {string} container - container name
   * @property {float} lowThreshhold - ratio separate
   * @property {float} lowMidThreshhold - ratio separate
   * @property {float} highMidThreshhold - ratio separate
   * @property {float} highThreshhold - ratio separate
   * @property {color} lowThreshholdColor - color separate
   * @property {color} lowMidThreshholdColor - color separate
   * @property {color} highMidThreshholdColor - color separate
   * @property {color} highThreshholdColor - color separate
   * @property {number} labelDecimal - number of decimal places displayed
   * @property {boolean} ticks - show ticks true/false
   */

  config = {
    height: 200,
    width: 200,
    margin: 10,
    minValue: 0,
    maxValue: 10,
    majorTicks: 5,
    lowThreshhold: 0.2,
    lowMidThreshhold: 0.4,
    highMidThreshhold: 0.6,
    highThreshhold: 0.8,
    lowThreshholdColor: '#f02828',
    lowMidThreshholdColor: '#fe6a00',
    defaultColor: '#e8dd11',
    highMidThreshholdColor: '#82e042',
    highThreshholdColor: '#089f50',
    container: '',
    transitionMs: 500,
    labelDecimal: 0,
    ticks: false
  }


  constructor(configuration) {
    // default configuration settings

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
      top: this.config.height * 0.1,
      right: this.config.width * 0.05,
      bottom: this.config.height * -0.05,
      left: this.config.width * 0.05
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
    this.mwidth = this.config.height * 2 - this.margin.left - this.margin.right

    // define arc shape and position
    this.arcPadding = this.mwidth * 0.075
    this.arcWidth = this.mwidth * 0.1
    this.labelInset = this.mwidth * 0.05

    // defined pointer shape and size
    // const pointerHigh       = this.mwidth *.0045;
    const pointerWidth = this.mwidth * 0.025
    const pointerTailLength = this.mwidth * 0.025
    const pointerHeadLength = this.mwidth * 0.4
    this.lineData = [
      [pointerWidth, 0],
      [0, -pointerHeadLength],
      [-(pointerWidth), 0],
      [0, pointerTailLength],
      [pointerWidth, 0]

    ]
    /**
     * start angle
     * @type {number}
     */
    this.minAngle = -90
    /**
     * end angle
     * @type {number}
     */
    this.maxAngle = 90
    /**
     * Angle Range
     * @type {number}
     */
    this.angleRange = this.maxAngle - this.minAngle

    this.scale = d3.scaleLinear()
      .range([0, 1])
      .domain([this.config.minValue, this.config.maxValue])

    var colorDomain = [
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.lowThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.lowMidThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.highMidThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.highThreshhold
    ].map(this.scale)
    const colorRange = [
      this.config.lowThreshholdColor,
      this.config.lowMidThreshholdColor,
      this.config.defaultColor,
      this.config.highMidThreshholdColor,
      this.config.highThreshholdColor
    ]
    /**
     * color scale
     * @type {array}
     */
    this.colorScale = d3.scaleThreshold().domain(colorDomain).range(colorRange)
    /**
     * array of ticks
     * @type {array}
     */
    this.ticks = [
      this.config.minValue,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.lowThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.lowMidThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.highMidThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.highThreshhold,
      this.config.maxValue
    ]
    /**
     * color scale
     * @type {array}
     */
    this.threshholds = [
        this.config.minValue,
        this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.lowThreshhold,
        this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.lowMidThreshhold,
        this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.highMidThreshhold,
        this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.highThreshhold,
        this.config.maxValue
      ]
      .map(d => this.scale(d))
/**
     * define arc d3
     * @type {object}
     */
    this.arc = d3.arc()
      .innerRadius(this._radius() - this.arcWidth - this.arcPadding)
      .outerRadius(this._radius() - this.arcPadding)
      .startAngle((d, i) => {
        const ratio = i > 0 ? this.threshholds[i - 1] : this.threshholds[0]
        return this._deg2rad(this.minAngle + (ratio * this.angleRange))
      })
      .endAngle((d, i) => this._deg2rad(this.minAngle + this.threshholds[i] * this.angleRange))
  }
/**
 * @func
 * @returns {number} - height radius/2
 * @memberof Gauge
 */
  _radius() {
    return (this.mwidth) * 0.5
  }
/**
 * calculate a number deg to radians
 * @func
 * @param {number} deg 
 * @returns {number} - number in radians
 * @memberof Gauge
 */
  _deg2rad(deg) {
    return deg * Math.PI / 180
  }
/**
 * show gauge
 * @method
 * @param {number} newValue 
 */
  render(newValue) {
    const svg = d3.select(this.config.container)
      .append('svg')
      .attr('class', 'gauge')
      .attr('width', this.mwidth)
      .attr('height', this.mheight)

    // display panel arcs with color scale
    const arcs = svg.append('g')
      .attr('class', 'arc')
      .attr('transform', `translate(${this._radius()}, ${this._radius()})`)

    // draw the color arcs
    arcs.selectAll('path')
      .data(this.threshholds)
      .enter()
      .append('path')
      .attr('fill', d => this.colorScale(d - 0.001))
      .attr('d', this.arc)

    // display panel - labels
    svg.append('g')
      .attr('class', 'label')
      .attr('transform', `translate(${this._radius()},${this._radius()})`)
    this._displayLabel()

    // display pointer
    const pg = svg.append('g')
      .data([this.lineData])
      .attr('class', 'pointer')
      .attr('transform', `translate(${this._radius()},${this._radius()})`)

    // display point center
    const arc = d3.arc()
      .innerRadius(this.mwidth * 0.03)
      .outerRadius(0)
      .startAngle(0)
      .endAngle(2 * Math.PI)

    const pointer = pg.append('path')
      .attr('d', d3.line())
      .attr('transform', `rotate(${this.minAngle})`)

    const arc_pointer = pg.append('path')
      .attr('class', 'arc_pointer')
      .attr('d', arc)
      .attr('transform', `rotate(${this.minAngle})`)

    // display current value
    const numberDiv = d3.select(this.config.container).append('div')
      .attr('class', 'number-div')
      .style('width', `${this.mwidth}px`)

    const numberUnit = numberDiv.append('span')
      .attr('class', 'number-unit')
      .html(d => this.config.displayUnit)

    const numberValue = numberDiv.append('span')
      .data([newValue])
      .attr('class', 'number-value')
      .text(d => d === undefined ? 0 : d)

    this.pointer = pointer
    this.numberValue = numberValue
  }
/**
 * display label
 * @method
 */
  _displayLabel() {
    $(this.config.container + ' .gauge .label').empty()

    const lg = d3.select(this.config.container + ' .label')

    // display panel - text
    lg.selectAll('text')
      .data(this.ticks)
      .enter()
      .append('text')
      .attr('transform', d => {
        var newAngle = this.minAngle + (this.scale(d) * this.angleRange)
        return `rotate(${newAngle}) translate(0, ${this.labelInset - this._radius()})`
      })
      .text(d3.format('1.' + this.config.labelDecimal + 'f'))

    // display panel - ticks
    if (this.config.ticks === true) {
      lg.selectAll('line')
        .data(this.ticks)
        .enter()
        .append('line')
        .attr('class', 'tickline')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', this.arcWidth + this.labelInset)
        .attr('stroke-width', this.mwidth * 0.015)
        .attr('transform', d => {
          const newAngle = this.minAngle + (this.scale(d) * this.angleRange)
          return `rotate(${newAngle}), translate(0, ${this.arcWidth - this.labelInset - this._radius()})`
        })
    }
  }
/**
 * update display
 * @param {number} newValue 
 */
  update(newValue) {
    /**
     * TODO fun transition
     */

    var value = newValue
    if (!newValue) value = 0

    // update ticks
    this.ticks = [
      this.config.minValue,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.lowThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.lowMidThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.highMidThreshhold,
      this.config.minValue + (this.config.maxValue - this.config.minValue) * this.config.highThreshhold,
      this.config.maxValue
    ]

    // update scale
    this.scale = d3.scaleLinear()
      .range([0, 1])
      .domain([this.config.minValue, this.config.maxValue])

    this._displayLabel()

    const newAngle = this.minAngle + (this.scale(value) * this.angleRange)

    this.pointer.transition()
      .duration(this.config.transitionMs)
      .attr('transform', `rotate(${newAngle})`)

    if (value === 0) {
      this.numberValue
        .transition()
        .duration(this.config.transitionMs)
        .style('color', 'black')
        .text('ND')
    } else {
      if (this.numberValue.text() === 'ND') this.numberValue.text(0)
      this.numberValue
        .data([value])
        .transition()
        .duration(this.config.transitionMs)
        .style('color', this.colorScale(this.scale(value)))
        // .text(newValue.toFixed(3))
        .tween('', function (d) {
          const interpolator = d3.interpolate(this.textContent, d)
          const that = this
          return function (t) {
            that.textContent = interpolator(t).toFixed(1)
          }
        })
    }
  }
}