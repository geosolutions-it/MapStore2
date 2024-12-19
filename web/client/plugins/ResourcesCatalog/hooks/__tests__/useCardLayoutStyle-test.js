/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useCardLayoutStyle from '../useCardLayoutStyle';
import expect from 'expect';
import { Simulate, act } from 'react-dom/test-utils';

const Component = (props) => {
    const { cardLayoutStyle, setCardLayoutStyle, hideCardLayoutButton } = useCardLayoutStyle(props);
    return <button onClick={() => setCardLayoutStyle('list')}>{cardLayoutStyle}-{hideCardLayoutButton ? 'true' : 'false'}</button>;
};

describe('useCardLayoutStyle', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        localStorage.removeItem('layoutCardsStyle');
        setTimeout(done);
    });
    it('should store layoutCardsStyle in localStorage', () => {
        act(() => {
            ReactDOM.render(<Component defaultCardLayoutStyle="grid" />, document.getElementById('container'));
        });
        let button = document.querySelector('button');
        expect(button.innerHTML).toBe('grid-false');
        Simulate.click(button);
        expect(button.innerHTML).toBe('list-false');
        expect(localStorage.getItem('layoutCardsStyle')).toBe('"list"');
    });
    it('should force the value if cardLayoutStyle is passed', () => {
        act(() => {
            ReactDOM.render(<Component cardLayoutStyle="grid"/>, document.getElementById('container'));
        });
        let button = document.querySelector('button');
        expect(button.innerHTML).toBe('grid-true');
        Simulate.click(button);
        expect(button.innerHTML).toBe('grid-true');
    });
});
