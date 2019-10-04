/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {Col, Row, Form, FormGroup, FormControl, Button} = require('react-bootstrap');
const I18N = require('../../../components/I18N/I18N');

const googleGroups = require('../../assets/img/groups_logo.png');
const LinkedinGroup = require('../../assets/img/linkedin_group.png');
const {Follow} = require('react-twitter-widgets');


class MailingLists extends React.Component {
    static contextTypes = {
        messages: PropTypes.object
    };

    render() {
        return (
            <div id="mailinglists" className="container">
                <Row>
                    <Col className="text-center">
                        <h1><I18N.Message msgId="home.ml.title"/></h1>
                    </Col>
                </Row>
                <Row className="text-center">
                    <Col sm={12} md={6}>
                        <h2>
                            <img src={googleGroups} height="30" width="auto" alt="Google Groups" />
                        </h2>
                        <p>
                            <strong><I18N.Message msgId="home.ml.subscribe_users"/></strong>
                        </p>
                        <div>
                            <Form inline action="https://groups.google.com/group/mapstore-users/boxsubscribe">
                                <FormGroup controlId="formInlineEmail">
                                    <span><I18N.Message msgId="home.ml.email"/></span>{' '}
                                    <FormControl type="email" />
                                </FormGroup>{' '}
                                <Button bsStyle="primary" type="submit">{this.context.messages.home.ml.subscribe}</Button>
                            </Form>
                        </div>
                        <p><a className="link-white-bg" href="https://groups.google.com/group/mapstore-users"><I18N.Message msgId="home.ml.visit_group"/></a></p>
                    </Col>

                    <Col sm={12} md={6}>
                        <h2>
                            <img src={googleGroups} height="30" width="auto" alt="Google Groups" />
                        </h2>
                        <p>
                            <strong><I18N.Message msgId="home.ml.subscribe_devel"/></strong>
                        </p>
                        <div>
                            <Form inline action="https://groups.google.com/group/mapstore-developers/boxsubscribe">
                                <FormGroup controlId="formInlineMapStoreDev">
                                    <span><I18N.Message msgId="home.ml.email"/></span>{' '}
                                    <FormControl type="email" />
                                </FormGroup>{' '}
                                <Button bsStyle="primary" type="submit">{this.context.messages.home.ml.subscribe}</Button>
                            </Form>
                        </div>
                        <p><a className="link-white-bg" href="https://groups.google.com/group/mapstore-developers"><I18N.Message msgId="home.ml.visit_group"/></a></p>
                    </Col>
                    <Col sm={12} md={6}>
                        <table style={{padding: "0", margin: "10px auto"}} cellSpacing="0">
                            <tbody>
                                <tr>
                                    <td>
                                        <img style={{
                                            background: "white",
                                            borderRadius: "2px 2px 2px 2px"
                                        }} src={LinkedinGroup} height="50" width="100" alt="Linkedin Groups" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                        <b><I18N.Message msgId="home.LinkedinGroup"/></b>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{padding: "10px"}}>
                                        <a className="link-white-bg" href="https://www.linkedin.com/groups/7444734/profile"><I18N.Message msgId="home.ml.visit_group"/></a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                    <Col sm={12} md={6} style={{padding: "50px 10px"}}>
                        <Follow options={{size: 'large'}} username="mapstore2" />
                    </Col>
                </Row>
            </div>
        );
    }
}

module.exports = MailingLists;
