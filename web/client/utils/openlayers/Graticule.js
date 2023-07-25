/**
 * @module ol/layer/Graticule
 * Forked implementation of ol.layer.Graticule that supports grids in different
 * projections, other than EPSG:4326.
 *
 */
import Collection from 'ol/Collection';
import EventType from 'ol/render/EventType';
import Feature from 'ol/Feature';
import Fill from 'ol/style/Fill';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {
    approximatelyEquals,
    containsExtent,
    equals,
    getCenter,
    getIntersection,
    getWidth,
    isEmpty,
    wrapX as wrapExtentX
} from 'ol/extent';
import { clamp } from 'ol/math';
import {
    equivalent as equivalentProjection,
    get as getProjection,
    getTransform
} from 'ol/proj';
import { getVectorContext } from 'ol/render';
import { createGrid, getInterval, getIntervals } from '../grids/MapGridsUtils';
import { getXLabelFormatter, getYLabelFormatter } from '../grids/GridLabelsUtils';

/**
 * @type {Stroke}
 * @private
 * @const
 */
const DEFAULT_STROKE_STYLE = new Stroke({
    color: 'rgba(0,0,0,0.2)'
});

const DEFAULT_FRAME_STYLE = new Style({
    stroke: new Stroke({
        color: "rgba(0,0,0,1)"
    }),
    fill: new Fill({
        color: "rgba(255,255,255,1)"
    })
});

const DEFAULT_X_LABEL_STYLE = new Text({
    font: '12px Calibri,sans-serif',
    textBaseline: 'bottom',
    fill: new Fill({
        color: 'rgba(0,0,0,1)'
    }),
    stroke: new Stroke({
        color: 'rgba(255,255,255,1)',
        width: 3
    })
});

const DEFAULT_Y_LABEL_STYLE = new Text({
    font: '12px Calibri,sans-serif',
    textAlign: 'end',
    fill: new Fill({
        color: 'rgba(0,0,0,1)'
    }),
    stroke: new Stroke({
        color: 'rgba(255,255,255,1)',
        width: 3
    })
});

/**
 * @typedef {Object} GraticuleLabelDataType
 * @property {Point} geom Geometry.
 * @property {string} text Text.
 */

/**
 * @typedef {Object} Options
 * @property {string} [className='ol-layer'] A CSS class name to set to the layer element.
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {import("ol/extent").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
 * rendered outside of this extent.
 * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
 * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
 * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
 * method was used.
 * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
 * visible.
 * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
 * be visible.
 * @property {number} [minZoom] The minimum view zoom level (exclusive) above which this layer will be
 * visible.
 * @property {number} [maxZoom] The maximum view zoom level (inclusive) at which this layer will
 * be visible.
 * @property {number} [maxLines=100] The maximum number of meridians and
 * parallels from the center of the map. The default value of 100 means that at
 * most 200 meridians and 200 parallels will be displayed. The default value is
 * appropriate for conformal projections like Spherical Mercator. If you
 * increase the value, more lines will be drawn and the drawing performance will
 * decrease.
 * @property {Stroke} [strokeStyle='rgba(0,0,0,0.2)'] The
 * stroke style to use for drawing the graticule. If not provided, a not fully
 * opaque black will be used.
 * @property {number} [targetSize=100] The target size of the graticule cells,
 * in pixels.
 * @property {boolean} [showLabels=false] Render a label with the respective
 * latitude/longitude for each graticule line.
 * @property {boolean} [showFrame=false] Render a frame over the map.
 * @property {function(number):string} [xLabelFormatter] Label formatter for
 * longitudes. This function is called with the longitude as argument, and
 * should return a formatted string representing the longitude. By default,
 * labels are formatted as degrees, minutes, seconds and hemisphere.
 * @property {function(number):string} [yLabelFormatter] Label formatter for
 * latitudes. This function is called with the latitude as argument, and
 * should return a formatted string representing the latitude. By default,
 * labels are formatted as degrees, minutes, seconds and hemisphere.
 * @property {number} [xLabelPosition=0] Longitude label position in fractions
 * (0..1) of view extent. 0 means at the bottom of the viewport, 1 means at the
 * top.
 * @property {number} [yLabelPosition=1] Latitude label position in fractions
 * (0..1) of view extent. 0 means at the left of the viewport, 1 means at the
 * right.
 * @property {Text} [xLabelStyle] Longitude label text
 * style. If not provided, the following style will be used:
 * ```js
 * new Text({
 *   font: '12px Calibri,sans-serif',
 *   textBaseline: 'bottom',
 *   fill: new Fill({
 *     color: 'rgba(0,0,0,1)'
 *   }),
 *   stroke: new Stroke({
 *     color: 'rgba(255,255,255,1)',
 *     width: 3
 *   })
 * });
 * ```
 * Note that the default's `textBaseline` configuration will not work well for
 * `xLabelPosition` configurations that position labels close to the top of
 * the viewport.
 * @property {Text} [yLabelStyle] Latitude label text style.
 * If not provided, the following style will be used:
 * ```js
 * new Text({
 *   font: '12px Calibri,sans-serif',
 *   textAlign: 'end',
 *   fill: new Fill({
 *     color: 'rgba(0,0,0,1)'
 *   }),
 *   stroke: Stroke({
 *     color: 'rgba(255,255,255,1)',
 *     width: 3
 *   })
 * });
 * ```
 * Note that the default's `textAlign` configuration will not work well for
 * `yLabelPosition` configurations that position labels close to the left of
 * the viewport.
 * @property {Array<number>} [intervals=[90, 45, 30, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.01, 0.005, 0.002, 0.001]]
 * Intervals (in degrees) for the graticule. Example to limit graticules to 30 and 10 degrees intervals:
 * ```js
 * [30, 10]
 * ```
 * @property {boolean} [wrapX=true] Whether to repeat the graticule horizontally.
 * @property {Object<string, *>} [properties] Arbitrary observable properties. Can be accessed with `#get()` and `#set()`.
 */

