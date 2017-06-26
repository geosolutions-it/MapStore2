/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {Button} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');
const MoreDetails = require('./MoreDetails');
/**
  * Component used to show a panel with the information about cookies
  * @class Cookies
  * @memberof components
  * @prop {string} declineUrl The url associated with the leave button
  * @prop {string} externalCookieUrl if provided then it link to that url otherwise it will opens a section with more details.
  * @prop {function} onSetCookieVisibility to change the visibility of the cookie panel
  * @prop {function} onMoreDetails to toggle the more details section
  * @prop {bool} seeMore if true the more details section is visible
  * @prop {bool} show if true the cookie panel is visible
  *
  */
const Cookie = React.createClass({
    propTypes: {
        declineUrl: React.PropTypes.string,
        externalCookieUrl: React.PropTypes.string,
        onMoreDetails: React.PropTypes.func,
        onSetCookieVisibility: React.PropTypes.func,
        seeMore: React.PropTypes.bool,
        show: React.PropTypes.bool
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            declineUrl: "http://www.google.com",
            onMoreDetails: () => {},
            onSetCookieVisibility: () => {},
            seeMore: false,
            show: false
        };
    },
    render() {
        return this.props.show ? (
            <div className="mapstore-cookie-panel" style={{width: this.props.seeMore ? "55%" : "420px"}}>
                <div role="body" className="cookie-body-container">
                    {!this.props.externalCookieUrl && this.props.seeMore ? (
                        <MoreDetails/>
                    ) : (<div className="cookie-message">
                            <Message msgId="cookie.info"/>
                        </div>) }
                    <br/>
                    <div className="cookie-action">
                        <Button
                            className="cookie-button"
                            id="accept-cookie"
                            bsStyle="primary"
                            onClick={() => this.accept(true)} >
                            <Message msgId="cookie.accept"/>
                        </Button> &nbsp;
                        {this.props.externalCookieUrl ?
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
                            )
                        } &nbsp;
                        <a href={this.props.declineUrl} target="_blank" style={{cursor: "pointer"}}>
                            <Button
                                className="cookie-button"
                                id="decline-cookie"
                                bsStyle="primary" >
                                <Message msgId="cookie.leave"/>
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        ) : null;
    },
    moreDetails() {
        this.props.onMoreDetails(!this.props.seeMore);
    },
    accept() {
        localStorage.setItem("cookies-policy-approved", true);
        this.props.onSetCookieVisibility(false);
    }
});
module.exports = Cookie;
