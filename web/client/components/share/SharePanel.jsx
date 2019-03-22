/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '../misc/Dialog';
import ShareSocials from './ShareSocials';
import ShareLink from './ShareLink';
import ShareEmbed from './ShareEmbed';
import ShareApi from './ShareApi';
import ShareQRCode from './ShareQRCode';
import { Glyphicon, Tabs, Tab, Checkbox } from 'react-bootstrap';
import Message from '../../components/I18N/Message';
import { join } from 'lodash';
import { removeQueryFromUrl } from '../../utils/ShareUtils';
import SwitchPanel from '../misc/switch/SwitchPanel';

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
        closeGlyph: PropTypes.string,
        version: PropTypes.string,
        bbox: PropTypes.object,
        hideAdvancedSettings: PropTypes.bool,
        settings: PropTypes.object,
        onUpdateSettings: PropTypes.func,
        selectedTab: PropTypes.string
    };

    static defaultProps = {
        title: <Message msgId="share.titlePanel"/>,
        onClose: () => {},
        shareUrlRegex: "(h[^#]*)#\\/viewer\\/([^\\/]*)\\/([A-Za-z0-9]*)",
        shareUrlReplaceString: "$1embedded.html#/$3",
        embedOptions: {},
        showAPI: true,
        closeGlyph: "1-close",
        settings: {},
        onUpdateSettings: () => {}
    };

    state = {
        eventKey: 1
    };

    componentWillMount() {
        const tabs = {
            link: 1,
            social: 2,
            embed: 3
        };
        const bbox = join(this.props.bbox, ',');
        this.setState({
            bbox,
            eventKey: tabs[this.props.selectedTab] || 1
        });
    }

    componentWillReceiveProps(newProps) {
        const bbox = join(this.props.bbox, ',');
        const newBbox = join(newProps.bbox, ',');
        if (bbox !== newBbox) {
            this.setState({
                bbox: newBbox
            });
        }
    }

    getShareUrl = () => {
        const shareUrl = removeQueryFromUrl(this.props.shareUrl);
        return (this.props.settings.bboxEnabled && !this.props.hideAdvancedSettings && this.state.bbox)
            ? `${shareUrl}?bbox=${this.state.bbox}`
            : shareUrl;
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
        const cleanShareUrl = this.getShareUrl();
        const shareUrl = cleanShareUrl || location.href;
        let shareEmbeddedUrl = cleanShareUrl || location.href;
        if (this.props.shareUrlRegex && this.props.shareUrlReplaceString) {
            shareEmbeddedUrl = this.generateUrl(shareEmbeddedUrl, this.props.shareUrlRegex, this.props.shareUrlReplaceString);
        }

        const shareApiUrl = this.props.shareApiUrl || cleanShareUrl || location.href;
        const social = <ShareSocials sharedTitle={this.props.sharedTitle} shareUrl={shareUrl} getCount={this.props.getCount}/>;
        const direct = <div><ShareLink shareUrl={shareUrl} bbox={this.props.bbox}/><ShareQRCode shareUrl={shareUrl}/></div>;
        const code = (<div><ShareEmbed shareUrl={shareEmbeddedUrl} {...this.props.embedOptions} />
        {this.props.showAPI ? <ShareApi baseUrl={shareApiUrl} shareUrl={shareUrl} shareConfigUrl={this.props.shareConfigUrl} version={this.props.version}/> : null}</div>);

        const tabs = (<Tabs defaultActiveKey={this.state.eventKey} id="sharePanel-tabs" onSelect={(eventKey) => this.setState({ eventKey })}>
            <Tab eventKey={1} title={<Message msgId="share.direct" />}>{this.state.eventKey === 1 && direct}</Tab>
            <Tab eventKey={2} title={<Message msgId="share.social" />}>{this.state.eventKey === 2 && social}</Tab>
            <Tab eventKey={3} title={<Message msgId="share.code" />}>{this.state.eventKey === 3 && code}</Tab>
          </Tabs>);

        let sharePanel =
            (<Dialog id="share-panel-dialog" className="modal-dialog modal-content share-win" style={{zIndex: 1993}}>
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
                    {!this.props.hideAdvancedSettings &&
                    <SwitchPanel
                        title={<Message msgId="share.advancedOptions"/>}
                        expanded={this.state.showAdvanced}
                        onSwitch={() => this.setState({ showAdvanced: !this.state.showAdvanced })}>
                        <Checkbox
                            checked={this.props.settings.bboxEnabled ? true : false}
                            onChange={() =>
                                this.props.onUpdateSettings({
                                    ...this.props.settings,
                                    bboxEnabled: !this.props.settings.bboxEnabled
                                })}>
                            <Message msgId="share.addBboxParam" />
                        </Checkbox>
                    </SwitchPanel>}
                </div>
            </Dialog>);

        return this.props.isVisible ? sharePanel : null;
    }
}

export default SharePanel;