/**
 * @classdesc
 * Layer that renders a grid for a coordinate system (currently only EPSG:4326 is supported).
 * Note that the view projection must define both extent and worldExtent.
 *
 * @fires import("ol/render/Event").RenderEvent
 * @extends {VectorLayer<import("ol/source/Vector").default>}
 * @api
 */
class Graticule extends VectorLayer {
    /**
     * @param {Options} [options] Options.
     */
    constructor(_options) {
        let options = _options ? _options : {};

        const baseOptions = Object.assign(
            {
                updateWhileAnimating: true,
                updateWhileInteracting: true,
                renderBuffer: 0
            },
            options
        );

        delete baseOptions.maxLines;
        delete baseOptions.strokeStyle;
        delete baseOptions.targetSize;
        delete baseOptions.showLabels;
        delete baseOptions.showFrame;
        delete baseOptions.frameRatio;
        delete baseOptions.frameStyle;
        delete baseOptions.xLabelFormatter;
        delete baseOptions.yLabelFormatter;
        delete baseOptions.xLabelPosition;
        delete baseOptions.yLabelPosition;
        delete baseOptions.xLabelStyle;
        delete baseOptions.yLabelStyle;
        delete baseOptions.intervals;
        super(baseOptions);

        /**
         * @type {import("ol/proj/Projection").default}
         */
        this.gridProjection_ = getProjection(options.projection !== undefined ? options.projection : "EPSG:4326");

        /**
         * @type {import("ol/proj/Projection").default}
         */
        this.projection_ = null;

        /**
         * @type {number}
         * @private
         */
        this.maxY_ = Infinity;

        /**
         * @type {number}
         * @private
         */
        this.maxX_ = Infinity;

        /**
         * @type {number}
         * @private
         */
        this.minY_ = -Infinity;

        /**
         * @type {number}
         * @private
         */
        this.minX_ = -Infinity;

        /**
         * @type {number}
         * @private
         */
        this.maxYP_ = Infinity;

        /**
         * @type {number}
         * @private
         */
        this.maxXP_ = Infinity;

        /**
         * @type {number}
         * @private
         */
        this.minYP_ = -Infinity;

        /**
         * @type {number}
         * @private
         */
        this.minXP_ = -Infinity;

        /**
         * @type {number}
         * @private
         */
        this.targetSize_ =
            options.targetSize !== undefined ? options.targetSize : 100;

        /**
         * @type {number}
         * @private
         */
        this.maxLines_ = options.maxLines !== undefined ? options.maxLines : 100;

        /**
         * @type {Array<LineString>}
         * @private
         */
        this.meridians_ = [];

        /**
         * @type {Array<LineString>}
         * @private
         */
        this.parallels_ = [];

        /**
         * @type {Stroke}
         * @private
         */
        this.strokeStyle_ =
            options.strokeStyle !== undefined
                ? options.strokeStyle
                : DEFAULT_STROKE_STYLE;

        /**
         * @type {import("ol/proj").TransformFunction|undefined}
         * @private
         */
        this.fromTargetTransform_ = undefined;

        /**
         * @type {import("ol/proj").TransformFunction|undefined}
         * @private
         */
        this.toTargetTransform_ = undefined;

        /**
         * @type {import("ol/coordinate").Coordinate}
         * @private
         */
        this.projectionCenterTarget_ = null;

        /**
         * @type {Array<GraticuleLabelDataType>}
         * @private
         */
        this.meridiansLabels_ = null;

        /**
         * @type {Array<GraticuleLabelDataType>}
         * @private
         */
        this.parallelsLabels_ = null;

        this.frameStyle_ = null;
        this.frame_ = null;
        this.frameRatio_ = 0.0;

        if (options.showFrame === true) {
            this.frameStyle_ = options.frameStyle !== undefined ? options.frameStyle : DEFAULT_FRAME_STYLE;
            this.frameRatio_ = options.frameRatio !== undefined ? options.frameRatio : 0.1;
        }

        if (options.showLabels === true) {

            /**
             * @type {null|function(number):string}
             * @private
             */
            this.xLabelFormatter_ = getXLabelFormatter(options.projection || "EPSG:4326", options.xLabelFormatter);

            /**
             * @type {function(number):string}
             * @private
             */
            this.yLabelFormatter_ =  getYLabelFormatter(options.projection || "EPSG:4326", options.yLabelFormatter);

            /**
             * Longitude label position in fractions (0..1) of view extent. 0 means
             * bottom, 1 means top.
             * @type {number}
             * @private
             */
            this.xLabelPosition_ = options.xLabelPosition === undefined ? 0 :
                options.xLabelPosition;

            /**
             * Latitude Label position in fractions (0..1) of view extent. 0 means left, 1
             * means right.
             * @type {number}
             * @private
             */
            this.yLabelPosition_ = options.yLabelPosition === undefined ? 1 :
                options.yLabelPosition;

            /**
             * @type {Style}
             * @private
             */
            this.xLabelStyleBase_ = new Style({
                text:
                    options.xLabelStyle !== undefined
                        ? options.xLabelStyle.clone()
                        : DEFAULT_X_LABEL_STYLE
            });

            /**
             * @private
             * @param {import("ol/Feature").default} feature Feature
             * @return {Style} style
             */
            this.xLabelStyle_ = (feature) => {
                const label = feature.get('graticule_label');
                this.xLabelStyleBase_.getText().setText(label);
                return this.xLabelStyleBase_;
            };

            /**
             * @type {Style}
             * @private
             */
            this.yLabelStyleBase_ = new Style({
                text:
                    options.yLabelStyle !== undefined
                        ? options.yLabelStyle.clone()
                        : DEFAULT_Y_LABEL_STYLE
            });

            /**
             * @private
             * @param {import("ol/Feature").default} feature Feature
             * @return {Style} style
             */
            this.yLabelStyle_ = (feature) => {
                const label = feature.get('graticule_label');
                this.yLabelStyleBase_.getText().setText(label);
                return this.yLabelStyleBase_;
            };

            this.meridiansLabels_ = [];
            this.parallelsLabels_ = [];

            this.addEventListener(EventType.POSTRENDER, this.drawLabels_.bind(this));
        }

        /**
         * @type {Array<number>}
         * @private
         */
        this.intervals_ =
            options.intervals !== undefined ? options.intervals : getIntervals(options.projection || "EPSG:4326");

        // use a source with a custom loader for lines & text
        this.setSource(
            new VectorSource({
                loader: this.loaderFunction.bind(this),
                strategy: this.strategyFunction.bind(this),
                features: new Collection(),
                overlaps: false,
                useSpatialIndex: false,
                wrapX: options.wrapX
            })
        );

        /**
         * feature pool to use when updating graticule
         * @type {Array<Feature>}
         * @private
         */
        this.featurePool_ = [];

        /**
         * @type {Style}
         * @private
         */
        this.lineStyle_ = new Style({
            stroke: this.strokeStyle_
        });

        /**
         * @type {?import("ol/extent").Extent}
         * @private
         */
        this.loadedExtent_ = null;

        /**
         * @type {?import("ol/extent").Extent}
         * @private
         */
        this.renderedExtent_ = null;

        /**
         * @type {?number}
         * @private
         */
        this.renderedResolution_ = null;

        this.setRenderOrder(null);
    }

