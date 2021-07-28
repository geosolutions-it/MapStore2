/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { act, Simulate } from 'react-dom/test-utils';
import useSwipeControls from '../useSwipeControls';

describe('useSwipeControls', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should work with the default setup', (done) => {

        function Menu({ width, height, items = [], onClickItem }) {
            const {
                containerPropsHandlers,
                contentPropsHandlers,
                itemPropsHandlers
            } = useSwipeControls({
                direction: 'horizontal',
                width,
                height,
                transition: 300,
                deltaScroll: 200
            });
            return (
                <div
                    {...containerPropsHandlers()}
                    className="swipe-menu">
                    <ul {...contentPropsHandlers()}>
                        {items.map(({ title, id }) => {
                            return (
                                <li {...itemPropsHandlers({ id, onClick: () => { onClickItem(id); } })} key={id}>
                                    {title}
                                </li>
                            );
                        })}
                    </ul>
                </div>);
        }

        act(() => {
            ReactDOM.render(<Menu
                width={500}
                height={70}
                items={[{ id: 'content', title: 'Title' }]}
                onClickItem={(id) => {
                    expect(id).toBe('content');
                    done();
                }}
            />, document.getElementById("container"));
        });

        const menuItems = document.querySelectorAll('li');
        expect(menuItems.length).toBe(1);
        Simulate.click(menuItems[0]);
    });
});
