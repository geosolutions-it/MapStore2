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

const infoText = {
    custom: ({
        tileGrids,
        supportFormatCache,
        selectedTileGridId,
        projection,
        hasCustomParams,
        tileGridCacheSupport,
        layer
    }) => {
        return (
            <>
                <p style={{ maxWidth: 400 }}>
                    {(selectedTileGridId && supportFormatCache) &&
                        <Message
                            msgId="layerProperties.tileGridInUse"
                            msgParams={{ id: selectedTileGridId }} />}
                </p>
                <Message msgId="layerProperties.availableTileGrids" />
                <Table bordered condensed>
                    <thead>
                        <tr>
                            <th><Message msgId="layerProperties.crsId" /></th>
                            <th><Message msgId="layerProperties.projection" /></th>
                            <th><Message msgId="layerProperties.tileSize" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(tileGrids || []).map((tileGrid) => {
                            const size = (tileGrid.tileSize || tileGrid.tileSizes[0] || [])[0];
                            const markClassName = tileGrid.id === selectedTileGridId && supportFormatCache && supportFormatCache
                                ? 'bg-success' : '';
                            return (
                                <tr className={markClassName} key={tileGrid.id}>
                                    <td>{tileGrid.id}</td>
                                    <td className={!selectedTileGridId && normalizeSRS(tileGrid.crs) === normalizeSRS(projection) ? 'bg-warning' : ''}>{tileGrid.crs}</td>
                                    <td>{size}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
                {tileGridCacheSupport?.formats && <>
                    <Message msgId="layerProperties.supportedFormats" />
                    <Table bordered condensed>
                        <tbody>
                            {tileGridCacheSupport.formats.map((format) => {
                                return (
                                    <tr key={format} className={format === layer.format ? 'bg-success' : ''}>
                                        <td>{format}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </>}
                <div style={{ maxWidth: 400 }}>
                    {!selectedTileGridId
                        ? <Alert bsStyle="warning">
                            <Message msgId="layerProperties.noTileGridMatchesConfiguration" />
                        </Alert>
                        : (!supportFormatCache)
                            ? (
                                <Alert bsStyle="warning">
                                    {!supportFormatCache && <Message msgId="layerProperties.notSupportedSelectedFormatCache" />}
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
        );
    },
    standard: ({
        tileGrids,
        tileGridCacheSupport,
        layer,
        supportFormatCache,
        projection,
        hasCustomParams
    }) => {
        const normalizedProjection = normalizeSRS(projection);
        const tileGridsMatchProjection = tileGrids.filter((tileGrid) => normalizeSRS(tileGrid.crs) === normalizedProjection);
        const supportProjection = tileGridsMatchProjection.length > 0;
        const tileGridsMatchTileSize = tileGridsMatchProjection.filter((tileGrid) => (tileGrid.tileSize || tileGrid.tileSizes[0] || [])[0] === (layer.tileSize || 256));
        const supportTileSize = tileGridsMatchTileSize.length > 0;
        return (
            <>
                <p style={{ maxWidth: 400 }}>
                    <Message msgId="layerProperties.tileGridInfoChecks" />
                </p>
                <Table bordered condensed>
                    <tbody>
                        <tr className={supportProjection ? 'bg-success' : 'bg-warning'}>
                            <td><Glyphicon className={supportProjection ? 'text-success' : 'text-danger'} glyph={supportProjection ? 'ok-sign' : 'remove-sign'}/>{' '}<Message msgId="layerProperties.projection" /></td>
                        </tr>
                        <tr className={supportTileSize ? 'bg-success' : 'bg-warning'}>
                            <td><Glyphicon className={supportTileSize ? 'text-success' : 'text-danger'} glyph={supportTileSize ? 'ok-sign' : 'remove-sign'}/>{' '}<Message msgId="layerProperties.tileSize" /></td>
                        </tr>
                        <tr className={supportFormatCache ? 'bg-success' : 'bg-warning'}>
                            <td><Glyphicon className={supportFormatCache ? 'text-success' : 'text-danger'} glyph={supportFormatCache ? 'ok-sign' : 'remove-sign'}/>{' '}<Message msgId="layerProperties.format.title" /></td>
                        </tr>
                    </tbody>
                </Table>
                {tileGrids && <>
                    <Message msgId="layerProperties.availableTileGrids" />
                    <Table bordered condensed>
                        <thead>
                            <tr>
                                <th><Message msgId="layerProperties.crsId" /></th>
                                <th><Message msgId="layerProperties.projection" /></th>
                                <th><Message msgId="layerProperties.tileSize" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tileGrids.map((tileGrid) => {
                                const size = (tileGrid.tileSize || tileGrid.tileSizes[0] || [])[0];
                                const projectionClass = supportProjection && !supportTileSize && normalizeSRS(tileGrid.crs) === normalizedProjection
                                    ? 'bg-success' : '';
                                const tileSizeClassName = size === (layer.tileSize || 256) && normalizeSRS(tileGrid.crs) === normalizedProjection
                                    ? 'bg-success' : '';
                                return (
                                    <tr key={tileGrid.id}>
                                        <td>{tileGrid.id}</td>
                                        <td className={`${projectionClass} ${tileSizeClassName}`}>{tileGrid.crs}</td>
                                        <td className={tileSizeClassName}>{size}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </>}
                {tileGridCacheSupport?.formats && <>
                    <Message msgId="layerProperties.supportedFormats" />
                    <Table bordered condensed>
                        <tbody>
                            {tileGridCacheSupport.formats.map((format) => {
                                return (
                                    <tr key={format} className={format === layer.format ? 'bg-success' : ''}>
                                        <td>{format}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </>}
                <div style={{ maxWidth: 400 }}>
                    {hasCustomParams && <Alert bsStyle="warning">
                        <Message
                            msgId="layerProperties.customParamsCacheWarning"
                        />
                    </Alert>}
                </div>
            </>
        );
    }
};

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
    const [standardTileGridInfo, setStandardTileGridInfo] = useState({});

    const selectedTileGridId = getTileGridFromLayerOptions({
        ...layer,
        ...(layer.tileGridStrategy !== 'custom' && standardTileGridInfo),
        projection
    })?.id;

    const cacheSupport = (layer.tileGridCacheSupport || standardTileGridInfo.tileGridCacheSupport);
    const supportFormatCache = !layer.format || !!((cacheSupport?.formats || []).includes(layer.format));
    const hasCustomParams = !!layer.localizedLayerStyles;
    const tiled = layer && layer.tiled !== undefined ? layer.tiled : true;

    const showInfo = ((layer.tileGrids || standardTileGridInfo.tileGrids || [])?.length > 0 && tiled && !layer.singleTile);

    const requestUrl = generateGeoServerWMTSUrl(layer);

    function handleOnChange(value, isStandard) {
        if (!isStandard) {
            onChange(value);
        }
        if (value?.tileGrids !== undefined) {
            const tileGrids = value.tileGrids.filter(tileGrid => {
                return tileGrid.origin
                    && tileGrid.tileSize && tileGrid.tileSize[0] === tileGrid.tileSize[1];
            });
            setStandardTileGridInfo({
                ...value,
                tileGrids
            });
            if (tileGrids.length === 0 && isStandard) {
                setTileGridsResponseMsgId('layerProperties.noConfiguredGridSets');
            }
        }
    }

    const onTileMatrixSetsFetch = (options) => {
        setTileGridLoading(true);
        setTileGridsResponseMsgId('');
        setTileGridsResponseMsgStyle('');
        return getLayerTileMatrixSetsInfo(requestUrl, options.name, options)
            .then(({ tileGrids, formats }) => {
                const filteredTileGrids = tileGrids.filter(({ crs }) => isProjectionAvailable(normalizeSRS(crs)));
                if (filteredTileGrids?.length === 0) {
                    setTileGridsResponseMsgId('layerProperties.noConfiguredGridSets');
                }
                return {
                    tileGrids: filteredTileGrids,
                    tileGridCacheSupport: filteredTileGrids?.length > 0 ? {
                        formats
                    } : undefined
                };
            })
            .catch(() => {
                setTileGridsResponseMsgId('layerProperties.notPossibleToConnectToWMTSService');
                setTileGridsResponseMsgStyle('danger');
                return {};
            })
            // delay the loading phase the show the loader and give a feedback to user
            // in particular when the request is cached or too fast
            .finally(() => setTimeout(() => setTileGridLoading(false), 500));
    };

    const InfoText = infoText[layer.tileGridStrategy] || infoText.standard;

    return (
        <div className="ms-wms-cache-options">
            <div className="ms-wms-cache-options-content">
                <Checkbox value="tiled" key="tiled"
                    disabled={!!layer.singleTile}
                    style={{ margin: 0 }}
                    onChange={(e) => onChange({ tiled: e.target.checked })}
                    checked={tiled} >
                    <Message msgId="layerProperties.cached" />
                </Checkbox>
                {requestUrl && !disableTileGrids && <div className="ms-wms-cache-options-toolbar">
                    {(showInfo) && <InfoPopover
                        glyph="info-sign"
                        placement="right"
                        bsStyle={(!supportFormatCache || !selectedTileGridId)
                            ? 'danger'
                            : 'success'}
                        title={<Message msgId="layerProperties.tileGridInfoChecksTitle" />}
                        popoverStyle={{ maxWidth: 'none' }}
                        text={<InfoText
                            layer={layer}
                            tileGridCacheSupport={cacheSupport}
                            tileGrids={layer.tileGrids || standardTileGridInfo.tileGrids}
                            supportFormatCache={supportFormatCache}
                            selectedTileGridId={selectedTileGridId}
                            projection={projection}
                            hasCustomParams={hasCustomParams}
                        />}
                    />}
                    <Button
                        disabled={!!tileGridLoading || !tiled || !!layer.singleTile}
                        tooltipId={layer.tileGridStrategy === 'custom'
                            ? 'layerProperties.updateTileGrids'
                            : 'layerProperties.checkAvailableTileGridsInfo'
                        }
                        className="square-button-md no-border format-refresh"
                        onClick={() => {
                            onTileMatrixSetsFetch({ ...layer, force: true }).then((value) => handleOnChange(value, layer.tileGridStrategy !== 'custom'));
                        }}
                    >
                        <Glyphicon glyph="refresh" />
                    </Button>
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
                            return promise.then(({ tileGrids, tileGridCacheSupport } = {}) => {
                                const hasTileGrids = (tileGrids?.length || 0) > 0;
                                const tileGridStrategy = hasTileGrids
                                    ? newTileGridStrategy
                                    : undefined;
                                handleOnChange({
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
                <Message msgId={tileGridsResponseMsgId} msgParams={{ requestUrl }} />
            </Alert>}
        </div>
    );
}

export default WMSCacheOptions;
