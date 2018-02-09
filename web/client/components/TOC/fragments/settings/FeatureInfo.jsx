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
const Message = require('../../../I18N/Message');

/**
 * Component for rendering FeatureInfo an Accordion with current available format for get feature info
 * @memberof components.TOC.fragments.settings
 * @name FeatureInfo
 * @class
 * @prop {object} element data of the current selected node
 * @prop {array} defaultInfoFormat array of formats
 * @prop {object} formatCards object that represents the panels of accordion, e.g.: { FORMAT_NAME: { titleId: 'titleMsgId', descId: 'descMsgId', glyph: 'ext-empty', body: () => <div/> } }
 * @prop {function} onChange called when a format has been selected
 */

module.exports = class extends React.Component {
    static propTypes = {
        element: PropTypes.object,
        defaultInfoFormat: PropTypes.object,
        onChange: PropTypes.func,
        formatCards: PropTypes.object
    };

    static defaultProps = {
        element: {},
        defaultInfoFormat: [],
        onChange: () => {},
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
                body: Body && <Body template={this.props.element.featureInfo && this.props.element.featureInfo.template || ''} {...this.props}/> || null
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
            </span>
        );
    }
};
