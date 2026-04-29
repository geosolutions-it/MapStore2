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
import MapUtils from '../../../../utils/MapUtils';

const defaultProjectionList = [
    { value: 'EPSG:4326', label: 'WGS 84' },
    { value: 'EPSG:3857', label: 'WGS 84 / Pseudo-Mercator' }
];

const defaultProps = {
    open: true,
    onClose: () => {},
    projectionList: defaultProjectionList,
    selectedProjection: 'EPSG:4326',
    selectedProjectionList: defaultProjectionList,
    setConfig: () => {},
    onSelect: () => {}
};

describe('AvailableProjections component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should not render when open is false', () => {
        ReactDOM.render(
            <AvailableProjections {...defaultProps} open={false} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        expect(dialog).toNotExist();
    });

    it('should render dialog when open is true', () => {
        ReactDOM.render(
            <AvailableProjections {...defaultProps} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        expect(dialog).toExist();
    });

    it('should render header and body sections', () => {
        ReactDOM.render(
            <AvailableProjections {...defaultProps} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        expect(dialog.querySelector('[role="header"]')).toExist();
        expect(dialog.querySelector('[role="body"]')).toExist();
    });

    it('should render the search input', () => {
        ReactDOM.render(
            <AvailableProjections {...defaultProps} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        const input = dialog.querySelector('input[type="text"]');
        expect(input).toExist();
    });

    it('should call onClose when header close button is clicked', () => {
        const actions = { onClose: () => {} };
        const spy = expect.spyOn(actions, 'onClose');
        ReactDOM.render(
            <AvailableProjections {...defaultProps} onClose={actions.onClose} />,
            document.getElementById("container")
        );
        const closeBtn = document.querySelector('.settings-panel-close');
        expect(closeBtn).toExist();
        TestUtils.Simulate.click(closeBtn);
        expect(spy).toHaveBeenCalled();
    });

    it('should render the projection list container', () => {
        ReactDOM.render(
            <AvailableProjections {...defaultProps} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        expect(dialog.querySelector('.ms-crs-projections-list')).toExist();
    });

    it('should render the map preview container', () => {
        ReactDOM.render(
            <AvailableProjections {...defaultProps} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        expect(dialog.querySelector('.ms-crs-projections-map')).toExist();
    });

    it('should not overwrite global ZOOM_TO_EXTENT_HOOK when rendered', () => {
        // The preview map must not register hooks to avoid overwriting
        // the main map's ZOOM_TO_EXTENT_HOOK, which would break zoom-to-extent
        // after closing the CRS selector dialog
        const sentinelHook = () => 'sentinel';
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK, sentinelHook);

        ReactDOM.render(
            <AvailableProjections {...defaultProps} />,
            document.getElementById("container")
        );
        expect(MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK)).toBe(sentinelHook);

        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        expect(MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK)).toBe(sentinelHook);

        MapUtils.clearHooks();
    });

    it('should filter projections based on search input', (done) => {
        ReactDOM.render(
            <AvailableProjections {...defaultProps} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        const input = dialog.querySelector('input[type="text"]');
        TestUtils.Simulate.change(input, { target: { value: '4326' } });

        // Allow state to update
        setTimeout(() => {
            const items = dialog.querySelectorAll('.ms-crs-projection-item');
            // Only EPSG:4326 should match the filter
            let found4326 = false;
            items.forEach(item => {
                if (item.textContent.includes('EPSG:4326')) {
                    found4326 = true;
                }
            });
            expect(found4326).toBe(true);
            done();
        }, 50);
    });

    it('toggling a checkbox calls setConfig with the updated quick-switch list (live update)', () => {
        const setConfigCalls = [];
        ReactDOM.render(
            <AvailableProjections
                {...defaultProps}
                setConfig={(cfg) => setConfigCalls.push(cfg)}
                selectedProjectionList={[defaultProjectionList[0]]}
            />,
            document.getElementById("container")
        );
        const items = document.querySelectorAll('.ms-crs-projection-item');
        // Row order matches defaultProjectionList; second row (3857) is unchecked
        const checkbox = items[1].querySelector('input[type="checkbox"]');
        TestUtils.Simulate.change(checkbox, { target: { checked: true } });
        expect(setConfigCalls.length).toBe(1);
        expect(setConfigCalls[0].projectionList.map(p => p.value)).toEqual(['EPSG:4326', 'EPSG:3857']);
    });

    it('unchecking the current map projection auto-selects the first remaining entry', () => {
        const setConfigCalls = [];
        const selectCalls = [];
        ReactDOM.render(
            <AvailableProjections
                {...defaultProps}
                setConfig={(cfg) => setConfigCalls.push(cfg)}
                onSelect={(code) => selectCalls.push(code)}
                selectedProjection="EPSG:4326"
                selectedProjectionList={defaultProjectionList}
            />,
            document.getElementById("container")
        );
        const items = document.querySelectorAll('.ms-crs-projection-item');
        const checkbox = items[0].querySelector('input[type="checkbox"]');
        TestUtils.Simulate.change(checkbox, { target: { checked: false } });
        expect(setConfigCalls.length).toBe(1);
        expect(setConfigCalls[0].projectionList.map(p => p.value)).toEqual(['EPSG:3857']);
        // Map's CRS would otherwise leave the list - fallback fires
        expect(selectCalls).toEqual(['EPSG:3857']);
    });

    it('clicking the empty star calls onSelect with the row code', () => {
        const selectCalls = [];
        ReactDOM.render(
            <AvailableProjections
                {...defaultProps}
                onSelect={(code) => selectCalls.push(code)}
                selectedProjection="EPSG:4326"
            />,
            document.getElementById("container")
        );
        const items = document.querySelectorAll('.ms-crs-projection-item');
        TestUtils.Simulate.click(items[1].querySelector('.glyphicon-star-empty'));
        expect(selectCalls).toEqual(['EPSG:3857']);
    });

    it('trash icon appears only for dynamic defs and triggers onRemoveProjectionDef', () => {
        const removeCalls = [];
        const dynamicProjectionList = [
            { value: 'EPSG:4326', label: 'WGS 84' },
            { value: 'EPSG:3003', label: 'Monte Mario' }
        ];
        ReactDOM.render(
            <AvailableProjections
                {...defaultProps}
                projectionList={dynamicProjectionList}
                selectedProjectionList={dynamicProjectionList}
                dynamicDefs={[{ code: 'EPSG:3003', label: 'Monte Mario' }]}
                onRemoveProjectionDef={(code) => removeCalls.push(code)}
            />,
            document.getElementById("container")
        );
        const items = document.querySelectorAll('.ms-crs-projection-item');
        // Row order follows projectionList: 0=EPSG:4326 (static), 1=EPSG:3003 (dynamic)
        expect(items[0].querySelector('.glyphicon-trash')).toNotExist();
        const trash = items[1].querySelector('.glyphicon-trash');
        expect(trash).toExist();
        TestUtils.Simulate.click(trash);
        expect(removeCalls).toEqual(['EPSG:3003']);
    });
});
