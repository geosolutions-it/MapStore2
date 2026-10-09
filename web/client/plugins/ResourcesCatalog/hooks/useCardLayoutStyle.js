/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useLocalStorage from '../../../hooks/useLocalStorage';
import { DEFAULT_CARD_LAYOUT_STYLE } from '../constants';
export const STORAGE_FRAGMENT = 'layoutCardsStyle';
/**
 * manage the card layout using localStorage
 * @param {string} props.cardLayoutStyle one of `grid`, `list` or `table`, if not `undefined` it forces the type of cards style
 * @param {string[]} props.cardLayoutStyles array of supported card layout styles
 * @param {string} props.defaultCardLayoutStyle initial value, one of `grid`, `list` or `table`
 * @return {object} { cardLayoutStyle, setCardLayoutStyle, hideCardLayoutButton }
 */
const useCardLayoutStyle = ({
    cardLayoutStyle,
    cardLayoutStyles,
    defaultCardLayoutStyle = DEFAULT_CARD_LAYOUT_STYLE
} = {}) => {
    const [cardLayoutStyleState, setCardLayoutStyle] = useLocalStorage(STORAGE_FRAGMENT, defaultCardLayoutStyle);
    const isValidStyle = (style) => !cardLayoutStyles?.length || cardLayoutStyles.includes(style);
    const fallbackStyle = isValidStyle(defaultCardLayoutStyle) ? defaultCardLayoutStyle : (cardLayoutStyles?.[0] || DEFAULT_CARD_LAYOUT_STYLE);
    const currentStyle = cardLayoutStyle || (isValidStyle(cardLayoutStyleState) ? cardLayoutStyleState : fallbackStyle);
    const hideCardLayoutButton = !!cardLayoutStyle || (Array.isArray(cardLayoutStyles) && cardLayoutStyles.length <= 1);
    return {
        cardLayoutStyle: currentStyle,
        setCardLayoutStyle,
        hideCardLayoutButton
    };
};

export default useCardLayoutStyle;
