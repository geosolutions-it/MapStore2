/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');
var Book = require('../Book');

describe('Book', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test defaults', () => {
        const cmp = React.render(<Book/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
    });
    it('page rentering', () => {
        const cmp = React.render(
            <Book currentPage={1}>
                <div id="page0"></div>
                <div id="page1"></div>
            </Book>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(4);

        const pageContainer = cmpDom.childNodes.item(1);
        expect(pageContainer.childNodes.length).toBe(1);
        expect(pageContainer.childNodes.item(0).id).toBe("page1");
    });
    it('title rendering', () => {
        const cmp = React.render(
            <Book
                currentPage={1}
                pageTitles={['title0', 'title1']}>
                <div id="page0"></div>
                <div id="page1"></div>
            </Book>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(4);
        expect(cmpDom.childNodes.item(0).innerHTML).toBe("title1");
    });
    it('test page switching', () => {
        const cmp = React.render(
            <Book
                currentPage={1}
                pageTitles={['title0', 'title1']}>
                <div id="page0"></div>
                <div id="page1"></div>
            </Book>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(4);
        expect(cmpDom.childNodes.item(0).innerHTML).toBe("title1");

        const pageContainer = cmpDom.childNodes.item(1);
        expect(pageContainer.childNodes.length).toBe(1);
        expect(pageContainer.childNodes.item(0).id).toBe("page1");

        let buttons = cmpDom.childNodes.item(2).childNodes;
        expect(buttons.length).toBe(2);

        let prevButton = buttons.item(0).childNodes.item(0);
        let nextButton = buttons.item(1).childNodes.item(0);

        prevButton.click();
        expect(cmpDom.childNodes.item(0).innerHTML).toBe("title0");
        expect(pageContainer.childNodes.item(0).id).toBe("page0");

        nextButton.click();
        expect(cmpDom.childNodes.item(0).innerHTML).toBe("title1");
        expect(pageContainer.childNodes.item(0).id).toBe("page1");
    });

});
