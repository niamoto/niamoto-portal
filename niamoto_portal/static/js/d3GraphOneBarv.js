'use strict'

import * as d3 from 'd3'

// todo diviser en 2 graphs
export class GraphOneBarV {
  constructor(configuration) {
    // default configuration settings
    var config = {
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
      colorText: ['#222', '#222', '#222']
    }

    this.config = Object.assign(config, configuration)

    this.margin = {
      top: this.config.height * 0.08,
      right: this.config.width * 0.07,
      bottom: this.config.height * 0.2,
      left: this.config.width * this.config.marginLeft
    }

    this.mheight = this.config.height - this.margin.top - this.margin.bottom
    this.mwidth = this.config.width - this.margin.left - this.margin.right
    this.svg = d3.select(this.config.container).append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

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
      .domain(this.config.value)
      .range(this.config.color)

    var legendColor = d3.legendColor()
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

  update(response) {
    // var stack = d3.stack()
    //   .keys(['forest', 'outForest'])
    //   .order(d3.stackOrderNone)
    //   .offset(d3.stackOffsetNone)
    var data = response

    // if (this.config.yDomain === '') {
    //   this.config.yDomain = data.map(d => d.class_name)
    // }
    // // if (this.config.maxValue === '') {
    // this.config.maxValue = d3.max(data, d => d3.max(d, d => d[1]))
    // // }

    // const defs = this.svg.append('defs')

    // const gdefs = defs.append('g').attr('id', 'linear-gradient')

    // const linearGradient1 = gdefs.append('linearGradient')
    //   .attr('x1', '0%').attr('y1', '0%')
    //   .attr('x2', '100%').attr('y2', '0%')

    // linearGradient1.append('stop')
    //   .attr('offset', 0.9)
    //   .attr('stop-color', this.config.color[0])
    //   .attr('stop-opacity', 0.8)
    // linearGradient1.append('stop')
    //   .attr('offset', 1)
    //   .attr('stop-color', '#262626')
    //   .attr('stop-opacity', 0.8)

    // const linearGradient2 = gdefs.append('linearGradient')
    //   .attr('x1', '0%').attr('y1', '0%')
    //   .attr('x2', '0%').attr('y2', '100%')

    // linearGradient2.append('stop')
    //   .attr('offset', 0.9)
    //   .attr('stop-color', this.config.color[0])
    //   .attr('stop-opacity', 0.8)
    // linearGradient2.append('stop')
    //   .attr('offset', 1)
    //   .attr('stop-color', '#262626')
    //   .attr('stop-opacity', 0.8)

    var yScale = d3.scaleLinear()
      .domain(this.config.yDomain)
      .range([this.mheight, 0])

    var yAxis = g => g
      .call(d3.axisLeft(yScale)
        .tickFormat(d => d + '%')
        .tickSizeInner(-this.mwidth * 0.6)
        .tickPadding(10)
        .tickValues(['0', '25', '50', '75', '100'])
      )

    this.svg.selectAll('.yAxis')
      .call(yAxis)
      .select('.domain').remove()

    // const layer = this.g.selectAll('g')
    //   .data(data)
    //   .join('g')
    //   .attr('fill', (d, i) => this.config.color[i])
    //   .attr('class', (d, i) => this.config.value[i])

    function calculerPosition(i) {
      /* fonction servant à calculer la position
         à partir du haut du graph
        il faut additionnner la taille de chaque chaque valeur précédente
      */
      let rslt = 0
      for (let y = 0; y < i; y++) {
        rslt += data[y].value
      }
      return rslt
    }

    function calculerPositionText(i) {
      /* fonction servant à calculer la position
         à partir du haut du graph
        il faut additionnner la taille de chaque chaque valeur précédente
      */
      let rslt = 0
      // console.log(i)
      for (let y = i; y >= 0; y--) {
        if (y === i) {
          rslt += data[y].value / 2
        } else {
          rslt += data[y].value
        }
      }
      return rslt
    }

    var rects = this.g.selectAll('rect')
      .data(data)
    rects.enter()
      .append('rect')
      .attr('class', (d, i) => this.config.value[i])
      // .style('fill', 'url(#linear-gradient')
      .style('fill', (d, i) => this.config.color[i])
      .style('opacity', '1')
      .attr('width', this.mwidth * 0.3)
      .attr('x', this.mwidth * 0.15)
      .attr('y', function (d, i) {
        if (i !== 0) {
          return yScale(100 - calculerPosition(i))
        } else {
          return 0
        }
      })
      .attr('height', function (d, i) {
        return yScale(100 - d.value)
      })
      // .on('mouseover', handleMouseOver)
      // .on('mouseout', handleMouseOut)
      .transition()
      .duration(500)

    rects.transition()
      .duration(500)
      .attr('y', function (d, i) {
        if (i !== 0) {
          return yScale(100 - calculerPosition(i))
        } else {
          return 0
        }
      })
      .attr('height', function (d, i) {
        return yScale(100 - d.value)
      })

    rects.exit()
      .transition()
      .duration(500)
      .remove()

    var texts = this.g.selectAll('text')
      .data(data)

    texts.enter().append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('x', 2 * this.mwidth * 0.15)
      .attr('y', (d, i) => yScale(100 - calculerPositionText(i)))
      .attr('dy', '.5em')
      .attr('dx', '.5em')
      .text(function (d) {
        if (d.value !== 0) {
          return d3.format('.1%')(d.value / 100)
        }
      })
      .attr('font-family', 'sans-serif')
      .attr('font-size', '20px')
      .attr('fill', (d, i) => this.config.colorText[i])
      .transition()
      .duration(500)

    texts.transition().duration(500)
      // .attr('x', 2 * this.mwidth * 0.12)
      .attr('y', (d, i) => yScale(100 - calculerPositionText(i)))
      .text(function (d) {
        if (d.value !== 0) {
          return d3.format('.1%')(d.value / 100)
        }
      })
      .attr('fill', (d, i) => this.config.colorText[i])

    texts.exit()
      .transition()
      .duration(500)
      .remove()
  }
}