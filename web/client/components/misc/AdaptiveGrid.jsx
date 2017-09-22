/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Grid = require('../data/grid/DataGrid');
const ContainerDimensions = require('react-container-dimensions').default;

/**
 * A react-data-grid that adapts to container
 * @class
 * @memberof components.misc
 * @param  {props} props The props to pass to the ResizableGrid
 * @return {[type]}       [description]
 */
module.exports = (props) => (<ContainerDimensions>
            { ({ width, height }) =>
            <div className={props.className}>
                <Grid
                    {...props}
                    minHeight={height}
                    minWidth={width}
                    />
            </div>
            }
        </ContainerDimensions>);
