/**
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
import useClickOutside from '../useClickOutside';

const Component = ({ callback, isActive = true }) => {
    const ref = useClickOutside(callback, isActive);
    return (
        <div>
            <div ref={ref} id="inside-element">
                Inside Element
                <button id="inside-button">Inside Button</button>
            </div>
            <button id="outside-button">Outside Button</button>
        </div>
    );
};

describe('useClickOutside hook', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should call callback when clicking outside the element', (done) => {
        let callbackCalled = false;
        const callback = () => {
            callbackCalled = true;
            expect(callbackCalled).toBe(true);
            done();
        };
        act(() => {
            ReactDOM.render(<Component callback={callback} />, document.getElementById("container"));
        });
        setTimeout(() => {
            const outsideButton = document.getElementById("outside-button");
            const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
            outsideButton.dispatchEvent(event);
        }, 10);
    });

    it('should not call callback when clicking inside the element', (done) => {
        let callbackCalled = false;
        const callback = () => {
            callbackCalled = true;
        };
        act(() => {
            ReactDOM.render(<Component callback={callback} />, document.getElementById("container"));
        });
        setTimeout(() => {
            const insideButton = document.getElementById("inside-button");
            const event = new MouseEvent('mousedown', { bubbles: true });
            insideButton.dispatchEvent(event);
            setTimeout(() => {
                expect(callbackCalled).toBe(false);
                done();
            }, 10);
        }, 10);
    });

    it('should not call callback when isActive is false', (done) => {
        let callbackCalled = false;
        const callback = () => {
            callbackCalled = true;
        };
        act(() => {
            ReactDOM.render(<Component callback={callback} isActive={false} />, document.getElementById("container"));
        });
        setTimeout(() => {
            const outsideButton = document.getElementById("outside-button");
            const event = new MouseEvent('mousedown', { bubbles: true });
            outsideButton.dispatchEvent(event);
            setTimeout(() => {
                expect(callbackCalled).toBe(false);
                done();
            }, 10);
        }, 10);
    });
});
