window["Other"] = {
    init: function () {},
    get: function() {
        return Promise.resolve(function() {
            return {};
        })
    }
}
