/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

 /** DESCRIPTION
  * SharePanel allow to share a piece of the current map in some different ways.
  * You can share it on socials networks, copy the direct link, copy the embedded
  * code or just using the QR code
  */

const React = require('react');
const Dialog = require('../misc/Dialog');
const ShareSocials = require('./ShareSocials');
const ShareLink = require('./ShareLink');
const ShareEmbed = require('./ShareEmbed');
const ShareQRCode = require('./ShareQRCode');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');
const Url = require('url');

let SharePanel = React.createClass({

    propTypes: {
        isVisible: React.PropTypes.bool,
        title: React.PropTypes.node,
        shareUrl: React.PropTypes.string,
        onClose: React.PropTypes.func,
        toggleControl: React.PropTypes.func,
        closeGlyph: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            title: <Message msgId="share.titlePanel"/>,
            toggleControl: () => {},
            onClose: () => {}
        };
    },
    render() {
        /* if the prop shareUrl is not defined it takes the url from location.href */
        let shareUrl = this.props.shareUrl || location.href;

        // ************************ START CHANGE URL PARAMATER ****************************
        /* if the parametere mode is present it should be changed into embedded
           here i modify the url for the embedded share */
        let urlParsed = Url.parse(shareUrl, true);
        urlParsed.search = null;
        if (urlParsed && urlParsed.query && urlParsed.query.mode) {
            urlParsed.query.mode = "embedded";
        }
        let urlformatted = Url.format(urlParsed);

        // ************************ END CHANGE URL PARAMATER ****************************
        let shareEmbeddedUrl = urlformatted;

        let sharePanel = (
            <Dialog id="share-panel-dialog" className="modal-dialog modal-content share-win">
                <span role="header">
                    <span className="share-panel-title">
                        <Message msgId="share.title"/>
                    </span>
                    <button onClick={this.props.toggleControl} className="print-panel-close close">
                        {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}
                    </button>
                </span>
                <div role="body" className="share-panels">
                    <ShareSocials shareUrl={shareUrl}/>
                    <ShareLink shareUrl={shareUrl}/>
                    <ShareEmbed shareUrl={shareEmbeddedUrl}/>
                    <ShareQRCode shareUrl={shareUrl}/>
                </div>
            </Dialog>);

        return this.props.isVisible ? sharePanel : null;
    }
});

module.exports = SharePanel;
