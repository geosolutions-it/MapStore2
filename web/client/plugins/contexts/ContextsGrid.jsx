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
import {deleteContext, editContext, reloadContexts} from '../../actions/contextmanager';
import {invalidateFeaturedMaps, updateAttribute} from '../../actions/maps';
import {success} from "../../actions/notifications";


const Grid = compose(
    connect(createStructuredSelector({
        user: userSelector
    }), {
        onEditData: editContext,
        onDelete: deleteContext,
        onUpdateAttribute: updateAttribute,
        reloadContexts,
        invalidateFeaturedMaps,
        onShowSuccessNotification: () => success({ title: "success", message: "resources.successSaved" })
    })
)(ContextGridComponent);

export default Grid;
