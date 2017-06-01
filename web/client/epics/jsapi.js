const Rx = require('rxjs');

module.exports = {
    generateActionTrigger: (startAction) => {
        var eventStream = new Rx.Subject();
        let init = false;
        const buffer = [];
        eventStream.publish();
        return {
            trigger: (action) => init ? eventStream.next(action) : buffer.push(action),
            stop: () => eventStream.complete(),
            epic: (action$) =>
                action$.ofType(startAction).take(1).switchMap(() => {
                    init = true;
                    return Rx.Observable.from(buffer).concat(eventStream);
                })
        };
    }
};
