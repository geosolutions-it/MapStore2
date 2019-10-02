/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const FloatingLegend = require('../FloatingLegend');
const expect = require('expect');
const TestUtils = require('react-dom/test-utils');

describe('tests FloatingLegend component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component', () => {
        const cmp = ReactDOM.render(<FloatingLegend />, document.getElementById("container"));
        expect(cmp).toExist();

        const toggleButtonContainer = document.getElementById('ms-legend-action');
        expect(toggleButtonContainer).toExist();
        expect(toggleButtonContainer.children.length).toBe(1);

        const toggleButtonPlaceholder = toggleButtonContainer.children[0];
        expect(toggleButtonPlaceholder.getAttribute('class')).toBe('glyphicon glyphicon-1-map');
    });

    it('render width layers', () => {
        const cmp = ReactDOM.render(
            <FloatingLegend
                expanded
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms'
                    },
                    {
                        name: 'layer:01',
                        title: 'Layer:01',
                        visibility: false,
                        type: 'wms',
                        opacity: 0.5
                    }
                ]}/>, document.getElementById("container"));

        expect(cmp).toExist();

        const layers = document.getElementsByClassName('mapstore-side-card');
        expect(layers.length).toBe(2);

        const sliders = document.getElementsByClassName('mapstore-slider');
        expect(sliders.length).toBe(1);

        const visibleLayer = document.getElementsByClassName('glyphicon-eye-open');
        expect(visibleLayer.length).toBe(1);
    });

    it('render layers that have no title', () => {
        const cmp = ReactDOM.render(
            <FloatingLegend
                expanded
                layers={[
                    {
                        name: 'layer:00',
                        visibility: true,
                        type: 'wms'
                    }
                ]}/>, document.getElementById("container"));

        expect(cmp).toExist();

        const title = document.getElementsByClassName('mapstore-side-card-title')[0].childNodes[0].childNodes[0].data;
        expect(title).toBe('layer:00');
    });

    it('render width layers and disabled opacity slider', () => {
        const cmp = ReactDOM.render(
            <FloatingLegend
                expanded
                disableOpacitySlider
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms'
                    },
                    {
                        name: 'layer:01',
                        title: 'Layer:01',
                        visibility: false,
                        type: 'wms',
                        opacity: 0.5
                    }
                ]}/>, document.getElementById("container"));

        expect(cmp).toExist();

        const layers = document.getElementsByClassName('mapstore-side-card');
        expect(layers.length).toBe(2);

        const sliders = document.getElementsByClassName('mapstore-slider');
        expect(sliders.length).toBe(0);

        const visibleLayer = document.getElementsByClassName('glyphicon-eye-open');
        expect(visibleLayer.length).toBe(1);
    });

    it('on expand', () => {

        const actions = {
            onExpand: () => {}
        };

        const spyExpand = expect.spyOn(actions, 'onExpand');

        ReactDOM.render(
            <FloatingLegend
                onExpand={actions.onExpand}
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms'
                    }
                ]}/>, document.getElementById("container"));

        let expandButton = document.getElementsByClassName('square-button-md')[0];
        expect(expandButton.children[0].getAttribute('class')).toBe('glyphicon glyphicon-chevron-down');

        TestUtils.Simulate.click(expandButton);
        expect(spyExpand).toHaveBeenCalledWith(false);

        ReactDOM.render(
            <FloatingLegend
                expanded={false}
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms'
                    }
                ]}/>, document.getElementById("container"));

        expandButton = document.getElementsByClassName('square-button-md')[0];
        expect(expandButton.children[0].getAttribute('class')).toBe('glyphicon glyphicon-chevron-left');

    });

    it('on change', () => {

        const actions = {
            onChange: () => {}
        };

        const spyChange = expect.spyOn(actions, 'onChange');

        ReactDOM.render(
            <FloatingLegend
                onChange={actions.onChange}
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms'
                    }
                ]}/>, document.getElementById("container"));

        const visibilityButton = document.getElementsByClassName('glyphicon-eye-open')[0];
        TestUtils.Simulate.click(visibilityButton);
        expect(spyChange).toHaveBeenCalled();
    });

    it('update height', (done) => {
        const deltaHeight = 110;

        let cmp = ReactDOM.render(
            <FloatingLegend
                expanded
                deltaHeight={deltaHeight}
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms'
                    },
                    {
                        name: 'layer:01',
                        title: 'Layer:01',
                        visibility: false,
                        type: 'wms',
                        opacity: 0.5
                    }
                ]}/>, document.getElementById("container"));

        expect(cmp).toExist();

        expect(cmp.list).toExist();
        const list = ReactDOM.findDOMNode(cmp.list);
        const prevListSize = list.clientHeight;

        const onResize = ({height}) => {
            try {
                const listSize = list.clientHeight;
                expect(prevListSize > listSize).toBe(true);
                expect(listSize === height - deltaHeight).toBe(true);
                done();
            } catch (e) {
                done(e);
            }
        };

        cmp = ReactDOM.render(
            <FloatingLegend
                expanded
                deltaHeight={deltaHeight}
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms'
                    }
                ]}
                onResize={onResize}/>, document.getElementById("container"));
    });

    it('expand on mount', () => {
        const actions = {
            onExpand: () => {}
        };

        const spyChange = expect.spyOn(actions, 'onExpand');
        ReactDOM.render(
            <FloatingLegend
                onExpand= {actions.onExpand}
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms'
                    }
                ]}/>, document.getElementById("container"));
        expect(spyChange).toHaveBeenCalledWith(true);
    });

    it('show tooltips', () => {
        const cmp = ReactDOM.render(
            <FloatingLegend
                expanded
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms',
                        opacity: 0.6
                    },
                    {
                        name: 'layer:01',
                        title: 'Layer:01',
                        visibility: false,
                        type: 'wms',
                        opacity: 0.5
                    },
                    {
                        name: 'layer:02',
                        title: 'layer:02',
                        visibility: true,
                        type: 'wms'
                    }
                ]}/>, document.getElementById("container"));

        expect(cmp).toExist();
        const tooltips = document.getElementsByClassName('noUi-tooltip');
        expect(tooltips.length).toBe(2);
        expect(tooltips[0].innerHTML).toBe('60 %');
        expect(tooltips[1].innerHTML).toBe('100 %');
    });

    it('hide tooltips', () => {
        const cmp = ReactDOM.render(
            <FloatingLegend
                expanded
                hideOpacityTooltip
                layers={[
                    {
                        name: 'layer:00',
                        title: 'Layer',
                        visibility: true,
                        type: 'wms',
                        opacity: 0.6
                    },
                    {
                        name: 'layer:01',
                        title: 'Layer:01',
                        visibility: false,
                        type: 'wms',
                        opacity: 0.5
                    },
                    {
                        name: 'layer:02',
                        title: 'layer:02',
                        visibility: true,
                        type: 'wms'
                    }
                ]}/>, document.getElementById("container"));

        expect(cmp).toExist();
        const tooltips = document.getElementsByClassName('noUi-tooltip');
        expect(tooltips.length).toBe(0);
    });
});
