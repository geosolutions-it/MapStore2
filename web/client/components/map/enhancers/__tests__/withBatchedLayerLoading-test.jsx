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
});
