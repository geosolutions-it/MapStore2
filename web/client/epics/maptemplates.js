/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { get, pick, omit, isObject, isString, isArray, find, cloneDeep } from 'lodash';

import MapUtils from '../utils/MapUtils';
import Api from '../api/GeoStoreDAO';
import { error as showError } from '../actions/notifications';
import { isLoggedIn } from '../selectors/security';
import { setTemplates, setMapTemplatesLoaded, setTemplateData, setTemplateLoading, CLEAR_MAP_TEMPLATES, OPEN_MAP_TEMPLATES_PANEL,
    MERGE_TEMPLATE, REPLACE_TEMPLATE, SET_ALLOWED_TEMPLATES } from '../actions/maptemplates';
import {templatesSelector, allTemplatesSelector, isActiveSelector} from '../selectors/maptemplates';
import { mapInfoSelector, mapSelector } from '../selectors/map';
import { layersSelector, groupsSelector } from '../selectors/layers';
import { backgroundListSelector } from '../selectors/backgroundselector';
import { textSearchConfigSelector, bookmarkSearchConfigSelector } from '../selectors/searchconfig';
import { mapOptionsToSaveSelector } from '../selectors/mapsave';
import {SET_CONTROL_PROPERTY, setControlProperty, TOGGLE_CONTROL} from '../actions/controls';
import { configureMap, mapInfoLoaded } from '../actions/config';
import { wrapStartStop } from '../observables/epics';
import { toMapConfig } from '../utils/ogc/WMC';
import {hideMapinfoMarker, purgeMapInfoResults} from "../actions/mapInfo";

const errorToMessageId = (e = {}, getState = () => {}) => {
    let message = `context.errors.template.unknownError`;
    if (e.status === 403) {
        message = `context.errors.template.pleaseLogin`;
        if (isLoggedIn(getState())) {
            message = `context.errors.template.notAccessible`;
        }
    } if (e.status === 404) {
        message = `context.errors.template.notFound`;
    }
    return message;
};

export const clearMapTemplatesEpic = (action$) => action$
    .ofType(CLEAR_MAP_TEMPLATES)
    .switchMap(() => Observable.of(setControlProperty('mapTemplates', 'enabled', false, false)));

export const openMapTemplatesPanelEpic = (action$) => action$
    .ofType(OPEN_MAP_TEMPLATES_PANEL)
    .switchMap(() => Observable.of(setControlProperty('mapTemplates', 'enabled', true, true)));

export const setAllowedTemplatesEpic = (action$, store) => action$
    .ofType(SET_ALLOWED_TEMPLATES)
    .switchMap(() => {
        const state = store.getState();
        const templates = allTemplatesSelector(state);

        const makeFilter = () => ({
            OR: {
                FIELD: templates.map(template => ({
                    field: ['ID'],
                    operator: ['EQUAL_TO'],
                    value: [template.id]
                }))
            }
        });

        const extractAttributes = (resource) => {
            const attribute = get(resource, 'Attributes.attribute', {});
            const attributes = isArray(attribute) ? attribute : [attribute];
            return attributes.reduce((result, attr) => ({
                ...result,
                [attr.name]: attr.value
            }), {});
        };
        // Since templates comes from api, override with session attributes
        const sessionMapTemplates = store?.getState().usersession?.session?.mapTemplates;
        return templates.length > 0
            ? Observable
                .defer(() => Api.searchListByAttributes(makeFilter(), {params: { includeAttributes: true }}, '/resources/search/list'))
                .switchMap(
                    (data) => {
                        const resourceObj = get(data, 'ResourceList.Resource', []);
                        const resources = isArray(resourceObj) ? resourceObj : [resourceObj];
                        const newTemplates = resources.map(resource => ({
                            ...pick(resource, 'id', 'name', 'description'),
                            ...extractAttributes(resource),
                            dataLoaded: false,
                            loading: false,
                            // override properties from userSession if any
                            ...sessionMapTemplates?.find(template => template.id === resource.id)
                        }));
                        return Observable.of(setTemplates(newTemplates), setMapTemplatesLoaded(true));
                    })
                .catch( err => Observable.of(setMapTemplatesLoaded(true, err)))
            : Observable.of(setTemplates([]), setMapTemplatesLoaded(true));
    });

