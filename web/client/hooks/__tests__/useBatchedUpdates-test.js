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
import useBatchedUpdates from '../useBatchedUpdates';

const TestComponent = ({ callback, reducer, delay, onMount }) => {
    const [batchedUpdate, forceFlush] = useBatchedUpdates(callback, { reducer, delay });

    React.useEffect(() => {
        if (onMount) {
            onMount({ batchedUpdate, forceFlush });
        }
    }, []);

    return <div data-batched-update="true"></div>;
};

describe('useBatchedUpdates hook', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should throw error when reducer is not provided', () => {
        expect(() => {
            act(() => {
                ReactDOM.render(
                    <TestComponent callback={() => {}} />,
                    document.getElementById("container")
                );
            });
        }).toThrow('useBatchedUpdates: reducer function is required');
    });

    it('should batch multiple updates into a single callback', (done) => {
        const callback = expect.createSpy();
        const reducer = (accumulated, update) => ({ ...(accumulated || {}), ...update });

        act(() => {
            ReactDOM.render(
                <TestComponent
                    callback={callback}
                    reducer={reducer}
                    onMount={({ batchedUpdate }) => {
                        batchedUpdate({ key1: 'value1' });
                        batchedUpdate({ key2: 'value2' });
                        batchedUpdate({ key3: 'value3' });

                        expect(callback).toNotHaveBeenCalled();

                        setTimeout(() => {
                            expect(callback.calls.length).toBe(1);
                            expect(callback.calls[0].arguments[0]).toEqual({
                                key1: 'value1',
                                key2: 'value2',
                                key3: 'value3'
                            });
                            done();
                        }, 10);
                    }}
                />,
                document.getElementById("container")
            );
        });
    });

    it('should force flush immediately', (done) => {
        const callback = expect.createSpy();
        const reducer = (accumulated, update) => ({ ...(accumulated || {}), ...update });

        act(() => {
            ReactDOM.render(
                <TestComponent
                    callback={callback}
                    reducer={reducer}
                    delay={1000}
                    onMount={({ batchedUpdate, forceFlush }) => {
                        batchedUpdate({ key1: 'value1' });
                        batchedUpdate({ key2: 'value2' });

                        expect(callback).toNotHaveBeenCalled();

                        forceFlush();

                        expect(callback.calls.length).toBe(1);
                        expect(callback.calls[0].arguments[0]).toEqual({
                            key1: 'value1',
                            key2: 'value2'
                        });
                        done();
                    }}
                />,
                document.getElementById("container")
            );
        });
    });

    it('should handle complex nested object accumulation', (done) => {
        const callback = expect.createSpy();
        const reducer = (accumulated, type, id, options) => {
            const current = accumulated || { layers: {}, groups: {} };
            return {
                ...current,
                [type]: {
                    ...current[type],
                    [id]: {
                        ...(current[type][id] || {}),
                        ...options
                    }
                }
            };
        };

        act(() => {
            ReactDOM.render(
                <TestComponent
                    callback={callback}
                    reducer={reducer}
                    onMount={({ batchedUpdate }) => {
                        batchedUpdate('layers', 'layer1', { visibility: false });
                        batchedUpdate('layers', 'layer1', { opacity: 0.5 });
                        batchedUpdate('layers', 'layer2', { visibility: true });
                        batchedUpdate('groups', 'group1', { expanded: true });

                        setTimeout(() => {
                            expect(callback.calls.length).toBe(1);
                            expect(callback.calls[0].arguments[0]).toEqual({
                                layers: {
                                    layer1: { visibility: false, opacity: 0.5 },
                                    layer2: { visibility: true }
                                },
                                groups: {
                                    group1: { expanded: true }
                                }
                            });
                            done();
                        }, 10);
                    }}
                />,
                document.getElementById("container")
            );
        });
    });
});
