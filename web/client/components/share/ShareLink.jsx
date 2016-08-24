/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*  DESCRIPTION
    This component contain an input field for holding the url and an icon to
    copy to the clipbard the relatie url.
*/

// components required
const React = require('react');
const CopyToClipboard = require('react-copy-to-clipboard');
const Message = require('../../components/I18N/Message');
const {Glyphicon, Input, Tooltip, OverlayTrigger, Button} = require('react-bootstrap');

// css required
require('./share.css');

const ShareLink = React.createClass({
    propTypes: {
        shareUrl: React.PropTypes.string
    },
    getInitialState() {
        return {copied: false};
    },
    render() {
        const tooltip = (<Tooltip placement="bottom" className="in" id="tooltip-bottom">
          {this.state.copied ? <Message msgId="share.msgCopiedUrl"/> : <Message msgId="share.msgToCopyUrl"/>}
      </Tooltip>);
        const copyTo = (<OverlayTrigger placement="bottom" overlay={tooltip}>
                            <CopyToClipboard text={this.props.shareUrl} onCopy={ () => this.setState({copied: true}) } >
                                <Button className="buttonCopy" bsStyle="info" bsSize="large" onMouseLeave={() => {this.setState({copied: false}); }} >
                                    <Glyphicon glyph="copy"/>
                                </Button>
                            </CopyToClipboard>
                        </OverlayTrigger>);
        return (
            <div className="input-link">
                  <h4>
                     <Message msgId="share.directLinkTitle"/>
                  </h4>
                  <Input ref="copytext" type="text" value={this.props.shareUrl} addonAfter={copyTo} readOnly/>
            </div>
        );
    }
});

module.exports = ShareLink;
