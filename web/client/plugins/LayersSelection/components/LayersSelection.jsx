import React, { useEffect, useState } from 'react';
import { ControlLabel, Glyphicon } from 'react-bootstrap';

import { ControlledTOC } from '../../TOC/components/TOC';
import ResizableModal from '../../../components/misc/ResizableModal';
import Message from '../../../components/I18N/Message';
import VisibilityCheck from '../../TOC/components/VisibilityCheck';
import NodeHeader from '../../TOC/components/NodeHeader';
import { getLayerTypeGlyph } from '../../../utils/LayersUtils';
import NodeTool from '../../TOC/components/NodeTool';
import InlineLoader from '../../TOC/components/InlineLoader';
import EllipsisButton from './EllipsisButton';
import { isSelectQueriable, filterLayerForSelect } from '../selectors/layersSelection';
import FlexBox from '../../../components/layout/FlexBox';
import Button from '../../../components/layout/Button';
import Select from 'react-select';
import { getMessageById } from '../../../utils/LocaleUtils';
import PropTypes from 'prop-types';

import './layersSelection.css';

const SelectionToolsTypes = {
    Point: { type: 'Point', value: 'Point', labelId: 'layersSelection.button.selectByPoint', icon: '1-point' },
    LineString: { type: 'LineString', value: 'LineString', labelId: 'layersSelection.button.selectByLine', icon: 'polyline' },
    Circle: { type: 'Circle', value: 'Circle', labelId: 'layersSelection.button.selectByCircle', icon: '1-circle' },
    Rectangle: { type: 'Rectangle', value: 'BBOX', labelId: 'layersSelection.button.selectByRectangle', icon: 'unchecked' },
    Polygon: { type: 'Polygon', value: 'Polygon', labelId: 'layersSelection.button.selectByPolygon', icon: 'polygon' }
};

/**
 * Appends or updates a cache-busting `_v_` parameter on the layer's legendParams object.
 *
 * @param {Object} layer - The layer object to apply the parameter to.
 * @returns {Object} A new layer object with the `_v_` legend param added.
 */
function applyVersionParamToLegend(layer) {
    // we need to pass a parameter that invalidate the cache for GetLegendGraphic
    // all layer inside the dataset viewer apply a new _v_ param each time we switch page
    return { ...layer, legendParams: { ...layer?.legendParams, _v_: layer?._v_ } };
}

/**
 * Select tool UI component wrapped with react-intl internationalization.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array} props.layers - List of layers from the map.
 * @param {Function} props.onUpdateNode - Redux action to update a layer node.
 * @param {Function} props.onClose - Callback for closing the modal.
 * @param {Boolean} props.isVisible - Whether the modal is visible.
 * @param {Object} props.highlightOptions - Highlighting options for selected features.
 * @param {Object} props.queryOptions - Options for querying features.
 * @param {Array} props.selectTools - Toolbar tools for the selection module.
 * @param {Function} props.storeConfiguration - Saves configuration to the Redux store.
 * @param {Object} props.intl - Internationalization object from `injectIntl`.
 * @param {Object} props.selections - Selection results grouped by layer ID.
 * @param {Number} props.maxFeatureCount - Maximum number of features allowed per selection.
 * @param {Function} props.cleanSelection - Action to clear selection results.
 * @param {Function} props.addOrUpdateSelection - Action to update the current selection.
 * @param {Function} props.zoomToExtent - Action to zoom to the extent of selected features.
 * @param {Function} props.addLayer - Action to add a new layer.
 * @param {Function} props.changeLayerProperties - Action to update layer properties.
 *
 * @returns {JSX.Element} The rendered Select tool modal.
 */
