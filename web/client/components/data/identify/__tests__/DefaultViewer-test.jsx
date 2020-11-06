/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const DefaultViewer = require('../DefaultViewer.jsx');
import SwipeHeader from '../SwipeHeader';

const expect = require('expect');

describe('DefaultViewer', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the DefaultViewer component with defaults', () => {
        const viewer = ReactDOM.render(
            <DefaultViewer/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
    });

    it('creates the DefaultViewer component with custom container', () => {
        const Container = () => <div className="mycontainer"/>;
        const viewer = ReactDOM.render(
            <DefaultViewer container={Container} requests={["TEST"]}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("mycontainer").length).toBe(1);
    });

    it('creates the DefaultViewer component with custom header', () => {
        const responses = [{
            response: "A",
            layerMetadata: {
                title: 'a'
            }
        }];
        const Header = () => <div className="mycontainer"/>;
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses} header={Header} requests={["TEST"]}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("mycontainer").length).toBe(1);
    });

    it('creates the DefaultViewer component with custom validator', () => {
        const validator = () => ({
            getValidResponses: () => [{
                response: "A",
                layerMetadata: {
                    title: 'a'
                }
            }, {
                response: "B",
                layerMetadata: {
                    title: 'b'
                }
            }],
            getNoValidResponses: () => [{
                response: "C",
                layerMetadata: {
                    title: 'c'
                }
            }]
        });
        const viewer = ReactDOM.render(
            <DefaultViewer validator={validator} renderEmpty/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("panel").length).toBe(2);
        expect(dom.getElementsByClassName("alert").length).toBe(1);
    });

    it('creates the DefaultViewer component with no results', () => {
        const viewer = ReactDOM.render(
            <DefaultViewer emptyResponses/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(1);
    });

    it('creates the DefaultViewer component with an empty and an non empty layer results', () => {
        const responses = [{
            response: "A",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "no features were found",
            layerMetadata: {
                title: 'b'
            }
        }];
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(1);
        expect(dom.getElementsByClassName("panel").length).toBe(2);

        // Desktop view
        const gfiViewer = document.querySelector('.mapstore-identify-viewer');
        const alertInfo = document.querySelector('.alert-info');
        const swipeableView = document.querySelector('.swipeable-view');
        expect(gfiViewer).toBeTruthy();
        expect(gfiViewer.childNodes.length).toBe(2);
        expect(gfiViewer.childNodes[0]).toEqual(swipeableView);
        expect(gfiViewer.childNodes[1]).toEqual(alertInfo);
    });

    it('creates the DefaultViewer component with Identify floating', () => {
        const responses = [{
            response: "A",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "no features were found",
            layerMetadata: {
                title: 'b'
            }
        }];
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses} renderEmpty/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(1);
        expect(dom.getElementsByClassName("panel").length).toBe(1);
    });

    it('creates the DefaultViewer component with some results', () => {
        const responses = [{
            response: "A",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "B",
            layerMetadata: {
                title: 'b'
            }
        }];
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses} requests={["TEST"]}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(0);
    });

    it('creates the DefaultViewer component with missing results', () => {
        const viewer = ReactDOM.render(
            <DefaultViewer missingResponses={1}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(0);
    });

    it('creates the DefaultViewer component with custom viewer', () => {
        const responses = [{
            response: "myresponse",
            layerMetadata: {
                title: 'a'
            }
        }];
        const viewers = {
            "custom": (props) => <span className="custom">{props.response}</span>
        };
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses} viewers={viewers} format="custom" requests={["TEST"]}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("custom").length).toBe(1);
        expect(dom.innerHTML.indexOf('myresponse') !== -1).toBe(true);
    });

    it('test DefaultViewer component with header (Popup view)', () => {

        const responses = [{
            response: "no features were found",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "B",
            layerMetadata: {
                title: 'Layer1'
            }
        }];
        ReactDOM.render(
            <DefaultViewer responses={responses} header={SwipeHeader} renderEmpty/>,
            document.getElementById("container")
        );
        const header = document.querySelector('.ms-identify-swipe-header');
        const panel = document.querySelectorAll('.panel');
        expect(header).toBeTruthy();
        expect(header.innerText).toBe('Layer1');
        expect(panel.length).toBe(1);
    });

    it('test DefaultViewer component in mobile view', () => {
        const responses = [{
            response: "no features were found",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "B",
            layerMetadata: {
                title: 'Layer1'
            }
        }];
        // Mobile view
        ReactDOM.render(
            <DefaultViewer isMobile responses={responses} header={SwipeHeader}/>,
            document.getElementById("container")
        );

        const mobileContainer = document.getElementById('container');
        let gfiViewer = mobileContainer.querySelector('.mapstore-identify-viewer');
        let alertInfo = mobileContainer.querySelector('.alert-info');
        let swipeableView = mobileContainer.querySelector('.swipeable-view');
        expect(gfiViewer).toBeTruthy();
        expect(gfiViewer.childNodes.length).toBe(2);
        expect(gfiViewer.childNodes[0]).toEqual(alertInfo);
        expect(gfiViewer.childNodes[1]).toEqual(swipeableView);

    });
});
