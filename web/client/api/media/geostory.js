/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';
import { groupBy } from 'lodash';
import uuid from 'uuid';

import { addResource, editResource, removeResource } from '../../actions/geostory';
import { resourcesSelector } from '../../selectors/geostory';
import { selectedIdSelector } from '../../selectors/mediaEditor';
import { filterResources } from '../../utils/GeoStoryUtils';
/**
 * API to save in local resources. All the methods must implement the same interface.
 * TODO: bring the interface documentation into mediaAPI
 */

const save = ({ store }) => ({ mediaType, source, data }) =>
    Observable.of(uuid()).do(
        (id) => store.dispatch(addResource(id, mediaType, data)
        )).map(id => ({id, mediaType, data, source}));

const edit = ({ store }) => ({ mediaType, source, data }) => {
    const state = store.getState();
    const id = selectedIdSelector(state);
    return Observable.of(id).do(
        () => {
            return store.dispatch(editResource(id, mediaType, data));
        }
    ).map(() => ({id, mediaType, data, source}));
};

const load = ({ store }) => ({ mediaType, params }) => {
    const geoStoryResources = resourcesSelector(store.getState());
    const separatedResourcesPerType = geoStoryResources.length ? groupBy(resourcesSelector(store.getState()), "type") : {};
    const { page, pageSize } = params;
    const start = 0;
    const end = page * pageSize;
    const filterText = params.q || '';
    const resources = filterResources(separatedResourcesPerType[mediaType] || [], filterText);
    return Observable.of({
        resources: resources.filter((resource, idx) => {
            return idx >= start && idx < end;
        }),
        totalCount: resources.length
    });
};

const remove = ({ store }) => ({ mediaType }) => {
    const state = store.getState();
    const id = selectedIdSelector(state);
    return Observable.of(id).do(
        () => {
            return store.dispatch(removeResource(id, mediaType));
        }
    ).map(() => ({id, type: mediaType}));
};

export const create = (source) => {
    return {
        edit: edit(source),
        save: save(source),
        load: load(source),
        remove: remove(source)
    };
};
