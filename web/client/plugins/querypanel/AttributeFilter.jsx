/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {connect} from "react-redux";

import {bindActionCreators} from "redux";
import {
    addFilterField,
    addGroupField,
    changeCascadingValue,
    expandAttributeFilterPanel,
    removeFilterField,
    removeGroupField,
    toggleMenu,
    updateExceptionField,
    updateFilterField,
    updateLogicCombo
} from "../../actions/queryform";
import {toggleControl} from "../../actions/controls";
import GroupField from "../../components/data/query/GroupField";

const AttributeFilter = connect((state) => {
    return {
        // QueryBuilder props
        groupLevels: state.queryform.groupLevels,
        groupFields: state.queryform.groupFields,
        filterFields: state.queryform.filterFields,
        attributes: state.query && state.query.typeName && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].attributes,
        attributePanelExpanded: state.queryform.attributePanelExpanded,
        autocompleteEnabled: state.queryform.autocompleteEnabled,
        maxFeaturesWPS: state.queryform.maxFeaturesWPS
    };
}, dispatch => {
    return {
        actions: bindActionCreators({
            onAddGroupField: addGroupField,
            onAddFilterField: addFilterField,
            onRemoveFilterField: removeFilterField,
            onUpdateFilterField: updateFilterField,
            onUpdateExceptionField: updateExceptionField,
            onUpdateLogicCombo: updateLogicCombo,
            onRemoveGroupField: removeGroupField,
            onChangeCascadingValue: changeCascadingValue,
            toggleMenu: toggleMenu,
            onExpandAttributeFilterPanel: expandAttributeFilterPanel
        }, dispatch),
        controlActions: bindActionCreators({onToggleQuery: toggleControl.bind(null, 'queryPanel', null)}, dispatch)
    };
})(GroupField);

export default AttributeFilter;
