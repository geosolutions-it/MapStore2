/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, withState, mapPropsStream, withHandlers } from 'recompose';

import axios from '../../../../../../libs/ajax';
import ConfigUtils from '../../../../../../utils/ConfigUtils';
import { excludeGoogleBackground, extractTileMatrixFromSources } from '../../../../../../utils/LayersUtils';
import { EMPTY_MAP } from "../../../../../../utils/MapUtils";
import { is3DVisualizationMode } from "../../../../../../utils/MapTypeUtils";
import { getResource } from '../../../../../../api/persistence';
import '../../../../../../libs/bindings/rxjsRecompose';
import uuidv1 from 'uuid/v1';
import castArray from 'lodash/castArray';

const handleMapSelect = compose(
    withState('selected', "setSelected", null),
    withState('mapLoading', "setMapLoading", false),
    withHandlers({
        onMapChoice: ({ onMapSelected = () => { }, selectedSource = {}, includeMapId = false } = {}) => (maps = []) => {
            return axios.all(
                castArray(maps).map(map =>
                    (typeof map.id === 'string'
                        ? axios.get(map.id).then(response => response.data)
                        : getResource(map.id, {baseURL: selectedSource.baseURL, includeAttributes: false})
                            .toPromise()
                            .then(({data}) => data)
                    ).then(config => {
                        let mapState = (!config.version && typeof map.id !== 'string') ? ConfigUtils.convertFromLegacy(config) : ConfigUtils.normalizeConfig(config.map);
                        return {
                            mapId: uuidv1(),
                            name: typeof map.id === 'string' ? EMPTY_MAP : map.name,
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
                            return {...l, ...tileMatrix};
                        }) : res.layers;
                        // enable identify tool on map widgets only for 2D maps
                        return {...res, mapInfoControl: !is3DVisualizationMode(res) };
                    }))
            ).then((results)=> onMapSelected({ maps: results }));
        }
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
