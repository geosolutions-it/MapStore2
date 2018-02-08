/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Accordion = require('../../../misc/panels/Accordion');
const {Glyphicon} = require('react-bootstrap');
const ReactQuill = require('react-quill');
const ResizableModal = require('../../../misc/ResizableModal');
const Portal = require('../../../misc/Portal');
const Message = require('../../../I18N/Message');

module.exports = class extends React.Component {
    static propTypes = {
        element: PropTypes.object,
        defaultInfoFormat: PropTypes.object,
        onChange: PropTypes.func,
        showEditor: PropTypes.bool,
        onShowEditor: PropTypes.func,
        formatCards: PropTypes.object
    };

    static defaultProps = {
        element: {},
        defaultInfoFormat: [],
        onChange: () => {},
        showEditor: false,
        onShowEditor: () => {},
        formatCards: {}
    };

    getInfoFormat = (infoFormats) => {
        return Object.keys(infoFormats).map((infoFormat) => {
            const Body = this.props.formatCards[infoFormat] && this.props.formatCards[infoFormat].body;
            return {
                id: infoFormat,
                head: {
                    preview: <Glyphicon glyph={this.props.formatCards[infoFormat] && this.props.formatCards[infoFormat].glyph || 'ext-empty'}/>,
                    title: this.props.formatCards[infoFormat] && this.props.formatCards[infoFormat].titleId && <Message msgId={this.props.formatCards[infoFormat].titleId}/> || '',
                    description: this.props.formatCards[infoFormat] && this.props.formatCards[infoFormat].descId && <Message msgId={this.props.formatCards[infoFormat].descId}/> || '',
                    size: 'sm'
                },
                body: <div><div><Message msgId="layerProperties.exampleOfResponse"/></div><br/>{Body && <Body template={this.props.element.featureInfo && this.props.element.featureInfo.template || ''} />}</div>
            };
        });
    }

    render() {
        // the selected value if missing on that layer should be set to the general info format value and not the first one.
        const data = this.getInfoFormat(this.props.defaultInfoFormat);
        return (
            <span>
                <Accordion
                    fillContainer
                    activePanel={this.props.element.featureInfo && this.props.element.featureInfo.format}
                    panels={data}
                    onSelect={value => {
                        const isEqualFormat = this.props.element.featureInfo && this.props.element.featureInfo.format && value === this.props.element.featureInfo.format;
                        this.props.onChange("featureInfo", {
                            ...(this.props.element && this.props.element.featureInfo || {}),
                            format: !isEqualFormat ? value : '',
                            viewer: this.props.element.featureInfo ? this.props.element.featureInfo.viewer : undefined
                        });
                    }}/>
                <Portal>
                    <ResizableModal
                        fade
                        show={this.props.showEditor}
                        title={<Message msgId="layerProperties.editCustomFormat"/>}
                        size="lg"
                        showFullscreen
                        clickOutEnabled={false}
                        onClose={() => this.props.onShowEditor(!this.props.showEditor)}
                        buttons={[
                            {
                                bsStyle: 'primary',
                                text: <Message msgId="close"/>,
                                onClick: () => this.props.onShowEditor(!this.props.showEditor)
                            }
                        ]}>
                        <div id="ms-template-editor" className="ms-editor">
                            <ReactQuill
                                bounds="#ms-template-editor"
                                defaultValue ={this.props.element.featureInfo && this.props.element.featureInfo.template || ''}
                                onChange={template => {
                                    this.props.onChange('featureInfo', {
                                        ...(this.props.element && this.props.element.featureInfo || {}),
                                        template
                                    });
                                }}/>
                        </div>
                    </ResizableModal>
                </Portal>
            </span>
        );
    }
};
