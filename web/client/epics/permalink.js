/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from "rxjs";
import { push } from "connected-react-router";
import pick from "lodash/pick";
import get from "lodash/get";
import template from "lodash/template";

import API from "../api/GeoStoreDAO";
import { error, show } from "../actions/notifications";
import { LOGIN_SUCCESS } from "../actions/security";
import {
    LOAD_PERMALINK,
    SAVE_PERMALINK,
    loadPermalinkError,
    permalinkLoaded,
    permalinkLoading,
    updatePermalinkSettings
} from "../actions/permalink";

import { getResource, createResource, createCategory, updateResourceAttribute, getResourceIdByName } from "../api/persistence";
import { contextResourceSelector } from "../selectors/context";
import { currentStorySelector } from "../selectors/geostory";
import { mapSelector } from "../selectors/map";
import { mapSaveSelector } from "../selectors/mapsave";
import { isAdminUserSelector, isLoggedIn, userSelector } from "../selectors/security";
import { widgetsConfig } from "../selectors/widgets";
import { pathnameSelector } from "../selectors/router";
import { wrapStartStop } from "../observables/epics";

const PERMALINK = "PERMALINK";
const PERMALINK_RESOURCES = {
    map: (resource, state) => {
        const mapConfig = mapSaveSelector(state);
        const map = {
            ...mapConfig,
            map: {
                ...mapConfig.map,
                bbox: mapSelector(state)?.bbox
            }
        };
        return { ...resource, data: map };
    },
    context: (resource, state) => {
        const newResources = PERMALINK_RESOURCES.map(resource, state);
        const context = contextResourceSelector(state);
        return {
            ...resource,
            data: {
                ...context.data,
                mapConfig: newResources.data
            }
        };
    },
    dashboard: (resource, state) => {
        return { ...resource, data: widgetsConfig(state) };
    },
    geostory: (resource, state) => {
        return {
            ...resource,
            data: currentStorySelector(state)
        };
    }

};

const permalinkErrorHandler = (state) =>
    (e, stream$) => {
        if (e.status === 404) { // Upon saving a permalink, the only instance when a 404 can happen is in the case of missing category
            if (isAdminUserSelector(state)) {
                // Create category when missing and role is ADMIN
                return createCategory(PERMALINK)
                    .switchMap(() => {
                        return stream$.skip(1).concat(Observable.of(show({
                            id: "PERMALINK_SAVE_SUCCESS",
                            title: "notification.success",
                            message: `permalink.createCategorySuccess`
                        })));
                    })
                    .catch(() => Observable.of(error({
                        title: 'permalink.errors.save.title',
                        message: 'permalink.errors.save.categoryErrorAdmin',
                        autoDismiss: 6,
                        values: {
                            categoryName: PERMALINK
                        }
                    })));
            }
            return Observable.of(error({
                title: 'permalink.errors.save.title',
                message: 'permalink.errors.save.categoryErrorNonAdmin',
                autoDismiss: 6,
                values: {
                    categoryName: PERMALINK
                }
            }));
        }
        return Observable.of(
            error({
                title: 'notification.error',
                message: 'permalink.errors.save.generic',
                autoDismiss: 6,
                position: "tc"
            })
        );
    };

/**
 * Save permalink by resource type
 * @name epics.permalink
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const savePermalinkEpic = (action$, { getState = () => {} }) =>
    action$.ofType(SAVE_PERMALINK).switchMap(({ value } = {}) => {
        const { resource, permalinkType, allowAllUser } = value ?? {};
        if (!resource) {
            return Observable.empty();
        }
        const state = getState();
        let newResource = { ...resource };
        newResource = PERMALINK_RESOURCES[permalinkType](newResource, state);

        const user = userSelector(state);
        return Observable.defer(() =>
            allowAllUser
                ? API.getAvailableGroups(user)
                : Observable.of([])
        ).switchMap((groups) => {
            const publicGroup = groups.find(
                ({groupName} = {}) => groupName === "everyone"
            );
            if (allowAllUser && publicGroup) {
                const permission = [
                    {
                        canRead: true,
                        canWrite: false,
                        group: pick(publicGroup, ["id", "groupName"])
                    }
                ];
                newResource = { ...newResource, permission };
            }

            let attributes = {...newResource.attributes};
            attributes = pick(attributes, Object.keys(attributes).filter(key=> attributes[key]));
            const name = get(newResource, "metadata.name");
            newResource = {...newResource, category: PERMALINK};
            return createResource(newResource)
                .switchMap((id) =>
                    Observable.forkJoin(
                        Object.keys(attributes).map(
                            (attrName) =>
                                updateResourceAttribute({
                                    id,
                                    name: attrName,
                                    value: attributes[
                                        attrName
                                    ]
                                })
                        )
                    ).switchMap(() => Observable.of(
                        updatePermalinkSettings({name}),
                        show({
                            id: "PERMALINK_SAVE_SUCCESS",
                            title: "notification.success",
                            message: "permalink.success"
                        })
                    ))
                );
        }).let(
            wrapStartStop(
                permalinkLoading(true),
                permalinkLoading(false),
                permalinkErrorHandler(state)
            )
        );
    });

/**
 * Load permalink
 * @name epics.permalink
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const loadPermalinkEpic = (action$, { getState = () => {} } = {}) =>
    action$
        .ofType(LOAD_PERMALINK, LOGIN_SUCCESS)
        .filter(() => pathnameSelector(getState())?.split('/')?.[1] === "permalink")
        .switchMap(({ id: pid } = {}) => {
            const state = getState();
            const hash = pid ?? pathnameSelector(state)?.split("/")?.pop();
            return getResourceIdByName(PERMALINK, hash)
                .switchMap((id) =>
                    getResource(id).switchMap((resource) => {
                        const { name, attributes } = resource ?? {};
                        let { type, pathTemplate } = attributes ?? {};
                        pathTemplate = template(pathTemplate)(type === "context" ? {name} : { id });
                        return Observable.of(push(pathTemplate), permalinkLoaded());
                    })
                ).catch((e) => {
                    const errorMsg = "permalink.errors.loading";
                    let message = errorMsg + ".unknownError";
                    if (e.status === 403) {
                        message = errorMsg + ".pleaseLogin";
                        if (isLoggedIn(state)) {
                            message = errorMsg + ".permalinkNotAccessible";
                        }
                    }
                    if (e.status === 404) {
                        message = errorMsg + ".permalinkDoesNotExist";
                        // getResourceIdByName always provides 404 in both case (not permitted/not found)
                        if (isLoggedIn(state)) {
                            message = errorMsg + ".permalinkNotAccessible";
                        }
                    }
                    return Observable.of(
                        error({
                            title: errorMsg + ".title",
                            message
                        }),
                        loadPermalinkError({ ...e, messageId: message })
                    );
                });
        });

export default {
    savePermalinkEpic,
    loadPermalinkEpic
};
