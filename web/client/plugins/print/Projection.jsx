import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {createPlugin} from "../../utils/PluginsUtils";
import {addTransformer, addMapTransformer, addValidator} from "../../utils/PrintUtils";
import { setPrintParameter } from "../../actions/print";
import printReducer from "../../reducers/print";
import Choice from "../../components/print/Choice";
import { getMessageById } from '../../utils/LocaleUtils';
import {getScales, getResolutions, METERS_PER_UNIT} from "../../utils/MapUtils";

import { getAvailableCRS, normalizeSRS, reproject, getUnits, reprojectGeoJson } from '../../utils/CoordinatesUtils';

function reprojectPoint(point, source, dest) {
    const p = reproject(point, source, dest);
    return [p.x, p.y];
}

function reprojectZoom(zoom, mapProjection, printProjection) {
    const multiplier = METERS_PER_UNIT[getUnits(mapProjection)] / METERS_PER_UNIT[getUnits(printProjection)];
    const mapResolution = getResolutions(mapProjection)[zoom] * multiplier;
    const printResolutions = getResolutions(printProjection);

    const printResolution = printResolutions.reduce((nearest, current) => {
        return Math.abs(current - mapResolution) < Math.abs(nearest - mapResolution) ? current : nearest;
    }, printResolutions[0]);
    return printResolutions.indexOf(printResolution);
}

const projectionSelector = (state) => state?.print?.spec?.params?.projection ?? state?.print?.map?.projection ?? "EPSG:3857";
const mapProjectionSelector = (state) => state?.print?.map?.projection ?? "EPSG:3857";

function reprojectLayer(layer, from, to)  {
    if (from !== to) {
        return {
            ...layer,
            geoJson: reprojectGeoJson(layer.geoJson, from, to)
        };
    }
    return layer;
}

function transformer(state, spec) {
    const projection = state?.print?.spec?.params?.projection;
    if (projection) {
        const srs = normalizeSRS(projection);
        const scales = getScales(srs);
        const zoom = reprojectZoom(state.print.map.scaleZoom, spec.srs, srs);
        return Promise.resolve({
            ...spec,
            layers: spec.layers.map(l => l.type === "Vector" ? reprojectLayer(l, spec.srs, srs) : l),
            srs,
            units: getUnits(srs),
            pages: spec.pages.map(p => ({
                ...p,
                center: reprojectPoint(p.center, spec.srs, srs),
                scale: scales[zoom]
            }))
        });
    }
    return Promise.resolve(spec);
}

function mapTransformer(state, map) {
    const projection = projectionSelector(state);
    const mapProjection = mapProjectionSelector(state);
    const srs = normalizeSRS(projection);
    const mapSrs = normalizeSRS(mapProjection);
    if (srs !== mapSrs) {
        const zoom = reprojectZoom(map.scaleZoom, mapSrs, srs);
        const scales = getScales(srs);
        return {
            ...map,
            zoom: zoom,
            scaleZoom: zoom,
            scale: scales[zoom],
            projection: srs
        };
    }
    return map;
}

const validator = (allowPreview) => (state) => {
    const projection = projectionSelector(state);
    const mapProjection = mapProjectionSelector(state);

    if (!allowPreview && normalizeSRS(projection) !== normalizeSRS(mapProjection)) {
        return {
            valid: false,
            errors: ["print.projectionmismatch"]
        };
    }
    return {valid: true};
};

function getItems(supported, user) {
    if (user) {
        return user.filter(u => supported.find(s=> s.value === u.value));
    }
    return supported;
}

export const Projection = ({
    projection,
    items,
    onChangeParameter,
    allowPreview = false,
    projections,
    onRefresh = () => {}
}, context) => {
    useEffect(() => {
        addTransformer("projection", transformer, 3);
    }, []);
    useEffect(() => {
        addValidator("projection", "map-preview", validator(allowPreview));
    }, [allowPreview]);
    useEffect(() => {
        addMapTransformer("projection", mapTransformer);
    }, []);
    function changeProjection(crs) {
        onChangeParameter("params.projection", crs);
        onRefresh();
    }
    return (
        <>
            <Choice
                selected={projection}
                onChange={changeProjection}
                items={getItems(items, projections)}
                label={getMessageById(context.messages, "print.projection")}
            />
        </>
    );
};

Projection.contextTypes = {
    messages: PropTypes.object
};

/**
 * Projection switcher plugin for Print. This plugin adds the possibility for the user
 * to switch to a different projection for the printed map, than the one used on screen.
 *
 * @class PrintProjection
 * @memberof plugins.print
 * @static
 *
 * @prop {boolean} cfg.allowPreview print preview may be enabled or not, when switching to
 * a different projection. Preview may have glitches with some projections, so it is disabled
 * by default. You can enable it again by setting this option to true.
 * @prop {object[]} cfg,projections optional list of projections to offer ({name: <description>, value: "EPSG:3003"})
 * is filtered by the available CRS in MapStore configuration.
 *
 * @example
 * // include the widget in the Print plugin right-panel container, after resolution
 * // and with preview enabled
 * {
 *   "name": "PrintProjection",
 *   "override": {
 *      "Print": {
 *          "target": "right-panel",
 *          "position": 1.5
 *      }
 *   },
 *   "cfg": {
 *      "allowPreview": true,
 *      "projections": [{"name": "WGS84", "value": "EPSG:4326"}, {"name": "Mercator", "value": "EPSG:3857"}]
 *   }
 * }
 */
export default createPlugin("PrintProjection", {
    component: connect(
        (state) => ({
            spec: state?.print?.spec || {},
            map: state?.print?.map,
            projection: projectionSelector(state),
            items: Object.keys(getAvailableCRS()).map(p => ({
                name: p,
                value: p
            }))
        }), {
            onChangeParameter: setPrintParameter
        }
    )(Projection),
    reducers: {print: printReducer},
    containers: {
        Print: {
            priority: 1,
            target: "left-panel",
            position: 4
        }
    }
});
