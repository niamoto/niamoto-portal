var host = window.location.host
var protocol = window.location.protocol
var apiRoot = protocol + '//' + host + '/api/1.0'

export const plotList = apiRoot + '/Plot/'
export const shapeList = apiRoot + '/Shape/'
export const shapeLocation = apiRoot + '/ShapeLocation/'
export const taxonList = apiRoot + '/Taxon/'
export const taxonTreeList = apiRoot + '/TaxonTree/'
export const taxonGeneralInfos = protocol + '//' + host + '/arbres/generalInfos/0/'