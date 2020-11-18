/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';

import tableWidget from '../tableWidget';

describe('widgets tableWidget enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('tableWidget onAddFilter', (done) => {
        const someFilter = { attribute: "state"};
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridEvents).toExist();
            expect(props.gridEvents.onAddFilter).toExist();
            expect(props.gridEvents.onColumnResize).toExist();

            props.gridEvents.onAddFilter(someFilter);
            done();
        }));
        ReactDOM.render(<Sink updateProperty={(path, filter) => {
            expect(path).toBe("quickFilters.state");
            expect(filter).toBe(someFilter);
        }}/>, document.getElementById("container"));
    });
});
