/**
 * @module ol/Graticule
 * Forked implementation of ol.Graticule that supports grids in different
 * projections, other than EPSG:4326.
 *
 */
import {listen, unlistenByKey} from 'ol/events';
import {getCenter} from 'ol/extent';
import {get as getProjection, equivalent as equivalentProjection, getTransform} from 'ol/proj';
import RenderEventType from 'ol/render/EventType';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import Style from 'ol/style/Style';
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";

import { createGrid, getInterval, getIntervals } from "../grids/MapGridsUtils";
import { getXLabelFormatter, getYLabelFormatter } from "../grids/GridLabelsUtils";
import GeometryLayout from 'ol/geom/GeometryLayout';


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
 * @property {Point} geom
 * @property {string} text
 */

/**
 * @typedef {Object} Options
 * @property {import("ol/PluggableMap.js").default} [map] Reference to an
 * {@link module:ol/Map~Map} object.
 * @property {string} [projection=EPSG:4326] coordinate system to use for the grid
 * lines. By default is EPSG:4326, producing lon-lat grids. Depending on the crs units
 * grids will use degrees or meters (and multiples).
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
 */


/**
 * Render a grid for a coordinate system on a map.
 * @api
 */
class Graticule {

    /**
     * @param {Options=} options Options.
     */
    constructor(options = {}) {
        /**
         * @type {import("ol/PluggableMap.js").default}
         * @private
         */
        this.map_ = null;

        /**
         * @type {?import("ol/events.js").EventsKey}
         * @private
         */
        this.postcomposeListenerKey_ = null;

        /**
         * @type {import("ol/proj/Projection.js").default}
         */
        this.gridProjection_ = getProjection(options.projection !== undefined ? options.projection : "EPSG:4326");

        /**
         * @type {import("ol/proj/Projection.js").default}
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
        this.targetSize_ = options.targetSize !== undefined ? options.targetSize : 100;

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
        this.strokeStyle_ = options.strokeStyle !== undefined ? options.strokeStyle : DEFAULT_STROKE_STYLE;

        /**
         * @type {import("ol/proj.js").TransformFunction|undefined}
         * @private
         */
        this.fromTargetTransform_ = undefined;

        /**
         * @type {import("ol/proj.js").TransformFunction|undefined}
         * @private
         */
        this.toTargetTransform_ = undefined;

        /**
         * @type {import("ol/coordinate.js").Coordinate}
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
             * @type {Text}
             * @private
             */
            this.xLabelStyle_ = options.xLabelStyle !== undefined ? options.xLabelStyle : DEFAULT_X_LABEL_STYLE;

            /**
             * @type {Text}
             * @private
             */
            this.yLabelStyle_ = options.yLabelStyle !== undefined ? options.yLabelStyle : DEFAULT_Y_LABEL_STYLE;

            this.meridiansLabels_ = [];
            this.parallelsLabels_ = [];
        }

        /**
         * @type {Array<number>}
         * @private
         */
        this.intervals_ = options.intervals !== undefined ? options.intervals : getIntervals(options.projection || "EPSG:4326");

        this.setMap(options.map !== undefined ? options.map : null);
    }

    /**
     * @param {import("ol/extent.js").Extent} extent Extent.
     * @param {import("ol/coordinate.js").Coordinate} center Center.
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
        this.meridians_ = grid.xLines.map(l => new LineString(l, GeometryLayout.XY));
        this.parallels_ = grid.yLines.map(l => new LineString(l, GeometryLayout.XY));
        this.meridiansLabels_ = grid.xLabels.map(p => ({
            ...p,
            geom: new Point(p.geom)
        }));
        this.parallelsLabels_ = grid.yLabels.map(p => ({
            ...p,
            geom: new Point(p.geom)
        }));
        this.frame_ = grid.frame ? new Polygon([grid.frame.exterior, grid.frame.interior], GeometryLayout.XY) : null;
    }

    /**
     * Get the map associated with this graticule.
     * @return {import("ol/PluggableMap.js").default} The map.
     * @api
     */
    getMap() {
        return this.map_;
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
     * Get the list of parallels.  Parallels are lines of equal latitude.
     * @return {Array<LineString>} The parallels.
     * @api
     */
    getParallels() {
        return this.parallels_;
    }

    /**
     * @param {import("ol/render/Event.js").default} e Event.
     * @private
     */
    handlePostCompose_(e) {
        const vectorContext = e.vectorContext;
        const frameState = e.frameState;
        const extent = frameState.extent;
        const viewState = frameState.viewState;
        const center = viewState.center;
        const projection = viewState.projection;
        const resolution = viewState.resolution;
        const pixelRatio = frameState.pixelRatio;
        const squaredTolerance =
                resolution * resolution / (4 * pixelRatio * pixelRatio);

        const updateProjectionInfo = !this.projection_ ||
                !equivalentProjection(this.projection_, projection);

        if (updateProjectionInfo) {
            this.updateProjectionInfo_(projection);
        }

        this.createGraticule_(extent, center, resolution, squaredTolerance);

        // Draw the lines
        vectorContext.setFillStrokeStyle(null, this.strokeStyle_);
        let i;
        let l;
        let line;
        for (i = 0, l = this.meridians_.length; i < l; ++i) {
            line = this.meridians_[i];
            vectorContext.drawGeometry(line);
        }
        for (i = 0, l = this.parallels_.length; i < l; ++i) {
            line = this.parallels_[i];
            vectorContext.drawGeometry(line);
        }
        if (this.frame_) {
            vectorContext.setFillStrokeStyle(this.frameStyle_.getFill(), this.frameStyle_.getStroke());
            vectorContext.drawGeometry(this.frame_);
        }
        let labelData;
        if (this.meridiansLabels_) {
            for (i = 0, l = this.meridiansLabels_.length; i < l; ++i) {
                labelData = this.meridiansLabels_[i];
                this.xLabelStyle_.setText(labelData.text);
                vectorContext.setTextStyle(this.xLabelStyle_);
                vectorContext.drawGeometry(labelData.geom);
            }
        }
        if (this.parallelsLabels_) {
            for (i = 0, l = this.parallelsLabels_.length; i < l; ++i) {
                labelData = this.parallelsLabels_[i];
                this.yLabelStyle_.setText(labelData.text);
                vectorContext.setTextStyle(this.yLabelStyle_);
                vectorContext.drawGeometry(labelData.geom);
            }
        }
    }

    /**
     * @param {import("ol/proj/Projection.js").default} projection Projection.
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

    /**
     * Set the map for this graticule.  The graticule will be rendered on the
     * provided map.
     * @param {import("ol/PluggableMap.js").default} map Map.
     * @api
     */
    setMap(map) {
        if (this.map_) {
            unlistenByKey(this.postcomposeListenerKey_);
            this.postcomposeListenerKey_ = null;
            this.map_.render();
        }
        if (map) {
            this.postcomposeListenerKey_ = listen(map, RenderEventType.POSTCOMPOSE, this.handlePostCompose_, this);
            map.render();
        }
        this.map_ = map;
    }
}

export default Graticule;
