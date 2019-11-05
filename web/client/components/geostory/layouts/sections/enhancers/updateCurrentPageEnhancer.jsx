/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, createEventHandler, mapPropsStream, setObservableConfig } from 'recompose';

import { Observable } from "rxjs";

// TODO: externalize
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);


/**
 * This stream emits an even with either columnId or sectionId (not both)
 *   each time updateCurrentPage is called
 * it stores a local cache of sectionId and columnId data for comparison
 * it blocks events with same columnId or sectionId
 *
 * TODO: add section id information when columnId changes so we can move,
 *   the update logic from reducer to here and avoid to dispatch actions if columnId for that sectionId has not changed
 */

export const throttlePageUpdateEnhancer = compose(
    mapPropsStream(props$ => {
        const { handler: updateCurrentPage, stream: updateCurrentPage$ } = createEventHandler();
        let oldColumnId = "EMPTY";
        let oldSectionId = "EMPTY";
        return Observable.combineLatest(
            props$,

            updateCurrentPage$
                .filter(({columnId, sectionId}) => {
                    if (columnId && oldColumnId !== columnId) {
                        oldColumnId = columnId;
                        return true;
                    }
                    if (sectionId && oldSectionId !== sectionId) {
                        oldSectionId = sectionId;
                        return true;
                    }
                    // avoid to dispatch event if nothing has changed
                    return false;
                })
                .withLatestFrom(props$.pluck('updateCurrentPage'))
                .do(([arg, origUpdateCurrentPage]) => origUpdateCurrentPage && origUpdateCurrentPage(arg))
                .ignoreElements()
                .startWith({}),

            (...propsParts) => ({
                ...(propsParts.reduce((props = {}, part) => ({ ...props, ...part }), {})),
                updateCurrentPage
            })
        );
    })
);
