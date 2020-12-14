/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { createSink } from 'recompose';

import buttonWithDisabled from '../buttonWithDisabled';

describe('buttonWithDisabled enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('when disabled className changes and disabled is removed from props', (done) => {
        const Sink = buttonWithDisabled(createSink(props => {
            try {
                expect(props.disabled).toBeFalsy();
                expect(props.className.indexOf('disabled')).toNotBe(-1);
                done();
            } catch (e) {
                done(e);
            }
        }));
        ReactDOM.render(<Sink disabled/>, document.getElementById('container'));
    });
    it('when disabled onClick is ignored', (done) => {
        const Sink = buttonWithDisabled(createSink(props => {
            try {
                expect(props.onClick).toExist();
                props.onClick();
            } catch (e) {
                done(e);
            }
        }));

        let onClickNotIgnored = false;
        ReactDOM.render(<Sink disabled onClick={() => {onClickNotIgnored = true;}}/>, document.getElementById('container'));

        setTimeout(() => {
            try {
                expect(onClickNotIgnored).toBe(false);
                done();
            } catch (e) {
                done(e);
            }
        }, 300);
    });
});
