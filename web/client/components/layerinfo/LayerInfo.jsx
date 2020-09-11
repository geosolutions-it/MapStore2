/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Button, Glyphicon, Tooltip } from 'react-bootstrap';
import { every } from 'lodash';

import TransferColumnCardList from '../misc/transfer/TransferColumnCardList';
import Loader from '../misc/Loader';
import Message from '../I18N/Message';
import OverlayTrigger from '../misc/OverlayTrigger';

import { getLayerTitle } from '../../utils/LayersUtils';

export default ({
    loading = false,
    loadFlags = {},
    error,
    layers = [],
    currentLocale = 'default',
    onSelectLayers = () => {}
}) => {
    const layerIds = layers.map(({id}) => id);
    const selectedLayerIds = layers.filter(({selected}) => selected).map(({id}) => id);
    const layerItems = layers.map(({title, name, type, selected, id, syncStatus}) => ({
        title: getLayerTitle({title, name}, currentLocale),
        description: <Message msgId="layerInfo.layerType" msgParams={{type}}/>,
        cardSize: 'sm',
        selected,
        tools: syncStatus && syncStatus !== 'none' ? [{
            tooltipId: syncStatus === 'success' ? 'layerInfo.tooltips.syncSuccess' :
                syncStatus === 'error' ? 'layerInfo.tooltips.syncError' : undefined,
            glyph: syncStatus === 'success' ? 'ok-sign' :
                syncStatus === 'error' ? 'exclamation-mark' : undefined,
            Element: (props) => syncStatus === 'updating' ?
                <Loader size={16}/> :
                <OverlayTrigger placement="top" overlay={<Tooltip id="layerinfo-syncstatus-tooltip"><Message msgId={props.tooltipId}/></Tooltip>}>
                    <Glyphicon glyph={props.glyph}/>
                </OverlayTrigger>
        }] : [],
        preview: <div className="layerinfo-layeritem-preview"><Glyphicon glyph={selected ? 'check' : 'unchecked'}/></div>,
        onClick: () => selected ? onSelectLayers(selectedLayerIds.filter(selectedId => selectedId !== id)) : onSelectLayers([...selectedLayerIds, id])
    }));
    const allSelected = every(layers, {selected: true});

    return (
        <div className="layerinfo-content">
            {!loading && error ? <div className="layerinfo-error-box alert-danger">
                <div className="layerinfo-error-title">
                    <Message msgId={error.title}/>
                </div>
                <div className="layerinfo-error-message">
                    <Message msgId={error.message}/>
                </div>
            </div> : null}
            {(!loading || loadFlags.syncingLayers) && layers.length > 0 ? <div className="layerinfo-selectbutton-container">
                <Button
                    className="no-border"
                    onClick={() => allSelected ? onSelectLayers([]) : onSelectLayers(layerIds)}>
                    <Glyphicon glyph={allSelected ? 'check' : 'unchecked'} />
                    <Message msgId={`layerInfo.${allSelected ? 'deselect' : 'select'}All`}/>
                </Button>
            </div> : null}
            {!loading || loadFlags.syncingLayers ? <div className={`layerinfo-layerlist${layers.length > 0 ? '' : '-empty'}`}>
                <TransferColumnCardList
                    items={layerItems}
                    emptyStateProps={{
                        glyph: '1-layer',
                        title: <Message msgId="layerInfo.noLayers"/>
                    }}/>
            </div> : null}
            {loading && !loadFlags.syncingLayers ? <Loader size={100}/> : null}
        </div>
    );
};
