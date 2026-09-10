import {defaultProps} from 'recompose';

import FeatureInfoCmp from '../../../../components/TOC/fragments/settings/FeatureInfo';
import {getAvailableInfoFormat, getInfoViewModeTitleIds} from '../../../../utils/MapInfoUtils';

const titleIds = getInfoViewModeTitleIds();

const formatCards = {
    TEXT: {
        titleId: titleIds.TEXT,
        glyph: 'ext-txt'
    },
    HTML: {
        titleId: titleIds.HTML,
        glyph: 'ext-html'
    },
    PROPERTIES: {
        titleId: titleIds.PROPERTIES,
        glyph: 'ext-json'
    },
    TEMPLATE: {
        titleId: titleIds.TEMPLATE,
        glyph: 'ext-empty'
    },
    // Metadata shown for the External Data option in the view-type selector.
    EXTERNAL_DATA: {
        titleId: 'layerProperties.externalData.title',
        descId: 'layerProperties.externalData.description',
        glyph: 'ext-json'
    }
};
const FeatureInfo = defaultProps({
    formatCards,
    defaultInfoFormat: getAvailableInfoFormat()
})(FeatureInfoCmp);

export default FeatureInfo;
