const React = require('react');
const loadingState = require('../../misc/enhancers/loadingState');
const emptyState = require('../../misc/enhancers/emptyState');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const {compose, defaultProps} = require('recompose');
const {get} = require('lodash');
const {Observable} = require('rxjs');
const {describeFeatureType} = require('../../../observables/wfs');
const {describeProcess} = require('../../../observables/wps/describe');
const {Message, HTML} = require("../../I18N/I18N");
const TYPES = "ALL";
const {findGeometryProperty} = require('../../../utils/ogc/WFS/base');
module.exports = compose(
    defaultProps({
        dataStreamFactory: ($props, {onEditorChange = () => {}, onConfigurationError = () => {}} = {}) =>
            $props
            .distinctUntilChanged( ({layer = {}} = {}, {layer: newLayer} = {})=> layer.name === newLayer.name)
            .switchMap( ({layer} = {}) => Observable.forkJoin(describeFeatureType({layer}), describeProcess(layer.url, "gs:Aggregate"))
                .do(([result]) => {
                    const geomProp = get(findGeometryProperty(result.data || {}), "name");
                    if (geomProp) {
                        onEditorChange("geomProp", geomProp);
                    }

                })
                .map(([result]) => get(result, "data.featureTypes[0].properties") || [])
                .map(featureTypeProperties => ({
                      loading: false,
                      types: TYPES,
                      featureTypeProperties
                })
            ))
            .catch( e => {
                onConfigurationError(e);
                return Observable.of({
                    errorObj: e,
                    loading: false,
                    featureTypeProperties: []
                });
            })
            .startWith({loading: true})
    }),
    propsStreamFactory,
    loadingState(),
    emptyState(
        ({featureTypeProperties = [], types = []}) => featureTypeProperties.length === 0 || types.length === 0,
        () => ({
            title: <Message msgId="widgets.builder.errors.noWidgetsAvailableTitle" />,
            description: <HTML msgId="widgets.builder.errors.noWidgetsAvailableDescription" />
        })
    )
);
