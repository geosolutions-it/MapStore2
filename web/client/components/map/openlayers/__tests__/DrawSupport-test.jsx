/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import assign from 'object-assign';
import DrawSupport from '../DrawSupport';
import {DEFAULT_ANNOTATIONS_STYLES} from '../../../../utils/AnnotationsUtils';
import {circle, geomCollFeature} from '../../../../test-resources/drawsupport/features';

import {Map, View, Feature} from 'ol';
import {Point, Circle, Polygon, LineString, MultiPoint, MultiPolygon, MultiLineString} from 'ol/geom';
import Collection from 'ol/Collection';

const viewOptions = {
    projection: 'EPSG:3857',
    center: [0, 0],
    zoom: 5
};
let olMap = new Map({
    target: "map",
    view: new View(viewOptions)
});
olMap.disableEventListener = () => {};

const testHandlers = {
    onStatusChange: () => {},
    onSelectFeatures: () => {},
    onGeometryChanged: () => {},
    onChangeDrawingStatus: () => {},
    onEndDrawing: () => {},
    onDrawingFeatures: () => {}
};

/*  used to render the DrawSupport component with some default props*/
const renderDrawSupport = (props = {}) => {
    return ReactDOM.render(
        <DrawSupport
            features={props.features | []}
            map={props.map || olMap}
            {...testHandlers}
            {...props}
        />, document.getElementById("container"));
};

/**
 * it renders Drawsupport in edit mode with singleclick Listener enabled and
 * it dispatches a singleclick mouse event
*/
const renderAndClick = (props = {}, options = {}) => {
    let support = renderDrawSupport();
    // entering UNSAFE_componentWillReceiveProps
    support = renderDrawSupport({
        drawStatus: "drawOrEdit",
        features: [props.feature],
        options: {
            drawEnabled: false,
            editEnabled: true,
            addClickCallback: true
        },
        ...props
    });
    support.props.map.dispatchEvent({
        type: "singleclick",
        coordinate: options.singleClickCoordiante || [500, 30]
    });
    return support;
};


