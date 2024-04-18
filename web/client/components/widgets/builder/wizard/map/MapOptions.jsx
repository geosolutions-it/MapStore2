/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {compose, withProps} from 'recompose';

import Message from '../../../../I18N/Message';
import emptyState from '../../../../misc/enhancers/emptyState';
import localizeStringMap from '../../../../misc/enhancers/localizeStringMap';
import StepHeader from '../../../../misc/wizard/StepHeader';
import nodeEditor from './enhancers/nodeEditor';
import NodeEditorComp from './NodeEditor';
import TOCComp from './TOC';

const TOC = emptyState(
    ({ map = {} } = {}) => !map.layers || (map.layers || []).filter(l => l.group !== 'background').length === 0,
    () => ({
        glyph: "1-layer",
        title: <Message msgId="widgets.selectMap.TOC.noLayerTitle" />,
        description: <Message msgId="widgets.selectMap.TOC.noLayerDescription" />
    })
)(TOCComp);

const Editor = nodeEditor(NodeEditorComp);
const EditorTitle = compose(
    nodeEditor,
    withProps(({selectedNode: layer}) => ({
        title: layer && layer.title
    })),
    localizeStringMap('title')
)(StepHeader);


export default ({ preview, map = {}, onChange = () => { }, selectedNodes = [], onNodeSelect = () => { }, editNode, closeNodeEditor = () => { }, isLocalizedLayerStylesEnabled }) => (<div>
    <StepHeader title={<Message msgId={`widgets.builder.wizard.configureMapOptions`} />} />
    <div key="sample" style={{marginTop: 10}}>
        <StepHeader title={<Message msgId={`widgets.builder.wizard.preview`} />} />
        <div style={{ width: "100%", height: "200px"}}>
            {preview}
        </div>
    </div>
    {editNode
        ? [<EditorTitle map={map} editNode={editNode} />,
            <Editor
                closeNodeEditor={closeNodeEditor}
                editNode={editNode}
                map={map}
                onChange={onChange}
                isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled} />
        ] : [<StepHeader title={<Message msgId={`layers`} />} />, <TOC
            selectedNodes={selectedNodes}
            onSelect={onNodeSelect}
            onChange={onChange}
            map={map} />]}
</div>);
