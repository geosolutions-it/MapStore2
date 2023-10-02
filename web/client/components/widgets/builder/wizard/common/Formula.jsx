/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';

import FormulaInput from './FormulaInput';


const Formula = ({
    data,
    onChange = () => {}
}) => {
    return (
        <Col sm={12}>
            <FormulaInput disabled={data.yAxis === false} value={data.formula} type="text" onChange={e => onChange("formula", e.target.value)} />
        </Col>
    );
};

Formula.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func
};

export default Formula;
