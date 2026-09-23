/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import withBatchedLayerLoading from '../withBatchedLayerLoading';

describe('withBatchedLayerLoading enhancer', () => {
    let container;

    beforeEach((done) => {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(container);
        if (container.parentNode) {
            document.body.removeChild(container);
        }
        setTimeout(done);
    });

    it('renders wrapped component and forwards ref', () => {
        let forwardedRef = null;
        const MockComp = React.forwardRef((props, ref) => {
            forwardedRef = ref;
            return <div ref={ref} className="mock-comp" {...props} />;
        });
        const Enhanced = withBatchedLayerLoading(MockComp);
        const ref = React.createRef();
        ReactDOM.render(<Enhanced ref={ref} id="test-comp" />, container);
        expect(container.querySelector('.mock-comp')).toExist();
        expect(forwardedRef).toBe(ref);
        expect(ref.current).toBe(container.querySelector('.mock-comp'));
    });

    it('batches multiple onLayerLoading calls into single array call with default delay', (done) => {
        let batchedPayload = null;
        let callCount = 0;
        const MockComp = ({ onLayerLoading }) => (
            <button
                id="btn"
                onClick={() => {
                    onLayerLoading('layer-1');
                    onLayerLoading('layer-2');
                    onLayerLoading('layer-1');
                }}
            />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                onLayerLoading={(ids) => {
                    callCount++;
                    batchedPayload = ids;
                }}
            />,
            container
        );

        container.querySelector('#btn').click();
        expect(callCount).toBe(0);

        setTimeout(() => {
            expect(callCount).toBe(1);
            expect(batchedPayload).toEqual(['layer-1', 'layer-2']);
            done();
        }, 70);
    });

    it('handles array of layer IDs and flattens into batch', (done) => {
        let batchedPayload = null;
        let callCount = 0;
        const MockComp = ({ onLayerLoading }) => (
            <button
                id="btn"
                onClick={() => {
                    onLayerLoading(['group-1', 'group-2']);
                    onLayerLoading('group-3');
                }}
            />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                layerLoadingBatchDelay={20}
                onLayerLoading={(ids) => {
                    callCount++;
                    batchedPayload = ids;
                }}
            />,
            container
        );

        container.querySelector('#btn').click();
        setTimeout(() => {
            expect(callCount).toBe(1);
            expect(batchedPayload).toEqual(['group-1', 'group-2', 'group-3']);
            done();
        }, 35);
    });

    it('ignores falsy layer IDs', (done) => {
        let callCount = 0;
        const MockComp = ({ onLayerLoading }) => (
            <button
                id="btn"
                onClick={() => {
                    onLayerLoading(null);
                    onLayerLoading(undefined);
                    onLayerLoading('');
                }}
            />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                layerLoadingBatchDelay={10}
                onLayerLoading={() => {
                    callCount++;
                }}
            />,
            container
        );

        container.querySelector('#btn').click();
        setTimeout(() => {
            expect(callCount).toBe(0);
            done();
        }, 25);
    });

    it('clears timer on unmount and prevents trailing calls', (done) => {
        let callCount = 0;
        const MockComp = ({ onLayerLoading }) => (
            <button id="btn" onClick={() => onLayerLoading('layer-x')} />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                layerLoadingBatchDelay={30}
                onLayerLoading={() => {
                    callCount++;
                }}
            />,
            container
        );

        container.querySelector('#btn').click();
        ReactDOM.unmountComponentAtNode(container);

        setTimeout(() => {
            expect(callCount).toBe(0);
            done();
        }, 50);
    });

    it('handles missing onLayerLoading gracefully without error', () => {
        const MockComp = ({ onLayerLoading }) => (
            <button id="btn" onClick={() => onLayerLoading('layer-1')} />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(<Enhanced />, container);
        expect(() => container.querySelector('#btn').click()).toNotThrow();
    });

    it('batches multiple onLayerLoad calls into single array call with default delay', (done) => {
        let batchedPayload = null;
        let callCount = 0;
        const MockComp = ({ onLayerLoad }) => (
            <button
                id="btn"
                onClick={() => {
                    onLayerLoad('layer-1');
                    onLayerLoad('layer-2');
                    onLayerLoad('layer-1');
                }}
            />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                onLayerLoad={(ids) => {
                    callCount++;
                    batchedPayload = ids;
                }}
            />,
            container
        );

        container.querySelector('#btn').click();
        expect(callCount).toBe(0);

        setTimeout(() => {
            expect(callCount).toBe(1);
            expect(batchedPayload).toEqual(['layer-1', 'layer-2']);
            done();
        }, 80);
    });

    it('separates success and error onLayerLoad calls into distinct batches', (done) => {
        let successPayload = null;
        let errorPayload = null;
        let successCalls = 0;
        let errorCalls = 0;
        const MockComp = ({ onLayerLoad }) => (
            <button
                id="btn"
                onClick={() => {
                    onLayerLoad('layer-1');
                    onLayerLoad('layer-2', { error: true });
                    onLayerLoad('layer-3');
                }}
            />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                onLayerLoad={(ids, error) => {
                    if (error) {
                        errorCalls++;
                        errorPayload = ids;
                    } else {
                        successCalls++;
                        successPayload = ids;
                    }
                }}
            />,
            container
        );

        container.querySelector('#btn').click();

        setTimeout(() => {
            expect(successCalls).toBe(1);
            expect(successPayload).toEqual(['layer-1', 'layer-3']);
            expect(errorCalls).toBe(1);
            expect(errorPayload).toEqual(['layer-2']);
            done();
        }, 80);
    });

    it('ensures error overrides success for same layer in onLayerLoad', (done) => {
        let successPayload = null;
        let errorPayload = null;
        const MockComp = ({ onLayerLoad }) => (
            <button
                id="btn"
                onClick={() => {
                    onLayerLoad('layer-1');
                    onLayerLoad('layer-1', { error: true });
                }}
            />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                layerLoadingBatchDelay={20}
                onLayerLoad={(ids, error) => {
                    if (error) {
                        errorPayload = ids;
                    } else {
                        successPayload = ids;
                    }
                }}
            />,
            container
        );

        container.querySelector('#btn').click();

        setTimeout(() => {
            expect(successPayload).toBe(null);
            expect(errorPayload).toEqual(['layer-1']);
            done();
        }, 40);
    });

    it('handles missing onLayerLoad gracefully without error', () => {
        const MockComp = ({ onLayerLoad }) => (
            <button id="btn" onClick={() => onLayerLoad('layer-1')} />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(<Enhanced />, container);
        expect(() => container.querySelector('#btn').click()).toNotThrow();
    });

    it('batches onLayerError into full error and warning batches', (done) => {
        let errorPayload = null;
        let warningPayload = null;
        const MockComp = ({ onLayerError }) => (
            <button
                id="btn"
                onClick={() => {
                    onLayerError('layer-1', 10, 10);
                    onLayerError('layer-2', 10, 3);
                    onLayerError('layer-3', 5, 5);
                }}
            />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                layerLoadingBatchDelay={20}
                onLayerError={(ids, count, errorCount) => {
                    if (count === 1 && errorCount === 1) {
                        errorPayload = ids;
                    } else if (count === 2 && errorCount === 1) {
                        warningPayload = ids;
                    }
                }}
            />,
            container
        );

        container.querySelector('#btn').click();

        setTimeout(() => {
            expect(errorPayload).toEqual(['layer-1', 'layer-3']);
            expect(warningPayload).toEqual(['layer-2']);
            done();
        }, 40);
    });

    it('promotes warning to full error when both occur for same layer in onLayerError', (done) => {
        let errorPayload = null;
        let warningPayload = null;
        const MockComp = ({ onLayerError }) => (
            <button
                id="btn"
                onClick={() => {
                    onLayerError('layer-1', 10, 2);
                    onLayerError('layer-1', 10, 10);
                }}
            />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(
            <Enhanced
                layerLoadingBatchDelay={20}
                onLayerError={(ids, count, errorCount) => {
                    if (count === 1 && errorCount === 1) {
                        errorPayload = ids;
                    } else {
                        warningPayload = ids;
                    }
                }}
            />,
            container
        );

        container.querySelector('#btn').click();

        setTimeout(() => {
            expect(errorPayload).toEqual(['layer-1']);
            expect(warningPayload).toBe(null);
            done();
        }, 40);
    });

    it('handles missing onLayerError gracefully without error', () => {
        const MockComp = ({ onLayerError }) => (
            <button id="btn" onClick={() => onLayerError('layer-1', 1, 1)} />
        );
        const Enhanced = withBatchedLayerLoading(MockComp);
        ReactDOM.render(<Enhanced />, container);
        expect(() => container.querySelector('#btn').click()).toNotThrow();
    });
});
