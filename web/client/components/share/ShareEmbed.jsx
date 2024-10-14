/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*  DESCRIPTION
    This component contains the code and the button for copy the embedded code
    to the clipboard
*/

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import isEqual from 'lodash/isEqual';
import Message from '../../components/I18N/Message';
import { Checkbox, Row, Col, FormControl } from 'react-bootstrap';
import ShareCopyToClipboard from './ShareCopyToClipboard';
import url from 'url';
import localizeProps from '../misc/enhancers/localizedProps';

const Input = localizeProps('placeholder')(FormControl);
class ShareEmbed extends React.Component {
    static propTypes = {
        shareUrl: PropTypes.string,
        showTOCToggle: PropTypes.bool,
        showConnectionsParamToggle: PropTypes.bool,
        sizeOptions: PropTypes.object,
        selectedOption: PropTypes.string,
        allowFullScreen: PropTypes.bool
    };

    static defaultProps = {
        showTOCToggle: true,
        shareUrl: '',
        allowFullScreen: true
    };

    state = {
        copied: false,
        forceDrawer: false,
        connections: false,
        sizeOptions: {
            Small: { width: 600, height: 500 },
            Medium: { width: 800, height: 600},
            Large: { width: 1000, height: 800},
            Custom: {width: 0, height: 0}
        },
        selectedOption: 'Small'
    };

    componentDidMount() {
        if (this.props.sizeOptions && !isEqual(this.state.sizeOptions)) {
            this.setState({sizeOptions: this.props.sizeOptions, selectedOption: this.props.selectedOption || 'Small'});  // eslint-disable-line -- TODO: need to be fixed
        }
    }

    renderTools = () => {
        return (<>
            {this.props.showTOCToggle && <Checkbox
                checked={this.state.forceDrawer}
                onChange={() => this.setState({forceDrawer: !this.state.forceDrawer})}
            >
                <Message msgId="share.forceDrawer"/>
            </Checkbox>}
            {this.props.showConnectionsParamToggle && <Checkbox
                checked={this.state.connections}
                onChange={() => this.setState({
                    connections: !this.state.connections
                })}
            >
                <Message msgId="share.showConnections"/>
            </Checkbox>}
        </>);
    };

    render() {
        const {sizeOptions, selectedOption} = this.state;
        const height = selectedOption === "Custom" ? sizeOptions.Custom.height : sizeOptions[selectedOption]?.height;
        const width = selectedOption === "Custom" ? sizeOptions.Custom.width : sizeOptions[selectedOption]?.width;
        const codeEmbedded = `<iframe ${this.props.allowFullScreen ? 'allowFullScreen' : ''} style=\"border: none;\" height=\"${height || 0}\" width=\"${width || 0}\" src=\"${this.generateUrl(this.props.shareUrl)}\"></iframe>`;
        return (
            <div className="input-link">
                <div className="input-link-head">
                    <h4>
                        <Message msgId="share.embeddedLinkTitle"/>
                    </h4>
                    <ShareCopyToClipboard
                        copied={this.state.copied}
                        shareUrl={codeEmbedded}
                        onCopy={() => this.setState({ copied: true })}
                        onMouseLeave={() => this.setState({ copied: false })}/>
                </div>
                <div className="input-link-tools">
                    {this.renderTools()}
                </div>
                <Row className="size-options-row">
                    <Col md={4}>
                        <Select
                            clearable={false}
                            value={{value: sizeOptions[selectedOption], label: selectedOption}}
                            options={Object.keys(sizeOptions).map((key) => ({value: key, label: key}))}
                            onChange={(option) => this.setState({selectedOption: option?.value || ""})}
                        />
                    </Col>

                    {selectedOption === "Custom" &&  (<>
                        <Col md={4}>
                            <Input type="number" onChange={(event) => this.setState({sizeOptions: {
                                ...sizeOptions,
                                Custom: {...this.state.sizeOptions.Custom, width: event.target.value}
                            }})} placeholder="share.sizeOptions.width"/>
                        </Col>

                        <Col md={4}>
                            <Input type="number" onChange={(event) => this.setState({sizeOptions: {
                                ...sizeOptions,
                                Custom: {...this.state.sizeOptions.Custom, height: event.target.value}
                            }})} placeholder="share.sizeOptions.height"/>
                        </Col>
                    </>)}
                </Row>
                <pre>
                    <code>
                        {codeEmbedded}
                    </code>
                </pre>
            </div>
        );
    }

    generateUrl = () => {
        const parsed = url.parse(this.props.shareUrl, true);
        if (this.state.forceDrawer) {
            parsed.query.forceDrawer = true;
        }
        if (this.state.connections) {
            parsed.query.connections = true;
        }
        return url.format(parsed);

    };
}

export default ShareEmbed;
