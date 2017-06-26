/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

class Fork extends React.Component {
    render() {
        return (
            <a href="https://github.com/geosolutions-it/MapStore2">
                <img style={{position: "absolute", top: 0, right: 0, border: 0, zIndex: 100}} src="https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67" alt="Fork me on GitHub" dataCanonicalSrc="https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png"/>
            </a>
        );
    }
}

module.exports = Fork;
