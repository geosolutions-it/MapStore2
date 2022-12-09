/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';

import {wizardHandlers} from '../../../misc/wizard/enhancers';
import WizardContainer from '../../../misc/wizard/WizardContainer';
import WidgetOptions from './common/WidgetOptions';
import MapOptions from './map/MapOptions';
import Preview from './map/PreviewMap';
import MapSwitcher from "../wizard/map/MapSwitcher";
import EmptyView from '../../../misc/EmptyView';
import Message from "../../../I18N/Message";
const Wizard = wizardHandlers(WizardContainer);

export default ({
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
} = {}) => {
    const [selectedMap, setSelectedMap] = useState({});
    const [emptyMap, setEmptyMap] = useState(false);
    return (
        <Wizard
            step={step}
            setPage={setPage}
            onFinish={onFinish}
            hideButtons
            className={"map-options"}>
            <div>
                {emptyMap && <EmptyView
                    glyph={"1-map"}
                    title={<Message msgId="widgets.selectMap.emptyMap.title" />}
                    description={<Message msgId="widgets.selectMap.emptyMap.noNameDescription" />}
                />}
                <MapSwitcher
                    editorData={editorData}
                    onChange={onChange}
                    value={editorData.selectedMapId}
                    setSelectedMap={setSelectedMap}
                    selectedMap={selectedMap}
                    setEmptyMap={setEmptyMap}
                    emptyMap={emptyMap}
                    withContainer
                />
                {!emptyMap && <MapOptions
                    editNode={editNode}
                    setEditNode={setEditNode}
                    closeNodeEditor={closeNodeEditor}
                    onNodeSelect={onNodeSelect}
                    selectedNodes={selectedNodes}
                    onChange={onChange}
                    isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
                    preview={<Preview
                        key={editorData.selectedMapId}
                        onChange={onChange}
                        layers={selectedMap && selectedMap.layers}
                        map={selectedMap}
                        env={env}
                        options={{ style: { margin: 10, height: 'calc(100% - 20px)' } }} /> }
                    map={selectedMap}
                />}
            </div>
            <WidgetOptions
                key="widget-options"
                data={editorData}
                onChange={onChange}
            />

        </Wizard>);
};
