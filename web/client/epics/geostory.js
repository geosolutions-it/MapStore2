/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import axios from 'axios';
import {isNaN, isString, isNil, isObject} from 'lodash';

import {
    LOAD_GEOSTORY,
    loadingGeostory,
    setCurrentStory,
    loadGeostoryError
} from '../actions/geostory';
import { error } from '../actions/notifications';

import { isLoggedIn } from '../selectors/security';

import { wrapStartStop } from '../observables/epics';

export const loadGeostoryEpic = (action$, {getState = () => {}}) => action$
        .ofType(LOAD_GEOSTORY)
        .switchMap( ({id}) =>
            Rx.Observable.defer(() => {
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
                return (loadingGeostory(false, "loading"), setCurrentStory({}));
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
                    return Rx.Observable.of(
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
