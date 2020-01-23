/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button as ButtonRB, Glyphicon } from 'react-bootstrap';
import tooltip from '../misc/enhancers/tooltip';

const Button = tooltip(ButtonRB);

function Tab({
    id,
    active,
    icon,
    glyph,
    msStyle,
    btnProps,
    mirror,
    onClick,
    alertIcon,
    iconComponent
}) {
    const AlertIcon = alertIcon;
    const IconComponent = iconComponent;
    return (
        <div
            id={`ms-menu-tab-${(id || '').toLowerCase()}`}
            className="ms-menu-tab">
            {mirror && <div className="ms-tab-arrow">
                {active && <div className="ms-arrow-mirror"/>}
            </div>}
            <Button
                {...btnProps}
                active={active}
                bsStyle={msStyle}
                className="square-button-md ms-menu-btn"
                onClick={() => onClick(id)}>
                {glyph
                    ? <Glyphicon glyph={glyph}/>
                    : IconComponent && <IconComponent {...icon}/> || null}
                {AlertIcon && <AlertIcon />}
            </Button>
            {!mirror && <div className="ms-tab-arrow">
                {active && <div className="ms-arrow"/>}
            </div>}
        </div>
    );
}

Tab.propTypes = {
    id: PropTypes.string,
    active: PropTypes.bool,
    icon: PropTypes.object,
    glyph: PropTypes.string,
    msStyle: PropTypes.string,
    btnProps: PropTypes.object,
    mirror: PropTypes.bool,
    onClick: PropTypes.func,
    alertIcon: PropTypes.func,
    iconComponent: PropTypes.func
};

Tab.defaultProps = {
    btnProps: {},
    onClick: () => {}
};

export default Tab;
