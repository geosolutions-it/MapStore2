const Rx = require('rxjs');

const {parseString} = require('xml2js');
const {stripPrefix} = require('xml2js/lib/processors');


const GeoFence = require('../api/geoserver/GeoFence');
const loadSinglePage = (page = 0, filters = {}, size = 10) => Rx.Observable.defer(() => GeoFence.loadRules(page, filters, size))
                            .switchMap( response => Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
                                tagNameProcessors: [stripPrefix],
                                explicitArray: false,
                                mergeAttrs: true
                            }, callback))(response)
                            .map(({RuleList = {}}) => ({ page, rules: [].concat(RuleList.rule || [])}))
                        );

module.exports = {
    loadRules: (pages = [], filters = {}, size) =>
        Rx.Observable.combineLatest(pages.map(p => loadSinglePage(p, filters, size)))
        .map(results => results.reduce( (acc, {page, rules}) => ({...acc, [page]: rules}), {}))
        .map(p => ({pages: p})),
    getCount: (filters = {}) => Rx.Observable.defer(() => GeoFence.getRulesCount(filters)),
    moveRules: (targetPriority, rulesIds) => Rx.Observable.defer(() => GeoFence.moveRules(targetPriority, rulesIds))
};
