/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../components/layout/FlexBox';
import { FlexFill } from '../../../components/layout/FlexBox';


const CatalogServiceBar = ({
    isPanel,
    ServiceSelectComponent,
    SearchInputComponent,
    serviceSelectProps,
    searchInputProps
}) => {
    if (isPanel) {
        return (
            <>
                <FlexBox classNames={['_padding-sm']} gap="sm" centerChildrenVertically>
                    <FlexFill>
                        <ServiceSelectComponent {...serviceSelectProps} />
                    </FlexFill>
                    <FlexFill>
                        <div />
                    </FlexFill>
                </FlexBox>

                <FlexBox classNames={['_padding-sm']}>
                    <SearchInputComponent {...searchInputProps} />
                </FlexBox>
            </>
        );
    }
    return null;
};

export default CatalogServiceBar;
