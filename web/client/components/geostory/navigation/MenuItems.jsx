/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Button} from 'react-bootstrap';


/**
 * One item component
 * selected prop will be passed
*/
const MenuItem = ({text, selected}) => {
    return <Button className={`menu-item ${selected ? 'active' : 'btn-tray'} btn-xs btn-default`} >{text}</Button>;
};

/**
 * All items component
 * Important! add unique key
*/
export default ({list, selected}) =>
    list.map(({title, id}) => {
        return (<MenuItem
            text={title || "title"}
            key={id}
            selected={selected}
        />);
    });
