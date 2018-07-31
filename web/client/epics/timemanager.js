
const Rx = require('rxjs');
const {updateLayerDimension} = require('../actions/layers');
const {SET_CURRENT_TIME} = require('../actions/timemanager');

module.exports = {
    updateLayerDimensionOnCurrentTimeSelection: action$ =>
        action$.ofType(SET_CURRENT_TIME).switchMap(({time}) => Rx.Observable.of(updateLayerDimension('time', time)))
};
