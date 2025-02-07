/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useLocalStorage from './useLocalStorage';

const useCardLayoutStyle = ({
    cardLayoutStyle,
    defaultCardLayoutStyle
} = {}) => {
    const [_cardLayoutStyleState, setCardLayoutStyle] = useLocalStorage('layoutCardsStyle', defaultCardLayoutStyle);
    const cardLayoutStyleState = cardLayoutStyle || _cardLayoutStyleState; // Force style when `cardLayoutStyle` is configured
    const hideCardLayoutButton = !!cardLayoutStyle;
    return {
        cardLayoutStyle: cardLayoutStyleState,
        setCardLayoutStyle,
        hideCardLayoutButton
    };
};

export default useCardLayoutStyle;
