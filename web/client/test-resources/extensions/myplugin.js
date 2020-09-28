(window.webpackJsonp = window.webpackJsonp || []).push([
    ["myplugin"], {
        "./web/client/examples/lazyplugins/plugins/Extension.jsx": function(e, n, t) {
            "use strict";
            t.r(n);

            function o(e) {
                var n = e.value,
                    t = void 0 === n ? 0 : n,
                    o = e.onIncrease;
                return u.a.createElement("div", {
                    style: {
                        top: "600px",
                        zIndex: 1e3
                    }
                }, u.a.createElement("span", null, u.a.createElement(c.a, {
                    msgId: "myplugin.message"
                }), t), u.a.createElement("button", {
                    onClick: o
                }, "+"))
            }
            var r = t("./node_modules/react-redux/es/index.js"),
                i = t("./node_modules/react/index.js"),
                u = t.n(i),
                s = t("./MapStore2/web/client/components/I18N/Message.jsx"),
                c = t.n(s),
                a = t("./node_modules/rxjs/Rx.js"),
                l = t.n(a);
            n.default = {
                name: "My",
                component: Object(r.connect)(function(e) {
                    return {
                        value: e.extension && e.extension.value
                    }
                }, {
                    onIncrease: function() {
                        return {
                            type: "INCREASE_COUNTER"
                        }
                    }
                })(o),
                reducers: {
                    extension: function(e, n) {
                        var t = 0 < arguments.length && void 0 !== e ? e : {
                            value: 1
                        };
                        return "INCREASE_COUNTER" === (1 < arguments.length ? n : void 0).type ? {
                            value: t.value + 1
                        } : t
                    }
                },
                epics: {
                    logCounterValue: function(e, n) {
                        return e.ofType("INCREASE_COUNTER").switchMap(function() {
                            return console.log("CURRENT VALUE: " + n.getState().extension.value), l.a.Observable.empty()
                        })
                    }
                },
                containers: {
                    Toolbar: {
                        name: "Dummy",
                        position: 10,
                        tooltip: "",
                        help: "",
                        tool: !0,
                        priority: 1
                    }
                }
            }
        }
    }
]);