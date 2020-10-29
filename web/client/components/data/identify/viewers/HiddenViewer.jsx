const React = require('react');
const {Alert } = require('react-bootstrap');
const HTML = require('../../../../components/I18N/HTML');

class HiddenViewer extends React.Component {


    render() {
        return (
            <Alert bsStyle={"danger"}>
                <h4><HTML msgId="noFeatureInfo"/></h4>
            </Alert>
        )
    }
}

module.exports = HiddenViewer;
