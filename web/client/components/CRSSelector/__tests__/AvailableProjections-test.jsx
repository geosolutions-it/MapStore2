/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import AvailableProjections from '../AvailableProjections';

describe('AvailableProjections component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"><div class="ms2"><div id="modal-new-container"></div></div><div id="modal-container"></div></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render dialog when open is true', () => {
        const projectionList = [
            { value: 'EPSG:4326', label: 'WGS84' },
            { value: 'EPSG:3857', label: 'Web Mercator' }
        ];
        ReactDOM.render(
            <AvailableProjections
                open
                onClose={() => {}}
                projectionList={projectionList}
                selectedProjection="EPSG:4326"
                setConfig={() => {}}
                onSelect={() => {}}
                projectionDefs={[]}
            />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        expect(dialog).toExist();
        expect(dialog.querySelector('.ms-crs-projections-list')).toExist();
    });

    it('should filter projections based on filterText', () => {
        const projectionList = [
            { value: 'EPSG:4326', label: 'WGS84' },
            { value: 'EPSG:3857', label: 'Web Mercator' },
            { value: 'EPSG:32632', label: 'UTM Zone 32N' }
        ];
        ReactDOM.render(
            <AvailableProjections
                open
                onClose={() => {}}
                projectionList={projectionList}
                selectedProjection="EPSG:4326"
                setConfig={() => {}}
                onSelect={() => {}}
                projectionDefs={[]}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById("crs-available-projections-dialog");
        const filterInput = container.querySelector('input[type="text"]');
        expect(filterInput).toExist();
        TestUtils.Simulate.change(filterInput, { target: { value: 'WGS' } });
        setTimeout(() => {
            const projectionItems = container.querySelectorAll('.ms-crs-projection-item');
            expect(projectionItems.length).toBe(1);
            expect(container.innerHTML).toContain('WGS84');
            expect(container.innerHTML).toNotContain('Web Mercator');
        }, 10);
    });

    it('should disable save button when projectionList is empty', () => {
        ReactDOM.render(
            <AvailableProjections
                open
                onClose={() => {}}
                projectionList={[]}
                selectedProjection={null}
                setConfig={() => {}}
                onSelect={() => {}}
                projectionDefs={[]}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById("crs-available-projections-dialog");
        const footer = container.querySelector('[role="footer"]');
        expect(footer).toExist();
        const buttons = footer.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        const saveButton = Array.from(buttons).find(btn => btn.getAttribute('bsStyle') === 'primary' || btn.className.includes('btn-primary'));
        expect(saveButton).toExist();
        expect(saveButton.disabled).toBe(true);
    });
});