const LayersSelection = ({
    layers,
    onUpdateNode,
    onClose,
    isVisible,
    highlightOptions,
    queryOptions,
    selectTools = [
        'Point',
        'LineString',
        'Circle',
        'Rectangle',
        'Polygon'
    ],
    storeConfiguration,
    selections,
    maxFeatureCount,
    cleanSelection,
    addOrUpdateSelection,
    zoomToExtent,
    addLayer,
    changeLayerProperties
}, context) => {

    const filterLayers = layers.filter(filterLayerForSelect);

    /**
     * Renders a custom layer node component inside the TOC.
     *
     * @param {Object} props
     * @param {Object} props.node - The layer node.
     * @param {Object} props.config - Configuration options such as locale.
     * @returns {JSX.Element} Rendered layer node with feature count, tools, and visibility check.
     */
    const customLayerNodeComponent = ({node, config}) => {
        const selectionData = selections[node.id] ?? {};
        return (
            <li className={`ms-node ms-node-layer`}>
                <InlineLoader loading={selectionData.loading}/>
                <NodeHeader
                    node={node}
                    currentLocale={config?.currentLocale}
                    showTitleTooltip={false}
                    showFullTitle
                    beforeTitle={
                        <>
                            <VisibilityCheck
                                hide={false}
                                mutuallyExclusive={false}
                                value={isSelectQueriable(node)}
                                onChange={checked => onUpdateNode(node.id, 'layers', { isSelectQueriable: checked })}
                            />
                            <Glyphicon className="ms-node-icon" glyph={getLayerTypeGlyph(node)} />
                        </>
                    }
                    afterTitle={
                        <>
                            {selectionData.error ? (
                                <NodeTool tooltip={selectionData.error.toString()} glyph="exclamation-mark"/>
                            ) : (
                                <div className="features-count-displayer">
                                    {selectionData.features && selectionData.features.length === maxFeatureCount && <NodeTool tooltip={<Message msgId="layersSelection.hasReachMaxCount"/>} /* tooltip={"ouech"} */  glyph="exclamation-mark"/>}
                                    <p>{selectionData.loading ? '⊙' : (selectionData.features?.length ?? 0)}</p>
                                </div>
                            )}

                            {selectionData.features?.length > 0 && <EllipsisButton
                                node={node}
                                layers={layers}
                                selectionData={selections[node.id]}
                                onAddOrUpdateSelection={addOrUpdateSelection}
                                onZoomToExtent={zoomToExtent}
                                onAddLayer={addLayer}
                                onChangeLayerProperties={changeLayerProperties}
                            />}
                        </>
                    }
                />
            </li>
        );
    };

    useEffect(() => storeConfiguration({ highlightOptions, queryOptions }), []);

    const [selectedTool, setSelectedTool] = useState(null);

    const selectionOptions = selectTools
        .filter(tool => SelectionToolsTypes[tool])
        .map(tool => {
            const option = SelectionToolsTypes[tool];
            return { ...option, label: <><Glyphicon glyph={option.icon} />{' '}<Message msgId={option.labelId} /></> };
        });

    return (
        <ResizableModal
            onClose = {onClose}
            enableFooter={false}
            title={<>
                <Glyphicon glyph="hand-down"/>{' '}
                <Message msgId="layersSelection.title"/>
            </>}
            dialogClassName=" select-dialog"
            show={isVisible}
            draggable
            style={{zIndex: 1993}}>
            <FlexBox className="_padding-md" gap="sm" column>
                <ControlLabel><Message msgId="layersSelection.button.select"/></ControlLabel>
                <FlexBox gap="sm">
                    <FlexBox.Fill>
                        <Select
                            value={selectedTool}
                            clearable={false}
                            options={selectionOptions}
                            onChange={option => {
                                setSelectedTool(option);
                                cleanSelection(option?.value ?? null);
                            }}
                        />
                    </FlexBox.Fill>
                    <Button
                        disabled={!selectedTool}
                        onClick={() => {
                            setSelectedTool(null);
                            cleanSelection(null);
                        }}
                    >
                        <Message msgId="layersSelection.button.clear"/>
                    </Button>
                </FlexBox>
            </FlexBox>
            <ControlledTOC
                tree={filterLayers.map(layer => Object.fromEntries(Object.entries(applyVersionParamToLegend(layer)).filter(([key]) => key !== 'group'))).reverse()}
                className="select-content"
                theme="legend"
                layerNodeComponent={customLayerNodeComponent}
                treeHeader={
                    <li className={'ms-node ms-node-layer tree-header'}>
                        <NodeHeader
                            node={{ title: getMessageById(context.messages, 'layersSelection.allLayers') }}
                            beforeTitle={
                                <VisibilityCheck
                                    hide={false}
                                    mutuallyExclusive={false}
                                    value={filterLayers.every(isSelectQueriable)}
                                    onChange={checked => filterLayers.forEach(layer => onUpdateNode(layer.id, 'layers', { isSelectQueriable: checked }))}
                                />
                            }
                            afterTitle={<Message msgId="layersSelection.featuresCount" />}
                        />
                    </li>
                }
            />
        </ResizableModal>
    );
};

LayersSelection.contextTypes = {
    messages: PropTypes.object
};

export default LayersSelection;
