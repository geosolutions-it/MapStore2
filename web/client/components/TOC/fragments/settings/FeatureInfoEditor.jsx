/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactQuill = require('react-quill');
const ResizableModal = require('../../../misc/ResizableModal');
const Portal = require('../../../misc/Portal');
const Message = require('../../../I18N/Message');

/**
 * Component for rendering FeatureInfoEditor a modal editor to modify format template
 * @memberof components.TOC.fragments.settings
 * @name FeatureInfoEditor
 * @class
 * @prop {object} element data of the current selected node
 * @prop {bool} showEditor show/hide modal
 * @prop {funciotn} onShowEditor called when click on close buttons
 * @prop {function} onChange called when text in editor has been changed
 */

module.exports = ({onShowEditor = () => {}, showEditor, element = {}, onChange = () => {}}) =>(
    <Portal>
        <ResizableModal
            fade
            show={showEditor}
            title={<Message msgId="layerProperties.editCustomFormat"/>}
            size="lg"
            showFullscreen
            clickOutEnabled={false}
            onClose={() => onShowEditor(!showEditor)}
            buttons={[
                {
                    bsStyle: 'primary',
                    text: <Message msgId="close"/>,
                    onClick: () => onShowEditor(!showEditor)
                }
            ]}>
            <div id="ms-template-editor" className="ms-editor">
                <ReactQuill
                    bounds="#ms-template-editor"
                    defaultValue={element.featureInfo && element.featureInfo.template || ' '}
                    onChange={template => {
                        onChange('featureInfo', {
                            ...(element && element.featureInfo || {}),
                            template
                        });
                    }}/>
            </div>
        </ResizableModal>
    </Portal>
);
