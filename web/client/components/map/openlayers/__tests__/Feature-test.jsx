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
import Feature from '../Feature';
import '../../../../utils/openlayers/Layers';
import {DEFAULT_ANNOTATIONS_STYLES} from '../../../../utils/AnnotationsUtils';
import '../plugins/VectorLayer';

import { Map, View } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

describe('Test Feature', () => {
    document.body.innerHTML = '<div id="map"></div>';
    let map;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        map = new Map({
            layers: [
            ],
            target: 'map',
            view: new View({
                center: [0, 0],
                zoom: 5
            })
        });
        setTimeout(done);
    });

    afterEach((done) => {
        map.setTarget(null);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('adding a feature to a vector layer', () => {
        var options = {
            crs: 'EPSG:4326',
            features: {
                type: 'FeatureCollection',
                crs: {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                features: [
                    {
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
                    }
                ]
            }
        };
        const source = new VectorSource({
            features: []
        });
        const msId = "some value";
        let container = new VectorLayer({
            msId,
            source: source,
            visible: true,
            zIndex: 1
        });
        const geometry = options.features.features[0].geometry;
        const type = options.features.features[0].type;
        const properties = options.features.features[0].properties;

        // create layers with feature visible
        let layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={type}
                properties={properties}
                msId={msId}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
            />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        let count = container.getSource().getFeatures().length;
        expect(count).toBe(1);

        // Create layer with feature hidden
        layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={"FeatureCollection"}
                properties={{visibility: false}}
                msId={msId}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
            />, document.getElementById("container"));

        expect(layer).toExist();
        count = container.getSource().getFeatures().length;
        expect(count).toBe(0);
    });
    it('adding a feature without a geometry', () => {
        var options = {
            crs: 'EPSG:4326',
            features: {
                type: 'FeatureCollection',
                crs: {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                features: [
                    {
                        type: 'Feature',
                        properties: {
                            'name': "some name"
                        }
                    }
                ]
            }
        };
        const source = new VectorSource({
            features: []
        });
        const msId = "some value";
        let container = new VectorLayer({
            msId,
            source: source,
            visible: true,
            zIndex: 1
        });
        const geometry = options.features.features[0].geometry;
        const type = options.features.features[0].type;
        const properties = options.features.features[0].properties;

        // create layers
        let layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={type}
                properties={properties}
                msId={msId}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
            />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        const count = container.getSource().getFeatures().length;
        expect(count).toBe(0);
    });

    it('updating a feature', () => {
        var options = {
            crs: 'EPSG:4326',
            features: {
                type: 'FeatureCollection',
                crs: {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                features: [
                    {
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
                    }
                ]
            }
        };
        const source = new VectorSource({
            features: []
        });
        const msId = "some value";
        let container = new VectorLayer({
            msId,
            source: source,
            visible: true,
            zIndex: 1
        });
        const geometry = options.features.features[0].geometry;
        const type = options.features.features[0].type;
        const properties = options.features.features[0].properties;

        // create layers
        let layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={type}
                properties={properties}
                msId={msId}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
            />, document.getElementById("container"));

        setTimeout(() => {
            expect(layer).toExist();
            // count layers
            expect(container.getSource().getFeatures().length === 1 );
            let style = layer._feature[0].getStyle();
            expect(style).toNotExist();
        }, 0);

        options.features.features[0].properties.name = 'other name';

        layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={type}
                properties={properties}
                msId={msId}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
                style={{}}
            />, document.getElementById("container"));

        setTimeout(() => {
            let style = layer._feature[0].getStyle();
            expect(style).toExist();
        }, 0);

        // change geometry
        layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={type}
                properties={properties}
                msId={msId}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
                style={{}}
            />, document.getElementById("container"));
        const count = container.getSource().getFeatures().length;
        expect(count).toBe(1);
    });
    it('updating a feature with no msId', () => {
        var options = {
            crs: 'EPSG:4326',
            features: {
                type: 'FeatureCollection',
                crs: {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                features: [
                    {
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
                    }
                ]
            }
        };
        const source = new VectorSource({
            features: []
        });
        let container = new VectorLayer({
            source: source,
            visible: true,
            zIndex: 1
        });
        const geometry = options.features.features[0].geometry;
        const type = options.features.features[0].type;
        const properties = options.features.features[0].properties;

        // create layers
        let layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={type}
                properties={properties}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
            />, document.getElementById("container"));

        setTimeout(() => {
            expect(layer).toExist();
            // count layers
            expect(container.getSource().getFeatures().length === 1 );
            let style = layer._feature[0].getStyle();
            expect(style).toNotExist();
        }, 0);

        options.features.features[0].properties.name = 'other name';
        const newGeometry = {
            ...geometry,
            coordinates: [ [0, 0],
                [0, 1],
                [1, 1],
                [1, 1]]
        };
        layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={newGeometry}
                type={type}
                properties={properties}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
            />, document.getElementById("container"));

        setTimeout(() => {
            let style = layer._feature[0].getStyle();
            expect(style).toNotExist();
        }, 0);

        layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={type}
                properties={properties}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
                style={{type: "Polygon", "Polygon": DEFAULT_ANNOTATIONS_STYLES.Polygon}}
            />, document.getElementById("container")
        );
        setTimeout(() => {
            let style = layer._feature[0].getStyle();
            expect(style).toExist();
        }, 0);
        const count = container.getSource().getFeatures().length;
        expect(count).toBe(1);
    });

    it('adding a feature with geom type GeometryCollections to a vector layer', () => {
        var options = {
            crs: 'EPSG:4326',
            features: {
                type: 'FeatureCollection',
                crs: {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                features: [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "GeometryCollection",
                            "geometries": [{
                                "type": "Polygon",
                                "coordinates": [[[-122.40074899999999, 48.22539499999999], [-122.461586, 48.228542000000004], [-122.453156, 48.12867399999999], [-122.36007699999999, 48.060280000000006], [-122.513245, 48.13415499999999], [-122.540802, 48.21064000000001], [-122.507858, 48.25397100000001], [-122.403137, 48.24677299999999], [-122.37705199999999, 48.289897999999994], [-122.563087, 48.414421000000004], [-122.665749, 48.413071], [-122.698128, 48.49450300000001], [-122.60689500000001, 48.51899700000001], [-122.52195, 48.458575999999994], [-122.472557, 48.462368], [-122.504021, 48.559616000000005], [-122.428268, 48.59956700000001], [-122.486519, 48.63874100000001], [-122.52527599999999, 48.711895], [-122.51557199999999, 48.75809100000001], [-122.696114, 48.80318500000001], [-122.75295299999999, 48.910156], [-122.821129, 48.95089300000001], [-122.74265299999999, 48.955974999999995], [-122.76383200000001, 48.999911999999995], [-120.855827, 48.99997300000001], [-118.842453, 49], [-118.19923399999999, 49.00000399999999], [-117.4375, 48.99999600000001], [-117.030975, 49], [-117.028046, 48.83815000000001], [-117.037834, 48.046284000000014], [-117.036438, 47.971191000000005], [-117.040779, 47.361541999999986], [-117.041382, 47.258601999999996], [-117.039963, 47.11942300000001], [-117.040932, 46.53671600000001], [-117.037567, 46.42809700000001], [-117.04348, 46.388690999999994], [-117.06319400000001, 46.348816], [-117.026985, 46.335544999999996], [-117.00065599999999, 46.30256700000001], [-116.97174100000001, 46.249427999999995], [-116.96650700000001, 46.197674000000006], [-116.928444, 46.165604], [-116.960655, 46.097397], [-116.98622900000001, 46.078632], [-116.956741, 46.065811], [-116.91815199999999, 45.995299999999986], [-117.48065199999999, 45.999966], [-117.60180700000001, 46.00040100000001], [-117.981628, 46.00001900000001], [-117.991478, 46.001778], [-118.981018, 45.999202999999994], [-119.031105, 45.966419], [-119.13913, 45.92585399999999], [-119.17761999999999, 45.92249699999999], [-119.301636, 45.932807999999994], [-119.378311, 45.917755], [-119.43772899999999, 45.914412999999996], [-119.511086, 45.89934500000001], [-119.58815799999999, 45.913459999999986], [-119.620979, 45.89955499999999], [-119.677307, 45.85268400000001], [-119.832413, 45.841755000000006], [-119.86859100000001, 45.83184399999999], [-119.993172, 45.81128699999999], [-120.067497, 45.78035], [-120.154755, 45.76141000000001], [-120.206291, 45.719933], [-120.282478, 45.71673200000001], [-120.442223, 45.68942999999999], [-120.49799300000001, 45.69578200000001], [-120.568916, 45.74107000000001], [-120.622589, 45.743763], [-120.657234, 45.732765], [-120.695824, 45.71066300000001], [-120.86024499999999, 45.665339999999986], [-120.906761, 45.63563199999999], [-120.947395, 45.65047100000001], [-120.9673, 45.645309], [-121.032303, 45.65299999999999], [-121.07235, 45.64676700000001], [-121.124023, 45.607215999999994], [-121.173134, 45.600674], [-121.190872, 45.61340000000001], [-121.20212599999999, 45.657444], [-121.213089, 45.66580200000001], [-121.27520799999999, 45.67849699999999], [-121.318794, 45.696799999999996], [-121.366631, 45.69984400000001], [-121.420845, 45.69076200000001], [-121.441368, 45.69512599999999], [-121.52787000000001, 45.719727000000006], [-121.705231, 45.688953], [-121.757507, 45.689876999999996], [-121.809853, 45.70084399999999], [-121.887093, 45.677017000000006], [-121.925629, 45.642189], [-121.97146599999999, 45.63593700000001], [-121.998817, 45.617985000000004], [-122.08084099999999, 45.590664000000004], [-122.243721, 45.548271], [-122.30194900000001, 45.543251], [-122.355255, 45.566329999999994], [-122.435951, 45.56493800000001], [-122.564224, 45.594978], [-122.650002, 45.606990999999994], [-122.69511399999999, 45.63120699999999], [-122.759331, 45.64955900000001], [-122.771339, 45.727847999999994], [-122.76307700000001, 45.76073099999999], [-122.786797, 45.80050700000001], [-122.78330199999999, 45.85061300000001], [-122.78286, 45.86805000000001], [-122.805008, 45.904236], [-122.80652599999999, 45.944053999999994], [-122.874199, 46.02734799999999], [-122.898537, 46.07949400000001], [-122.97294600000001, 46.110648999999995], [-123.04937000000001, 46.155902999999995], [-123.117325, 46.17947799999999], [-123.174965, 46.18375399999999], [-123.211205, 46.170174], [-123.247566, 46.144188000000014], [-123.303482, 46.144904999999994], [-123.469528, 46.275192000000004], [-123.61882800000001, 46.258835000000005], [-123.724205, 46.285595], [-123.884514, 46.240612], [-123.992065, 46.310452], [-124.077843, 46.267437], [-124.064232, 46.639927], [-124.021767, 46.583721], [-124.01173399999999, 46.383858000000004], [-123.840187, 46.404517999999996], [-123.939423, 46.481292999999994], [-123.892296, 46.511257], [-123.956436, 46.61740499999999], [-123.925194, 46.67324099999999], [-123.839691, 46.718468], [-123.89426399999999, 46.74516700000001], [-124.041878, 46.716038], [-124.089767, 46.729206000000005], [-124.100784, 46.78965400000001], [-124.137543, 46.900172999999995], [-124.104477, 46.90833699999999], [-124.103455, 46.87433200000001], [-124.02752699999999, 46.82395199999999], [-124.045647, 46.88744], [-123.81137799999999, 46.96414899999999], [-123.994583, 46.976574], [-124.033112, 47.03122300000001], [-124.111076, 47.042866000000004], [-124.160751, 46.929801999999995], [-124.19144399999999, 47.167174999999986], [-124.230133, 47.27526499999999], [-124.31813, 47.349434], [-124.347778, 47.527107], [-124.372299, 47.63896199999999], [-124.482719, 47.80845600000001], [-124.605362, 47.873940000000005], [-124.73142200000001, 48.150204], [-124.703857, 48.232212000000004], [-124.71582000000001, 48.37777299999999], [-124.562202, 48.35748699999999], [-123.98989900000001, 48.159355000000005], [-123.395561, 48.11121700000001], [-123.121933, 48.14891800000001], [-122.920311, 48.09436400000001], [-122.923561, 48.066981999999996], [-122.839828, 48.13332], [-122.767601, 48.14417599999999], [-122.80165099999999, 48.08550600000001], [-122.660294, 47.91734299999999], [-122.652321, 47.86461600000001], [-122.744598, 47.80917400000001], [-122.788528, 47.80273399999999], [-122.808243, 47.85726199999999], [-122.857529, 47.827515000000005], [-122.898094, 47.67270300000001], [-122.981476, 47.605659], [-123.11264800000001, 47.456458999999995], [-123.152794, 47.34873200000001], [-123.009209, 47.35320999999999], [-122.831993, 47.438648], [-123.034943, 47.356235999999996], [-123.11142000000001, 47.37175400000001], [-123.02507, 47.516121], [-122.91570300000001, 47.614791999999994], [-122.751678, 47.66087300000001], [-122.721794, 47.75708399999999], [-122.60990100000001, 47.85019299999999], [-122.611954, 47.936375], [-122.530632, 47.90964500000001], [-122.472343, 47.75516099999999], [-122.620255, 47.69715099999999], [-122.58521300000001, 47.571372999999994], [-122.55401599999999, 47.583687], [-122.541458, 47.52291500000001], [-122.50322, 47.507397], [-122.55720500000001, 47.39854399999999], [-122.542885, 47.37410700000001], [-122.587013, 47.33411000000001], [-122.551918, 47.283512], [-122.57929200000001, 47.25156799999999], [-122.61030600000001, 47.293578999999994], [-122.60567499999999, 47.27075199999999], [-122.69850199999999, 47.29226700000001], [-122.62751, 47.39873499999999], [-122.636192, 47.398762000000005], [-122.740303, 47.341633], [-122.768463, 47.26633799999999], [-122.718559, 47.22331199999999], [-122.759995, 47.162678], [-122.82386, 47.23500799999999], [-122.772087, 47.33754300000001], [-122.800934, 47.36092400000001], [-122.87912, 47.29941600000001], [-123.11417399999999, 47.20816400000001], [-123.07994099999999, 47.090239999999994], [-123.03009, 47.100956], [-122.921898, 47.048145000000005], [-122.788803, 47.12604099999999], [-122.726944, 47.08262300000001], [-122.698837, 47.09850700000001], [-122.590569, 47.180240999999995], [-122.529526, 47.28763599999999], [-122.545349, 47.31645599999999], [-122.422859, 47.25965099999999], [-122.391609, 47.277901000000014], [-122.440369, 47.30130399999999], [-122.419601, 47.31902299999999], [-122.324142, 47.34450100000001], [-122.31850399999999, 47.390293000000014], [-122.391396, 47.510422000000005], [-122.38098099999999, 47.59558899999999], [-122.413574, 47.66435999999999], [-122.39325, 47.77435700000001], [-122.30167399999999, 47.95039700000001], [-122.22887399999999, 47.969296000000014], [-122.215744, 48.007622], [-122.367073, 48.128322999999995], [-122.40074899999999, 48.22539499999999]]]
                            }, {
                                "type": "Polygon",
                                "coordinates": [[[-122.96669, 48.443974], [-123.093941, 48.479603], [-123.158424, 48.52202199999999], [-123.16860199999999, 48.56274400000001], [-123.13975500000001, 48.62382500000001], [-123.102425, 48.608554999999996], [-123.01080300000001, 48.55765500000001], [-123.007408, 48.533896999999996], [-122.96669, 48.52711099999999], [-123.020981, 48.51353800000001], [-123.017593, 48.489783999999986], [-122.96669, 48.443974]]]
                            }, {
                                "type": "Polygon",
                                "coordinates": [[[-122.731903, 48.276825], [-122.66433, 48.396953999999994], [-122.603104, 48.40496400000001], [-122.524475, 48.32122000000001], [-122.52737400000001, 48.28368800000001], [-122.622231, 48.296527999999995], [-122.730751, 48.225594], [-122.60965, 48.206501], [-122.544937, 48.077042000000006], [-122.49494899999999, 48.09425400000001], [-122.378738, 48.03233], [-122.354149, 47.964068999999995], [-122.385712, 47.904731999999996], [-122.441536, 47.91824], [-122.47036, 47.987694000000005], [-122.543701, 47.967715999999996], [-122.607361, 48.031616000000014], [-122.694275, 48.181366], [-122.767494, 48.218998], [-122.731903, 48.276825]]]
                            }
                            ]
                        },
                        "properties": {
                            "STATE_NAME": "Washington"
                        },
                        "id": "states.49"
                    }
                ]
            }
        };
        const source = new VectorSource({
            features: []
        });
        const msId = "some value";
        let container = new VectorLayer({
            msId,
            source: source,
            visible: true,
            zIndex: 1
        });
        const geometry = options.features.features[0].geometry;
        const type = options.features.features[0].type;
        const properties = options.features.features[0].properties;

        // create layers
        let layer = ReactDOM.render(
            <Feature
                options={options}
                geometry={geometry}
                type={type}
                properties={properties}
                msId={msId}
                container={container}
                featuresCrs={"EPSG:4326"}
                crs={"EPSG:4326"}
            />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        const count = container.getSource().getFeatures().length;
        expect(count).toBe(1);
    });
});
