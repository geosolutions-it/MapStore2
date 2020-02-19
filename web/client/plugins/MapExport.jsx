/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const { compose, withState, defaultProps } = require('recompose');
const { createStructuredSelector } = require('reselect');
const Message = require('./locale/Message');

const { toggleControl } = require('../actions/controls');
const { exportMap } = require('../actions/mapexport');


const { createControlEnabledSelector } = require('../selectors/controls');
const isEnabled = createControlEnabledSelector('export');

const assign = require('object-assign');
const { Glyphicon, Button } = require('react-bootstrap');

const Dialog = require('../components/misc/StandardDialog');
const Select = require('react-select');
import * as epics from '../epics/mapexport';

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
        formatOptions: [
            { value: 'mapstore2', label: <Message msgId="mapExport.formats.mapstore2" /> },
            { value: 'wmc', label: <Message msgId="mapExport.formats.wmc" /> }
        ]
    }),
    withState('format', 'setFormat', 'mapstore2'),

);

// TODO: add when more formats are supported
const MapExport = enhanceExport(
    ({
        enabled,
        format,
        formatOptions,
        setFormat = () => { },
        onExport = () => { },
        onClose = () => { }
    }) => <Dialog
        modal
        draggable={false}
        style={{ width: 450 }}
        footer={<Button onClick={() => onExport(format)}>Export</Button>}
        show={enabled} onClose={onClose} >
        <Select
            value={format}
            onChange={opt => setFormat(opt.value)}
            name="form-field-name"
            options={formatOptions}
        />
    </Dialog>
);

const MapExportPlugin = {
    MapExportPlugin: assign(MapExport, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'export',
            position: 4,
            text: <Message msgId="mapExport.title" />,
            icon: <Glyphicon glyph="download" />,
            children: [{
                name: 'export-mapstore2',
                text: <Message msgId="mapExport.formats.mapstore2.label"/>,
                tooltip: 'mapExport.formats.mapstore2.tooltip',
                icon: <Glyphicon glyph="download"/>,
                action: () => exportMap('mapstore2')
            }, {
                name: 'export-wmc',
                text: <Message msgId="mapExport.formats.wmc.label"/>,
                tooltip: 'mapExport.formats.wmc.tooltip',
                icon: <Glyphicon glyph="download"/>,
                action: () => exportMap('wmc')
            }],
            priority: 2,
            doNotHide: true
        }
    }),
    epics: epics
};

export default MapExportPlugin;
