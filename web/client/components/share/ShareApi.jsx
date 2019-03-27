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

import React from 'react';
import Message from '../../components/I18N/Message';
import { validateVersion } from '../../selectors/version';
import { trim } from 'lodash';
import ShareCopyToClipboard from './ShareCopyToClipboard';
import PropTypes from 'prop-types';
import codeApi from 'raw-loader!./api-template.raw';

class ShareApi extends React.Component {
    static propTypes = {
        baseUrl: PropTypes.string,
        shareUrl: PropTypes.string,
        shareConfigUrl: PropTypes.string,
        version: PropTypes.string
    };

    state = {copied: false};

    render() {
        const parsedCode = codeApi
            .replace('__BASE__URL__', this.props.baseUrl)
            .replace('__CONFIG__URL__', this.props.shareConfigUrl)
            .replace('__ORIGINAL_URL__', this.props.shareUrl)
            .replace('__VERSION__', validateVersion(this.props.version) ? '?' + trim(this.props.version) : '');

        return (
            <div className="input-link">
                <div className="input-link-head">
                    <h4>
                        <Message msgId="share.apiLinkTitle"/>
                    </h4>
                    <ShareCopyToClipboard
                        copied={this.state.copied}
                        shareUrl={parsedCode}
                        onCopy={() => this.setState({ copied: true })}
                        onMouseLeave={() => this.setState({ copied: false })}/>
                </div>
                <pre>
                    <code>
                        {parsedCode}
                    </code>
                </pre>
            </div>
        );
    }
}

export default ShareApi;
