/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import DefaultLayerOrGroup from '../DefaultLayerOrGroup';
import expect from 'expect';
import { act } from 'react-dom/test-utils';

describe('DefaultLayerOrGroup', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults', () => {
        act(() => {
            ReactDOM.render(<DefaultLayerOrGroup />, document.getElementById("container"));
        });
        expect(document.querySelector('#container').children.length).toBe(0);
    });

    it('should render with components', () => {
        const GroupElement = ({ children }) => {
            return <div className="group">{children}</div>;
        };
        const LayerElement = ({}) => {
            return <div className="layer" />;
        };
        act(() => {
            ReactDOM.render(<DefaultLayerOrGroup
                node={{
                    id: 'group',
                    nodes: [
                        { id: 'layer' }
                    ]
                }}
                layerElement={<LayerElement />}
                groupElement={<GroupElement />}
            />, document.getElementById("container"));
        });
        expect(document.querySelector('.group')).toBeTruthy();
        expect(document.querySelector('.layer')).toBeTruthy();
    });

});
