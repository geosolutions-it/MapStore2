/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {forwardRef, useEffect, useState} from 'react';
import {Button, Dropdown} from 'react-bootstrap';
import ContainerDimensions from 'react-container-dimensions';


import './TSplitButton.less';
import classnames from "classnames";

export const SimpleTButton = forwardRef(({ disabled, id, visible, onClick, active, buttonClassName = "square-button-md",
    menuStyle = {}, className, children, onMount = () => {}, ...props }, ref) => {
    const [isShown, setIsShown] = useState(false);
    useEffect(() => {
        typeof onMount === 'function' && onMount();
    }, []);

    const onSelectHandler = (e) => {
        if  (["number", "text"].includes(e.target.type)) {
            setIsShown(true);
        } else {
            setIsShown(!isShown);
        }
    };
    const onToggleHandler = (isOpen, e) => {
        if (e) {
            setIsShown(isOpen);
        }
    };

    if (!visible) return false;
    return (
        <ContainerDimensions>
            <Dropdown className={classnames({
                "split-button": true,
                ...(className ? {[className]: true} : {})
            })}
            open={isShown}
            onToggle={onToggleHandler}
            >
                <Button ref={ref} id={id} onClick={() => !disabled && onClick()} className={buttonClassName} bsStyle={active ? "success" : "primary"} {...props}>{props.title}</Button>
                <Dropdown.Toggle bsStyle={active ? "success" : "primary"} />
                <Dropdown.Menu style={menuStyle} onSelect={onSelectHandler}>
                    {children}
                </Dropdown.Menu>
            </Dropdown>
        </ContainerDimensions>

    );
});


export default SimpleTButton;
