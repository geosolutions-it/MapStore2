/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { FormControl as FormControlRB } from 'react-bootstrap';
import withDebounceOnCallback from '../../../components/misc/enhancers/withDebounceOnCallback';
import localizedProps from '../../../components/misc/enhancers/localizedProps';
const FormControl = localizedProps('placeholder')(FormControlRB);

function InputControl({ onChange, value, ...props }) {
    return <FormControl {...props} value={value} onChange={event => onChange(event.target.value)}/>;
}

const InputControlWithDebounce = withDebounceOnCallback('onChange', 'value')(InputControl);

export default InputControlWithDebounce;
