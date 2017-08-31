const PropTypes = require('prop-types');
/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
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

/**
 * SharePanel allow to share the current map in some different ways.
 * You can share it on socials networks(facebook,twitter,google+,linkedin)
 * copying the direct link
 * copying the embedded code
 * using the QR code with mobile apps
 * @class
 * @memberof components.share
 * @prop {boolean} [isVisible] display or hide
 * @prop {node} [title] the title of the page
 * @prop {string} [shareUrl] the url to use for share. by default location.href
 * @prop {string} [shareUrlRegex] reqular expression to parse the shareUrl to generate the final url, using shareUrlReplaceString
 * @prop {string} [shareUrlReplaceString] expression to be replaced by groups of the shareUrlRegex to get the final shareUrl to use for the iframe
 * @prop {string} [shareApiUrl] url for share API part
 * @prop {string} [shareConfigUrl] the url of the config to use for shareAPI
 * @prop {function} [onClose] function to call on close window event.
 * @prop {getCount} [getCount] function used to get the count for social links.
 */
class SharePanel extends React.Component {
    static propTypes = {
        isVisible: PropTypes.bool,
        title: PropTypes.node,
        sharedTitle: PropTypes.string,
        shareUrl: PropTypes.string,
        shareUrlRegex: PropTypes.string,
        shareUrlReplaceString: PropTypes.string,
        shareApiUrl: PropTypes.string,
        shareConfigUrl: PropTypes.string,
        embedOptions: PropTypes.object,
        showAPI: PropTypes.bool,
        onClose: PropTypes.func,
        getCount: PropTypes.func,
        closeGlyph: PropTypes.string
    };

    static defaultProps = {
        title: <Message msgId="share.titlePanel"/>,
        onClose: () => {},
        shareUrlRegex: "(h[^#]*)#\\/viewer\\/([^\\/]*)\\/([A-Za-z0-9]*)",
        shareUrlReplaceString: "$1embedded.html#/$3",
        embedOptions: {},
        showAPI: true,
        closeGlyph: "1-close"
    };

    generateUrl = (orig = location.href, pattern, replaceString) => {
        let regexp = new RegExp(pattern);
        if (orig.match(regexp)) {
            return orig.replace(regexp, replaceString);
        }
        return orig;
    };

    render() {
        // ************************ CHANGE URL PARAMATER FOR EMBED CODE ****************************
        /* if the property shareUrl is not defined it takes the url from location.href */
        const shareUrl = this.props.shareUrl || location.href;
        let shareEmbeddedUrl = this.props.shareUrl || location.href;
        if (this.props.shareUrlRegex && this.props.shareUrlReplaceString) {
            shareEmbeddedUrl = this.generateUrl(shareEmbeddedUrl, this.props.shareUrlRegex, this.props.shareUrlReplaceString);
        }
        const shareApiUrl = this.props.shareApiUrl || this.props.shareUrl || location.href;
        const social = <ShareSocials sharedTitle={this.props.sharedTitle} shareUrl={shareUrl} getCount={this.props.getCount}/>;
        const direct = <div><ShareLink shareUrl={shareUrl}/><ShareQRCode shareUrl={shareUrl}/></div>;
        const code = (<div><ShareEmbed shareUrl={shareEmbeddedUrl} {...this.props.embedOptions} />
        {this.props.showAPI ? <ShareApi shareUrl={shareApiUrl} shareConfigUrl={this.props.shareConfigUrl}/> : null}</div>);

        const tabs = (<Tabs defaultActiveKey={1} id="sharePanel-tabs">
            <Tab eventKey={1} title={<Message msgId="share.direct" />}>{direct}</Tab>
            <Tab eventKey={2} title={<Message msgId="share.social" />}>{social}</Tab>
            <Tab eventKey={3} title={<Message msgId="share.code" />}>{code}</Tab>
          </Tabs>);

        let sharePanel =
            (<Dialog id="share-panel-dialog" className="modal-dialog modal-content share-win">
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
}

module.exports = SharePanel;
