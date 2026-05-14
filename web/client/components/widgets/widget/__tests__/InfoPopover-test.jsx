/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import InfoPopover from '../InfoPopover';

describe('InfoPopover component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders default glyph with info style', () => {
        ReactDOM.render(<InfoPopover />, document.getElementById("container"));
        const container = document.getElementById('container');
        const wrapper = container.querySelector('.mapstore-info-popover');
        expect(wrapper).toExist();
        const glyph = wrapper.querySelector('.glyphicon-question-sign');
        expect(glyph).toExist();
        expect(glyph.className).toContain('text-info');
    });

    it('renders custom glyph and bsStyle', () => {
        ReactDOM.render(
            <InfoPopover glyph="exclamation-mark" bsStyle="warning" />,
            document.getElementById("container")
        );
        const wrapper = document.querySelector('.mapstore-info-popover');
        const glyph = wrapper.querySelector('.glyphicon-exclamation-mark');
        expect(glyph).toExist();
        expect(glyph.className).toContain('text-warning');
    });

    it('mounts popover in body when trigger is false', () => {
        ReactDOM.render(
            <InfoPopover trigger={false} title="T" text="popover-body-text" />,
            document.getElementById("container")
        );
        const popover = document.body.querySelector('.popover');
        expect(popover).toExist();
        expect(popover.textContent).toContain('popover-body-text');
    });

    it('does not mount popover initially with hover/focus trigger', () => {
        ReactDOM.render(
            <InfoPopover title="T" text="hidden-text" />,
            document.getElementById("container")
        );
        const popover = document.body.querySelector('.popover');
        expect(popover).toNotExist();
    });

    it('attaches a window resize listener and cleans it up on unmount', () => {
        const addSpy = expect.spyOn(window, 'addEventListener').andCallThrough();
        const removeSpy = expect.spyOn(window, 'removeEventListener').andCallThrough();
        try {
            ReactDOM.render(<InfoPopover />, document.getElementById("container"));
            expect(addSpy.calls.some(c => c.arguments[0] === 'resize')).toBe(true);
            ReactDOM.unmountComponentAtNode(document.getElementById("container"));
            expect(removeSpy.calls.some(c => c.arguments[0] === 'resize')).toBe(true);
        } finally {
            addSpy.restore();
            removeSpy.restore();
        }
    });

    it('re-renders the always-shown popover on window resize', (done) => {
        ReactDOM.render(
            <InfoPopover trigger={false} title="T" text="popover-body-text" />,
            document.getElementById("container")
        );
        // popover is mounted via Overlay into body
        expect(document.body.querySelector('.popover')).toExist();
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        // debounced 100ms; wait and verify the popover is still mounted (re-render did not break it)
        setTimeout(() => {
            try {
                expect(document.body.querySelector('.popover')).toExist();
                done();
            } catch (e) {
                done(e);
            }
        }, 150);
    });
});
