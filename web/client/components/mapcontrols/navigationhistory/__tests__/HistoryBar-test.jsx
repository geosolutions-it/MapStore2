/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var HistoryBar = require('../HistoryBar');

describe('HistoryBar', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks default', () => {

        const cmp = React.render(<HistoryBar/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName("button");

        expect(buttons.length === 2);

    });

    it('checks undo and redo button click', () => {
        const handlers = {
            onclick() {}
        };
        let spy = expect.spyOn(handlers, "onclick");
        const cmp = React.render(<HistoryBar undoBtnProps={{ onClick: handlers.onclick}} redoBtnProps={{ onClick: handlers.onclick}}/>, document.body);
        const cmpDom = React.findDOMNode(cmp);
        const undo = cmpDom.getElementsByTagName("button").item(0);
        const redo = cmpDom.getElementsByTagName("button").item(1);
        undo.click();
        redo.click();
        expect(spy.calls.length).toBe(2);
    });
});