    /**
     * Strategy function for loading features based on the view's extent and
     * resolution.
     * @param {import("ol/extent").Extent} extent Extent.
     * @param {number} resolution Resolution.
     * @return {Array<import("ol/extent").Extent>} Extents.
     */
    strategyFunction(extent, resolution) {
        // extents may be passed in different worlds, to avoid endless loop we use only one
        let realWorldExtent = extent.slice();
        if (this.projection_ && this.getSource().getWrapX()) {
            wrapExtentX(realWorldExtent, this.projection_);
        }
        if (this.loadedExtent_) {
            if (
                approximatelyEquals(this.loadedExtent_, realWorldExtent, resolution)
            ) {
                // make sure result is exactly equal to previous extent
                realWorldExtent = this.loadedExtent_.slice();
            } else {
                // we should not keep track of loaded extents
                this.getSource().removeLoadedExtent(this.loadedExtent_);
            }
        }
        return [realWorldExtent];
    }

    /**
     * Update geometries in the source based on current view
     * @param {import("ol/extent").Extent} extent Extent
     * @param {number} resolution Resolution
     * @param {import("ol/proj/Projection").default} projection Projection
     */
    loaderFunction(extent, resolution, projection) {
        this.loadedExtent_ = extent;
        const source = this.getSource();

        // only consider the intersection between our own extent & the requested one
        const layerExtent = this.getExtent() || [
            -Infinity,
            -Infinity,
            Infinity,
            Infinity
        ];
        const renderExtent = getIntersection(layerExtent, extent);

        if (
            this.renderedExtent_ &&
            equals(this.renderedExtent_, renderExtent) &&
            this.renderedResolution_ === resolution
        ) {
            return;
        }
        this.renderedExtent_ = renderExtent;
        this.renderedResolution_ = resolution;

        // bail out if nothing to render
        if (isEmpty(renderExtent)) {
            return;
        }

        // update projection info
        const center = getCenter(renderExtent);
        const squaredTolerance = (resolution * resolution) / 4;

        const updateProjectionInfo =
            !this.projection_ || !equivalentProjection(this.projection_, projection);

        if (updateProjectionInfo) {
            this.updateProjectionInfo_(projection);
        }

        this.createGraticule_(renderExtent, center, resolution, squaredTolerance);

        // first make sure we have enough features in the pool
        let featureCount = this.meridians_.length + this.parallels_.length;
        if (this.meridiansLabels_) {
            featureCount += this.meridians_.length;
        }
        if (this.parallelsLabels_) {
            featureCount += this.parallels_.length;
        }

        let feature;
        while (featureCount > this.featurePool_.length) {
            feature = new Feature();
            this.featurePool_.push(feature);
        }

        const featuresColl = source.getFeaturesCollection();
        featuresColl.clear();
        let poolIndex = 0;

        // add features for the lines & labels
        let i;
        let l;
        for (i = 0, l = this.meridians_.length; i < l; ++i) {
            feature = this.featurePool_[poolIndex++];
            feature.setGeometry(this.meridians_[i]);
            feature.setStyle(this.lineStyle_);
            featuresColl.push(feature);
        }
        for (i = 0, l = this.parallels_.length; i < l; ++i) {
            feature = this.featurePool_[poolIndex++];
            feature.setGeometry(this.parallels_[i]);
            feature.setStyle(this.lineStyle_);
            featuresColl.push(feature);
        }
    }

