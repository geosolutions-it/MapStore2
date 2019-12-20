/*
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

import React from 'react';
import PropTypes from 'prop-types';
import Message from '../../components/I18N/Message';
import ShareCopyToClipboard from './ShareCopyToClipboard';
import { FormControl } from 'react-bootstrap';

class ShareLink extends React.Component {

    static propTypes = {
        shareUrl: PropTypes.string
    };

    state = {
        copied: false
    };

    render() {
        return (
            <div className="input-link">
                <div className="input-link-head">
                    <h4>
                        <Message msgId="share.directLinkTitle"/>
                    </h4>
                    <ShareCopyToClipboard
                        copied={this.state.copied}
                        shareUrl={this.props.shareUrl}
                        onCopy={() => this.setState({ copied: true })}
                        onMouseLeave={() => this.setState({ copied: false })}/>
                </div>
                <pre style={{ padding: 0 }}>
                    <FormControl
                        readOnly
                        type="text"
                        value={this.props.shareUrl}
                        onFocus={ev => ev.target.select()}/>
                </pre>
            </div>
        );
    }
}

export default ShareLink;
