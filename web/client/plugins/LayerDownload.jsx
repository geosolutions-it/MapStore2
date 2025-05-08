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

import {
    downloadFeatures,
    setService,
    setWPSAvailability,
    onDownloadOptionChange,
    onFormatOptionsFetch,
    clearDownloadOptions,
    removeExportDataResult,
    checkExportDataEntries
} from '../actions/layerdownload';
import { toggleControl } from '../actions/controls';
import { download } from '../actions/layers';
import {
    layerDonwloadControlEnabledSelector,
    downloadOptionsSelector,
    loadingSelector,
    wfsFormatsSelector,
    formatsLoadingSelector,
    wpsAvailableSelector,
    serviceSelector,
    checkingWPSAvailabilitySelector,
    wfsFilterSelector,
    exportDataResultsControlEnabledSelector,
    exportDataResultsSelector,
    showInfoBubbleSelector,
    downloadLayerSelector,
    infoBubbleMessageSelector,
    checkingExportDataEntriesSelector
} from '../selectors/layerdownload';
import {attributesSelector} from '../selectors/query';
import { getSelectedLayer } from '../selectors/layers';
import { currentLocaleSelector } from '../selectors/locale';
import { customAttributesSettingsSelector } from "../selectors/featuregrid";

import DownloadDialog from '../components/data/download/DownloadDialog';

import ExportDataResultsComponent from '../components/data/download/ExportDataResultsComponent';

import FeatureEditorButton from '../components/data/download/FeatureEditorButton';
import * as epics from '../epics/layerdownload';

import layerdownload from '../reducers/layerdownload';
import { createPlugin } from '../utils/PluginsUtils';


const LayerDownloadButton = connect(() => ({}), {
    onClick: download
})(({
    onClick,
    selectedNodes,
    status,
    itemComponent,
    statusTypes,
    ...props
}) => {
    const ItemComponent = itemComponent;
    const layer = selectedNodes?.[0]?.node;
    if ([statusTypes.LAYER].includes(status) && (layer?.type === 'wms' || layer?.search) && !layer?.error) {
        return (
            <ItemComponent
                {...props}
                glyph="download"
                tooltipId={'toc.toolDownloadTooltip'}
                onClick={() => onClick({
                    url: layer.search?.url || layer.url,
                    name: layer.name,
                    id: layer.id
                })}
            />
        );
    }
    return null;
});

const LayerDownloadMenu = connect(null, {
    onClick: download
})(({
    onClick,
    itemComponent,
    layer,
    widgetId
}) => {
    const ItemComponent = itemComponent;
    return (
        <ItemComponent
            glyph="download"
            textId="widgets.widget.menu.downloadData"
            onClick={() => onClick({
                ...layer,
                widgetId
            })}
        />
    );
});

/**
 * Provides advanced data export functionalities using [WPS download process](https://docs.geoserver.org/stable/en/user/community/wps-download/index.html) or using WFS service, if WPS download process is missing.
 * @memberof plugins
 * @name LayerDownload
 * @class
 * @prop {object[]} formats An array of name-label objects for the allowed formats available. This object can contain an optional `validServices` entry, that contains an array of the  services where the formats should be used. If no "wfs" service is configured, the plugin will retrieve the list from the "WFS" service.
 * @prop {object[]} srsList An array of name-label objects for the allowed srs available. Use name:'native' to omit srsName param in wfs filter
 * @prop {string} defaultSrs Default selected srs
 * @prop {string} closeGlyph The icon to use for close the dialog
 * @prop {string} defaultSelectedService The service that should be used by default for downloading. Valid values: "wfs", "wps"
 * @prop {bool} hideServiceSelector hide service selector input from the user interface
 * @example
 * {
 *  "name": "LayerDownload",
 *  "cfg": {
 *    "formats": [
 *            {"name": "csv", "label": "csv"},
 *            {"name": "shape-zip", "label": "shape-zip", "validServices": ["wfs"]},
 *            {"name": "excel", "label": "excel", "validServices": ["wfs", "wps"]},
 *            {"name": "excel2007", "label": "excel2007"},
 *            {"name": "dxf-zip", "label": "dxf-zip"}
 *    ],
 *    "srsList": [
 *            {"name": "native", "label": "Native"},
 *            {"name": "EPSG:4326", "label": "WGS84"}
 *    ],
 *    "defaultSrs": "native",
 *    "defaultSelectedService": "wfs",
 *    "hideServiceSelector": true
 *  }
 * }
 * // it is possible to support GeoPackage format when the targeted GeoServer uses wps download extensions
 * // here an example of configuration that include GeoPackage for wps
 *
 *  {
 *      "name": "LayerDownload",
 *      "cfg": {
 *          "formats": [
 *              { "name": "application/json", "label": "GeoJSON", "type": "vector", "validServices": ["wps"] },
 *              { "name": "application/arcgrid", "label": "ArcGrid", "type": "raster", "validServices": ["wps"] },
 *              { "name": "image/tiff", "label": "TIFF", "type": "raster", "validServices": ["wps"] },
 *              { "name": "image/png", "label": "PNG", "type": "raster", "validServices": ["wps"] },
 *              { "name": "image/jpeg", "label": "JPEG", "type": "raster", "validServices": ["wps"]},
 *              { "name": "application/wfs-collection-1.0", label: "GML2", type: "vector", validServices: ["wps"]},
 *              { "name": "application/wfs-collection-1.1", label: "GML3", type: "vector", validServices: ["wps"]}
 *              { "name": "application/zip", "label": "Shapefile", "type": "vector", "validServices": ["wps"] },
 *              { "name": "text/csv", "label": "CSV", "type": "vector", "validServices": ["wps"] },
 *
 *              { "name": "application/geopackage+sqlite3", "label": "GeoPackage", "type": "vector", "validServices": ["wps"] },
 *              { "name": "application/geopackage+sqlite3", "label": "GeoPackage", "type": "raster", "validServices": ["wps"] }
 *          ]
 *      }
 *  }
 */
