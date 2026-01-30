/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../components/layout/FlexBox';
import {FlexFill} from '../../../components/layout/FlexBox';
import Loader from '../../../components/misc/Loader';

/**
 * CatalogLayerList - Scrollable container for layer cards with loading overlay
 */
const CatalogLayerList = ({
    records = [],
    isPanel,
    wrapCards,
    renderCard,
    selectedLayers = [],
    onToggleLayer
}) => {
    const isPanelLayout = isPanel && !wrapCards;
    return (
        <FlexFill flexBox className="_relative" centerChildrenHorizontally>
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                overflow: 'auto'
            }}>
                <FlexBox 
                    column={isPanelLayout} 
                    classNames={['_padding-sm']} 
                    gap="sm" 
                    wrap={!!wrapCards} 
                    centerChildrenHorizontally={!!wrapCards}
                >
                    {records.map((record, idx) => {
                        const isChecked = selectedLayers.some(
                            layer => layer.identifier === record.identifier
                        );
                        return renderCard({
                            key: idx,
                            idx,
                            record,
                            isChecked,
                            onToggle: onToggleLayer,
                            isPanel: isPanelLayout
                        });
                    })}
                </FlexBox>
            </div>
        </FlexFill>
    );
};

export default CatalogLayerList;
