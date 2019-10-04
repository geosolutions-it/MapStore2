const {getWPSURL} = require('./common');
const {Observable} = require('rxjs');
var axios = require('../../libs/ajax');
const {interceptOGCError} = require('../../utils/ObservableUtils');

module.exports = {
    describeProcess: (url, identifier) =>
        Observable.defer( () => axios.get(getWPSURL(url, {
            "version": "1.0.0",
            "REQUEST": "DescribeProcess",
            "IDENTIFIER": identifier }), {
            timeout: 5000,
            headers: {'Accept': 'application/json', 'Content-Type': 'application/xml'}
        })).let(interceptOGCError)

};
