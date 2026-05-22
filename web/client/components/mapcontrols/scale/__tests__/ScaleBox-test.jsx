/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import ScaleBox from '../ScaleBox';
import { getGoogleMercatorScale } from '../../../../utils/MapUtils';
import TestUtils from 'react-dom/test-utils';

describe('ScaleBox', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('create component with defaults', () => {
        const sb = ReactDOM.render(<ScaleBox />, document.getElementById("container"));
        expect(sb).toExist();
        const domNode = ReactDOM.findDOMNode(sb);
        expect(domNode).toExist();
        expect(domNode.id).toBe('mapstore-scalebox');

        const comboItems = Array.prototype.slice.call(domNode.getElementsByTagName('option'), 0);
        expect(comboItems.length).toBe(29);

        expect(comboItems.reduce((pre, cur, i) => {
            const scale = parseInt(cur.innerHTML.replace(/1\s\:\s/i, ''), 10);
            const testScale = Math.round(getGoogleMercatorScale(i));
            return pre && scale === testScale;
        }, true)).toBe(true);
        comboItems.map((option, index) => expect(parseInt(option.value, 10)).toBe(index));
        expect(comboItems.reduce((pre, cur, i) => {
            return pre && (i === 0 ? cur.selected : !cur.selected);
        }), true).toBe(true);
    });
    it('minZoom property filters options', () => {
        const sb = ReactDOM.render(<ScaleBox minZoom={2} />, document.getElementById("container"));
        expect(sb).toExist();
        const domNode = ReactDOM.findDOMNode(sb);
        expect(domNode).toExist();
        expect(domNode.id).toBe('mapstore-scalebox');

        const comboItems = Array.prototype.slice.call(domNode.getElementsByTagName('option'), 0);
        expect(comboItems.length).toBe(27);
        // values 0 and 1 should not be there, because minZoom = 2
        comboItems.map(option => expect(parseInt(option.value, 10)).toBeGreaterThanOrEqualTo(2));

        expect(comboItems.reduce((pre, cur, i) => {
            return pre && (i === 0 ? cur.selected : !cur.selected);
        }), true).toBe(true);
    });
    it('test handler for onChange event', () => {
        var newZoom;

        const sb = ReactDOM.render(<ScaleBox onChange={(z) => {newZoom = z; }}/>, document.getElementById("container"));
        expect(sb).toExist();
        const domNode = ReactDOM.findDOMNode(sb);
        expect(domNode).toExist();
        const domSelect = domNode.getElementsByTagName('select').item(0);
        expect(domSelect).toExist();

        domSelect.value = 5;
        TestUtils.Simulate.change(domSelect, {target: {value: 5}});
        expect(newZoom).toBe(5);
    });

    it('renders readOnly', () => {
        const sb = ReactDOM.render(<ScaleBox readOnly/>, document.getElementById("container"));
        expect(sb).toExist();
        const domNode = ReactDOM.findDOMNode(sb);
        expect(domNode).toExist();
        const domLabel = domNode.getElementsByTagName('label').item(0);
        expect(domLabel).toExist();
    });

    it('display zoom instead of scale', () => {
        const sb = ReactDOM.render(<ScaleBox readOnly display="zoom" />, document.getElementById("container"));
        expect(sb).toExist();
        const domNode = ReactDOM.findDOMNode(sb);
        expect(domNode).toExist();
        const domLabel = domNode.getElementsByTagName('label').item(0);
        expect(domLabel).toExist();
        expect(domLabel.innerHTML).toContain(0);
        TestUtils.act(() => { ReactDOM.render(<ScaleBox currentZoomLvl={5} display="zoom"/>, document.getElementById('container')); });
        const select = document.querySelector('select');
        expect(select.value).toBe('5');
        expect(select.options[5].innerHTML).toBe('5');

    });

    it('should support not rounded zoom levels', () => {
        TestUtils.act(() => { ReactDOM.render(<ScaleBox currentZoomLvl={5.1}/>, document.getElementById('container')); });
        const select = document.querySelector('select');
        expect(select.value).toBe('5');
    });

    it('renders editable scale selector when editScale is enabled', () => {
        TestUtils.act(() => {
            ReactDOM.render(
                <ScaleBox disableScaleLockingParms={{ editScale: true, ratio: 1 }} />,
                document.getElementById("container")
            );
        });
        const creatableContainer = document.querySelector('.scale-box-create-select');
        expect(creatableContainer).toExist();
        const regularSelect = document.querySelector('select');
        expect(regularSelect).toNotExist();
    });

    it('computes options from resolutions when disableScaleLockingParms.resolutions is provided', () => {
        const scales = [100000, 50000, 25000];
        const resolutions = [100, 50, 25];
        ReactDOM.render(
            <ScaleBox
                scales={scales}
                disableScaleLockingParms={{ ratio: 1, resolutions }}
            />,
            document.getElementById("container")
        );
        const options = document.querySelectorAll('option');
        expect(options.length).toBe(resolutions.length);
    });

    it('getScalesList updates options when resolutions change due to projection change', () => {
        const scales = [100000, 50000, 25000];
        const initialResolutions = [100, 50, 25];

        TestUtils.act(() => {
            ReactDOM.render(
                <ScaleBox
                    scales={scales}
                    disableScaleLockingParms={{ ratio: 1, resolutions: initialResolutions }}
                />,
                document.getElementById("container")
            );
        });
        expect(document.querySelectorAll('option').length).toBe(3);

        // simulate projection change: new CRS produces a different resolution set
        const updatedResolutions = [200, 100, 50, 25, 12];
        TestUtils.act(() => {
            ReactDOM.render(
                <ScaleBox
                    scales={scales}
                    disableScaleLockingParms={{ ratio: 1, resolutions: updatedResolutions }}
                />,
                document.getElementById("container")
            );
        });
        expect(document.querySelectorAll('option').length).toBe(updatedResolutions.length);
    });

    it('updateScales inserts a new scale in sorted descending order', () => {
        const sb = ReactDOM.render(<ScaleBox />, document.getElementById("container"));
        const existing = [{ value: 100000, zoom: 0 }, { value: 25000, zoom: 2 }];
        const result = sb.updateScales(existing, { value: 50000, zoom: 1 });
        expect(result.length).toBe(3);
        expect(result[0].value).toBe(100000);
        expect(result[1].value).toBe(50000);
        expect(result[2].value).toBe(25000);
    });

    it('updateScales does not duplicate a scale already in the list', () => {
        const sb = ReactDOM.render(<ScaleBox />, document.getElementById("container"));
        const existing = [{ value: 100000, zoom: 0 }, { value: 50000, zoom: 1 }];
        const result = sb.updateScales(existing, { value: 50000, zoom: 1 });
        expect(result.length).toBe(2);
    });

    it('handleChangeEditableScaleList calls onChange with zoom, scale and resolution for an existing option', () => {
        let calledWith = null;
        const scales = [100000, 50000, 25000];
        const resolutions = [100, 50, 25];
        const sb = ReactDOM.render(
            <ScaleBox
                scales={scales}
                disableScaleLockingParms={{ editScale: true, ratio: 1, resolutions }}
                onChange={(...args) => { calledWith = args; }}
            />,
            document.getElementById("container")
        );
        // option.zoom is set -> existing scale path
        sb.handleChangeEditableScaleList({ value: 1, zoom: 1, scale: 50000, label: '1 : 50,000' });
        expect(calledWith).toExist();
        expect(calledWith[0]).toBe(1);
        expect(calledWith[1]).toBe(50000);
        expect(calledWith[2]).toBe(50);
        expect(calledWith[3]).toEqual([100, 50, 25]);
    });

    it('handleChangeEditableScaleList adds new custom scale to state and calls onChange with updated resolutions', () => {
        let calledWith = null;
        const scales = [100000, 50000, 25000];
        const resolutions = [100, 50, 25];
        let sb;
        TestUtils.act(() => {
            sb = ReactDOM.render(
                <ScaleBox
                    scales={scales}
                    disableScaleLockingParms={{ editScale: true, ratio: 1, resolutions }}
                    onChange={(...args) => { calledWith = args; }}
                />,
                document.getElementById("container")
            );
        });
        TestUtils.act(() => {
            sb.handleChangeEditableScaleList({ value: 75000, label: 75000 });
        });
        expect(calledWith).toExist();
        expect(calledWith[1]).toBe(75000);
        expect(calledWith[2]).toBe(75);
        expect(calledWith[3].includes(75)).toBe(true);
        // the custom scale must appear in component state
        expect(sb.state.scales.some(s => s.value === 75000)).toBe(true);
    });

    it('custom scales survive a re-render', () => {
        const customScales = [5000, 10000, 50000, 100000, 500000];
        TestUtils.act(() => {
            ReactDOM.render(
                <ScaleBox scales={customScales} currentZoomLvl={0} />,
                document.getElementById("container")
            );
        });
        expect(document.querySelectorAll('option').length).toBe(5);
        TestUtils.act(() => {
            ReactDOM.render(
                <ScaleBox scales={customScales} currentZoomLvl={1} />,
                document.getElementById("container")
            );
        });
        expect(document.querySelectorAll('option').length).toBe(5);
        const select = document.querySelector('select');
        expect(select.value).toBe('1');
    });
});
