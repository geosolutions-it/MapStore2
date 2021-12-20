/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import React from 'react';
import PropTypes from 'prop-types';
import ShareSocials from './ShareSocials';
import ShareLink from './ShareLink';
import ShareEmbed from './ShareEmbed';
import ShareApi from './ShareApi';
import ShareQRCode from './ShareQRCode';
import {
    Glyphicon,
    Tabs,
    Tab,
    Checkbox,
    FormControl,
    FormGroup,
    ControlLabel,
    Tooltip
} from 'react-bootstrap';
import Message from '../../components/I18N/Message';
import { join, isNil, isEqual, inRange, isEmpty } from 'lodash';
import { removeQueryFromUrl, getSharedGeostoryUrl, CENTERANDZOOM, BBOX, MARKERANDZOOM, SHARE_TABS } from '../../utils/ShareUtils';
import { getLonLatFromPoint } from '../../utils/CoordinatesUtils';
import { getMessageById } from '../../utils/LocaleUtils';
import SwitchPanel from '../misc/switch/SwitchPanel';
import Editor from '../data/identify/coordinates/Editor';
import {set} from '../../utils/ImmutableUtils';
import OverlayTrigger from '../misc/OverlayTrigger';
import ResizableModal from '../misc/ResizableModal';

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
 * @prop {boolean} [embedPanel=true] if false, hide the embed tab.
 * @prop {object} [embedOptions] options to pass to the embed tab.(`showTOCToggle` - if false hides the 'show TOC' checkbox (used only by map))
 * @prop {string} [shareApiUrl] url for share API part
 * @prop {string} [shareConfigUrl] the url of the config to use for shareAPI
 * @prop {function} [onClose] function to call on close window event.
 * @prop {getCount} [getCount] function used to get the count for social links.
 * @prop {object} [advancedSettings] object with properties/settings for bbox, coordinates, zoom, marker, hideInTab
 */
class SharePanel extends React.Component {
    static propTypes = {
        isVisible: PropTypes.bool,
        title: PropTypes.node,
        modal: PropTypes.bool,
        draggable: PropTypes.bool,
        sharedTitle: PropTypes.string,
        shareUrl: PropTypes.string,
        shareUrlRegex: PropTypes.string,
        shareUrlReplaceString: PropTypes.string,
        shareApiUrl: PropTypes.string,
        shareConfigUrl: PropTypes.string,
        embedPanel: PropTypes.bool,
        embedOptions: PropTypes.object,
        showAPI: PropTypes.bool,
        onClose: PropTypes.func,
        getCount: PropTypes.func,
        closeGlyph: PropTypes.string,
        version: PropTypes.string,
        bbox: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
        advancedSettings: PropTypes.oneOfType([
            PropTypes.shape({
                bbox: PropTypes.bool,
                homeButton: PropTypes.bool,
                centerAndZoom: PropTypes.bool,
                defaultEnabled: PropTypes.bool,
                hideInTab: PropTypes.string
            }),
            PropTypes.bool
        ]),
        settings: PropTypes.object,
        onUpdateSettings: PropTypes.func,
        selectedTab: PropTypes.string,
        formatCoords: PropTypes.string,
        point: PropTypes.object,
        isScrollPosition: PropTypes.bool,
        hideMarker: PropTypes.func,
        addMarker: PropTypes.func
    };

