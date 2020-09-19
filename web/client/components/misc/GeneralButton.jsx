/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
const {Button} = require('react-bootstrap');

const GeneralButton = props => {
    const { id, onClick, className, children } = props;
    return (
        <Button id={id} className={className} onClick={onClick}>
            {children}
        </Button>
    );
};

export default GeneralButton;
