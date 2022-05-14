/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { pick, get } from 'lodash';
import { connect } from 'react-redux';
import { compose, withState, defaultProps } from 'recompose';
import { createStructuredSelector } from 'reselect';

import Message from '../components/I18N/Message';
import HTML from '../components/I18N/HTML';

import { toggleControl } from '../actions/controls';
import { exportMap } from '../actions/mapexport';

import { createControlEnabledSelector } from '../selectors/controls';

import ExportPanel from '../components/export/ExportPanel';
import * as epics from '../epics/mapexport';
import {createPlugin} from "../utils/PluginsUtils";

const DEFAULTS = ["mapstore2", "wmc"];
const isEnabled = createControlEnabledSelector('export');

const enhanceExport = compose(
    connect(
        createStructuredSelector({
            enabled: isEnabled
        }), {
            onClose: () => toggleControl('export'),
            onExport: exportMap
        }
    ),
    defaultProps({
        formats: {
            mapstore2: {
                label: <Message msgId="mapExport.formats.mapstore2.label"/>,
                description: <HTML msgId="mapExport.formats.mapstore2.description"/>,
                glyph: 'ext-json'
            },
            wmc: {
                label: <Message msgId="mapExport.formats.wmc.label"/>,
                description: <HTML msgId="mapExport.formats.wmc.description"/>,
                note: <HTML msgId="mapExport.formats.wmc.note"/>,
                glyph: 'ext-wmc'
            }
        }
    }),
    withState('format', 'setFormat', 'mapstore2')

);

// TODO: add when more formats are supported
const MapExport = enhanceExport(
    ({
        enabled,
        format,
        formats,
        enabledFormats = DEFAULTS,
        setFormat = () => { },
        onExport = () => { },
        onClose = () => { }
    }) => {
        return (
            <ExportPanel
                show={enabled}
                formats={pick(formats, ...enabledFormats)}
                selectedFormat={format}
                onSelect={setFormat}
                onExport={onExport}
                onClose={onClose}/>
        );
    }
);

/**
 * Allows the user to export the current map in a file.
 * @memberof plugins
 * @class
 * @name MapExport
 * @property {string[]} cfg.enabledFormats the list of allowed formats. By default ["mapstore2", "wmc"]
 */
const MapExportPlugin = createPlugin('MapExport', {
    component: MapExport,
    options: {
        disablePluginIf: "{state('mapType') === 'cesium'}"
    },
    containers: {
        SidebarMenu: config => {
            const enabledFormats = get(config, 'cfg.enabledFormats', DEFAULTS);
            return {
                name: "export",
                position: 4,
                tooltip: "mapExport.tooltip",
                text: <Message msgId="mapExport.title" />,
                icon: <Glyphicon glyph="download" />,
                action: enabledFormats.length > 1 ?
                    () => toggleControl('export') :
                    () => exportMap(enabledFormats[0] || 'mapstore2'),
                priority: 1,
                toggle: true,
                doNotHide: true
            };
        },
        BurgerMenu: config => {
            const enabledFormats = get(config, 'cfg.enabledFormats', DEFAULTS);
            return {
                name: "export",
                position: 4,
                tooltip: "mapExport.tooltip",
                text: <Message msgId="mapExport.title" />,
                icon: <Glyphicon glyph="download" />,
                action: enabledFormats.length > 1 ?
                    () => toggleControl('export') :
                    () => exportMap(enabledFormats[0] || 'mapstore2'),
                priority: 2,
                toggle: true,
                doNotHide: true
            };
        }
    },
    epics: epics
});

export default MapExportPlugin;