const LayerDownloadPlugin = createPlugin('LayerDownload', {
    component: connect(createStructuredSelector({
        filterObj: wfsFilterSelector,
        enabled: layerDonwloadControlEnabledSelector,
        downloadOptions: downloadOptionsSelector,
        loading: loadingSelector,
        wfsFormats: wfsFormatsSelector,
        formatsLoading: formatsLoadingSelector,
        mapLayer: getSelectedLayer,
        downloadLayer: downloadLayerSelector,
        wpsAvailable: wpsAvailableSelector,
        service: serviceSelector,
        checkingWPSAvailability: checkingWPSAvailabilitySelector,
        virtualScroll: state => state && state.featuregrid && state.featuregrid.virtualScroll,
        customAttributeSettings: customAttributesSettingsSelector,
        attributes: attributesSelector
    }), {
        onExport: downloadFeatures,
        onSetService: setService,
        onSetWPSAvailability: setWPSAvailability,
        onDownloadOptionChange,
        onClearDownloadOptions: clearDownloadOptions,
        onFormatOptionsFetch,
        onClose: () => toggleControl("layerdownload")
    })(DownloadDialog),
    containers: {
        Widgets: {
            doNotHide: true,
            name: "LayerDownload",
            target: "table-menu-download",
            position: 11,
            Component: LayerDownloadMenu
        },
        Dashboard: {
            doNotHide: true,
            name: "LayerDownload",
            target: "table-menu-download",
            position: 11,
            Component: LayerDownloadMenu
        },
        TOC: {
            doNotHide: true,
            name: "LayerDownload",
            target: "toolbar",
            Component: LayerDownloadButton,
            position: 11
        },
        FeatureEditor: {
            doNotHide: true,
            name: "LayerDownload",
            position: 20,
            target: "toolbar",
            Component: connect(createStructuredSelector({
                isDownloadOpen: state =>  state?.controls?.layerdownload?.enabled
            }), {
                onClick: () => toggleControl("layerdownload")
            })(FeatureEditorButton)
        },
        BrandNavbar: {
            doNotHide: true,
            name: "LayerDownload",
            target: 'right-menu',
            position: -1,
            Component: connect(createStructuredSelector({
                active: exportDataResultsControlEnabledSelector,
                showInfoBubble: showInfoBubbleSelector,
                infoBubbleMessage: infoBubbleMessageSelector,
                checkingExportDataEntries: checkingExportDataEntriesSelector,
                results: exportDataResultsSelector,
                currentLocale: currentLocaleSelector
            }), {
                onToggle: toggleControl.bind(null, 'exportDataResults', 'enabled'),
                onActive: checkExportDataEntries,
                onRemoveResult: removeExportDataResult
            })(ExportDataResultsComponent)
        }
    },
    epics,
    reducers: {
        layerdownload
    }
});

export default LayerDownloadPlugin;
