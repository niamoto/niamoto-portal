'use strict'

export function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
        return initMaxValue
    } else {
        return maxValue
    }
}


export function dataFilter(data, field, precision = 0) {
    const result = data
        .filter(d => d.class_object === field)
    // .map(d => {
    //   class_name: d.class_name,
    //   class_value: parseFloat(d.class_value.toFixed(precision))
    // })
    return result
}

export function classFilter(data, field) {
    const result = data
        .filter(d => d.class_object === field)
        .map(d => d.class_name)
    return result
}

export function dataJson(data, mutliple = 1) {
    return data.map(function (d, i) {
        var result = {
            class_name: d.class_name,
            value: d.class_value * mutliple
        }
        return result
    })
}

export function dataTwoJson(data, mutliple = 1) {
    return data.map(function (d, i) {
        var result = {
            class_name: d.class_name,
            data1: d.class_value * mutliple
        }
        return result
    })
}