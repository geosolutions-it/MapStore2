/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withProps, withHandlers } from 'recompose';

import { connect } from 'react-redux';
import { castArray, find } from 'lodash';
import { normalizeLayer } from '../../../utils/LayersUtils';
import { onEditorChange } from '../../../actions/widgets';

/**
 * Gets the editor's data and allow to do basic operations on layers
 */
export default compose(
    withProps(({ editorData = {} }) => ({
        layers: editorData.maps && editorData.maps.find(m=> m.mapId === editorData.selectedMapId)?.layers || [],
        selectedMapId: editorData.selectedMapId
    })),
    connect(() => ({}), {
        setLayers: (layers, selectedMapId) => onEditorChange(`maps[${selectedMapId}].layers`, layers)
    }),
    withHandlers({
        addLayer: ({ layers = [], setLayers = () => { }, catalog = {}, selectedMapId}) => layer => catalog.localizedLayerStyles ?
            setLayers([...layers, normalizeLayer({...layer, localizedLayerStyles: catalog.localizedLayerStyles})], selectedMapId)
            : setLayers([...layers, normalizeLayer(layer)], selectedMapId),
        removeLayersById: ({ layers = [], setLayers = () => { }, selectedMapId }) => (ids = []) => setLayers(layers.filter(l => !find(castArray(ids), id => id === l.id)), selectedMapId)
    })
);
