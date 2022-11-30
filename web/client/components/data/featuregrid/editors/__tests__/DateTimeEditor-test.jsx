/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import DateTimeEditor from "../DateTimeEditor";
import moment from "moment";

let testColumn = {
    key: 'columnKey'
};


describe('FeatureGrid DateTimeEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DateTimeEditor Editor', () => {
        const date = moment.utc('2010-01-01').toDate();
        const cmp = ReactDOM.render(<DateTimeEditor
            value={date}
            rowIdx={1}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(moment.utc(cmp.getValue().columnKey).toISOString()).toBe(date.toISOString());
    });
    it('DateTimeEditor Editor with time', () => {
        const date = moment.utc('2010-01-01T12:00:00').toDate();
        const cmp = ReactDOM.render(<DateTimeEditor
            value={date}
            rowIdx={1}
            column={testColumn}
            time/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(moment.utc(cmp.getValue().columnKey).toISOString()).toBe(date.toISOString());
    });
    it('DateTimeEditor Editor with time and calendar', () => {
        const date = moment.utc('2010-01-01T12:00:00').toDate();
        const cmp = ReactDOM.render(<DateTimeEditor
            value={date}
            rowIdx={1}
            column={testColumn}
            time
            calendar/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(moment.utc(cmp.getValue().columnKey).toISOString()).toBe(date.toISOString());
    }
    );
    it('getValue returns the current value set in the editor', () => {
        const date = moment.utc('2010-01-01T12:00:00').toDate();
        const cmp = ReactDOM.render(<DateTimeEditor
            value={date}
            rowIdx={1}
            column={testColumn}
            time
            calendar/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(cmp.getValue()[testColumn.key]).toEqual(date);
        cmp.onChange(moment.utc('2010-01-02T12:00:00').toDate());
        expect(cmp.getValue()[testColumn.key]).toEqual(moment.utc('2010-01-02T12:00:00').toDate());
    });
});
