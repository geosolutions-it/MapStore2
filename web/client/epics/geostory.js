/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import axios from 'axios';
import {isNaN, isString, isNil, isObject} from 'lodash';

import {
    ADD,
    LOAD_GEOSTORY,
    loadingGeostory,
    loadGeostoryError,
    setCurrentStory,
    update
} from '../actions/geostory';
import { show, HIDE, CHOOSE_MEDIA } from '../actions/mediaEditor';
import { error } from '../actions/notifications';

import { isLoggedIn } from '../selectors/security';

import { wrapStartStop } from '../observables/epics';
import { ContentTypes } from '../utils/GeoStoryUtils';

export const openMediaEditorForNewMedia = action$ =>
    action$.ofType(ADD)
        .filter(({ element }) => element.type === ContentTypes.MEDIA)
        .switchMap(({path: arrayPath, element}) => {
            return Observable.of(show('geostory'))
                .merge(
                    action$.ofType(CHOOSE_MEDIA)
                        .switchMap( ({resource = {}}) => {
                            return Observable.of(update(`${arrayPath}[{"id":"${element.id}"}].resourceId`, resource.id ));
                        })
                        .takeUntil(action$.ofType(HIDE))
                );
        });

export const loadGeostoryEpic = (action$, {getState = () => {}}) => action$
        .ofType(LOAD_GEOSTORY)
        .switchMap( ({id}) =>
            Observable.defer(() => {
                if (isNaN(parseInt(id, 10))) {
                    return axios.get(`${id}.json`);
                }
                // TODO manage load process from external api
                return axios.get(`sampleStory.json`);
            })
            .map(({ data }) => {
                if (isObject(data)) {
                    return setCurrentStory(data);
                }
                if (isString(data)) {
                    return setCurrentStory(JSON.parse(data));
                }
                return setCurrentStory({});
            })
            .let(wrapStartStop(
                loadingGeostory(true, "loading"),
                loadingGeostory(false, "loading"),
                e => {
                    let message = "geostory.errors.loading.unknownError";
                    if (e.status === 403 ) {
                        message = "geostory.errors.loading.pleaseLogin";
                        if (isLoggedIn(getState())) {
                            message = "geostory.errors.loading.geostoryNotAccessible";
                        }
                    } else if (e.status === 404) {
                        message = "geostory.errors.loading.geostoryDoesNotExist";
                    } else if (isNil(e.status)) {
                        // manage generic errors like json parse errors (syntax errors)
                        message = e.message;
                    }
                    return Observable.of(
                        error({
                            title: "geostory.errors.loading.title",
                            message
                        }),
                        setCurrentStory({}),
                        loadGeostoryError({...e, messageId: message})
                    );
                }
            ))
        );
