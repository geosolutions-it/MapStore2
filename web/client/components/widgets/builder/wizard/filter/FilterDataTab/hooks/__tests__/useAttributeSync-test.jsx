/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAttributeSync } from '../useAttributeSync';

const TestComponent = ({ filterData, onChangeProp, onEditorChange, selections, interactions, onReady }) => {
    const onChange = useAttributeSync(filterData, onChangeProp, onEditorChange, selections, interactions);

    useEffect(() => {
        onReady(onChange);
    }, [onChange, onReady]);

    return null;
};

describe('useAttributeSync hook', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should clear applyDimension interactions when the value attribute changes', (done) => {
        const container = document.getElementById('container');
        let onChange;
        const onChangeProp = expect.createSpy();
        const onEditorChange = expect.createSpy();

        ReactDOM.render(
            <TestComponent
                filterData={{
                    id: 'filter-1',
                    data: {
                        valueAttribute: 'name',
                        valueAttributeType: 'string'
                    }
                }}
                onChangeProp={onChangeProp}
                onEditorChange={onEditorChange}
                selections={{}}
                interactions={[
                    {
                        id: 'i-1',
                        targetType: 'applyFilter',
                        source: { nodePath: 'widgets[widget-1].filters[filter-1]' }
                    },
                    {
                        id: 'i-2',
                        targetType: 'applyDimension',
                        plugged: true,
                        source: { nodePath: 'widgets[widget-1].filters[filter-1]' }
                    }
                ]}
                onReady={(handler) => {
                    onChange = handler;
                }}
            />,
            container
        );

        setTimeout(() => {
            onChange('data.valueAttribute', 'population');

            expect(onChangeProp.calls[0].arguments).toEqual(['data.valueAttribute', 'population']);
            expect(onEditorChange.calls[0].arguments[0]).toBe('interactions');
            expect(onEditorChange.calls[0].arguments[1]).toEqual([
                {
                    id: 'i-1',
                    targetType: 'applyFilter',
                    source: { nodePath: 'widgets[widget-1].filters[filter-1]' }
                },
                {
                    id: 'i-2',
                    targetType: 'applyDimension',
                    plugged: false,
                    source: { nodePath: 'widgets[widget-1].filters[filter-1]' }
                }
            ]);
            expect(onEditorChange.calls[1].arguments[0]).toBe('selections');
            done();
        }, 0);
    });
});
