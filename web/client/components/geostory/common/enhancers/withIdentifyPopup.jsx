/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {compose, branch, withStateHandlers, withPropsOnChange, mapPropsStream, createEventHandler} from 'recompose';
import {Observable} from 'rxjs';
import { isEqual} from 'lodash';
import uuidv1 from 'uuid/v1';
import MapInfoViewer from '../MapInfoViewer';
import {getFeatureInfo} from '../../../../api/identify';

import {
    getAvailableInfoFormatValues,
    getDefaultInfoFormatValue,
    defaultQueryableFilter,
    buildIdentifyRequest,
    filterRequestParams,
    getValidator
} from '../../../../utils/MapInfoUtils';

// verify if 'application/json' is available if not use default
export const getDefaultInfoFormat = () => {
    const availableInfoFormats = getAvailableInfoFormatValues();
    return availableInfoFormats.indexOf('application/json') !== -1
        ? 'application/json'
        : getDefaultInfoFormatValue();
};

// Simplified version of load feature info request derived from identify epics
export const withIdentifyRequest  = mapPropsStream(props$ => {
    const { stream: loadFeatureInfo$, handler: getFeatureInfoHandler} = createEventHandler();
    return loadFeatureInfo$.withLatestFrom(props$
        .map(({map, layers, options}) => ({map, layers, options}))
        .distinctUntilChanged((a, b ) => isEqual(a, b)))
        .switchMap(([{point}, {map, layers = [], options: {mapOptions: {mapInfoFormat = getDefaultInfoFormat()} = {}} = {}}]) => {
            const queryableLayers = layers.filter(defaultQueryableFilter);

            const excludeParams = ["SLD_BODY"];
            const includeOptions = [
                "buffer",
                "cql_filter",
                "filter",
                "propertyName"
            ];

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
                    return getFeatureInfo(basePath, param, layer)
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
                    const newValidResponses = validator.getValidResponses(newResponses, true);
                    return {requests, validResponses: newValidResponses, responses: newResponses};
                }, {requests: [], responses: [], validResponses: []});
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
 * Add identify popup support to base map and throws mapInfo requests
 */
export const  withPopupSupport =  branch(({map: {mapInfoControl = false} = {}}) => mapInfoControl,
    compose(
        withIdentifyRequest,
        withStateHandlers(({'popups': []}), {
            onClick: (_state, {getFeatureInfoHandler = () => {}}) => ({rawPos: coordinates = [], ...point}, layerInfo) =>  {
                getFeatureInfoHandler({point, layerInfo});
                return {popups: [{ position: {  coordinates}, id: uuidv1() }]};
            },
            onPopupClose: () => () => ({popups: []})
        }),
        withPropsOnChange(["mapInfo", "popups"], ({mapInfo, popups, options: {mapOptions: {mapInfoFormat = getDefaultInfoFormat()} = {}} = {}}) => {
            const {responses, requests, validResponses} = mapInfo;
            const component = () => (<MapInfoViewer
                renderEmpty
                responses={responses} requests={requests}
                validResponses={validResponses}
                format={mapInfoFormat} showEmptyMessageGFI missingResponses={(requests || []).length - (responses || []).length} />);
            return {popups: popups.map((popup) => ({...popup, component}))};
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


export const withOnClick = withPropsOnChange(
    ['onClick', 'eventHandlers'],
    ({ onClick = () => {}, eventHandlers = {} } = {}) => ({
        eventHandlers: {
            ...eventHandlers,
            onClick
        }
    })
);


