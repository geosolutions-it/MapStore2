/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import AlertPopover from '../AlertPopover/index';

describe('AlertPopover component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should auto-show popover on first error occurrence with countdown', (done) => {
        const content = <div>Test error message</div>;

        ReactDOM.render(
            <AlertPopover
                show
                content={content}
                autoDismissSeconds={3}
                autoShowFirstTime
            />,
            document.getElementById("container")
        );

        // Wait for component to mount and auto-show
        setTimeout(() => {
            const popover = document.querySelector('.alert-popover-popup');
            const countdown = document.querySelector('.countdown-number');

            expect(popover).toExist();
            expect(countdown).toExist();
            expect(countdown.innerText).toBe('3');
            done();
        }, 200);
    });

    it('should pause countdown on hover and resume on mouse leave', (done) => {
        const content = <div>Test error message</div>;

        ReactDOM.render(
            <AlertPopover
                show
                content={content}
                autoDismissSeconds={5}
                pauseOnHover
                autoShowFirstTime
            />,
            document.getElementById("container")
        );

        setTimeout(() => {
            const popover = document.querySelector('.alert-popover-popup');
            const countdownProgress = document.querySelector('.countdown-progress');

            // Verify initial state
            expect(popover).toExist();
            expect(countdownProgress).toExist();
            expect(countdownProgress.classList.contains('counting')).toBe(true);

            // Simulate hover over popover
            ReactTestUtils.Simulate.mouseEnter(popover);

            setTimeout(() => {
                // Verify paused state
                expect(countdownProgress.classList.contains('paused')).toBe(true);

                // Simulate mouse leave
                ReactTestUtils.Simulate.mouseLeave(popover);

                setTimeout(() => {
                    // Verify resumed state
                    expect(countdownProgress.classList.contains('counting')).toBe(true);
                    done();
                }, 100);
            }, 100);
        }, 200);
    });

    it('should not auto-show when autoShowFirstTime is false but allow hover interaction', (done) => {
        const content = <div>Test error message</div>;

        ReactDOM.render(
            <AlertPopover
                show
                content={content}
                autoDismissSeconds={5}
                autoShowFirstTime={false}
            />,
            document.getElementById("container")
        );

        // Wait for component to mount
        setTimeout(() => {
            const popover = document.querySelector('.alert-popover-popup');
            const trigger = document.querySelector('.alert-popover-trigger');

            expect(trigger).toExist();
            // Verify popover is not auto-shown
            expect(popover).toNotExist();
            done();
        }, 200);
    });
});
