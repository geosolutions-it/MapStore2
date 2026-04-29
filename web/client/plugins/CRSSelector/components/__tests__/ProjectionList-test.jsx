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
import { ProjectionList } from '../ProjectionList';

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
            { label: 'WGS84', value: 'EPSG:4326' },
            { label: 'Web Mercator', value: 'EPSG:3857' }
        ];
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                dynamicCodes={new Set()}
                onToggle={() => {}}
                onUseAsMapProjection={() => {}}
                onRemoveDynamic={() => {}}
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
            { label: 'WGS84', value: 'EPSG:4326' }
        ];
        const toggleCalls = [];
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                dynamicCodes={new Set()}
                onToggle={(next) => toggleCalls.push(next)}
                onUseAsMapProjection={() => {}}
                onRemoveDynamic={() => {}}
                setHoveredCrs={() => {}}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById("container");
        const checkbox = container.querySelector('input[type="checkbox"]');
        TestUtils.Simulate.change(checkbox, { target: { checked: true } });
        expect(toggleCalls.length).toBe(1);
        expect(toggleCalls[0].length).toBe(1);
        expect(toggleCalls[0][0].value).toBe('EPSG:4326');
        expect(toggleCalls[0][0].label).toBe('WGS84');
    });

    it('should handle item clicks and hover events', () => {
        const filteredProjections = [
            { label: 'WGS84', value: 'EPSG:4326' }
        ];
        const toggleCalls = [];
        let hoveredCrs = null;
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                dynamicCodes={new Set()}
                onToggle={(next) => toggleCalls.push(next)}
                onUseAsMapProjection={() => {}}
                onRemoveDynamic={() => {}}
                setHoveredCrs={(crs) => { hoveredCrs = crs; }}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById("container");
        const item = container.querySelector('.ms-crs-projection-item');
        TestUtils.Simulate.mouseEnter(item);
        expect(hoveredCrs).toBe('EPSG:4326');
        TestUtils.Simulate.click(item);
        expect(toggleCalls.length).toBe(1);
        expect(toggleCalls[0].length).toBe(1);
        expect(toggleCalls[0][0].value).toBe('EPSG:4326');
        expect(toggleCalls[0][0].label).toBe('WGS84');
    });

    it('renders the trash icon only for dynamic codes', () => {
        // Static codes (e.g. localConfig defs) cannot be removed, so the trash
        // glyph must only appear next to codes the dynamic registry owns.
        const filteredProjections = [
            { label: 'WGS84', value: 'EPSG:4326' },
            { label: 'Monte Mario', value: 'EPSG:3003' }
        ];
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                dynamicCodes={new Set(['EPSG:3003'])}
                onToggle={() => {}}
                onUseAsMapProjection={() => {}}
                onRemoveDynamic={() => {}}
                setHoveredCrs={() => {}}
            />,
            document.getElementById("container")
        );
        const items = document.querySelectorAll('.ms-crs-projection-item');
        // EPSG:4326 row (static) - no trash
        expect(items[0].querySelector('.glyphicon-trash')).toNotExist();
        // EPSG:3003 row (dynamic) - trash present
        expect(items[1].querySelector('.glyphicon-trash')).toExist();
    });

    it('clicking the trash icon calls onRemoveDynamic with the row code', () => {
        const filteredProjections = [
            { label: 'Monte Mario', value: 'EPSG:3003' }
        ];
        const removeCalls = [];
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                dynamicCodes={new Set(['EPSG:3003'])}
                onToggle={() => {}}
                onUseAsMapProjection={() => {}}
                onRemoveDynamic={(code) => removeCalls.push(code)}
                setHoveredCrs={() => {}}
            />,
            document.getElementById("container")
        );
        const trash = document.querySelector('.glyphicon-trash');
        TestUtils.Simulate.click(trash);
        expect(removeCalls).toEqual(['EPSG:3003']);
    });

    it('star glyph reflects current vs use-as-map state', () => {
        const filteredProjections = [
            { label: 'WGS84', value: 'EPSG:4326' },
            { label: 'Web Mercator', value: 'EPSG:3857' }
        ];
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                dynamicCodes={new Set()}
                onToggle={() => {}}
                onUseAsMapProjection={() => {}}
                onRemoveDynamic={() => {}}
                setHoveredCrs={() => {}}
            />,
            document.getElementById("container")
        );
        const items = document.querySelectorAll('.ms-crs-projection-item');
        // Current projection - filled star, marked is-active (no-op on click)
        expect(items[0].querySelector('.glyphicon-star')).toExist();
        expect(items[0].querySelector('.is-active')).toExist();
        // Other projection - empty star, plain action class
        expect(items[1].querySelector('.glyphicon-star-empty')).toExist();
        expect(items[1].querySelector('.is-active')).toNotExist();
    });

    it('clicking the empty star calls onUseAsMapProjection; the current star is a no-op', () => {
        const filteredProjections = [
            { label: 'WGS84', value: 'EPSG:4326' },
            { label: 'Web Mercator', value: 'EPSG:3857' }
        ];
        const useAsCalls = [];
        ReactDOM.render(
            <ProjectionList
                filteredProjections={filteredProjections}
                projectionList={[]}
                selectedProjection="EPSG:4326"
                dynamicCodes={new Set()}
                onToggle={() => {}}
                onUseAsMapProjection={(code) => useAsCalls.push(code)}
                onRemoveDynamic={() => {}}
                setHoveredCrs={() => {}}
            />,
            document.getElementById("container")
        );
        const items = document.querySelectorAll('.ms-crs-projection-item');
        TestUtils.Simulate.click(items[0].querySelector('.glyphicon-star'));
        expect(useAsCalls.length).toBe(0);
        TestUtils.Simulate.click(items[1].querySelector('.glyphicon-star-empty'));
        expect(useAsCalls).toEqual(['EPSG:3857']);
    });
});
