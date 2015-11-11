/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var HelpTextPanel = require('../HelpTextPanel');
var expect = require('expect');

describe('Test for HelpTextPanel', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const helpPanel = React.render(<HelpTextPanel/>, document.body);
        expect(helpPanel).toExist();

        const helpPanelDom = React.findDOMNode(helpPanel);
        expect(helpPanelDom).toExist();
        // expect(helpPanelDom.id).toExist();
        expect(helpPanelDom.className.indexOf('hidden') >= 0).toBe(true);

        // header text
        const panelHeader = helpPanelDom.getElementsByClassName('panel-heading').item(0);
        expect(panelHeader).toExist();
        expect(panelHeader.innerHTML === "HELP").toBe(true);

        // text in body
        const panelBody = helpPanelDom.getElementsByClassName('panel-body').item(0);
        expect(panelBody).toExist();
        expect(panelBody.innerHTML).toBe("");
    });

    it('creates the component with custom props', () => {
        const helpPanel = React.render(<HelpTextPanel
                        id="fooid"
                        isVisible={true}
                        title="footitle"
                        helpText="foohelptext"
                        />, document.body);
        expect(helpPanel).toExist();

        const helpPanelDom = React.findDOMNode(helpPanel);
        expect(helpPanelDom).toExist();
        expect(helpPanelDom.id).toBe("fooid");
        expect(helpPanelDom.className.indexOf('hidden') < 0).toBe(true);

        // header text
        const panelHeader = helpPanelDom.getElementsByClassName('panel-heading').item(0);
        expect(panelHeader).toExist();
        expect(panelHeader.innerHTML).toBe("footitle");

        // text in body
        const panelBody = helpPanelDom.getElementsByClassName('panel-body').item(0);
        expect(panelBody).toExist();
        expect(panelBody.innerHTML).toBe("foohelptext");
    });

});