export const mergeTemplateEpic = (action$, store) => action$
    .ofType(MERGE_TEMPLATE)
    .switchMap(({id}) => {
        const state = store.getState();
        const templates = templatesSelector(state);
        const template = find(templates, t => t.id === id);

        // Preserve original map id when "merging" map template
        // to load linked resources related to the original resource(map)
        const originalMapInfo = mapInfoSelector(state);
        const mapId = originalMapInfo?.id ?? null;

        return (template.dataLoaded ? Observable.of(template.data) :
            Observable.defer(() => Api.getData(id))).switchMap(data => {
            if (isObject(data) && data.map !== undefined || isString(data)) {
                const map = mapSelector(state);
                const layers = layersSelector(state);
                const groups = groupsSelector(state);
                const backgrounds = backgroundListSelector(state);
                const textSearchConfig = textSearchConfigSelector(state);
                const bookmarkSearchConfig = bookmarkSearchConfigSelector(state);
                const additionalOptions = mapOptionsToSaveSelector(state);

                const currentConfig = MapUtils.saveMapConfiguration(map, layers, groups, backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions);

                return (isString(data) ? Observable.defer(() => toMapConfig(data, false)) : Observable.of(data))
                    .switchMap(config => Observable.of(
                        ...(!template.dataLoaded ? [setTemplateData(id, data)] : []),
                        configureMap(cloneDeep(omit(MapUtils.mergeMapConfigs(currentConfig, MapUtils.addRootParentGroup(config, template.name)), 'widgetsConfig')), mapId),
                        ...(originalMapInfo ? [mapInfoLoaded({...originalMapInfo}, mapId)] : [])
                    ));
            }

            return !template.dataLoaded ? Observable.of(setTemplateData(id, data)) : Observable.empty();
        }).let(wrapStartStop(
            setTemplateLoading(id, true),
            setTemplateLoading(id, false),
            e => {
                const messageId = errorToMessageId(e.originalError || e, store.getState);
                return Observable.of(showError({
                    title: 'context.errors.template.title',
                    message: messageId,
                    position: "tc",
                    autoDismiss: 5
                }));
            }
        ));
    });

export const replaceTemplateEpic = (action$, store) => action$
    .ofType(REPLACE_TEMPLATE)
    .switchMap(({id}) => {
        const state = store.getState();
        const templates = templatesSelector(state);
        const template = find(templates, t => t.id === id);
        const {zoom, center} = mapSelector(state);

        // Preserve original map id when "replacing" map template
        // to load linked resources related to the original resource(map)
        const originalMapInfo = mapInfoSelector(state);
        const mapId = originalMapInfo?.id ?? null;

        return (template.dataLoaded ? Observable.of(template.data) : Observable.defer(() => Api.getData(id)))
            .switchMap(data => (isString(data) ?
                Observable.defer(() => toMapConfig(data)) :
                Observable.of(isObject(data) && data.map !== undefined ? data : null))
                .switchMap(config => Observable.of(
                    ...(!template.dataLoaded ? [setTemplateData(id, data)] : []),
                    ...(config ? [
                        configureMap(cloneDeep({
                            ...config,
                            map: {
                                ...config.map,

                                // if no zoom or center provided keep the current ones
                                zoom: config.map.zoom || zoom,
                                center: config.map.center || center
                            }
                        }), mapId, !config.map.zoom && (config.map.bbox || config.map.maxExtent))
                    ] : []),
                    ...(originalMapInfo ? [mapInfoLoaded({...originalMapInfo}, mapId)] : [])
                )))
            .let(wrapStartStop(
                setTemplateLoading(id, true),
                setTemplateLoading(id, false),
                e => {
                    const messageId = errorToMessageId(e.originalError || e, store.getState);
                    return Observable.of(showError({
                        title: 'context.errors.template.title',
                        message: messageId,
                        position: "tc",
                        autoDismiss: 5
                    }));
                }
            ));
    });

export const openMapTemplatesEpic = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
        .filter((action) => action.control === "mapTemplates" && isActiveSelector(store.getState()))
        .switchMap(() => {
            return Observable.of(purgeMapInfoResults(), hideMapinfoMarker());
        });
