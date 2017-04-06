/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

 /** DESCRIPTION
  * SharePanel allow to share the current map in some different ways.
  * You can share it on socials networks(facebook,twitter,google+,linkedin)
  * copying the direct link
  * copying the embedded code
  * using the QR code with mobile apps
  */

const React = require('react');
const Dialog = require('../misc/Dialog');
const ShareSocials = require('./ShareSocials');
const ShareLink = require('./ShareLink');
const ShareEmbed = require('./ShareEmbed');
const ShareApi = require('./ShareApi');
const ShareQRCode = require('./ShareQRCode');
const {Glyphicon, Tabs, Tab} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');

let SharePanel = React.createClass({

    propTypes: {
        isVisible: React.PropTypes.bool,
        title: React.PropTypes.node,
        shareUrl: React.PropTypes.string,
        shareEmbeddedUrl: React.PropTypes.string,
        shareApiUrl: React.PropTypes.string,
        shareConfigUrl: React.PropTypes.string,
        onClose: React.PropTypes.func,
        getCount: React.PropTypes.func,
        closeGlyph: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            title: <Message msgId="share.titlePanel"/>,
            onClose: () => {},
            closeGlyph: "1-close"
        };
    },
    render() {
        // ************************ CHANGE URL PARAMATER FOR EMBED CODE ****************************
        /* if the property shareUrl is not defined it takes the url from location.href */
        const shareUrl = this.props.shareUrl || location.href;
        const shareEmbeddedUrl = this.props.shareEmbeddedUrl || this.props.shareUrl || location.href;
        const shareApiUrl = this.props.shareApiUrl || this.props.shareUrl || location.href;
        const social = <ShareSocials shareUrl={shareUrl} getCount={this.props.getCount}/>;
        const direct = (<div><ShareLink shareUrl={shareUrl}/><ShareQRCode shareUrl={shareUrl}/></div>);
        const code = (<div><ShareEmbed shareUrl={shareEmbeddedUrl}/>
        <ShareApi shareUrl={shareApiUrl} shareConfigUrl={this.props.shareConfigUrl}/></div>);

        const tabs = (<Tabs defaultActiveKey={1} id="sharePanel-tabs">
            <Tab eventKey={1} title={<Message msgId="share.direct" />}>{direct}</Tab>
            <Tab eventKey={2} title={<Message msgId="share.social" />}>{social}</Tab>
            <Tab eventKey={3} title={<Message msgId="share.code" />}>{code}</Tab>
          </Tabs>);

        let sharePanel = (
            <Dialog id="share-panel-dialog" className="modal-dialog modal-content share-win">
                <span role="header">
                    <span className="share-panel-title">
                        <Message msgId="share.title"/>
                    </span>
                    <button onClick={this.props.onClose} className="share-panel-close close">
                        {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}
                    </button>
                </span>
                <div role="body" className="share-panels">
                    {tabs}
                </div>
            </Dialog>);

        return this.props.isVisible ? sharePanel : null;
    }
});

module.exports = SharePanel;
