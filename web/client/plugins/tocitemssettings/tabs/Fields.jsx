
import React from 'react';
import { changeLayerProperties } from '../../../actions/layers';
import LayerFields, {hasFields} from '../../../components/TOC/fragments/LayerFields';
import {connect} from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { currentLocaleSelector } from '../../../selectors/locale';

export {hasFields};


export default connect(createStructuredSelector({
    currentLocale: currentLocaleSelector
}), {
    updateLayerProperties: changeLayerProperties
}
)(({element = {}, updateLayerProperties = () => {}, ...props}) => {
    const layer = element;
    const updateFields = (fields) => {
        updateLayerProperties(layer.id, {fields});
    };
    return <LayerFields {...props} layer={layer} updateFields={updateFields}/>;
});
