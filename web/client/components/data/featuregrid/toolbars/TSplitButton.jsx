/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect} from 'react';
import {Button, Dropdown} from 'react-bootstrap';
import ContainerDimensions from 'react-container-dimensions';


import './TSplitButton.less';
import classnames from "classnames";

export const SimpleTButton = ({ disabled, id, visible, onClick, active, buttonClassName = "square-button-md", menuStyle = {}, className, children, onMount, ...props }) => {
    useEffect(() => {
        typeof onMount === 'function' && onMount();
    }, []);

    if (!visible) return false;
    return (
        <ContainerDimensions>
            <Dropdown className={classnames({
                "split-button": true,
                ...(className ? {[className]: true} : {})
            })}>
                <Button id={id} onClick={() => !disabled && onClick()} className={buttonClassName} bsStyle={active ? "success" : "primary"}>{props.title}</Button>
                <Dropdown.Toggle bsStyle={active ? "success" : "primary"} />
                <Dropdown.Menu style={menuStyle}>
                    {children}
                </Dropdown.Menu>
            </Dropdown>
        </ContainerDimensions>

    );
};


export default SimpleTButton;
