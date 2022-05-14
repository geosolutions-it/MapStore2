/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {
    compose,
    branch,
    withStateHandlers,
    withPropsOnChange,
    mapPropsStream,
    createEventHandler,
    withHandlers
} from 'recompose';
import uuidv1 from 'uuid/v1';
import buffer from "turf-buffer";
import intersect from "turf-intersect";
import MapInfoViewer from '../../../common/MapInfoViewer';
import { getDefaultInfoFormat } from '../../../common/enhancers/withIdentifyPopup';
import { isEqual } from "lodash";
import { isInsideResolutionsLimits } from "../../../../utils/LayersUtils";
import {
    buildIdentifyRequest,
    defaultQueryableFilter,
    filterRequestParams,
    getValidator
} from "../../../../utils/MapInfoUtils";
import {Observable} from "rxjs";
import { getFeatureInfo } from "../../../../api/identify";
import find from "lodash/find";
import { connect } from "react-redux";
import { update } from "../../../../actions/geostory";
import { getAllGeoCarouselSections } from "../../../../selectors/geostory";

function isGeoStoryVectorLayer(layerInfo) {
    return layerInfo && layerInfo.indexOf('geostory-vector') === 0;
}

export const getIntersectedFeature = (layer, request, metadata) => {
    const point = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": [request.lng, request.lat]
        }
    };
    let unit = metadata && metadata.units;
    switch (unit) {
    case "m":
        unit = "meters";
        break;
    case "deg":
        unit = "degrees";
        break;
    case "mi":
        unit = "miles";
        break;
    default:
        unit = "meters";
    }
    let resolution = metadata && metadata.resolution || 1;
    let bufferedPoint = buffer(point, (metadata.buffer || 1) * resolution, unit);
    const intersected = (layer.features || []).filter(
        (feature) => {
            try {
                if (feature.type === "FeatureCollection" && feature.features && feature.features.length) {
                    return feature.features.reduce((p, c) => {
                        // if required use the geodesic geometry
                        let ft = c.properties.useGeodesicLines && c.properties.geometryGeodesic ? {...c,
                            geometry: c.properties.geometryGeodesic
                        } : c;
                        return p || intersect(bufferedPoint, resolution && metadata.buffer && unit ? buffer(ft, 1, "meters") : ft);
                    }, false);
                }
                return intersect(bufferedPoint, resolution && metadata.buffer && unit ? buffer(feature, 1, "meters") : feature);

            } catch (e) {
                return false;
            }
        }

    );
    return {
        data: {
            crs: null,
            features: intersected,
            totalFeatures: "unknown",
            type: "FeatureCollection"
        },
        queryParams: request,
        layerMetadata: metadata
    };
};

export const withCarouselMarkerInteraction = compose(
    connect((state)=>({sections: getAllGeoCarouselSections(state)}), {onClickMarker: update}),
    withHandlers({
        onClickMarker: ({onClickMarker = () => {}, sections = {}}) => (responses, layerInfo, popups) => {
            const {response: { features: [{contentRefId} = {}] = []} = {}} = find(responses,
                ({queryParams: {request} = {}, layerMetadata: {title} = {}} = {})=> !request && title.toLowerCase() === layerInfo) || {};
            const result = find(sections, ({contents}) => find(contents, {id: contentRefId}));
            let _popup = {popups: []};
            if (result) {
                const {id: contentId, title = ''} = find(result.contents, {id: contentRefId}) || {};
                onClickMarker(`sections[{"id":"${result.id}"}].contents[{"id":"${contentId}"}].carouselToggle`, true);
                if (title) {
                    _popup = {popups: popups.map((popup) => ({...popup, component: ()=> (<div className={"ms-geostory-carousel-viewer"}>{title}</div>)}))};
                }
            }
            return _popup;
        }
    })
);