    /**
     * @param {import("ol/render/Event").default} event Render event.
     * @private
     */
    drawLabels_(event) {
        const rotation = event.frameState.viewState.rotation;
        const resolution = event.frameState.viewState.resolution;
        const size = event.frameState.size;
        const extent = event.frameState.extent;
        const rotationCenter = getCenter(extent);
        let rotationExtent = extent;
        if (rotation) {
            const unrotatedWidth = size[0] * resolution;
            const unrotatedHeight = size[1] * resolution;
            rotationExtent = [
                rotationCenter[0] - unrotatedWidth / 2,
                rotationCenter[1] - unrotatedHeight / 2,
                rotationCenter[0] + unrotatedWidth / 2,
                rotationCenter[1] + unrotatedHeight / 2
            ];
        }

        let startWorld = 0;
        let endWorld = 0;
        let labelsAtStart = this.yLabelPosition_ < 0.5;
        const projectionExtent = this.projection_.getExtent();
        const worldWidth = getWidth(projectionExtent);
        if (
            this.getSource().getWrapX() &&
            this.projection_.canWrapX() &&
            !containsExtent(projectionExtent, extent)
        ) {
            startWorld = Math.floor((extent[0] - projectionExtent[0]) / worldWidth);
            endWorld = Math.ceil((extent[2] - projectionExtent[2]) / worldWidth);
            const inverted = Math.abs(rotation) > Math.PI / 2;
            labelsAtStart = labelsAtStart !== inverted;
        }
        const vectorContext = getVectorContext(event);
        if (this.frame_) {
            vectorContext.setFillStrokeStyle(this.frameStyle_.getFill(), this.frameStyle_.getStroke());
            vectorContext.drawGeometry(this.frame_);
        }

        for (let world = startWorld; world <= endWorld; ++world) {
            let poolIndex = this.meridians_.length + this.parallels_.length;
            let feature;
            let index;
            let l;
            let textPoint;

            if (this.meridiansLabels_) {
                for (index = 0, l = this.meridiansLabels_.length; index < l; ++index) {
                    const lineString = this.meridians_[index];
                    if (!rotation && world === 0) {
                        textPoint = this.getMeridianPoint_(lineString, extent, index);
                    } else {
                        const clone = lineString.clone();
                        clone.translate(world * worldWidth, 0);
                        clone.rotate(-rotation, rotationCenter);
                        textPoint = this.getMeridianPoint_(clone, rotationExtent, index);
                        textPoint.rotate(rotation, rotationCenter);
                    }
                    feature = this.featurePool_[poolIndex++];
                    feature.setGeometry(textPoint);
                    feature.set('graticule_label', this.meridiansLabels_[index].text);
                    vectorContext.drawFeature(feature, this.xLabelStyle_(feature));
                }
            }
            if (this.parallelsLabels_?.length > 0) {
                if (
                    (world === startWorld && labelsAtStart) ||
                    (world === endWorld && !labelsAtStart)
                ) {
                    for (index = 0, l = this.parallels_.length; index < l; ++index) {
                        const lineString = this.parallels_[index];
                        if (!rotation && world === 0) {
                            textPoint = this.getParallelPoint_(lineString, extent, index);
                        } else {
                            const clone = lineString.clone();
                            clone.translate(world * worldWidth, 0);
                            clone.rotate(-rotation, rotationCenter);
                            textPoint = this.getParallelPoint_(clone, rotationExtent, index);
                            textPoint.rotate(rotation, rotationCenter);
                        }
                        feature = this.featurePool_[poolIndex++];
                        feature.setGeometry(textPoint);
                        feature.set('graticule_label', this.parallelsLabels_[index].text);
                        vectorContext.drawFeature(feature, this.yLabelStyle_(feature));
                    }
                }
            }
        }
    }

