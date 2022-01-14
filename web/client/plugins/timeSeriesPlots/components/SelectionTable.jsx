/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDataGrid from 'react-data-grid';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import localizedProps from '@mapstore/components/misc/enhancers/localizedProps';


class SelectionTable extends React.Component {

    COLUMNS = [{
        key: 'selectionId',
        sortable: true,
        width: 80,
        name: 'timeSeriesPlots.selectionTable.columns.selectionId',
        resizable: true
    }, {
        key: 'selectionType',
        sortable: true,
        width: 80,
        name: 'timeSeriesPlots.selectionTable.columns.selectionType',
        resizable: true
    }];
    
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                <ReactDataGrid 
                    ref={node => {this.grid = node; }} 
                    headerRowHeight={100} 
                    columns={this.COLUMNS}/>
            </div>
        );
    }
}

export default localizedProps('columns', 'name')(SelectionTable);