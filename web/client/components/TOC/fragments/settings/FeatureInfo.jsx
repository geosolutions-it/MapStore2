/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import Accordion from '../../../misc/panels/Accordion';
import { getSupportedFormat } from '../../../../api/WMS';
import Loader from '../../../misc/Loader';
import { Glyphicon } from 'react-bootstrap';
import Message from '../../../I18N/Message';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';

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

export default class extends React.Component {
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

    state = {
        loading: false
    };

    componentDidMount() {
        // we dont know supported infoFormats yet
        if (this.props.element.url && !this.props.element.infoFormats || this.props.element.infoFormats?.length === 0) {
            this.setState({ loading: true });
            getSupportedFormat(this.props.element.url, true)
                .then(({ infoFormats }) => {
                    this.props.onChange("infoFormats", infoFormats);
                    this.setState({ loading: false });
                })
                .catch(() => {
                    this.setState({ loading: false });
                });
        }
    }

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
        const data = this.getInfoFormat(this.supportedInfoFormats());
        return this.state.loading ? (
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <Loader size={150}/>
            </div>
        ) : (
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

    /**
     * Fetch the supported formats from the layer props if present
     * else use the default info format
     * @return {object} info formats
     */
    supportedInfoFormats = () => {
        const excludedFormatsWfs = ['TEXT', 'HTML'];
        const availableInfoFormats =  this.props.element?.infoFormats || [];
        const supportedWfsFormats = Object.fromEntries(Object.entries(this.props.defaultInfoFormat).filter(([key]) => !excludedFormatsWfs.includes(key)));
        const formats = this.props.element.type === 'wfs' ? supportedWfsFormats : this.props.defaultInfoFormat;
        const infoFormats = Object.assign({},
            ...Object.entries(formats)
                .filter(([, value])=> includes(availableInfoFormats, value))
                .map(([key, value])=> ({[key]: value}))
        );
        return isEmpty(infoFormats) ? formats : infoFormats;
    }
}
