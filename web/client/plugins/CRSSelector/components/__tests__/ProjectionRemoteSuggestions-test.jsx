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

import { ProjectionRemoteSuggestions, formatCRSItem } from '../ProjectionRemoteSuggestions';

const baseProps = {
    addedCodes: new Set(),
    loadingCodes: new Set(),
    failedCodes: {},
    loading: false,
    total: 0,
    canLoadMore: false,
    onLoadMore: () => {},
    onPick: () => {},
    addedTitle: 'added',
    loadingTitle: 'loading',
    failedTitle: 'failed'
};

describe('ProjectionRemoteSuggestions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders the empty state when there are no suggestions and not loading', () => {
        ReactDOM.render(
            <ProjectionRemoteSuggestions {...baseProps} suggestions={[]} />,
            document.getElementById("container")
        );
        expect(document.querySelector('.ms-crs-popover-empty')).toExist();
        expect(document.querySelectorAll('.ms-crs-popover-suggestion').length).toBe(0);
    });

    it('hides the empty state while loading and shows a spinner', () => {
        ReactDOM.render(
            <ProjectionRemoteSuggestions {...baseProps} suggestions={[]} loading />,
            document.getElementById("container")
        );
        expect(document.querySelector('.ms-crs-popover-empty')).toNotExist();
        expect(document.querySelector('.ms-crs-popover-loading .ms-spinner')).toExist();
    });

    it('renders one row per suggestion using formatCRSItem', () => {
        const suggestions = [
            { id: 'epsg:3003', label: 'Monte Mario' },
            // Blank label falls back to id, so label === value and the code
            // span is omitted (single-text-only row).
            { id: 'epsg:25832', label: '' }
        ];
        ReactDOM.render(
            <ProjectionRemoteSuggestions {...baseProps} suggestions={suggestions} total={2} />,
            document.getElementById("container")
        );
        const rows = document.querySelectorAll('.ms-crs-popover-suggestion');
        expect(rows.length).toBe(2);
        // First row: full label, code rendered separately because label !== value
        expect(rows[0].querySelector('.ms-crs-popover-suggestion-label').textContent).toBe('Monte Mario');
        expect(rows[0].querySelector('.ms-crs-popover-suggestion-code').textContent).toBe('epsg:3003');
        // Second row: blank label falls back to id, label === value, code span omitted
        expect(rows[1].querySelector('.ms-crs-popover-suggestion-label').textContent).toBe('epsg:25832');
        expect(rows[1].querySelector('.ms-crs-popover-suggestion-code')).toNotExist();
    });

    it('clicking a default row calls onPick with the row code (id case preserved)', () => {
        const picks = [];
        ReactDOM.render(
            <ProjectionRemoteSuggestions
                {...baseProps}
                suggestions={[{ id: 'epsg:3003', label: 'Monte Mario' }]}
                total={1}
                onPick={(code) => picks.push(code)}
            />,
            document.getElementById("container")
        );
        const row = document.querySelector('.ms-crs-popover-suggestion.is-interactive');
        expect(row).toExist();
        TestUtils.Simulate.click(row);
        expect(picks).toEqual(['epsg:3003']);
    });

    it('marks already-added rows as non-interactive and ignores clicks', () => {
        const picks = [];
        ReactDOM.render(
            <ProjectionRemoteSuggestions
                {...baseProps}
                suggestions={[{ id: 'epsg:3003', label: 'Monte Mario' }]}
                addedCodes={new Set(['epsg:3003'])}
                total={1}
                onPick={(code) => picks.push(code)}
            />,
            document.getElementById("container")
        );
        const row = document.querySelector('.ms-crs-popover-suggestion');
        expect(row.classList.contains('is-added')).toBe(true);
        expect(row.classList.contains('is-interactive')).toBe(false);
        // Green check icon, no plus
        expect(row.querySelector('.glyphicon-ok')).toExist();
        expect(row.querySelector('.glyphicon-plus')).toNotExist();
        TestUtils.Simulate.click(row);
        expect(picks.length).toBe(0);
    });

    it('renders a spinner and ignores clicks while a row is loading', () => {
        const picks = [];
        ReactDOM.render(
            <ProjectionRemoteSuggestions
                {...baseProps}
                suggestions={[{ id: 'epsg:3003', label: 'Monte Mario' }]}
                loadingCodes={new Set(['epsg:3003'])}
                total={1}
                onPick={(code) => picks.push(code)}
            />,
            document.getElementById("container")
        );
        const row = document.querySelector('.ms-crs-popover-suggestion');
        expect(row.classList.contains('is-loading')).toBe(true);
        expect(row.querySelector('.ms-spinner')).toExist();
        TestUtils.Simulate.click(row);
        expect(picks.length).toBe(0);
    });

    it('flags failed rows and keeps them clickable for retry', () => {
        const picks = [];
        ReactDOM.render(
            <ProjectionRemoteSuggestions
                {...baseProps}
                suggestions={[{ id: 'epsg:3003', label: 'Monte Mario' }]}
                failedCodes={{ 'epsg:3003': 'Network error' }}
                total={1}
                onPick={(code) => picks.push(code)}
            />,
            document.getElementById("container")
        );
        const row = document.querySelector('.ms-crs-popover-suggestion');
        expect(row.classList.contains('is-failed')).toBe(true);
        // Failed rows stay interactive so the user can retry the fetch
        expect(row.classList.contains('is-interactive')).toBe(true);
        expect(row.querySelector('.glyphicon-exclamation-sign')).toExist();
        TestUtils.Simulate.click(row);
        expect(picks).toEqual(['epsg:3003']);
    });

    it('renders Load more only when more results exist and not loading', () => {
        // canLoadMore false, no button
        const props = {
            ...baseProps,
            suggestions: [{ id: 'epsg:3003', label: 'Monte Mario' }],
            total: 1,
            canLoadMore: false
        };
        ReactDOM.render(<ProjectionRemoteSuggestions {...props} />, document.getElementById("container"));
        expect(document.querySelector('.ms-crs-popover-load-more')).toNotExist();

        // canLoadMore true + not loading + has suggestions => button shows
        ReactDOM.render(
            <ProjectionRemoteSuggestions {...props} canLoadMore total={5} />,
            document.getElementById("container")
        );
        expect(document.querySelector('.ms-crs-popover-load-more')).toExist();

        // Loading hides the button regardless of canLoadMore
        ReactDOM.render(
            <ProjectionRemoteSuggestions {...props} canLoadMore total={5} loading />,
            document.getElementById("container")
        );
        expect(document.querySelector('.ms-crs-popover-load-more')).toNotExist();
    });

    it('Load more button calls onLoadMore', () => {
        let calls = 0;
        ReactDOM.render(
            <ProjectionRemoteSuggestions
                {...baseProps}
                suggestions={[{ id: 'epsg:3003', label: 'Monte Mario' }]}
                canLoadMore
                total={5}
                onLoadMore={() => { calls += 1; }}
            />,
            document.getElementById("container")
        );
        const button = document.querySelector('.ms-crs-popover-load-more');
        TestUtils.Simulate.click(button);
        expect(calls).toBe(1);
    });
});

describe('formatCRSItem', () => {
    it('preserves the id casing for value, strips the colon for the key, falls back to id when label is blank', () => {
        expect(formatCRSItem({ id: 'epsg:3003', label: 'Monte Mario' })).toEqual({
            key: 'epsg3003',
            value: 'epsg:3003',
            label: 'Monte Mario'
        });
        expect(formatCRSItem({ id: 'EPSG:25832', label: '   ' })).toEqual({
            key: 'epsg25832',
            value: 'EPSG:25832',
            label: 'EPSG:25832'
        });
        expect(formatCRSItem({ id: 'epsg:4326' })).toEqual({
            key: 'epsg4326',
            value: 'epsg:4326',
            label: 'epsg:4326'
        });
    });
});
