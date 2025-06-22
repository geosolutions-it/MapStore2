import { isNil } from 'lodash';
import { getConfigProp } from '../ConfigUtils';
import { loadFontAwesome } from '../FontUtils';
import {
    geoStylerStyleFilter,
    parseSymbolizerExpressions,
    getImageFromSymbolizer,
    getWellKnownNameImageFromSymbolizer
} from './StyleParserUtils';


/**
 * prefetch all image or mark symbol in a geostyler style
 * @param {object} geoStylerStyle geostyler style
 * @returns {promise} all the prefetched images
 */
export const drawIcons = (geoStylerStyle, options) => {
    const { rules = [] } = geoStylerStyle || {};
    const symbolizers = rules.reduce((acc, rule) => {
        const markIconSymbolizers = (rule?.symbolizers || []).filter(({ kind }) => ['Mark', 'Icon'].includes(kind));
        const symbolizerHasExpression = markIconSymbolizers
            .some(properties => Object.keys(properties).some(key => !!properties[key]?.name));
        if (!symbolizerHasExpression) {
            return [
                ...acc,
                ...markIconSymbolizers
            ];
        }
        const features = options.features || [];
        const supportedFeatures = rule.filter === undefined
            ? features
            : features.filter((feature) => geoStylerStyleFilter(feature, rule.filter));
        return [
            ...acc,
            ...markIconSymbolizers.reduce((newSymbolizers, symbolizer) => {
                return [
                    ...newSymbolizers,
                    ...(supportedFeatures || []).map((feature) => {
                        const newSymbolizer = parseSymbolizerExpressions(symbolizer, feature);
                        return {
                            ...newSymbolizer,
                            // exclude msMarkerIcon from parsing
                            // the getImageFromSymbolizer is already taking into account this case
                            ...(symbolizer?.image?.name === 'msMarkerIcon' && { image: symbolizer.image })
                        };
                    })
                ];
            }, [])
        ];
    }, []);
    const marks = symbolizers.filter(({ kind }) => kind === 'Mark');
    const icons = symbolizers.filter(({ kind }) => kind === 'Icon');
    const loadFontAwesomeForIcons = getConfigProp("loadFontAwesomeForIcons");
    // if undefined or true it will load it to preserve previous behaviour
    const loadingPromise =  (isNil(loadFontAwesomeForIcons) || loadFontAwesomeForIcons) && icons?.length ? loadFontAwesome() : Promise.resolve();
    return loadingPromise
        .then(
            () => new Promise((resolve) => {
                if (marks.length > 0 || icons.length > 0) {
                    Promise.all([
                        ...marks.map(getWellKnownNameImageFromSymbolizer),
                        ...icons.map(getImageFromSymbolizer)
                    ]).then((images) => {
                        resolve(images);
                    });
                } else {
                    resolve([]);
                }
            })
        );
};
