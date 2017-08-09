const Rx = require('rxjs');
const {get} = require('lodash');
const {parseString} = require('xml2js');
const {stripPrefix} = require('xml2js/lib/processors');
class OGCError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'OGCError';
        this.code = code;
    }
}
/**
 * Intercept OGC Exception (200 response with exceptionReport) to throw error in the stream
 * @param  {observable} observable The observable that emits the server response
 * @return {observable}            The observable that returns the response or throws the error.
 */
const interceptOGCError = (observable) => observable.switchMap(response => {
    if (typeof response.data === "string") {
        if (response.data.indexOf("ExceptionReport") > 0) {
            return Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
                 tagNameProcessors: [stripPrefix],
                 explicitArray: false,
                 mergeAttrs: true
            }, callback))(response.data).map(data => {
                const message = get(data, "ExceptionReport.Exception.ExceptionText");
                throw new OGCError(message || "Undefined OGC Service Error", get(data, "ExceptionReport.Exception.exceptionCode"));
            });

        }
    }
    return Rx.Observable.of(response);
});


module.exports = {
    interceptOGCError

};