    /**
     * @param {import("ol/extent").Extent} extent Extent.
     * @param {import("ol/coordinate").Coordinate} center Center.
     * @param {number} resolution Resolution.
     * @param {number} squaredTolerance Squared tolerance.
     * @private
     */
    createGraticule_(extent, center, resolution, squaredTolerance) {
        const interval = getInterval(this.intervals_, this.projectionCenterTarget_, this.targetSize_, resolution, this.fromTargetTransform_);
        const grid = createGrid(
            interval,
            this.projection_.getCode(),
            this.gridProjection_.getCode(),
            [
                extent[0],
                extent[1],
                extent[2],
                extent[3]
            ],
            [
                this.minXP_,
                this.minYP_,
                this.maxXP_,
                this.maxYP_
            ],
            center,
            squaredTolerance,
            this.maxLines_,
            !!this.xLabelFormatter_,
            this.xLabelFormatter_,
            this.yLabelFormatter_,
            this.xLabelPosition_,
            this.yLabelPosition_,
            this.frameRatio_,
            {
                center,
                resolution,
                interval
            }
        );
        this.meridians_ = grid.xLines.map(l => new LineString(l, 'XY'));
        this.parallels_ = grid.yLines.map(l => new LineString(l, 'XY'));
        this.meridiansLabels_ = grid.xLabels.map(p => ({
            ...p,
            geom: new Point(p.geom)
        }));
        this.parallelsLabels_ = grid.yLabels.map(p => ({
            ...p,
            geom: new Point(p.geom)
        }));
        this.frame_ = grid.frame ? new Polygon([grid.frame.exterior, grid.frame.interior], 'XY') : null;
    }

