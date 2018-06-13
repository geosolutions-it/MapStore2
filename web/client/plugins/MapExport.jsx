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
const { exportMap } = require('../actions/export');


const { createControlEnabledSelector } = require('../selectors/controls');
const isEnabled = createControlEnabledSelector('export');

const assign = require('object-assign');
const { Glyphicon, Button } = require('react-bootstrap');

const Dialog = require('../components/misc/StandardDialog');
const Select = require('react-select');

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
            { value: 'mapstore2', label: <Message msgId="mapExport.formats.legacyMapStore2" /> },
            { value: 'OWSContext', label: <Message msgId="mapExport.formats.OWSContext" /> }
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

module.exports = {
    MapExportPlugin: assign(MapExport, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'export',
            position: 4,
            text: <Message msgId="mapExport.title" />,
            icon: <Glyphicon glyph="download" />,
            // action: toggleControl.bind(null, 'export', null),
            action: () => exportMap(),
            priority: 2,
            doNotHide: true
        }
    }),
    epics: require('../epics/export')
};
