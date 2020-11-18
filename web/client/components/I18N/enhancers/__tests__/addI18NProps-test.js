/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import { createSink } from 'recompose';
import expect from 'expect';
import addI18NProps from '../addI18NProps';
import Localized from '../../Localized';


describe('addI18NProps enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('addI18NProps format with no context', () => {
        const Sink = addI18NProps(['formatNumber'])(createSink(props => {
            expect(props).toExist();
            expect(props.formatNumber).toExist();
            // this is the default implementation.
            expect(props.formatNumber(1.1)).toBe(1.1);
            expect(props.formatNumber(1000)).toBe(1000);
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('addI18NProps format numbers', () => {
        const Sink = addI18NProps(['formatNumber'])(createSink( props => {
            expect(props).toExist();
            expect(props.formatNumber).toExist();
            expect(typeof props.formatNumber(1)).toBe('string');
            expect(props.formatNumber(1.1)).toBe("1.1");
            expect(props.formatNumber(1000)).toBe("1,000");
        }));
        ReactDOM.render(<Localized locale="en-EN" messages={{}}>
            <Sink />
        </Localized>, document.getElementById("container"));
    });
});
