/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {transaction} from './transaction';
import {insert} from './insert';
import {update, property} from './update';
import {deleteFeature, deleteFeaturesByFilter, deleteById} from './delete';
export {
    insert,
    update,
    property,
    deleteFeature,
    deleteFeaturesByFilter,
    deleteById,
    transaction
};
