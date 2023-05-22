/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Checkbox, Glyphicon, Button as ButtonRB, Table, Alert } from 'react-bootstrap';
import tooltip from '../../../misc/enhancers/buttonTooltip';
import ToolbarButton from '../../../misc/toolbar/ToolbarButton';
import Message from '../../../I18N/Message';
import InfoPopover from '../../../widgets/widget/InfoPopover';
import { getLayerTileMatrixSetsInfo } from '../../../../api/WMTS';
import { generateGeoServerWMTSUrl } from '../../../../utils/WMTSUtils';
import { normalizeSRS } from '../../../../utils/CoordinatesUtils';
import { isProjectionAvailable } from '../../../../utils/ProjectionUtils';
import { getTileGridFromLayerOptions } from '../../../../utils/WMSUtils';

const Button = tooltip(ButtonRB);

/**
 * Allow to set the cache options for a WMS layer
 * @memberof components.TOC
 * @name WMSCacheOptions
 * @prop {object} layer layer configuration
 * @prop {boolean} disableTileGrids disable tile grids toolbar
 * @prop {function} onChange callback triggered after changing the form
 */
function WMSCacheOptions({
    layer = {},
    projection,
    onChange,
    disableTileGrids
}) {

    const [tileGridLoading, setTileGridLoading] = useState(false);
    const [tileGridsResponseMsgId, setTileGridsResponseMsgId] = useState('');
    const [tileGridsResponseMsgStyle, setTileGridsResponseMsgStyle] = useState('');

    const selectedTileGridId = layer.tileGridStrategy === 'custom' && getTileGridFromLayerOptions({
        ...layer,
        projection
    })?.id;

    const supportFormatCache = !layer.format || !!((layer?.tileGridCacheSupport?.formats || []).includes(layer.format));
    const supportStyleCache = !layer.style || !!((layer?.tileGridCacheSupport?.styles || []).includes(layer.style));
    const hasCustomParams = !!layer.localizedLayerStyles;
    const tiled = layer && layer.tiled !== undefined ? layer.tiled : true;

    const requestUrl = generateGeoServerWMTSUrl(layer);

    const onTileMatrixSetsFetch = (options) => {
        setTileGridLoading(true);
        setTileGridsResponseMsgId('');
        setTileGridsResponseMsgStyle('');
        return getLayerTileMatrixSetsInfo(requestUrl, options.name, options)
            .then(({ tileGrids, styles, formats }) => {
                const filteredTileGrids = tileGrids.filter(({ crs }) => isProjectionAvailable(normalizeSRS(crs)));
                if (filteredTileGrids?.length === 0) {
                    setTileGridsResponseMsgId('layerProperties.noConfiguredGridSets');
                }
                return {
                    tileGrids: filteredTileGrids,
                    tileGridCacheSupport: filteredTileGrids?.length > 0 ? {
                        styles,
                        formats
                    } : undefined
                };
            })
            .catch(() => {
                setTileGridsResponseMsgId('layerProperties.notPossibleToConnectToWMTSService');
                setTileGridsResponseMsgStyle('danger');
                return { };
            })
            // delay the loading phase the show the loader and give a feedback to user
            // in particular when the request is cached or too fast
            .finally(() => setTimeout(() => setTileGridLoading(false), 500));
    };

    return (
        <div className="ms-wms-cache-options">
            <div className="ms-wms-cache-options-content">
                <Checkbox value="tiled" key="tiled"
                    disabled={!!layer.singleTile}
                    style={{ margin: 0 }}
                    onChange={(e) => onChange('tiled', e.target.checked)}
                    checked={tiled} >
                    <Message msgId="layerProperties.cached" />
                </Checkbox>
                {requestUrl && !disableTileGrids && <div className="ms-wms-cache-options-toolbar">
                    {(layer.tileGridStrategy === 'custom' && layer.tileGrids && tiled && !layer.singleTile) && <InfoPopover
                        glyph="info-sign"
                        placement="top"
                        bsStyle={(!supportFormatCache || !supportStyleCache || !selectedTileGridId)
                            ? 'danger'
                            : 'success'}
                        title={<Message msgId="layerProperties.availableTileGrids" />}
                        popoverStyle={{ maxWidth: 'none' }}
                        text={
                            <>
                                <Table bordered condensed>
                                    <thead>
                                        <tr>
                                            <th><Message msgId="layerProperties.crsId" /></th>
                                            <th><Message msgId="layerProperties.projection" /></th>
                                            <th><Message msgId="layerProperties.tileSize" /></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {layer?.tileGrids?.map((tileGrid) => {
                                            const size = (tileGrid.tileSize || tileGrid.tileSizes[0] || [])[0];
                                            const markClassName = supportFormatCache && supportFormatCache ? 'bg-success' : '';
                                            return (
                                                <tr key={tileGrid.id}>
                                                    {tileGrid.id === selectedTileGridId
                                                        ? <>
                                                            <td><mark className={markClassName}>{tileGrid.id}</mark></td>
                                                            <td><mark className={markClassName}>{tileGrid.crs}</mark></td>
                                                            <td><mark className={markClassName}>{size}</mark></td>
                                                        </>
                                                        : !selectedTileGridId
                                                            ? <>
                                                                <td>{tileGrid.id}</td>
                                                                <td>{normalizeSRS(tileGrid.crs) === normalizeSRS(projection) ? <mark>{tileGrid.crs}</mark> : tileGrid.crs}</td>
                                                                <td>{size}</td>
                                                            </>
                                                            : <>
                                                                <td>{tileGrid.id}</td>
                                                                <td>{tileGrid.crs}</td>
                                                                <td>{size}</td>
                                                            </>}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                                <div style={{ maxWidth: 400 }}>
                                    {(selectedTileGridId && supportFormatCache && supportStyleCache) && <Alert bsStyle="success">
                                        <Message
                                            msgId="layerProperties.tileGridInUse"
                                            msgParams={{ id: selectedTileGridId }} />
                                    </Alert>}
                                    {!selectedTileGridId
                                        ? <Alert bsStyle="warning">
                                            <Message msgId="layerProperties.noTileGridMatchesConfiguration" />
                                        </Alert>
                                        : (!supportFormatCache || !supportStyleCache)
                                            ? (
                                                <Alert bsStyle="warning">
                                                    {!supportFormatCache && <Message msgId="layerProperties.notSupportedSelectedFormatCache" />}
                                                    {!supportStyleCache && <Message msgId="layerProperties.notSupportedSelectedStyleCache" />}
                                                </Alert>
                                            )
                                            : null}
                                    {hasCustomParams && <Alert bsStyle="warning">
                                        <Message
                                            msgId="layerProperties.customParamsCacheWarning"
                                        />
                                    </Alert>}
                                </div>
                            </>
                        }
                    />}
                    {layer.tileGridStrategy === 'custom' && <Button
                        disabled={!!tileGridLoading || !tiled || !!layer.singleTile}
                        tooltipId="layerProperties.updateTileGrids"
                        className="square-button-md no-border format-refresh"
                        onClick={() => {
                            onTileMatrixSetsFetch({ ...layer, force: true }).then(onChange);
                        }}
                    >
                        <Glyphicon glyph="refresh" />
                    </Button>}
                    <ToolbarButton
                        disabled={tileGridLoading || !tiled || !!layer.singleTile}
                        loading={tileGridLoading}
                        tooltipId={layer.tileGridStrategy === 'custom'
                            ? 'layerProperties.useStandardTileGridStrategy'
                            : 'layerProperties.useCustomTileGridStrategy'}
                        active={layer.tileGridStrategy === 'custom'}
                        glyph={layer.tileGridStrategy === 'custom' ? 'grid-custom' : 'grid-regular'}
                        bsStyle={layer.tileGridStrategy === 'custom' ? 'success' : 'primary'}
                        className="square-button-md"
                        onClick={() => {
                            const newTileGridStrategy = layer.tileGridStrategy !== 'custom'
                                ? 'custom'
                                : undefined;
                            const promise = newTileGridStrategy === 'custom'
                                && ((layer?.tileGrids?.length || 0) === 0 || !layer?.tileGridCacheSupport)
                                ? onTileMatrixSetsFetch(layer)
                                : Promise.resolve(undefined);
                            return promise.then(({ tileGrids, tileGridCacheSupport }) => {
                                const hasTileGrids = (tileGrids?.length || 0) > 0;
                                const tileGridStrategy = hasTileGrids
                                    ? newTileGridStrategy
                                    : undefined;
                                onChange({
                                    tileGridCacheSupport,
                                    tileGridStrategy,
                                    tileGrids
                                });
                            });
                        }}
                    />
                </div>}
            </div>
            {!layer.singleTile && tiled && tileGridsResponseMsgId && <Alert bsStyle={tileGridsResponseMsgStyle || 'warning'}>
                <Message msgId={tileGridsResponseMsgId} msgParams={{ requestUrl }}/>
            </Alert>}
        </div>
    );
}

export default WMSCacheOptions;
