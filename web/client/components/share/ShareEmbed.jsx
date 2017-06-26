const PropTypes = require('prop-types');
/**
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

// components required
const React = require('react');
const CopyToClipboard = require('react-copy-to-clipboard');
const Message = require('../../components/I18N/Message');
const {Glyphicon, Col, Grid, Row, Tooltip, Button, Checkbox} = require('react-bootstrap');
const OverlayTrigger = require('../misc/OverlayTrigger');

const url = require('url');
// css required
require('./share.css');

class ShareEmbed extends React.Component {
    static propTypes = {
        shareUrl: PropTypes.string,
        showTOCToggle: PropTypes.bool
    };

    static defaultProps = {
        showTOCToggle: true
    };

    state = {copied: false, forceDrawer: false};

    renderTools = () => {
        if (this.props.showTOCToggle) {
            return (<Checkbox checked={this.state.forceDrawer} onChange={() => this.setState({forceDrawer: !this.state.forceDrawer})}>
                  <Message msgId="share.forceDrawer"/>
               </Checkbox>);
        }
    };

    render() {

        const codeEmbedded = "<iframe style=\"border: none;\" height=\"400\" width=\"600\" src=\"" + this.generateUrl(this.props.shareUrl) + "\"></iframe>";
        const tooltip = (<Tooltip placement="bottom" className="in" id="tooltip-bottom" style={{zIndex: 2001}}>
                             {this.state.copied ? <Message msgId="share.msgCopiedUrl"/> : <Message msgId="share.msgToCopyUrl"/>}
                         </Tooltip>);
        const copyTo = (<OverlayTrigger placement="bottom" overlay={tooltip}>
                            <CopyToClipboard text={codeEmbedded} onCopy={ () => this.setState({copied: true}) } >
                                <Button className="buttonCopyTextArea" bsStyle="info" bsSize="large">
                                    <Glyphicon glyph="copy" onMouseLeave={() => {this.setState({copied: false}); }} />
                                </Button>
                            </CopyToClipboard>
                        </OverlayTrigger>);
        return (
            <div className="input-link">
                <Grid className="embed-box" fluid>
                    <Row key="title">
                          <h4>
                             <Message msgId="share.embeddedLinkTitle"/>
                          </h4>
                          {this.renderTools()}
                      </Row>
                      <Row key="data" className="row-button">
                          <Col key="textarea" xs={10} sm={10} md={10}><textarea name="description" rows="6" value={codeEmbedded} enabled="false" readOnly /></Col>
                          <Col key="button" xs={2} sm={2} md={2}>
                              {copyTo}
                          </Col>
                      </Row>
                  </Grid>
            </div>
        );
    }

    generateUrl = () => {
        const parsed = url.parse(this.props.shareUrl, true);
        if (this.state.forceDrawer) {
            parsed.query.forceDrawer = true;
        }
        return url.format(parsed);

    };
}

module.exports = ShareEmbed;
