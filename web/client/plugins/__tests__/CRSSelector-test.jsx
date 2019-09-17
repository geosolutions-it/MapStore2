import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import CRSSelectorPlugin from '../CRSSelector';
import { getPluginForTest } from './pluginsTestUtils';

describe('CRSSelector Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Shows CRSSelector Plugin', () => {
        const { Plugin } = getPluginForTest(CRSSelectorPlugin, {
            map: {
                projection: "EPSG:900913"
            },
            localConfig: {
                projectionDefs: []
            }
        });

        ReactDOM.render(<Plugin filterAllowedCRS={["EPSG:4326", "EPSG:3857"]} additionalCRS={{}}/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-prj-selector').length).toBe(1);
    });

    it('CRSSelector is not rendered when Print Panel is enabled', () => {
        const { Plugin } = getPluginForTest(CRSSelectorPlugin, {
            controls: {
                print: {
                    enabled: true
                }
            },
            map: {
                projection: "EPSG:900913"
            },
            localConfig: {
                projectionDefs: []
            }
        });

        ReactDOM.render(<Plugin filterAllowedCRS={["EPSG:4326", "EPSG:3857"]} additionalCRS={{}}/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-prj-selector').length).toBe(0);
    });

    it('CRSSelector is not rendered when Measure Panel is enabled', () => {
        const { Plugin } = getPluginForTest(CRSSelectorPlugin, {
            controls: {
                measure: {
                    enabled: true
                }
            },
            map: {
                projection: "EPSG:900913"
            },
            localConfig: {
                projectionDefs: []
            }
        });

        ReactDOM.render(<Plugin filterAllowedCRS={["EPSG:4326", "EPSG:3857"]} additionalCRS={{}}/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-prj-selector').length).toBe(0);
    });

    it('CRSSelector is not rendered when Query Panel is enabled', () => {
        const { Plugin } = getPluginForTest(CRSSelectorPlugin, {
            controls: {
                queryPanel: {
                    enabled: true
                }
            },
            map: {
                projection: "EPSG:900913"
            },
            localConfig: {
                projectionDefs: []
            }
        });

        ReactDOM.render(<Plugin filterAllowedCRS={["EPSG:4326", "EPSG:3857"]} additionalCRS={{}}/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-prj-selector').length).toBe(0);
    });
});
