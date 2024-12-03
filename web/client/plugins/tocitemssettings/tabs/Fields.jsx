
import React from 'react';
import { changeLayerProperties } from '../../../actions/layers';
import LayerFields, {hasFields} from '../../../components/TOC/fragments/LayerFields';
import {connect} from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { currentLocaleSelector } from '../../../selectors/locale';
import { userSelector } from '../../../selectors/security';
import { find, get } from 'lodash';

export {hasFields};


export default connect(createStructuredSelector({
    currentLocale: currentLocaleSelector,
    userInfos: userSelector
}), {
    updateLayerProperties: changeLayerProperties
}
)(({element = {}, updateLayerProperties = () => {}, userInfos, ...props}) => {
    const layer = element;
    const updateFields = (fields) => {
        // insert fields value from selected user prop source
        fields?.forEach?.((field) => {
            if (field.source) {
                field.value = get(userInfos, field.source) || find(userInfos.attribute, ["name", field.source])?.value;
                field.editable = false;
            } else if (!field.source && field.value) {
                field.value = null;
                field.editable = null;
            }
        });
        // update state
        updateLayerProperties(layer.id, {fields});
    };
    return <LayerFields {...props} layer={layer} updateFields={updateFields}/>;
});
