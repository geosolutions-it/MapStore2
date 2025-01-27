/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useParsePluginConfigExpressions from '../useParsePluginConfigExpressions';
import expect from 'expect';

const Component = ({ monitoredState, fields }) => {
    const parsedConfig = useParsePluginConfigExpressions(monitoredState, { fields });
    return <ul>{parsedConfig.fields.map((field) => <li key={field.id}>{field.id}</li>)}</ul>;
};

describe('useParsePluginConfigExpressions', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should support monitored state expression for parsed fields', () => {
        ReactDOM.render(<Component
            monitoredState={{
                user: 'USER'
            }}
            fields={[
                {
                    id: 'no expression'
                },
                {
                    id: '{state("user")}'
                },
                {
                    id: 'option',
                    disableIf: '{state("user") !== "USER"}'
                },
                {
                    id: 'manager',
                    disableIf: '{state("user") !== "ADMIN"}'
                }
            ]}
        />, document.getElementById("container"));
        const list = [...document.querySelector('ul').children];
        expect(list.length).toBe(3);
        expect(list.map(child => child.innerHTML).join(',')).toBe('no expression,USER,option');
    });
});
