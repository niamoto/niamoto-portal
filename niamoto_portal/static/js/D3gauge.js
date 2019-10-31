'use strict'

import 'd3'

export class Gauge {
  constructor (configuration) {
    // default configuration settings
    var config = {
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
      transitionMs: 500
    }

    this.config = Object.assign(config, configuration)

    this.margin = {
      top: this.config.height * 0.1,
      right: this.config.width * 0.05,
      bottom: this.config.height * -0.05,
      left: this.config.width * 0.05
    }

    this.mheight = this.config.height - this.margin.top - this.margin.bottom
    this.mwidth = this.config.width - this.margin.left - this.margin.right

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

    this.minAngle = -90,
    this.maxAngle = 90,
    this.angleRange = this.maxAngle - this.minAngle

    this.scale = d3.scaleLinear()
      .range([0, 1])
      .domain([config.minValue, config.maxValue])

    var colorDomain = [
      (config.maxValue - config.minValue) * config.lowThreshhold,
      (config.maxValue - config.minValue) * config.lowMidThreshhold,
      (config.maxValue - config.minValue) * config.highMidThreshhold,
      (config.maxValue - config.minValue) * config.highThreshhold
    ].map(this.scale)
    const colorRange = [
      config.lowThreshholdColor,
      config.lowMidThreshholdColor,
      config.defaultColor,
      config.highMidThreshholdColor,
      config.highThreshholdColor
    ]

    this.colorScale = d3.scaleThreshold().domain(colorDomain).range(colorRange)

    this.ticks = [
      config.minValue,
      (config.maxValue - config.minValue) * config.lowThreshhold,
      (config.maxValue - config.minValue) * config.lowMidThreshhold,
      (config.maxValue - config.minValue) * config.highMidThreshhold,
      (config.maxValue - config.minValue) * config.highThreshhold,
      config.maxValue
    ]

    this.threshholds = [
      config.minValue,
      (config.maxValue - config.minValue) * config.lowThreshhold,
      (config.maxValue - config.minValue) * config.lowMidThreshhold,
      (config.maxValue - config.minValue) * config.highMidThreshhold,
      (config.maxValue - config.minValue) * config.highThreshhold,
      config.maxValue
    ]
      .map(d => this.scale(d))

    this.scale = d3.scaleLinear()
      .range([0, 1])
      .domain([config.minValue, config.maxValue])

    this.arc = d3.arc()
      .innerRadius(this._radius() - this.arcWidth - this.arcPadding)
      .outerRadius(this._radius() - this.arcPadding)
      .startAngle((d, i) => {
        const ratio = i > 0 ? this.threshholds[i - 1] : this.threshholds[0]
        return this._deg2rad(this.minAngle + (ratio * this.angleRange))
      })
      .endAngle((d, i) => this._deg2rad(this.minAngle + this.threshholds[i] * this.angleRange))
  }

  _radius () {
    return (this.mwidth) * 0.5
  }

  _deg2rad (deg) {
    return deg * Math.PI / 180
  }

  render (newValue) {
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

  _displayLabel () {
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
      .text(d3.format('1.0f'))

    // display panel - ticks
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

  update (newValue, maxValue) {
    /**
         * TODO fun transition
         */

    var value = newValue
    if (!maxValue) this.config.maxValue = maxValue
    if (!newValue) value = 0

    // update ticks
    this.ticks = [
      this.config.minValue,
      (this.config.maxValue - this.config.minValue) * this.config.lowThreshhold,
      (this.config.maxValue - this.config.minValue) * this.config.lowMidThreshhold,
      (this.config.maxValue - this.config.minValue) * this.config.highMidThreshhold,
      (this.config.maxValue - this.config.minValue) * this.config.highThreshhold,
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
