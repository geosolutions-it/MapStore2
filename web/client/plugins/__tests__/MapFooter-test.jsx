/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import MapFooterPlugin from '../MapFooter';
import { getPluginForTest } from './pluginsTestUtils';


const MAP_FOOTER_SELECTOR = '.mapstore-map-footer';
describe('MapFooter Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders MapFooter with default props', () => {
        const { Plugin } = getPluginForTest(MapFooterPlugin);
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const footer = document.querySelector(MAP_FOOTER_SELECTOR);
        expect(footer).toExist();
        expect(document.getElementById('footer-attribution-container')).toExist();
        expect(document.getElementById('footer-scalebar-container')).toExist();
    });

    it('renders MapFooter with custom className and style', () => {
        const customClassName = "custom-footer";
        const customStyle = { backgroundColor: "red" };
        const { Plugin } = getPluginForTest(MapFooterPlugin);

        ReactDOM.render(
            <Plugin
                className={customClassName}
                style={customStyle}
            />,
            document.getElementById("container")
        );

        const footer = document.querySelector(`.${customClassName}`);
        expect(footer).toExist();
        expect(footer.style.backgroundColor).toBe("red");
    });

    it('renders MapFooter with custom items', () => {
        const TestComponent = () => <div className="test-component">Test</div>;
        const { Plugin } = getPluginForTest(MapFooterPlugin);

        ReactDOM.render(
            <Plugin
                items={[
                    {
                        name: "TestComponent",
                        target: "left-footer",
                        position: 1,
                        Component: TestComponent
                    }
                ]}
            />,
            document.getElementById("container")
        );
        const testComponents = document.querySelectorAll('.test-component');
        expect(testComponents.length).toBe(1);
        const footer = document.querySelector(MAP_FOOTER_SELECTOR);
        expect(footer.contains(testComponents[0])).toBe(true);
    });

    it('renders items in correct positions based on target', () => {
        const LeftComponent = () => <div className="left-component">Left</div>;
        const RightComponent = () => <div className="right-component">Right</div>;
        const { Plugin } = getPluginForTest(MapFooterPlugin);

        ReactDOM.render(
            <Plugin
                items={[
                    {
                        name: "LeftComponent",
                        target: "left-footer",
                        position: 1,
                        Component: LeftComponent
                    },
                    {
                        name: "RightComponent",
                        target: "right-footer",
                        position: 1,
                        Component: RightComponent
                    }
                ]}
            />,
            document.getElementById("container")
        );
        const leftComponents = document.querySelectorAll('.left-component');
        const rightComponents = document.querySelectorAll('.right-component');
        expect(leftComponents.length).toBe(1);
        expect(rightComponents.length).toBe(1);

        const footer = document.querySelector(MAP_FOOTER_SELECTOR);
        expect(footer.contains(leftComponents[0])).toBe(true);
        expect(footer.contains(rightComponents[0])).toBe(true);
    });

    it('renders items in the correct order based on position', () => {
        const First = () => <div className="first-component">First</div>;
        const Second = () => <div className="second-component">Second</div>;
        const { Plugin } = getPluginForTest(MapFooterPlugin);

        ReactDOM.render(
            <Plugin
                items={[
                    {
                        name: "Second",
                        target: "left-footer",
                        position: 2,
                        Component: Second
                    },
                    {
                        name: "First",
                        target: "left-footer",
                        position: 1,
                        Component: First
                    }
                ]}
            />,
            document.getElementById("container")
        );
        const footer = document.querySelector(MAP_FOOTER_SELECTOR);
        const components = footer.querySelectorAll('.first-component, .second-component');
        let firstPosition = -1;
        let secondPosition = -1;

        for (let i = 0; i < components.length; i++) {
            if (components[i].className.includes('first-component')) {
                firstPosition = i;
            } else if (components[i].className.includes('second-component')) {
                secondPosition = i;
            }
        }

        expect(firstPosition).toBeLessThan(secondPosition);
    });

    it('maintains fixed elements (Attribution and ScaleBar)', () => {
        const { Plugin } = getPluginForTest(MapFooterPlugin);

        ReactDOM.render(<Plugin />, document.getElementById("container"));

        expect(document.getElementById('footer-attribution-container')).toExist();
        expect(document.getElementById('footer-scalebar-container')).toExist();
    });
});