const withIdentifyRequest  = mapPropsStream(props$ => {
    const { stream: loadFeatureInfo$, handler: getFeatureInfoHandler} = createEventHandler();
    return loadFeatureInfo$.withLatestFrom(props$
        .map(({map, layers, options}) => ({map, layers, options}))
        .distinctUntilChanged((a, b ) => isEqual(a, b)))
        .switchMap(([{point, layerInfo}, {map, layers = [], options: {mapOptions: {mapInfoFormat = getDefaultInfoFormat()} = {}} = {}}]) => {
            let queryableLayers = layers.filter((layer) => isInsideResolutionsLimits(layer, map.resolution) && defaultQueryableFilter(layer));
            if (isGeoStoryVectorLayer(layerInfo)) {
                queryableLayers = queryableLayers.filter(({id}) => layerInfo === id);
            }
            const excludeParams = ["SLD_BODY"];
            const includeOptions = [
                "buffer",
                "cql_filter",
                "filter",
                "propertyName"
            ];
            if (queryableLayers.length === 0) {
                // mock a empty response to display the error message
                return Observable.of({
                    requests: [{}],
                    responses: [{
                        response: { features: [] }
                    }],
                    validResponses: []
                });
            }

            return Observable.from(queryableLayers)
                .mergeMap(layer => {
                    let { url, request, metadata } = buildIdentifyRequest(layer, {
                        format: mapInfoFormat,
                        map,
                        point,
                        currentLocale: "en-US"});
                    const basePath = url;
                    const queryParams = request;
                    const appParams = filterRequestParams(layer, includeOptions, excludeParams);
                    const param = { ...appParams, ...queryParams };
                    const reqId = uuidv1();
                    return (url ? getFeatureInfo(basePath, param, layer)
                        .map((response) =>
                            response.data.exceptions
                                ? ({
                                    reqId,
                                    exceptions: response.data.exceptions,
                                    queryParams,
                                    layerMetadata: metadata
                                })
                                : ({
                                    data: response.data,
                                    reqId: reqId,
                                    queryParams,
                                    layerMetadata: {
                                        ...metadata,
                                        features: response.features,
                                        featuresCrs: response.featuresCrs
                                    }
                                })
                        ) : Observable.of(getIntersectedFeature(layer, request, metadata))
                    )
                        .catch((e) => ({
                            error: e.data || e.statusText || e.status,
                            reqId,
                            queryParams,
                            layerMetadata: metadata
                        }))
                        .startWith(({
                            start: true,
                            reqId,
                            request: param
                        }));
                }).scan(({requests, responses, validResponses}, action) => {
                    if (action.start) {
                        const {reqId, request} = action;
                        return {requests: requests.concat({ reqId, request }), responses, validResponses};
                    }
                    const {data, queryParams, layerMetadata} = action;
                    const validator = getValidator(mapInfoFormat);
                    const newResponses = responses.concat({response: data, queryParams, layerMetadata});
                    const newValidResponses = validator.getValidResponses(newResponses);
                    return {requests, validResponses: newValidResponses, responses: newResponses, layerInfo};
                }, {requests: [], responses: [], validResponses: [], layerInfo});
        })
        .startWith({requests: [], responses: []})
        .combineLatest(props$, (mapInfo, props = {}) => {
            return {
                ...props,
                mapInfo,
                getFeatureInfoHandler
            };
        });
});

/**
 * Add identify popup support to base map of geostory with custom popup viewer
 */
export default branch(
    ({map: {mapInfoControl = false} = {}, isDrawEnabled}) => !isDrawEnabled && mapInfoControl,
    compose(
        withIdentifyRequest,
        withStateHandlers(({'popups': []}), {
            onClick: (_state, {getFeatureInfoHandler = () => {}, map: {mapInfoControl} = {}}) =>
                ({rawPos: coordinates = [], ...point}, layerInfo) =>  {
                    if (isGeoStoryVectorLayer(layerInfo) || mapInfoControl) {
                        getFeatureInfoHandler({point, layerInfo});
                        return {popups: [{position: {coordinates}, id: uuidv1()}]};
                    }
                    return {popups: []};
                },
            onPopupClose: () => () => ({popups: []})
        }),
        withPropsOnChange(["mapInfo", "popups"],
            ({mapInfo, popups, options: {mapOptions: {mapInfoFormat = getDefaultInfoFormat()} = {}} = {}, onClickMarker = () => {}}) => {
                const {responses, requests, validResponses, layerInfo} = mapInfo;
                if (isGeoStoryVectorLayer(layerInfo)) {
                    return onClickMarker(validResponses, layerInfo, popups);
                }
                return {popups: popups.map((popup) => ({...popup, component: ()=> (<MapInfoViewer
                    renderValidOnly
                    responses={responses} requests={requests}
                    validResponses={validResponses}
                    format={mapInfoFormat} showEmptyMessageGFI
                    missingResponses={(requests || []).length - (responses || []).length}/>)}))
                };
            }),
        withPropsOnChange(
            ['plugins', 'onPopupClose', 'popups'],
            ({plugins, popups, onPopupClose} = {}) => {
                const {PopupSupport, tools = {}, ...rest} = plugins;
                if (!PopupSupport) {
                    return {};
                }
                const Popups = (props) => (<PopupSupport {...props} popups={popups} onPopupClose={onPopupClose}/>);
                return {plugins: {...rest, tools: {...tools, popup: Popups}}};
            })
    ));
