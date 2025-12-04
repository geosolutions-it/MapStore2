/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Button from '../../../components/layout/Button';
import Message from '../../../components/I18N/Message';
import FlexBox from '../../../components/layout/FlexBox';

/**
 * Isochrone action
 * @param {object} props - The props of the component
 * @param {function} props.onHandleReset - The function to handle the reset operation
 * @param {function} props.onHandleRun - The function to handle the isochrone run operation
 * @param {boolean} props.disabled - The disabled state of the run button
 */
const IsochroneAction = ({ onHandleReset, onHandleRun, disabled }) => {
    return (
        <FlexBox className="ms-isochrone-action" gap="sm" centerChildrenVertically>
            <Button onClick={onHandleReset}>
                <Message msgId="isochrone.reset" />
            </Button>
            <Button disabled={disabled} variant="primary" onClick={onHandleRun}>
                <Message msgId="isochrone.run" />
            </Button>
        </FlexBox>
    );
};

IsochroneAction.defaultProps = {
    onHandleReset: () => {},
    onHandleRun: () => {},
    disabled: false
};

export default IsochroneAction;
