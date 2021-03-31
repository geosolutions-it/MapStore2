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
import Message from '../../components/I18N/Message';
import { Checkbox, Row, Col, FormControl } from 'react-bootstrap';
import ShareCopyToClipboard from './ShareCopyToClipboard';
import url from 'url';
import Select from 'react-select';

class ShareEmbed extends React.Component {
    static propTypes = {
        shareUrl: PropTypes.string,
        showTOCToggle: PropTypes.bool,
        showConnectionsParamToggle: PropTypes.bool
    };

    static defaultProps = {
        showTOCToggle: true,
        shareUrl: ''
    };

    state = {
        copied: false,
        forceDrawer: false,
        connections: false,
        sizeOptions: {
            Small: { width: 400, height: 300 },
            Medium: { width: 600, height: 450},
            Large: { width: 800, height: 600},
            Custom: {width: 0, height: 0}
        },
        selectedOption: 'Small'
    };

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
        const codeEmbedded = "<iframe style=\"border: none;\" height=\"400\" width=\"600\" src=\"" + this.generateUrl(this.props.shareUrl) + "\"></iframe>";
        const {sizeOptions, selectedOption} = this.state;
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
                <Row>
                    <Col md={4}>
                        <Select
                            value={{value: sizeOptions[selectedOption], label: selectedOption}}
                            options={Object.keys(sizeOptions).map((key) => ({value: key, label: key}))}
                            onChange={(option) => this.setState({selectedOption: option?.value || ""})}
                        />
                    </Col>

                    {selectedOption === "Custom" &&  (<>
                        <Col md={4}>
                            <FormControl onChange={(width) => this.setState({sizeOptions: {
                                ...sizeOptions,
                                Custom: {...this.state.sizeOptions.Custom, width}
                            }})} placeholder="width"/>
                        </Col>

                        <Col md={4}>
                            <FormControl onChange={(height) => this.setState({sizeOptions: {
                                ...sizeOptions,
                                Custom: {...this.state.sizeOptions.Custom, height}
                            }})} placeholder="height"/>
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
