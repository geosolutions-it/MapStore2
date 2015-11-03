/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var InfoButton = require('../InfoButton');
var expect = require('expect');

describe('This test for InfoButton', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const about = React.render(<InfoButton/>, document.body);
        expect(about).toExist();

        const aboutDom = React.findDOMNode(about);
        expect(aboutDom).toExist();
        expect(aboutDom.id).toExist();

        const btnList = aboutDom.getElementsByTagName('button');
        expect(btnList.length).toBe(1);

        const btn = btnList.item(0);
        expect(btn.className).toBe("btn btn-md btn-info");

        const btnItems = btn.getElementsByTagName("span");
        expect(btnItems.length).toBe(3);
        expect(btnItems.item(0).innerHTML).toBe("");
        expect(btnItems.item(1).innerHTML).toBe("");
        expect(btnItems.item(2).innerHTML).toBe("Info");
    });

    it('checks if a click on button shows a modal window', () => {
        const about = React.render(<InfoButton/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);
        btn.click();

        const modalDivList = document.getElementsByClassName("modal-content");
        expect(modalDivList.length).toBe(1);
    });

    it('checks if a click on window button hides the window itself', () => {
        const about = React.render(<InfoButton/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);
        btn.click();

        const modalDivList = document.getElementsByClassName("modal-content");
        const closeBtnList = modalDivList.item(0).getElementsByTagName('button');
        expect(closeBtnList.length).toBe(1);

        const closeBtn = closeBtnList.item(0);
        closeBtn.click();

        expect(document.getElementsByClassName('fade in modal').length).toBe(0);
    });

    it('checks the default content of the modal window', () => {
        const about = React.render(<InfoButton/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);
        btn.click();

        const modalDivList = document.getElementsByClassName("modal-content");
        const modalDiv = modalDivList.item(0);

        const headerList = modalDiv.getElementsByClassName("modal-header");
        expect(headerList.length).toBe(1);

        const titleList = headerList.item(0).getElementsByClassName("modal-title");
        expect(titleList.length).toBe(1);
        expect(titleList.item(0).innerHTML).toBe("Info");

        const bodyList = modalDiv.getElementsByClassName("modal-body");
        expect(bodyList.length).toBe(1);
        expect(bodyList.item(0).innerHTML).toBe("");
    });

    // test CUSTOM
    it('checks the custom id', () => {
        const customID = 'id-test';
        const about = React.render(<InfoButton id={customID}/>, document.body);
        const aboutDom = React.findDOMNode(about);
        expect(aboutDom.id).toBe(customID);
    });

    it('checks the custom button text', () => {
        const customText = 'btnText';
        const about = React.render(<InfoButton text={customText}/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);

        const btnItems = btn.getElementsByTagName("span");
        expect(btnItems.length).toBe(3);
        expect(btnItems.item(0).innerHTML).toBe("");
        expect(btnItems.item(1).innerHTML).toBe("");
        expect(btnItems.item(2).innerHTML).toBe(customText);
    });

    it('checks the button icon', () => {
        const icon = 'info-sign';
        const about = React.render(<InfoButton glyphicon={icon}/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);

        const btnItems = btn.getElementsByTagName("span");
        expect(btnItems.length).toBe(3);
        expect(btnItems.item(0).className).toBe("glyphicon glyphicon-" + icon);
        expect(btnItems.item(1).innerHTML).toBe("&nbsp;");
        expect(btnItems.item(2).innerHTML).toBe("Info");
    });

    it('checks if the button contains only icon', () => {
        const icon = 'info-sign';
        const about = React.render(<InfoButton glyphicon={icon} hiddenText/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);

        const btnItems = btn.getElementsByTagName("span");
        expect(btnItems.length).toBe(3);
        expect(btnItems.item(0).className).toBe("glyphicon glyphicon-" + icon);
        expect(btnItems.item(1).innerHTML).toBe("");
        expect(btnItems.item(2).innerHTML).toBe("");
    });

    it('checks if the button contains at least the default text', () => {
        const about = React.render(<InfoButton hiddenText/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);

        const btnItems = btn.getElementsByTagName("span");
        expect(btnItems.length).toBe(3);
        expect(btnItems.item(0).innerHTML).toBe("");
        expect(btnItems.item(1).innerHTML).toBe("");
        expect(btnItems.item(2).innerHTML).toBe("Info");
    });

    it('checks if the button contains at least the custom text', () => {
        const customText = "testText";
        const about = React.render(<InfoButton hiddenText text={customText}/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);

        const btnItems = btn.getElementsByTagName("span");
        expect(btnItems.length).toBe(3);
        expect(btnItems.item(0).innerHTML).toBe("");
        expect(btnItems.item(1).innerHTML).toBe("");
        expect(btnItems.item(2).innerHTML).toBe(customText);
    });

    it('checks the custom title for the window', () => {
        const customTitle = "testTitle";
        const about = React.render(<InfoButton title={customTitle}/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);
        btn.click();

        const modalDiv = document.getElementsByClassName("modal-content").item(0);
        const headerList = modalDiv.getElementsByClassName("modal-header");
        const titleDom = headerList.item(0).getElementsByClassName("modal-title").item(0);

        expect(titleDom.innerHTML).toBe(customTitle);
    });

    it('checks the custom body for the window', () => {
        const customBody = "customBody";
        const about = React.render(<InfoButton body={customBody}/>, document.body);
        const aboutDom = React.findDOMNode(about);
        const btn = aboutDom.getElementsByTagName('button').item(0);
        btn.click();

        const modalDiv = document.getElementsByClassName("modal-content").item(0);

        const bodyList = modalDiv.getElementsByClassName("modal-body");
        expect(bodyList.item(0).innerHTML).toBe(customBody);
    });

    it('checks the custom style', () => {
        const customStyle = {
            position: 'absolute',
            top: '5px',
            left: '1px'
        };
        const about = React.render(<InfoButton style={customStyle}/>, document.body);
        const aboutDom = React.findDOMNode(about);
        for (let p in customStyle) {
            if (customStyle.hasOwnProperty(p)) {
                expect(aboutDom.style[p]).toBe(customStyle[p]);
            }
        }
    });

    it('creates the component with a ImageButton', () => {
        const about = React.render(<InfoButton btnType="image"/>, document.body);
        expect(about).toExist();
        const aboutDom = React.findDOMNode(about);
        expect(aboutDom.getElementsByTagName('button').length).toBe(0);
        expect(aboutDom.getElementsByTagName('img').length).toBe(1);
    });
});
