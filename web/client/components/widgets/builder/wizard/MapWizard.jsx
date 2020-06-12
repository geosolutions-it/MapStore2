/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const WidgetOptions = require('./common/WidgetOptions');
const {wizardHandlers} = require('../../../misc/wizard/enhancers');
const Wizard = wizardHandlers(require('../../../misc/wizard/WizardContainer'));

const MapOptions = require('./map/MapOptions');
const Preview = require('./map/PreviewMap');


module.exports = ({
    onChange = () => {}, onFinish = () => {}, setPage = () => {},
    step = 0,
    selectedNodes = [],
    onNodeSelect = () => {},
    editorData = {},
    editNode,
    setEditNode = () => {},
    closeNodeEditor = () => {},
    isLocalizedLayerStylesEnabled,
    env
} = {}) => (
    <Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        hideButtons>
        <MapOptions
            editNode={editNode}
            setEditNode={setEditNode}
            closeNodeEditor={closeNodeEditor}
            onNodeSelect={onNodeSelect}
            selectedNodes={selectedNodes}
            onChange={onChange}
            isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
            preview={<Preview
                onChange={onChange}
                layers={editorData.map && editorData.map.layers}
                map={editorData.map}
                env={env}
                options={{ style: { margin: 10, height: 'calc(100% - 20px)' } }} /> }
            map={editorData.map}
        />
        <WidgetOptions
            key="widget-options"
            data={editorData}
            onChange={onChange}
        />
    </Wizard>);
