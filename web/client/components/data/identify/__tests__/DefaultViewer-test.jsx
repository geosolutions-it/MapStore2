/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import DefaultViewer from '../DefaultViewer.jsx';
import SwipeHeader from '../SwipeHeader';
import {
    createExternalDataCacheKey,
    getExternalDataCacheEntry,
    setExternalDataCacheEntry
} from '../../../../utils/mapinfo/ExternalDataCache';

import expect from 'expect';

describe('DefaultViewer', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the DefaultViewer component with defaults', () => {
        const viewer = ReactDOM.render(
            <DefaultViewer/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
    });

    it('creates the DefaultViewer component with custom container', () => {
        const Container = () => <div className="mycontainer"/>;
        const viewer = ReactDOM.render(
            <DefaultViewer container={Container} requests={["TEST"]}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("mycontainer").length).toBe(1);
    });

    it('creates the DefaultViewer component with custom header', () => {
        const responses = [{
            response: "A",
            layerMetadata: {
                title: 'a'
            }
        }];
        const Header = () => <div className="mycontainer"/>;
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses} header={Header} requests={["TEST"]}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("mycontainer").length).toBe(1);
    });

    it('creates the DefaultViewer component with custom validator', () => {
        const validator = () => ({
            getValidResponses: () => [{
                response: "A",
                layerMetadata: {
                    title: 'a'
                }
            }, {
                response: "B",
                layerMetadata: {
                    title: 'b'
                }
            }],
            getNoValidResponses: () => [{
                response: "C",
                layerMetadata: {
                    title: 'c'
                }
            }]
        });
        const viewer = ReactDOM.render(
            <DefaultViewer validator={validator} renderValidOnly/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("panel").length).toBe(2);
        expect(dom.getElementsByClassName("alert").length).toBe(1);
    });

    it('creates the DefaultViewer component with no results', () => {
        const viewer = ReactDOM.render(
            <DefaultViewer emptyResponses/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(1);
    });

    it('creates the DefaultViewer component with an empty and an non empty layer results', () => {
        const responses = [{
            response: "A",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "no features were found",
            layerMetadata: {
                title: 'b'
            }
        }];
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(1);
        expect(dom.getElementsByClassName("panel").length).toBe(2);

        // Desktop view
        const gfiViewer = document.querySelector('.mapstore-identify-viewer');
        const alertInfo = document.querySelector('.alert-info');
        const swipeableView = document.querySelector('.swipeable-view');
        expect(gfiViewer).toBeTruthy();
        expect(gfiViewer.childNodes.length).toBe(2);
        expect(gfiViewer.childNodes[0]).toEqual(swipeableView);
        expect(gfiViewer.childNodes[1]).toEqual(alertInfo);
    });

    it('creates the DefaultViewer component with Identify floating', () => {
        const responses = [{
            response: "A",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "no features were found",
            layerMetadata: {
                title: 'b'
            }
        }];
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses} renderValidOnly/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(1);
        expect(dom.getElementsByClassName("panel").length).toBe(1);
    });

    it('creates the DefaultViewer component with some results', () => {
        const responses = [{
            response: "A",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "B",
            layerMetadata: {
                title: 'b'
            }
        }];
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses} requests={["TEST"]}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(0);
    });

    it('renders an EXTERNAL_DATA view with ExternalDataViewer', () => {
        const validator = () => ({
            getValidResponses: (responses) => responses,
            getNoValidResponses: () => []
        });
        ReactDOM.render(
            <DefaultViewer
                validator={validator}
                requests={[{reqId: 'external-request'}]}
                responses={[{
                    reqId: 'external-request',
                    response: {features: [{id: 'source.1', properties: {}}]},
                    queryParams: {info_format: 'application/json'},
                    layerMetadata: {
                        featureInfo: {
                            views: [{
                                id: 'external',
                                type: 'EXTERNAL_DATA',
                                featuresService: {
                                    url: '/external/wfs',
                                    typeName: 'workspace:external',
                                    cqlFilter: "source_id = '${properties.sourceId}'"
                                }
                            }]
                        }
                    }
                }]}/>,
            document.getElementById("container")
        );

        expect(document.querySelector('.ms-external-data-viewer')).toExist();
        expect(document.querySelector('.mapstore-json-viewer')).toNotExist();
    });


    it('clears external data cache entries when identify responses are removed', () => {
        const key = createExternalDataCacheKey({
            identifyRequestId: 'identify-cache',
            sourceFeatureId: 'feature-1',
            sourceFeatureIndex: 0,
            url: '/external/wfs',
            typeName: 'workspace:external',
            cqlFilter: "source_id = '1'"
        });
        setExternalDataCacheEntry(key, Promise.resolve({}), 'identify-cache');

        ReactDOM.render(
            <DefaultViewer
                responses={[{
                    reqId: 'identify-cache',
                    response: 'A',
                    layerMetadata: { title: 'Layer' }
                }]}
                requests={[{ reqId: 'identify-cache' }]}/>,
            document.getElementById("container")
        );
        ReactDOM.render(
            <DefaultViewer responses={[]}/>,
            document.getElementById("container")
        );

        expect(getExternalDataCacheEntry(key)).toNotExist();
    });

    it('clears external data cache entries when the viewer unmounts', () => {
        const key = createExternalDataCacheKey({
            identifyRequestId: 'identify-unmount',
            sourceFeatureId: 'feature-1',
            sourceFeatureIndex: 0,
            url: '/external/wfs',
            typeName: 'workspace:external',
            cqlFilter: "source_id = '1'"
        });
        setExternalDataCacheEntry(key, Promise.resolve({}), 'identify-unmount');
        const container = document.getElementById('container');

        ReactDOM.render(
            <DefaultViewer
                responses={[{
                    reqId: 'identify-unmount',
                    response: 'A',
                    layerMetadata: { title: 'Layer' }
                }]}
                requests={[{ reqId: 'identify-unmount' }]}/>,
            container
        );
        ReactDOM.unmountComponentAtNode(container);

        expect(getExternalDataCacheEntry(key)).toNotExist();
    });

    it('renders compact shared tabs for multiple identify views', () => {
        ReactDOM.render(
            <DefaultViewer
                requests={[{reqId: 'layer-1'}]}
                responses={[{
                    reqId: 'layer-1',
                    viewResponses: {
                        text: {
                            response: 'Text view',
                            queryParams: {info_format: 'text/plain'}
                        },
                        properties: {
                            response: {features: [{id: 'feature-1'}]},
                            queryParams: {info_format: 'application/json'}
                        }
                    },
                    layerMetadata: {
                        featureInfo: {
                            views: [
                                { id: 'text', title: 'Text', type: 'TEXT' },
                                { id: 'properties', title: 'Properties', type: 'PROPERTIES' }
                            ]
                        }
                    }
                }]}/>,
            document.getElementById("container")
        );

        const tabs = document.querySelectorAll('.ms-scrollable-tabs .nav > li > button');
        expect(tabs.length).toBe(2);
        expect(tabs[0].textContent).toBe('Text');
        expect(tabs[1].textContent).toBe('Properties');
        // an href would navigate away from the app
        expect(document.querySelectorAll('.ms-scrollable-tabs .nav a').length).toBe(0);
    });

    it('labels a view without title with its type', () => {
        ReactDOM.render(
            <DefaultViewer
                requests={[{reqId: 'layer-1'}]}
                responses={[{
                    reqId: 'layer-1',
                    layer: {id: 'layer-1'},
                    viewResponses: {
                        text: {
                            response: 'Text view content',
                            queryParams: {info_format: 'text/plain'}
                        },
                        properties: {
                            response: {features: [{id: 'feature-1', properties: {name: 'Feature 1'}}]},
                            queryParams: {info_format: 'application/json'}
                        }
                    },
                    layerMetadata: {
                        title: 'a',
                        featureInfo: {
                            views: [
                                { id: 'text', type: 'TEXT' },
                                { id: 'properties', title: 'Custom title', type: 'PROPERTIES' }
                            ]
                        }
                    }
                }]}/>,
            document.getElementById("container")
        );

        const tabs = document.querySelectorAll('.ms-scrollable-tabs .nav > li > button');
        expect(tabs.length).toBe(2);
        expect(tabs[0].textContent).toBe('layerProperties.textFormatTitle');
        expect(tabs[1].textContent).toBe('Custom title');
    });

    it('switches the rendered response when a view tab is clicked', () => {
        ReactDOM.render(
            <DefaultViewer
                requests={[{reqId: 'layer-1'}]}
                responses={[{
                    reqId: 'layer-1',
                    viewResponses: {
                        text: {
                            response: 'Text view content',
                            queryParams: {info_format: 'text/plain'}
                        },
                        properties: {
                            response: {features: [{id: 'feature-1', properties: {name: 'Feature 1'}}]},
                            queryParams: {info_format: 'application/json'}
                        }
                    },
                    layerMetadata: {
                        title: 'a',
                        featureInfo: {
                            views: [
                                { id: 'text', title: 'Text', type: 'TEXT' },
                                { id: 'properties', title: 'Properties', type: 'PROPERTIES' }
                            ]
                        }
                    }
                }]}/>,
            document.getElementById("container")
        );

        expect(document.querySelector('.nav > li.active > button').textContent).toBe('Text');
        expect(document.querySelectorAll('.mapstore-json-viewer').length).toBe(0);
        expect(document.querySelector('.swipeable-view').textContent).toContain('Text view content');

        const tabs = document.querySelectorAll('.ms-scrollable-tabs .nav > li > button');
        TestUtils.Simulate.click(tabs[1]);

        expect(document.querySelector('.nav > li.active > button').textContent).toBe('Properties');
        expect(document.querySelectorAll('.mapstore-json-viewer').length).toBe(1);
        expect(document.querySelector('.swipeable-view').textContent).toNotContain('Text view content');
    });

    it('keeps the layer navigation when an empty view is selected', () => {
        const responses = [{
            reqId: 'layer-1',
            layer: {id: 'layer-1'},
            viewResponses: {
                properties: {
                    response: {features: [{id: 'feature-1', properties: {name: 'Feature 1'}}]},
                    queryParams: {info_format: 'application/json'}
                },
                text: {
                    response: 'no features were found',
                    queryParams: {info_format: 'text/plain'}
                }
            },
            layerMetadata: {
                title: 'a',
                featureInfo: {
                    views: [
                        { id: 'properties', title: 'Properties', type: 'PROPERTIES' },
                        { id: 'text', title: 'Text', type: 'TEXT' }
                    ]
                }
            }
        }, {
            reqId: 'layer-2',
            layer: {id: 'layer-2'},
            response: 'Second layer',
            layerMetadata: {title: 'b'}
        }];
        ReactDOM.render(
            <DefaultViewer requests={[{reqId: 'layer-1'}, {reqId: 'layer-2'}]} responses={responses} header={SwipeHeader}/>,
            document.getElementById("container")
        );

        expect(document.querySelectorAll('.ms-identify-swipe-header-arrow').length).toBe(4);

        TestUtils.Simulate.click(document.querySelectorAll('.ms-scrollable-tabs .nav > li > button')[1]);

        expect(document.querySelector('.nav > li.active > button').textContent).toBe('Text');
        expect(document.querySelectorAll('.ms-identify-swipe-header-arrow').length).toBe(4);
    });

    it('keeps the selected view of a layer across identify requests', () => {
        const views = [
            { id: 'text', title: 'Text', type: 'TEXT' },
            { id: 'properties', title: 'Properties', type: 'PROPERTIES' }
        ];
        const buildResponse = (reqId) => ({
            reqId,
            layer: {id: 'layer-1'},
            viewResponses: {
                text: {
                    response: 'Text view content',
                    queryParams: {info_format: 'text/plain'}
                },
                properties: {
                    response: {features: [{id: 'feature-1', properties: {name: 'Feature 1'}}]},
                    queryParams: {info_format: 'application/json'}
                }
            },
            layerMetadata: {title: 'a', featureInfo: {views}}
        });
        const render = (reqId) => ReactDOM.render(
            <DefaultViewer requests={[{reqId}]} responses={[buildResponse(reqId)]}/>,
            document.getElementById("container")
        );

        render('req-1');
        TestUtils.Simulate.click(document.querySelectorAll('.ms-scrollable-tabs .nav > li > button')[1]);
        expect(document.querySelector('.nav > li.active > button').textContent).toBe('Properties');

        // a new identify on the same layer produces a new reqId
        render('req-2');
        expect(document.querySelector('.nav > li.active > button').textContent).toBe('Properties');
    });

    it('selects the first identify view with content', () => {
        ReactDOM.render(
            <DefaultViewer
                requests={[{reqId: 'layer-1'}]}
                responses={[{
                    reqId: 'layer-1',
                    viewResponses: {
                        text: {
                            response: 'no features were found',
                            queryParams: {info_format: 'text/plain'}
                        },
                        properties: {
                            response: {features: [{id: 'feature-1', properties: {name: 'Feature 1'}}]},
                            queryParams: {info_format: 'application/json'}
                        }
                    },
                    layerMetadata: {
                        title: 'a',
                        featureInfo: {
                            views: [
                                { id: 'text', title: 'Text', type: 'TEXT' },
                                { id: 'properties', title: 'Properties', type: 'PROPERTIES' }
                            ]
                        }
                    }
                }]}/>,
            document.getElementById("container")
        );

        expect(document.querySelector('.nav > li.active > button').textContent).toBe('Properties');
        expect(document.querySelectorAll('.mapstore-json-viewer').length).toBe(1);
        expect(document.querySelectorAll('.alert-danger').length).toBe(0);
        expect(document.querySelector('.swipeable-view').textContent).toNotContain('no features were found');
    });

    it('renders the empty message instead of the raw response of an empty identify view', () => {
        ReactDOM.render(
            <DefaultViewer
                requests={[{reqId: 'layer-1'}, {reqId: 'layer-2'}]}
                responses={[{
                    reqId: 'layer-1',
                    response: 'Text',
                    layerMetadata: {title: 'a'}
                }, {
                    reqId: 'layer-2',
                    viewResponses: {
                        text: {
                            response: 'no features were found',
                            queryParams: {info_format: 'text/plain'}
                        },
                        html: {
                            response: '<html><body></body></html>',
                            queryParams: {info_format: 'text/html'}
                        }
                    },
                    layerMetadata: {
                        title: 'b',
                        featureInfo: {
                            views: [
                                { id: 'text', title: 'Text', type: 'TEXT' },
                                { id: 'html', title: 'Html', type: 'HTML' }
                            ]
                        }
                    }
                }]}/>,
            document.getElementById("container")
        );

        expect(document.querySelectorAll('.alert-danger').length).toBe(1);
        expect(document.querySelector('.swipeable-view').textContent).toNotContain('no features were found');
    });

    it('creates the DefaultViewer component with missing results', () => {
        const viewer = ReactDOM.render(
            <DefaultViewer missingResponses={1}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("alert").length).toBe(0);
    });

    it('creates the DefaultViewer component with custom viewer', () => {
        const responses = [{
            response: "myresponse",
            layerMetadata: {
                title: 'a'
            }
        }];
        const viewers = {
            "custom": (props) => <span className="custom">{props.response}</span>
        };
        const viewer = ReactDOM.render(
            <DefaultViewer responses={responses} viewers={viewers} format="custom" requests={["TEST"]}/>,
            document.getElementById("container")
        );

        expect(viewer).toExist();
        const dom = ReactDOM.findDOMNode(viewer);
        expect(dom.getElementsByClassName("custom").length).toBe(1);
        expect(dom.innerHTML.indexOf('myresponse') !== -1).toBe(true);
    });

    it('test DefaultViewer component with header (Popup view)', () => {

        const responses = [{
            response: "no features were found",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "B",
            layerMetadata: {
                title: 'Layer1'
            }
        }];
        ReactDOM.render(
            <DefaultViewer responses={responses} header={SwipeHeader} renderValidOnly/>,
            document.getElementById("container")
        );
        const header = document.querySelector('.ms-identify-swipe-header');
        const panel = document.querySelectorAll('.panel');
        expect(header).toBeTruthy();
        expect(header.innerText).toBe('Layer1');
        expect(panel.length).toBe(1);
    });

    it('test DefaultViewer component in mobile view', () => {
        const responses = [{
            response: "no features were found",
            layerMetadata: {
                title: 'a'
            }
        }, {
            response: "B",
            layerMetadata: {
                title: 'Layer1'
            }
        }];
        // Mobile view
        ReactDOM.render(
            <DefaultViewer isMobile responses={responses} header={SwipeHeader}/>,
            document.getElementById("container")
        );

        const mobileContainer = document.getElementById('container');
        let gfiViewer = mobileContainer.querySelector('.mapstore-identify-viewer');
        let alertInfo = mobileContainer.querySelector('.alert-info');
        let swipeableView = mobileContainer.querySelector('.swipeable-view');
        expect(gfiViewer).toBeTruthy();
        expect(gfiViewer.childNodes.length).toBe(2);
        expect(gfiViewer.childNodes[0]).toEqual(alertInfo);
        expect(gfiViewer.childNodes[1]).toEqual(swipeableView);
        expect(gfiViewer.childNodes[1].childNodes.length).toBe(1);

    });
    it('test DefaultViewer component with hover identify if hidePopupIfNoResults = true', () => {
        const responses = [];
        ReactDOM.render(
            <DefaultViewer hidePopupIfNoResults responses={responses} header={SwipeHeader}/>,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        let gfiViewer = container.querySelector('.mapstore-identify-viewer');
        expect(gfiViewer).toBeTruthy();
        expect(gfiViewer.childNodes.length).toBe(1);
        expect(document.querySelector(".hidePopupIfNoResults")).toBeTruthy();
        expect(document.querySelector(".hidePopupIfNoResults").innerHTML).toBeFalsy();
    });
});
