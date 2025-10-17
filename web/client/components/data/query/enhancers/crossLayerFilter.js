import { get, find } from 'lodash';
import { Observable } from 'rxjs';
import { describeFeatureType, getLayerWFSCapabilities } from '../../../../observables/wfs';
import { findGeometryProperty } from '../../../../utils/ogc/WFS/base';
import { describeFeatureTypeToAttributes } from '../../../../utils/FeatureTypeUtils';
import { compose, withProps, withPropsOnChange, withHandlers, defaultProps } from 'recompose';
import propsStreamFactory from '../../../misc/enhancers/propsStreamFactory';
const hasCrossLayerFunctionalities = (data) => {
    const functions = get(data, "WFS_Capabilities.Filter_Capabilities.Scalar_Capabilities.ArithmeticOperators.Functions.FunctionNames.FunctionName");
    return !!find(functions, ({_} = {}) => _ === "queryCollection");
};

const createCrossLayerFunctionalitiesInspectionStream = ($props) => $props
    .distinctUntilChanged(({searchUrl} = {}, {searchUrl: newSearchUrl} = {}) => searchUrl === newSearchUrl)
    .switchMap( (props = {}) => {
        if (props.crossLayerExpanded) {
            return Observable.of(props);
        }
        return $props.filter( ({crossLayerExpanded} = {}) => crossLayerExpanded).take(1);
    })
    .switchMap(({featureTypeName, searchUrl }) => getLayerWFSCapabilities({layer: {
        name: featureTypeName,
        url: searchUrl,
        search: {
            type: "wfs",
            url: searchUrl
        }
    }})
        .do(
            (capabilities) => {
                if (!hasCrossLayerFunctionalities(capabilities)) {
                    throw new Error("nocrosslayerfunctionalities");
                }
            })
        .map(() => ({
            loadingCapabilities: false
        }))
        .catch( e => {
            return Observable.of({
                errorObj: e,
                loadingAttributes: false,
                loadingCapabilities: false,
                featureTypeProperties: []
            });
        })
        .startWith({loadingCapabilities: true}))
    .startWith({});

const retrieveCrossLayerAttributes = ($props, setQueryCollectionParameter) => $props
// retrieve layer's attributes on layer selection change
    .distinctUntilChanged(({layer = {}} = {}, {layer: newLayer } = {}) => newLayer && layer.name === (newLayer && newLayer.name))
    .filter(({layer} = {}) => !!layer)
    .switchMap(({layer} = {}) =>
        Observable.defer( () => describeFeatureType({layer}))
            .do((result) => {
                const geomProp = get(findGeometryProperty(result.data || {}), "name");
                if (geomProp) {
                    setQueryCollectionParameter("geometryName", geomProp);
                }
            })
            .map(({data = {}} = {}) => describeFeatureTypeToAttributes(data, layer?.fields))
            .map(attributes => ({
                attributes,
                loadingAttributes: false
            }))
            .startWith({loadingAttributes: true})
            .catch( e => {
                return Observable.of({
                    errorObj: e,
                    loadingAttributes: false,
                    featureTypeProperties: []
                });
            })
    ).catch( e => {
        return Observable.of({
            errorObj: e,
            loadingAttributes: false,
            loadingCapabilities: false,
            featureTypeProperties: []
        });
    }).startWith({});

export default compose(
    withPropsOnChange(
        ['crossLayerFilter'],
        ({crossLayerFilter = {}} = {}) => ({
            queryCollection: get(crossLayerFilter, 'collectGeometries.queryCollection'),
            operation: get(crossLayerFilter, 'operation'),
            distance: get(crossLayerFilter, 'distance'),
            enabledAreaOfInterest: get(crossLayerFilter, 'enabledAreaOfInterest')
        })),
    withProps(({layers = [], queryCollection = {}} = {}) => ({
        layer: find(layers, ({name} = {}) => name === queryCollection.typeName)
    })),
    withHandlers({
        setQueryCollectionParameter: ({setCrossLayerFilterParameter = () => {}}) => (k, v) => {
            setCrossLayerFilterParameter(`collectGeometries.queryCollection[${k}]`, v);
            if ( k === 'typeName') {
                setCrossLayerFilterParameter('collectGeometries.queryCollection.filterFields', []);
            }
        },
        updateLogicCombo: ({setCrossLayerFilterParameter = () => {}}) =>
            (id, logic) => setCrossLayerFilterParameter(`collectGeometries.queryCollection.groupFields`, [{
                id,
                logic,
                index: 0
            }]),
        setOperation: ({setCrossLayerFilterParameter = () => {}}) => (v) => setCrossLayerFilterParameter(`operation`, v),
        setEnabledAreaOfInterest: ({setCrossLayerFilterParameter = () => {}}) => (v) => setCrossLayerFilterParameter(`enabledAreaOfInterest`, v)
    }),
    defaultProps({
        dataStreamFactory: ($props, {setQueryCollectionParameter = () => {}} = {}) =>
            createCrossLayerFunctionalitiesInspectionStream($props)
                .combineLatest(
                    retrieveCrossLayerAttributes($props, setQueryCollectionParameter),
                    // combine the 2 streams output props
                    (overrides = {}, props = {}) => ({
                        ...props,
                        ...overrides
                    })
                ).startWith({})
    }),
    propsStreamFactory
);
