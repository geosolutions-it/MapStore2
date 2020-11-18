/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DateFormatComp from './Date';
import HTMLComp from './HTML';
import MessageComp from './Message';

export const Message = MessageComp;
export const HTML = HTMLComp;
export const DateFormat = DateFormatComp;

export default {
    Message: MessageComp,
    HTML,
    DateFormat
};

