import React from 'react';
import PropTypes from 'prop-types';


class MockApp extends React.Component {

    static propTypes = {
        zoom: PropTypes.number
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="MockApp">
                <p>{this.props.zoom}</p>
            </div>
        );
    }
}

export default MockApp;