import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import CRSSelectorPlugin from '../CRSSelector';
import { getPluginForTest, getByXPath } from './pluginsTestUtils';
import security from '../../reducers/security';
import ReactTestUtils from 'react-dom/test-utils';

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

    const CRSPluginCustomized = {
        ...CRSSelectorPlugin,
        reducers: {
            ...CRSSelectorPlugin.reducers,
            security
        }
    };

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
        const button = document.querySelector('.ms-prj-selector > button');
        expect(button.getAttribute('class').indexOf('btn-primary') !== -1).toBe(true);
    });
    it('render the plugin for role ADMIN with allowedRoles ADMIN, USER', () => {
        const { Plugin } = getPluginForTest(CRSPluginCustomized, {
            map: {
                projection: "EPSG:900913"
            },
            localConfig: {
                projectionDefs: []
            },
            security: {
                user: {
                    role: "ADMIN"
                }
            }
        });

        ReactDOM.render(<Plugin
            filterAllowedCRS={["EPSG:4326", "EPSG:3857"]}
            additionalCRS={{}}
            allowedRoles={["ADMIN", "USER"]}
        />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-prj-selector').length).toBe(1);
    });
    it('render the plugin for role USER with allowedRoles ADMIN, USER', () => {
        const { Plugin } = getPluginForTest(CRSPluginCustomized, {
            map: {
                projection: "EPSG:900913"
            },
            localConfig: {
                projectionDefs: []
            },
            security: {
                user: {
                    role: "ADMIN"
                }
            }
        });

        ReactDOM.render(<Plugin
            filterAllowedCRS={["EPSG:4326", "EPSG:3857"]}
            additionalCRS={{}}
            allowedRoles={["ADMIN", "USER"]}
        />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-prj-selector').length).toBe(1);
    });
    it('render the plugin ignoring user role USER if allowedRoles contains ALL', () => {
        const { Plugin } = getPluginForTest(CRSPluginCustomized, {
            map: {
                projection: "EPSG:900913"
            },
            localConfig: {
                projectionDefs: []
            },
            security: {
                user: {
                    role: "IGNORES_EVEN_FAKE_ROLES"
                }
            }
        });

        ReactDOM.render(<Plugin
            filterAllowedCRS={["EPSG:4326", "EPSG:3857"]}
            additionalCRS={{}}
            allowedRoles={["ALL"]}
        />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-prj-selector').length).toBe(1);
    });
    it('does not render the plugin for role that is not among allowedRoles', () => {
        const { Plugin } = getPluginForTest(CRSPluginCustomized, {
            map: {
                projection: "EPSG:900913"
            },
            localConfig: {
                projectionDefs: []
            },
            security: {
                user: {
                    role: "FAKE_ROLE"
                }
            }
        });

        ReactDOM.render(<Plugin
            filterAllowedCRS={["EPSG:4326", "EPSG:3857"]}
            additionalCRS={{}}
            allowedRoles={["ADMIN", "USER"]}
        />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-prj-selector').length).toBe(0);
    });


    it('CRSSelector is not rendered when Print Panel is enabled', () => {
        const { Plugin } = getPluginForTest(CRSPluginCustomized, {
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

    it('CRSSelector is not rendered when Annotations Editing is enabled', () => {
        const { Plugin } = getPluginForTest(CRSSelectorPlugin, {
            annotations: {
                editing: {
                    type: "FeatureCollection",
                    features: []
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

    it('error on switch with custom CRS and invalid background', () => {
        const { Plugin } = getPluginForTest(CRSSelectorPlugin, {
            map: {
                projection: "EPSG:3003"
            },
            layers: [{
                group: "background",
                visible: true,
                type: "unknown"
            }],
            localConfig: {
                projectionDefs: [{
                    "code": "EPSG:3003",
                    "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
                    "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
                    "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
                }]
            },
            security: {
                user: {
                    role: "USER"
                }
            }
        });

        const actions = {
            onError: () => {}
        };
        const spyError = expect.spyOn(actions, 'onError');

        ReactDOM.render(<Plugin
            pluginCfg={{
                onError: actions.onError
            }}
            filterAllowedCRS={["EPSG:4326", "EPSG:3857"]}
            additionalCRS={{
                "EPSG:3003": { "label": "EPSG:3003" }
            }}
            allowedRoles={["ALL"]}
        />, document.getElementById("container"));
        const switchButton = getByXPath("//button[text()='EPSG:3003']");
        expect(switchButton).toExist();
        ReactTestUtils.Simulate.click(switchButton);
        expect(spyError).toHaveBeenCalled();
    });

    it('switches to custom CRS with OSM background', () => {
        const { Plugin } = getPluginForTest(CRSSelectorPlugin, {
            map: {
                projection: "EPSG:3003"
            },
            layers: {
                flat: [{
                    group: "background",
                    visibility: true,
                    type: "osm"
                }]
            },
            localConfig: {
                projectionDefs: [{
                    "code": "EPSG:3003",
                    "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
                    "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
                    "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
                }]
            },
            security: {
                user: {
                    role: "USER"
                }
            }
        });

        const actions = {
            onError: () => {},
            setCrs: () => {}
        };
        const spyError = expect.spyOn(actions, 'onError');
        const spySet = expect.spyOn(actions, 'setCrs');

        ReactDOM.render(<Plugin
            pluginCfg={{
                onError: actions.onError,
                setCrs: actions.setCrs
            }}
            filterAllowedCRS={["EPSG:4326", "EPSG:3857"]}
            additionalCRS={{
                "EPSG:3003": { "label": "EPSG:3003" }
            }}
            allowedRoles={["ALL"]}
        />, document.getElementById("container"));
        const switchButton = getByXPath("//button[text()='EPSG:3003']");
        expect(switchButton).toExist();
        ReactTestUtils.Simulate.click(switchButton);
        expect(spyError).toNotHaveBeenCalled();
        expect(spySet).toHaveBeenCalledWith("EPSG:3003");
    });
});
