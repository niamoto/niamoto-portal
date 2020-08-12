import * as d3 from 'd3'
import * as d3Legend from 'd3-svg-legend'
// import color from '../../css/source/partials/_color_js.scss'

export class GraphBarvGroup {

  config = {
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
    xDomain: [],
    marginLeft: 0.15,
    marginBottom: .2,
    colorText: ['#000'],
    typeLegend: 2,
    columns: [],
    rectRx: 0,
    xDomainTextRotation: 0,
    xDomainTextPosition: 'start'
  }

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
      bottom: this.config.height * this.config.marginBottom,
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
      .range(Object.values(this.config.color))

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

    /** Show Legend */
    svgLegend.select('.legend')
      .call(legendColor)
  }

  /**
   * update graph with new value
   * @param {objet} response - json flux
   */
  update(response) {

    let data = response

    let xScale = d3.scaleBand()
      .domain(data.map(d => d[this.config.columns[0]]))
      .range([0, this.mwidth])
      .paddingInner(0.1)
      .paddingOuter(0.1)
      .round(true)

    let xScale1 = d3.scaleBand()
      .domain(this.config.value)
      .range([0, xScale.bandwidth()])

    let yScale = d3.scaleLinear()
      .domain(this.config.yDomain)
      .range([this.mheight, 0])

    let yGrid = g => g
      .call(d3.axisLeft(yScale)
        .tickSizeInner(-this.mwidth)
        .tickPadding(10)
      )
      .call(g => g.selectAll('.domain').remove())
      .call(g => g.selectAll('.tick text').remove())

    let xAxis = g => g
      .call(d3.axisBottom(xScale)
        .tickSizeOuter(0)
      )
    let yAxis = g => g
      .call(d3.axisLeft(yScale)
        // .tickFormat(d => d)
        .tickPadding(10)
        .ticks(5)
      )



    const axisGroup = this.svg.selectAll('.xAxis').call(xAxis)
      .selectAll('text')
      .style('text-anchor', this.config.xDomainTextPosition)
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(' + this.config.xDomainTextRotation + ')')


    const layer = this.g.selectAll('g')
      .data(data)
      .join('g')
      .attr("transform", d => `translate(${xScale(d[this.config.columns[0]])},0)`)

    const rects = layer.selectAll('rect')
      .data(d => this.config.value.map(key => ({
        key,
        value: d[key]
      })))

    rects.enter()
      .append('rect')
      .attr('class', d => d.key)
      .attr('fill', d => this.config.color[d.key])
      .attr('x', d => xScale1(d.key))
      .attr('y', d => yScale(d.value) + 1)
      .attr('width', xScale1.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.value))
      .attr("rx", this.config.rectRx)
      .attr("ry", this.config.rectRx)

    rects.transition()
      .duration(500)
      .attr('x', d => xScale1(d.key))
      .attr('y', d => yScale(d.value) + 1)
      .attr('width', xScale1.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.value))

    rects.exit()
      .transition()
      .duration(500)
      .remove()

    this.svg.selectAll('.yAxis').transition().call(yAxis)
    this.svg.selectAll('.yGrid').transition().call(yGrid)

  }
}