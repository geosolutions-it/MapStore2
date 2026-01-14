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
import ProjectionList from '../ProjectionList';

describe('ProjectionList component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render projections list', () => {
        const filteredProjections = [
            { label: 'WGS84', authorityId: 'EPSG:4326' },
            { label: 'Web Mercator', authorityId: 'EPSG:3857' }
        ];
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                setConfig={() => {}}
                setHoveredCrs={() => {}}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById("container");
        expect(container.querySelectorAll('.ms-crs-projection-item').length).toBe(2);
        expect(container.innerHTML).toContain('WGS84');
        expect(container.innerHTML).toContain('EPSG:4326');
    });

    it('should handle checkbox changes', () => {
        const filteredProjections = [
            { label: 'WGS84', authorityId: 'EPSG:4326' }
        ];
        let configUpdates = [];
        const setConfig = (config) => { configUpdates.push(config); };
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                setConfig={setConfig}
                setHoveredCrs={() => {}}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById("container");
        const checkbox = container.querySelector('input[type="checkbox"]');
        TestUtils.Simulate.change(checkbox, { target: { checked: true } });
        expect(configUpdates.length).toBe(1);
        expect(configUpdates[0].projectionList).toContain('EPSG:4326');
    });

    it('should handle item clicks and hover events', () => {
        const filteredProjections = [
            { label: 'WGS84', authorityId: 'EPSG:4326' }
        ];
        let configUpdates = [];
        let hoveredCrs = null;
        const setConfig = (config) => { configUpdates.push(config); };
        const setHoveredCrs = (crs) => { hoveredCrs = crs; };
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                setConfig={setConfig}
                setHoveredCrs={setHoveredCrs}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById("container");
        const item = container.querySelector('.ms-crs-projection-item');
        TestUtils.Simulate.mouseEnter(item);
        expect(hoveredCrs).toBe('EPSG:4326');
        TestUtils.Simulate.click(item);
        expect(configUpdates.length).toBe(1);
        expect(configUpdates[0].defaultCrs).toBe('EPSG:4326');
    });
});