    static defaultProps = {
        title: <Message msgId="share.titlePanel"/>,
        modal: false,
        draggable: true,
        onClose: () => {},
        shareUrlRegex: "(h[^#]*)#\\/viewer\\/([^\\/]*)\\/([A-Za-z0-9]*)",
        shareUrlReplaceString: "$1embedded.html#/$3",
        embedPanel: true,
        embedOptions: {},
        showAPI: true,
        closeGlyph: "1-close",
        settings: {},
        onUpdateSettings: () => {},
        formatCoords: "decimal",
        isScrollPosition: false,
        hideMarker: () => {},
        addMarker: () => {}
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    state = {
        eventKey: 1,
        showAdvanced: true,
        defaultLoaded: false
    };

    UNSAFE_componentWillMount() {
        const bbox = join(this.props.bbox, ',');
        const coordinate = this.getCoordinates(this.props);
        this.setState({
            bbox,
            eventKey: SHARE_TABS[this.props.selectedTab] || 1,
            zoom: this.props.zoom,
            coordinate
        });
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (!isEqual(this.props.zoom, newProps.zoom) ||
            !isEqual(this.props.point, newProps.point) ||
            !isEqual(this.props.center, newProps.center) ||
            !isEqual(this.props.bbox, newProps.bbox) ||
            !isEqual(this.props.isVisible, newProps.isVisible)) {
            this.initializeDefaults(newProps);
        }
    }

    componentDidUpdate(prevProps) {
        const {settings = {}, isVisible, hideMarker, addMarker} = this.props || {};
        if (!isEqual(settings.markerEnabled, prevProps.settings.markerEnabled) && isVisible) {
            const [lng, lat] = this.state.coordinate;
            let newPoint = set('latlng.lng', lng, set('latlng.lat', lat, this.props.point));
            settings.markerEnabled ? addMarker(newPoint) : hideMarker();
        }
    }

    initializeDefaults = (props) => {
        const coordinate = this.getCoordinates(props);
        const {settings = {}, advancedSettings = {}, zoom, isVisible, onUpdateSettings, bbox: newBbox = []} = props || {};
        const isCenterAndZoomDefault = advancedSettings.centerAndZoom && advancedSettings.defaultEnabled === CENTERANDZOOM || false;
        const isMarkerAndZoomDefault = advancedSettings.centerAndZoom && advancedSettings.defaultEnabled === MARKERANDZOOM || false;
        const enableDefaultBBox = advancedSettings.bbox && advancedSettings.defaultEnabled === BBOX || false;

        // Default option to be enabled upon opening Share panel (if any)
        if (!this.state.defaultLoaded && props.isVisible) {
            onUpdateSettings({
                ...settings,
                centerAndZoomEnabled: isCenterAndZoomDefault || isMarkerAndZoomDefault,
                markerEnabled: isMarkerAndZoomDefault,
                bboxEnabled: enableDefaultBBox
            });
        }
        this.setState({
            bbox: join(newBbox, ','),
            zoom,
            coordinate,
            defaultLoaded: isVisible,
            isCenterAndZoomDefault,
            isMarkerAndZoomDefault
        });
    }

    getShareUrl = () => {
        const { settings, advancedSettings } = this.props;
        const shouldRemoveSectionId = !settings.showSectionId && advancedSettings && advancedSettings.sectionId;
        let shareUrl = getSharedGeostoryUrl(removeQueryFromUrl(this.props.shareUrl), shouldRemoveSectionId);
        if (settings.bboxEnabled && advancedSettings && advancedSettings.bbox && this.state.bbox) shareUrl = `${shareUrl}?bbox=${this.state.bbox}`;
        if (settings.showHome && advancedSettings && advancedSettings.homeButton) shareUrl = `${shareUrl}?showHome=true`;
        if (settings.centerAndZoomEnabled && advancedSettings && advancedSettings.centerAndZoom) {
            shareUrl = `${shareUrl}${settings.markerEnabled ? "?marker=" : "?center="}${this.state.coordinate}&zoom=${this.state.zoom}`;
        }
        return shareUrl;
    };

    generateUrl = (orig = location.href, pattern, replaceString) => {
        let regexp = new RegExp(pattern);
        if (orig.match(regexp)) {
            return orig.replace(regexp, replaceString);
        }
        return orig;
    };

    render() {
        // ************************ CHANGE URL PARAMETER FOR EMBED CODE ****************************
        /* if the property shareUrl is not defined it takes the url from location.href */
        const cleanShareUrl = this.getShareUrl();
        const shareUrl = cleanShareUrl || location.href;
        let shareEmbeddedUrl = cleanShareUrl || location.href;
        if (this.props.shareUrlRegex && this.props.shareUrlReplaceString) {
            shareEmbeddedUrl = this.generateUrl(shareEmbeddedUrl, this.props.shareUrlRegex, this.props.shareUrlReplaceString);
        }
        const currentTab = !this.props.embedPanel && this.state.eventKey === 3 ? 1 : this.state.eventKey; // fallback to tab link if embed is disabled and selected at the same time
        const shareApiUrl = this.props.shareApiUrl || cleanShareUrl || location.href;
        const social = <ShareSocials sharedTitle={this.props.sharedTitle} shareUrl={shareUrl} getCount={this.props.getCount}/>;
        const direct = <div><ShareLink shareUrl={shareUrl} bbox={this.props.bbox}/><ShareQRCode shareUrl={shareUrl}/></div>;
        const code = (<div><ShareEmbed shareUrl={shareEmbeddedUrl} {...this.props.embedOptions} />
            {this.props.showAPI ? <ShareApi baseUrl={shareApiUrl} shareUrl={shareUrl} shareConfigUrl={this.props.shareConfigUrl} version={this.props.version}/> : null}</div>);

        const tabs = (<Tabs defaultActiveKey={currentTab} id="sharePanel-tabs" onSelect={(eventKey) => this.setState({ eventKey })}>
            <Tab eventKey={1} title={<Message msgId="share.direct" />}>{currentTab === 1 && direct}</Tab>
            <Tab eventKey={2} title={<Message msgId="share.social" />}>{currentTab === 2 && social}</Tab>
            {this.props.embedPanel ? <Tab eventKey={3} title={<Message msgId="share.code" />}>{currentTab === 3 && code}</Tab> : null}
        </Tabs>);
        let sharePanel =
            (<ResizableModal
                id={this.props.modal ? "share-panel-dialog-modal" : "share-panel-dialog"}
                title={getMessageById(this.context.messages, "share.title")}
                dialogClassName=" share-win"
                bodyClassName="share-panel-modal-body"
                show={this.props.isVisible}
                draggable={this.props.draggable}
                style={{zIndex: 1993}}
                onClose={this.props.onClose}>
                <div role="body" className="share-panels">
                    {tabs}
                    {!isEmpty(this.props.advancedSettings)
                        && currentTab !== SHARE_TABS[this.props?.advancedSettings?.hideInTab]
                        && this.renderAdvancedSettings()
                    }
                </div>
            </ResizableModal>);
        return sharePanel;
    }

    getCoordinates = (props) => {
        const lonLat = getLonLatFromPoint(props.point);
        const {x, y} = props.center || {x: "", y: ""};
        const isValidLatLng = lonLat.filter(coord=> coord !== null);
        return isValidLatLng.length > 0 ? lonLat : [x, y];
    }

    setMarkerSetting = () => {
        const {isCenterAndZoomDefault, isMarkerAndZoomDefault} = this.state || {};
        const {centerAndZoomEnabled} = this.props?.settings || {};
        let markerSetting = {};
        if ((isCenterAndZoomDefault && centerAndZoomEnabled) || centerAndZoomEnabled) {
            markerSetting = { markerEnabled: false};
        } else if (isMarkerAndZoomDefault) {
            markerSetting = {markerEnabled: !this.props.settings.centerAndZoomEnabled};
        }
        return markerSetting;
    }

    renderAdvancedSettings = () => {
        return (
            <SwitchPanel
                title={<Message msgId="share.advancedOptions"/>}
                expanded={this.state.showAdvanced}
                onSwitch={() => this.setState({ showAdvanced: !this.state.showAdvanced })}>
                {this.props.advancedSettings.bbox && <Checkbox
                    checked={this.props.settings.bboxEnabled}
                    onChange={() =>
                        this.props.onUpdateSettings({
                            ...this.props.settings,
                            bboxEnabled: !this.props.settings.bboxEnabled,
                            centerAndZoomEnabled: false,
                            markerEnabled: false
                        })}>
                    <Message msgId="share.addBboxParam" />
                </Checkbox>}
                {this.props.advancedSettings.centerAndZoom && <Checkbox
                    checked={this.props.settings && this.props.settings.centerAndZoomEnabled}
                    onChange={() => {
                        this.props.onUpdateSettings({
                            ...this.props.settings,
                            centerAndZoomEnabled: !this.props.settings.centerAndZoomEnabled,
                            ...this.setMarkerSetting(),
                            bboxEnabled: false
                        });
                        this.props.settings.centerAndZoomEnabled && this.props.hideMarker();
                    }
                    }>
                    <Message msgId={this.props.settings.markerEnabled ? "share.addMarkerAndZoomParam" : "share.addCenterAndZoomParam"} />
                </Checkbox>}
                {this.props.advancedSettings.homeButton && <Checkbox
                    checked={this.props.settings.showHome}
                    onChange={() =>
                        this.props.onUpdateSettings({
                            ...this.props.settings,
                            showHome: !this.props.settings.showHome
                        })}>
                    <Message msgId="share.showHomeButton" />
                </Checkbox>}
                {
                    this.props.isScrollPosition
                    && this.props.advancedSettings.sectionId
                    && <Checkbox
                        checked={this.props.settings.showSectionId}
                        onChange={() =>
                            this.props.onUpdateSettings({
                                ...this.props.settings,
                                showSectionId: !this.props.settings.showSectionId
                            })}>
                        <Message msgId="share.showSectionId" />
                    </Checkbox>
                }
                {this.props.settings.centerAndZoomEnabled && <div>
                    <FormGroup id={"share-container"}>
                        <ControlLabel><Message msgId="share.coordinate" /></ControlLabel>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="share-coordinate"><Message msgId="share.coordTooltip"/></Tooltip>}>
                            <Glyphicon style={{marginLeft: 5}} glyph="info-sign" />
                        </OverlayTrigger>
                        <Editor
                            removeVisible={false}
                            formatCoord={this.props.formatCoords}
                            coordinate={{lat: this.state.coordinate[1] || "", lon: this.state.coordinate[0] || ""}}
                            onSubmit={(val)=>{
                                const lat = !isNil(val.lat) && !isNaN(val.lat) ? parseFloat(val.lat) : 0;
                                const lng = !isNil(val.lon) && !isNaN(val.lon) ? parseFloat(val.lon) : 0;
                                let newPoint = set('latlng.lng', lng, set('latlng.lat', lat, this.props.point));
                                this.props.addMarker(newPoint);
                            }}
                            onChangeFormat={this.props.onChangeFormat}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="share.zoom" /></ControlLabel>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="share-zoom"><Message msgId="share.zoomToolTip"/></Tooltip>}>
                            <Glyphicon style={{marginLeft: 5}} glyph="info-sign" />
                        </OverlayTrigger>
                        <FormControl
                            type="number"
                            min={1}
                            max={35}
                            name={"zoom"}
                            value={this.state.zoom || this.props.zoom || 21}
                            onChange={({target})=>{
                                const zoom = inRange(parseInt(target.value, 10), 1, 36) ? target.value : 1;
                                this.setState({...this.state, zoom});
                            }}/>
                    </FormGroup>
                    <Checkbox
                        checked={this.props.settings && this.props.settings.markerEnabled}
                        onChange={() => {
                            this.props.onUpdateSettings({
                                ...this.props.settings,
                                markerEnabled: !this.props.settings.markerEnabled
                            });
                        }
                        }>
                        <Message msgId="share.marker" />
                    </Checkbox>
                </div>
                }
            </SwitchPanel>
        );
    }
}

export default SharePanel;
