/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {Col, Row} = require('react-bootstrap');
var I18N = require('../../../components/I18N/I18N');

const googleGroups = require('../../assets/img/groups_logo_sm.gif');

var MailingLists = React.createClass({
    contextTypes: {
        messages: React.PropTypes.object
    },
    render() {
        return (
            <div id="mailinglists" className="container">
                <Row>
                    <Col>
                        <h1 className="color2" style={{align: "center", fontWeight: "bold", margin: "10px"}} align="center"><I18N.Message msgId="home.ml.title"/></h1>
                    </Col>
                </Row>
                <Row>
                        <Col sm={12} md={6}>
                        <table border="0" style={{backgroundColor: "#fff", padding: "5px", margin: "auto"}} cellSpacing="0">
                            <tbody>
                            <tr>
                                <td>
                                    <img src={googleGroups} height="30" width="136" alt="Google Groups" />
                                </td>
                            </tr>
                            <tr>
                                <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                    <b><I18N.Message msgId="home.ml.subscribe_users"/></b>
                                </td>
                            </tr>
                            <tr>
                                <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                    <form action="http://groups.google.com/group/mapstore-users/boxsubscribe">
                                        <I18N.Message msgId="home.ml.email"/> <input type="text" name="email" />
                                        <input type="submit" name="sub" value={this.context.messages.home.ml.subscribe} />
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td align="right">
                                    <a className="link-white-bg" href="http://groups.google.com/group/mapstore-users"><I18N.Message msgId="home.ml.visit_group"/></a>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Col>
                    <Col sm={12} md={6}>
                        <table border="0" style={{backgroundColor: "#fff", padding: "5px", margin: "auto"}} cellSpacing="0">
                            <tbody>
                            <tr>
                                <td>
                                    <img src={googleGroups} height="30" width="136" alt="Google Groups" />
                                </td>
                            </tr>
                            <tr>
                                <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                    <b><I18N.Message msgId="home.ml.subscribe_devel"/></b>
                                </td>
                            </tr>
                            <tr>
                                <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                    <form action="http://groups.google.com/group/mapstore-developers/boxsubscribe">
                                        <I18N.Message msgId="home.ml.email"/> <input type="text" name="email" />
                                        <input type="submit" name="sub" value={this.context.messages.home.ml.subscribe} />
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td align="right">
                                    <a className="link-white-bg" href="http://groups.google.com/group/mapstore-developers"><I18N.Message msgId="home.ml.visit_group"/></a>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
			</div>
        );
    }
});

module.exports = MailingLists;
