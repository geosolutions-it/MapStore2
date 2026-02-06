/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { ButtonGroup } from 'react-bootstrap';

import ToolbarButton from './ToolbarButton';

/**
* A Generic Reusable Toolbar. Build in animations.
* @class Toolbar
* @memberof components.misc.toolbar
* @param  {object[]} [buttons=[]] Array of buttons. Button objects support the following properties:
*  - *visible*: true by default, set to `false` to make the button disappear
*  - *Element*: a component to render instead of the ToolbarButton, it can be a DropdownToolbarOptions
*  - All the react-bootstrap buttons properties.
*  - All the properties for @see components.misc.enhancers
*  - All properties for @see components.misc.toolbar.ToolbarButton and react-bootstrap button
* @param  {object} [btnDefaultProps] A series of default Props for buttons
* @param  {object} [btnGroupProps] Props to add to the react-bootstrap `ButtonGroup` component
*/
export default ({
    buttons = [],
    btnGroupProps = {},
    btnDefaultProps = {}
}) => {
    const renderButtons = () => buttons.map(
        ({ visible = true, Element, renderButton, ...props }, index) => visible
            ? (renderButton ? renderButton : (Element && <Element key={props.key || index} {...props} /> || <ToolbarButton key={props.key || index} {...btnDefaultProps} {...props} />))
            : null
    );
    return (<ButtonGroup {...btnGroupProps}>
        {renderButtons()}
    </ButtonGroup>);
};