    /**
     * @param {LineString} lineString Meridian
     * @param {import("ol/extent").Extent} extent Extent.
     * @param {number} index Index.
     * @return {Point} Meridian point.
     * @private
     */
    getMeridianPoint_(lineString, extent, index) {
        const flatCoordinates = lineString.getFlatCoordinates();
        let bottom = 1;
        let top = flatCoordinates.length - 1;
        if (flatCoordinates[bottom] > flatCoordinates[top]) {
            bottom = top;
            top = 1;
        }
        const clampedBottom = Math.max(extent[1], flatCoordinates[bottom]);
        const clampedTop = Math.min(extent[3], flatCoordinates[top]);
        const lat = clamp(
            extent[1] + Math.abs(extent[1] - extent[3]) * this.xLabelPosition_,
            clampedBottom,
            clampedTop
        );
        const coordinate0 =
            flatCoordinates[bottom - 1] +
            ((flatCoordinates[top - 1] - flatCoordinates[bottom - 1]) *
                (lat - flatCoordinates[bottom])) /
            (flatCoordinates[top] - flatCoordinates[bottom]);
        const coordinate = [coordinate0, lat];
        const point = this.meridiansLabels_[index].geom;
        point.setCoordinates(coordinate);
        return point;
    }

    /**
     * Get the list of meridians.  Meridians are lines of equal longitude.
     * @return {Array<LineString>} The meridians.
     * @api
     */
    getMeridians() {
        return this.meridians_;
    }

    /**
     * @param {LineString} lineString Parallels.
     * @param {import("ol/extent").Extent} extent Extent.
     * @param {number} index Index.
     * @return {Point} Parallel point.
     * @private
     */
    getParallelPoint_(lineString, extent, index) {
        const flatCoordinates = lineString.getFlatCoordinates();
        let left = 0;
        let right = flatCoordinates.length - 2;
        if (flatCoordinates[left] > flatCoordinates[right]) {
            left = right;
            right = 0;
        }
        const clampedLeft = Math.max(extent[0], flatCoordinates[left]);
        const clampedRight = Math.min(extent[2], flatCoordinates[right]);
        const lon = clamp(
            extent[0] + Math.abs(extent[0] - extent[2]) * this.yLabelPosition_,
            clampedLeft,
            clampedRight
        );
        const coordinate1 =
            flatCoordinates[left + 1] +
            ((flatCoordinates[right + 1] - flatCoordinates[left + 1]) *
                (lon - flatCoordinates[left])) /
            (flatCoordinates[right] - flatCoordinates[left]);
        const coordinate = [lon, coordinate1];
        const point = this.parallelsLabels_[index].geom;
        point.setCoordinates(coordinate);
        return point;
    }

    /**
     * Get the list of parallels.  Parallels are lines of equal latitude.
     * @return {Array<LineString>} The parallels.
     * @api
     */
    getParallels() {
        return this.parallels_;
    }

    /**
     * @param {import("ol/proj/Projection").default} projection Projection.
     * @private
     */
    updateProjectionInfo_(projection) {
        const targetProjection = this.gridProjection_ || getProjection('EPSG:4326');

        const worldExtent = projection.getWorldExtent();
        const worldExtentP = projection.getExtent();

        this.maxY_ = worldExtent[3];
        this.maxX_ = worldExtent[2];
        this.minY_ = worldExtent[1];
        this.minX_ = worldExtent[0];

        this.maxYP_ = worldExtentP[3];
        this.maxXP_ = worldExtentP[2];
        this.minYP_ = worldExtentP[1];
        this.minXP_ = worldExtentP[0];

        this.fromTargetTransform_ = getTransform(targetProjection, projection);

        this.toTargetTransform_ = getTransform(projection, targetProjection);

        this.projectionCenterTarget_ = this.toTargetTransform_(getCenter(projection.getExtent()));

        this.projection_ = projection;
    }
}

export default Graticule;
