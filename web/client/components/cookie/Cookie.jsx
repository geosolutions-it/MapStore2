/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import PropTypes from 'prop-types';

import React from 'react';
import { createPortal } from 'react-dom';
import { Glyphicon, Col } from 'react-bootstrap';
import Button from '../misc/Button';
import Message from '../../components/I18N/Message';
import MoreDetails from './MoreDetails';
import { getApi, getItemKey } from '../../api/userPersistedStorage';
import { isCookieNoticeAcknowledged, acknowledgePrivacyNotice, isPrivacyNoticeAcknowledged, privacyNoticeKey } from '../../utils/CookieNoticeUtils';
import { readPrivacyChoice, makePrivacyChoice, persistPrivacyChoice, privacyChoiceKey, categoryIds } from '../../utils/PrivacyChoices';
import PrivacyPanel from './PrivacyPanel';
import { consentManager } from '../../utils/ConsentManager';

/**
  * Component used to show a panel with the information about cookies
  * @class Cookies
  * @memberof components
  * @prop {string} declineUrl The url associated with the leave button
  * @prop {string} locale the language used, default browser's one
  * @prop {string} externalCookieUrl if provided then it link to that url otherwise it will opens a section with more details.
  * @prop {function} onSetCookieVisibility to change the visibility of the cookie panel
  * @prop {function} onMoreDetails to toggle the more details section
  * @prop {bool} seeMore if true the more details section is visible
  * @prop {bool} show if true the cookie panel is visible
  *
  */

class Cookie extends React.Component {
    state = { privacyStorageError: false };
    static propTypes = {
        declineUrl: PropTypes.string,
        externalCookieUrl: PropTypes.string,
        locale: PropTypes.string,
        onMoreDetails: PropTypes.func,
        onSetCookieVisibility: PropTypes.func,
        seeMore: PropTypes.bool,
        show: PropTypes.bool,
        privacy: PropTypes.object,
        privacyChoice: PropTypes.object,
        onPrivacyChoice: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        declineUrl: "./",
        onPrivacyChoice: () => {},
        onMoreDetails: () => {},
        onSetCookieVisibility: () => {},
        seeMore: false,
        show: false
    };

    handlePrivacyStorageChange = event => {
        if (this.props.privacy?.enabled && event.key === privacyNoticeKey() && !categoryIds(this.props.privacy).length) {
            if (isPrivacyNoticeAcknowledged(this.props.privacy)) this.props.onSetCookieVisibility(false);
            return;
        }
        if (!this.props.privacy?.enabled || (event.key !== null && event.key !== privacyChoiceKey())) return;
        const choice = readPrivacyChoice(this.props.privacy);
        consentManager.update(this.props.privacy, choice);
        this.props.onPrivacyChoice(choice);
        if (!choice && this.props.privacy.categories?.length) this.props.onSetCookieVisibility(true);
    };

    componentDidMount() {
        if (this.props.privacy?.enabled) {
            const choice = readPrivacyChoice(this.props.privacy);
            consentManager.update(this.props.privacy, choice);
            this.props.onPrivacyChoice(choice);
            window.addEventListener('storage', this.handlePrivacyStorageChange);
            this.recheckConsent = () => this.handlePrivacyStorageChange({key: null});
            window.addEventListener('focus', this.recheckConsent);
            this.expiryCheck = setInterval(this.recheckConsent, 30000);
            // The bridge exists only in an explicitly configured loopback test lab.
            if (this.props.privacy.testFixture && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname)) {
                window.MapStoreConsent = {register: consentManager.register, isAllowed: consentManager.isAllowed};
                window.dispatchEvent(new Event('mapstore:consent-ready'));
            }
        }
        // Dynamically loaded plugins can miss the first LOCATION_CHANGE event.
        // Check on mount so a fresh visit still displays the notice.
        if (!this.props.show && !isCookieNoticeAcknowledged(this.props.privacy)) {
            this.props.onSetCookieVisibility(true);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('storage', this.handlePrivacyStorageChange);
        window.removeEventListener('focus', this.recheckConsent);
        clearInterval(this.expiryCheck);
        consentManager.stop();
        delete window.MapStoreConsent;
    }

