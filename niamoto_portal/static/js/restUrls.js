var host = window.location.host
var protocol = window.location.protocol
var apiRoot = protocol + '//' + host + '/api/1.0'

/**
 * generate the list of plots (json)
 * @constant
 * @type {string} 
 */
export const plotList = apiRoot + '/Plot/'
/**
 * generate the list of shape (json)
 * @constant
 * @type {string} 
 */
export const shapeList = apiRoot + '/Shape/'
/**
 * generate the list of shape with location (not use) (json)
 * @constant
 * @type {string} 
 */
export const shapeLocation = apiRoot + '/ShapeLocation/'
/**
 * generate the list of taxon (json)
 * @constant
 * @type {string} 
 */
export const taxonList = apiRoot + '/Taxon/'
/**
 * generate General info Taxon (max dbh, min dbh...) (json)
 * @constant
 * @type {string} 
 */
export const taxonGeneralInfos = protocol + '//' + host + '/arbres/generalInfos/0/'