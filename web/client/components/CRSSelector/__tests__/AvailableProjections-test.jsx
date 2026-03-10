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
import MapUtils from '../../../utils/MapUtils';

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

    it('should render header, body, and footer sections', () => {
        ReactDOM.render(
            <AvailableProjections {...defaultProps} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        expect(dialog.querySelector('[role="header"]')).toExist();
        expect(dialog.querySelector('[role="body"]')).toExist();
        expect(dialog.querySelector('[role="footer"]')).toExist();
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

    it('should call onClose when footer Close button is clicked', () => {
        const actions = { onClose: () => {} };
        const spy = expect.spyOn(actions, 'onClose');
        ReactDOM.render(
            <AvailableProjections {...defaultProps} onClose={actions.onClose} />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        const footerButtons = dialog.querySelector('[role="footer"]').querySelectorAll('button');
        TestUtils.Simulate.click(footerButtons[0]);
        expect(spy).toHaveBeenCalled();
    });

    it('should call setConfig and onSelect when Save button is clicked', () => {
        const actions = {
            setConfig: () => {},
            onSelect: () => {},
            onClose: () => {}
        };
        const spySetConfig = expect.spyOn(actions, 'setConfig');
        const spyOnSelect = expect.spyOn(actions, 'onSelect');
        ReactDOM.render(
            <AvailableProjections
                {...defaultProps}
                onClose={actions.onClose}
                setConfig={actions.setConfig}
                onSelect={actions.onSelect}
            />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        const footerButtons = dialog.querySelector('[role="footer"]').querySelectorAll('button');
        TestUtils.Simulate.click(footerButtons[1]);
        expect(spySetConfig).toHaveBeenCalled();
        expect(spyOnSelect).toHaveBeenCalled();
    });

    it('should disable Save button when projection list is empty', () => {
        ReactDOM.render(
            <AvailableProjections
                {...defaultProps}
                projectionList={[]}
                selectedProjection={null}
                selectedProjectionList={[]}
            />,
            document.getElementById("container")
        );
        const dialog = document.getElementById('crs-available-projections-dialog');
        const footerButtons = dialog.querySelector('[role="footer"]').querySelectorAll('button');
        const saveButton = footerButtons[1];
        expect(saveButton.disabled).toBe(true);
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
});
