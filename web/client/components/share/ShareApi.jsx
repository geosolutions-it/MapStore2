/**
 * Copyright 2017, GeoSolutions Sas.
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
const {Glyphicon, Col, Grid, Row, Tooltip, Button} = require('react-bootstrap');
const OverlayTrigger = require('../misc/OverlayTrigger');
const {validateVersion} = require('../../selectors/version');
const {trim} = require('lodash');

// css required
require('./share.css');

const PropTypes = require('prop-types');

const codeApi = require('raw-loader!./api-template.raw');

class ShareApi extends React.Component {
    static propTypes = {
        shareUrl: PropTypes.string,
        shareConfigUrl: PropTypes.string,
        version: PropTypes.string
    };

    state = {copied: false};

    render() {
        const parsedCode = codeApi
          .replace('__BASE__URL__', this.props.shareUrl)
          .replace('__CONFIG__URL__', this.props.shareConfigUrl)
          .replace('__ORIGINAL_URL__', location.href)
          .replace('__VERSION__', validateVersion(this.props.version) ? '?' + trim(this.props.version) : '');
        const tooltip = (<Tooltip placement="bottom" className="in" id="tooltip-bottom" style={{zIndex: 2001}}>
                             {this.state.copied ? <Message msgId="share.msgCopiedUrl"/> : <Message msgId="share.msgToCopyUrl"/>}
                         </Tooltip>);
        const copyTo = (<OverlayTrigger placement="bottom" overlay={tooltip}>
                            <CopyToClipboard text={parsedCode} onCopy={ () => this.setState({copied: true}) } >
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
                             <Message msgId="share.apiLinkTitle"/>
                          </h4>
                      </Row>
                      <Row key="data" className="row-button">
                          <Col key="textarea" xs={10} sm={10} md={10}><textarea name="description" rows="6" value={parsedCode} enabled="false" readOnly /></Col>
                          <Col key="button" xs={2} sm={2} md={2}>
                              {copyTo}
                          </Col>
                      </Row>
                  </Grid>
            </div>
        );
    }
}

module.exports = ShareApi;
