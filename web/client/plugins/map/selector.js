import { createStructuredSelector } from 'reselect';

import { mapSelector, projectionDefsSelector, isMouseMoveCoordinatesActiveSelector } from '../../selectors/map';
import { mapTypeSelector, isOpenlayers } from '../../selectors/maptype';
import { layerSelectorWithMarkers } from '../../selectors/layers';
import { highlighedFeatures } from '../../selectors/highlight';
import { securityTokenSelector } from '../../selectors/security';
import { currentLocaleLanguageSelector } from '../../selectors/locale';
import { isLocalizedLayerStylesEnabledSelector, localizedLayerStylesNameSelector } from '../../selectors/localizedLayerStyles';

/**
 * Map state to props selector for Map plugin
 */
export default createStructuredSelector({
    projectionDefs: projectionDefsSelector,
    map: mapSelector,
    mapType: mapTypeSelector,
    layers: layerSelectorWithMarkers,
    features: highlighedFeatures,
    loadingError: state => state.mapInitialConfig && state.mapInitialConfig.loadingError && state.mapInitialConfig.loadingError.data,
    securityToken: securityTokenSelector,
    elevationEnabled: isMouseMoveCoordinatesActiveSelector,
    shouldLoadFont: isOpenlayers,
    isLocalizedLayerStylesEnabled: isLocalizedLayerStylesEnabledSelector,
    localizedLayerStylesName: localizedLayerStylesNameSelector,
    currentLocaleLanguage: currentLocaleLanguageSelector
});
