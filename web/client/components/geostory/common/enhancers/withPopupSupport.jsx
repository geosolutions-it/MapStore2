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
import { v1 as uuidv1 } from 'uuid';
import MapInfoViewer from '../../../common/MapInfoViewer';
import { getDefaultInfoFormat } from '../../../common/enhancers/withIdentifyPopup';
import { isEqual } from "lodash";
import { isInsideResolutionsLimits } from "../../../../utils/LayersUtils";
import {
    defaultQueryableFilter,
    filterRequestParams,
    getValidator
} from "../../../../utils/MapInfoUtils";
import {Observable} from "rxjs";
import { getFeatureInfoForViews } from "../../../../api/identify";
import find from "lodash/find";
import { connect } from "react-redux";
import { update } from "../../../../actions/geostory";
import { getAllGeoCarouselSections } from "../../../../selectors/geostory";

function isGeoStoryVectorLayer(layerInfo) {
    return layerInfo && layerInfo.indexOf('geostory-vector') === 0;
}

export const withCarouselMarkerInteraction = compose(
    connect((state)=>({sections: getAllGeoCarouselSections(state)}), {onClickMarker: update}),
    withHandlers({
        onClickMarker: ({onClickMarker = () => {}}) => (responses, layerInfo, popups) => {
            const {response: { features: [selectedFeature] = []} = {}} = find(responses,
                ({queryParams: {request} = {}, layerMetadata: {layerId} = {}} = {})=> !request && layerId.toLowerCase() === layerInfo) || {};
            let _popup = {popups: []};
            if (selectedFeature?.properties) {
                const { sectionId, contentId, title } = selectedFeature?.properties;
                onClickMarker(`sections[{"id":"${sectionId}"}].contents[{"id":"${contentId}"}].carouselToggle`, true);
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
                    const appParams = filterRequestParams(layer, includeOptions, excludeParams);
                    const reqId = uuidv1();
                    const viewResponses$ = getFeatureInfoForViews(layer, {
                        format: mapInfoFormat,
                        map,
                        point,
                        currentLocale: "en-US"
                    }, { params: appParams });
                    if (!viewResponses$) {
                        return Observable.empty();
                    }
                    return viewResponses$
                        .map(({views, layerMetadata, viewResponses, features, featuresCrs, primaryResponse, error}) => error
                            ? ({ reqId, error, layer, layerMetadata })
                            : ({
                                reqId,
                                layer,
                                ...primaryResponse,
                                viewResponses,
                                layerMetadata: {
                                    ...layerMetadata,
                                    featureInfo: {
                                        ...(layer.featureInfo || {}),
                                        views
                                    },
                                    features,
                                    featuresCrs
                                }
                            })
                        )
                        .catch((e) => Observable.of({
                            reqId,
                            error: e.data || e.statusText || e.status
                        }))
                        .startWith(({
                            start: true,
                            reqId
                        }));
                }).scan(({requests, responses, validResponses}, action) => {
                    if (action.start) {
                        const {reqId} = action;
                        return {requests: requests.concat({ reqId }), responses, validResponses};
                    }
                    const {reqId, response, queryParams, viewResponses, layer, layerMetadata} = action;
                    const validator = getValidator(mapInfoFormat);
                    const newResponses = responses.concat({reqId, response, queryParams, viewResponses, layer, layerMetadata});
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
