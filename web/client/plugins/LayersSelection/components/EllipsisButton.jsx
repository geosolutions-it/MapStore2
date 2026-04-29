import React, { useState, useEffect } from 'react';
import bbox from '@turf/bbox';
import { saveAs } from 'file-saver';
import axios from 'axios';

import Message from '../../../components/I18N/Message';
import { describeFeatureType } from '../../../api/WFS';
import Statistics from './Statistics';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import uuidv1 from 'uuid/v1';

/**
 * EllipsisButton provides a contextual menu for selected layer data.
 * It allows users to:
 * - Zoom to selection extent
 * - View statistics
 * - Create a new layer from selection
 * - Export data (GeoJSON, JSON, CSV)
 * - Apply attribute filters (if supported)
 * - Clear the selection
 *
 * @param {Object} props - Component props.
 * @param {Object} props.node - Layer node (descriptor).
 * @param {Object} props.selectionData - GeoJSON FeatureCollection.
 * @param {Function} props.onAddOrUpdateSelection - Callback to update selection.
 * @param {Function} props.onZoomToExtent - Callback to zoom to selection.
 * @param {Function} props.onAddLayer - Callback to add a new layer.
 * @param {Function} props.onChangeLayerProperties - Callback to change layer properties.
 */
export default ({
    node = {},
    selectionData = {},
    onAddOrUpdateSelection = () => { },
    onZoomToExtent = () => { },
    onAddLayer = () => { },
    onChangeLayerProperties = () => { }
}) => {

    const [statisticsOpen, setStatisticsOpen] = useState(false);
    const [numericFields, setNumericFields] = useState([]);
    const [primaryKey, setPrimaryKey] = useState(null);

    const triggerAction = (action) => {
        switch (action) {
        case 'clear': {
            onAddOrUpdateSelection(node, {});
            break;
        }
        case 'zoomTo': {
            if (selectionData.features?.length > 0) {
                const extent = bbox(selectionData);
                if (extent) { onZoomToExtent(extent, selectionData.crs.properties[selectionData.crs.type]); }
            }
            break;
        }
        case 'createLayer': {
            if (selectionData.features?.length > 0) {

                const nodeName = node.title + '_Select_';
                const layerBbox = bbox(selectionData);
                const uniqueId = uuidv1();

                onAddLayer({
                    id: uniqueId,
                    type: 'vector',
                    visibility: true,
                    name: nodeName + uniqueId,
                    hideLoading: true,
                    bbox: layerBbox,
                    features: selectionData.features
                });
            }
            break;
        }
        case 'exportToGeoJson': {
            if (selectionData.features?.length > 0) { saveAs(new Blob([JSON.stringify(selectionData)], { type: 'application/json' }), node.title + '.json'); }
            break;
        }
        case 'exportToJson': {
            if (selectionData.features?.length > 0) { saveAs(new Blob([JSON.stringify(selectionData.features.map(feature => feature.properties))], { type: 'application/json' }), node.title + '.json'); }
            break;
        }
        case 'exportToCsv': {
            if (selectionData.features?.length > 0) { saveAs(new Blob([Object.keys(selectionData.features[0].properties).join(',') + '\n' + selectionData.features.map(feature => Object.values(feature.properties).join(',')).join('\n')], { type: 'text/csv' }), node.title + '.csv'); }
            break;
        }
        case 'filterData': {

            switch (node.type) {
            case 'arcgis': {
                // TODO : implement here when MapStore supports filtering for arcgis services
                throw new Error(`Unsupported layer type: ${node.type}`);
            }
            case 'wms':
            case 'wfs': {
                onChangeLayerProperties(node.id, {
                    layerFilter: {
                        groupFields: [
                            {
                                id: 1,
                                logic: 'OR',
                                index: 0
                            }
                        ],
                        filterFields: selectionData.features.map(feature => ({
                            rowId: uuidv1(),
                            groupId: 1,
                            attribute: primaryKey,
                            operator: '=',
                            value: feature.properties[primaryKey],
                            type: 'number',
                            fieldOptions: {
                                valuesCount: 0,
                                currentPage: 1
                            },
                            exception: null
                        }))
                    }
                });
                break;
            }
            default:
                throw new Error(`Unsupported layer type: ${node.type}`);
            }
            break;
        }
        default:
        }
    };

    useEffect(() => {
        switch (node.type) {
        case 'arcgis': {
            const arcgisNumericFields = new Set(['esriFieldTypeSmallInteger', 'esriFieldTypeInteger', 'esriFieldTypeSingle', 'esriFieldTypeDouble']);
            const singleLayerId = parseInt(node.name ?? '', 10);
            Promise.all((Number.isInteger(singleLayerId) ? node.options.layers.filter(l => l.id === singleLayerId) : node.options.layers).map(l => axios.get(`${node.url}/${l.id}`, { params: { f: 'json' } })
                .then(describe => describe.data.fields.filter(field => field.domain === null && arcgisNumericFields.has(field.type)).map(field => field.name))
                .catch(() => [])
            ))
                .then(responses => {
                    setPrimaryKey(null);
                    setNumericFields(responses.map(response => response ?? []).flat());
                })
                .catch(() => {
                    setPrimaryKey(null);
                    setNumericFields([]);
                });
            break;
        }
        case 'wms':
        case 'wfs': {
            describeFeatureType(node.url, node.name)
                .then(describe => {
                    const featureType = describe.featureTypes.find(fType => node.name.endsWith(fType.typeName));
                    const newNumericFields = featureType.properties.filter(property => property.localType === 'number').map(property => property.name);
                    // primary key is not always exposed
                    const newPrimaryKey = featureType.properties
                        .find(property =>
                            ['xsd:string', 'xsd:int'].includes(property.type) && !property.nillable && property.maxOccurs === 1 && property.minOccurs === 1
                        )?.name || null;
                    setPrimaryKey(newPrimaryKey);
                    setNumericFields(newNumericFields);
                })
                .catch(() => {
                    setPrimaryKey(null);
                    setNumericFields([]);
                });
            break;
        }
        default:
        }
    }, [node.name]);

    return (
        <>
            <DropdownButton
                pullRight
                title={<Glyphicon glyph="option-vertical"/>}
                className="_border-transparent"
                noCaret
            >
                <MenuItem onClick={() => triggerAction('zoomTo')}><Message msgId="layersSelection.button.zoomTo" /></MenuItem>
                <MenuItem onClick={() => { selectionData.features?.length > 0 ? setStatisticsOpen(true) : null; }}><Message msgId="layersSelection.button.statistics" /></MenuItem>
                <MenuItem onClick={() => triggerAction('createLayer')}><Message msgId="layersSelection.button.createLayer" /></MenuItem>
                {primaryKey ? <MenuItem onClick={() => triggerAction('filterData')}><Message msgId="layersSelection.button.filterData" /></MenuItem> : null}
                <MenuItem onClick={() => triggerAction('exportToGeoJson')}><Message msgId="layersSelection.button.exportToGeoJson" /></MenuItem>
                <MenuItem onClick={() => triggerAction('exportToJson')}><Message msgId="layersSelection.button.exportToJson" /></MenuItem>
                <MenuItem onClick={() => triggerAction('exportToCsv')}><Message msgId="layersSelection.button.exportToCsv" /></MenuItem>
                <MenuItem onClick={() => triggerAction('clear')}><Message msgId="layersSelection.button.clear" /></MenuItem>
            </DropdownButton>
            {statisticsOpen && <Statistics
                setStatisticsOpen={setStatisticsOpen}
                fields={numericFields}
                features={selectionData.features ?? []}
            />}
        </>
    );
};
