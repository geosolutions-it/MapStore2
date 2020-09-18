/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const ReactQuill = require('react-quill');
const ResizableModal = require('../../../misc/ResizableModal');
const Portal = require('../../../misc/Portal');
const Message = require('../../../I18N/Message');
const {Quill} = ReactQuill;
const {ResizeModule, IFrame, toolbarConfig} = require('../../../misc/quillmodules/ResizeModule')(Quill);

Quill.register({
    'formats/video': IFrame,
    'modules/resizeModule': ResizeModule
});

/**
 * Component for rendering FeatureInfoEditor a modal editor to modify format template
 * @memberof components.TOC.fragments.settings
 * @name FeatureInfoEditor
 * @class
 * @prop {object} element data of the current selected node
 * @prop {bool} showEditor show/hide modal
 * @prop {funciotn} onShowEditor called when click on close buttons
 * @prop {function} onChange called when text in editor has been changed
 * @prop {bool} enableIFrameModule enable iframe in editor, default true
 */

class FeatureInfoEditor extends React.Component {

    static propTypes = {
        showEditor: PropTypes.bool,
        element: PropTypes.object,
        onChange: PropTypes.func,
        onShowEditor: PropTypes.func,
        enableIFrameModule: PropTypes.bool
    };

    static defaultProps = {
        showEditor: false,
        element: {},
        enableIFrameModule: false,
        onChange: () => {},
        onShowEditor: () => {}
    };

    state = {
        template: ' '
    };

    UNSAFE_componentWillMount() {
        this.setState({
            template: this.props.element && this.props.element.featureInfo && this.props.element.featureInfo.template || ' '
        });
    }

    render() {
        const { showEditor, enableIFrameModule = true } = this.props;
        return (
            <Portal>
                <ResizableModal
                    fade
                    show={showEditor}
                    title={<Message msgId="layerProperties.editCustomFormat"/>}
                    size="lg"
                    showFullscreen
                    clickOutEnabled={false}
                    onClose={() => this.close()}
                    buttons={[
                        {
                            bsStyle: 'primary',
                            text: <Message msgId="close"/>,
                            onClick: () => this.close()
                        }
                    ]}>
                    <div id="ms-template-editor" className="ms-editor">
                        <ReactQuill
                            bounds="#ms-template-editor"
                            ref={(quill) => { if (quill) { this.quill = quill; } } }
                            modules={enableIFrameModule ? {
                                resizeModule: {},
                                toolbar: toolbarConfig
                            } : {}}
                            defaultValue={this.state.template}
                            onChange={template => this.setState({ template })}/>
                    </div>
                </ResizableModal>
            </Portal>
        );
    }

    close = () => {
        this.props.onShowEditor(!this.props.showEditor);
        this.props.onChange('featureInfo', {
            ...(this.props.element && this.props.element.featureInfo || {}),
            template: this.state.template
        });
    };
}

module.exports = FeatureInfoEditor;
