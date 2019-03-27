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
import { Checkbox } from 'react-bootstrap';
import ShareCopyToClipboard from './ShareCopyToClipboard';
import url from 'url';

class ShareEmbed extends React.Component {
    static propTypes = {
        shareUrl: PropTypes.string,
        showTOCToggle: PropTypes.bool
    };

    static defaultProps = {
        showTOCToggle: true,
        shareUrl: ''
    };

    state = {copied: false, forceDrawer: false};

    renderTools = () => {
        if (this.props.showTOCToggle) {
            return (<Checkbox checked={this.state.forceDrawer} onChange={() => this.setState({forceDrawer: !this.state.forceDrawer})}>
                <Message msgId="share.forceDrawer"/>
            </Checkbox>);
        }
        return null;
    };

    render() {
        const codeEmbedded = "<iframe style=\"border: none;\" height=\"400\" width=\"600\" src=\"" + this.generateUrl(this.props.shareUrl) + "\"></iframe>";
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
        return url.format(parsed);

    };
}

export default ShareEmbed;
