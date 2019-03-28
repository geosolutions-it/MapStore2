 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const{ isString, isNumber, truncate, round} = require('lodash');
const { Text} = require('recharts');

const shorten = (num)=> {
    let unit;
    let number = round(num);
    let add = number.toString().length % 3;

    if (number >= 10000) {

        let trimmedDigits = number.toString().length - ( add === 0 ? add + 3 : add );
        let zeroNumber = (trimmedDigits) / 3;
        let trimmedNumber = number / Math.pow(10, trimmedDigits);

        switch (zeroNumber) {
            case 1 :
                unit = ' K';
                break;
            case 2 :
                unit = ' M';
                break;
            case 3 :
                unit = ' B';
                break;
            case 4 :
                unit = ' T';
                break;
            default:
                unit = '';
        }

        number = round(trimmedNumber) + unit;

    }else {

        number = round(num, Math.abs(4 - number.toString().length));
    }

    return number;
};

const customize = (label)=> {
    try {
        if (isString(label)) {
            return truncate(label, {'length': 7});
        }
        if (isNumber(label)) {
            return label.toString().length < 7 || !isFinite(label) ?
            label : shorten(label);
        }

    } catch (e) {
        return label;
    }


};

const TrimmedTick = ({x, y, height, width, payload}) => (
    <Text style={{fill: '#666'}} x={height === 60 ? x : x - width / 3} y={height === 60 ? y + height / 2 : y} textAnchor="middle" >
    {customize(payload.value)}
    </Text> );

module.exports = {TrimmedTick};
