/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { get, zip } from 'lodash';
import MapUtils from '../utils/MapUtils';
import { getLayerCapabilities } from '../observables/wms';
import { toWMC } from '../utils/ogc/WMC';
import { download } from '../utils/FileUtils';
import { EXPORT_MAP } from '../actions/mapexport';
import { setControlProperty } from '../actions/controls';
import { set } from '../utils/ImmutableUtils';
import { mapSelector } from '../selectors/map';
import { layersSelector, groupsSelector } from '../selectors/layers';
import { backgroundListSelector } from '../selectors/backgroundselector';
import { mapOptionsToSaveSelector } from '../selectors/mapsave';
import { basicError } from '../utils/NotificationUtils';
import { getErrorMessage } from '../utils/LocaleUtils';
import {textSearchConfigSelector, bookmarkSearchConfigSelector} from '../selectors/searchconfig';

function MapExportError(title, message) {
    this.title = title;
    this.message = message;
}

const saveMap = (state, addBbox = false) => {
    const savedConfig = MapUtils.saveMapConfiguration(
        mapSelector(state),
        layersSelector(state),
        groupsSelector(state),
        backgroundListSelector(state),
        textSearchConfigSelector(state),
        bookmarkSearchConfigSelector(state),
        mapOptionsToSaveSelector(state)
    );

    return addBbox ? {
        ...savedConfig,
        map: {
            ...savedConfig.map,
            bbox: mapSelector(state).bbox
        }
    } : savedConfig;
};

const PersistMap = {
    mapstore2: (state) => Rx.Observable.of([JSON.stringify(saveMap(state)), 'map.json', 'application/json']),
    wmc: (state) => {
        const config = saveMap(state, true);
        const layers = get(config, 'map.layers', []).filter(layer => !!layer.url && layer.type === 'wms');

        if (layers.length === 0) {
            throw new MapExportError('mapExport.errorTitle', 'mapExport.wmcNoLayersError');
        }

        return Rx.Observable.forkJoin(...layers.map(layer => getLayerCapabilities(layer).catch(() => Rx.Observable.of(null))))
            .switchMap(capArr => Rx.Observable.of([
                toWMC(set('map.layers', zip(layers, capArr).map(([l, capabilities]) => ({...l, capabilities})), config), {}),
                'context.wmc',
                'application/xml'
            ]));
    }
};

export const exportMapContext = (action$, { getState = () => { } } = {}) =>
    action$
        .ofType(EXPORT_MAP)
        .switchMap(({ format }) =>
            PersistMap[format](getState())
                .do((downloadArgs) => download(...downloadArgs))
                .map(() => setControlProperty('export', 'enabled', false))
        )
        .catch((e, stream$) => Rx.Observable.of(basicError({
            ...(e instanceof MapExportError ? e : getErrorMessage(e)),
            autoDismiss: 6,
            position: 'tc'
        })).concat(stream$));

