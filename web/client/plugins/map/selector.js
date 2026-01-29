import { mapSelector, projectionDefsSelector, isMouseMoveCoordinatesActiveSelector, mapNameSelector } from '../../selectors/map';
import { mapTypeSelector } from '../../selectors/maptype';
import { layerSelectorWithMarkers } from '../../selectors/layers';
import { highlighedFeatures, highlightStyleSelector } from '../../selectors/highlight';
import { securityTokenSelector } from '../../selectors/security';
import { currentLocaleLanguageSelector } from '../../selectors/locale';
import { isLocalizedLayerStylesEnabledSelector, localizedLayerStylesNameSelector } from '../../selectors/localizedLayerStyles';
import { createShallowSelectorCreator } from '../../utils/ReselectUtils';
import isEqual from 'lodash/isEqual';

/**
 * Map state to props selector for Map plugin
 */

export default createShallowSelectorCreator(isEqual)(
    projectionDefsSelector,
    mapSelector,
    mapTypeSelector,
    layerSelectorWithMarkers,
    highlighedFeatures,
    highlightStyleSelector,
    state => state.mapInitialConfig && state.mapInitialConfig.loadingError && state.mapInitialConfig.loadingError.data,
    securityTokenSelector,
    isMouseMoveCoordinatesActiveSelector,
    isLocalizedLayerStylesEnabledSelector,
    localizedLayerStylesNameSelector,
    currentLocaleLanguageSelector,
    mapNameSelector,
    (projectionDefs, map, mapType, layers, features, highlightStyle, loadingError, securityToken, elevationEnabled, isLocalizedLayerStylesEnabled, localizedLayerStylesName, currentLocaleLanguage, mapTitle) => ({
        projectionDefs,
        map,
        mapType,
        layers,
        features,
        highlightStyle,
        loadingError,
        securityToken,
        elevationEnabled,
        isLocalizedLayerStylesEnabled,
        localizedLayerStylesName,
        currentLocaleLanguage,
        mapTitle
    })
);
