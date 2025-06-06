import React, { useEffect, createContext, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { Glyphicon } from 'react-bootstrap';

import { ControlledTOC } from '../../TOC/components/TOC';
import ResizableModal from '../../../components/misc/ResizableModal';
import Message from '../../../components/I18N/Message';
import VisibilityCheck from '../../TOC/components/VisibilityCheck';
import NodeHeader from '../../TOC/components/NodeHeader';
import { getLayerTypeGlyph } from '../../../utils/LayersUtils';
import NodeTool from '../../TOC/components/NodeTool';
import InlineLoader from '../../TOC/components/InlineLoader';

import SelectHeader from './LayersSelectionHeader/LayersSelectionHeader';
import EllipsisButton from './EllipsisButton/EllipsisButton';
import { isSelectQueriable, filterLayerForSelect } from '../selectors/layersSelection';
import '../assets/select.css';

export const SelectRefContext = createContext(null);

function applyVersionParamToLegend(layer) {
    // we need to pass a parameter that invalidate the cache for GetLegendGraphic
    // all layer inside the dataset viewer apply a new _v_ param each time we switch page
    return { ...layer, legendParams: { ...layer?.legendParams, _v_: layer?._v_ } };
}

export default injectIntl(({
    layers,
    onUpdateNode,
    onClose,
    isVisible,
    highlightOptions,
    queryOptions,
    selectTools,
    storeConfiguration,
    intl,
    selections,
    maxFeatureCount,
    cleanSelection,
    addOrUpdateSelection,
    zoomToExtent,
    addLayer,
    changeLayerProperties
}) => {
    const SelectRef = useRef(null);
    const filterLayers = layers.filter(filterLayerForSelect);
    const customLayerNodeComponent = ({node, config}) => {
        const selectionData = selections[node.id] ?? {};
        return (
            <li className={`ms-node ms-node-layer`}>
                <InlineLoader loading={selectionData.loading}/>
                <NodeHeader
                    node={node}
                    currentLocale={config?.currentLocale}
                    showTitleTooltip={false}
                    // eslint-disable-next-line react/jsx-boolean-value
                    showFullTitle={true}
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

    return (
        <SelectRefContext.Provider value={SelectRef}>
            <ResizableModal
                ref={SelectRef}
                onClose = {onClose}
                enableFooter={false}
                title={<span className="title-container">
                    <img className="title-icon" alt="icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAx3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVBbDsMgDPvnFDtCIAGS49C1k3aDHX+myaq2miXycmtM0vZ5v9JjomRJUrs2a40AMbEyUCg5xh4zyR69KcHl6zwdRMGIkdlbbcePPs+HgKeBqp6E9BnEciVMQl9vQnERT0fTxBpCFkJcnMghMPxZ1Ez7+QnLRleonzSDrfunlC3c3Hrp2N5acQ+XsnFmQmRWN8Dz1MQDhSBOGoa5oWbkAbqHEyzk355+SF8bPFmNwFcwVQAAAYRpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVfP6RSqg52UBHJUJ3soiKOpYpFsFDaCq06mFz6BU0akhQXR8G14ODHYtXBxVlXB1dBEPwAcRecFF2kxP8lhRYxHhz34929x907wNusMsXwxwBFNfV0Ii7k8qtC4BV+BNGPMQyLzNCSmcUsXMfXPTx8vYvyLPdzf44+uWAwwCMQx5imm8QbxLObpsZ5nzjMyqJMfE48qdMFiR+5Ljn8xrlks5dnhvVsep44TCyUuljqYlbWFeIZ4oisqJTvzTksc97irFTrrH1P/sJQQV3JcJ3mKBJYQhIpCJBQRwVVmIjSqpJiIE37cRf/iO1PkUsiVwWMHAuoQYFo+8H/4He3RnF6ykkKxYGeF8v6GAcCu0CrYVnfx5bVOgF8z8CV2vHXmsDcJ+mNjhY5Aga2gYvrjibtAZc7wNCTJuqiLfloeotF4P2MvikPDN4CwTWnt/Y+Th+ALHW1fAMcHAITJcped3l3b3dv/55p9/cDj5pyslRWqj0AAA12aVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczpHSU1QPSJodHRwOi8vd3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjRlZTJmMDYyLTc0ZjgtNDdlOC05YzRmLTFkYWM0YThhYTg2ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowOTBmMmVjNi1hMzcxLTQ1YjctOTI0MC0wMmI4Nzk5MTZkOTMiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkM2Y0Y2U4ZS04ZmY2LTQxOTUtYjllOS1hMzZiNGY2NWEwMjkiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTc0NDI5NTQ4NzE2MjU4OSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjM4IgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCIKICAgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNTowNDoxMFQxNjozMToyNyswMjowMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjU6MDQ6MTBUMTY6MzE6MjcrMDI6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplNDdiZjdkZC00NTMzLTQ1MWItOWFiOC0xNDUxYTk3YmVlMjAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjUtMDQtMTBUMTY6MzE6MjciLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+XeQ7+AAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAASdAAAEnQB3mYfeAAAAAd0SU1FB+kECg4fGyoDTDYAAACGSURBVDjL7ZTBCcNQDEOVTuARPIo38yjfm2kU5dD8JLQ5/CQUSqnABxv8MAIZVSUzEzZpqaHe3VVVgrufWjzqXw75Ek27M6eLDAHAAz+rv0ef8egtDpl5mJ0R0FqZeTlnK8TMRPIeaEm83P0J64MzbyMzRVL9BUWE0FrrgyHQ3hOSigiR1AwufF67ifcbTQAAAABJRU5ErkJggg=="/>
                    <span className="title-title">
                        <Message msgId="layersSelection.title"/>
                    </span>
                </span>}
                dialogClassName=" select-dialog"
                show={isVisible}
                // eslint-disable-next-line react/jsx-boolean-value
                draggable={true}
                style={{zIndex: 1993}}>
                <SelectHeader
                    selectTools={selectTools}
                    onCleanSelect={cleanSelection}
                />
                <ControlledTOC
                    tree={filterLayers.map(layer => Object.fromEntries(Object.entries(applyVersionParamToLegend(layer)).filter(([key]) => key !== 'group'))).reverse()}
                    className="select-content"
                    theme="legend"
                    layerNodeComponent={customLayerNodeComponent}
                    treeHeader={
                        <li className={'ms-node ms-node-layer tree-header'}>
                            <NodeHeader
                                node={{ title: intl.formatMessage({ id: 'select.allLayers' }) }}
                                beforeTitle={
                                    <VisibilityCheck
                                        hide={false}
                                        mutuallyExclusive={false}
                                        value={filterLayers.every(isSelectQueriable)}
                                        onChange={checked => filterLayers.forEach(layer => onUpdateNode(layer.id, 'layers', { isSelectQueriable: checked }))}
                                    />
                                }
                                afterTitle={<Message msgId="layersSelection.featuresCount" className={'features-count'}/>}
                            />
                        </li>
                    }
                />
            </ResizableModal>
        </SelectRefContext.Provider>
    );
});