    renderAcceptButton = () => {
        return (
            <Button
                className="cookie-button"
                id="accept-cookie"
                bsStyle="primary"
                onClick={() => this.accept(true)} >
                <Message msgId="cookie.accept"/>
            </Button>);
    }

    renderMoreDetails = () => {
        return this.props.externalCookieUrl ?
            (
                <a style={{cursor: "pointer"}}
                    id="accept-cookie"
                    href={this.props.externalCookieUrl}>
                    <Button
                        className="cookie-button"
                        id="decline-cookie"
                        bsStyle="primary" >
                        <Message msgId="cookie.moreDetailsButton"/>
                    </Button>
                </a>
            ) : (
                <Button
                    onClick={() => this.moreDetails()}
                    className="cookie-button"
                    id="decline-cookie"
                    bsStyle="primary" >
                    <Message msgId="cookie.moreDetailsButton"/>
                </Button>
            );
    }
    renderLeaveButton = () => {
        return (<a href={this.props.declineUrl} target="_self" style={{cursor: "pointer"}}>
            <Button
                className="cookie-button"
                id="decline-cookie"
                bsStyle="primary" >
                <Message msgId="cookie.leave"/>
            </Button>
        </a>);
    }
    render() {
        if (this.props.privacy?.enabled) {
            return (<PrivacyPanel
                config={this.props.privacy}
                locale={this.props.locale}
                choice={this.props.privacyChoice}
                show={this.props.show}
                storageError={this.state.privacyStorageError}
                onShow={show => {
                    if (!show && !categoryIds(this.props.privacy).length) acknowledgePrivacyNotice(this.props.privacy);
                    this.props.onSetCookieVisibility(show);
                }}
                onSave={selected => {
                    const choice = makePrivacyChoice(this.props.privacy, selected);
                    const persisted = persistPrivacyChoice(choice);
                    const requestedOptional = Object.values(choice.categories).some(Boolean);
                    if (!persisted && requestedOptional) {
                        consentManager.update(this.props.privacy, null);
                        this.props.onPrivacyChoice(null);
                        this.setState({privacyStorageError: true});
                        return false;
                    }
                    consentManager.update(this.props.privacy, persisted ? choice : null);
                    this.setState({privacyStorageError: !persisted});
                    this.props.onPrivacyChoice(persisted ? choice : null);
                    this.props.onSetCookieVisibility(false);
                    return true;
                }} />);
        }
        if (!this.props.show) {
            return null;
        }
        const content = (
            <div className={this.props.seeMore ? "mapstore-cookie-panel see-more" : "mapstore-cookie-panel not-see-more"}>
                <div role="header" className="cookie-header" style={{height: this.props.seeMore ? "44px" : "0px"}}>
                    {this.props.seeMore ? <Glyphicon className="cookie-close-btn" glyph="1-close" onClick={() => this.props.onMoreDetails(false)}/> : null }
                </div>
                <div role="body" className="cookie-body-container">
                    {!this.props.externalCookieUrl && this.props.seeMore ? (
                        <MoreDetails html={this.props.html}/>
                    ) : (<div className="cookie-message">
                        <Message msgId="cookie.info"/>
                    </div>) }
                    <br/>
                    {!this.props.seeMore ?
                        (<div className="cookie-action">

                            <Col xs={6} sm={4} className="action-button">
                                {this.renderAcceptButton()}
                            </Col>
                            <Col xs={6} sm={4} className="action-button">
                                {this.renderMoreDetails()}
                            </Col>
                            <Col xs={6} sm={4} className="action-button">
                                {this.renderLeaveButton()}
                            </Col>
                            <Col xs={12}>
                                <br></br>
                            </Col>
                        </div>) : null }
                </div>
            </div>
        );
        return createPortal(content, document.body);
    }
    moreDetails = () => {
        this.props.onMoreDetails(!this.props.seeMore);
    }
    accept = () => {
        try {
            getApi().setItem(getItemKey('cookie', 'approved'), true);
        } catch (e) {
            console.error(e);
        }
        this.props.onSetCookieVisibility(false);
    }
}
export default Cookie;
