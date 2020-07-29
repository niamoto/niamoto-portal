'use strict'

import * as d3 from 'd3'
import * as d3Legend from 'd3-svg-legend'
import {
    stratify
} from 'd3'

/**
 * Represents a graph one bar.
 * @constructor
 * @param {object} configuration - configuration default constains member config.
 */

export class GraphBarhSimple {

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
        yDomain: '',
        marginLeft: 0.15,
        colorText: ['#000'],
        typeLegend: 2,
        yDomainShow: 1,
        yTextDomain: 0,
        yTextColorIn: '#fff',
        yTextColorOut: '#111',
        tooltip: 0
    }
    constructor(configuration) {
        // default configuration settings
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
         * @property {array} typeLegend - 1 horizontale, 2 vertical
         * @property {array} yDomainShow - show axis y

         */


        this.config = Object.assign(this.config, configuration)

        this.margin = {
            top: this.config.height * 0.003,
            right: this.config.width * 0.03,
            bottom: this.config.height * 0.2,
            left: this.config.width * this.config.marginLeft
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





    /**
     * update graph with new value
     * @param {objet} response - json flux
     */

    update(response) {

        /**
         * calculate nomber pixel 
         * @param {string} text 
         */

        function pixelLength(text) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.font = "13px Arial";
            return ctx.measureText(text).width;
        }
        /**
         * return if text in rect 
         * @param {string} text 
         */
        function textRectIn(text, value, maxValue) {
            const strWidth = pixelLength(text)
            const b1Width = xScale(value)
            const b2Width = xScale(maxValue) - xScale(value)
            if (strWidth > b2Width && b2Width < b1Width) {
                return true
            } else {
                return false
            }
        }

        /**
         * return retrun text cut 
         * @param {string} text 
         */
        function textCut(text, value, maxValue) {
            const strWidth = pixelLength(text)
            const b1Width = xScale(value)
            const b2Width = xScale(maxValue) - xScale(value)

            if (textTooLong(text, value, maxValue)) {
                if (textRectIn(text, value, maxValue)) {
                    return text.substr(0, Math.trunc(text.length * b1Width / strWidth * .75)) + '...'

                } else {
                    console.log(text.substr(0, Math.trunc(text.length * b2Width / strWidth * .75)))
                    return text.substr(0, Math.trunc(text.length * b2Width / strWidth * .75)) + '...'
                }
            } else {
                return text
            }
        }

        function textTooLong(text, value, maxValue) {
            const strWidth = pixelLength(text)
            const b1Width = xScale(value)
            const b2Width = xScale(maxValue) - xScale(value)
            if (strWidth >= b1Width && strWidth >= b2Width) {
                return true
            } else {
                return false
            }
        }

        function positionText(text, value, maxValue) {
            const strWidth = pixelLength(textCut(text, value, maxValue))
            if (textRectIn(text, value, maxValue)) {
                return xScale(value) - strWidth - 20
            } else {
                return xScale(value)
            }
        }

        var data = response

        if (this.config.yDomain === '') {
            this.config.yDomain = response.map(d => d.class_name)
        }
        if (this.config.maxValue === '') {
            this.config.maxValue = d3.max(data, d => d.value)
            if (this.config.maxValue === 0) {
                this.config.maxValue = 100
            }
        }


        var yScale = d3.scaleBand()
            .domain(response.map(d => d.class_name))
            .range([0, this.mheight])
            .paddingInner(0.1)
            .paddingOuter(0.1)
            .round(true)

        var xScale = d3.scaleLinear()
            .domain([0, this.config.maxValue])
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
                .tickValues(this.config.yDomain)
                .tickSizeOuter(0)
            )

        this.svg.selectAll('.xAxis').transition().call(xAxis)
        this.svg.selectAll('.xGrid').transition().call(xGrid)

        const axisGroup = this.svg.selectAll('.yAxis').call(yAxis)
        const bandwidth = tickWidth(this.svg.selectAll('.yAxis'))

        function tickWidth(selection) {
            const ticks = selection.selectAll('.tick text').nodes().map(function (d) {
                return d.textContent
            })
            return yScale(ticks[1]) - yScale(ticks[0])
        }

        if (this.config.yDomainShow === 0) {
            this.svg.selectAll('.yAxis').selectAll(".tick text").remove();
            this.svg.selectAll('.yAxis').select(".domain").remove();
        }

        var tooltip = d3.select(this.config.container).append("div")
            .attr("id", "tooltip")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const rects = this.g.selectAll('rect')
            .data(data)
        const texts = this.g.selectAll('text')
            .data(data)

        rects.enter()
            .append('rect')
            .attr('class', d => d.class_name)
            .attr('fill', (d, i) => this.config.color[i])
            .attr('y', d => yScale(d.class_name))
            .attr('width', d => xScale(d.value))
            .attr('height', yScale.bandwidth())
            .attr("rx", 2)
            .attr("ry", 2)

        rects.transition()
            .duration(500)
            .attr('y', d => yScale(d.class_name))
            .attr('width', d => xScale(d.value))
            .attr('height', yScale.bandwidth())

        rects.exit()
            .transition()
            .duration(500)
            .remove()

        if (this.config.yTextDomain === 1) {
            const maxValue = this.config.maxValue
            const tooltipShow = this.config.tooltip
            const container = this.config.container

            texts.enter().append("text")
                .attr("class", d => "label " + d.class_name)
                .attr("x", d => positionText(d.class_name, d.value, maxValue))
                .attr("y", d => yScale(d.class_name) + yScale.bandwidth() * .5)
                .attr("dy", ".5em")
                .attr("dx", ".5em")
                .style("text-anchor", "start")
                .text(d => textCut(d.class_name, d.value, maxValue))
                .attr("fill", function (d) {
                    if (textRectIn(d.class_name, d.value, maxValue)) {
                        return 'white';
                    } else {
                        return 'black';
                    }
                })
                .on('mouseover', function (d) {
                    if (tooltipShow === 1) {
                        d3.select(this).style("opacity", "1.0");
                        var html = "<p><strong>" + d.class_name + "</strong></p>";
                        tooltip.transition()
                            .duration(300)
                            .style("opacity", .9);
                        tooltip.html(html);
                    }
                })
                .on('mouseout', function (d) {
                    if (tooltipShow === 1) {
                        d3.select(this).style("opacity", "0.8");
                        tooltip.transition()
                            .duration(300)
                            .style("opacity", 0);
                    }
                })
                .on('mousemove', function (d) {
                    // if (tooltipShow === 1) {
                    // var w = $(container).width();
                    // var h = $(container).height();
                    // tooltip.style("left", (d3.event.pageX - w / 2 - 15) + "px")
                    //     .style("top", (d3.event.pageY - h - 25) + "px");
                    // }
                })
                .transition()
                .duration(500);

            texts
                .transition()
                .duration(500)
                .attr("x", d => positionText(d.class_name, d.value, maxValue))
                .attr("y", d => yScale(d.class_name) + yScale.bandwidth() * .5)
                .text(d => textCut(d.class_name, d.value, maxValue))
                .attr("fill", function (d) {
                    if (textRectIn(d.class_name, d.value, maxValue)) {
                        return 'white';
                    } else {
                        return 'black';
                    }
                });

            texts.exit()
                .transition()
                .duration(500)
                .remove();
        }
    }
}