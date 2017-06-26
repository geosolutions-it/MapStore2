/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const Message = require('../../components/I18N/Message');
const HTML = require('../../components/I18N/HTML');


/**
  * More Details cookie page. Page with complete description about cookies used in the application.
  * @class MoreDetails
  * @memberof components.Cookies
  *
  */
const MoreDetails = React.createClass({
    propTypes: {},
    contextTypes: {},
    getDefaultProps() {
        return {};
    },
    render() {
        const fontWeightBold = {fontWeight: "bold"};
        const lineHeight100 = {lineHeight: "100%"};
        return (<div className="cookie-seeMore">
            <h2 style={fontWeightBold}><Message msgId="cookie.moreDetails.title"/></h2>
            <hr />
            <p style={lineHeight100}><HTML msgId="cookie.moreDetails.paragraph1"/></p>
            <h4 style={fontWeightBold}><Message msgId="cookie.moreDetails.subTitle2"/></h4>
            <p style={lineHeight100}><Message msgId="cookie.moreDetails.paragraph2"/></p>
            <p style={lineHeight100}><Message msgId="cookie.moreDetails.paragraph3"/></p>
            <ul>
                <li><Message msgId="cookie.moreDetails.list1"/></li>
                <li><Message msgId="cookie.moreDetails.list2"/></li>
                <li><Message msgId="cookie.moreDetails.list3"/></li>
                <li><Message msgId="cookie.moreDetails.list4"/></li>
            </ul>
            <p style={lineHeight100}><Message msgId="cookie.moreDetails.paragraph4"/></p>
            <ul>
                <li><Message msgId="cookie.moreDetails.list5"/></li>
                <li><Message msgId="cookie.moreDetails.list6"/></li>
                <li><Message msgId="cookie.moreDetails.list7"/></li>
            </ul>
            <p style={lineHeight100}><Message msgId="cookie.moreDetails.paragraph5"/></p>
            <p style={lineHeight100}><Message msgId="cookie.moreDetails.paragraph6"/></p>

            <h4 style={fontWeightBold}><Message msgId="cookie.moreDetails.subTitle3"/></h4>
            <p style={lineHeight100}><Message msgId="cookie.moreDetails.paragraph7"/></p>
            <ul>
                <li><Message msgId="cookie.moreDetails.list8"/></li>
                <li><Message msgId="cookie.moreDetails.list9"/></li>
            </ul>
            <h4 style={fontWeightBold}><Message msgId="cookie.moreDetails.subTitle4"/></h4>
            <p style={lineHeight100}><Message msgId="cookie.moreDetails.paragraph8"/></p>
            <ul>
                <li><Message msgId="cookie.moreDetails.list10"/></li>
                <li><Message msgId="cookie.moreDetails.list11"/></li>
                <li><Message msgId="cookie.moreDetails.list12"/></li>
            </ul>
            <p style={lineHeight100}><Message msgId="cookie.moreDetails.paragraph9"/></p>
            <h4 style={fontWeightBold}><Message msgId="cookie.moreDetails.subTitle5"/></h4>
            <p style={lineHeight100}><HTML msgId="cookie.moreDetails.link1"/></p>
        </div>);
    }
});
module.exports = MoreDetails;
