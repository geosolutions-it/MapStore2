/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var HTMLViewer = require('../HTMLViewer');
var JSONViewer = require('../JSONViewer');
var TextViewer = require('../TextViewer');

const SimpleRowViewer = (props) => {
    return <div>{['name', 'description'].map((key) => <span key={key}>{key}:{props[key]}</span>)}</div>;
};

describe('Identity Viewers', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test HTMLViewer', () => {
        const cmp = ReactDOM.render(<HTMLViewer response="<span class='testclass'>test</span>" />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.getElementsByClassName("testclass").length).toBe(1);
    });

    it('test TextViewer', () => {
        const cmp = ReactDOM.render(<TextViewer response="testtext" />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.innerHTML.indexOf('testtext') !== -1).toBe(true);
    });

    it('test JSONViewer', () => {
        const cmp = ReactDOM.render(<JSONViewer response={{
            features: [{
                id: 1,
                properties: {
                    name: 'myname',
                    description: 'mydescription'
                }
            }]
        }} rowViewer={SimpleRowViewer}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.innerHTML.indexOf('myname') !== -1).toBe(true);
        expect(cmpDom.innerHTML.indexOf('mydescription') !== -1).toBe(true);
    });

    it('test JSONViewer with custom row viewer', () => {
        const MyRowViewer = (props) => {
            return <span>This is my viewer: {props.feature.id}</span>;
        };
        const cmp = ReactDOM.render(<JSONViewer rowViewer={MyRowViewer} response={{
            features: [{
                id: 1,
                properties: {
                    name: 'myname',
                    description: 'mydescription'
                }
            }]
        }} />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerText.indexOf('This is my viewer: 1') !== -1).toBe(true);
    });

    it('test JSONViewer with TEMPLATE', () => {
        const cmp = ReactDOM.render(
            <JSONViewer
                layer={{
                    featureInfo: {
                        format: 'TEMPLATE',
                        template: '<p id="my-template">the property name is ${ properties.name }</p>'
                    }
                }}
                response={{
                    features: [{
                        id: 1,
                        properties: {
                            name: 'myname',
                            description: 'mydescription'
                        }
                    }]
                }} />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const templateDOM = document.getElementById('my-template');
        expect(templateDOM.innerHTML).toBe('the property name is myname');

    });

    it('test JSONViewer with TEMPLATE and missing properties', () => {
        const cmp = ReactDOM.render(
            <JSONViewer
                layer={{
                    featureInfo: {
                        format: 'TEMPLATE',
                        template: '<p id="my-template">the property id is ${ properties.id }</p>'
                    }
                }}
                response={{
                    features: [{
                        id: 1,
                        properties: {
                            name: 'myname',
                            description: 'mydescription'
                        }
                    }]
                }} />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const templateDOM = document.getElementById('my-template');
        expect(templateDOM.innerHTML).toBe('the property id is ');

    });

    it('test JSONViewer with TEMPLATE with tag inside variable', () => {
        ReactDOM.render(
            <JSONViewer
                layer={{
                    featureInfo: {
                        format: 'TEMPLATE',
                        template: '<p id="my-template">the property name is ${<p>properties.name</p>}</p>'
                    }
                }}
                response={{
                    features: [{
                        id: 1,
                        properties: {
                            name: 'myname',
                            description: 'mydescription'
                        }
                    }]
                }} />, document.getElementById("container"));

        let templateDOM = document.getElementById('my-template');
        expect(templateDOM.innerHTML).toBe('the property name is myname');

        ReactDOM.render(
            <JSONViewer
                layer={{
                    featureInfo: {
                        format: 'TEMPLATE',
                        template: '<p id="my-template">the property description is ${prope<p>rties.description</p>}</p>'
                    }
                }}
                response={{
                    features: [{
                        id: 1,
                        properties: {
                            name: 'myname',
                            description: 'mydescription'
                        }
                    }]
                }} />, document.getElementById("container"));

        templateDOM = document.getElementById('my-template');
        expect(templateDOM.innerHTML).toBe('the property description is mydescription');
    });

    it('test JSONViewer with TEMPLATE multiple features', () => {
        const cmp = ReactDOM.render(
            <JSONViewer
                layer={{
                    featureInfo: {
                        format: 'TEMPLATE',
                        template: '<p class="my-template">the property id is ${ id }</p>'
                    }
                }}
                response={{
                    features: [{
                        id: 1,
                        properties: {
                            name: 'myname',
                            description: 'mydescription'
                        }
                    }, {
                        id: 2,
                        properties: {
                            name: 'newName',
                            description: 'newDescription'
                        }
                    }]
                }} />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const templateDOM = document.getElementsByClassName('my-template');
        expect(templateDOM[0].innerHTML).toBe('the property id is 1');
        expect(templateDOM[1].innerHTML).toBe('the property id is 2');
    });

    it('test JSONViewer with TEMPLATE but missing/empty template', () => {
        // when template is missing, undefined or equal to <p><br></p> response is displayed in PROPERTIES format
        ReactDOM.render(
            <JSONViewer
                layer={{
                    featureInfo: {
                        format: 'TEMPLATE'
                    }
                }}
                response={{
                    features: [{
                        id: 1,
                        properties: {
                            name: 'myname',
                            description: 'mydescription'
                        }
                    }]
                }} />, document.getElementById("container"));

        let propertiesViewer = document.getElementsByClassName('mapstore-json-viewer');
        expect(propertiesViewer.length).toBe(1);

        ReactDOM.render(
            <JSONViewer
                layer={{
                    featureInfo: {
                        format: 'TEMPLATE',
                        template: ''
                    }
                }}
                response={{
                    features: [{
                        id: 1,
                        properties: {
                            name: 'myname',
                            description: 'mydescription'
                        }
                    }]
                }} />, document.getElementById("container"));

        propertiesViewer = document.getElementsByClassName('mapstore-json-viewer');
        expect(propertiesViewer.length).toBe(1);

        // <p><br></p> is the value of react-quill when empty
        ReactDOM.render(
            <JSONViewer
                layer={{
                    featureInfo: {
                        format: 'TEMPLATE',
                        template: '<p><br></p>'
                    }
                }}
                response={{
                    features: [{
                        id: 1,
                        properties: {
                            name: 'myname',
                            description: 'mydescription'
                        }
                    }]
                }} />, document.getElementById("container"));

        propertiesViewer = document.getElementsByClassName('mapstore-json-viewer');
        expect(propertiesViewer.length).toBe(1);
    });

});
