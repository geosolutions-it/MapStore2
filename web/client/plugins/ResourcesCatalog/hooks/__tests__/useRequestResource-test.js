/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useRequestResource from '../useRequestResource';
import expect from 'expect';
import { act, Simulate } from 'react-dom/test-utils';

const Component = ({ newResource, ...props }) => {
    const {
        update
    } = useRequestResource(props);
    return <button onClick={() => update(newResource)}></button>;
};

describe('useRequestResource', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should trigger the setRequest on mount if resource is undefined', (done) => {
        ReactDOM.render(<Component
            resourceId="01"
            setRequest={() => Promise.resolve({ id: '01' })}
            onSetSuccess={(resource) => {
                expect(resource.id).toBe('01');
                done();
            }}
        />, document.getElementById("container"));
    });
    it('should trigger the updateRequest clicking the custom button', (done) => {
        act(() => {
            ReactDOM.render(<Component
                resourceId="01"
                setRequest={() => Promise.resolve({ id: '01' })}
                updateRequest={() => Promise.resolve({ id: '01' })}
                onUpdateSuccess={() => {
                    done();
                }}
            />, document.getElementById("container"));
        });
        Simulate.click(document.querySelector('button'));
    });
});
