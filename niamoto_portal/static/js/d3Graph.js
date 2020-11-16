'use strict'
/**
 * initialize the maximum value
 * @param {number} maxValue 
 * @param {number} initMaxValue
 * @returns {number}
 */
export function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
        return initMaxValue
    } else {
        return maxValue
    }
}

/**
 * filter the json stream according to the selected field
 * @param {json} data 
 * @param {string} field
 * @returns {json}
 */
export function dataFilter(data, field) {
    const result = data
        .filter(d => d.class_object === field)
    return result
}
/**
 * filter the json stream based on the selected field having a class_name object (not used)
 * @param {json} data 
 * @param {string} field
 * @returns {json}
 */
export function classFilter(data, field) {
    const result = data
        .filter(d => d.class_object === field)
        .map(d => d.class_name)
    return result
}
/**
 * create a new json stream in graph format
 * @param {json} data 
 * @param {number} mutliple - allows you to convert a value into a percentage for example
 * @returns {json} - {class_name:  xxx, value: 000}
 */
export function dataJson(data, mutliple = 1) {
    return data.map(function (d, i) {
        var result = {
            class_name: d.class_name,
            value: d.class_value * mutliple
        }
        return result
    })
}