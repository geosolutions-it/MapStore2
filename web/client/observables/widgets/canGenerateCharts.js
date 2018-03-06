const {Observable} = require('rxjs');
const {describeFeatureType} = require('../wfs');
const {describeProcess} = require('../wps/describe');
/**
 * Tries to retrieve WFS and WPS info to guess if the layer passed can be used as base for a chart
 * @param  {Object} layer The layer object
 * @return {Observable} a stream that throws an error if the layer can not be used for charts
 */
module.exports = layer => Observable.forkJoin(describeFeatureType({layer}), describeProcess(layer.url, "gs:Aggregate"));
