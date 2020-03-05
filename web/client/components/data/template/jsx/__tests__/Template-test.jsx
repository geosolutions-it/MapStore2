/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var expect = require('expect');
var ReactDOM = require('react-dom');
var Template = require('../Template');
const {Promise} = require('es6-promise');

describe("Test JSX Template", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Test Template render jsx string', (done) => {
        let comp = ReactDOM.render(
            <Template template="<div id='template'/>"/>, document.getElementById("container"));
        new Promise((resolve) => {
            require.ensure(['babel-standalone'], () => {
                resolve(comp);
            });
        }).then(() => {
            try {
                const cmpDom = document.getElementById("template");
                expect(cmpDom).toBeTruthy();
                expect(cmpDom.id).toBeTruthy();
                expect(cmpDom.id).toBe("template");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('Test Template render jsx as functipn', (done) => {
        let comp = ReactDOM.render(
            <Template
                template={ () => { return "<div id='template'/>"; } } />, document.getElementById("container"));
        new Promise((resolve) => {
            require.ensure(['babel-standalone'], () => {
                resolve(comp);
            });
        }).then(() => {
            try {
                expect(comp).toBeTruthy();
                const cmpDom = document.getElementById("template");
                expect(cmpDom).toBeTruthy();
                expect(cmpDom.id).toBeTruthy();
                expect(cmpDom.id).toBe("template");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('Test Template render jsx string with model substitution', (done) => {
        let comp = ReactDOM.render(
            <Template template="<div id={model.id}/>" model={{id: "template"}} />
            , document.getElementById("container"));
        new Promise((resolve) => {
            require.ensure(['babel-standalone'], () => {
                resolve(comp);
            });
        }).then(() => {
            try {
                expect(comp).toBeTruthy();
                const cmpDom = document.getElementById("template");
                expect(cmpDom).toBeTruthy();
                expect(cmpDom.id).toBeTruthy();
                expect(cmpDom.id).toBe("template");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('Test Template update', (done) => {
        let comp = ReactDOM.render(
            <Template template="<div id={model.id}/>" model={{id: "template"}} />
            , document.getElementById("container"));
        new Promise((resolve) => {
            require.ensure(['babel-standalone'], () => {
                resolve(comp);
            });
        }).then(() => {
            try {
                expect(comp).toBeTruthy();
                const cmpDom = document.getElementById("template");
                expect(cmpDom).toBeTruthy();
                expect(cmpDom.id).toBeTruthy();
                expect(cmpDom.id).toBe("template");

                comp = ReactDOM.render(
                    <Template template="<div id={model.id}/>" model={{id: "template-update"}} />
                    , document.getElementById("container"));
                const cmpDom1 = document.getElementById("template-update");
                expect(cmpDom1).toBeTruthy();
                expect(cmpDom1.id).toBeTruthy();
                expect(cmpDom1.id).toBe("template-update");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('Test Template update template', (done) => {
        let comp = ReactDOM.render(
            <Template template="<div id={model.id}/>" model={{id: "temp"}} />
            , document.getElementById("container"));
        new Promise((resolve) => {
            require.ensure(['babel-standalone'], () => {
                resolve(comp);
            });
        }).then(() => {
            try {
                expect(comp).toBeTruthy();
                const cmpDom = document.getElementById("temp");
                expect(cmpDom).toBeTruthy();

                comp = ReactDOM.render(
                    <Template template="<div id='template'/>" model={{id: "temp"}} />
                    , document.getElementById("container"));
                const cmpDom1 = document.getElementById("temp");
                expect(cmpDom1).toBeTruthy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
