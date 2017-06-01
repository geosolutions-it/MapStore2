const {isArray} = require('lodash');
const isGML1 = (version) => version === "1.0.0";
const closePolygon = (coords) => {
    if (coords.length >= 3) {
        const first = coords[0];
        const last = coords[coords.length - 1];
        if ((first[0] !== last[0]) || (first[1] !== last[1])) {
            return coords.concat([coords[0]]);
        }
    }
    return coords;
};
const pointElement = (coordinates, srsName, version) => {
    let gmlPoint = '<gml:Point srsDimension="2"';
    const gml1 = isGML1(version);
    gmlPoint += srsName ? ' srsName="' + srsName + '">' : '>';
    if (gml1) {
        gmlPoint += '<gml:coord><X>' + coordinates[0] + '</X><Y>' + coordinates[1] + '</Y></gml:coord>';
    } else {
        gmlPoint += '<gml:pos>' + coordinates.join(" ") + '</gml:pos>';
    }


    gmlPoint += '</gml:Point>';
    return gmlPoint;
};

const polygonElement = (coordinates, srsName, version) => {
    const gml1 = isGML1(version);
    let gmlPolygon = '<gml:Polygon';
    gmlPolygon += srsName ? ' srsName="' + srsName + '">' : '>';

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // Array of LinearRing coordinate array. The first element in the array represents the exterior ring.
    // Any subsequent elements represent interior rings (or holes).
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////

    const normalizedCoords = coordinates.length && isArray(coordinates[0]) && coordinates[0].length && isArray(coordinates[0][0]) ? coordinates : [coordinates];
    normalizedCoords.forEach((element, index) => {
        let coords = closePolygon(element).map((coordinate) => {
            return coordinate[0] + (gml1 ? "," : " ") + coordinate[1];
        });
        const exterior = (gml1 ? "outerBoundaryIs" : "exterior");
        const interior = (gml1 ? "innerBoundaryIs" : "exterior");
        gmlPolygon +=
            (index < 1 ? '<gml:' + exterior + '>' : '<gml:' + interior + '>') +
                    '<gml:LinearRing>' +
                    (gml1 ? '<gml:coordinates>' : '<gml:posList>') +
                            coords.join(" ") +
                    (gml1 ? '</gml:coordinates>' : '</gml:posList>') +
                    '</gml:LinearRing>' +
            (index < 1 ? '</gml:' + exterior + '>' : '</gml:' + interior + '>');
    });

    gmlPolygon += '</gml:Polygon>';
    return gmlPolygon;
};
const lineStringElement = (coordinates, srsName, version) => {
    const gml1 = isGML1(version);
    let gml = '<gml:LineString';
    gml += srsName ? ' srsName="' + srsName + '">' : '>';

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // Array of LinearRing coordinate array. The first element in the array represents the exterior ring.
    // Any subsequent elements represent interior rings (or holes).
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////

    let coords = coordinates.map((coordinate) => {
        return coordinate[0] + (gml1 ? "," : " ") + coordinate[1];
    });
    gml += (gml1 ? '<gml:coordinates>' : '<gml:posList>') +
              coords.join(" ") +
                (gml1 ? '</gml:coordinates>' : '</gml:posList>');

    gml += '</gml:LineString>';
    return gml;
};


/**
 * Processes the geometry in geojson format to provide the GML version of it
 * @param  {string} version  GML version
 * @param  {object} geometry the geometry in GeoJSON format
 * @return {string}          the GML version of the Geometry
 */
const processOGCGeometry = (version, geometry) => {
    let ogc = '';
    const srsName = geometry.projection || "EPSG:4326";
    switch (geometry.type) {
        case "Point":
            ogc += pointElement(geometry.coordinates,
                srsName, version);
            break;
        case "MultiPoint":
            ogc += '<gml:MultiPoint srsName="' + (geometry.projection || "EPSG:4326") + '">';

                    // //////////////////////////////////////////////////////////////////////////
                    // Coordinates of a MultiPoint are an array of positions
                    // //////////////////////////////////////////////////////////////////////////
            geometry.coordinates.forEach((element) => {
                let point = element;
                if (point) {
                    ogc += "<gml:pointMember>";
                    ogc += pointElement(point, version);
                    ogc += "</gml:pointMember>";
                }
            });

            ogc += '</gml:MultiPoint>';
            break;
        case "LineString":
            ogc += lineStringElement(geometry.coordinates,
              srsName, version);
            break;
        case "MultiLineString":
        const multyLineTagName = version === "2.0" ? "MultiCurve" : "MultiLineString";
        const lineMemberTagName = version === "2.0" ? "curveMember" : "lineStringMember";

        ogc += `<gml:${multyLineTagName} srsName="${srsName}">`;

                // //////////////////////////////////////////////////////////////////////////
                // Coordinates of a MultiPolygon are an array of Polygon coordinate arrays
                // //////////////////////////////////////////////////////////////////////////
        geometry.coordinates.forEach((element) => {
            if (element) {
                ogc += "<gml:" + lineMemberTagName + ">";
                ogc += lineStringElement(element, srsName, version);
                ogc += "</gml:" + lineMemberTagName + ">";
            }
        });
        ogc += '</gml:' + multyLineTagName + '>';
        break;
        case "Polygon":
            ogc += polygonElement(geometry.coordinates,
                srsName, version);
            break;
        case "MultiPolygon":
            const multyPolygonTagName = version === "2.0" ? "MultiSurface" : "MultiPolygon";
            const polygonMemberTagName = version === "2.0" ? "surfaceMembers" : "polygonMember";

            ogc += `<gml:${multyPolygonTagName} srsName="${srsName}">`;

                    // //////////////////////////////////////////////////////////////////////////
                    // Coordinates of a MultiPolygon are an array of Polygon coordinate arrays
                    // //////////////////////////////////////////////////////////////////////////
            geometry.coordinates.forEach((element) => {
                let polygon = element;
                if (polygon) {
                    ogc += "<gml:" + polygonMemberTagName + ">";
                    ogc += polygonElement(polygon, srsName, version);
                    ogc += "</gml:" + polygonMemberTagName + ">";
                }
            });
            ogc += '</gml:' + multyPolygonTagName + '>';
            break;
        default:
            break;
    }
    return ogc;
};

module.exports = {
    closePolygon,
    pointElement,
    polygonElement,
    lineStringElement,
    processOGCGeometry
};
