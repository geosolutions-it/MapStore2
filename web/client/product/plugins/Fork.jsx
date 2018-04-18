/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const assign = require('object-assign');
const github = require('../assets/img/GitHub-Mark-32px.png');
const Message = require('../../components/I18N/Message');

class Fork extends React.Component {
    render() {
        return (
            <a href="https://github.com/geosolutions-it/MapStore2">
                <img className="ms-fork-button" style={{position: "absolute", top: 52, left: 0, border: 0, zIndex: 100}} src="https://camo.githubusercontent.com/121cd7cbdc3e4855075ea8b558508b91ac463ac2/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677265656e5f3030373230302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_green_007200.png"/>
            </a>
        );
    }
}

module.exports = {
    ForkPlugin: assign(Fork, {
        Attribution: {
            position: 100,
            label: <Message msgId="home.forkMeOnGitHub"/>,
            href: 'https://github.com/geosolutions-it/MapStore2',
            img: <img height={20} alt="GitHub" src={github}/>
        }
    })
};
