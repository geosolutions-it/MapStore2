/*
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import { compose } from 'recompose';

import ContextGridComponent from '../contextmanager/ContextGrid';

import { userSelector } from '../../selectors/security';
import { deleteContext, reloadContexts} from '../../actions/contextmanager';
import { updateAttribute } from '../../actions/maps';


const Grid = compose(
    connect(createStructuredSelector({
        user: userSelector
    }), {
        onDelete: deleteContext,
        reloadContexts,
        onUpdateAttribute: updateAttribute
    })
)(ContextGridComponent);

export default Grid;
