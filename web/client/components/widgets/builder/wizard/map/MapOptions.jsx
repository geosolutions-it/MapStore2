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
const React = require('react');
const {compose, withProps} = require('recompose');
const StepHeader = require('../../../../misc/wizard/StepHeader');
const emptyState = require('../../../../misc/enhancers/emptyState');
const localizeStringMap = require('../../../../misc/enhancers/localizeStringMap');
const Message = require('../../../../I18N/Message');
const TOC = emptyState(
    ({ map = {} } = {}) => !map.layers || (map.layers || []).filter(l => l.group !== 'background').length === 0,
    () => ({
        glyph: "1-layer",
        title: <Message msgId="widgets.selectMap.TOC.noLayerTitle" />,
        description: <Message msgId="widgets.selectMap.TOC.noLayerDescription" />
    })
)(require('./TOC'));
const nodeEditor = require('./enhancers/nodeEditor');
const Editor = nodeEditor(require('./NodeEditor'));
const EditorTitle = compose(
    nodeEditor,
    withProps(({selectedNode: layer}) => ({
        title: layer && layer.title
    })),
    localizeStringMap('title')
)(StepHeader);


module.exports = ({ preview, map = {}, onChange = () => { }, selectedNodes = [], onNodeSelect = () => { }, editNode, closeNodeEditor = () => { }, isLocalizedLayerStylesEnabled }) => (<div>
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
