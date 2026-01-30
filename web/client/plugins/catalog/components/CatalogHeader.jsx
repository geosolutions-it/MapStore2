/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
import FlexBox from '../../../components/layout/FlexBox';
import {FlexFill} from '../../../components/layout/FlexBox';
import Message from '../../../components/I18N/Message';

const CatalogTitle = () => (
    <h4 style={{ margin: 0 }}>
        <Message msgId="catalog.title" />
    </h4>
);

const CatalogHeader = ({
    mode,
    isPanel,
    onBackClick,
    onClose,
    showClose = true,
    children
}) => {
    return (
        <FlexBox 
            gap="sm" 
            centerChildrenVertically 
            classNames={['_padding-sm']} 
            className="ms-layer-catalog-head"
        >
            {mode === 'edit' && (
                <Button
                    variant="primary"
                    onClick={onBackClick}
                    title="Back to Catalog"
                >
                    <Glyphicon glyph="arrow-left" />
                </Button>
            )}
            
            <FlexFill>
                <CatalogTitle />
            </FlexFill>

            {children}

            {mode !== 'edit' && onClose && showClose && (
                <Button
                    variant="primary"
                    onClick={onClose}
                    title="Close Catalog"
                >
                    <Glyphicon glyph="1-close" />
                </Button>
            )}
        </FlexBox>
    );
};

export default CatalogHeader;