describe('Test DrawSupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        document.body.innerHTML = '';
        olMap = new Map({
            target: "map",
            view: new View(viewOptions)
        });
        olMap.disableEventListener = () => {};

        expect.restoreSpies();
        setTimeout(done);
    });

    it('creates a default style when none is specified', () => {
        // create layers
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        expect(support.toOlStyle()).toExist();
    });

    it('creates a drawing layer', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})})
        };
        const spy = expect.spyOn(fakeMap, "addLayer");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Point"/>, document.getElementById("container"));
        expect(spy.calls.length).toBe(1);
    });

    it('starts drawing', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            enableEventListener: () => {},
            removeInteraction: () => {},
            removeLayer: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };
        const spyAddLayer = expect.spyOn(fakeMap, "addLayer");
        const spyAddInteraction = expect.spyOn(fakeMap, "addInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point"/>, document.getElementById("container"));
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="LineString  "/>, document.getElementById("container"));
        expect(spyAddLayer.calls.length).toBe(2);
        expect(spyAddInteraction.calls.length).toBe(2);
    });

    it('starts drawing bbox', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };
        const spyAdd = expect.spyOn(fakeMap, "addLayer");
        const spyInteraction = expect.spyOn(fakeMap, "addInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="BBOX"/>, document.getElementById("container"));
        expect(spyAdd.calls.length).toBe(1);
        expect(spyInteraction.calls.length).toBe(1);
    });

    it('starts drawing circle', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };
        const spyAdd = expect.spyOn(fakeMap, "addLayer");
        const spyInteraction = expect.spyOn(fakeMap, "addInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Circle"/>, document.getElementById("container"));
        expect(spyAdd.calls.length).toBe(1);
        expect(spyInteraction.calls.length).toBe(1);
    });

    it('starts drawing with editing', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };
        const spyAdd = expect.spyOn(fakeMap, "addLayer");
        const spyInteraction = expect.spyOn(fakeMap, "addInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{editEnabled: true}}/>, document.getElementById("container"));
        expect(spyAdd.calls.length).toBe(1);
        expect(spyInteraction.calls.length).toBe(4);
    });

    it('select interaction', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            on: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };

        const ft = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[ft]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[ft]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Point"
                options={{editEnabled: true, selectEnabled: true}}
                onSelectFeatures={testHandlers.onStatusChange}/>, document.getElementById("container"));
        const feature = new Feature({
            geometry: new Point(13.0, 43.0),
            name: 'My Point'
        });
        support.selectInteraction.dispatchEvent({
            type: 'select',
            feature: feature
        });
        expect(spyChangeStatus.calls.length).toBe(1);
    });

    it('translate interaction', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };


        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{editEnabled: true}}
                onChangeDrawingStatus={testHandlers.onStatusChange}/>, document.getElementById("container"));
        const feature = new Feature({
            geometry: new Point(13.0, 43.0),
            name: 'My Point'
        });
        support.translateInteraction.dispatchEvent({
            type: 'translateend',
            features: {
                getArray: () => ([feature])
            }
        });
        expect(spyChangeStatus.calls.length).toBe(1);
    });
    it('translate disabled when not editing', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 44]
                ]]
            },
            properties: {
                'name': "some name"
            }
        };


        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Some" options={{
                drawEnabled: false, editEnabled: false}}
            />, document.getElementById("container"));
        expect(support.translateInteraction).toNotExist();
    });
    it('translate disabled when Polygon', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            on: () => {},
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 44]
                ]]
            },
            properties: {
                'name': "some name"
            }
        };


        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Polygon" options={{
                drawEnabled: false, editEnabled: true}}
            />, document.getElementById("container"));
        expect(support.translateInteraction).toExist();
    });

    it('end drawing', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = new Feature({
            geometry: new Point(13.0, 43.0),
            name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{stopAfterDrawing: true}}
                onEndDrawing={testHandlers.onEndDrawing} onChangeDrawingStatus={testHandlers.onStatusChange}/>, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: feature
        });
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(1);
    });

    it('end drawing a circle feature ', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = new Feature({
            geometry: new Circle([13.0, 43.0], 100),
            name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Circle" options={{
                stopAfterDrawing: true,
                geodesic: true
            }}
            onEndDrawing={testHandlers.onEndDrawing} onChangeDrawingStatus={testHandlers.onStatusChange}/>, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: feature
        });
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(1);
    });

    it('tests a replace of geodesic circle feature ', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport
                features={[]}
                map={fakeMap}
                drawStatus="start"
                drawMethod="Circle"
                options={{
                    stopAfterDrawing: true,
                    geodesic: true
                }}
            />, document.getElementById("container"));
        ReactDOM.render(
            <DrawSupport
                features={[
                    {
                        type: 'Polygon',
                        center: {
                            x: 721565.5470120639,
                            y: 5586683.477814646
                        },
                        coordinates: [
                            721565.5470120639,
                            5586683.477814646
                        ],
                        radius: 294110.99,
                        projection: 'EPSG:3857'
                    }
                ]}
                map={fakeMap}
                drawStatus="replace"
                drawMethod="Circle"
                options={{
                    geodesic: true
                }}
                onEndDrawing={testHandlers.onEndDrawing}
                onChangeDrawingStatus={testHandlers.onStatusChange}
            />, document.getElementById("container"));
        const {geodesicCenter} = support.drawSource.getFeatures()[0].getGeometry().getProperties();
        const isNearlyEqual = function(a, b) {
            if (a === undefined || b === undefined) {
                return false;
            }
            return a.toFixed(12) - b.toFixed(12) === 0;
        };
        expect(isNearlyEqual(geodesicCenter[0], 721565.5470120639)).toBeTruthy();
        expect(isNearlyEqual(geodesicCenter[1], 5586683.477814646)).toBeTruthy();
    });


    it('end drawing with continue', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = new Feature({
            geometry: new Point(13.0, 43.0),
            name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{stopAfterDrawing: false}}
                onEndDrawing={testHandlers.onEndDrawing} onChangeDrawingStatus={testHandlers.onStatusChange}/>, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(0);
    });

    it('stop drawing', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const spyRemove = expect.spyOn(fakeMap, "removeInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{stopAfterDrawing: false}}
            />, document.getElementById("container"));
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="stop" drawMethod="Point" options={{stopAfterDrawing: true}}
            />, document.getElementById("container"));
        expect(spyRemove.calls.length).toBe(1);
    });

    it('replace features', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 44]
                ]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            },
            style: {type: "Polygon", "Polygon": DEFAULT_ANNOTATIONS_STYLES.Polygon}
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Polygon" options={{stopAfterDrawing: false}}
            />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="Polygon" options={{stopAfterDrawing: true}}
            />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features multipolygon', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 44]
                ]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="MultiPolygon" options={{stopAfterDrawing: false}}
            />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="MultiPolygon" options={{stopAfterDrawing: true}}
            />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features point', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13, 43]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Point" options={{stopAfterDrawing: false}}
            />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="Point" options={{stopAfterDrawing: true}}
            />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features linestring', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[13, 43], [14, 44]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="LineString" options={{stopAfterDrawing: false}}
            />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="LineString" options={{stopAfterDrawing: true}}
            />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features multilinestring', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[13, 43], [14, 44]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="MultiLineString" options={{stopAfterDrawing: false}}
            />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="MultiLineString" options={{stopAfterDrawing: true}}
            />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features no draw interaction', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[13, 43], [14, 44]]
            },
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        const spyAddInteraction = expect.spyOn(support, "addInteractions");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="MultiLineString" options={{drawEnabled: false}}
            />, document.getElementById("container"));
        expect(spyAddInteraction.calls.length).toBe(0);
    });

    it('replace features with draw interaction', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[13, 43], [14, 44]]
            },
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        const spyAddInteraction = expect.spyOn(support, "addInteractions");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="MultiLineString" options={{drawEnabled: true}}
            />, document.getElementById("container"));
        expect(spyAddInteraction.calls.length).toBe(1);
    });

    it('replace features circle', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Circle',
                coordinates: [[13, 43], [14, 44]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Circle" options={{stopAfterDrawing: false}}
            />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="Circle" options={{stopAfterDrawing: true}}
            />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features with style', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 44]
                ]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Polygon" options={{stopAfterDrawing: false}}
            />, document.getElementById("container"));
        const spyStyle = expect.spyOn(support.drawLayer, "setStyle");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="Polygon" options={{stopAfterDrawing: true}} style={{}}
            />, document.getElementById("container"));
        expect(spyStyle.calls.length).toBe(1);
    });

    it('styling fill color', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
            fillColor: '#ff0'
        });
        expect(style).toExist();
        expect(style.getFill().getColor()).toExist();
        expect(style.getFill().getColor()[0]).toBe(255);
        expect(style.getFill().getColor()[1]).toBe(255);
        expect(style.getFill().getColor()[2]).toBe(0);
        expect(style.getFill().getColor()[3]).toBe(1);
    });

    it('styling fill transparency', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
            fillColor: '#ff0',
            fillTransparency: 0.5
        });
        expect(style).toExist();
        expect(style.getFill().getColor()).toExist();
        expect(style.getFill().getColor()[0]).toBe(255);
        expect(style.getFill().getColor()[1]).toBe(255);
        expect(style.getFill().getColor()[2]).toBe(0);
        expect(style.getFill().getColor()[3]).toBe(0.5);
    });

    it('styling stroke color', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
            strokeColor: '#ff0'
        });
        expect(style).toExist();
        expect(style.getStroke().getColor().length).toBe(4);
        expect(style.getStroke().getColor()[0]).toBe(255);
        expect(style.getStroke().getColor()[1]).toBe(255);
        expect(style.getStroke().getColor()[2]).toBe(0);
        expect(style.getStroke().getColor()[3]).toBe(1);
    });

    it('styling icon url', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
            iconUrl: '#myUrl',
            shadowUrl: 'otherurl'
        });
        expect(style).toExist();
        expect(style.length).toBe(2);
    });

    it('styling icon glyph', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
            iconGlyph: 'comment'
        });
        expect(style).toExist();
        expect(style.length).toBe(2);
    });

    it('clean', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            on: () => {},
            un: () => {},
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };


        const spyRemoveLayer = expect.spyOn(fakeMap, "removeLayer");
        const spyRemoveInteraction = expect.spyOn(fakeMap, "removeInteraction");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Polygon" options={{editEnabled: true}}
            />, document.getElementById("container"));
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="clean" drawMethod="Polygon" options={{stopAfterDrawing: true}} style={{}}
            />, document.getElementById("container"));
        expect(spyRemoveLayer.calls.length).toBe(1);
        expect(spyRemoveInteraction.calls.length).toBe(4);
    });

    it('clean and continue', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };


        const spyRemoveLayer = expect.spyOn(fakeMap, "removeLayer");
        const spyRemoveInteraction = expect.spyOn(fakeMap, "removeInteraction");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Polygon" options={{editEnabled: true}}
            />, document.getElementById("container"));
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="cleanAndContinueDrawing" drawMethod="Polygon" options={{stopAfterDrawing: true}} style={{}}
            />, document.getElementById("container"));
        expect(spyRemoveLayer.calls.length).toBe(1);
        expect(spyRemoveInteraction.calls.length).toBe(0);
    });

    it('draw or edit, only draw', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            on: () => {},
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 44]
                ]]
            },
            properties: {
                'name': "some name"
            }
        };

        const spyAddLayer = expect.spyOn(fakeMap, "addLayer");
        const spyAddInteraction = expect.spyOn(fakeMap, "addInteraction");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Polygon" options={{
                drawEnabled: true}}
            />, document.getElementById("container"));
        expect(spyAddLayer.calls.length).toBe(1);
        expect(spyAddInteraction.calls.length).toBe(1);
    });

    it('draw or edit, both', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            on: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 44]
                ]]
            },
            properties: {
                'name': "some name"
            }
        };

        const spyAddLayer = expect.spyOn(fakeMap, "addLayer");
        const spyAddInteraction = expect.spyOn(fakeMap, "addInteraction");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Polygon" options={{
                drawEnabled: true,
                editEnabled: true
            }}
            />, document.getElementById("container"));
        expect(spyAddLayer.calls.length).toBe(1);
        expect(spyAddInteraction.calls.length).toBe(3);
    });

    it('draw or edit, endevent', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const geoJSON = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13, 43]
            },
            properties: {
                'name': "some name"
            }
        };
        const feature = new Feature({
            geometry: new Point(13.0, 43.0),
            name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChange = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[geoJSON]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Point" options={{
                drawEnabled: true}}
            onEndDrawing={testHandlers.onEndDrawing}
            onChangeDrawingStatus={testHandlers.onStatusChange}
            onGeometryChanged={testHandlers.onGeometryChanged}
            />, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(1);
        expect(spyChange.calls.length).toBe(1);
    });
    it('draw or edit, update spatial field', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const geoJSON = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13, 43]
            },
            properties: {
                'name': "some name"
            }
        };
        const feature = new Feature({
            geometry: new Point(13.0, 43.0),
            name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChange = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[geoJSON]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Point" options={{
                drawEnabled: true,
                updateSpatialField: true
            }}
            onEndDrawing={testHandlers.onEndDrawing}
            onChangeDrawingStatus={testHandlers.onStatusChange}
            onGeometryChanged={testHandlers.onGeometryChanged}
            />, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(1);
        expect(spyChange.calls.length).toBe(1);
    });
    it('drawsupport test for polygonCoordsFromCircle', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const support = ReactDOM.render(
            <DrawSupport features={[circle]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        const center = [1, 1];
        const radius = 100;
        const coords = support.polygonCoordsFromCircle(center, radius);

        expect(coords[0].length).toBe(101);

    });

    it('drawsupport test for polygonCoordsFromCircle', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const support = ReactDOM.render(
            <DrawSupport features={[circle]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        const center = [1, 1];
        const radius = 123459;
        const coords = support.polygonCoordsFromCircle(center, radius);

        expect(coords[0].length).toBe(101);

    });
    it('test createOLGeometry type Circle geodesic', () => {
        const support = ReactDOM.render(<DrawSupport options={{geodesic: true}}/>, document.getElementById("container"));
        const type = 'Circle';
        const coordinates = [];
        const radius = 50;
        const center = {
            x: 0,
            y: 0
        };
        const projection = 'EPSG:3857';
        const geometry = support.createOLGeometry({type, coordinates, radius, center, projection, options: { geodesic: true }});
        const geometryCoordinates = geometry.getCoordinates();
        expect(geometryCoordinates[0].length).toBe(101);
        const geometryProperties = geometry.getProperties();
        const geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toEqual([0, 0]);
    });

    it('test createOLGeometry type Circle missing param', () => {
        const support = ReactDOM.render(<DrawSupport options={{geodesic: true}}/>, document.getElementById("container"));
        const type = 'Circle';
        const radius = 50;
        const projection = 'EPSG:3857';
        const center = {
            x: 0,
            y: 0
        };

        const geometryMissingCenter = support.createOLGeometry({type, radius, projection, options: { geodesic: true }});
        let geometryCoordinates = geometryMissingCenter.getCoordinates();
        expect(geometryCoordinates.length).toBe(0);
        let geometryProperties = geometryMissingCenter.getProperties();
        let geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toBe(undefined);

        const geometryMissingProjection = support.createOLGeometry({type, radius, center, options: { geodesic: true }});
        geometryCoordinates = geometryMissingProjection.getCoordinates();
        expect(geometryCoordinates.length).toBe(0);
        geometryProperties = geometryMissingProjection.getProperties();
        geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toBe(undefined);

        const geometryMissingRadius = support.createOLGeometry({type, projection, center, options: { geodesic: true }});
        geometryCoordinates = geometryMissingRadius.getCoordinates();
        expect(geometryCoordinates.length).toBe(0);
        geometryProperties = geometryMissingRadius.getProperties();
        geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toBe(undefined);
    });

    it('test createOLGeometry type Circle wrong center', () => {
        const support = ReactDOM.render(<DrawSupport options={{geodesic: true}}/>, document.getElementById("container"));
        const type = 'Circle';
        const radius = 50;
        const center = {
            x: 'AAAA',
            y: 0
        };
        const projection = 'EPSG:3857';
        const geometry = support.createOLGeometry({type, radius, center, projection, options: { geodesic: true }});
        const geometryCoordinates = geometry.getCoordinates();
        expect(geometryCoordinates.length).toBe(0);
        const geometryProperties = geometry.getProperties();
        const geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toEqual(undefined);
    });
    it('test fromOLFeature verify radius', () => {

        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:3857'
                })
            })
        };

        const simplifiedCircle = new Feature({
            geometry: new Polygon([[
                [1260844.6064174946, 5858067.29727681],
                [1260960.7874218025, 5857951.114737838],
                [1260844.6064174946, 5857834.9352681665],
                [1260728.4254131867, 5857951.114737838],
                [1260844.6064174946, 5858067.29727681]
            ]])
        });

        const support = ReactDOM.render(<DrawSupport drawMethod="Circle" map={fakeMap} options={{geodesic: true}}/>, document.getElementById("container"));
        const featureData = support.fromOLFeature(simplifiedCircle);

        expect(Math.round(featureData.radius)).toBe(80);
    });

    it('test endDrawing action', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:3857'
                })
            })
        };
        const actions = {
            onEndDrawing: () => {}
        };

        const spyonEndDrawing = expect.spyOn(actions, "onEndDrawing");

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={fakeMap}
            features={[]}
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, document.getElementById("container"));

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={fakeMap}
            features={[{
                center: {x: -11271098, y: 7748880},
                coordinates: [-11271098, 7748880],
                projection: 'EPSG:3857',
                radius: 2000000,
                type: 'Polygon'
            }]}
            drawStatus="endDrawing"
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, document.getElementById("container"));

        expect(spyonEndDrawing).toHaveBeenCalled();

    });

    it('test endDrawing action clear', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:3857'
                })
            })
        };

        const radius = 2000000;
        let properties = {
            drawMethod: "Circle",
            map: fakeMap,
            features: [],
            onEndDrawing: (feature, owner) => {
                expect(feature).toExist();
                expect(owner).toNotExist();
                expect(feature.radius).toBe(radius);
            },
            options: {geodesic: true}
        };
        ReactDOM.render(<DrawSupport {...properties}/>, document.getElementById("container"));

        let newProps = assign({}, properties, {
            features: [{
                center: {x: -11271098, y: 7748880},
                coordinates: [-11271098, 7748880],
                projection: 'EPSG:3857',
                radius,
                type: 'Polygon'
            }],
            drawStatus: "endDrawing"
        });
        ReactDOM.render(<DrawSupport {...newProps}/>, document.getElementById("container"));
    });

    it('test endDrawing action without features', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:3857'
                })
            })
        };
        const actions = {
            onEndDrawing: () => {}
        };

        const spyonEndDrawing = expect.spyOn(actions, "onEndDrawing");

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={fakeMap}
            features={[]}
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, document.getElementById("container"));

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={fakeMap}
            features={[]}
            drawStatus="endDrawing"
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, document.getElementById("container"));

        expect(spyonEndDrawing).toNotHaveBeenCalled();
    });
    it('edit a feature, then update its style', (done) => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            updateOnlyFeatureStyles: () => {},
            on: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 44]
                ]]
            },
            properties: {
                name: "some name",
                id: "a-unique-id"
            },
            style: [{
                id: "style-id",
                color: "#FF0000",
                opacity: 1,
                fillColor: "#0000FF",
                fillOpacity: 1
            }]
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport
                features={[feature]}
                map={fakeMap}
                drawStatus="drawOrEdit"
                drawMethod="Polygon"
                options={{
                    drawEnabled: false,
                    editEnabled: true
                }}
            />, document.getElementById("container"));

        ReactDOM.render(
            <DrawSupport
                features={[{
                    ...feature,
                    style: [{
                        id: "style-id",
                        color: "#FFFFFF",
                        opacity: 0.5,
                        fillColor: "#FFFFFF",
                        fillOpacity: 0.5
                    }]}]}
                map={fakeMap}
                drawStatus="updateStyle"
                drawMethod="Polygon"
                options={{
                    drawEnabled: false,
                    editEnabled: true
                }}
            />, document.getElementById("container"));

        setTimeout( () => {
            const drawnFt = support.drawLayer.getSource().getFeatures()[0];
            expect(drawnFt.getStyle()).toExist();
            expect(drawnFt.getStyle()()).toExist();
            expect(drawnFt.getStyle()()[0].getStroke().getColor()).toEqual("rgba(255, 255, 255, 0.5)");
            expect(drawnFt.getStyle()()[0].getFill().getColor()).toEqual("rgba(255, 255, 255, 0.5)");
            done();
        }, 100);
    });

    it('test draw callbacks in edit mode with Polygons feature', (done) => {
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 43]
                ]]
            },
            properties: {
                name: "some name",
                id: "a-unique-id",
                canEdit: true
            },
            style: [{
                id: "style-id",
                color: "#FF0000",
                opacity: 1,
                fillColor: "#0000FF",
                fillOpacity: 1
            }]
        };
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        let support = renderAndClick({
            feature,
            drawMethod: feature.geometry.type
        });
        expect(support).toExist();
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        const ft = spyOnDrawingFeatures.calls[0].arguments[0][0];
        expect(ft.type).toBe("Feature");
        expect(ft.geometry.type).toBe("Polygon");
        expect(ft.properties).toEqual({
            "name": "some name",
            "id": "a-unique-id",
            "canEdit": true
        });
        done();
    });
    it('test draw callbacks in edit mode with LineString feature', (done) => {
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [13, 43],
                    [15, 43],
                    [15, 44],
                    [13, 43]
                ]
            },
            properties: {
                name: "some name",
                id: "a-unique-id",
                canEdit: true
            },
            style: [{
                id: "style-id",
                color: "#FF0000",
                opacity: 1
            }]
        };
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        let support = renderAndClick({
            feature,
            drawMethod: feature.geometry.type
        });
        expect(support).toExist();
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        done();
    });

    it('test draw callbacks in edit mode with Text feature', (done) => {
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13, 43]
            },
            properties: {
                name: "some name",
                id: "a-unique-id",
                valueText: "a text",
                canEdit: true,
                isText: true
            },
            style: [{
                id: "style-id",
                color: "#FF0000",
                label: "a text",
                opacity: 1
            }]
        };
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        let support = renderAndClick({
            feature,
            drawMethod: "Text"
        });
        expect(support).toExist();
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        done();
    });

    it('test draw callbacks in edit mode with Circle feature', (done) => {
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13, 43]
            },
            properties: {
                name: "some name",
                id: "a-unique-id",
                valueText: "a text",
                canEdit: true,
                radius: 1111,
                isCircle: true
            },
            style: [{
                id: "style-id",
                color: "#FF0000",
                opacity: 1
            }]
        };
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        let support = renderAndClick({
            feature,
            drawMethod: "Circle"
        });
        expect(support).toExist();
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        done();
    });
    it('test drawend callbacks with Circle, transformed int feature collection', (done) => {
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            features: [null],
            drawMethod: "Circle",
            drawStatus: "drawOrEdit",
            options: {
                transformToFeatureCollection: true,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        const center = [1300, 4300];
        const radius = 1000;
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new Circle(center, radius)
            })
        });
        const drawOwner = null;
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);
        expect(ArgsGeometryChanged[1]).toBe(drawOwner);
        expect(ArgsGeometryChanged[2]).toEqual("");
        expect(ArgsGeometryChanged[3]).toEqual(false);
        expect(ArgsGeometryChanged[4]).toEqual(true);
        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[1]).toBe(drawOwner);
        expect(ArgsGeometryChanged[0][0]).toEqual(ArgsEndDrawing[0]);

        done();
    });

    it('test drawend callbacks with Text, transformed int feature collection', (done) => {
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            features: [null],
            drawMethod: "Text",
            drawStatus: "drawOrEdit",
            options: {
                transformToFeatureCollection: true,
                stopAfterDrawing: true,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        const coordinate = [1300, 4300];
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new Point(coordinate)
            })
        });
        const drawOwner = null;
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);
        expect(ArgsGeometryChanged[1]).toBe(drawOwner);
        expect(ArgsGeometryChanged[2]).toEqual("enterEditMode");
        expect(ArgsGeometryChanged[3]).toEqual(true);
        expect(ArgsGeometryChanged[4]).toEqual(false);
        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[1]).toBe(drawOwner);
        expect(ArgsGeometryChanged[0][0]).toEqual(ArgsEndDrawing[0]);
        expect(ArgsEndDrawing[0].features[0].properties.isText).toBe(true);
        expect(ArgsEndDrawing[0].features[0].properties.valueText).toBe(".");
        done();
    });
    it('test drawend callbacks with Polygon, transformed int feature collection', (done) => {
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            features: [null],
            drawMethod: "Polygon",
            drawStatus: "drawOrEdit",
            options: {
                transformToFeatureCollection: true,
                stopAfterDrawing: true,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new Polygon([[[1300, 4300], [8, 9], [8, 59]]])
            })
        });
        const drawOwner = null;
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);
        expect(ArgsGeometryChanged[1]).toBe(drawOwner);
        expect(ArgsGeometryChanged[2]).toEqual("enterEditMode");
        expect(ArgsGeometryChanged[3]).toEqual(false);
        expect(ArgsGeometryChanged[4]).toEqual(false);
        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[1]).toBe(drawOwner);
        expect(ArgsGeometryChanged[0][0]).toEqual(ArgsEndDrawing[0]);
        expect(ArgsEndDrawing[0].features[0].geometry.coordinates[0].length).toBe(4);
        done();
    });

    it('test drawend callbacks with LineString, transformed int feature collection', (done) => {
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            features: [null],
            drawMethod: "LineString",
            drawStatus: "drawOrEdit",
            options: {
                transformToFeatureCollection: true,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new LineString([[1300, 4300], [8, 9], [8, 59]])
            })
        });
        const drawOwner = null;
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);
        expect(ArgsGeometryChanged[3]).toEqual(false);
        expect(ArgsGeometryChanged[4]).toEqual(false);
        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[1]).toBe(drawOwner);
        expect(ArgsGeometryChanged[0][0]).toEqual(ArgsEndDrawing[0]);
        expect(ArgsEndDrawing[0].features[0].geometry.coordinates.length).toBe(3);
        done();
    });

    it('test drawend callbacks with Circle, exported as geomColl', (done) => {
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "Circle",
            drawStatus: "drawOrEdit",
            features: [geomCollFeature],
            options: {
                transformToFeatureCollection: false,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        const center = [1300, 4300];
        const radius = 1000;
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new Circle(center, radius)
            })
        });
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);

        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[1]).toBe(null);
        expect(ArgsEndDrawing[0].geometry.type).toBe("GeometryCollection");
        expect(ArgsEndDrawing[0].geometry.geometries.length).toBe(2);

        done();
    });

    it('test drawend callbacks with MultiLineString, exported as geomColl', (done) => {
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "MultiLineString",
            drawStatus: "drawOrEdit",
            features: [geomCollFeature],
            options: {
                transformToFeatureCollection: false,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new MultiLineString([[[1300, 4300], [8, 9], [8, 59]]])
            })
        });
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);

        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[0].geometry.type).toBe("GeometryCollection");
        expect(ArgsEndDrawing[0].geometry.geometries.length).toBe(2);

        done();
    });

    it('test drawend callbacks with MultiPolygon, exported as geomColl', (done) => {
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "MultiPolygon",
            drawStatus: "drawOrEdit",
            features: [geomCollFeature],
            options: {
                transformToFeatureCollection: false,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new MultiPolygon([[[[1300, 4300], [1300, 5300], [1380, 4380], [1300, 4300]]]])
            })
        });
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);

        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[0].geometry.type).toBe("GeometryCollection");
        expect(ArgsEndDrawing[0].geometry.geometries.length).toBe(2);

        done();
    });

    it('test drawend callbacks with MultiPoint, exported as geomColl', (done) => {
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "MultiPoint",
            drawStatus: "drawOrEdit",
            features: [geomCollFeature],
            options: {
                transformToFeatureCollection: false,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new MultiPoint([[1300, 4300]])
            })
        });
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);

        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[0].geometry.type).toBe("GeometryCollection");
        expect(ArgsEndDrawing[0].geometry.geometries.length).toBe(2);

        done();
    });
    it('test select interaction, retrieving a drawn feature', (done) => {
        const spyOnSelectFeatures = expect.spyOn(testHandlers, "onSelectFeatures");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "LineString",
            drawStatus: "drawOrEdit",
            features: [geomCollFeature],
            options: {
                selected: geomCollFeature,
                transformToFeatureCollection: false,
                selectEnabled: true
            }
        });
        expect(support).toExist();
        const feature = new Feature({
            geometry: new Point(13.0, 43.0),
            name: 'My Point'
        });
        support.selectInteraction.dispatchEvent({
            type: 'select',
            feature: feature
        });
        expect(spyOnSelectFeatures).toHaveBeenCalled();
        done();
    });
    it('test modifyend event for modifyInteraction with Circle, exported FeatureCollection', (done) => {
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "Circle",
            drawStatus: "drawOrEdit",
            features: [geomCollFeature],
            options: {
                transformToFeatureCollection: true,
                editEnabled: true
            }
        });
        expect(support).toExist();
        const center = [1300, 4300];
        const radius = 1000;
        support.modifyInteraction.dispatchEvent({
            type: 'modifyend',
            features: new Collection(
                [new Feature({
                    geometry: new Circle(center, radius)
                })]
            )
        });
        expect(spyOnGeometryChanged).toNotHaveBeenCalled();
        expect(spyOnDrawingFeatures).toHaveBeenCalled();
        expect(spyOnDrawingFeatures.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnDrawingFeatures.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(1);

        done();
    });

    it('test modifyend event for modifyInteraction with Circle, exported FeatureCollection', (done) => {
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnDrawingFeatures = expect.spyOn(testHandlers, "onDrawingFeatures");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "Circle",
            drawStatus: "drawOrEdit",
            features: [geomCollFeature],
            options: {
                transformToFeatureCollection: false,
                editEnabled: true
            }
        });
        expect(support).toExist();
        const center = [1300, 4300];
        const radius = 1000;
        support.modifyInteraction.dispatchEvent({
            type: 'modifyend',
            features: new Collection(
                [new Feature({
                    geometry: new Circle(center, radius)
                })]
            )
        });
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnDrawingFeatures).toNotHaveBeenCalled();

        done();
    });
    it('test drawPropertiesForGeometryType for BBOX', (done) => {
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "BBOX",
            drawStatus: "start",
            features: [],
            options: {
                transformToFeatureCollection: false,
                editEnabled: true
            }
        });
        expect(support).toExist();

        const geometryType = "BBOX";
        const maxPoints = null;
        const source = support.drawSource;
        const newProps = {};
        const drawProps = support.drawPropertiesForGeometryType(geometryType, maxPoints, source, newProps);
        expect(drawProps).toExist();
        expect(drawProps.maxPoints).toBe(2);
        const olGeom = drawProps.geometryFunction([1, 3], null);
        expect(olGeom).toExist();
        done();
    });
    it('test drawPropertiesForGeometryType for Circle', (done) => {
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "Circle",
            drawStatus: "start",
            features: [],
            options: {
                transformToFeatureCollection: false,
                editEnabled: true,
                geodesic: true
            }
        });
        expect(support).toExist();

        const geometryType = "Circle";
        const maxPoints = null;
        const source = support.drawSource;
        const drawProps = support.drawPropertiesForGeometryType(geometryType, maxPoints, source, {options: {
            geodesic: true
        }});
        expect(drawProps).toExist();
        expect(drawProps.maxPoints).toBe(100);
        const olGeom = drawProps.geometryFunction([[[1, 3], [1, 3]]], null);
        expect(olGeom).toExist();
        done();
    });

    it('test drawend callbacks with Point', (done) => {
        const spyOnGeometryChanged = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyOnChangeDrawingStatus = expect.spyOn(testHandlers, "onChangeDrawingStatus");
        const spyOnEndDrawing = expect.spyOn(testHandlers, "onEndDrawing");
        let support = renderDrawSupport();
        support = renderDrawSupport({
            drawMethod: "Point",
            drawStatus: "drawOrEdit",
            owner: 'featureGrid',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [
                        -50.05371093750001,
                        36.686041276581925
                    ]
                },
                properties: {
                    id: '4b79a3a0-0c63-11ea-a9c6-03246c187986'
                },
                id: '48f4a670-0c63-11ea-a9c6-03246c187986',
                _new: true
            }],
            options: {
                featureProjection: 'EPSG:4326',
                stopAfterDrawing: true,
                editEnabled: false,
                drawEnabled: true
            }
        });
        expect(support).toExist();
        const center = [1300, 4300];
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new Point(center)
            })
        });
        expect(spyOnGeometryChanged).toHaveBeenCalled();
        expect(spyOnGeometryChanged.calls.length).toBe(1);
        const ArgsGeometryChanged = spyOnGeometryChanged.calls[0].arguments;
        expect(ArgsGeometryChanged.length).toBe(5);

        expect(spyOnEndDrawing).toHaveBeenCalled();
        expect(spyOnEndDrawing.calls.length).toBe(1);
        const ArgsEndDrawing = spyOnEndDrawing.calls[0].arguments;
        expect(ArgsEndDrawing.length).toBe(2);
        expect(ArgsEndDrawing[1]).toBe(null);
        expect(ArgsEndDrawing[0].type).toBe("Point");

        expect(spyOnChangeDrawingStatus).toHaveBeenCalled();
        expect(spyOnChangeDrawingStatus.calls.length).toBe(1);
        const ArgsChangeDrawingStatus = spyOnChangeDrawingStatus.calls[0].arguments;
        expect(ArgsChangeDrawingStatus.length).toBe(4);
        const features = ArgsChangeDrawingStatus[3];
        expect(features.length).toBe(2);
        features.forEach(({type}) => {
            expect(type).toBe("Feature");
        });

        done();
    });
});
