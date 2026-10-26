/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import PropTypes from 'prop-types';

import React from 'react';
import { getApi } from '../../api/userPersistedStorage';
import { isCookieNoticeAcknowledged, acknowledgePrivacyNotice, isPrivacyNoticeAcknowledged, privacyNoticeKey } from '../../utils/CookieNoticeUtils';
import { readPrivacyChoice, makePrivacyChoice, persistPrivacyChoice, privacyChoiceKey, categoryIds, removePrivacyStorageItem, usesTemplatePolicyLinks, policyPagesDocsUrl } from '../../utils/PrivacyChoices';
import PrivacyPanel from './PrivacyPanel';
import { consentManager } from '../../utils/ConsentManager';

/**
  * Component used to show the privacy panel. It renders nothing when the privacy configuration is disabled.
  * @class Cookies
  * @memberof components
  * @prop {string} locale the language used, default browser's one
  * @prop {function} onSetCookieVisibility to change the visibility of the privacy panel
  * @prop {bool} show if true the privacy panel is visible
  * @prop {object} privacy the privacy configuration in use
  *
  */

class Cookie extends React.Component {
    state = { privacyStorageError: false };
    static propTypes = {
        locale: PropTypes.string,
        onSetCookieVisibility: PropTypes.func,
        show: PropTypes.bool,
        privacy: PropTypes.object,
        privacyChoice: PropTypes.object,
        onPrivacyChoice: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        onPrivacyChoice: () => {},
        onSetCookieVisibility: () => {},
        show: false
    };

    handlePrivacyStorageChange = event => {
        if (this.props.privacy?.enabled && event.key === privacyNoticeKey() && !categoryIds(this.props.privacy).length) {
            if (isPrivacyNoticeAcknowledged(this.props.privacy)) this.props.onSetCookieVisibility(false);
            return;
        }
        if (!this.props.privacy?.enabled || (event.key !== null && event.key !== privacyChoiceKey())) return;
        if (this.unsavedChoice) {
            // A choice that could not be saved stays in force on this page; the stored
            // record may be an older consent. Only another tab writing a new record replaces it.
            if (event.key === null) return;
            this.unsavedChoice = false;
            this.setState({privacyStorageError: false});
        }
        const choice = readPrivacyChoice(this.props.privacy);
        consentManager.update(this.props.privacy, choice);
        this.props.onPrivacyChoice(choice);
        if (!choice && this.props.privacy.categories?.length) this.props.onSetCookieVisibility(true);
    };

    componentDidMount() {
        if (this.props.privacy?.enabled) {
            if (usesTemplatePolicyLinks(this.props.privacy)) {
                console.warn(`Privacy settings: the policy pages are the MapStore templates. See ${policyPagesDocsUrl}`);
            }
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

    render() {
        if (!this.props.privacy?.enabled) {
            return null;
        }
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
                if (!persistPrivacyChoice(choice)) {
                    // Optional tools stay off and the panel stays open with the error.
                    // Removing the stored record keeps an older consent from coming back.
                    try {
                        removePrivacyStorageItem(privacyChoiceKey(), getApi().getItem(privacyChoiceKey()));
                    } catch (e) { /* Storage may be unavailable. */ }
                    this.unsavedChoice = true;
                    consentManager.update(this.props.privacy, null);
                    this.props.onPrivacyChoice(null);
                    this.setState({privacyStorageError: true});
                    return false;
                }
                this.unsavedChoice = false;
                consentManager.update(this.props.privacy, choice);
                this.setState({privacyStorageError: false});
                this.props.onPrivacyChoice(choice);
                this.props.onSetCookieVisibility(false);
                return true;
            }} />);
    }
}
export default Cookie;
