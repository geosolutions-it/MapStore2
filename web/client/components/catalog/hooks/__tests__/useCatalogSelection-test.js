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
import { act } from 'react-dom/test-utils';
import { useCatalogSelection } from '../useCatalogSelection';

const HookComponent = ({ records, selectedService }) => {
    const {
        selected,
        isAllSelected,
        isIndeterminate,
        onRecordSelected,
        handleSelectAll,
        clearSelection
    } = useCatalogSelection(records, selectedService);

    return (
        <div>
            <div id="selected-count">{selected.length}</div>
            <div id="all-selected">{`${isAllSelected}`}</div>
            <div id="indeterminate">{`${isIndeterminate}`}</div>
            <button id="select-first" onClick={() => onRecordSelected(records[0], true)} />
            <button id="unselect-first" onClick={() => onRecordSelected(records[0], false)} />
            <button id="select-all" onClick={() => handleSelectAll(true)} />
            <button id="unselect-all" onClick={() => handleSelectAll(false)} />
            <button id="clear" onClick={clearSelection} />
        </div>
    );
};

describe('useCatalogSelection', () => {
    const records = [
        { identifier: 'id-1', title: 'Layer 1' },
        { identifier: 'id-2', title: 'Layer 2' }
    ];

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('handles single selection and unselection', () => {
        ReactDOM.render(
            <HookComponent records={records} selectedService="csw" />,
            document.getElementById('container')
        );

        act(() => {
            document.getElementById('select-first').click();
        });

        expect(document.getElementById('selected-count').textContent).toBe('1');
        expect(document.getElementById('all-selected').textContent).toBe('false');
        expect(document.getElementById('indeterminate').textContent).toBe('true');

        act(() => {
            document.getElementById('unselect-first').click();
        });

        expect(document.getElementById('selected-count').textContent).toBe('0');
        expect(document.getElementById('indeterminate').textContent).toBe('false');
    });

    it('handles select all and clear selection', () => {
        ReactDOM.render(
            <HookComponent records={records} selectedService="csw" />,
            document.getElementById('container')
        );

        act(() => {
            document.getElementById('select-all').click();
        });

        expect(document.getElementById('selected-count').textContent).toBe('2');
        expect(document.getElementById('all-selected').textContent).toBe('true');
        expect(document.getElementById('indeterminate').textContent).toBe('false');

        act(() => {
            document.getElementById('clear').click();
        });

        expect(document.getElementById('selected-count').textContent).toBe('0');
    });

    it('resets selected entries when service changes', (done) => {
        const container = document.getElementById('container');

        ReactDOM.render(
            <HookComponent records={records} selectedService="csw" />,
            container
        );

        act(() => {
            document.getElementById('select-all').click();
        });
        expect(document.getElementById('selected-count').textContent).toBe('2');

        act(() => {
            ReactDOM.render(
                <HookComponent records={records} selectedService="geonode" />,
                container
            );
        });

        setTimeout(() => {
            expect(document.getElementById('selected-count').textContent).toBe('0');
            done();
        }, 0);
    });
});
