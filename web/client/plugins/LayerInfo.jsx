/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import LayerInfo from '../components/layerinfo/LayerInfo';
import ResizableModal from '../components/misc/ResizableModal';
import Message from '../components/I18N/Message';

import { createPlugin } from '../utils/PluginsUtils';

import { setControlProperty } from '../actions/controls';
import {
    layerInfoControlEnabledSelector,
    layersSelector,
    loadingSelector,
    loadFlagsSelector,
    syncStatusSelector,
    errorSelector
} from '../selectors/layerinfo';
import { currentLocaleSelector } from '../selectors/locale';
import {
    syncLayers,
    selectLayers
} from '../actions/layerinfo';
import layerinfo from '../reducers/layerinfo';
import * as epics from '../epics/layerinfo';

/**
 * Provides title and description syncronization functionality for layers
 * @memberof plugins
 * @name LayerInfo
 * @class
 */
const LayerInfoPlugin = ({
    enabled = false,
    layers = [],
    currentLocale,
    loading = false,
    loadFlags = {},
    syncStatus = {},
    error,
    onSyncLayers = () => {},
    onSelectLayers,
    onClose = () => {}
}) => {
    const updating = loading && loadFlags.syncingLayers;
    const selectedLayers = layers.filter(({selected}) => selected);

    return (
        <ResizableModal
            bodyClassName="layerinfo-dialog-body"
            loading={updating}
            loadingText={loading && <Message msgId="layerInfo.updatingLayers" msgParams={syncStatus}/>}
            size="sm"
            show={enabled}
            clickOutEnabled={!updating}
            showClose={!updating}
            onClose={() => onClose()}
            title={<Message msgId="layerInfo.title"/>}
            buttons={[{
                text: <Message msgId="layerInfo.syncButton"/>,
                disabled: updating || !selectedLayers.length,
                onClick: () => onSyncLayers(selectedLayers)
            }]}>
            <LayerInfo
                loading={loading}
                loadFlags={loadFlags}
                error={error}
                layers={layers}
                currentLocale={currentLocale}
                onSelectLayers={onSelectLayers}/>
        </ResizableModal>
    );
};

export default createPlugin('LayerInfo', {
    component: connect(createStructuredSelector({
        enabled: layerInfoControlEnabledSelector,
        layers: layersSelector,
        currentLocale: currentLocaleSelector,
        loading: loadingSelector,
        loadFlags: loadFlagsSelector,
        syncStatus: syncStatusSelector,
        error: errorSelector
    }), {
        onSyncLayers: syncLayers,
        onSelectLayers: selectLayers,
        onClose: setControlProperty.bind(null, 'layerinfo', 'enabled', false)
    })(LayerInfoPlugin),
    containers: {
        TOC: {
            name: 'LayerInfo',
            doNotHide: true
        }
    },
    reducers: {
        layerinfo
    },
    epics
});
