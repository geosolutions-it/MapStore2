/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ADD, update } from '../actions/geostory';
import { show, HIDE, CHOOSE_MEDIA } from '../actions/mediaEditor';
import { Observable } from 'rxjs';
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
