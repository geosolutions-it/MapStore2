import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import CRSSelectorPlugin from '../CRSSelector';
import { getPluginForTest } from './pluginsTestUtils';
import security from '../../reducers/security';

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
});
