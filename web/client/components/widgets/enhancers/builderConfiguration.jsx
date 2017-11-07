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
module.exports = compose(
    defaultProps({
        dataStreamFactory: ($props, {layer}) =>
            Observable.forkJoin(describeFeatureType({layer}), describeProcess(layer.url, "gs:Aggregate"))
                .map(([result]) => ({
                      loading: false,
                      types: TYPES,
                      featureTypeProperties: get(result, "data.featureTypes[0].properties") || []
                })
            )
            .catch( () => Observable.of({
                loading: false,
                featureTypeProperties: []
            }))
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
