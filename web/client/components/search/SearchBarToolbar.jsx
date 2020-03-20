/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import assign from 'object-assign';
import Spinner from 'react-spinkit';

import Toolbar from '../misc/toolbar/Toolbar';

const getSpinnerStyle = (splitTools) => {
    const nonSplittedStyle = {
        right: "69px",
        zIndex: 1,
        top: "13px"
    };
    const splittedStyle = {
        right: "69px",
        zIndex: 1,
        top: "13px"
    };
    return assign({}, {position: "absolute"}, splitTools ? {...splittedStyle} : {...nonSplittedStyle});
};

export default ({
    loading,
    splitTools,
    toolbarProps = {},
    toolbarButtons = [],
    children
}) => <span className="search-toolbar-options">
    {loading && <Spinner style={getSpinnerStyle(splitTools)} spinnerName="pulse" noFadeIn/>}
    <Toolbar
        btnGroupProps = {{ className: 'btn-group-menu-options'}}
        transitionProps = {null}
        btnDefaultProps = {{ className: 'square-button-md', bsStyle: 'primary' }}
        {...toolbarProps}
        buttons={toolbarButtons}/>
    {children}
</span>;
