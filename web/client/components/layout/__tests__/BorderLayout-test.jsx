/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require("react");
const expect = require('expect');
const ReactDOM = require('react-dom');
const BorderLayout = require('../BorderLayout');

describe("Test BorderLayout Component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Test BorderLayout', () => {
        ReactDOM.render(
            <BorderLayout id="MYCOMPONENT" className={"CLASS"}/>, document.getElementById("container"));
        expect(document.getElementsByClassName( 'ms2-border-layout-body')[0]).toExist();
        expect(document.getElementsByClassName('ms2-border-layout-content')).toExist();
        expect(document.getElementsByClassName('CLASS')).toExist();
        expect(document.getElementById('MYCOMPONENT')).toExist();
    });
    it('Test BorderLayout with header footer and columns', () => {
        ReactDOM.render(
            (<BorderLayout
                header={<div className="header"></div>}
                footer={<div className="footer"></div>}
                columns={[<div className="left" style={{order: -1}}></div>, <div className="right"></div>]}
            >
                <div className="content"></div>
            </BorderLayout>), document.getElementById("container"));

        expect(document.getElementsByClassName('header')[0]).toExist();
        expect(document.getElementsByClassName('footer')[0]).toExist();
        expect(document.getElementsByClassName('left')[0]).toExist();
        expect(document.getElementsByClassName('right')[0]).toExist();
        expect(document.getElementsByClassName('content')[0]).toExist();
    });
});
