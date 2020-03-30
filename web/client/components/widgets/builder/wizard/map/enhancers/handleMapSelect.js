/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, withState, mapPropsStream, withHandlers } from 'recompose';

import GeoStoreDAO from '../../../../../../api/GeoStoreDAO';
import axios from '../../../../../../libs/ajax';
import ConfigUtils from '../../../../../../utils/ConfigUtils';
import { excludeGoogleBackground, extractTileMatrixFromSources } from '../../../../../../utils/LayersUtils';
import '../../../../../../libs/bindings/rxjsRecompose';

const handleMapSelect = compose(
    withState('selected', "setSelected", null),
    withHandlers({
        onMapChoice: ({ onMapSelected = () => { }, selectedSource = {}, includeMapId = false } = {}) => map =>
            (typeof map.id === 'string'
                ? axios.get(map.id).then(response => response.data)
                : GeoStoreDAO.getData(map.id, {baseURL: selectedSource.baseURL})
            ).then(config => {
                let mapState = (!config.version && typeof map.id !== 'string') ? ConfigUtils.convertFromLegacy(config) : ConfigUtils.normalizeConfig(config.map);
                return {
                    ...(mapState && mapState.map || {}),
                    ...(includeMapId ? {id: map.id} : {}),
                    groups: mapState && mapState.groups || [],
                    layers: excludeGoogleBackground(mapState.layers.map(l => {
                        if (l.group === "background" && (l.type === "ol" || l.type === "OpenLayers.Layer")) {
                            l.type = "empty";
                        }
                        return l;
                    }))
                };
            }).then(res => {
                // Extract tileMatrix from source and update layers
                res.layers = res.sources ? res.layers.map(l => {
                    const tileMatrix = extractTileMatrixFromSources(res.sources, l);
                    return {... l, ...tileMatrix};
                }) : res.layers;
                return onMapSelected({
                    map: res
                });
            })
    }),
    mapPropsStream(props$ =>
        props$.distinctUntilKeyChanged('selected').filter(({ selected } = {}) => selected).startWith({})

            .combineLatest(props$, ({ canProceed } = {}, props) => ({
                canProceed,
                ...props
            })
            )
    )
);

export default handleMapSelect;
