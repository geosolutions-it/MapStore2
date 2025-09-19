/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import useComputedPendingChanges from '../useComputedPendingChanges';

const TestComponent = ({
    setPendingChanges,
    initialResource,
    resource,
    data,
    debounceConfig
}) => {
    useComputedPendingChanges({
        setPendingChanges,
        initialResource,
        resource,
        data,
        debounceConfig
    });
    return <div>Test Component</div>;
};

describe('useComputedPendingChanges', () => {
    let mockSetPendingChanges;
    let container;

    beforeEach((done) => {
        container = document.createElement('div');
        document.body.appendChild(container);
        mockSetPendingChanges = expect.createSpy();
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
        setTimeout(done);
    });

    it('should call setPendingChanges with computed changes using default debounce configuration', (done) => {
        const mockInitialResource = { id: 1, name: 'Initial' };
        const mockResource = { id: 1, name: 'Updated' };
        const mockData = { config: 'test' };

        act(() => {
            ReactDOM.render(
                <TestComponent
                    setPendingChanges={mockSetPendingChanges}
                    initialResource={mockInitialResource}
                    resource={mockResource}
                    data={mockData}
                />,
                container
            );
        });

        // Wait for debounce to complete (default 1000ms + small buffer)
        setTimeout(() => {
            expect(mockSetPendingChanges).toHaveBeenCalled();
            const calls = mockSetPendingChanges.calls;
            expect(calls.length).toBe(1);
            // The actual computed changes will depend on the real computePendingChanges function
            expect(calls[0].arguments[0]).toNotBe(null);
            done();
        }, 1100);
    });

    it('should use custom debounce configuration when provided', (done) => {
        const mockInitialResource = { id: 1, name: 'Initial' };
        const mockResource = { id: 1, name: 'Updated' };
        const mockData = { config: 'test' };
        const customDebounceConfig = {
            wait: 500,
            leading: true,
            trailing: false,
            maxWait: 1000
        };

        act(() => {
            ReactDOM.render(
                <TestComponent
                    setPendingChanges={mockSetPendingChanges}
                    initialResource={mockInitialResource}
                    resource={mockResource}
                    data={mockData}
                    debounceConfig={customDebounceConfig}
                />,
                container
            );
        });

        // With leading: true, should execute immediately
        setTimeout(() => {
            expect(mockSetPendingChanges).toHaveBeenCalled();
            const calls = mockSetPendingChanges.calls;
            expect(calls.length).toBe(1);
            // The actual computed changes will depend on the real computePendingChanges function
            expect(calls[0].arguments[0]).toNotBe(null);
            done();
        }, 100);
    });
});
