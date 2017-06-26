/* eslint-disable */
if(!navigator.appName || navigator.appName.indexOf('Internet Explorer') === -1) {
var CesiumNavigation = (function() {
function getBaseTerriaNavigationUrl() {
    for (var e = (window.location.href,
    document.getElementsByTagName("script")), t = 0, n = e.length; n > t; ++t) {
        var r = e[t].getAttribute("src");
        if (r && r.toLowerCase().indexOf("cesium-navigation") > 0) {
            var i = startupScriptRegex.exec(r);
            if (null  !== i)
                return i[1]
        }
    }
}
function navigationInitialization(e, t) {
    require(["Navigation"], function(n) {
        n.initialize(document.getElementById(e), t),
        t.navigation = n
    })
}
var requirejs, require, define;
!function(e) {
    function t(e, t) {
        return v.call(e, t)
    }
    function n(e, t) {
        var n, r, i, o, a, s, u, c, l, p, f, h = t && t.split("/"), d = m.map, g = d && d["*"] || {};
        if (e && "." === e.charAt(0))
            if (t) {
                for (e = e.split("/"),
                a = e.length - 1,
                m.nodeIdCompat && y.test(e[a]) && (e[a] = e[a].replace(y, "")),
                e = h.slice(0, h.length - 1).concat(e),
                l = 0; l < e.length; l += 1)
                    if (f = e[l],
                    "." === f)
                        e.splice(l, 1),
                        l -= 1;
                    else if (".." === f) {
                        if (1 === l && (".." === e[2] || ".." === e[0]))
                            break;
                        l > 0 && (e.splice(l - 1, 2),
                        l -= 2)
                    }
                e = e.join("/")
            } else
                0 === e.indexOf("./") && (e = e.substring(2));
        if ((h || g) && d) {
            for (n = e.split("/"),
            l = n.length; l > 0; l -= 1) {
                if (r = n.slice(0, l).join("/"),
                h)
                    for (p = h.length; p > 0; p -= 1)
                        if (i = d[h.slice(0, p).join("/")],
                        i && (i = i[r])) {
                            o = i,
                            s = l;
                            break
                        }
                if (o)
                    break;
                !u && g && g[r] && (u = g[r],
                c = l)
            }
            !o && u && (o = u,
            s = c),
            o && (n.splice(0, s, o),
            e = n.join("/"))
        }
        return e
    }
    function r(t, n) {
        return function() {
            var r = b.call(arguments, 0);
            return "string" != typeof r[0] && 1 === r.length && r.push(null ),
            l.apply(e, r.concat([t, n]))
        }
    }
    function i(e) {
        return function(t) {
            return n(t, e)
        }
    }
    function o(e) {
        return function(t) {
            h[e] = t
        }
    }
    function a(n) {
        if (t(d, n)) {
            var r = d[n];
            delete d[n],
            g[n] = !0,
            c.apply(e, r)
        }
        if (!t(h, n) && !t(g, n))
            throw new Error("No " + n);
        return h[n]
    }
    function s(e) {
        var t, n = e ? e.indexOf("!") : -1;
        return n > -1 && (t = e.substring(0, n),
        e = e.substring(n + 1, e.length)),
        [t, e]
    }
    function u(e) {
        return function() {
            return m && m.config && m.config[e] || {}
        }
    }
    var c, l, p, f, h = {}, d = {}, m = {}, g = {}, v = Object.prototype.hasOwnProperty, b = [].slice, y = /\.js$/;
    p = function(e, t) {
        var r, o = s(e), u = o[0];
        return e = o[1],
        u && (u = n(u, t),
        r = a(u)),
        u ? e = r && r.normalize ? r.normalize(e, i(t)) : n(e, t) : (e = n(e, t),
        o = s(e),
        u = o[0],
        e = o[1],
        u && (r = a(u))),
        {
            f: u ? u + "!" + e : e,
            n: e,
            pr: u,
            p: r
        }
    }
    ,
    f = {
        require: function(e) {
            return r(e)
        },
        exports: function(e) {
            var t = h[e];
            return "undefined" != typeof t ? t : h[e] = {}
        },
        module: function(e) {
            return {
                id: e,
                uri: "",
                exports: h[e],
                config: u(e)
            }
        }
    },
    c = function(n, i, s, u) {
        var c, l, m, v, b, y, _ = [], k = typeof s;
        if (u = u || n,
        "undefined" === k || "function" === k) {
            for (i = !i.length && s.length ? ["require", "exports", "module"] : i,
            b = 0; b < i.length; b += 1)
                if (v = p(i[b], u),
                l = v.f,
                "require" === l)
                    _[b] = f.require(n);
                else if ("exports" === l)
                    _[b] = f.exports(n),
                    y = !0;
                else if ("module" === l)
                    c = _[b] = f.module(n);
                else if (t(h, l) || t(d, l) || t(g, l))
                    _[b] = a(l);
                else {
                    if (!v.p)
                        throw new Error(n + " missing " + l);
                    v.p.load(v.n, r(u, !0), o(l), {}),
                    _[b] = h[l]
                }
            m = s ? s.apply(h[n], _) : void 0,
            n && (c && c.exports !== e && c.exports !== h[n] ? h[n] = c.exports : m === e && y || (h[n] = m))
        } else
            n && (h[n] = s)
    }
    ,
    requirejs = require = l = function(t, n, r, i, o) {
        if ("string" == typeof t)
            return f[t] ? f[t](n) : a(p(t, n).f);
        if (!t.splice) {
            if (m = t,
            m.deps && l(m.deps, m.callback),
            !n)
                return;
            n.splice ? (t = n,
            n = r,
            r = null ) : t = e
        }
        return n = n || function() {}
        ,
        "function" == typeof r && (r = i,
        i = o),
        i ? c(e, t, n, r) : setTimeout(function() {
            c(e, t, n, r)
        }, 4),
        l
    }
    ,
    l.config = function(e) {
        return l(e)
    }
    ,
    requirejs._defined = h,
    define = function(e, n, r) {
        if ("string" != typeof e)
            throw new Error("See almond README: incorrect module build, no module name");
        n.splice || (r = n,
        n = []),
        t(h, e) || t(d, e) || (d[e] = [e, n, r])
    }
    ,
    define.amd = {
        jQuery: !0
    }
}(),
function() {
    !function(e) {
        var t = this || (0,
        eval)("this")
          , n = t.document
          , r = t.navigator
          , i = t.jQuery
          , o = t.JSON;
        !function(e) {
            "function" == typeof define && define.amd ? define("Knockout", ["exports", "require"], e) : e("function" == typeof require && "object" == typeof exports && "object" == typeof module ? module.exports || exports : t.ko = {})
        }(function(a, s) {
            function u(e, t) {
                return null  === e || typeof e in h ? e === t : !1
            }
            function c(t, n) {
                var r;
                return function() {
                    r || (r = setTimeout(function() {
                        r = e,
                        t()
                    }, n))
                }
            }
            function l(e, t) {
                var n;
                return function() {
                    clearTimeout(n),
                    n = setTimeout(e, t)
                }
            }
            function p(e, t, n, r) {
                f.d[e] = {
                    init: function(e, i, o, a, s) {
                        var u, c;
                        return f.w(function() {
                            var o = f.a.c(i())
                              , a = !n != !o
                              , l = !c;
                            (l || t || a !== u) && (l && f.Z.oa() && (c = f.a.la(f.e.childNodes(e), !0)),
                            a ? (l || f.e.T(e, f.a.la(c)),
                            f.Ja(r ? r(s, o) : s, e)) : f.e.ma(e),
                            u = a)
                        }, null , {
                            q: e
                        }),
                        {
                            controlsDescendantBindings: !0
                        }
                    }
                },
                f.h.ka[e] = !1,
                f.e.R[e] = !0
            }
            var f = "undefined" != typeof a ? a : {};
            f.b = function(e, t) {
                for (var n = e.split("."), r = f, i = 0; i < n.length - 1; i++)
                    r = r[n[i]];
                r[n[n.length - 1]] = t
            }
            ,
            f.D = function(e, t, n) {
                e[t] = n
            }
            ,
            f.version = "3.3.0",
            f.b("version", f.version),
            f.a = function() {
                function a(e, t) {
                    for (var n in e)
                        e.hasOwnProperty(n) && t(n, e[n])
                }
                function s(e, t) {
                    if (t)
                        for (var n in t)
                            t.hasOwnProperty(n) && (e[n] = t[n]);
                    return e
                }
                function u(e, t) {
                    return e.__proto__ = t,
                    e
                }
                function c(e, t, n, r) {
                    var i = e[t].match(g) || [];
                    f.a.o(n.match(g), function(e) {
                        f.a.ga(i, e, r)
                    }),
                    e[t] = i.join(" ")
                }
                var l = {
                    __proto__: []
                } instanceof Array
                  , p = {}
                  , h = {};
                p[r && /Firefox\/2/i.test(r.userAgent) ? "KeyboardEvent" : "UIEvents"] = ["keyup", "keydown", "keypress"],
                p.MouseEvents = "click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave".split(" "),
                a(p, function(e, t) {
                    if (t.length)
                        for (var n = 0, r = t.length; r > n; n++)
                            h[t[n]] = e
                });
                var d = {
                    propertychange: !0
                }
                  , m = n && function() {
                    for (var t = 3, r = n.createElement("div"), i = r.getElementsByTagName("i"); r.innerHTML = "<!--[if gt IE " + ++t + "]><i></i><![endif]-->",
                    i[0]; )
                        ;
                    return t > 4 ? t : e
                }()
                  , g = /\S+/g;
                return {
                    Bb: ["authenticity_token", /^__RequestVerificationToken(_.*)?$/],
                    o: function(e, t) {
                        for (var n = 0, r = e.length; r > n; n++)
                            t(e[n], n)
                    },
                    m: function(e, t) {
                        if ("function" == typeof Array.prototype.indexOf)
                            return Array.prototype.indexOf.call(e, t);
                        for (var n = 0, r = e.length; r > n; n++)
                            if (e[n] === t)
                                return n;
                        return -1
                    },
                    vb: function(e, t, n) {
                        for (var r = 0, i = e.length; i > r; r++)
                            if (t.call(n, e[r], r))
                                return e[r];
                        return null
                    },
                    ya: function(e, t) {
                        var n = f.a.m(e, t);
                        n > 0 ? e.splice(n, 1) : 0 === n && e.shift()
                    },
                    wb: function(e) {
                        e = e || [];
                        for (var t = [], n = 0, r = e.length; r > n; n++)
                            0 > f.a.m(t, e[n]) && t.push(e[n]);
                        return t
                    },
                    Ka: function(e, t) {
                        e = e || [];
                        for (var n = [], r = 0, i = e.length; i > r; r++)
                            n.push(t(e[r], r));
                        return n
                    },
                    xa: function(e, t) {
                        e = e || [];
                        for (var n = [], r = 0, i = e.length; i > r; r++)
                            t(e[r], r) && n.push(e[r]);
                        return n
                    },
                    ia: function(e, t) {
                        if (t instanceof Array)
                            e.push.apply(e, t);
                        else
                            for (var n = 0, r = t.length; r > n; n++)
                                e.push(t[n]);
                        return e
                    },
                    ga: function(e, t, n) {
                        var r = f.a.m(f.a.cb(e), t);
                        0 > r ? n && e.push(t) : n || e.splice(r, 1)
                    },
                    za: l,
                    extend: s,
                    Fa: u,
                    Ga: l ? u : s,
                    A: a,
                    pa: function(e, t) {
                        if (!e)
                            return e;
                        var n, r = {};
                        for (n in e)
                            e.hasOwnProperty(n) && (r[n] = t(e[n], n, e));
                        return r
                    },
                    Ra: function(e) {
                        for (; e.firstChild; )
                            f.removeNode(e.firstChild)
                    },
                    Jb: function(e) {
                        e = f.a.O(e);
                        for (var t = (e[0] && e[0].ownerDocument || n).createElement("div"), r = 0, i = e.length; i > r; r++)
                            t.appendChild(f.S(e[r]));
                        return t
                    },
                    la: function(e, t) {
                        for (var n = 0, r = e.length, i = []; r > n; n++) {
                            var o = e[n].cloneNode(!0);
                            i.push(t ? f.S(o) : o)
                        }
                        return i
                    },
                    T: function(e, t) {
                        if (f.a.Ra(e),
                        t)
                            for (var n = 0, r = t.length; r > n; n++)
                                e.appendChild(t[n])
                    },
                    Qb: function(e, t) {
                        var n = e.nodeType ? [e] : e;
                        if (0 < n.length) {
                            for (var r = n[0], i = r.parentNode, o = 0, a = t.length; a > o; o++)
                                i.insertBefore(t[o], r);
                            for (o = 0,
                            a = n.length; a > o; o++)
                                f.removeNode(n[o])
                        }
                    },
                    na: function(e, t) {
                        if (e.length) {
                            for (t = 8 === t.nodeType && t.parentNode || t; e.length && e[0].parentNode !== t; )
                                e.splice(0, 1);
                            if (1 < e.length) {
                                var n = e[0]
                                  , r = e[e.length - 1];
                                for (e.length = 0; n !== r; )
                                    if (e.push(n),
                                    n = n.nextSibling,
                                    !n)
                                        return;
                                e.push(r)
                            }
                        }
                        return e
                    },
                    Sb: function(e, t) {
                        7 > m ? e.setAttribute("selected", t) : e.selected = t
                    },
                    ib: function(t) {
                        return null  === t || t === e ? "" : t.trim ? t.trim() : t.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
                    },
                    Dc: function(e, t) {
                        return e = e || "",
                        t.length > e.length ? !1 : e.substring(0, t.length) === t
                    },
                    jc: function(e, t) {
                        if (e === t)
                            return !0;
                        if (11 === e.nodeType)
                            return !1;
                        if (t.contains)
                            return t.contains(3 === e.nodeType ? e.parentNode : e);
                        if (t.compareDocumentPosition)
                            return 16 == (16 & t.compareDocumentPosition(e));
                        for (; e && e != t; )
                            e = e.parentNode;
                        return !!e
                    },
                    Qa: function(e) {
                        return f.a.jc(e, e.ownerDocument.documentElement)
                    },
                    tb: function(e) {
                        return !!f.a.vb(e, f.a.Qa)
                    },
                    v: function(e) {
                        return e && e.tagName && e.tagName.toLowerCase()
                    },
                    n: function(e, t, n) {
                        var r = m && d[t];
                        if (!r && i)
                            i(e).bind(t, n);
                        else if (r || "function" != typeof e.addEventListener) {
                            if ("undefined" == typeof e.attachEvent)
                                throw Error("Browser doesn't support addEventListener or attachEvent");
                            var o = function(t) {
                                n.call(e, t)
                            }
                              , a = "on" + t;
                            e.attachEvent(a, o),
                            f.a.C.fa(e, function() {
                                e.detachEvent(a, o)
                            })
                        } else
                            e.addEventListener(t, n, !1)
                    },
                    qa: function(e, r) {
                        if (!e || !e.nodeType)
                            throw Error("element must be a DOM node when calling triggerEvent");
                        var o;
                        if ("input" === f.a.v(e) && e.type && "click" == r.toLowerCase() ? (o = e.type,
                        o = "checkbox" == o || "radio" == o) : o = !1,
                        i && !o)
                            i(e).trigger(r);
                        else if ("function" == typeof n.createEvent) {
                            if ("function" != typeof e.dispatchEvent)
                                throw Error("The supplied element doesn't support dispatchEvent");
                            o = n.createEvent(h[r] || "HTMLEvents"),
                            o.initEvent(r, !0, !0, t, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, e),
                            e.dispatchEvent(o)
                        } else if (o && e.click)
                            e.click();
                        else {
                            if ("undefined" == typeof e.fireEvent)
                                throw Error("Browser doesn't support triggering events");
                            e.fireEvent("on" + r)
                        }
                    },
                    c: function(e) {
                        return f.F(e) ? e() : e
                    },
                    cb: function(e) {
                        return f.F(e) ? e.B() : e
                    },
                    Ia: function(e, t, n) {
                        var r;
                        t && ("object" == typeof e.classList ? (r = e.classList[n ? "add" : "remove"],
                        f.a.o(t.match(g), function(t) {
                            r.call(e.classList, t)
                        })) : "string" == typeof e.className.baseVal ? c(e.className, "baseVal", t, n) : c(e, "className", t, n))
                    },
                    Ha: function(t, n) {
                        var r = f.a.c(n);
                        (null  === r || r === e) && (r = "");
                        var i = f.e.firstChild(t);
                        !i || 3 != i.nodeType || f.e.nextSibling(i) ? f.e.T(t, [t.ownerDocument.createTextNode(r)]) : i.data = r,
                        f.a.mc(t)
                    },
                    Rb: function(e, t) {
                        if (e.name = t,
                        7 >= m)
                            try {
                                e.mergeAttributes(n.createElement("<input name='" + e.name + "'/>"), !1)
                            } catch (r) {}
                    },
                    mc: function(e) {
                        m >= 9 && (e = 1 == e.nodeType ? e : e.parentNode,
                        e.style && (e.style.zoom = e.style.zoom))
                    },
                    kc: function(e) {
                        if (m) {
                            var t = e.style.width;
                            e.style.width = 0,
                            e.style.width = t
                        }
                    },
                    Bc: function(e, t) {
                        e = f.a.c(e),
                        t = f.a.c(t);
                        for (var n = [], r = e; t >= r; r++)
                            n.push(r);
                        return n
                    },
                    O: function(e) {
                        for (var t = [], n = 0, r = e.length; r > n; n++)
                            t.push(e[n]);
                        return t
                    },
                    Hc: 6 === m,
                    Ic: 7 === m,
                    M: m,
                    Db: function(e, t) {
                        for (var n = f.a.O(e.getElementsByTagName("input")).concat(f.a.O(e.getElementsByTagName("textarea"))), r = "string" == typeof t ? function(e) {
                            return e.name === t
                        }
                         : function(e) {
                            return t.test(e.name)
                        }
                        , i = [], o = n.length - 1; o >= 0; o--)
                            r(n[o]) && i.push(n[o]);
                        return i
                    },
                    yc: function(e) {
                        return "string" == typeof e && (e = f.a.ib(e)) ? o && o.parse ? o.parse(e) : new Function("return " + e)() : null
                    },
                    jb: function(e, t, n) {
                        if (!o || !o.stringify)
                            throw Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
                        return o.stringify(f.a.c(e), t, n)
                    },
                    zc: function(e, t, r) {
                        r = r || {};
                        var i = r.params || {}
                          , o = r.includeFields || this.Bb
                          , s = e;
                        if ("object" == typeof e && "form" === f.a.v(e))
                            for (var s = e.action, u = o.length - 1; u >= 0; u--)
                                for (var c = f.a.Db(e, o[u]), l = c.length - 1; l >= 0; l--)
                                    i[c[l].name] = c[l].value;
                        t = f.a.c(t);
                        var p = n.createElement("form");
                        p.style.display = "none",
                        p.action = s,
                        p.method = "post";
                        for (var h in t)
                            e = n.createElement("input"),
                            e.type = "hidden",
                            e.name = h,
                            e.value = f.a.jb(f.a.c(t[h])),
                            p.appendChild(e);
                        a(i, function(e, t) {
                            var r = n.createElement("input");
                            r.type = "hidden",
                            r.name = e,
                            r.value = t,
                            p.appendChild(r)
                        }),
                        n.body.appendChild(p),
                        r.submitter ? r.submitter(p) : p.submit(),
                        setTimeout(function() {
                            p.parentNode.removeChild(p)
                        }, 0)
                    }
                }
            }(),
            f.b("utils", f.a),
            f.b("utils.arrayForEach", f.a.o),
            f.b("utils.arrayFirst", f.a.vb),
            f.b("utils.arrayFilter", f.a.xa),
            f.b("utils.arrayGetDistinctValues", f.a.wb),
            f.b("utils.arrayIndexOf", f.a.m),
            f.b("utils.arrayMap", f.a.Ka),
            f.b("utils.arrayPushAll", f.a.ia),
            f.b("utils.arrayRemoveItem", f.a.ya),
            f.b("utils.extend", f.a.extend),
            f.b("utils.fieldsIncludedWithJsonPost", f.a.Bb),
            f.b("utils.getFormFields", f.a.Db),
            f.b("utils.peekObservable", f.a.cb),
            f.b("utils.postJson", f.a.zc),
            f.b("utils.parseJson", f.a.yc),
            f.b("utils.registerEventHandler", f.a.n),
            f.b("utils.stringifyJson", f.a.jb),
            f.b("utils.range", f.a.Bc),
            f.b("utils.toggleDomNodeCssClass", f.a.Ia),
            f.b("utils.triggerEvent", f.a.qa),
            f.b("utils.unwrapObservable", f.a.c),
            f.b("utils.objectForEach", f.a.A),
            f.b("utils.addOrRemoveItem", f.a.ga),
            f.b("utils.setTextContent", f.a.Ha),
            f.b("unwrap", f.a.c),
            Function.prototype.bind || (Function.prototype.bind = function(e) {
                var t = this;
                if (1 === arguments.length)
                    return function() {
                        return t.apply(e, arguments)
                    }
                    ;
                var n = Array.prototype.slice.call(arguments, 1);
                return function() {
                    var r = n.slice(0);
                    return r.push.apply(r, arguments),
                    t.apply(e, r)
                }
            }
            ),
            f.a.f = new (function() {
                function t(t, o) {
                    var a = t[r];
                    if (!a || "null" === a || !i[a]) {
                        if (!o)
                            return e;
                        a = t[r] = "ko" + n++,
                        i[a] = {}
                    }
                    return i[a]
                }
                var n = 0
                  , r = "__ko__" + (new Date).getTime()
                  , i = {};
                return {
                    get: function(n, r) {
                        var i = t(n, !1);
                        return i === e ? e : i[r]
                    },
                    set: function(n, r, i) {
                        (i !== e || t(n, !1) !== e) && (t(n, !0)[r] = i)
                    },
                    clear: function(e) {
                        var t = e[r];
                        return t ? (delete i[t],
                        e[r] = null ,
                        !0) : !1
                    },
                    I: function() {
                        return n++ + r
                    }
                }
            })
            ,
            f.b("utils.domData", f.a.f),
            f.b("utils.domData.clear", f.a.f.clear),
            f.a.C = new (function() {
                function t(t, n) {
                    var i = f.a.f.get(t, r);
                    return i === e && n && (i = [],
                    f.a.f.set(t, r, i)),
                    i
                }
                function n(e) {
                    var r = t(e, !1);
                    if (r)
                        for (var r = r.slice(0), i = 0; i < r.length; i++)
                            r[i](e);
                    if (f.a.f.clear(e),
                    f.a.C.cleanExternalData(e),
                    a[e.nodeType])
                        for (r = e.firstChild; e = r; )
                            r = e.nextSibling,
                            8 === e.nodeType && n(e)
                }
                var r = f.a.f.I()
                  , o = {
                    1: !0,
                    8: !0,
                    9: !0
                }
                  , a = {
                    1: !0,
                    9: !0
                };
                return {
                    fa: function(e, n) {
                        if ("function" != typeof n)
                            throw Error("Callback must be a function");
                        t(e, !0).push(n)
                    },
                    Pb: function(n, i) {
                        var o = t(n, !1);
                        o && (f.a.ya(o, i),
                        0 == o.length && f.a.f.set(n, r, e))
                    },
                    S: function(e) {
                        if (o[e.nodeType] && (n(e),
                        a[e.nodeType])) {
                            var t = [];
                            f.a.ia(t, e.getElementsByTagName("*"));
                            for (var r = 0, i = t.length; i > r; r++)
                                n(t[r])
                        }
                        return e
                    },
                    removeNode: function(e) {
                        f.S(e),
                        e.parentNode && e.parentNode.removeChild(e)
                    },
                    cleanExternalData: function(e) {
                        i && "function" == typeof i.cleanData && i.cleanData([e])
                    }
                }
            })
            ,
            f.S = f.a.C.S,
            f.removeNode = f.a.C.removeNode,
            f.b("cleanNode", f.S),
            f.b("removeNode", f.removeNode),
            f.b("utils.domNodeDisposal", f.a.C),
            f.b("utils.domNodeDisposal.addDisposeCallback", f.a.C.fa),
            f.b("utils.domNodeDisposal.removeDisposeCallback", f.a.C.Pb),
            function() {
                f.a.ca = function(e, r) {
                    var o;
                    if (i) {
                        if (i.parseHTML)
                            o = i.parseHTML(e, r) || [];
                        else if ((o = i.clean([e], r)) && o[0]) {
                            for (var a = o[0]; a.parentNode && 11 !== a.parentNode.nodeType; )
                                a = a.parentNode;
                            a.parentNode && a.parentNode.removeChild(a)
                        }
                    } else {
                        (a = r) || (a = n),
                        o = a.parentWindow || a.defaultView || t;
                        var s = f.a.ib(e).toLowerCase()
                          , a = a.createElement("div")
                          , s = s.match(/^<(thead|tbody|tfoot)/) && [1, "<table>", "</table>"] || !s.indexOf("<tr") && [2, "<table><tbody>", "</tbody></table>"] || (!s.indexOf("<td") || !s.indexOf("<th")) && [3, "<table><tbody><tr>", "</tr></tbody></table>"] || [0, "", ""]
                          , u = "ignored<div>" + s[1] + e + s[2] + "</div>";
                        for ("function" == typeof o.innerShiv ? a.appendChild(o.innerShiv(u)) : a.innerHTML = u; s[0]--; )
                            a = a.lastChild;
                        o = f.a.O(a.lastChild.childNodes)
                    }
                    return o
                }
                ,
                f.a.gb = function(t, n) {
                    if (f.a.Ra(t),
                    n = f.a.c(n),
                    null  !== n && n !== e)
                        if ("string" != typeof n && (n = n.toString()),
                        i)
                            i(t).html(n);
                        else
                            for (var r = f.a.ca(n, t.ownerDocument), o = 0; o < r.length; o++)
                                t.appendChild(r[o])
                }
            }(),
            f.b("utils.parseHtmlFragment", f.a.ca),
            f.b("utils.setHtml", f.a.gb),
            f.H = function() {
                function t(e, n) {
                    if (e)
                        if (8 == e.nodeType) {
                            var r = f.H.Lb(e.nodeValue);
                            null  != r && n.push({
                                ic: e,
                                wc: r
                            })
                        } else if (1 == e.nodeType)
                            for (var r = 0, i = e.childNodes, o = i.length; o > r; r++)
                                t(i[r], n)
                }
                var n = {};
                return {
                    $a: function(e) {
                        if ("function" != typeof e)
                            throw Error("You can only pass a function to ko.memoization.memoize()");
                        var t = (4294967296 * (1 + Math.random()) | 0).toString(16).substring(1) + (4294967296 * (1 + Math.random()) | 0).toString(16).substring(1);
                        return n[t] = e,
                        "<!--[ko_memo:" + t + "]-->"
                    },
                    Wb: function(t, r) {
                        var i = n[t];
                        if (i === e)
                            throw Error("Couldn't find any memo with ID " + t + ". Perhaps it's already been unmemoized.");
                        try {
                            return i.apply(null , r || []),
                            !0
                        } finally {
                            delete n[t]
                        }
                    },
                    Xb: function(e, n) {
                        var r = [];
                        t(e, r);
                        for (var i = 0, o = r.length; o > i; i++) {
                            var a = r[i].ic
                              , s = [a];
                            n && f.a.ia(s, n),
                            f.H.Wb(r[i].wc, s),
                            a.nodeValue = "",
                            a.parentNode && a.parentNode.removeChild(a)
                        }
                    },
                    Lb: function(e) {
                        return (e = e.match(/^\[ko_memo\:(.*?)\]$/)) ? e[1] : null
                    }
                }
            }(),
            f.b("memoization", f.H),
            f.b("memoization.memoize", f.H.$a),
            f.b("memoization.unmemoize", f.H.Wb),
            f.b("memoization.parseMemoText", f.H.Lb),
            f.b("memoization.unmemoizeDomNodeAndDescendants", f.H.Xb),
            f.Sa = {
                throttle: function(e, t) {
                    e.throttleEvaluation = t;
                    var n = null ;
                    return f.j({
                        read: e,
                        write: function(r) {
                            clearTimeout(n),
                            n = setTimeout(function() {
                                e(r)
                            }, t)
                        }
                    })
                },
                rateLimit: function(e, t) {
                    var n, r, i;
                    "number" == typeof t ? n = t : (n = t.timeout,
                    r = t.method),
                    i = "notifyWhenChangesStop" == r ? l : c,
                    e.Za(function(e) {
                        return i(e, n)
                    })
                },
                notify: function(e, t) {
                    e.equalityComparer = "always" == t ? null  : u
                }
            };
            var h = {
                undefined: 1,
                "boolean": 1,
                number: 1,
                string: 1
            };
            f.b("extenders", f.Sa),
            f.Ub = function(e, t, n) {
                this.da = e,
                this.La = t,
                this.hc = n,
                this.Gb = !1,
                f.D(this, "dispose", this.p)
            }
            ,
            f.Ub.prototype.p = function() {
                this.Gb = !0,
                this.hc()
            }
            ,
            f.Q = function() {
                f.a.Ga(this, f.Q.fn),
                this.G = {},
                this.rb = 1
            }
            ;
            var d = {
                U: function(e, t, n) {
                    var r = this;
                    n = n || "change";
                    var i = new f.Ub(r,t ? e.bind(t) : e,function() {
                        f.a.ya(r.G[n], i),
                        r.ua && r.ua(n)
                    }
                    );
                    return r.ja && r.ja(n),
                    r.G[n] || (r.G[n] = []),
                    r.G[n].push(i),
                    i
                },
                notifySubscribers: function(e, t) {
                    if (t = t || "change",
                    "change" === t && this.Yb(),
                    this.Ba(t))
                        try {
                            f.k.xb();
                            for (var n, r = this.G[t].slice(0), i = 0; n = r[i]; ++i)
                                n.Gb || n.La(e)
                        } finally {
                            f.k.end()
                        }
                },
                Aa: function() {
                    return this.rb
                },
                pc: function(e) {
                    return this.Aa() !== e
                },
                Yb: function() {
                    ++this.rb
                },
                Za: function(e) {
                    var t, n, r, i = this, o = f.F(i);
                    i.ta || (i.ta = i.notifySubscribers,
                    i.notifySubscribers = function(e, t) {
                        t && "change" !== t ? "beforeChange" === t ? i.pb(e) : i.ta(e, t) : i.qb(e)
                    }
                    );
                    var a = e(function() {
                        o && r === i && (r = i()),
                        t = !1,
                        i.Wa(n, r) && i.ta(n = r)
                    });
                    i.qb = function(e) {
                        t = !0,
                        r = e,
                        a()
                    }
                    ,
                    i.pb = function(e) {
                        t || (n = e,
                        i.ta(e, "beforeChange"))
                    }
                },
                Ba: function(e) {
                    return this.G[e] && this.G[e].length
                },
                nc: function(e) {
                    if (e)
                        return this.G[e] && this.G[e].length || 0;
                    var t = 0;
                    return f.a.A(this.G, function(e, n) {
                        t += n.length
                    }),
                    t
                },
                Wa: function(e, t) {
                    return !this.equalityComparer || !this.equalityComparer(e, t)
                },
                extend: function(e) {
                    var t = this;
                    return e && f.a.A(e, function(e, n) {
                        var r = f.Sa[e];
                        "function" == typeof r && (t = r(t, n) || t)
                    }),
                    t
                }
            };
            f.D(d, "subscribe", d.U),
            f.D(d, "extend", d.extend),
            f.D(d, "getSubscriptionsCount", d.nc),
            f.a.za && f.a.Fa(d, Function.prototype),
            f.Q.fn = d,
            f.Hb = function(e) {
                return null  != e && "function" == typeof e.U && "function" == typeof e.notifySubscribers
            }
            ,
            f.b("subscribable", f.Q),
            f.b("isSubscribable", f.Hb),
            f.Z = f.k = function() {
                function e(e) {
                    r.push(n),
                    n = e
                }
                function t() {
                    n = r.pop()
                }
                var n, r = [], i = 0;
                return {
                    xb: e,
                    end: t,
                    Ob: function(e) {
                        if (n) {
                            if (!f.Hb(e))
                                throw Error("Only subscribable things can act as dependencies");
                            n.La(e, e.ac || (e.ac = ++i))
                        }
                    },
                    u: function(n, r, i) {
                        try {
                            return e(),
                            n.apply(r, i || [])
                        } finally {
                            t()
                        }
                    },
                    oa: function() {
                        return n ? n.w.oa() : void 0
                    },
                    Ca: function() {
                        return n ? n.Ca : void 0
                    }
                }
            }(),
            f.b("computedContext", f.Z),
            f.b("computedContext.getDependenciesCount", f.Z.oa),
            f.b("computedContext.isInitial", f.Z.Ca),
            f.b("computedContext.isSleeping", f.Z.Jc),
            f.b("ignoreDependencies", f.Gc = f.k.u),
            f.r = function(e) {
                function t() {
                    return 0 < arguments.length ? (t.Wa(n, arguments[0]) && (t.X(),
                    n = arguments[0],
                    t.W()),
                    this) : (f.k.Ob(t),
                    n)
                }
                var n = e;
                return f.Q.call(t),
                f.a.Ga(t, f.r.fn),
                t.B = function() {
                    return n
                }
                ,
                t.W = function() {
                    t.notifySubscribers(n)
                }
                ,
                t.X = function() {
                    t.notifySubscribers(n, "beforeChange")
                }
                ,
                f.D(t, "peek", t.B),
                f.D(t, "valueHasMutated", t.W),
                f.D(t, "valueWillMutate", t.X),
                t
            }
            ,
            f.r.fn = {
                equalityComparer: u
            };
            var m = f.r.Ac = "__ko_proto__";
            f.r.fn[m] = f.r,
            f.a.za && f.a.Fa(f.r.fn, f.Q.fn),
            f.Ta = function(t, n) {
                return null  === t || t === e || t[m] === e ? !1 : t[m] === n ? !0 : f.Ta(t[m], n)
            }
            ,
            f.F = function(e) {
                return f.Ta(e, f.r)
            }
            ,
            f.Da = function(e) {
                return "function" == typeof e && e[m] === f.r || "function" == typeof e && e[m] === f.j && e.qc ? !0 : !1
            }
            ,
            f.b("observable", f.r),
            f.b("isObservable", f.F),
            f.b("isWriteableObservable", f.Da),
            f.b("isWritableObservable", f.Da),
            f.ba = function(e) {
                if (e = e || [],
                "object" != typeof e || !("length" in e))
                    throw Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");
                return e = f.r(e),
                f.a.Ga(e, f.ba.fn),
                e.extend({
                    trackArrayChanges: !0
                })
            }
            ,
            f.ba.fn = {
                remove: function(e) {
                    for (var t = this.B(), n = [], r = "function" != typeof e || f.F(e) ? function(t) {
                        return t === e
                    }
                     : e, i = 0; i < t.length; i++) {
                        var o = t[i];
                        r(o) && (0 === n.length && this.X(),
                        n.push(o),
                        t.splice(i, 1),
                        i--)
                    }
                    return n.length && this.W(),
                    n
                },
                removeAll: function(t) {
                    if (t === e) {
                        var n = this.B()
                          , r = n.slice(0);
                        return this.X(),
                        n.splice(0, n.length),
                        this.W(),
                        r
                    }
                    return t ? this.remove(function(e) {
                        return 0 <= f.a.m(t, e)
                    }) : []
                },
                destroy: function(e) {
                    var t = this.B()
                      , n = "function" != typeof e || f.F(e) ? function(t) {
                        return t === e
                    }
                     : e;
                    this.X();
                    for (var r = t.length - 1; r >= 0; r--)
                        n(t[r]) && (t[r]._destroy = !0);
                    this.W()
                },
                destroyAll: function(t) {
                    return t === e ? this.destroy(function() {
                        return !0
                    }) : t ? this.destroy(function(e) {
                        return 0 <= f.a.m(t, e)
                    }) : []
                },
                indexOf: function(e) {
                    var t = this();
                    return f.a.m(t, e)
                },
                replace: function(e, t) {
                    var n = this.indexOf(e);
                    n >= 0 && (this.X(),
                    this.B()[n] = t,
                    this.W())
                }
            },
            f.a.o("pop push reverse shift sort splice unshift".split(" "), function(e) {
                f.ba.fn[e] = function() {
                    var t = this.B();
                    return this.X(),
                    this.yb(t, e, arguments),
                    t = t[e].apply(t, arguments),
                    this.W(),
                    t
                }
            }),
            f.a.o(["slice"], function(e) {
                f.ba.fn[e] = function() {
                    var t = this();
                    return t[e].apply(t, arguments)
                }
            }),
            f.a.za && f.a.Fa(f.ba.fn, f.r.fn),
            f.b("observableArray", f.ba),
            f.Sa.trackArrayChanges = function(e) {
                function t() {
                    if (!r) {
                        r = !0;
                        var t = e.notifySubscribers;
                        e.notifySubscribers = function(e, n) {
                            return n && "change" !== n || ++o,
                            t.apply(this, arguments)
                        }
                        ;
                        var a = [].concat(e.B() || []);
                        i = null ,
                        n = e.U(function(t) {
                            if (t = [].concat(t || []),
                            e.Ba("arrayChange")) {
                                var n;
                                (!i || o > 1) && (i = f.a.Ma(a, t, {
                                    sparse: !0
                                })),
                                n = i
                            }
                            a = t,
                            i = null ,
                            o = 0,
                            n && n.length && e.notifySubscribers(n, "arrayChange")
                        })
                    }
                }
                if (!e.yb) {
                    var n, r = !1, i = null , o = 0, a = e.ja, s = e.ua;
                    e.ja = function(n) {
                        a && a.call(e, n),
                        "arrayChange" === n && t()
                    }
                    ,
                    e.ua = function(t) {
                        s && s.call(e, t),
                        "arrayChange" !== t || e.Ba("arrayChange") || (n.p(),
                        r = !1)
                    }
                    ,
                    e.yb = function(e, t, n) {
                        function a(e, t, n) {
                            return s[s.length] = {
                                status: e,
                                value: t,
                                index: n
                            }
                        }
                        if (r && !o) {
                            var s = []
                              , u = e.length
                              , c = n.length
                              , l = 0;
                            switch (t) {
                            case "push":
                                l = u;
                            case "unshift":
                                for (t = 0; c > t; t++)
                                    a("added", n[t], l + t);
                                break;
                            case "pop":
                                l = u - 1;
                            case "shift":
                                u && a("deleted", e[l], l);
                                break;
                            case "splice":
                                t = Math.min(Math.max(0, 0 > n[0] ? u + n[0] : n[0]), u);
                                for (var u = 1 === c ? u : Math.min(t + (n[1] || 0), u), c = t + c - 2, l = Math.max(u, c), p = [], h = [], d = 2; l > t; ++t,
                                ++d)
                                    u > t && h.push(a("deleted", e[t], t)),
                                    c > t && p.push(a("added", n[d], t));
                                f.a.Cb(h, p);
                                break;
                            default:
                                return
                            }
                            i = s
                        }
                    }
                }
            }
            ,
            f.w = f.j = function(t, n, r) {
                function i(e, t, n) {
                    if (_ && t === c)
                        throw Error("A 'pure' computed must not be called recursively");
                    A[e] = n,
                    n.sa = M++,
                    n.ea = t.Aa()
                }
                function o() {
                    var e, t;
                    for (e in A)
                        if (A.hasOwnProperty(e) && (t = A[e],
                        t.da.pc(t.ea)))
                            return !0
                }
                function a() {
                    !k && A && f.a.A(A, function(e, t) {
                        t.p && t.p()
                    }),
                    A = null ,
                    M = 0,
                    b = !0,
                    k = m = !1
                }
                function s() {
                    var e = c.throttleEvaluation;
                    e && e >= 0 ? (clearTimeout(D),
                    D = setTimeout(function() {
                        u(!0)
                    }, e)) : c.nb ? c.nb() : u(!0)
                }
                function u(t) {
                    if (!g && !b) {
                        if (T && T()) {
                            if (!v)
                                return void x()
                        } else
                            v = !1;
                        g = !0;
                        try {
                            var r = A
                              , o = M
                              , a = _ ? e : !M;
                            f.k.xb({
                                La: function(e, t) {
                                    b || (o && r[t] ? (i(t, e, r[t]),
                                    delete r[t],
                                    --o) : A[t] || i(t, e, k ? {
                                        da: e
                                    } : e.U(s)))
                                },
                                w: c,
                                Ca: a
                            }),
                            A = {},
                            M = 0;
                            try {
                                var u = n ? y.call(n) : y()
                            } finally {
                                f.k.end(),
                                o && !k && f.a.A(r, function(e, t) {
                                    t.p && t.p()
                                }),
                                m = !1
                            }
                            c.Wa(d, u) && (k || h(d, "beforeChange"),
                            d = u,
                            k ? c.Yb() : t && h(d)),
                            a && h(d, "awake")
                        } finally {
                            g = !1
                        }
                        M || x()
                    }
                }
                function c() {
                    if (0 < arguments.length) {
                        if ("function" != typeof C)
                            throw Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
                        return C.apply(n, arguments),
                        this
                    }
                    return f.k.Ob(c),
                    (m || k && o()) && u(),
                    d
                }
                function l() {
                    return (m && !M || k && o()) && u(),
                    d
                }
                function p() {
                    return m || M > 0
                }
                function h(e, t) {
                    c.notifySubscribers(e, t)
                }
                var d, m = !0, g = !1, v = !1, b = !1, y = t, _ = !1, k = !1;
                if (y && "object" == typeof y ? (r = y,
                y = r.read) : (r = r || {},
                y || (y = r.read)),
                "function" != typeof y)
                    throw Error("Pass a function that returns the value of the ko.computed");
                var C = r.write
                  , w = r.disposeWhenNodeIsRemoved || r.q || null
                  , E = r.disposeWhen || r.Pa
                  , T = E
                  , x = a
                  , A = {}
                  , M = 0
                  , D = null ;
                n || (n = r.owner),
                f.Q.call(c),
                f.a.Ga(c, f.j.fn),
                c.B = l,
                c.oa = function() {
                    return M
                }
                ,
                c.qc = "function" == typeof C,
                c.p = function() {
                    x()
                }
                ,
                c.$ = p;
                var L = c.Za;
                return c.Za = function(e) {
                    L.call(c, e),
                    c.nb = function() {
                        c.pb(d),
                        m = !0,
                        c.qb(c)
                    }
                }
                ,
                r.pure ? (k = _ = !0,
                c.ja = function(e) {
                    if (!b && k && "change" == e) {
                        if (k = !1,
                        m || o())
                            A = null ,
                            M = 0,
                            m = !0,
                            u();
                        else {
                            var t = [];
                            f.a.A(A, function(e, n) {
                                t[n.sa] = e
                            }),
                            f.a.o(t, function(e, t) {
                                var n = A[e]
                                  , r = n.da.U(s);
                                r.sa = t,
                                r.ea = n.ea,
                                A[e] = r
                            })
                        }
                        b || h(d, "awake")
                    }
                }
                ,
                c.ua = function(t) {
                    b || "change" != t || c.Ba("change") || (f.a.A(A, function(e, t) {
                        t.p && (A[e] = {
                            da: t.da,
                            sa: t.sa,
                            ea: t.ea
                        },
                        t.p())
                    }),
                    k = !0,
                    h(e, "asleep"))
                }
                ,
                c.bc = c.Aa,
                c.Aa = function() {
                    return k && (m || o()) && u(),
                    c.bc()
                }
                ) : r.deferEvaluation && (c.ja = function(e) {
                    "change" != e && "beforeChange" != e || l()
                }
                ),
                f.D(c, "peek", c.B),
                f.D(c, "dispose", c.p),
                f.D(c, "isActive", c.$),
                f.D(c, "getDependenciesCount", c.oa),
                w && (v = !0,
                w.nodeType && (T = function() {
                    return !f.a.Qa(w) || E && E()
                }
                )),
                k || r.deferEvaluation || u(),
                w && p() && w.nodeType && (x = function() {
                    f.a.C.Pb(w, x),
                    a()
                }
                ,
                f.a.C.fa(w, x)),
                c
            }
            ,
            f.sc = function(e) {
                return f.Ta(e, f.j)
            }
            ,
            d = f.r.Ac,
            f.j[d] = f.r,
            f.j.fn = {
                equalityComparer: u
            },
            f.j.fn[d] = f.j,
            f.a.za && f.a.Fa(f.j.fn, f.Q.fn),
            f.b("dependentObservable", f.j),
            f.b("computed", f.j),
            f.b("isComputed", f.sc),
            f.Nb = function(e, t) {
                return "function" == typeof e ? f.w(e, t, {
                    pure: !0
                }) : (e = f.a.extend({}, e),
                e.pure = !0,
                f.w(e, t))
            }
            ,
            f.b("pureComputed", f.Nb),
            function() {
                function t(i, o, a) {
                    if (a = a || new r,
                    i = o(i),
                    "object" != typeof i || null  === i || i === e || i instanceof Date || i instanceof String || i instanceof Number || i instanceof Boolean)
                        return i;
                    var s = i instanceof Array ? [] : {};
                    return a.save(i, s),
                    n(i, function(n) {
                        var r = o(i[n]);
                        switch (typeof r) {
                        case "boolean":
                        case "number":
                        case "string":
                        case "function":
                            s[n] = r;
                            break;
                        case "object":
                        case "undefined":
                            var u = a.get(r);
                            s[n] = u !== e ? u : t(r, o, a)
                        }
                    }),
                    s
                }
                function n(e, t) {
                    if (e instanceof Array) {
                        for (var n = 0; n < e.length; n++)
                            t(n);
                        "function" == typeof e.toJSON && t("toJSON")
                    } else
                        for (n in e)
                            t(n)
                }
                function r() {
                    this.keys = [],
                    this.mb = []
                }
                f.Vb = function(e) {
                    if (0 == arguments.length)
                        throw Error("When calling ko.toJS, pass the object you want to convert.");
                    return t(e, function(e) {
                        for (var t = 0; f.F(e) && 10 > t; t++)
                            e = e();
                        return e
                    })
                }
                ,
                f.toJSON = function(e, t, n) {
                    return e = f.Vb(e),
                    f.a.jb(e, t, n)
                }
                ,
                r.prototype = {
                    save: function(e, t) {
                        var n = f.a.m(this.keys, e);
                        n >= 0 ? this.mb[n] = t : (this.keys.push(e),
                        this.mb.push(t))
                    },
                    get: function(t) {
                        return t = f.a.m(this.keys, t),
                        t >= 0 ? this.mb[t] : e
                    }
                }
            }(),
            f.b("toJS", f.Vb),
            f.b("toJSON", f.toJSON),
            function() {
                f.i = {
                    s: function(t) {
                        switch (f.a.v(t)) {
                        case "option":
                            return !0 === t.__ko__hasDomDataOptionValue__ ? f.a.f.get(t, f.d.options.ab) : 7 >= f.a.M ? t.getAttributeNode("value") && t.getAttributeNode("value").specified ? t.value : t.text : t.value;
                        case "select":
                            return 0 <= t.selectedIndex ? f.i.s(t.options[t.selectedIndex]) : e;
                        default:
                            return t.value
                        }
                    },
                    Y: function(t, n, r) {
                        switch (f.a.v(t)) {
                        case "option":
                            switch (typeof n) {
                            case "string":
                                f.a.f.set(t, f.d.options.ab, e),
                                "__ko__hasDomDataOptionValue__" in t && delete t.__ko__hasDomDataOptionValue__,
                                t.value = n;
                                break;
                            default:
                                f.a.f.set(t, f.d.options.ab, n),
                                t.__ko__hasDomDataOptionValue__ = !0,
                                t.value = "number" == typeof n ? n : ""
                            }
                            break;
                        case "select":
                            ("" === n || null  === n) && (n = e);
                            for (var i, o = -1, a = 0, s = t.options.length; s > a; ++a)
                                if (i = f.i.s(t.options[a]),
                                i == n || "" == i && n === e) {
                                    o = a;
                                    break
                                }
                            (r || o >= 0 || n === e && 1 < t.size) && (t.selectedIndex = o);
                            break;
                        default:
                            (null  === n || n === e) && (n = ""),
                            t.value = n
                        }
                    }
                }
            }(),
            f.b("selectExtensions", f.i),
            f.b("selectExtensions.readValue", f.i.s),
            f.b("selectExtensions.writeValue", f.i.Y),
            f.h = function() {
                function e(e) {
                    e = f.a.ib(e),
                    123 === e.charCodeAt(0) && (e = e.slice(1, -1));
                    var t, n = [], a = e.match(r), s = [], u = 0;
                    if (a) {
                        a.push(",");
                        for (var c, l = 0; c = a[l]; ++l) {
                            var p = c.charCodeAt(0);
                            if (44 === p) {
                                if (0 >= u) {
                                    n.push(t && s.length ? {
                                        key: t,
                                        value: s.join("")
                                    } : {
                                        unknown: t || s.join("")
                                    }),
                                    t = u = 0,
                                    s = [];
                                    continue
                                }
                            } else if (58 === p) {
                                if (!u && !t && 1 === s.length) {
                                    t = s.pop();
                                    continue
                                }
                            } else
                                47 === p && l && 1 < c.length ? (p = a[l - 1].match(i)) && !o[p[0]] && (e = e.substr(e.indexOf(c) + 1),
                                a = e.match(r),
                                a.push(","),
                                l = -1,
                                c = "/") : 40 === p || 123 === p || 91 === p ? ++u : 41 === p || 125 === p || 93 === p ? --u : t || s.length || 34 !== p && 39 !== p || (c = c.slice(1, -1));
                            s.push(c)
                        }
                    }
                    return n
                }
                var t = ["true", "false", "null", "undefined"]
                  , n = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i
                  , r = RegExp("\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|/(?:[^/\\\\]|\\\\.)*/w*|[^\\s:,/][^,\"'{}()/:[\\]]*[^\\s,\"'{}()/:[\\]]|[^\\s]", "g")
                  , i = /[\])"'A-Za-z0-9_$]+$/
                  , o = {
                    "in": 1,
                    "return": 1,
                    "typeof": 1
                }
                  , a = {};
                return {
                    ka: [],
                    V: a,
                    bb: e,
                    Ea: function(r, i) {
                        function o(e, r) {
                            var i;
                            if (!l) {
                                var p = f.getBindingHandler(e);
                                if (p && p.preprocess && !(r = p.preprocess(r, e, o)))
                                    return;
                                (p = a[e]) && (i = r,
                                0 <= f.a.m(t, i) ? i = !1 : (p = i.match(n),
                                i = null  === p ? !1 : p[1] ? "Object(" + p[1] + ")" + p[2] : i),
                                p = i),
                                p && u.push("'" + e + "':function(_z){" + i + "=_z}")
                            }
                            c && (r = "function(){return " + r + " }"),
                            s.push("'" + e + "':" + r)
                        }
                        i = i || {};
                        var s = []
                          , u = []
                          , c = i.valueAccessors
                          , l = i.bindingParams
                          , p = "string" == typeof r ? e(r) : r;
                        return f.a.o(p, function(e) {
                            o(e.key || e.unknown, e.value)
                        }),
                        u.length && o("_ko_property_writers", "{" + u.join(",") + " }"),
                        s.join(",")
                    },
                    vc: function(e, t) {
                        for (var n = 0; n < e.length; n++)
                            if (e[n].key == t)
                                return !0;
                        return !1
                    },
                    ra: function(e, t, n, r, i) {
                        e && f.F(e) ? !f.Da(e) || i && e.B() === r || e(r) : (e = t.get("_ko_property_writers")) && e[n] && e[n](r)
                    }
                }
            }(),
            f.b("expressionRewriting", f.h),
            f.b("expressionRewriting.bindingRewriteValidators", f.h.ka),
            f.b("expressionRewriting.parseObjectLiteral", f.h.bb),
            f.b("expressionRewriting.preProcessBindings", f.h.Ea),
            f.b("expressionRewriting._twoWayBindings", f.h.V),
            f.b("jsonExpressionRewriting", f.h),
            f.b("jsonExpressionRewriting.insertPropertyAccessorsIntoJson", f.h.Ea),
            function() {
                function e(e) {
                    return 8 == e.nodeType && a.test(o ? e.text : e.nodeValue)
                }
                function t(e) {
                    return 8 == e.nodeType && s.test(o ? e.text : e.nodeValue)
                }
                function r(n, r) {
                    for (var i = n, o = 1, a = []; i = i.nextSibling; ) {
                        if (t(i) && (o--,
                        0 === o))
                            return a;
                        a.push(i),
                        e(i) && o++
                    }
                    if (!r)
                        throw Error("Cannot find closing comment tag to match: " + n.nodeValue);
                    return null
                }
                function i(e, t) {
                    var n = r(e, t);
                    return n ? 0 < n.length ? n[n.length - 1].nextSibling : e.nextSibling : null
                }
                var o = n && "<!--test-->" === n.createComment("test").text
                  , a = o ? /^\x3c!--\s*ko(?:\s+([\s\S]+))?\s*--\x3e$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/
                  , s = o ? /^\x3c!--\s*\/ko\s*--\x3e$/ : /^\s*\/ko\s*$/
                  , u = {
                    ul: !0,
                    ol: !0
                };
                f.e = {
                    R: {},
                    childNodes: function(t) {
                        return e(t) ? r(t) : t.childNodes
                    },
                    ma: function(t) {
                        if (e(t)) {
                            t = f.e.childNodes(t);
                            for (var n = 0, r = t.length; r > n; n++)
                                f.removeNode(t[n])
                        } else
                            f.a.Ra(t)
                    },
                    T: function(t, n) {
                        if (e(t)) {
                            f.e.ma(t);
                            for (var r = t.nextSibling, i = 0, o = n.length; o > i; i++)
                                r.parentNode.insertBefore(n[i], r)
                        } else
                            f.a.T(t, n)
                    },
                    Mb: function(t, n) {
                        e(t) ? t.parentNode.insertBefore(n, t.nextSibling) : t.firstChild ? t.insertBefore(n, t.firstChild) : t.appendChild(n)
                    },
                    Fb: function(t, n, r) {
                        r ? e(t) ? t.parentNode.insertBefore(n, r.nextSibling) : r.nextSibling ? t.insertBefore(n, r.nextSibling) : t.appendChild(n) : f.e.Mb(t, n)
                    },
                    firstChild: function(n) {
                        return e(n) ? !n.nextSibling || t(n.nextSibling) ? null  : n.nextSibling : n.firstChild
                    },
                    nextSibling: function(n) {
                        return e(n) && (n = i(n)),
                        n.nextSibling && t(n.nextSibling) ? null  : n.nextSibling
                    },
                    oc: e,
                    Fc: function(e) {
                        return (e = (o ? e.text : e.nodeValue).match(a)) ? e[1] : null
                    },
                    Kb: function(n) {
                        if (u[f.a.v(n)]) {
                            var r = n.firstChild;
                            if (r)
                                do
                                    if (1 === r.nodeType) {
                                        var o;
                                        o = r.firstChild;
                                        var a = null ;
                                        if (o)
                                            do
                                                if (a)
                                                    a.push(o);
                                                else if (e(o)) {
                                                    var s = i(o, !0);
                                                    s ? o = s : a = [o]
                                                } else
                                                    t(o) && (a = [o]);
                                            while (o = o.nextSibling);if (o = a)
                                            for (a = r.nextSibling,
                                            s = 0; s < o.length; s++)
                                                a ? n.insertBefore(o[s], a) : n.appendChild(o[s])
                                    }
                                while (r = r.nextSibling)
                        }
                    }
                }
            }(),
            f.b("virtualElements", f.e),
            f.b("virtualElements.allowedBindings", f.e.R),
            f.b("virtualElements.emptyNode", f.e.ma),
            f.b("virtualElements.insertAfter", f.e.Fb),
            f.b("virtualElements.prepend", f.e.Mb),
            f.b("virtualElements.setDomNodeChildren", f.e.T),
            function() {
                f.L = function() {
                    this.ec = {}
                }
                ,
                f.a.extend(f.L.prototype, {
                    nodeHasBindings: function(e) {
                        switch (e.nodeType) {
                        case 1:
                            return null  != e.getAttribute("data-bind") || f.g.getComponentNameForNode(e);
                        case 8:
                            return f.e.oc(e);
                        default:
                            return !1
                        }
                    },
                    getBindings: function(e, t) {
                        var n = this.getBindingsString(e, t)
                          , n = n ? this.parseBindingsString(n, t, e) : null ;
                        return f.g.sb(n, e, t, !1)
                    },
                    getBindingAccessors: function(e, t) {
                        var n = this.getBindingsString(e, t)
                          , n = n ? this.parseBindingsString(n, t, e, {
                            valueAccessors: !0
                        }) : null ;
                        return f.g.sb(n, e, t, !0)
                    },
                    getBindingsString: function(e) {
                        switch (e.nodeType) {
                        case 1:
                            return e.getAttribute("data-bind");
                        case 8:
                            return f.e.Fc(e);
                        default:
                            return null
                        }
                    },
                    parseBindingsString: function(e, t, n, r) {
                        try {
                            var i, o = this.ec, a = e + (r && r.valueAccessors || "");
                            if (!(i = o[a])) {
                                var s, u = "with($context){with($data||{}){return{" + f.h.Ea(e, r) + "}}}";
                                s = new Function("$context","$element",u),
                                i = o[a] = s
                            }
                            return i(t, n)
                        } catch (c) {
                            throw (c.message = "Unable to parse bindings.\nBindings value: " + e + "\nMessage: " + c.message, c)
                        }
                    }
                }),
                f.L.instance = new f.L
            }(),
            f.b("bindingProvider", f.L),
            function() {
                function n(e) {
                    return function() {
                        return e
                    }
                }
                function r(e) {
                    return e()
                }
                function o(e) {
                    return f.a.pa(f.k.u(e), function(t, n) {
                        return function() {
                            return e()[n]
                        }
                    })
                }
                function a(e, t, r) {
                    return "function" == typeof e ? o(e.bind(null , t, r)) : f.a.pa(e, n)
                }
                function s(e, t) {
                    return o(this.getBindings.bind(this, e, t))
                }
                function u(e, t, n) {
                    var r, i = f.e.firstChild(t), o = f.L.instance, a = o.preprocessNode;
                    if (a) {
                        for (; r = i; )
                            i = f.e.nextSibling(r),
                            a.call(o, r);
                        i = f.e.firstChild(t)
                    }
                    for (; r = i; )
                        i = f.e.nextSibling(r),
                        c(e, r, n)
                }
                function c(e, t, n) {
                    var r = !0
                      , i = 1 === t.nodeType;
                    i && f.e.Kb(t),
                    (i && n || f.L.instance.nodeHasBindings(t)) && (r = p(t, null , e, n).shouldBindDescendants),
                    r && !d[f.a.v(t)] && u(e, t, !i)
                }
                function l(e) {
                    var t = []
                      , n = {}
                      , r = [];
                    return f.a.A(e, function i(o) {
                        if (!n[o]) {
                            var a = f.getBindingHandler(o);
                            a && (a.after && (r.push(o),
                            f.a.o(a.after, function(t) {
                                if (e[t]) {
                                    if (-1 !== f.a.m(r, t))
                                        throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + r.join(", "));
                                    i(t)
                                }
                            }),
                            r.length--),
                            t.push({
                                key: o,
                                Eb: a
                            })),
                            n[o] = !0
                        }
                    }),
                    t
                }
                function p(t, n, i, o) {
                    var a = f.a.f.get(t, m);
                    if (!n) {
                        if (a)
                            throw Error("You cannot apply bindings multiple times to the same element.");
                        f.a.f.set(t, m, !0)
                    }
                    !a && o && f.Tb(t, i);
                    var u;
                    if (n && "function" != typeof n)
                        u = n;
                    else {
                        var c = f.L.instance
                          , p = c.getBindingAccessors || s
                          , h = f.j(function() {
                            return (u = n ? n(i, t) : p.call(c, t, i)) && i.K && i.K(),
                            u
                        }, null , {
                            q: t
                        });
                        u && h.$() || (h = null )
                    }
                    var d;
                    if (u) {
                        var g = h ? function(e) {
                            return function() {
                                return r(h()[e])
                            }
                        }
                         : function(e) {
                            return u[e]
                        }
                          , v = function() {
                            return f.a.pa(h ? h() : u, r)
                        }
                        ;
                        v.get = function(e) {
                            return u[e] && r(g(e))
                        }
                        ,
                        v.has = function(e) {
                            return e in u
                        }
                        ,
                        o = l(u),
                        f.a.o(o, function(n) {
                            var r = n.Eb.init
                              , o = n.Eb.update
                              , a = n.key;
                            if (8 === t.nodeType && !f.e.R[a])
                                throw Error("The binding '" + a + "' cannot be used with virtual elements");
                            try {
                                "function" == typeof r && f.k.u(function() {
                                    var n = r(t, g(a), v, i.$data, i);
                                    if (n && n.controlsDescendantBindings) {
                                        if (d !== e)
                                            throw Error("Multiple bindings (" + d + " and " + a + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
                                        d = a
                                    }
                                }),
                                "function" == typeof o && f.j(function() {
                                    o(t, g(a), v, i.$data, i)
                                }, null , {
                                    q: t
                                })
                            } catch (s) {
                                throw (s.message = 'Unable to process binding "' + a + ": " + u[a] + '"\nMessage: ' + s.message, s)
                            }
                        })
                    }
                    return {
                        shouldBindDescendants: d === e
                    }
                }
                function h(e) {
                    return e && e instanceof f.N ? e : new f.N(e)
                }
                f.d = {};
                var d = {
                    script: !0,
                    textarea: !0
                };
                f.getBindingHandler = function(e) {
                    return f.d[e]
                }
                ,
                f.N = function(t, n, r, i) {
                    var o, a = this, s = "function" == typeof t && !f.F(t), u = f.j(function() {
                        var e = s ? t() : t
                          , o = f.a.c(e);
                        return n ? (n.K && n.K(),
                        f.a.extend(a, n),
                        u && (a.K = u)) : (a.$parents = [],
                        a.$root = o,
                        a.ko = f),
                        a.$rawData = e,
                        a.$data = o,
                        r && (a[r] = o),
                        i && i(a, n, o),
                        a.$data
                    }, null , {
                        Pa: function() {
                            return o && !f.a.tb(o)
                        },
                        q: !0
                    });
                    u.$() && (a.K = u,
                    u.equalityComparer = null ,
                    o = [],
                    u.Zb = function(t) {
                        o.push(t),
                        f.a.C.fa(t, function(t) {
                            f.a.ya(o, t),
                            o.length || (u.p(),
                            a.K = u = e)
                        })
                    }
                    )
                }
                ,
                f.N.prototype.createChildContext = function(e, t, n) {
                    return new f.N(e,this,t,function(e, t) {
                        e.$parentContext = t,
                        e.$parent = t.$data,
                        e.$parents = (t.$parents || []).slice(0),
                        e.$parents.unshift(e.$parent),
                        n && n(e)
                    }
                    )
                }
                ,
                f.N.prototype.extend = function(e) {
                    return new f.N(this.K || this.$data,this,null ,function(t, n) {
                        t.$rawData = n.$rawData,
                        f.a.extend(t, "function" == typeof e ? e() : e)
                    }
                    )
                }
                ;
                var m = f.a.f.I()
                  , g = f.a.f.I();
                f.Tb = function(e, t) {
                    return 2 != arguments.length ? f.a.f.get(e, g) : (f.a.f.set(e, g, t),
                    void (t.K && t.K.Zb(e)))
                }
                ,
                f.va = function(e, t, n) {
                    return 1 === e.nodeType && f.e.Kb(e),
                    p(e, t, h(n), !0)
                }
                ,
                f.cc = function(e, t, n) {
                    return n = h(n),
                    f.va(e, a(t, n, e), n)
                }
                ,
                f.Ja = function(e, t) {
                    1 !== t.nodeType && 8 !== t.nodeType || u(h(e), t, !0)
                }
                ,
                f.ub = function(e, n) {
                    if (!i && t.jQuery && (i = t.jQuery),
                    n && 1 !== n.nodeType && 8 !== n.nodeType)
                        throw Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
                    n = n || t.document.body,
                    c(h(e), n, !0)
                }
                ,
                f.Oa = function(t) {
                    switch (t.nodeType) {
                    case 1:
                    case 8:
                        var n = f.Tb(t);
                        if (n)
                            return n;
                        if (t.parentNode)
                            return f.Oa(t.parentNode)
                    }
                    return e
                }
                ,
                f.gc = function(t) {
                    return (t = f.Oa(t)) ? t.$data : e
                }
                ,
                f.b("bindingHandlers", f.d),
                f.b("applyBindings", f.ub),
                f.b("applyBindingsToDescendants", f.Ja),
                f.b("applyBindingAccessorsToNode", f.va),
                f.b("applyBindingsToNode", f.cc),
                f.b("contextFor", f.Oa),
                f.b("dataFor", f.gc)
            }(),
            function(e) {
                function t(t, r) {
                    var a, s = i.hasOwnProperty(t) ? i[t] : e;
                    s ? s.U(r) : (s = i[t] = new f.Q,
                    s.U(r),
                    n(t, function(e, n) {
                        var r = !(!n || !n.synchronous);
                        o[t] = {
                            definition: e,
                            tc: r
                        },
                        delete i[t],
                        a || r ? s.notifySubscribers(e) : setTimeout(function() {
                            s.notifySubscribers(e)
                        }, 0)
                    }),
                    a = !0)
                }
                function n(e, t) {
                    r("getConfig", [e], function(n) {
                        n ? r("loadComponent", [e, n], function(e) {
                            t(e, n)
                        }) : t(null , null )
                    })
                }
                function r(t, n, i, o) {
                    o || (o = f.g.loaders.slice(0));
                    var a = o.shift();
                    if (a) {
                        var s = a[t];
                        if (s) {
                            var u = !1;
                            if (s.apply(a, n.concat(function(e) {
                                u ? i(null ) : null  !== e ? i(e) : r(t, n, i, o)
                            })) !== e && (u = !0,
                            !a.suppressLoaderExceptions))
                                throw Error("Component loaders must supply values by invoking the callback, not by returning values synchronously.")
                        } else
                            r(t, n, i, o)
                    } else
                        i(null )
                }
                var i = {}
                  , o = {};
                f.g = {
                    get: function(n, r) {
                        var i = o.hasOwnProperty(n) ? o[n] : e;
                        i ? i.tc ? f.k.u(function() {
                            r(i.definition)
                        }) : setTimeout(function() {
                            r(i.definition)
                        }, 0) : t(n, r)
                    },
                    zb: function(e) {
                        delete o[e]
                    },
                    ob: r
                },
                f.g.loaders = [],
                f.b("components", f.g),
                f.b("components.get", f.g.get),
                f.b("components.clearCachedDefinition", f.g.zb)
            }(),
            function() {
                function e(e, t, n, r) {
                    function i() {
                        0 === --s && r(o)
                    }
                    var o = {}
                      , s = 2
                      , u = n.template;
                    n = n.viewModel,
                    u ? a(t, u, function(t) {
                        f.g.ob("loadTemplate", [e, t], function(e) {
                            o.template = e,
                            i()
                        })
                    }) : i(),
                    n ? a(t, n, function(t) {
                        f.g.ob("loadViewModel", [e, t], function(e) {
                            o[l] = e,
                            i()
                        })
                    }) : i()
                }
                function r(e, t, n) {
                    if ("function" == typeof t)
                        n(function(e) {
                            return new t(e)
                        });
                    else if ("function" == typeof t[l])
                        n(t[l]);
                    else if ("instance" in t) {
                        var i = t.instance;
                        n(function() {
                            return i
                        })
                    } else
                        "viewModel" in t ? r(e, t.viewModel, n) : e("Unknown viewModel value: " + t)
                }
                function i(e) {
                    switch (f.a.v(e)) {
                    case "script":
                        return f.a.ca(e.text);
                    case "textarea":
                        return f.a.ca(e.value);
                    case "template":
                        if (o(e.content))
                            return f.a.la(e.content.childNodes)
                    }
                    return f.a.la(e.childNodes)
                }
                function o(e) {
                    return t.DocumentFragment ? e instanceof DocumentFragment : e && 11 === e.nodeType
                }
                function a(e, n, r) {
                    "string" == typeof n.require ? s || t.require ? (s || t.require)([n.require], r) : e("Uses require, but no AMD loader is present") : r(n)
                }
                function u(e) {
                    return function(t) {
                        throw Error("Component '" + e + "': " + t)
                    }
                }
                var c = {};
                f.g.register = function(e, t) {
                    if (!t)
                        throw Error("Invalid configuration for " + e);
                    if (f.g.Xa(e))
                        throw Error("Component " + e + " is already registered");
                    c[e] = t
                }
                ,
                f.g.Xa = function(e) {
                    return e in c
                }
                ,
                f.g.Ec = function(e) {
                    delete c[e],
                    f.g.zb(e)
                }
                ,
                f.g.Ab = {
                    getConfig: function(e, t) {
                        t(c.hasOwnProperty(e) ? c[e] : null )
                    },
                    loadComponent: function(t, n, r) {
                        var i = u(t);
                        a(i, n, function(n) {
                            e(t, i, n, r)
                        })
                    },
                    loadTemplate: function(e, r, a) {
                        if (e = u(e),
                        "string" == typeof r)
                            a(f.a.ca(r));
                        else if (r instanceof Array)
                            a(r);
                        else if (o(r))
                            a(f.a.O(r.childNodes));
                        else if (r.element)
                            if (r = r.element,
                            t.HTMLElement ? r instanceof HTMLElement : r && r.tagName && 1 === r.nodeType)
                                a(i(r));
                            else if ("string" == typeof r) {
                                var s = n.getElementById(r);
                                s ? a(i(s)) : e("Cannot find element with ID " + r)
                            } else
                                e("Unknown element type: " + r);
                        else
                            e("Unknown template value: " + r)
                    },
                    loadViewModel: function(e, t, n) {
                        r(u(e), t, n)
                    }
                };
                var l = "createViewModel";
                f.b("components.register", f.g.register),
                f.b("components.isRegistered", f.g.Xa),
                f.b("components.unregister", f.g.Ec),
                f.b("components.defaultLoader", f.g.Ab),
                f.g.loaders.push(f.g.Ab),
                f.g.$b = c
            }(),
            function() {
                function e(e, n) {
                    var r = e.getAttribute("params");
                    if (r) {
                        var r = t.parseBindingsString(r, n, e, {
                            valueAccessors: !0,
                            bindingParams: !0
                        })
                          , r = f.a.pa(r, function(t) {
                            return f.w(t, null , {
                                q: e
                            })
                        })
                          , i = f.a.pa(r, function(t) {
                            var n = t.B();
                            return t.$() ? f.w({
                                read: function() {
                                    return f.a.c(t())
                                },
                                write: f.Da(n) && function(e) {
                                    t()(e)
                                }
                                ,
                                q: e
                            }) : n
                        });
                        return i.hasOwnProperty("$raw") || (i.$raw = r),
                        i
                    }
                    return {
                        $raw: {}
                    }
                }
                f.g.getComponentNameForNode = function(e) {
                    return e = f.a.v(e),
                    f.g.Xa(e) && e
                }
                ,
                f.g.sb = function(t, n, r, i) {
                    if (1 === n.nodeType) {
                        var o = f.g.getComponentNameForNode(n);
                        if (o) {
                            if (t = t || {},
                            t.component)
                                throw Error('Cannot use the "component" binding on a custom element matching a component');
                            var a = {
                                name: o,
                                params: e(n, r)
                            };
                            t.component = i ? function() {
                                return a
                            }
                             : a
                        }
                    }
                    return t
                }
                ;
                var t = new f.L;
                9 > f.a.M && (f.g.register = function(e) {
                    return function(t) {
                        return n.createElement(t),
                        e.apply(this, arguments)
                    }
                }(f.g.register),
                n.createDocumentFragment = function(e) {
                    return function() {
                        var t, n = e(), r = f.g.$b;
                        for (t in r)
                            r.hasOwnProperty(t) && n.createElement(t);
                        return n
                    }
                }(n.createDocumentFragment))
            }(),
            function(e) {
                function t(e, t, n) {
                    if (t = t.template,
                    !t)
                        throw Error("Component '" + e + "' has no template");
                    e = f.a.la(t),
                    f.e.T(n, e)
                }
                function n(e, t, n, r) {
                    var i = e.createViewModel;
                    return i ? i.call(e, r, {
                        element: t,
                        templateNodes: n
                    }) : r
                }
                var r = 0;
                f.d.component = {
                    init: function(i, o, a, s, u) {
                        function c() {
                            var e = l && l.dispose;
                            "function" == typeof e && e.call(l),
                            p = null
                        }
                        var l, p, h = f.a.O(f.e.childNodes(i));
                        return f.a.C.fa(i, c),
                        f.w(function() {
                            var a, s, d = f.a.c(o());
                            if ("string" == typeof d ? a = d : (a = f.a.c(d.name),
                            s = f.a.c(d.params)),
                            !a)
                                throw Error("No component name specified");
                            var m = p = ++r;
                            f.g.get(a, function(r) {
                                if (p === m) {
                                    if (c(),
                                    !r)
                                        throw Error("Unknown component '" + a + "'");
                                    t(a, r, i);
                                    var o = n(r, i, h, s);
                                    r = u.createChildContext(o, e, function(e) {
                                        e.$component = o,
                                        e.$componentTemplateNodes = h
                                    }),
                                    l = o,
                                    f.Ja(r, i)
                                }
                            })
                        }, null , {
                            q: i
                        }),
                        {
                            controlsDescendantBindings: !0
                        }
                    }
                },
                f.e.R.component = !0
            }();
            var g = {
                "class": "className",
                "for": "htmlFor"
            };
            f.d.attr = {
                update: function(t, n) {
                    var r = f.a.c(n()) || {};
                    f.a.A(r, function(n, r) {
                        r = f.a.c(r);
                        var i = !1 === r || null  === r || r === e;
                        i && t.removeAttribute(n),
                        8 >= f.a.M && n in g ? (n = g[n],
                        i ? t.removeAttribute(n) : t[n] = r) : i || t.setAttribute(n, r.toString()),
                        "name" === n && f.a.Rb(t, i ? "" : r.toString())
                    })
                }
            },
            function() {
                f.d.checked = {
                    after: ["value", "attr"],
                    init: function(t, n, r) {
                        function i() {
                            var e = t.checked
                              , i = p ? a() : e;
                            if (!f.Z.Ca() && (!u || e)) {
                                var o = f.k.u(n);
                                c ? l !== i ? (e && (f.a.ga(o, i, !0),
                                f.a.ga(o, l, !1)),
                                l = i) : f.a.ga(o, i, e) : f.h.ra(o, r, "checked", i, !0)
                            }
                        }
                        function o() {
                            var e = f.a.c(n());
                            t.checked = c ? 0 <= f.a.m(e, a()) : s ? e : a() === e
                        }
                        var a = f.Nb(function() {
                            return r.has("checkedValue") ? f.a.c(r.get("checkedValue")) : r.has("value") ? f.a.c(r.get("value")) : t.value
                        })
                          , s = "checkbox" == t.type
                          , u = "radio" == t.type;
                        if (s || u) {
                            var c = s && f.a.c(n()) instanceof Array
                              , l = c ? a() : e
                              , p = u || c;
                            u && !t.name && f.d.uniqueName.init(t, function() {
                                return !0
                            }),
                            f.w(i, null , {
                                q: t
                            }),
                            f.a.n(t, "click", i),
                            f.w(o, null , {
                                q: t
                            })
                        }
                    }
                },
                f.h.V.checked = !0,
                f.d.checkedValue = {
                    update: function(e, t) {
                        e.value = f.a.c(t())
                    }
                }
            }(),
            f.d.css = {
                update: function(e, t) {
                    var n = f.a.c(t());
                    null  !== n && "object" == typeof n ? f.a.A(n, function(t, n) {
                        n = f.a.c(n),
                        f.a.Ia(e, t, n)
                    }) : (n = String(n || ""),
                    f.a.Ia(e, e.__ko__cssValue, !1),
                    e.__ko__cssValue = n,
                    f.a.Ia(e, n, !0))
                }
            },
            f.d.enable = {
                update: function(e, t) {
                    var n = f.a.c(t());
                    n && e.disabled ? e.removeAttribute("disabled") : n || e.disabled || (e.disabled = !0)
                }
            },
            f.d.disable = {
                update: function(e, t) {
                    f.d.enable.update(e, function() {
                        return !f.a.c(t())
                    })
                }
            },
            f.d.event = {
                init: function(e, t, n, r, i) {
                    var o = t() || {};
                    f.a.A(o, function(o) {
                        "string" == typeof o && f.a.n(e, o, function(e) {
                            var a, s = t()[o];
                            if (s) {
                                try {
                                    var u = f.a.O(arguments);
                                    r = i.$data,
                                    u.unshift(r),
                                    a = s.apply(r, u)
                                } finally {
                                    !0 !== a && (e.preventDefault ? e.preventDefault() : e.returnValue = !1)
                                }
                                !1 === n.get(o + "Bubble") && (e.cancelBubble = !0,
                                e.stopPropagation && e.stopPropagation())
                            }
                        })
                    })
                }
            },
            f.d.foreach = {
                Ib: function(e) {
                    return function() {
                        var t = e()
                          , n = f.a.cb(t);
                        return n && "number" != typeof n.length ? (f.a.c(t),
                        {
                            foreach: n.data,
                            as: n.as,
                            includeDestroyed: n.includeDestroyed,
                            afterAdd: n.afterAdd,
                            beforeRemove: n.beforeRemove,
                            afterRender: n.afterRender,
                            beforeMove: n.beforeMove,
                            afterMove: n.afterMove,
                            templateEngine: f.P.Va
                        }) : {
                            foreach: t,
                            templateEngine: f.P.Va
                        }
                    }
                },
                init: function(e, t) {
                    return f.d.template.init(e, f.d.foreach.Ib(t))
                },
                update: function(e, t, n, r, i) {
                    return f.d.template.update(e, f.d.foreach.Ib(t), n, r, i)
                }
            },
            f.h.ka.foreach = !1,
            f.e.R.foreach = !0,
            f.d.hasfocus = {
                init: function(e, t, n) {
                    function r(r) {
                        e.__ko_hasfocusUpdating = !0;
                        var i = e.ownerDocument;
                        if ("activeElement" in i) {
                            var o;
                            try {
                                o = i.activeElement
                            } catch (a) {
                                o = i.body
                            }
                            r = o === e
                        }
                        i = t(),
                        f.h.ra(i, n, "hasfocus", r, !0),
                        e.__ko_hasfocusLastValue = r,
                        e.__ko_hasfocusUpdating = !1
                    }
                    var i = r.bind(null , !0)
                      , o = r.bind(null , !1);
                    f.a.n(e, "focus", i),
                    f.a.n(e, "focusin", i),
                    f.a.n(e, "blur", o),
                    f.a.n(e, "focusout", o)
                },
                update: function(e, t) {
                    var n = !!f.a.c(t());
                    e.__ko_hasfocusUpdating || e.__ko_hasfocusLastValue === n || (n ? e.focus() : e.blur(),
                    f.k.u(f.a.qa, null , [e, n ? "focusin" : "focusout"]))
                }
            },
            f.h.V.hasfocus = !0,
            f.d.hasFocus = f.d.hasfocus,
            f.h.V.hasFocus = !0,
            f.d.html = {
                init: function() {
                    return {
                        controlsDescendantBindings: !0
                    }
                },
                update: function(e, t) {
                    f.a.gb(e, t())
                }
            },
            p("if"),
            p("ifnot", !1, !0),
            p("with", !0, !1, function(e, t) {
                return e.createChildContext(t)
            });
            var v = {};
            f.d.options = {
                init: function(e) {
                    if ("select" !== f.a.v(e))
                        throw Error("options binding applies only to SELECT elements");
                    for (; 0 < e.length; )
                        e.remove(0);
                    return {
                        controlsDescendantBindings: !0
                    }
                },
                update: function(t, n, r) {
                    function i() {
                        return f.a.xa(t.options, function(e) {
                            return e.selected
                        })
                    }
                    function o(e, t, n) {
                        var r = typeof t;
                        return "function" == r ? t(e) : "string" == r ? e[t] : n
                    }
                    function a(e, n) {
                        if (m && l)
                            f.i.Y(t, f.a.c(r.get("value")), !0);
                        else if (d.length) {
                            var i = 0 <= f.a.m(d, f.i.s(n[0]));
                            f.a.Sb(n[0], i),
                            m && !i && f.k.u(f.a.qa, null , [t, "change"])
                        }
                    }
                    var s = t.multiple
                      , u = 0 != t.length && s ? t.scrollTop : null
                      , c = f.a.c(n())
                      , l = r.get("valueAllowUnset") && r.has("value")
                      , p = r.get("optionsIncludeDestroyed");
                    n = {};
                    var h, d = [];
                    l || (s ? d = f.a.Ka(i(), f.i.s) : 0 <= t.selectedIndex && d.push(f.i.s(t.options[t.selectedIndex]))),
                    c && ("undefined" == typeof c.length && (c = [c]),
                    h = f.a.xa(c, function(t) {
                        return p || t === e || null  === t || !f.a.c(t._destroy)
                    }),
                    r.has("optionsCaption") && (c = f.a.c(r.get("optionsCaption")),
                    null  !== c && c !== e && h.unshift(v)));
                    var m = !1;
                    n.beforeRemove = function(e) {
                        t.removeChild(e)
                    }
                    ,
                    c = a,
                    r.has("optionsAfterRender") && "function" == typeof r.get("optionsAfterRender") && (c = function(t, n) {
                        a(0, n),
                        f.k.u(r.get("optionsAfterRender"), null , [n[0], t !== v ? t : e])
                    }
                    ),
                    f.a.fb(t, h, function(n, i, a) {
                        return a.length && (d = !l && a[0].selected ? [f.i.s(a[0])] : [],
                        m = !0),
                        i = t.ownerDocument.createElement("option"),
                        n === v ? (f.a.Ha(i, r.get("optionsCaption")),
                        f.i.Y(i, e)) : (a = o(n, r.get("optionsValue"), n),
                        f.i.Y(i, f.a.c(a)),
                        n = o(n, r.get("optionsText"), a),
                        f.a.Ha(i, n)),
                        [i]
                    }, n, c),
                    f.k.u(function() {
                        l ? f.i.Y(t, f.a.c(r.get("value")), !0) : (s ? d.length && i().length < d.length : d.length && 0 <= t.selectedIndex ? f.i.s(t.options[t.selectedIndex]) !== d[0] : d.length || 0 <= t.selectedIndex) && f.a.qa(t, "change")
                    }),
                    f.a.kc(t),
                    u && 20 < Math.abs(u - t.scrollTop) && (t.scrollTop = u)
                }
            },
            f.d.options.ab = f.a.f.I(),
            f.d.selectedOptions = {
                after: ["options", "foreach"],
                init: function(e, t, n) {
                    f.a.n(e, "change", function() {
                        var r = t()
                          , i = [];
                        f.a.o(e.getElementsByTagName("option"), function(e) {
                            e.selected && i.push(f.i.s(e))
                        }),
                        f.h.ra(r, n, "selectedOptions", i)
                    })
                },
                update: function(e, t) {
                    if ("select" != f.a.v(e))
                        throw Error("values binding applies only to SELECT elements");
                    var n = f.a.c(t());
                    n && "number" == typeof n.length && f.a.o(e.getElementsByTagName("option"), function(e) {
                        var t = 0 <= f.a.m(n, f.i.s(e));
                        f.a.Sb(e, t)
                    })
                }
            },
            f.h.V.selectedOptions = !0,
            f.d.style = {
                update: function(t, n) {
                    var r = f.a.c(n() || {});
                    f.a.A(r, function(n, r) {
                        r = f.a.c(r),
                        (null  === r || r === e || !1 === r) && (r = ""),
                        t.style[n] = r
                    })
                }
            },
            f.d.submit = {
                init: function(e, t, n, r, i) {
                    if ("function" != typeof t())
                        throw Error("The value for a submit binding must be a function");
                    f.a.n(e, "submit", function(n) {
                        var r, o = t();
                        try {
                            r = o.call(i.$data, e)
                        } finally {
                            !0 !== r && (n.preventDefault ? n.preventDefault() : n.returnValue = !1)
                        }
                    })
                }
            },
            f.d.text = {
                init: function() {
                    return {
                        controlsDescendantBindings: !0
                    }
                },
                update: function(e, t) {
                    f.a.Ha(e, t())
                }
            },
            f.e.R.text = !0,
            function() {
                if (t && t.navigator)
                    var n = function(e) {
                        return e ? parseFloat(e[1]) : void 0
                    }
                      , r = t.opera && t.opera.version && parseInt(t.opera.version())
                      , i = t.navigator.userAgent
                      , o = n(i.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i))
                      , a = n(i.match(/Firefox\/([^ ]*)/));
                if (10 > f.a.M)
                    var s = f.a.f.I()
                      , u = f.a.f.I()
                      , c = function(e) {
                        var t = this.activeElement;
                        (t = t && f.a.f.get(t, u)) && t(e)
                    }
                      , l = function(e, t) {
                        var n = e.ownerDocument;
                        f.a.f.get(n, s) || (f.a.f.set(n, s, !0),
                        f.a.n(n, "selectionchange", c)),
                        f.a.f.set(e, u, t)
                    }
                    ;
                f.d.textInput = {
                    init: function(t, n, i) {
                        function s(e, n) {
                            f.a.n(t, e, n)
                        }
                        function u() {
                            var r = f.a.c(n());
                            (null  === r || r === e) && (r = ""),
                            d !== e && r === d ? setTimeout(u, 4) : t.value !== r && (m = r,
                            t.value = r)
                        }
                        function c() {
                            h || (d = t.value,
                            h = setTimeout(p, 4))
                        }
                        function p() {
                            clearTimeout(h),
                            d = h = e;
                            var r = t.value;
                            m !== r && (m = r,
                            f.h.ra(n(), i, "textInput", r))
                        }
                        var h, d, m = t.value;
                        10 > f.a.M ? (s("propertychange", function(e) {
                            "value" === e.propertyName && p()
                        }),
                        8 == f.a.M && (s("keyup", p),
                        s("keydown", p)),
                        8 <= f.a.M && (l(t, p),
                        s("dragend", c))) : (s("input", p),
                        5 > o && "textarea" === f.a.v(t) ? (s("keydown", c),
                        s("paste", c),
                        s("cut", c)) : 11 > r ? s("keydown", c) : 4 > a && (s("DOMAutoComplete", p),
                        s("dragdrop", p),
                        s("drop", p))),
                        s("change", p),
                        f.w(u, null , {
                            q: t
                        })
                    }
                },
                f.h.V.textInput = !0,
                f.d.textinput = {
                    preprocess: function(e, t, n) {
                        n("textInput", e)
                    }
                }
            }(),
            f.d.uniqueName = {
                init: function(e, t) {
                    if (t()) {
                        var n = "ko_unique_" + ++f.d.uniqueName.fc;
                        f.a.Rb(e, n)
                    }
                }
            },
            f.d.uniqueName.fc = 0,
            f.d.value = {
                after: ["options", "foreach"],
                init: function(e, t, n) {
                    if ("input" != e.tagName.toLowerCase() || "checkbox" != e.type && "radio" != e.type) {
                        var r = ["change"]
                          , i = n.get("valueUpdate")
                          , o = !1
                          , a = null ;
                        i && ("string" == typeof i && (i = [i]),
                        f.a.ia(r, i),
                        r = f.a.wb(r));
                        var s = function() {
                            a = null ,
                            o = !1;
                            var r = t()
                              , i = f.i.s(e);
                            f.h.ra(r, n, "value", i)
                        }
                        ;
                        !f.a.M || "input" != e.tagName.toLowerCase() || "text" != e.type || "off" == e.autocomplete || e.form && "off" == e.form.autocomplete || -1 != f.a.m(r, "propertychange") || (f.a.n(e, "propertychange", function() {
                            o = !0
                        }),
                        f.a.n(e, "focus", function() {
                            o = !1
                        }),
                        f.a.n(e, "blur", function() {
                            o && s()
                        })),
                        f.a.o(r, function(t) {
                            var n = s;
                            f.a.Dc(t, "after") && (n = function() {
                                a = f.i.s(e),
                                setTimeout(s, 0)
                            }
                            ,
                            t = t.substring(5)),
                            f.a.n(e, t, n)
                        });
                        var u = function() {
                            var r = f.a.c(t())
                              , i = f.i.s(e);
                            if (null  !== a && r === a)
                                setTimeout(u, 0);
                            else if (r !== i)
                                if ("select" === f.a.v(e)) {
                                    var o = n.get("valueAllowUnset")
                                      , i = function() {
                                        f.i.Y(e, r, o)
                                    }
                                    ;
                                    i(),
                                    o || r === f.i.s(e) ? setTimeout(i, 0) : f.k.u(f.a.qa, null , [e, "change"])
                                } else
                                    f.i.Y(e, r)
                        }
                        ;
                        f.w(u, null , {
                            q: e
                        })
                    } else
                        f.va(e, {
                            checkedValue: t
                        })
                },
                update: function() {}
            },
            f.h.V.value = !0,
            f.d.visible = {
                update: function(e, t) {
                    var n = f.a.c(t())
                      , r = "none" != e.style.display;
                    n && !r ? e.style.display = "" : !n && r && (e.style.display = "none")
                }
            },
            function(e) {
                f.d[e] = {
                    init: function(t, n, r, i, o) {
                        return f.d.event.init.call(this, t, function() {
                            var t = {};
                            return t[e] = n(),
                            t
                        }, r, i, o)
                    }
                }
            }("click"),
            f.J = function() {}
            ,
            f.J.prototype.renderTemplateSource = function() {
                throw Error("Override renderTemplateSource")
            }
            ,
            f.J.prototype.createJavaScriptEvaluatorBlock = function() {
                throw Error("Override createJavaScriptEvaluatorBlock")
            }
            ,
            f.J.prototype.makeTemplateSource = function(e, t) {
                if ("string" == typeof e) {
                    t = t || n;
                    var r = t.getElementById(e);
                    if (!r)
                        throw Error("Cannot find template with ID " + e);
                    return new f.t.l(r)
                }
                if (1 == e.nodeType || 8 == e.nodeType)
                    return new f.t.ha(e);
                throw Error("Unknown template type: " + e)
            }
            ,
            f.J.prototype.renderTemplate = function(e, t, n, r) {
                return e = this.makeTemplateSource(e, r),
                this.renderTemplateSource(e, t, n, r)
            }
            ,
            f.J.prototype.isTemplateRewritten = function(e, t) {
                return !1 === this.allowTemplateRewriting ? !0 : this.makeTemplateSource(e, t).data("isRewritten")
            }
            ,
            f.J.prototype.rewriteTemplate = function(e, t, n) {
                e = this.makeTemplateSource(e, n),
                t = t(e.text()),
                e.text(t),
                e.data("isRewritten", !0)
            }
            ,
            f.b("templateEngine", f.J),
            f.kb = function() {
                function e(e, t, n, r) {
                    e = f.h.bb(e);
                    for (var i = f.h.ka, o = 0; o < e.length; o++) {
                        var a = e[o].key;
                        if (i.hasOwnProperty(a)) {
                            var s = i[a];
                            if ("function" == typeof s) {
                                if (a = s(e[o].value))
                                    throw Error(a)
                            } else if (!s)
                                throw Error("This template engine does not support the '" + a + "' binding within its templates")
                        }
                    }
                    return n = "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + f.h.Ea(e, {
                        valueAccessors: !0
                    }) + " } })()},'" + n.toLowerCase() + "')",
                    r.createJavaScriptEvaluatorBlock(n) + t
                }
                var t = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi
                  , n = /\x3c!--\s*ko\b\s*([\s\S]*?)\s*--\x3e/g;
                return {
                    lc: function(e, t, n) {
                        t.isTemplateRewritten(e, n) || t.rewriteTemplate(e, function(e) {
                            return f.kb.xc(e, t)
                        }, n)
                    },
                    xc: function(r, i) {
                        return r.replace(t, function(t, n, r, o, a) {
                            return e(a, n, r, i)
                        }).replace(n, function(t, n) {
                            return e(n, "<!-- ko -->", "#comment", i)
                        })
                    },
                    dc: function(e, t) {
                        return f.H.$a(function(n, r) {
                            var i = n.nextSibling;
                            i && i.nodeName.toLowerCase() === t && f.va(i, e, r)
                        })
                    }
                }
            }(),
            f.b("__tr_ambtns", f.kb.dc),
            function() {
                f.t = {},
                f.t.l = function(e) {
                    this.l = e
                }
                ,
                f.t.l.prototype.text = function() {
                    var e = f.a.v(this.l)
                      , e = "script" === e ? "text" : "textarea" === e ? "value" : "innerHTML";
                    if (0 == arguments.length)
                        return this.l[e];
                    var t = arguments[0];
                    "innerHTML" === e ? f.a.gb(this.l, t) : this.l[e] = t
                }
                ;
                var t = f.a.f.I() + "_";
                f.t.l.prototype.data = function(e) {
                    return 1 === arguments.length ? f.a.f.get(this.l, t + e) : void f.a.f.set(this.l, t + e, arguments[1])
                }
                ;
                var n = f.a.f.I();
                f.t.ha = function(e) {
                    this.l = e
                }
                ,
                f.t.ha.prototype = new f.t.l,
                f.t.ha.prototype.text = function() {
                    if (0 == arguments.length) {
                        var t = f.a.f.get(this.l, n) || {};
                        return t.lb === e && t.Na && (t.lb = t.Na.innerHTML),
                        t.lb
                    }
                    f.a.f.set(this.l, n, {
                        lb: arguments[0]
                    })
                }
                ,
                f.t.l.prototype.nodes = function() {
                    return 0 == arguments.length ? (f.a.f.get(this.l, n) || {}).Na : void f.a.f.set(this.l, n, {
                        Na: arguments[0]
                    })
                }
                ,
                f.b("templateSources", f.t),
                f.b("templateSources.domElement", f.t.l),
                f.b("templateSources.anonymousTemplate", f.t.ha)
            }(),
            function() {
                function t(e, t, n) {
                    var r;
                    for (t = f.e.nextSibling(t); e && (r = e) !== t; )
                        e = f.e.nextSibling(r),
                        n(r, e)
                }
                function n(e, n) {
                    if (e.length) {
                        var r = e[0]
                          , i = e[e.length - 1]
                          , o = r.parentNode
                          , a = f.L.instance
                          , s = a.preprocessNode;
                        if (s) {
                            if (t(r, i, function(e, t) {
                                var n = e.previousSibling
                                  , o = s.call(a, e);
                                o && (e === r && (r = o[0] || t),
                                e === i && (i = o[o.length - 1] || n))
                            }),
                            e.length = 0,
                            !r)
                                return;
                            r === i ? e.push(r) : (e.push(r, i),
                            f.a.na(e, o))
                        }
                        t(r, i, function(e) {
                            1 !== e.nodeType && 8 !== e.nodeType || f.ub(n, e)
                        }),
                        t(r, i, function(e) {
                            1 !== e.nodeType && 8 !== e.nodeType || f.H.Xb(e, [n])
                        }),
                        f.a.na(e, o)
                    }
                }
                function r(e) {
                    return e.nodeType ? e : 0 < e.length ? e[0] : null
                }
                function i(e, t, i, o, s) {
                    s = s || {};
                    var u = (e && r(e) || i || {}).ownerDocument
                      , c = s.templateEngine || a;
                    if (f.kb.lc(i, c, u),
                    i = c.renderTemplate(i, o, s, u),
                    "number" != typeof i.length || 0 < i.length && "number" != typeof i[0].nodeType)
                        throw Error("Template engine must return an array of DOM nodes");
                    switch (u = !1,
                    t) {
                    case "replaceChildren":
                        f.e.T(e, i),
                        u = !0;
                        break;
                    case "replaceNode":
                        f.a.Qb(e, i),
                        u = !0;
                        break;
                    case "ignoreTargetNode":
                        break;
                    default:
                        throw Error("Unknown renderMode: " + t)
                    }
                    return u && (n(i, o),
                    s.afterRender && f.k.u(s.afterRender, null , [i, o.$data])),
                    i
                }
                function o(e, t, n) {
                    return f.F(e) ? e() : "function" == typeof e ? e(t, n) : e
                }
                var a;
                f.hb = function(t) {
                    if (t != e && !(t instanceof f.J))
                        throw Error("templateEngine must inherit from ko.templateEngine");
                    a = t
                }
                ,
                f.eb = function(t, n, s, u, c) {
                    if (s = s || {},
                    (s.templateEngine || a) == e)
                        throw Error("Set a template engine before calling renderTemplate");
                    if (c = c || "replaceChildren",
                    u) {
                        var l = r(u);
                        return f.j(function() {
                            var e = n && n instanceof f.N ? n : new f.N(f.a.c(n))
                              , a = o(t, e.$data, e)
                              , e = i(u, c, a, e, s);
                            "replaceNode" == c && (u = e,
                            l = r(u))
                        }, null , {
                            Pa: function() {
                                return !l || !f.a.Qa(l)
                            },
                            q: l && "replaceNode" == c ? l.parentNode : l
                        })
                    }
                    return f.H.$a(function(e) {
                        f.eb(t, n, s, e, "replaceNode")
                    })
                }
                ,
                f.Cc = function(t, r, a, s, u) {
                    function c(e, t) {
                        n(t, p),
                        a.afterRender && a.afterRender(t, e),
                        p = null
                    }
                    function l(e, n) {
                        p = u.createChildContext(e, a.as, function(e) {
                            e.$index = n
                        });
                        var r = o(t, e, p);
                        return i(null , "ignoreTargetNode", r, p, a)
                    }
                    var p;
                    return f.j(function() {
                        var t = f.a.c(r) || [];
                        "undefined" == typeof t.length && (t = [t]),
                        t = f.a.xa(t, function(t) {
                            return a.includeDestroyed || t === e || null  === t || !f.a.c(t._destroy)
                        }),
                        f.k.u(f.a.fb, null , [s, t, l, a, c])
                    }, null , {
                        q: s
                    })
                }
                ;
                var s = f.a.f.I();
                f.d.template = {
                    init: function(e, t) {
                        var n = f.a.c(t());
                        if ("string" == typeof n || n.name)
                            f.e.ma(e);
                        else {
                            if ("nodes" in n) {
                                if (n = n.nodes || [],
                                f.F(n))
                                    throw Error('The "nodes" option must be a plain, non-observable array.')
                            } else
                                n = f.e.childNodes(e);
                            n = f.a.Jb(n),
                            new f.t.ha(e).nodes(n)
                        }
                        return {
                            controlsDescendantBindings: !0
                        }
                    },
                    update: function(t, n, r, i, o) {
                        var a, u = n();
                        n = f.a.c(u),
                        r = !0,
                        i = null ,
                        "string" == typeof n ? n = {} : (u = n.name,
                        "if" in n && (r = f.a.c(n["if"])),
                        r && "ifnot" in n && (r = !f.a.c(n.ifnot)),
                        a = f.a.c(n.data)),
                        "foreach" in n ? i = f.Cc(u || t, r && n.foreach || [], n, t, o) : r ? (o = "data" in n ? o.createChildContext(a, n.as) : o,
                        i = f.eb(u || t, o, n, t)) : f.e.ma(t),
                        o = i,
                        (a = f.a.f.get(t, s)) && "function" == typeof a.p && a.p(),
                        f.a.f.set(t, s, o && o.$() ? o : e)
                    }
                },
                f.h.ka.template = function(e) {
                    return e = f.h.bb(e),
                    1 == e.length && e[0].unknown || f.h.vc(e, "name") ? null  : "This template engine does not support anonymous templates nested within its templates"
                }
                ,
                f.e.R.template = !0
            }(),
            f.b("setTemplateEngine", f.hb),
            f.b("renderTemplate", f.eb),
            f.a.Cb = function(e, t, n) {
                if (e.length && t.length) {
                    var r, i, o, a, s;
                    for (r = i = 0; (!n || n > r) && (a = e[i]); ++i) {
                        for (o = 0; s = t[o]; ++o)
                            if (a.value === s.value) {
                                a.moved = s.index,
                                s.moved = a.index,
                                t.splice(o, 1),
                                r = o = 0;
                                break
                            }
                        r += o
                    }
                }
            }
            ,
            f.a.Ma = function() {
                function e(e, t, n, r, i) {
                    var o, a, s, u, c, l = Math.min, p = Math.max, h = [], d = e.length, m = t.length, g = m - d || 1, v = d + m + 1;
                    for (o = 0; d >= o; o++)
                        for (u = s,
                        h.push(s = []),
                        c = l(m, o + g),
                        a = p(0, o - 1); c >= a; a++)
                            s[a] = a ? o ? e[o - 1] === t[a - 1] ? u[a - 1] : l(u[a] || v, s[a - 1] || v) + 1 : a + 1 : o + 1;
                    for (l = [],
                    p = [],
                    g = [],
                    o = d,
                    a = m; o || a; )
                        m = h[o][a] - 1,
                        a && m === h[o][a - 1] ? p.push(l[l.length] = {
                            status: n,
                            value: t[--a],
                            index: a
                        }) : o && m === h[o - 1][a] ? g.push(l[l.length] = {
                            status: r,
                            value: e[--o],
                            index: o
                        }) : (--a,
                        --o,
                        i.sparse || l.push({
                            status: "retained",
                            value: t[a]
                        }));
                    return f.a.Cb(p, g, 10 * d),
                    l.reverse()
                }
                return function(t, n, r) {
                    return r = "boolean" == typeof r ? {
                        dontLimitMoves: r
                    } : r || {},
                    t = t || [],
                    n = n || [],
                    t.length <= n.length ? e(t, n, "added", "deleted", r) : e(n, t, "deleted", "added", r)
                }
            }(),
            f.b("utils.compareArrays", f.a.Ma),
            function() {
                function t(t, n, r, i, o) {
                    var a = []
                      , s = f.j(function() {
                        var e = n(r, o, f.a.na(a, t)) || [];
                        0 < a.length && (f.a.Qb(a, e),
                        i && f.k.u(i, null , [r, e, o])),
                        a.length = 0,
                        f.a.ia(a, e)
                    }, null , {
                        q: t,
                        Pa: function() {
                            return !f.a.tb(a)
                        }
                    });
                    return {
                        aa: a,
                        j: s.$() ? s : e
                    }
                }
                var n = f.a.f.I();
                f.a.fb = function(r, i, o, a, s) {
                    function u(e, t) {
                        _ = p[t],
                        v !== t && (w[e] = _),
                        _.Ua(v++),
                        f.a.na(_.aa, r),
                        m.push(_),
                        y.push(_)
                    }
                    function c(e, t) {
                        if (e)
                            for (var n = 0, r = t.length; r > n; n++)
                                t[n] && f.a.o(t[n].aa, function(r) {
                                    e(r, n, t[n].wa)
                                })
                    }
                    i = i || [],
                    a = a || {};
                    var l = f.a.f.get(r, n) === e
                      , p = f.a.f.get(r, n) || []
                      , h = f.a.Ka(p, function(e) {
                        return e.wa
                    })
                      , d = f.a.Ma(h, i, a.dontLimitMoves)
                      , m = []
                      , g = 0
                      , v = 0
                      , b = []
                      , y = [];
                    i = [];
                    for (var _, k, C, w = [], h = [], E = 0; k = d[E]; E++)
                        switch (C = k.moved,
                        k.status) {
                        case "deleted":
                            C === e && (_ = p[g],
                            _.j && _.j.p(),
                            b.push.apply(b, f.a.na(_.aa, r)),
                            a.beforeRemove && (i[E] = _,
                            y.push(_))),
                            g++;
                            break;
                        case "retained":
                            u(E, g++);
                            break;
                        case "added":
                            C !== e ? u(E, C) : (_ = {
                                wa: k.value,
                                Ua: f.r(v++)
                            },
                            m.push(_),
                            y.push(_),
                            l || (h[E] = _))
                        }
                    c(a.beforeMove, w),
                    f.a.o(b, a.beforeRemove ? f.S : f.removeNode);
                    for (var T, E = 0, l = f.e.firstChild(r); _ = y[E]; E++) {
                        for (_.aa || f.a.extend(_, t(r, o, _.wa, s, _.Ua)),
                        g = 0; d = _.aa[g]; l = d.nextSibling,
                        T = d,
                        g++)
                            d !== l && f.e.Fb(r, d, T);
                        !_.rc && s && (s(_.wa, _.aa, _.Ua),
                        _.rc = !0)
                    }
                    c(a.beforeRemove, i),
                    c(a.afterMove, w),
                    c(a.afterAdd, h),
                    f.a.f.set(r, n, m)
                }
            }(),
            f.b("utils.setDomNodeChildrenFromArrayMapping", f.a.fb),
            f.P = function() {
                this.allowTemplateRewriting = !1
            }
            ,
            f.P.prototype = new f.J,
            f.P.prototype.renderTemplateSource = function(e, t, n, r) {
                return (t = (9 > f.a.M ? 0 : e.nodes) ? e.nodes() : null ) ? f.a.O(t.cloneNode(!0).childNodes) : (e = e.text(),
                f.a.ca(e, r))
            }
            ,
            f.P.Va = new f.P,
            f.hb(f.P.Va),
            f.b("nativeTemplateEngine", f.P),
            function() {
                f.Ya = function() {
                    var e = this.uc = function() {
                        if (!i || !i.tmpl)
                            return 0;
                        try {
                            if (0 <= i.tmpl.tag.tmpl.open.toString().indexOf("__"))
                                return 2
                        } catch (e) {}
                        return 1
                    }();
                    this.renderTemplateSource = function(t, r, o, a) {
                        if (a = a || n,
                        o = o || {},
                        2 > e)
                            throw Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
                        var s = t.data("precompiled");
                        return s || (s = t.text() || "",
                        s = i.template(null , "{{ko_with $item.koBindingContext}}" + s + "{{/ko_with}}"),
                        t.data("precompiled", s)),
                        t = [r.$data],
                        r = i.extend({
                            koBindingContext: r
                        }, o.templateOptions),
                        r = i.tmpl(s, t, r),
                        r.appendTo(a.createElement("div")),
                        i.fragments = {},
                        r
                    }
                    ,
                    this.createJavaScriptEvaluatorBlock = function(e) {
                        return "{{ko_code ((function() { return " + e + " })()) }}"
                    }
                    ,
                    this.addTemplate = function(e, t) {
                        n.write("<script type='text/html' id='" + e + "'>" + t + "</script>")
                    }
                    ,
                    e > 0 && (i.tmpl.tag.ko_code = {
                        open: "__.push($1 || '');"
                    },
                    i.tmpl.tag.ko_with = {
                        open: "with($1) {",
                        close: "} "
                    })
                }
                ,
                f.Ya.prototype = new f.J;
                var e = new f.Ya;
                0 < e.uc && f.hb(e),
                f.b("jqueryTmplTemplateEngine", f.Ya)
            }()
        })
    }()
}(),
define("createFragmentFromTemplate", [], function() {
    var e = function(e) {
        var t = document.createElement("div");
        t.innerHTML = e;
        for (var n = document.createDocumentFragment(); t.firstChild; )
            n.appendChild(t.firstChild);
        return n
    }
    ;
    return e
}),
define("loadView", ["Knockout", "createFragmentFromTemplate"], function(e, t) {
    var n = function(n, r, i) {
        r = Cesium.getElement(r);
        var o, a = t(n), s = [];
        for (o = 0; o < a.childNodes.length; ++o)
            s.push(a.childNodes[o]);
        for (r.appendChild(a),
        o = 0; o < s.length; ++o) {
            var u = s[o];
            (1 === u.nodeType || 8 === u.nodeType) && e.applyBindings(i, u)
        }
        return s
    }
    ;
    return n
}),
define("inherit", [], function() {
    var e = function(e, t) {
        function n() {}
        n.prototype = e.prototype,
        t.prototype = new n,
        t.prototype.constructor = t
    }
    ;
    return e
}),
!function(e, t) {
    "use strict";
    function n(e, t) {
        if (!e || "object" != typeof e)
            throw new Error("When calling ko.track, you must pass an object as the first parameter.");
        var n;
        return u(t) ? (t.deep = t.deep || !1,
        t.fields = t.fields || Object.getOwnPropertyNames(e),
        t.lazy = t.lazy || !1,
        s(e, t.fields, t)) : (n = t || Object.getOwnPropertyNames(e),
        s(e, n, {})),
        e
    }
    function r(e) {
        return e.name ? e.name : (e.toString().trim().match(x) || [])[1]
    }
    function i(e) {
        return e && "object" == typeof e && "Object" === r(e.constructor)
    }
    function o(e, n, r) {
        var i = C.isObservable(e)
          , o = !i && Array.isArray(e)
          , a = i ? e : o ? C.observableArray(e) : C.observable(e);
        return r[n] = function() {
            return a
        }
        ,
        (o || i && "push" in a) && f(C, a),
        {
            configurable: !0,
            enumerable: !0,
            get: a,
            set: C.isWriteableObservable(a) ? a : t
        }
    }
    function a(e, t, n) {
        function r(e, t) {
            return i ? t ? i(e) : i : Array.isArray(e) ? (i = C.observableArray(e),
            f(C, i),
            i) : i = C.observable(e)
        }
        if (C.isObservable(e))
            return o(e, t, n);
        var i;
        return n[t] = function() {
            return r(e)
        }
        ,
        {
            configurable: !0,
            enumerable: !0,
            get: function() {
                return r(e)()
            },
            set: function(e) {
                r(e, !0)
            }
        }
    }
    function s(e, t, n) {
        if (t.length) {
            var r = c(e, !0)
              , u = {};
            t.forEach(function(t) {
                if (!(t in r) && Object.getOwnPropertyDescriptor(e, t).configurable !== !1) {
                    var c = e[t];
                    u[t] = (n.lazy ? a : o)(c, t, r),
                    n.deep && i(c) && s(c, Object.keys(c), n)
                }
            }),
            Object.defineProperties(e, u)
        }
    }
    function u(e) {
        return !!e && "object" == typeof e && e.constructor === Object
    }
    function c(e, t) {
        w || (w = T());
        var n = w.get(e);
        return !n && t && (n = {},
        w.set(e, n)),
        n
    }
    function l(e, t) {
        if (w)
            if (1 === arguments.length)
                w["delete"](e);
            else {
                var n = c(e, !1);
                n && t.forEach(function(e) {
                    delete n[e]
                })
            }
    }
    function p(e, t, r) {
        var i = this
          , o = {
            owner: e,
            deferEvaluation: !0
        };
        if ("function" == typeof r)
            o.read = r;
        else {
            if ("value" in r)
                throw new Error('For ko.defineProperty, you must not specify a "value" for the property. You must provide a "get" function.');
            if ("function" != typeof r.get)
                throw new Error('For ko.defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called "get".');
            o.read = r.get,
            o.write = r.set
        }
        return e[t] = i.computed(o),
        n.call(i, e, [t]),
        e
    }
    function f(e, t) {
        var n = null ;
        e.computed(function() {
            n && (n.dispose(),
            n = null );
            var r = t();
            r instanceof Array && (n = h(e, t, r))
        })
    }
    function h(e, t, n) {
        var r = d(e, n);
        return r.subscribe(t)
    }
    function d(e, t) {
        E || (E = T());
        var n = E.get(t);
        if (!n) {
            n = new e.subscribable,
            E.set(t, n);
            var r = {};
            m(t, n, r),
            g(e, t, n, r)
        }
        return n
    }
    function m(e, t, n) {
        ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"].forEach(function(r) {
            var i = e[r];
            e[r] = function() {
                var e = i.apply(this, arguments);
                return n.pause !== !0 && t.notifySubscribers(this),
                e
            }
        })
    }
    function g(e, t, n, r) {
        ["remove", "removeAll", "destroy", "destroyAll", "replace"].forEach(function(i) {
            Object.defineProperty(t, i, {
                enumerable: !1,
                value: function() {
                    var o;
                    r.pause = !0;
                    try {
                        o = e.observableArray.fn[i].apply(e.observableArray(t), arguments)
                    } finally {
                        r.pause = !1
                    }
                    return n.notifySubscribers(t),
                    o
                }
            })
        })
    }
    function v(e, t) {
        if (!e || "object" != typeof e)
            return null ;
        var n = c(e, !1);
        return n && t in n ? n[t]() : null
    }
    function b(e, t) {
        if (!e || "object" != typeof e)
            return !1;
        var n = c(e, !1);
        return !!n && t in n
    }
    function y(e, t) {
        var n = v(e, t);
        n && n.valueHasMutated()
    }
    function _(e) {
        e.track = n,
        e.untrack = l,
        e.getObservable = v,
        e.valueHasMutated = y,
        e.defineProperty = p,
        e.es5 = {
            getAllObservablesForObject: c,
            notifyWhenPresentOrFutureArrayValuesMutate: f,
            isTracked: b
        }
    }
    function k() {
        if ("object" == typeof exports && "object" == typeof module) {
            C = require("Knockout");
            var t = require("../lib/weakmap");
            _(C),
            T = function() {
                return new t
            }
            ,
            module.exports = C
        } else
            "function" == typeof define && define.amd ? define("knockoutes5", ["Knockout"], function(t) {
                return C = t,
                _(t),
                T = function() {
                    return new e.WeakMap
                }
                ,
                t
            }) : "ko" in e && (C = e.ko,
            _(e.ko),
            T = function() {
                return new e.WeakMap
            }
            )
    }
    var C, w, E, T, x = /^function\s*([^\s(]+)/;
    k()
}(this),
void function(e, t, n) {
    function r(e, t, n) {
        return "function" == typeof t && (n = t,
        t = i(n).replace(/_$/, "")),
        c(e, t, {
            configurable: !0,
            writable: !0,
            value: n
        })
    }
    function i(e) {
        return "function" != typeof e ? "" : "_name" in e ? e._name : "name" in e ? e.name : l.call(e).match(h)[1]
    }
    function o(e, t) {
        return t._name = e,
        t
    }
    function a(e) {
        function t(t, i) {
            return i || 2 === arguments.length ? r.set(t, i) : (i = r.get(t),
            i === n && (i = e(t),
            r.set(t, i))),
            i
        }
        var r = new m;
        return e || (e = g),
        t
    }
    var s = Object.getOwnPropertyNames
      , u = "object" == typeof window ? Object.getOwnPropertyNames(window) : []
      , c = Object.defineProperty
      , l = Function.prototype.toString
      , p = Object.create
      , f = Object.prototype.hasOwnProperty
      , h = /^\n?function\s?(\w*)?_?\(/
      , d = function() {
        function e() {
            var e = a()
              , n = {};
            this.unlock = function(r) {
                var i = h(r);
                if (f.call(i, e))
                    return i[e](n);
                var o = p(null , t);
                return c(i, e, {
                    value: function(e) {
                        return e === n ? o : void 0
                    }
                }),
                o
            }
        }
        var t = {
            value: {
                writable: !0,
                value: n
            }
        }
          , i = p(null )
          , a = function() {
            var e = Math.random().toString(36).slice(2);
            return e in i ? a() : i[e] = e
        }
          , l = a()
          , h = function(e) {
            if (f.call(e, l))
                return e[l];
            if (!Object.isExtensible(e))
                throw new TypeError("Object must be extensible");
            var t = p(null );
            return c(e, l, {
                value: t
            }),
            t
        }
        ;
        return r(Object, o("getOwnPropertyNames", function(e) {
            var t, n = Object(e);
            if (n && n.toString && "[object Window]" === n.toString())
                try {
                    t = s(e)
                } catch (r) {
                    t = u
                }
            else
                t = s(e);
            return f.call(e, l) && t.splice(t.indexOf(l), 1),
            t
        })),
        r(e.prototype, o("get", function(e) {
            return this.unlock(e).value
        })),
        r(e.prototype, o("set", function(e, t) {
            this.unlock(e).value = t
        })),
        e
    }()
      , m = function(a) {
        function s(t) {
            return this === e || null  == this || this === s.prototype ? new s(t) : (m(this, new d),
            void v(this, t))
        }
        function u(e) {
            h(e);
            var r = g(this).get(e);
            return r === t ? n : r
        }
        function c(e, r) {
            h(e),
            g(this).set(e, r === n ? t : r)
        }
        function l(e) {
            return h(e),
            g(this).get(e) !== n
        }
        function p(e) {
            h(e);
            var t = g(this)
              , r = t.get(e) !== n;
            return t.set(e, n),
            r
        }
        function f() {
            return g(this),
            "[object WeakMap]"
        }
        var h = function(e) {
            if (null  == e || "object" != typeof e && "function" != typeof e)
                throw new TypeError("Invalid WeakMap key")
        }
          , m = function(e, t) {
            var n = a.unlock(e);
            if (n.value)
                throw new TypeError("Object is already a WeakMap");
            n.value = t
        }
          , g = function(e) {
            var t = a.unlock(e).value;
            if (!t)
                throw new TypeError("WeakMap is not generic");
            return t
        }
          , v = function(e, t) {
            null  !== t && "object" == typeof t && "function" == typeof t.forEach && t.forEach(function(n, r) {
                n instanceof Array && 2 === n.length && c.call(e, t[r][0], t[r][1])
            })
        }
        ;
        u._name = "get",
        c._name = "set",
        l._name = "has",
        f._name = "toString";
        var b = ("" + Object).split("Object")
          , y = o("toString", function() {
            return b[0] + i(this) + b[1]
        });
        r(y, y);
        var _ = {
            __proto__: []
        } instanceof Array ? function(e) {
            e.__proto__ = y
        }
         : function(e) {
            r(e, y)
        }
        ;
        return _(s),
        [f, u, c, l, p].forEach(function(e) {
            r(s.prototype, e),
            _(e)
        }),
        s
    }(new d)
      , g = Object.create ? function() {
        return Object.create(null )
    }
     : function() {
        return {}
    }
    ;
    "undefined" != typeof module ? module.exports = m : "undefined" != typeof exports ? exports.WeakMap = m : "WeakMap" in e || (e.WeakMap = m),
    m.createStorage = a,
    e.WeakMap && (e.WeakMap.createStorage = a)
}(function() {
    return this
}()),
define("UserInterfaceControl", ["Knockout", "knockoutes5"], function(e, t) {
    var n = function(t) {
        if (!Cesium.defined(t))
            throw new Cesium.DeveloperError("terria is required");
        this._terria = t,
        this.name = "Unnamed Control",
        this.text = void 0,
        this.svgIcon = void 0,
        this.svgHeight = void 0,
        this.svgWidth = void 0,
        this.cssClass = void 0,
        this.isActive = !1,
        e.track(this, ["name", "svgIcon", "svgHeight", "svgWidth", "cssClass", "isActive"])
    }
    ;
    return Cesium.defineProperties(n.prototype, {
        terria: {
            get: function() {
                return this._terria
            }
        },
        hasText: {
            get: function() {
                return Cesium.defined(this.text) && "string" == typeof this.text
            }
        }
    }),
    n.prototype.activate = function() {
        throw new DeveloperError("activate must be implemented in the derived class.")
    }
    ,
    n
}),
define("NavigationControl", ["inherit", "UserInterfaceControl"], function(e, t) {
    var n = function(e) {
        t.call(this, e)
    }
    ;
    return e(t, n),
    n.prototype.flyToPosition = function(e, t, n) {
        var r = e.camera
          , i = r.position
          , o = t;
        n = defaultValue(n, 200);
        var a = e.screenSpaceCameraController;
        a.enableInputs = !1,
        e.tweens.add({
            duration: n / 1e3,
            easingFunction: Cesium.Tween.Easing.Sinusoidal.InOut,
            startObject: {
                time: 0
            },
            stopObject: {
                time: 1
            },
            update: function(t) {
                e.isDestroyed() || (e.camera.position.x = Cesium.CesiumMath.lerp(i.x, o.x, t.time),
                e.camera.position.y = Cesium.CesiumMath.lerp(i.y, o.y, t.time),
                e.camera.position.z = Cesium.CesiumMath.lerp(i.z, o.z, t.time))
            },
            complete: function() {
                a.isDestroyed() || (a.enableInputs = !0)
            },
            cancel: function() {
                a.isDestroyed() || (a.enableInputs = !0)
            }
        })
    }
    ,
    n.prototype.getCameraFocus = function(e) {
        var t = new Cesium.Ray(e.camera.positionWC,e.camera.directionWC)
          , n = Cesium.IntersectionTests.rayEllipsoid(t, Cesium.Ellipsoid.WGS84);
        return Cesium.defined(n) ? Cesium.Ray.getPoint(t, n.start) : Cesium.IntersectionTests.grazingAltitudeLocation(t, Cesium.Ellipsoid.WGS84)
    }
    ,
    n
}),
define("svgReset", [], function() {
    return "M 7.5,0 C 3.375,0 0,3.375 0,7.5 0,11.625 3.375,15 7.5,15 c 3.46875,0 6.375,-2.4375 7.21875,-5.625 l -1.96875,0 C 12,11.53125 9.9375,13.125 7.5,13.125 4.40625,13.125 1.875,10.59375 1.875,7.5 1.875,4.40625 4.40625,1.875 7.5,1.875 c 1.59375,0 2.90625,0.65625 3.9375,1.6875 l -3,3 6.5625,0 L 15,0 12.75,2.25 C 11.4375,0.84375 9.5625,0 7.5,0 z"
}),
define("ResetViewNavigationControl", ["inherit", "NavigationControl", "svgReset"], function(e, t, n) {
    var r = function(e) {
        t.call(this, e),
        this.name = "Reset View",
        this.svgIcon = n,
        this.svgHeight = 15,
        this.svgWidth = 15,
        this.cssClass = "navigation-control-icon-reset"
    }
    ;
    return e(t, r),
    r.prototype.resetView = function() {
        this.isActive = !0,
        this.terria.scene.camera.flyTo({
            destination: this.terria.homeView.rectangle,
            duration: 1
        }),
        this.isActive = !1
    }
    ,
    r.prototype.activate = function() {
        this.resetView()
    }
    ,
    r
}),
define("ZoomInNavigationControl", ["inherit", "NavigationControl"], function(e, t) {
    var n = function(e) {
        t.call(this, e),
        this.name = "Zoom In",
        this.text = "+",
        this.cssClass = "navigation-control-icon-zoom-in"
    }
    ;
    e(t, n);
    var r = new Cesium.Cartesian3;
    return n.prototype.zoomIn = function() {
        if (this.isActive = !0,
        Cesium.defined(this.terria.leaflet) && this.terria.leaflet.map.zoomIn(1),
        Cesium.defined(this.terria)) {
            var e = this.terria.scene
              , t = e.camera
              , n = this.getCameraFocus(e)
              , i = Cesium.Cartesian3.subtract(n, t.position, r)
              , o = Cesium.Cartesian3.multiplyByScalar(i, 2 / 3, r)
              , a = Cesium.Cartesian3.add(t.position, o, r);
            this.terria.scene.camera.flyTo({
                destination: a,
                duration: 1,
                orientation : {
                    direction: this.terria.scene.camera.direction,
                    up: this.terria.scene.camera.up
                }
            })
        }
        this.isActive = !1
    }
    ,
    n.prototype.activate = function() {
        this.zoomIn()
    }
    ,
    n
}),
define("ZoomOutNavigationControl", ["inherit", "NavigationControl"], function(e, t) {
    var n = function(e) {
        t.call(this, e),
        this.name = "Zoom Out",
        this.text = "–",
        this.cssClass = "navigation-control-icon-zoom-out"
    }
    ;
    e(t, n);
    var r = new Cesium.Cartesian3;
    return n.prototype.zoomOut = function() {
        if (this.isActive = !0,
        Cesium.defined(this.terria.leaflet) && this.terria.leaflet.map.zoomOut(1),
        Cesium.defined(this.terria)) {
            var e = this.terria.scene
              , t = e.camera
              , n = this.getCameraFocus(e)
              , i = Cesium.Cartesian3.subtract(n, t.position, r)
              , o = Cesium.Cartesian3.multiplyByScalar(i, -2, r)
              , a = Cesium.Cartesian3.add(t.position, o, r);
            this.terria.scene.camera.flyTo({
                destination: a,
                duration: 1,
                orientation : {
                    direction: this.terria.scene.camera.direction,
                    up: this.terria.scene.camera.up
                }
            })
        }
        this.isActive = !1
    }
    ,
    n.prototype.activate = function() {
        this.zoomOut()
    }
    ,
    n
}),
define("svgCompassOuterRing", [], function() {
    return "m 66.5625,0 0,15.15625 3.71875,0 0,-10.40625 5.5,10.40625 4.375,0 0,-15.15625 -3.71875,0 0,10.40625 L 70.9375,0 66.5625,0 z M 72.5,20.21875 c -28.867432,0 -52.28125,23.407738 -52.28125,52.28125 0,28.87351 23.413818,52.3125 52.28125,52.3125 28.86743,0 52.28125,-23.43899 52.28125,-52.3125 0,-28.873512 -23.41382,-52.28125 -52.28125,-52.28125 z m 0,1.75 c 13.842515,0 26.368948,5.558092 35.5,14.5625 l -11.03125,11 0.625,0.625 11.03125,-11 c 8.9199,9.108762 14.4375,21.579143 14.4375,35.34375 0,13.764606 -5.5176,26.22729 -14.4375,35.34375 l -11.03125,-11 -0.625,0.625 11.03125,11 c -9.130866,9.01087 -21.658601,14.59375 -35.5,14.59375 -13.801622,0 -26.321058,-5.53481 -35.4375,-14.5 l 11.125,-11.09375 c 6.277989,6.12179 14.857796,9.90625 24.3125,9.90625 19.241896,0 34.875,-15.629154 34.875,-34.875 0,-19.245847 -15.633104,-34.84375 -34.875,-34.84375 -9.454704,0 -18.034511,3.760884 -24.3125,9.875 L 37.0625,36.4375 C 46.179178,27.478444 58.696991,21.96875 72.5,21.96875 z m -0.875,0.84375 0,13.9375 1.75,0 0,-13.9375 -1.75,0 z M 36.46875,37.0625 47.5625,48.15625 C 41.429794,54.436565 37.65625,63.027539 37.65625,72.5 c 0,9.472461 3.773544,18.055746 9.90625,24.34375 L 36.46875,107.9375 c -8.96721,-9.1247 -14.5,-21.624886 -14.5,-35.4375 0,-13.812615 5.53279,-26.320526 14.5,-35.4375 z M 72.5,39.40625 c 18.297686,0 33.125,14.791695 33.125,33.09375 0,18.302054 -14.827314,33.125 -33.125,33.125 -18.297687,0 -33.09375,-14.822946 -33.09375,-33.125 0,-18.302056 14.796063,-33.09375 33.09375,-33.09375 z M 22.84375,71.625 l 0,1.75 13.96875,0 0,-1.75 -13.96875,0 z m 85.5625,0 0,1.75 14,0 0,-1.75 -14,0 z M 71.75,108.25 l 0,13.9375 1.71875,0 0,-13.9375 -1.71875,0 z"
}),
define("svgCompassGyro", [], function() {
    return "m 72.71875,54.375 c -0.476702,0 -0.908208,0.245402 -1.21875,0.5625 -0.310542,0.317098 -0.551189,0.701933 -0.78125,1.1875 -0.172018,0.363062 -0.319101,0.791709 -0.46875,1.25 -6.91615,1.075544 -12.313231,6.656514 -13,13.625 -0.327516,0.117495 -0.661877,0.244642 -0.9375,0.375 -0.485434,0.22959 -0.901634,0.471239 -1.21875,0.78125 -0.317116,0.310011 -0.5625,0.742111 -0.5625,1.21875 l 0.03125,0 c 0,0.476639 0.245384,0.877489 0.5625,1.1875 0.317116,0.310011 0.702066,0.58291 1.1875,0.8125 0.35554,0.168155 0.771616,0.32165 1.21875,0.46875 1.370803,6.10004 6.420817,10.834127 12.71875,11.8125 0.146999,0.447079 0.30025,0.863113 0.46875,1.21875 0.230061,0.485567 0.470708,0.870402 0.78125,1.1875 0.310542,0.317098 0.742048,0.5625 1.21875,0.5625 0.476702,0 0.876958,-0.245402 1.1875,-0.5625 0.310542,-0.317098 0.582439,-0.701933 0.8125,-1.1875 0.172018,-0.363062 0.319101,-0.791709 0.46875,-1.25 6.249045,-1.017063 11.256351,-5.7184 12.625,-11.78125 0.447134,-0.1471 0.86321,-0.300595 1.21875,-0.46875 0.485434,-0.22959 0.901633,-0.502489 1.21875,-0.8125 0.317117,-0.310011 0.5625,-0.710861 0.5625,-1.1875 l -0.03125,0 c 0,-0.476639 -0.245383,-0.908739 -0.5625,-1.21875 C 89.901633,71.846239 89.516684,71.60459 89.03125,71.375 88.755626,71.244642 88.456123,71.117495 88.125,71 87.439949,64.078341 82.072807,58.503735 75.21875,57.375 c -0.15044,-0.461669 -0.326927,-0.884711 -0.5,-1.25 -0.230061,-0.485567 -0.501958,-0.870402 -0.8125,-1.1875 -0.310542,-0.317098 -0.710798,-0.5625 -1.1875,-0.5625 z m -0.0625,1.40625 c 0.03595,-0.01283 0.05968,0 0.0625,0 0.0056,0 0.04321,-0.02233 0.1875,0.125 0.144288,0.147334 0.34336,0.447188 0.53125,0.84375 0.06385,0.134761 0.123901,0.309578 0.1875,0.46875 -0.320353,-0.01957 -0.643524,-0.0625 -0.96875,-0.0625 -0.289073,0 -0.558569,0.04702 -0.84375,0.0625 C 71.8761,57.059578 71.936151,56.884761 72,56.75 c 0.18789,-0.396562 0.355712,-0.696416 0.5,-0.84375 0.07214,-0.07367 0.120304,-0.112167 0.15625,-0.125 z m 0,2.40625 c 0.448007,0 0.906196,0.05436 1.34375,0.09375 0.177011,0.592256 0.347655,1.271044 0.5,2.03125 0.475097,2.370753 0.807525,5.463852 0.9375,8.9375 -0.906869,-0.02852 -1.834463,-0.0625 -2.78125,-0.0625 -0.92298,0 -1.802327,0.03537 -2.6875,0.0625 0.138529,-3.473648 0.493653,-6.566747 0.96875,-8.9375 0.154684,-0.771878 0.320019,-1.463985 0.5,-2.0625 0.405568,-0.03377 0.804291,-0.0625 1.21875,-0.0625 z m -2.71875,0.28125 c -0.129732,0.498888 -0.259782,0.987558 -0.375,1.5625 -0.498513,2.487595 -0.838088,5.693299 -0.96875,9.25 -3.21363,0.15162 -6.119596,0.480068 -8.40625,0.9375 -0.682394,0.136509 -1.275579,0.279657 -1.84375,0.4375 0.799068,-6.135482 5.504716,-11.036454 11.59375,-12.1875 z M 75.5,58.5 c 6.043169,1.18408 10.705093,6.052712 11.5,12.15625 -0.569435,-0.155806 -1.200273,-0.302525 -1.875,-0.4375 -2.262525,-0.452605 -5.108535,-0.783809 -8.28125,-0.9375 -0.130662,-3.556701 -0.470237,-6.762405 -0.96875,-9.25 C 75.761959,59.467174 75.626981,58.990925 75.5,58.5 z m -2.84375,12.09375 c 0.959338,0 1.895843,0.03282 2.8125,0.0625 C 75.48165,71.267751 75.5,71.871028 75.5,72.5 c 0,1.228616 -0.01449,2.438313 -0.0625,3.59375 -0.897358,0.0284 -1.811972,0.0625 -2.75,0.0625 -0.927373,0 -1.831062,-0.03473 -2.71875,-0.0625 -0.05109,-1.155437 -0.0625,-2.365134 -0.0625,-3.59375 0,-0.628972 0.01741,-1.232249 0.03125,-1.84375 0.895269,-0.02827 1.783025,-0.0625 2.71875,-0.0625 z M 68.5625,70.6875 c -0.01243,0.60601 -0.03125,1.189946 -0.03125,1.8125 0,1.22431 0.01541,2.407837 0.0625,3.5625 -3.125243,-0.150329 -5.92077,-0.471558 -8.09375,-0.90625 -0.784983,-0.157031 -1.511491,-0.316471 -2.125,-0.5 -0.107878,-0.704096 -0.1875,-1.422089 -0.1875,-2.15625 0,-0.115714 0.02849,-0.228688 0.03125,-0.34375 0.643106,-0.20284 1.389577,-0.390377 2.25,-0.5625 2.166953,-0.433487 4.97905,-0.75541 8.09375,-0.90625 z m 8.3125,0.03125 c 3.075121,0.15271 5.824455,0.446046 7.96875,0.875 0.857478,0.171534 1.630962,0.360416 2.28125,0.5625 0.0027,0.114659 0,0.228443 0,0.34375 0,0.735827 -0.07914,1.450633 -0.1875,2.15625 -0.598568,0.180148 -1.29077,0.34562 -2.0625,0.5 -2.158064,0.431708 -4.932088,0.754666 -8.03125,0.90625 0.04709,-1.154663 0.0625,-2.33819 0.0625,-3.5625 0,-0.611824 -0.01924,-1.185379 -0.03125,-1.78125 z M 57.15625,72.5625 c 0.0023,0.572772 0.06082,1.131112 0.125,1.6875 -0.125327,-0.05123 -0.266577,-0.10497 -0.375,-0.15625 -0.396499,-0.187528 -0.665288,-0.387337 -0.8125,-0.53125 -0.147212,-0.143913 -0.15625,-0.182756 -0.15625,-0.1875 0,-0.0047 -0.02221,-0.07484 0.125,-0.21875 0.147212,-0.143913 0.447251,-0.312472 0.84375,-0.5 0.07123,-0.03369 0.171867,-0.06006 0.25,-0.09375 z m 31.03125,0 c 0.08201,0.03503 0.175941,0.05872 0.25,0.09375 0.396499,0.187528 0.665288,0.356087 0.8125,0.5 0.14725,0.14391 0.15625,0.21405 0.15625,0.21875 0,0.0047 -0.009,0.04359 -0.15625,0.1875 -0.147212,0.143913 -0.416001,0.343722 -0.8125,0.53125 -0.09755,0.04613 -0.233314,0.07889 -0.34375,0.125 0.06214,-0.546289 0.09144,-1.094215 0.09375,-1.65625 z m -29.5,3.625 c 0.479308,0.123125 0.983064,0.234089 1.53125,0.34375 2.301781,0.460458 5.229421,0.787224 8.46875,0.9375 0.167006,2.84339 0.46081,5.433176 0.875,7.5 0.115218,0.574942 0.245268,1.063612 0.375,1.5625 -5.463677,-1.028179 -9.833074,-5.091831 -11.25,-10.34375 z m 27.96875,0 C 85.247546,81.408945 80.919274,85.442932 75.5,86.5 c 0.126981,-0.490925 0.261959,-0.967174 0.375,-1.53125 0.41419,-2.066824 0.707994,-4.65661 0.875,-7.5 3.204493,-0.15162 6.088346,-0.480068 8.375,-0.9375 0.548186,-0.109661 1.051942,-0.220625 1.53125,-0.34375 z M 70.0625,77.53125 c 0.865391,0.02589 1.723666,0.03125 2.625,0.03125 0.912062,0 1.782843,-0.0048 2.65625,-0.03125 -0.165173,2.736408 -0.453252,5.207651 -0.84375,7.15625 -0.152345,0.760206 -0.322989,1.438994 -0.5,2.03125 -0.437447,0.03919 -0.895856,0.0625 -1.34375,0.0625 -0.414943,0 -0.812719,-0.02881 -1.21875,-0.0625 -0.177011,-0.592256 -0.347655,-1.271044 -0.5,-2.03125 -0.390498,-1.948599 -0.700644,-4.419842 -0.875,-7.15625 z m 1.75,10.28125 c 0.284911,0.01545 0.554954,0.03125 0.84375,0.03125 0.325029,0 0.648588,-0.01171 0.96875,-0.03125 -0.05999,0.148763 -0.127309,0.31046 -0.1875,0.4375 -0.18789,0.396562 -0.386962,0.696416 -0.53125,0.84375 -0.144288,0.147334 -0.181857,0.125 -0.1875,0.125 -0.0056,0 -0.07446,0.02233 -0.21875,-0.125 C 72.355712,88.946416 72.18789,88.646562 72,88.25 71.939809,88.12296 71.872486,87.961263 71.8125,87.8125 z"
}),
define("svgCompassRotationMarker", [], function() {
    return "M 72.46875,22.03125 C 59.505873,22.050338 46.521615,27.004287 36.6875,36.875 L 47.84375,47.96875 C 61.521556,34.240041 83.442603,34.227389 97.125,47.90625 l 11.125,-11.125 C 98.401629,26.935424 85.431627,22.012162 72.46875,22.03125 z"
}),
define("NavigationViewModel", ["Knockout", "loadView", "inherit", "ResetViewNavigationControl", "ZoomInNavigationControl", "ZoomOutNavigationControl", "svgCompassOuterRing", "svgCompassGyro", "svgCompassRotationMarker"], function(e, t, n, r, i, o, a, s, u) {
    function c(e, t, n) {
        function r(t, n) {
            var r = Math.atan2(-t.y, t.x);
            e.orbitCursorAngle = Cesium.Math.zeroToTwoPi(r - Cesium.Math.PI_OVER_TWO);
            var i = Cesium.Cartesian2.magnitude(t)
              , o = n / 2
              , a = Math.min(i / o, 1)
              , s = .5 * a * a + .5;
            e.orbitCursorOpacity = s
        }
        document.removeEventListener("mousemove", e.orbitMouseMoveFunction, !1),
        document.removeEventListener("mouseup", e.orbitMouseUpFunction, !1),
        Cesium.defined(e.orbitTickFunction) && e.terria.clock.onTick.removeEventListener(e.orbitTickFunction),
        e.orbitMouseMoveFunction = void 0,
        e.orbitMouseUpFunction = void 0,
        e.orbitTickFunction = void 0,
        e.isOrbiting = !0,
        e.orbitLastTimestamp = Cesium.getTimestamp();
        var i = e.terria.scene
          , o = i.camera
          , a = g;
        a.x = i.canvas.clientWidth / 2,
        a.y = i.canvas.clientHeight / 2;
        var s = o.getPickRay(a, v)
          , u = i.globe.pick(s, i, m);
        Cesium.defined(u) ? (e.orbitFrame = Cesium.Transforms.eastNorthUpToFixedFrame(u, Cesium.Ellipsoid.WGS84, d),
        e.orbitIsLook = !1) : (e.orbitFrame = Cesium.Transforms.eastNorthUpToFixedFrame(o.positionWC, Cesium.Ellipsoid.WGS84, d),
        e.orbitIsLook = !0),
        e.orbitTickFunction = function(t) {
            var n = Cesium.getTimestamp()
              , r = n - e.orbitLastTimestamp
              , i = 2.5 * (e.orbitCursorOpacity - .5) / 1e3
              , o = r * i
              , a = e.orbitCursorAngle + Cesium.Math.PI_OVER_TWO
              , s = Math.cos(a) * o
              , u = Math.sin(a) * o
              , c = e.terria.scene
              , l = c.camera
              , p = Cesium.Matrix4.clone(l.transform, h);
            l.lookAtTransform(e.orbitFrame),
            e.orbitIsLook ? (l.look(Cesium.Cartesian3.UNIT_Z, -s),
            l.look(l.right, -u)) : (l.rotateLeft(s),
            l.rotateUp(u)),
            l.lookAtTransform(p),
            e.orbitLastTimestamp = n
        }
        ,
        e.orbitMouseMoveFunction = function(e) {
            var n = t.getBoundingClientRect()
              , i = new Cesium.Cartesian2((n.right - n.left) / 2,(n.bottom - n.top) / 2)
              , o = new Cesium.Cartesian2(e.clientX - n.left,e.clientY - n.top)
              , a = Cesium.Cartesian2.subtract(o, i, f);
            r(a, n.width)
        }
        ,
        e.orbitMouseUpFunction = function(t) {
            e.isOrbiting = !1,
            document.removeEventListener("mousemove", e.orbitMouseMoveFunction, !1),
            document.removeEventListener("mouseup", e.orbitMouseUpFunction, !1),
            Cesium.defined(e.orbitTickFunction) && e.terria.clock.onTick.removeEventListener(e.orbitTickFunction),
            e.orbitMouseMoveFunction = void 0,
            e.orbitMouseUpFunction = void 0,
            e.orbitTickFunction = void 0
        }
        ,
        document.addEventListener("mousemove", e.orbitMouseMoveFunction, !1),
        document.addEventListener("mouseup", e.orbitMouseUpFunction, !1),
        e.terria.clock.onTick.addEventListener(e.orbitTickFunction),
        r(n, t.getBoundingClientRect().width)
    }
    function l(e, t, n) {
        document.removeEventListener("mousemove", e.rotateMouseMoveFunction, !1),
        document.removeEventListener("mouseup", e.rotateMouseUpFunction, !1),
        e.rotateMouseMoveFunction = void 0,
        e.rotateMouseUpFunction = void 0,
        e.isRotating = !0,
        e.rotateInitialCursorAngle = Math.atan2(-n.y, n.x);
        var r = e.terria.scene
          , i = r.camera
          , o = g;
        o.x = r.canvas.clientWidth / 2,
        o.y = r.canvas.clientHeight / 2;
        var a = i.getPickRay(o, v)
          , s = r.globe.pick(a, r, m);
        Cesium.defined(s) ? (e.rotateFrame = Cesium.Transforms.eastNorthUpToFixedFrame(s, Cesium.Ellipsoid.WGS84, d),
        e.rotateIsLook = !1) : (e.rotateFrame = Cesium.Transforms.eastNorthUpToFixedFrame(i.positionWC, Cesium.Ellipsoid.WGS84, d),
        e.rotateIsLook = !0);
        var u = Cesium.Matrix4.clone(i.transform, h);
        i.lookAtTransform(e.rotateFrame),
        e.rotateInitialCameraAngle = Math.atan2(i.position.y, i.position.x),
        e.rotateInitialCameraDistance = Cesium.Cartesian3.magnitude(new Cesium.Cartesian3(i.position.x,i.position.y,0)),
        i.lookAtTransform(u),
        e.rotateMouseMoveFunction = function(n) {
            var r = t.getBoundingClientRect()
              , i = new Cesium.Cartesian2((r.right - r.left) / 2,(r.bottom - r.top) / 2)
              , o = new Cesium.Cartesian2(n.clientX - r.left,n.clientY - r.top)
              , a = Cesium.Cartesian2.subtract(o, i, f)
              , s = Math.atan2(-a.y, a.x)
              , u = s - e.rotateInitialCursorAngle
              , c = Cesium.Math.zeroToTwoPi(e.rotateInitialCameraAngle - u)
              , l = e.terria.scene.camera
              , p = Cesium.Matrix4.clone(l.transform, h);
            l.lookAtTransform(e.rotateFrame);
            var d = Math.atan2(l.position.y, l.position.x);
            l.rotateRight(c - d),
            l.lookAtTransform(p)
        }
        ,
        e.rotateMouseUpFunction = function(t) {
            e.isRotating = !1,
            document.removeEventListener("mousemove", e.rotateMouseMoveFunction, !1),
            document.removeEventListener("mouseup", e.rotateMouseUpFunction, !1),
            e.rotateMouseMoveFunction = void 0,
            e.rotateMouseUpFunction = void 0
        }
        ,
        document.addEventListener("mousemove", e.rotateMouseMoveFunction, !1),
        document.addEventListener("mouseup", e.rotateMouseUpFunction, !1)
    }
    var p = function(t) {
        function n() {
            Cesium.defined(c.terria) ? (c._unsubcribeFromPostRender && (c._unsubcribeFromPostRender(),
            c._unsubcribeFromPostRender = void 0),
            c.showCompass = !0,
            c._unsubcribeFromPostRender = c.terria.scene.postRender.addEventListener(function() {
                c.heading = c.terria.scene.camera.heading
            })) : (c._unsubcribeFromPostRender && (c._unsubcribeFromPostRender(),
            c._unsubcribeFromPostRender = void 0),
            c.showCompass = !1)
        }
        this.terria = t.terria,
        this.eventHelper = new Cesium.EventHelper,
        this.controls = t.controls,
        Cesium.defined(this.controls) || (this.controls = [new i(this.terria), new r(this.terria), new o(this.terria)]),
        this.svgCompassOuterRing = a,
        this.svgCompassGyro = s,
        this.svgCompassRotationMarker = u,
        this.showCompass = Cesium.defined(this.terria),
        this.heading = this.showCompass ? this.terria.scene.camera.heading : 0,
        this.isOrbiting = !1,
        this.orbitCursorAngle = 0,
        this.orbitCursorOpacity = 0,
        this.orbitLastTimestamp = 0,
        this.orbitFrame = void 0,
        this.orbitIsLook = !1,
        this.orbitMouseMoveFunction = void 0,
        this.orbitMouseUpFunction = void 0,
        this.isRotating = !1,
        this.rotateInitialCursorAngle = void 0,
        this.rotateFrame = void 0,
        this.rotateIsLook = !1,
        this.rotateMouseMoveFunction = void 0,
        this.rotateMouseUpFunction = void 0,
        this._unsubcribeFromPostRender = void 0,
        e.track(this, ["controls", "showCompass", "heading", "isOrbiting", "orbitCursorAngle", "isRotating"]);
        var c = this;
        this.eventHelper.add(this.terria.afterViewerChanged, n, this),
        n()
    }
    ;
    p.prototype.destroy = function() {
        this.eventHelper.removeAll()
    }
    ,
    p.prototype.show = function(e) {
        var n = '<div class="compass" title="Drag outer ring: rotate view. Drag inner gyroscope: free orbit.Double-click: reset view.TIP: You can also free orbit by holding the CTRL key and dragging the map." data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }"><div class="compass-outer-ring-background"></div>' + " <div class=\"compass-rotation-marker\" data-bind=\"visible: isOrbiting, style: { transform: 'rotate(-' + orbitCursorAngle + 'rad)', '-webkit-transform': 'rotate(-' + orbitCursorAngle + 'rad)', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }\"></div> <div class=\"compass-outer-ring\" title=\"Click and drag to rotate the camera\" data-bind=\"style: { transform: 'rotate(-' + heading + 'rad)', '-webkit-transform': 'rotate(-' + heading + 'rad)' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }\"></div> <div class=\"compass-gyro-background\"></div> <div class=\"compass-gyro\" data-bind=\"cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { 'compass-gyro-active': isOrbiting }\"></div></div><div class=\"navigation-controls\"><!-- ko foreach: controls --><div data-bind=\"click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? 'navigation-control-last' : 'navigation-control' \">   <!-- ko if: $data.hasText -->   <div data-bind=\"text: $data.text, css: $data.isActive ?  'navigation-control-icon-active ' + $data.cssClass : $data.cssClass\"></div>   <!-- /ko -->  <!-- ko ifnot: $data.hasText -->  <div data-bind=\"cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  'navigation-control-icon-active ' + $data.cssClass : $data.cssClass\"></div>  <!-- /ko --> </div> <!-- /ko --></div>";
        t(n, e, this)
    }
    ,
    p.prototype.add = function(e) {
        this.controls.push(e)
    }
    ,
    p.prototype.remove = function(e) {
        this.controls.remove(e)
    }
    ,
    p.prototype.isLastControl = function(e) {
        return e === this.controls[this.controls.length - 1]
    }
    ;
    var f = new Cesium.Cartesian2;
    p.prototype.handleMouseDown = function(e, t) {
        var n = t.currentTarget
          , r = t.currentTarget.getBoundingClientRect()
          , i = r.width / 2
          , o = new Cesium.Cartesian2((r.right - r.left) / 2,(r.bottom - r.top) / 2)
          , a = new Cesium.Cartesian2(t.clientX - r.left,t.clientY - r.top)
          , s = Cesium.Cartesian2.subtract(a, o, f)
          , u = Cesium.Cartesian2.magnitude(s)
          , p = u / i
          , h = 145
          , d = 50;
        if (d / h > p)
            c(this, n, s);
        else {
            if (!(1 > p))
                return !0;
            l(this, n, s)
        }
    }
    ;
    var h = new Cesium.Matrix4
      , d = new Cesium.Matrix4
      , m = new Cesium.Cartesian3
      , g = new Cesium.Cartesian2
      , v = new Cesium.Ray;
    return p.prototype.handleDoubleClick = function(e, t) {
        var n = this.terria.scene
          , r = n.camera
          , i = g;
        i.x = n.canvas.clientWidth / 2,
        i.y = n.canvas.clientHeight / 2;
        var o = r.getPickRay(i, v)
          , a = n.globe.pick(o, n, m);
        if (!Cesium.defined(a))
            return void this.terria.zoomTo(this.terria.homeView, 1.5);
        var s = Cesium.Transforms.eastNorthUpToFixedFrame(a, Cesium.Ellipsoid.WGS84)
          , u = Cesium.Cartesian3.subtract(a, r.position, new Cesium.Cartesian3)
          , c = Cesium.CameraFlightPath.createTween(n, {
            destination: Cesium.Matrix4.multiplyByPoint(s, new Cesium.Cartesian3(0,0,Cesium.Cartesian3.magnitude(u)), new Cesium.Cartesian3),
            direction: Cesium.Matrix4.multiplyByPointAsVector(s, new Cesium.Cartesian3(0,0,-1), new Cesium.Cartesian3),
            up: Cesium.Matrix4.multiplyByPointAsVector(s, new Cesium.Cartesian3(0,1,0), new Cesium.Cartesian3),
            duration: 1.5
        });
        n.tweens.add(c)
    }
    ,
    p.create = function(e) {
        var t = new p(e);
        return t.show(e.container),
        t
    }
    ,
    p
});
var URI = function() {
    function e(e) {
        var t = ("" + e).match(h);
        return t ? new u(c(t[1]),c(t[2]),c(t[3]),c(t[4]),c(t[5]),c(t[6]),c(t[7])) : null
    }
    function t(e, t, o, a, s, c, l) {
        var p = new u(r(e, d),r(t, d),n(o),a > 0 ? a.toString() : null ,r(s, m),null ,n(l));
        return c && ("string" == typeof c ? p.setRawQuery(c.replace(/[^?&=0-9A-Za-z_\-~.%]/g, i)) : p.setAllParameters(c)),
        p
    }
    function n(e) {
        return "string" == typeof e ? encodeURIComponent(e) : null
    }
    function r(e, t) {
        return "string" == typeof e ? encodeURI(e).replace(t, i) : null
    }
    function i(e) {
        var t = e.charCodeAt(0);
        return "%" + "0123456789ABCDEF".charAt(t >> 4 & 15) + "0123456789ABCDEF".charAt(15 & t)
    }
    function o(e) {
        return e.replace(/(^|\/)\.(?:\/|$)/g, "$1").replace(/\/{2,}/g, "/")
    }
    function a(e) {
        if (null  === e)
            return null ;
        for (var t, n = o(e), r = p; (t = n.replace(r, "$1")) != n; n = t)
            ;
        return n
    }
    function s(e, t) {
        var n = e.clone()
          , r = t.hasScheme();
        r ? n.setRawScheme(t.getRawScheme()) : r = t.hasCredentials(),
        r ? n.setRawCredentials(t.getRawCredentials()) : r = t.hasDomain(),
        r ? n.setRawDomain(t.getRawDomain()) : r = t.hasPort();
        var i = t.getRawPath()
          , o = a(i);
        if (r)
            n.setPort(t.getPort()),
            o = o && o.replace(f, "");
        else if (r = !!i) {
            if (47 !== o.charCodeAt(0)) {
                var s = a(n.getRawPath() || "").replace(f, "")
                  , u = s.lastIndexOf("/") + 1;
                o = a((u ? s.substring(0, u) : "") + a(i)).replace(f, "")
            }
        } else
            o = o && o.replace(f, ""),
            o !== i && n.setRawPath(o);
        return r ? n.setRawPath(o) : r = t.hasQuery(),
        r ? n.setRawQuery(t.getRawQuery()) : r = t.hasFragment(),
        r && n.setRawFragment(t.getRawFragment()),
        n
    }
    function u(e, t, n, r, i, o, a) {
        this.scheme_ = e,
        this.credentials_ = t,
        this.domain_ = n,
        this.port_ = r,
        this.path_ = i,
        this.query_ = o,
        this.fragment_ = a,
        this.paramCache_ = null
    }
    function c(e) {
        return "string" == typeof e && e.length > 0 ? e : null
    }
    var l = new RegExp("(/|^)(?:[^./][^/]*|\\.{2,}(?:[^./][^/]*)|\\.{3,}[^/]*)/\\.\\.(?:/|$)")
      , p = new RegExp(l)
      , f = /^(?:\.\.\/)*(?:\.\.$)?/;
    u.prototype.toString = function() {
        var e = [];
        return null  !== this.scheme_ && e.push(this.scheme_, ":"),
        null  !== this.domain_ && (e.push("//"),
        null  !== this.credentials_ && e.push(this.credentials_, "@"),
        e.push(this.domain_),
        null  !== this.port_ && e.push(":", this.port_.toString())),
        null  !== this.path_ && e.push(this.path_),
        null  !== this.query_ && e.push("?", this.query_),
        null  !== this.fragment_ && e.push("#", this.fragment_),
        e.join("")
    }
    ,
    u.prototype.clone = function() {
        return new u(this.scheme_,this.credentials_,this.domain_,this.port_,this.path_,this.query_,this.fragment_)
    }
    ,
    u.prototype.getScheme = function() {
        return this.scheme_ && decodeURIComponent(this.scheme_).toLowerCase()
    }
    ,
    u.prototype.getRawScheme = function() {
        return this.scheme_
    }
    ,
    u.prototype.setScheme = function(e) {
        return this.scheme_ = r(e, d),
        this
    }
    ,
    u.prototype.setRawScheme = function(e) {
        return this.scheme_ = e ? e : null ,
        this
    }
    ,
    u.prototype.hasScheme = function() {
        return null  !== this.scheme_
    }
    ,
    u.prototype.getCredentials = function() {
        return this.credentials_ && decodeURIComponent(this.credentials_)
    }
    ,
    u.prototype.getRawCredentials = function() {
        return this.credentials_
    }
    ,
    u.prototype.setCredentials = function(e) {
        return this.credentials_ = r(e, d),
        this
    }
    ,
    u.prototype.setRawCredentials = function(e) {
        return this.credentials_ = e ? e : null ,
        this
    }
    ,
    u.prototype.hasCredentials = function() {
        return null  !== this.credentials_
    }
    ,
    u.prototype.getDomain = function() {
        return this.domain_ && decodeURIComponent(this.domain_)
    }
    ,
    u.prototype.getRawDomain = function() {
        return this.domain_
    }
    ,
    u.prototype.setDomain = function(e) {
        return this.setRawDomain(e && encodeURIComponent(e))
    }
    ,
    u.prototype.setRawDomain = function(e) {
        return this.domain_ = e ? e : null ,
        this.setRawPath(this.path_)
    }
    ,
    u.prototype.hasDomain = function() {
        return null  !== this.domain_
    }
    ,
    u.prototype.getPort = function() {
        return this.port_ && decodeURIComponent(this.port_)
    }
    ,
    u.prototype.setPort = function(e) {
        if (e) {
            if (e = Number(e),
            e !== (65535 & e))
                throw new Error("Bad port number " + e);
            this.port_ = "" + e
        } else
            this.port_ = null ;
        return this
    }
    ,
    u.prototype.hasPort = function() {
        return null  !== this.port_
    }
    ,
    u.prototype.getPath = function() {
        return this.path_ && decodeURIComponent(this.path_)
    }
    ,
    u.prototype.getRawPath = function() {
        return this.path_
    }
    ,
    u.prototype.setPath = function(e) {
        return this.setRawPath(r(e, m))
    }
    ,
    u.prototype.setRawPath = function(e) {
        return e ? (e = String(e),
        this.path_ = !this.domain_ || /^\//.test(e) ? e : "/" + e) : this.path_ = null ,
        this
    }
    ,
    u.prototype.hasPath = function() {
        return null  !== this.path_
    }
    ,
    u.prototype.getQuery = function() {
        return this.query_ && decodeURIComponent(this.query_).replace(/\+/g, " ")
    }
    ,
    u.prototype.getRawQuery = function() {
        return this.query_
    }
    ,
    u.prototype.setQuery = function(e) {
        return this.paramCache_ = null ,
        this.query_ = n(e),
        this
    }
    ,
    u.prototype.setRawQuery = function(e) {
        return this.paramCache_ = null ,
        this.query_ = e ? e : null ,
        this
    }
    ,
    u.prototype.hasQuery = function() {
        return null  !== this.query_
    }
    ,
    u.prototype.setAllParameters = function(e) {
        if ("object" == typeof e && !(e instanceof Array) && (e instanceof Object || "[object Array]" !== Object.prototype.toString.call(e))) {
            var t = []
              , n = -1;
            for (var r in e) {
                var i = e[r];
                "string" == typeof i && (t[++n] = r,
                t[++n] = i)
            }
            e = t
        }
        this.paramCache_ = null ;
        for (var o = [], a = "", s = 0; s < e.length; ) {
            var r = e[s++]
              , i = e[s++];
            o.push(a, encodeURIComponent(r.toString())),
            a = "&",
            i && o.push("=", encodeURIComponent(i.toString()))
        }
        return this.query_ = o.join(""),
        this
    }
    ,
    u.prototype.checkParameterCache_ = function() {
        if (!this.paramCache_) {
            var e = this.query_;
            if (e) {
                for (var t = e.split(/[&\?]/), n = [], r = -1, i = 0; i < t.length; ++i) {
                    var o = t[i].match(/^([^=]*)(?:=(.*))?$/);
                    n[++r] = decodeURIComponent(o[1]).replace(/\+/g, " "),
                    n[++r] = decodeURIComponent(o[2] || "").replace(/\+/g, " ")
                }
                this.paramCache_ = n
            } else
                this.paramCache_ = []
        }
    }
    ,
    u.prototype.setParameterValues = function(e, t) {
        "string" == typeof t && (t = [t]),
        this.checkParameterCache_();
        for (var n = 0, r = this.paramCache_, i = [], o = 0; o < r.length; o += 2)
            e === r[o] ? n < t.length && i.push(e, t[n++]) : i.push(r[o], r[o + 1]);
        for (; n < t.length; )
            i.push(e, t[n++]);
        return this.setAllParameters(i),
        this
    }
    ,
    u.prototype.removeParameter = function(e) {
        return this.setParameterValues(e, [])
    }
    ,
    u.prototype.getAllParameters = function() {
        return this.checkParameterCache_(),
        this.paramCache_.slice(0, this.paramCache_.length)
    }
    ,
    u.prototype.getParameterValues = function(e) {
        this.checkParameterCache_();
        for (var t = [], n = 0; n < this.paramCache_.length; n += 2)
            e === this.paramCache_[n] && t.push(this.paramCache_[n + 1]);
        return t
    }
    ,
    u.prototype.getParameterMap = function(e) {
        this.checkParameterCache_();
        for (var t = {}, n = 0; n < this.paramCache_.length; n += 2) {
            var r = this.paramCache_[n++]
              , i = this.paramCache_[n++];
            r in t ? t[r].push(i) : t[r] = [i]
        }
        return t
    }
    ,
    u.prototype.getParameterValue = function(e) {
        this.checkParameterCache_();
        for (var t = 0; t < this.paramCache_.length; t += 2)
            if (e === this.paramCache_[t])
                return this.paramCache_[t + 1];
        return null
    }
    ,
    u.prototype.getFragment = function() {
        return this.fragment_ && decodeURIComponent(this.fragment_)
    }
    ,
    u.prototype.getRawFragment = function() {
        return this.fragment_
    }
    ,
    u.prototype.setFragment = function(e) {
        return this.fragment_ = e ? encodeURIComponent(e) : null ,
        this
    }
    ,
    u.prototype.setRawFragment = function(e) {
        return this.fragment_ = e ? e : null ,
        this
    }
    ,
    u.prototype.hasFragment = function() {
        return null  !== this.fragment_
    }
    ;
    var h = new RegExp("^(?:([^:/?#]+):)?(?://(?:([^/?#]*)@)?([^/?#:@]*)(?::([0-9]+))?)?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$")
      , d = /[#\/\?@]/g
      , m = /[\#\?]/g;
    return u.parse = e,
    u.create = t,
    u.resolve = s,
    u.collapse_dots = a,
    u.utils = {
        mimeTypeOf: function(t) {
            var n = e(t);
            return /\.html$/.test(n.getPath()) ? "text/html" : "application/javascript"
        },
        resolve: function(t, n) {
            return t ? s(e(t), e(n)).toString() : "" + n
        }
    },
    u
}()
  , html4 = {};
if (html4.atype = {
    NONE: 0,
    URI: 1,
    URI_FRAGMENT: 11,
    SCRIPT: 2,
    STYLE: 3,
    HTML: 12,
    ID: 4,
    IDREF: 5,
    IDREFS: 6,
    GLOBAL_NAME: 7,
    LOCAL_NAME: 8,
    CLASSES: 9,
    FRAME_TARGET: 10,
    MEDIA_QUERY: 13
},
html4.atype = html4.atype,
html4.ATTRIBS = {
    "*::class": 9,
    "*::dir": 0,
    "*::draggable": 0,
    "*::hidden": 0,
    "*::id": 4,
    "*::inert": 0,
    "*::itemprop": 0,
    "*::itemref": 6,
    "*::itemscope": 0,
    "*::lang": 0,
    "*::onblur": 2,
    "*::onchange": 2,
    "*::onclick": 2,
    "*::ondblclick": 2,
    "*::onfocus": 2,
    "*::onkeydown": 2,
    "*::onkeypress": 2,
    "*::onkeyup": 2,
    "*::onload": 2,
    "*::onmousedown": 2,
    "*::onmousemove": 2,
    "*::onmouseout": 2,
    "*::onmouseover": 2,
    "*::onmouseup": 2,
    "*::onreset": 2,
    "*::onscroll": 2,
    "*::onselect": 2,
    "*::onsubmit": 2,
    "*::onunload": 2,
    "*::spellcheck": 0,
    "*::style": 3,
    "*::title": 0,
    "*::translate": 0,
    "a::accesskey": 0,
    "a::coords": 0,
    "a::href": 1,
    "a::hreflang": 0,
    "a::name": 7,
    "a::onblur": 2,
    "a::onfocus": 2,
    "a::shape": 0,
    "a::tabindex": 0,
    "a::target": 10,
    "a::type": 0,
    "area::accesskey": 0,
    "area::alt": 0,
    "area::coords": 0,
    "area::href": 1,
    "area::nohref": 0,
    "area::onblur": 2,
    "area::onfocus": 2,
    "area::shape": 0,
    "area::tabindex": 0,
    "area::target": 10,
    "audio::controls": 0,
    "audio::loop": 0,
    "audio::mediagroup": 5,
    "audio::muted": 0,
    "audio::preload": 0,
    "bdo::dir": 0,
    "blockquote::cite": 1,
    "br::clear": 0,
    "button::accesskey": 0,
    "button::disabled": 0,
    "button::name": 8,
    "button::onblur": 2,
    "button::onfocus": 2,
    "button::tabindex": 0,
    "button::type": 0,
    "button::value": 0,
    "canvas::height": 0,
    "canvas::width": 0,
    "caption::align": 0,
    "col::align": 0,
    "col::char": 0,
    "col::charoff": 0,
    "col::span": 0,
    "col::valign": 0,
    "col::width": 0,
    "colgroup::align": 0,
    "colgroup::char": 0,
    "colgroup::charoff": 0,
    "colgroup::span": 0,
    "colgroup::valign": 0,
    "colgroup::width": 0,
    "command::checked": 0,
    "command::command": 5,
    "command::disabled": 0,
    "command::icon": 1,
    "command::label": 0,
    "command::radiogroup": 0,
    "command::type": 0,
    "data::value": 0,
    "del::cite": 1,
    "del::datetime": 0,
    "details::open": 0,
    "dir::compact": 0,
    "div::align": 0,
    "dl::compact": 0,
    "fieldset::disabled": 0,
    "font::color": 0,
    "font::face": 0,
    "font::size": 0,
    "form::accept": 0,
    "form::action": 1,
    "form::autocomplete": 0,
    "form::enctype": 0,
    "form::method": 0,
    "form::name": 7,
    "form::novalidate": 0,
    "form::onreset": 2,
    "form::onsubmit": 2,
    "form::target": 10,
    "h1::align": 0,
    "h2::align": 0,
    "h3::align": 0,
    "h4::align": 0,
    "h5::align": 0,
    "h6::align": 0,
    "hr::align": 0,
    "hr::noshade": 0,
    "hr::size": 0,
    "hr::width": 0,
    "iframe::align": 0,
    "iframe::frameborder": 0,
    "iframe::height": 0,
    "iframe::marginheight": 0,
    "iframe::marginwidth": 0,
    "iframe::width": 0,
    "img::align": 0,
    "img::alt": 0,
    "img::border": 0,
    "img::height": 0,
    "img::hspace": 0,
    "img::ismap": 0,
    "img::name": 7,
    "img::src": 1,
    "img::usemap": 11,
    "img::vspace": 0,
    "img::width": 0,
    "input::accept": 0,
    "input::accesskey": 0,
    "input::align": 0,
    "input::alt": 0,
    "input::autocomplete": 0,
    "input::checked": 0,
    "input::disabled": 0,
    "input::inputmode": 0,
    "input::ismap": 0,
    "input::list": 5,
    "input::max": 0,
    "input::maxlength": 0,
    "input::min": 0,
    "input::multiple": 0,
    "input::name": 8,
    "input::onblur": 2,
    "input::onchange": 2,
    "input::onfocus": 2,
    "input::onselect": 2,
    "input::placeholder": 0,
    "input::readonly": 0,
    "input::required": 0,
    "input::size": 0,
    "input::src": 1,
    "input::step": 0,
    "input::tabindex": 0,
    "input::type": 0,
    "input::usemap": 11,
    "input::value": 0,
    "ins::cite": 1,
    "ins::datetime": 0,
    "label::accesskey": 0,
    "label::for": 5,
    "label::onblur": 2,
    "label::onfocus": 2,
    "legend::accesskey": 0,
    "legend::align": 0,
    "li::type": 0,
    "li::value": 0,
    "map::name": 7,
    "menu::compact": 0,
    "menu::label": 0,
    "menu::type": 0,
    "meter::high": 0,
    "meter::low": 0,
    "meter::max": 0,
    "meter::min": 0,
    "meter::value": 0,
    "ol::compact": 0,
    "ol::reversed": 0,
    "ol::start": 0,
    "ol::type": 0,
    "optgroup::disabled": 0,
    "optgroup::label": 0,
    "option::disabled": 0,
    "option::label": 0,
    "option::selected": 0,
    "option::value": 0,
    "output::for": 6,
    "output::name": 8,
    "p::align": 0,
    "pre::width": 0,
    "progress::max": 0,
    "progress::min": 0,
    "progress::value": 0,
    "q::cite": 1,
    "select::autocomplete": 0,
    "select::disabled": 0,
    "select::multiple": 0,
    "select::name": 8,
    "select::onblur": 2,
    "select::onchange": 2,
    "select::onfocus": 2,
    "select::required": 0,
    "select::size": 0,
    "select::tabindex": 0,
    "source::type": 0,
    "table::align": 0,
    "table::bgcolor": 0,
    "table::border": 0,
    "table::cellpadding": 0,
    "table::cellspacing": 0,
    "table::frame": 0,
    "table::rules": 0,
    "table::summary": 0,
    "table::width": 0,
    "tbody::align": 0,
    "tbody::char": 0,
    "tbody::charoff": 0,
    "tbody::valign": 0,
    "td::abbr": 0,
    "td::align": 0,
    "td::axis": 0,
    "td::bgcolor": 0,
    "td::char": 0,
    "td::charoff": 0,
    "td::colspan": 0,
    "td::headers": 6,
    "td::height": 0,
    "td::nowrap": 0,
    "td::rowspan": 0,
    "td::scope": 0,
    "td::valign": 0,
    "td::width": 0,
    "textarea::accesskey": 0,
    "textarea::autocomplete": 0,
    "textarea::cols": 0,
    "textarea::disabled": 0,
    "textarea::inputmode": 0,
    "textarea::name": 8,
    "textarea::onblur": 2,
    "textarea::onchange": 2,
    "textarea::onfocus": 2,
    "textarea::onselect": 2,
    "textarea::placeholder": 0,
    "textarea::readonly": 0,
    "textarea::required": 0,
    "textarea::rows": 0,
    "textarea::tabindex": 0,
    "textarea::wrap": 0,
    "tfoot::align": 0,
    "tfoot::char": 0,
    "tfoot::charoff": 0,
    "tfoot::valign": 0,
    "th::abbr": 0,
    "th::align": 0,
    "th::axis": 0,
    "th::bgcolor": 0,
    "th::char": 0,
    "th::charoff": 0,
    "th::colspan": 0,
    "th::headers": 6,
    "th::height": 0,
    "th::nowrap": 0,
    "th::rowspan": 0,
    "th::scope": 0,
    "th::valign": 0,
    "th::width": 0,
    "thead::align": 0,
    "thead::char": 0,
    "thead::charoff": 0,
    "thead::valign": 0,
    "tr::align": 0,
    "tr::bgcolor": 0,
    "tr::char": 0,
    "tr::charoff": 0,
    "tr::valign": 0,
    "track::default": 0,
    "track::kind": 0,
    "track::label": 0,
    "track::srclang": 0,
    "ul::compact": 0,
    "ul::type": 0,
    "video::controls": 0,
    "video::height": 0,
    "video::loop": 0,
    "video::mediagroup": 5,
    "video::muted": 0,
    "video::poster": 1,
    "video::preload": 0,
    "video::width": 0
},
html4.ATTRIBS = html4.ATTRIBS,
html4.eflags = {
    OPTIONAL_ENDTAG: 1,
    EMPTY: 2,
    CDATA: 4,
    RCDATA: 8,
    UNSAFE: 16,
    FOLDABLE: 32,
    SCRIPT: 64,
    STYLE: 128,
    VIRTUALIZED: 256
},
html4.eflags = html4.eflags,
html4.ELEMENTS = {
    a: 0,
    abbr: 0,
    acronym: 0,
    address: 0,
    applet: 272,
    area: 2,
    article: 0,
    aside: 0,
    audio: 0,
    b: 0,
    base: 274,
    basefont: 274,
    bdi: 0,
    bdo: 0,
    big: 0,
    blockquote: 0,
    body: 305,
    br: 2,
    button: 0,
    canvas: 0,
    caption: 0,
    center: 0,
    cite: 0,
    code: 0,
    col: 2,
    colgroup: 1,
    command: 2,
    data: 0,
    datalist: 0,
    dd: 1,
    del: 0,
    details: 0,
    dfn: 0,
    dialog: 272,
    dir: 0,
    div: 0,
    dl: 0,
    dt: 1,
    em: 0,
    fieldset: 0,
    figcaption: 0,
    figure: 0,
    font: 0,
    footer: 0,
    form: 0,
    frame: 274,
    frameset: 272,
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    h5: 0,
    h6: 0,
    head: 305,
    header: 0,
    hgroup: 0,
    hr: 2,
    html: 305,
    i: 0,
    iframe: 16,
    img: 2,
    input: 2,
    ins: 0,
    isindex: 274,
    kbd: 0,
    keygen: 274,
    label: 0,
    legend: 0,
    li: 1,
    link: 274,
    map: 0,
    mark: 0,
    menu: 0,
    meta: 274,
    meter: 0,
    nav: 0,
    nobr: 0,
    noembed: 276,
    noframes: 276,
    noscript: 276,
    object: 272,
    ol: 0,
    optgroup: 0,
    option: 1,
    output: 0,
    p: 1,
    param: 274,
    pre: 0,
    progress: 0,
    q: 0,
    s: 0,
    samp: 0,
    script: 84,
    section: 0,
    select: 0,
    small: 0,
    source: 2,
    span: 0,
    strike: 0,
    strong: 0,
    style: 148,
    sub: 0,
    summary: 0,
    sup: 0,
    table: 0,
    tbody: 1,
    td: 1,
    textarea: 8,
    tfoot: 1,
    th: 1,
    thead: 1,
    time: 0,
    title: 280,
    tr: 1,
    track: 2,
    tt: 0,
    u: 0,
    ul: 0,
    "var": 0,
    video: 0,
    wbr: 2
},
html4.ELEMENTS = html4.ELEMENTS,
html4.ELEMENT_DOM_INTERFACES = {
    a: "HTMLAnchorElement",
    abbr: "HTMLElement",
    acronym: "HTMLElement",
    address: "HTMLElement",
    applet: "HTMLAppletElement",
    area: "HTMLAreaElement",
    article: "HTMLElement",
    aside: "HTMLElement",
    audio: "HTMLAudioElement",
    b: "HTMLElement",
    base: "HTMLBaseElement",
    basefont: "HTMLBaseFontElement",
    bdi: "HTMLElement",
    bdo: "HTMLElement",
    big: "HTMLElement",
    blockquote: "HTMLQuoteElement",
    body: "HTMLBodyElement",
    br: "HTMLBRElement",
    button: "HTMLButtonElement",
    canvas: "HTMLCanvasElement",
    caption: "HTMLTableCaptionElement",
    center: "HTMLElement",
    cite: "HTMLElement",
    code: "HTMLElement",
    col: "HTMLTableColElement",
    colgroup: "HTMLTableColElement",
    command: "HTMLCommandElement",
    data: "HTMLElement",
    datalist: "HTMLDataListElement",
    dd: "HTMLElement",
    del: "HTMLModElement",
    details: "HTMLDetailsElement",
    dfn: "HTMLElement",
    dialog: "HTMLDialogElement",
    dir: "HTMLDirectoryElement",
    div: "HTMLDivElement",
    dl: "HTMLDListElement",
    dt: "HTMLElement",
    em: "HTMLElement",
    fieldset: "HTMLFieldSetElement",
    figcaption: "HTMLElement",
    figure: "HTMLElement",
    font: "HTMLFontElement",
    footer: "HTMLElement",
    form: "HTMLFormElement",
    frame: "HTMLFrameElement",
    frameset: "HTMLFrameSetElement",
    h1: "HTMLHeadingElement",
    h2: "HTMLHeadingElement",
    h3: "HTMLHeadingElement",
    h4: "HTMLHeadingElement",
    h5: "HTMLHeadingElement",
    h6: "HTMLHeadingElement",
    head: "HTMLHeadElement",
    header: "HTMLElement",
    hgroup: "HTMLElement",
    hr: "HTMLHRElement",
    html: "HTMLHtmlElement",
    i: "HTMLElement",
    iframe: "HTMLIFrameElement",
    img: "HTMLImageElement",
    input: "HTMLInputElement",
    ins: "HTMLModElement",
    isindex: "HTMLUnknownElement",
    kbd: "HTMLElement",
    keygen: "HTMLKeygenElement",
    label: "HTMLLabelElement",
    legend: "HTMLLegendElement",
    li: "HTMLLIElement",
    link: "HTMLLinkElement",
    map: "HTMLMapElement",
    mark: "HTMLElement",
    menu: "HTMLMenuElement",
    meta: "HTMLMetaElement",
    meter: "HTMLMeterElement",
    nav: "HTMLElement",
    nobr: "HTMLElement",
    noembed: "HTMLElement",
    noframes: "HTMLElement",
    noscript: "HTMLElement",
    object: "HTMLObjectElement",
    ol: "HTMLOListElement",
    optgroup: "HTMLOptGroupElement",
    option: "HTMLOptionElement",
    output: "HTMLOutputElement",
    p: "HTMLParagraphElement",
    param: "HTMLParamElement",
    pre: "HTMLPreElement",
    progress: "HTMLProgressElement",
    q: "HTMLQuoteElement",
    s: "HTMLElement",
    samp: "HTMLElement",
    script: "HTMLScriptElement",
    section: "HTMLElement",
    select: "HTMLSelectElement",
    small: "HTMLElement",
    source: "HTMLSourceElement",
    span: "HTMLSpanElement",
    strike: "HTMLElement",
    strong: "HTMLElement",
    style: "HTMLStyleElement",
    sub: "HTMLElement",
    summary: "HTMLElement",
    sup: "HTMLElement",
    table: "HTMLTableElement",
    tbody: "HTMLTableSectionElement",
    td: "HTMLTableDataCellElement",
    textarea: "HTMLTextAreaElement",
    tfoot: "HTMLTableSectionElement",
    th: "HTMLTableHeaderCellElement",
    thead: "HTMLTableSectionElement",
    time: "HTMLTimeElement",
    title: "HTMLTitleElement",
    tr: "HTMLTableRowElement",
    track: "HTMLTrackElement",
    tt: "HTMLElement",
    u: "HTMLElement",
    ul: "HTMLUListElement",
    "var": "HTMLElement",
    video: "HTMLVideoElement",
    wbr: "HTMLElement"
},
html4.ELEMENT_DOM_INTERFACES = html4.ELEMENT_DOM_INTERFACES,
html4.ueffects = {
    NOT_LOADED: 0,
    SAME_DOCUMENT: 1,
    NEW_DOCUMENT: 2
},
html4.ueffects = html4.ueffects,
html4.URIEFFECTS = {
    "a::href": 2,
    "area::href": 2,
    "blockquote::cite": 0,
    "command::icon": 1,
    "del::cite": 0,
    "form::action": 2,
    "img::src": 1,
    "input::src": 1,
    "ins::cite": 0,
    "q::cite": 0,
    "video::poster": 1
},
html4.URIEFFECTS = html4.URIEFFECTS,
html4.ltypes = {
    UNSANDBOXED: 2,
    SANDBOXED: 1,
    DATA: 0
},
html4.ltypes = html4.ltypes,
html4.LOADERTYPES = {
    "a::href": 2,
    "area::href": 2,
    "blockquote::cite": 2,
    "command::icon": 1,
    "del::cite": 2,
    "form::action": 2,
    "img::src": 1,
    "input::src": 1,
    "ins::cite": 2,
    "q::cite": 2,
    "video::poster": 1
},
html4.LOADERTYPES = html4.LOADERTYPES,
"i" !== "I".toLowerCase())
    throw "I/i problem";
var html = function(e) {
    function t(e) {
        if (L.hasOwnProperty(e))
            return L[e];
        var t = e.match(S);
        if (t)
            return String.fromCharCode(parseInt(t[1], 10));
        if (t = e.match(F))
            return String.fromCharCode(parseInt(t[1], 16));
        if (R && q.test(e)) {
            R.innerHTML = "&" + e + ";";
            var n = R.textContent;
            return L[e] = n,
            n
        }
        return "&" + e + ";"
    }
    function n(e, n) {
        return t(n)
    }
    function r(e) {
        return e.replace(N, "")
    }
    function i(e) {
        return e.replace(I, n)
    }
    function o(e) {
        return ("" + e).replace(O, "&amp;").replace(H, "&lt;").replace(B, "&gt;").replace(j, "&#34;")
    }
    function a(e) {
        return e.replace(P, "&amp;$1").replace(H, "&lt;").replace(B, "&gt;")
    }
    function s(e) {
        var t = {
            cdata: e.cdata || e.cdata,
            comment: e.comment || e.comment,
            endDoc: e.endDoc || e.endDoc,
            endTag: e.endTag || e.endTag,
            pcdata: e.pcdata || e.pcdata,
            rcdata: e.rcdata || e.rcdata,
            startDoc: e.startDoc || e.startDoc,
            startTag: e.startTag || e.startTag
        };
        return function(e, n) {
            return u(e, t, n)
        }
    }
    function u(e, t, n) {
        var r = p(e)
          , i = {
            noMoreGT: !1,
            noMoreEndComments: !1
        };
        l(t, r, 0, i, n)
    }
    function c(e, t, n, r, i) {
        return function() {
            l(e, t, n, r, i)
        }
    }
    function l(t, n, r, i, o) {
        try {
            t.startDoc && 0 == r && t.startDoc(o);
            for (var a, s, u, l = r, p = n.length; p > l; ) {
                var m = n[l++]
                  , g = n[l];
                switch (m) {
                case "&":
                    z.test(g) ? (t.pcdata && t.pcdata("&" + g, o, G, c(t, n, l, i, o)),
                    l++) : t.pcdata && t.pcdata("&amp;", o, G, c(t, n, l, i, o));
                    break;
                case "</":
                    (a = /^([-\w:]+)[^\'\"]*/.exec(g)) ? a[0].length === g.length && ">" === n[l + 1] ? (l += 2,
                    u = a[1].toLowerCase(),
                    t.endTag && t.endTag(u, o, G, c(t, n, l, i, o))) : l = f(n, l, t, o, G, i) : t.pcdata && t.pcdata("&lt;/", o, G, c(t, n, l, i, o));
                    break;
                case "<":
                    if (a = /^([-\w:]+)\s*\/?/.exec(g))
                        if (a[0].length === g.length && ">" === n[l + 1]) {
                            l += 2,
                            u = a[1].toLowerCase(),
                            t.startTag && t.startTag(u, [], o, G, c(t, n, l, i, o));
                            var v = e.ELEMENTS[u];
                            if (v & $) {
                                var b = {
                                    name: u,
                                    next: l,
                                    eflags: v
                                };
                                l = d(n, b, t, o, G, i)
                            }
                        } else
                            l = h(n, l, t, o, G, i);
                    else
                        t.pcdata && t.pcdata("&lt;", o, G, c(t, n, l, i, o));
                    break;
                case "<!--":
                    if (!i.noMoreEndComments) {
                        for (s = l + 1; p > s && (">" !== n[s] || !/--$/.test(n[s - 1])); s++)
                            ;
                        if (p > s) {
                            if (t.comment) {
                                var y = n.slice(l, s).join("");
                                t.comment(y.substr(0, y.length - 2), o, G, c(t, n, s + 1, i, o))
                            }
                            l = s + 1
                        } else
                            i.noMoreEndComments = !0
                    }
                    i.noMoreEndComments && t.pcdata && t.pcdata("&lt;!--", o, G, c(t, n, l, i, o));
                    break;
                case "<!":
                    if (/^\w/.test(g)) {
                        if (!i.noMoreGT) {
                            for (s = l + 1; p > s && ">" !== n[s]; s++)
                                ;
                            p > s ? l = s + 1 : i.noMoreGT = !0
                        }
                        i.noMoreGT && t.pcdata && t.pcdata("&lt;!", o, G, c(t, n, l, i, o))
                    } else
                        t.pcdata && t.pcdata("&lt;!", o, G, c(t, n, l, i, o));
                    break;
                case "<?":
                    if (!i.noMoreGT) {
                        for (s = l + 1; p > s && ">" !== n[s]; s++)
                            ;
                        p > s ? l = s + 1 : i.noMoreGT = !0
                    }
                    i.noMoreGT && t.pcdata && t.pcdata("&lt;?", o, G, c(t, n, l, i, o));
                    break;
                case ">":
                    t.pcdata && t.pcdata("&gt;", o, G, c(t, n, l, i, o));
                    break;
                case "":
                    break;
                default:
                    t.pcdata && t.pcdata(m, o, G, c(t, n, l, i, o))
                }
            }
            t.endDoc && t.endDoc(o)
        } catch (_) {
            if (_ !== G)
                throw _
        }
    }
    function p(e) {
        var t = /(<\/|<\!--|<[!?]|[&<>])/g;
        if (e += "",
        V)
            return e.split(t);
        for (var n, r = [], i = 0; null  !== (n = t.exec(e)); )
            r.push(e.substring(i, n.index)),
            r.push(n[0]),
            i = n.index + n[0].length;
        return r.push(e.substring(i)),
        r
    }
    function f(e, t, n, r, i, o) {
        var a = m(e, t);
        return a ? (n.endTag && n.endTag(a.name, r, i, c(n, e, t, o, r)),
        a.next) : e.length
    }
    function h(e, t, n, r, i, o) {
        var a = m(e, t);
        return a ? (n.startTag && n.startTag(a.name, a.attrs, r, i, c(n, e, a.next, o, r)),
        a.eflags & $ ? d(e, a, n, r, i, o) : a.next) : e.length
    }
    function d(t, n, r, i, o, s) {
        var u = t.length;
        W.hasOwnProperty(n.name) || (W[n.name] = new RegExp("^" + n.name + "(?:[\\s\\/]|$)","i"));
        for (var l = W[n.name], p = n.next, f = n.next + 1; u > f && ("</" !== t[f - 1] || !l.test(t[f])); f++)
            ;
        u > f && (f -= 1);
        var h = t.slice(p, f).join("");
        if (n.eflags & e.eflags.CDATA)
            r.cdata && r.cdata(h, i, o, c(r, t, f, s, i));
        else {
            if (!(n.eflags & e.eflags.RCDATA))
                throw new Error("bug");
            r.rcdata && r.rcdata(a(h), i, o, c(r, t, f, s, i))
        }
        return f
    }
    function m(t, n) {
        var r = /^([-\w:]+)/.exec(t[n])
          , i = {};
        i.name = r[1].toLowerCase(),
        i.eflags = e.ELEMENTS[i.name];
        for (var o = t[n].substr(r[0].length), a = n + 1, s = t.length; s > a && ">" !== t[a]; a++)
            o += t[a];
        if (!(a >= s)) {
            for (var u = []; "" !== o; )
                if (r = U.exec(o)) {
                    if (r[4] && !r[5] || r[6] && !r[7]) {
                        for (var c = r[4] || r[6], l = !1, p = [o, t[a++]]; s > a; a++) {
                            if (l) {
                                if (">" === t[a])
                                    break
                            } else
                                0 <= t[a].indexOf(c) && (l = !0);
                            p.push(t[a])
                        }
                        if (a >= s)
                            break;
                        o = p.join("");
                        continue
                    }
                    var f = r[1].toLowerCase()
                      , h = r[2] ? g(r[3]) : "";
                    u.push(f, h),
                    o = o.substr(r[0].length)
                } else
                    o = o.replace(/^[\s\S][^a-z\s]*/, "");
            return i.attrs = u,
            i.next = a + 1,
            i
        }
    }
    function g(e) {
        var t = e.charCodeAt(0);
        return (34 === t || 39 === t) && (e = e.substr(1, e.length - 2)),
        i(r(e))
    }
    function v(t) {
        var n, r, i = function(e, t) {
            r || t.push(e)
        }
        ;
        return s({
            startDoc: function(e) {
                n = [],
                r = !1
            },
            startTag: function(i, a, s) {
                if (!r && e.ELEMENTS.hasOwnProperty(i)) {
                    var u = e.ELEMENTS[i];
                    if (!(u & e.eflags.FOLDABLE)) {
                        var c = t(i, a);
                        if (!c)
                            return void (r = !(u & e.eflags.EMPTY));
                        if ("object" != typeof c)
                            throw new Error("tagPolicy did not return object (old API?)");
                        if (!("attribs" in c))
                            throw new Error("tagPolicy gave no attribs");
                        a = c.attribs;
                        var l, p;
                        if ("tagName" in c ? (p = c.tagName,
                        l = e.ELEMENTS[p]) : (p = i,
                        l = u),
                        u & e.eflags.OPTIONAL_ENDTAG) {
                            var f = n[n.length - 1];
                            !f || f.orig !== i || f.rep === p && i === p || s.push("</", f.rep, ">")
                        }
                        u & e.eflags.EMPTY || n.push({
                            orig: i,
                            rep: p
                        }),
                        s.push("<", p);
                        for (var h = 0, d = a.length; d > h; h += 2) {
                            var m = a[h]
                              , g = a[h + 1];
                            null  !== g && void 0 !== g && s.push(" ", m, '="', o(g), '"')
                        }
                        s.push(">"),
                        u & e.eflags.EMPTY && !(l & e.eflags.EMPTY) && s.push("</", p, ">")
                    }
                }
            },
            endTag: function(t, i) {
                if (r)
                    return void (r = !1);
                if (e.ELEMENTS.hasOwnProperty(t)) {
                    var o = e.ELEMENTS[t];
                    if (!(o & (e.eflags.EMPTY | e.eflags.FOLDABLE))) {
                        var a;
                        if (o & e.eflags.OPTIONAL_ENDTAG)
                            for (a = n.length; --a >= 0; ) {
                                var s = n[a].orig;
                                if (s === t)
                                    break;
                                if (!(e.ELEMENTS[s] & e.eflags.OPTIONAL_ENDTAG))
                                    return
                            }
                        else
                            for (a = n.length; --a >= 0 && n[a].orig !== t; )
                                ;
                        if (0 > a)
                            return;
                        for (var u = n.length; --u > a; ) {
                            var c = n[u].rep;
                            e.ELEMENTS[c] & e.eflags.OPTIONAL_ENDTAG || i.push("</", c, ">")
                        }
                        a < n.length && (t = n[a].rep),
                        n.length = a,
                        i.push("</", t, ">")
                    }
                }
            },
            pcdata: i,
            rcdata: i,
            cdata: i,
            endDoc: function(e) {
                for (; n.length; n.length--)
                    e.push("</", n[n.length - 1].rep, ">")
            }
        })
    }
    function b(e, t, n, r, i) {
        if (!i)
            return null ;
        try {
            var o = URI.parse("" + e);
            if (o && (!o.hasScheme() || Y.test(o.getScheme()))) {
                var a = i(o, t, n, r);
                return a ? a.toString() : null
            }
        } catch (s) {
            return null
        }
        return null
    }
    function y(e, t, n, r, i) {
        if (n || e(t + " removed", {
            change: "removed",
            tagName: t
        }),
        r !== i) {
            var o = "changed";
            r && !i ? o = "removed" : !r && i && (o = "added"),
            e(t + "." + n + " " + o, {
                change: o,
                tagName: t,
                attribName: n,
                oldValue: r,
                newValue: i
            })
        }
    }
    function _(e, t, n) {
        var r;
        return r = t + "::" + n,
        e.hasOwnProperty(r) ? e[r] : (r = "*::" + n,
        e.hasOwnProperty(r) ? e[r] : void 0)
    }
    function k(t, n) {
        return _(e.LOADERTYPES, t, n)
    }
    function C(t, n) {
        return _(e.URIEFFECTS, t, n)
    }
    function w(t, n, r, i, o) {
        for (var a = 0; a < n.length; a += 2) {
            var s, u = n[a], c = n[a + 1], l = c, p = null ;
            if (s = t + "::" + u,
            (e.ATTRIBS.hasOwnProperty(s) || (s = "*::" + u,
            e.ATTRIBS.hasOwnProperty(s))) && (p = e.ATTRIBS[s]),
            null  !== p)
                switch (p) {
                case e.atype.NONE:
                    break;
                case e.atype.SCRIPT:
                    c = null ,
                    o && y(o, t, u, l, c);
                    break;
                case e.atype.STYLE:
                    if ("undefined" == typeof A) {
                        c = null ,
                        o && y(o, t, u, l, c);
                        break
                    }
                    var f = [];
                    A(c, {
                        declaration: function(t, n) {
                            var i = t.toLowerCase()
                              , o = D[i];
                            o && (M(i, o, n, r ? function(t) {
                                return b(t, e.ueffects.SAME_DOCUMENT, e.ltypes.SANDBOXED, {
                                    TYPE: "CSS",
                                    CSS_PROP: i
                                }, r)
                            }
                             : null ),
                            f.push(t + ": " + n.join(" ")))
                        }
                    }),
                    c = f.length > 0 ? f.join(" ; ") : null ,
                    o && y(o, t, u, l, c);
                    break;
                case e.atype.ID:
                case e.atype.IDREF:
                case e.atype.IDREFS:
                case e.atype.GLOBAL_NAME:
                case e.atype.LOCAL_NAME:
                case e.atype.CLASSES:
                    c = i ? i(c) : c,
                    o && y(o, t, u, l, c);
                    break;
                case e.atype.URI:
                    c = b(c, C(t, u), k(t, u), {
                        TYPE: "MARKUP",
                        XML_ATTR: u,
                        XML_TAG: t
                    }, r),
                    o && y(o, t, u, l, c);
                    break;
                case e.atype.URI_FRAGMENT:
                    c && "#" === c.charAt(0) ? (c = c.substring(1),
                    c = i ? i(c) : c,
                    null  !== c && void 0 !== c && (c = "#" + c)) : c = null ,
                    o && y(o, t, u, l, c);
                    break;
                default:
                    c = null ,
                    o && y(o, t, u, l, c)
                }
            else
                c = null ,
                o && y(o, t, u, l, c);
            n[a + 1] = c
        }
        return n
    }
    function E(t, n, r) {
        return function(i, o) {
            return e.ELEMENTS[i] & e.eflags.UNSAFE ? void (r && y(r, i, void 0, void 0, void 0)) : {
                attribs: w(i, o, t, n, r)
            }
        }
    }
    function T(e, t) {
        var n = [];
        return v(t)(e, n),
        n.join("")
    }
    function x(e, t, n, r) {
        var i = E(t, n, r);
        return T(e, i)
    }
    var A, M, D;
    "undefined" != typeof window && (A = window.parseCssDeclarations,
    M = window.sanitizeCssProperty,
    D = window.cssSchema);
    var L = {
        lt: "<",
        LT: "<",
        gt: ">",
        GT: ">",
        amp: "&",
        AMP: "&",
        quot: '"',
        apos: "'",
        nbsp: " "
    }
      , S = /^#(\d+)$/
      , F = /^#x([0-9A-Fa-f]+)$/
      , q = /^[A-Za-z][A-za-z0-9]+$/
      , R = "undefined" != typeof window && window.document ? window.document.createElement("textarea") : null
      , N = /\0/g
      , I = /&(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/g
      , z = /^(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/
      , O = /&/g
      , P = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi
      , H = /[<]/g
      , B = />/g
      , j = /\"/g
      , U = new RegExp("^\\s*([-.:\\w]+)(?:\\s*(=)\\s*((\")[^\"]*(\"|$)|(')[^']*('|$)|(?=[a-z][-\\w]*\\s*=)|[^\"'\\s]*))?","i")
      , V = 3 === "a,b".split(/(,)/).length
      , $ = e.eflags.CDATA | e.eflags.RCDATA
      , G = {}
      , W = {}
      , Y = /^(?:https?|mailto|data)$/i
      , Z = {};
    return Z.escapeAttrib = Z.escapeAttrib = o,
    Z.makeHtmlSanitizer = Z.makeHtmlSanitizer = v,
    Z.makeSaxParser = Z.makeSaxParser = s,
    Z.makeTagPolicy = Z.makeTagPolicy = E,
    Z.normalizeRCData = Z.normalizeRCData = a,
    Z.sanitize = Z.sanitize = x,
    Z.sanitizeAttribs = Z.sanitizeAttribs = w,
    Z.sanitizeWithPolicy = Z.sanitizeWithPolicy = T,
    Z.unescapeEntities = Z.unescapeEntities = i,
    Z
}(html4)
  , html_sanitize = html.sanitize;
html4.ATTRIBS["*::style"] = 0,
html4.ELEMENTS.style = 0,
html4.ATTRIBS["a::target"] = 0,
html4.ELEMENTS.video = 0,
html4.ATTRIBS["video::src"] = 0,
html4.ATTRIBS["video::poster"] = 0,
html4.ATTRIBS["video::controls"] = 0,
html4.ELEMENTS.audio = 0,
html4.ATTRIBS["audio::src"] = 0,
html4.ATTRIBS["video::autoplay"] = 0,
html4.ATTRIBS["video::controls"] = 0,
"undefined" != typeof module && (module.exports = html_sanitize),
define("sanitizeCaja", [], function() {}),
!function(e) {
    if ("object" == typeof exports && "undefined" != typeof module)
        module.exports = e();
    else if ("function" == typeof define && define.amd)
        define("MarkdownIt", [], e);
    else {
        var t;
        t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this,
        t.markdownit = e()
    }
}(function() {
    var e;
    return function t(e, n, r) {
        function i(a, s) {
            if (!n[a]) {
                if (!e[a]) {
                    var u = "function" == typeof require && require;
                    if (!s && u)
                        return u(a, !0);
                    if (o)
                        return o(a, !0);
                    var c = new Error("Cannot find module '" + a + "'");
                    throw (c.code = "MODULE_NOT_FOUND", c)
                }
                var l = n[a] = {
                    exports: {}
                };
                e[a][0].call(l.exports, function(t) {
                    var n = e[a][1][t];
                    return i(n ? n : t)
                }, l, l.exports, t, e, n, r)
            }
            return n[a].exports
        }
        for (var o = "function" == typeof require && require, a = 0; a < r.length; a++)
            i(r[a]);
        return i
    }({
        1: [function(e, t, n) {
            "use strict";
            t.exports = e("entities/maps/entities.json")
        }
        , {
            "entities/maps/entities.json": 54
        }],
        2: [function(e, t, n) {
            "use strict";
            t.exports = ["address", "article", "aside", "base", "basefont", "blockquote", "body", "caption", "center", "col", "colgroup", "dd", "details", "dialog", "dir", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "head", "header", "hr", "html", "iframe", "legend", "li", "link", "main", "menu", "menuitem", "meta", "nav", "noframes", "ol", "optgroup", "option", "p", "param", "pre", "section", "source", "title", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "title", "tr", "track", "ul"]
        }
        , {}],
        3: [function(e, t, n) {
            "use strict";
            var r = "[a-zA-Z_:][a-zA-Z0-9:._-]*"
              , i = "[^\"'=<>`\\x00-\\x20]+"
              , o = "'[^']*'"
              , a = '"[^"]*"'
              , s = "(?:" + i + "|" + o + "|" + a + ")"
              , u = "(?:\\s+" + r + "(?:\\s*=\\s*" + s + ")?)"
              , c = "<[A-Za-z][A-Za-z0-9\\-]*" + u + "*\\s*\\/?>"
              , l = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>"
              , p = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->"
              , f = "<[?].*?[?]>"
              , h = "<![A-Z]+\\s+[^>]*>"
              , d = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
              , m = new RegExp("^(?:" + c + "|" + l + "|" + p + "|" + f + "|" + h + "|" + d + ")")
              , g = new RegExp("^(?:" + c + "|" + l + ")");
            t.exports.HTML_TAG_RE = m,
            t.exports.HTML_OPEN_CLOSE_TAG_RE = g
        }
        , {}],
        4: [function(e, t, n) {
            "use strict";
            t.exports = ["coap", "doi", "javascript", "aaa", "aaas", "about", "acap", "cap", "cid", "crid", "data", "dav", "dict", "dns", "file", "ftp", "geo", "go", "gopher", "h323", "http", "https", "iax", "icap", "im", "imap", "info", "ipp", "iris", "iris.beep", "iris.xpc", "iris.xpcs", "iris.lwz", "ldap", "mailto", "mid", "msrp", "msrps", "mtqp", "mupdate", "news", "nfs", "ni", "nih", "nntp", "opaquelocktoken", "pop", "pres", "rtsp", "service", "session", "shttp", "sieve", "sip", "sips", "sms", "snmp", "soap.beep", "soap.beeps", "tag", "tel", "telnet", "tftp", "thismessage", "tn3270", "tip", "tv", "urn", "vemmi", "ws", "wss", "xcon", "xcon-userid", "xmlrpc.beep", "xmlrpc.beeps", "xmpp", "z39.50r", "z39.50s", "adiumxtra", "afp", "afs", "aim", "apt", "attachment", "aw", "beshare", "bitcoin", "bolo", "callto", "chrome", "chrome-extension", "com-eventbrite-attendee", "content", "cvs", "dlna-playsingle", "dlna-playcontainer", "dtn", "dvb", "ed2k", "facetime", "feed", "finger", "fish", "gg", "git", "gizmoproject", "gtalk", "hcp", "icon", "ipn", "irc", "irc6", "ircs", "itms", "jar", "jms", "keyparc", "lastfm", "ldaps", "magnet", "maps", "market", "message", "mms", "ms-help", "msnim", "mumble", "mvn", "notes", "oid", "palm", "paparazzi", "platform", "proxy", "psyc", "query", "res", "resource", "rmi", "rsync", "rtmp", "secondlife", "sftp", "sgn", "skype", "smb", "soldat", "spotify", "ssh", "steam", "svn", "teamspeak", "things", "udp", "unreal", "ut2004", "ventrilo", "view-source", "webcal", "wtai", "wyciwyg", "xfire", "xri", "ymsgr"]
        }
        , {}],
        5: [function(e, t, n) {
            "use strict";
            function r(e) {
                return Object.prototype.toString.call(e)
            }
            function i(e) {
                return "[object String]" === r(e)
            }
            function o(e, t) {
                return k.call(e, t)
            }
            function a(e) {
                var t = Array.prototype.slice.call(arguments, 1);
                return t.forEach(function(t) {
                    if (t) {
                        if ("object" != typeof t)
                            throw new TypeError(t + "must be object");
                        Object.keys(t).forEach(function(n) {
                            e[n] = t[n]
                        })
                    }
                }),
                e
            }
            function s(e, t, n) {
                return [].concat(e.slice(0, t), n, e.slice(t + 1))
            }
            function u(e) {
                return e >= 55296 && 57343 >= e ? !1 : e >= 64976 && 65007 >= e ? !1 : 65535 === (65535 & e) || 65534 === (65535 & e) ? !1 : e >= 0 && 8 >= e ? !1 : 11 === e ? !1 : e >= 14 && 31 >= e ? !1 : e >= 127 && 159 >= e ? !1 : e > 1114111 ? !1 : !0
            }
            function c(e) {
                if (e > 65535) {
                    e -= 65536;
                    var t = 55296 + (e >> 10)
                      , n = 56320 + (1023 & e);
                    return String.fromCharCode(t, n)
                }
                return String.fromCharCode(e)
            }
            function l(e, t) {
                var n = 0;
                return o(x, t) ? x[t] : 35 === t.charCodeAt(0) && T.test(t) && (n = "x" === t[1].toLowerCase() ? parseInt(t.slice(2), 16) : parseInt(t.slice(1), 10),
                u(n)) ? c(n) : e
            }
            function p(e) {
                return e.indexOf("\\") < 0 ? e : e.replace(C, "$1")
            }
            function f(e) {
                return e.indexOf("\\") < 0 && e.indexOf("&") < 0 ? e : e.replace(E, function(e, t, n) {
                    return t ? t : l(e, n)
                })
            }
            function h(e) {
                return D[e]
            }
            function d(e) {
                return A.test(e) ? e.replace(M, h) : e
            }
            function m(e) {
                return e.replace(L, "\\$&")
            }
            function g(e) {
                switch (e) {
                case 9:
                case 32:
                    return !0
                }
                return !1
            }
            function v(e) {
                if (e >= 8192 && 8202 >= e)
                    return !0;
                switch (e) {
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 32:
                case 160:
                case 5760:
                case 8239:
                case 8287:
                case 12288:
                    return !0
                }
                return !1
            }
            function b(e) {
                return S.test(e)
            }
            function y(e) {
                switch (e) {
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                case 38:
                case 39:
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                case 47:
                case 58:
                case 59:
                case 60:
                case 61:
                case 62:
                case 63:
                case 64:
                case 91:
                case 92:
                case 93:
                case 94:
                case 95:
                case 96:
                case 123:
                case 124:
                case 125:
                case 126:
                    return !0;
                default:
                    return !1
                }
            }
            function _(e) {
                return e.trim().replace(/\s+/g, " ").toUpperCase()
            }
            var k = Object.prototype.hasOwnProperty
              , C = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g
              , w = /&([a-z#][a-z0-9]{1,31});/gi
              , E = new RegExp(C.source + "|" + w.source,"gi")
              , T = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i
              , x = e("./entities")
              , A = /[&<>"]/
              , M = /[&<>"]/g
              , D = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;"
            }
              , L = /[.?*+^$[\]\\(){}|-]/g
              , S = e("uc.micro/categories/P/regex");
            n.lib = {},
            n.lib.mdurl = e("mdurl"),
            n.lib.ucmicro = e("uc.micro"),
            n.assign = a,
            n.isString = i,
            n.has = o,
            n.unescapeMd = p,
            n.unescapeAll = f,
            n.isValidEntityCode = u,
            n.fromCodePoint = c,
            n.escapeHtml = d,
            n.arrayReplaceAt = s,
            n.isSpace = g,
            n.isWhiteSpace = v,
            n.isMdAsciiPunct = y,
            n.isPunctChar = b,
            n.escapeRE = m,
            n.normalizeReference = _
        }
        , {
            "./entities": 1,
            mdurl: 60,
            "uc.micro": 66,
            "uc.micro/categories/P/regex": 64
        }],
        6: [function(e, t, n) {
            "use strict";
            n.parseLinkLabel = e("./parse_link_label"),
            n.parseLinkDestination = e("./parse_link_destination"),
            n.parseLinkTitle = e("./parse_link_title")
        }
        , {
            "./parse_link_destination": 7,
            "./parse_link_label": 8,
            "./parse_link_title": 9
        }],
        7: [function(e, t, n) {
            "use strict";
            var r = e("../common/utils").unescapeAll;
            t.exports = function(e, t, n) {
                var i, o, a = 0, s = t, u = {
                    ok: !1,
                    pos: 0,
                    lines: 0,
                    str: ""
                };
                if (60 === e.charCodeAt(t)) {
                    for (t++; n > t; ) {
                        if (i = e.charCodeAt(t),
                        10 === i)
                            return u;
                        if (62 === i)
                            return u.pos = t + 1,
                            u.str = r(e.slice(s + 1, t)),
                            u.ok = !0,
                            u;
                        92 === i && n > t + 1 ? t += 2 : t++
                    }
                    return u
                }
                for (o = 0; n > t && (i = e.charCodeAt(t),
                32 !== i) && !(32 > i || 127 === i); )
                    if (92 === i && n > t + 1)
                        t += 2;
                    else {
                        if (40 === i && (o++,
                        o > 1))
                            break;
                        if (41 === i && (o--,
                        0 > o))
                            break;
                        t++
                    }
                return s === t ? u : (u.str = r(e.slice(s, t)),
                u.lines = a,
                u.pos = t,
                u.ok = !0,
                u)
            }
        }
        , {
            "../common/utils": 5
        }],
        8: [function(e, t, n) {
            "use strict";
            t.exports = function(e, t, n) {
                var r, i, o, a, s = -1, u = e.posMax, c = e.pos;
                for (e.pos = t + 1,
                r = 1; e.pos < u; ) {
                    if (o = e.src.charCodeAt(e.pos),
                    93 === o && (r--,
                    0 === r)) {
                        i = !0;
                        break
                    }
                    if (a = e.pos,
                    e.md.inline.skipToken(e),
                    91 === o)
                        if (a === e.pos - 1)
                            r++;
                        else if (n)
                            return e.pos = c,
                            -1
                }
                return i && (s = e.pos),
                e.pos = c,
                s
            }
        }
        , {}],
        9: [function(e, t, n) {
            "use strict";
            var r = e("../common/utils").unescapeAll;
            t.exports = function(e, t, n) {
                var i, o, a = 0, s = t, u = {
                    ok: !1,
                    pos: 0,
                    lines: 0,
                    str: ""
                };
                if (t >= n)
                    return u;
                if (o = e.charCodeAt(t),
                34 !== o && 39 !== o && 40 !== o)
                    return u;
                for (t++,
                40 === o && (o = 41); n > t; ) {
                    if (i = e.charCodeAt(t),
                    i === o)
                        return u.pos = t + 1,
                        u.lines = a,
                        u.str = r(e.slice(s + 1, t)),
                        u.ok = !0,
                        u;
                    10 === i ? a++ : 92 === i && n > t + 1 && (t++,
                    10 === e.charCodeAt(t) && a++),
                    t++
                }
                return u
            }
        }
        , {
            "../common/utils": 5
        }],
        10: [function(e, t, n) {
            "use strict";
            function r(e) {
                var t = e.trim().toLowerCase();
                return v.test(t) ? b.test(t) ? !0 : !1 : !0
            }
            function i(e) {
                var t = d.parse(e, !0);
                if (t.hostname && (!t.protocol || y.indexOf(t.protocol) >= 0))
                    try {
                        t.hostname = m.toASCII(t.hostname)
                    } catch (n) {}
                return d.encode(d.format(t))
            }
            function o(e) {
                var t = d.parse(e, !0);
                if (t.hostname && (!t.protocol || y.indexOf(t.protocol) >= 0))
                    try {
                        t.hostname = m.toUnicode(t.hostname)
                    } catch (n) {}
                return d.decode(d.format(t))
            }
            function a(e, t) {
                return this instanceof a ? (t || s.isString(e) || (t = e || {},
                e = "default"),
                this.inline = new f,
                this.block = new p,
                this.core = new l,
                this.renderer = new c,
                this.linkify = new h,
                this.validateLink = r,
                this.normalizeLink = i,
                this.normalizeLinkText = o,
                this.utils = s,
                this.helpers = u,
                this.options = {},
                this.configure(e),
                void (t && this.set(t))) : new a(e,t)
            }
            var s = e("./common/utils")
              , u = e("./helpers")
              , c = e("./renderer")
              , l = e("./parser_core")
              , p = e("./parser_block")
              , f = e("./parser_inline")
              , h = e("linkify-it")
              , d = e("mdurl")
              , m = e("punycode")
              , g = {
                "default": e("./presets/default"),
                zero: e("./presets/zero"),
                commonmark: e("./presets/commonmark")
            }
              , v = /^(vbscript|javascript|file|data):/
              , b = /^data:image\/(gif|png|jpeg|webp);/
              , y = ["http:", "https:", "mailto:"];
            a.prototype.set = function(e) {
                return s.assign(this.options, e),
                this
            }
            ,
            a.prototype.configure = function(e) {
                var t, n = this;
                if (s.isString(e) && (t = e,
                e = g[t],
                !e))
                    throw new Error('Wrong `markdown-it` preset "' + t + '", check name');
                if (!e)
                    throw new Error("Wrong `markdown-it` preset, can't be empty");
                return e.options && n.set(e.options),
                e.components && Object.keys(e.components).forEach(function(t) {
                    e.components[t].rules && n[t].ruler.enableOnly(e.components[t].rules),
                    e.components[t].rules2 && n[t].ruler2.enableOnly(e.components[t].rules2)
                }),
                this
            }
            ,
            a.prototype.enable = function(e, t) {
                var n = [];
                Array.isArray(e) || (e = [e]),
                ["core", "block", "inline"].forEach(function(t) {
                    n = n.concat(this[t].ruler.enable(e, !0))
                }, this),
                n = n.concat(this.inline.ruler2.enable(e, !0));
                var r = e.filter(function(e) {
                    return n.indexOf(e) < 0
                });
                if (r.length && !t)
                    throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + r);
                return this
            }
            ,
            a.prototype.disable = function(e, t) {
                var n = [];
                Array.isArray(e) || (e = [e]),
                ["core", "block", "inline"].forEach(function(t) {
                    n = n.concat(this[t].ruler.disable(e, !0))
                }, this),
                n = n.concat(this.inline.ruler2.disable(e, !0));
                var r = e.filter(function(e) {
                    return n.indexOf(e) < 0
                });
                if (r.length && !t)
                    throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + r);
                return this
            }
            ,
            a.prototype.use = function(e) {
                var t = [this].concat(Array.prototype.slice.call(arguments, 1));
                return e.apply(e, t),
                this
            }
            ,
            a.prototype.parse = function(e, t) {
                var n = new this.core.State(e,this,t);
                return this.core.process(n),
                n.tokens
            }
            ,
            a.prototype.render = function(e, t) {
                return t = t || {},
                this.renderer.render(this.parse(e, t), this.options, t)
            }
            ,
            a.prototype.parseInline = function(e, t) {
                var n = new this.core.State(e,this,t);
                return n.inlineMode = !0,
                this.core.process(n),
                n.tokens
            }
            ,
            a.prototype.renderInline = function(e, t) {
                return t = t || {},
                this.renderer.render(this.parseInline(e, t), this.options, t)
            }
            ,
            t.exports = a
        }
        , {
            "./common/utils": 5,
            "./helpers": 6,
            "./parser_block": 11,
            "./parser_core": 12,
            "./parser_inline": 13,
            "./presets/commonmark": 14,
            "./presets/default": 15,
            "./presets/zero": 16,
            "./renderer": 17,
            "linkify-it": 55,
            mdurl: 60,
            punycode: 53
        }],
        11: [function(e, t, n) {
            "use strict";
            function r() {
                this.ruler = new i;
                for (var e = 0; e < o.length; e++)
                    this.ruler.push(o[e][0], o[e][1], {
                        alt: (o[e][2] || []).slice()
                    })
            }
            var i = e("./ruler")
              , o = [["table", e("./rules_block/table"), ["paragraph", "reference"]], ["code", e("./rules_block/code")], ["fence", e("./rules_block/fence"), ["paragraph", "reference", "blockquote", "list"]], ["blockquote", e("./rules_block/blockquote"), ["paragraph", "reference", "list"]], ["hr", e("./rules_block/hr"), ["paragraph", "reference", "blockquote", "list"]], ["list", e("./rules_block/list"), ["paragraph", "reference", "blockquote"]], ["reference", e("./rules_block/reference")], ["heading", e("./rules_block/heading"), ["paragraph", "reference", "blockquote"]], ["lheading", e("./rules_block/lheading")], ["html_block", e("./rules_block/html_block"), ["paragraph", "reference", "blockquote"]], ["paragraph", e("./rules_block/paragraph")]];
            r.prototype.tokenize = function(e, t, n) {
                for (var r, i, o = this.ruler.getRules(""), a = o.length, s = t, u = !1, c = e.md.options.maxNesting; n > s && (e.line = s = e.skipEmptyLines(s),
                !(s >= n)) && !(e.sCount[s] < e.blkIndent); ) {
                    if (e.level >= c) {
                        e.line = n;
                        break
                    }
                    for (i = 0; a > i && !(r = o[i](e, s, n, !1)); i++)
                        ;
                    if (e.tight = !u,
                    e.isEmpty(e.line - 1) && (u = !0),
                    s = e.line,
                    n > s && e.isEmpty(s)) {
                        if (u = !0,
                        s++,
                        n > s && "list" === e.parentType && e.isEmpty(s))
                            break;
                        e.line = s
                    }
                }
            }
            ,
            r.prototype.parse = function(e, t, n, r) {
                var i;
                return e ? (i = new this.State(e,t,n,r),
                void this.tokenize(i, i.line, i.lineMax)) : []
            }
            ,
            r.prototype.State = e("./rules_block/state_block"),
            t.exports = r
        }
        , {
            "./ruler": 18,
            "./rules_block/blockquote": 19,
            "./rules_block/code": 20,
            "./rules_block/fence": 21,
            "./rules_block/heading": 22,
            "./rules_block/hr": 23,
            "./rules_block/html_block": 24,
            "./rules_block/lheading": 25,
            "./rules_block/list": 26,
            "./rules_block/paragraph": 27,
            "./rules_block/reference": 28,
            "./rules_block/state_block": 29,
            "./rules_block/table": 30
        }],
        12: [function(e, t, n) {
            "use strict";
            function r() {
                this.ruler = new i;
                for (var e = 0; e < o.length; e++)
                    this.ruler.push(o[e][0], o[e][1])
            }
            var i = e("./ruler")
              , o = [["normalize", e("./rules_core/normalize")], ["block", e("./rules_core/block")], ["inline", e("./rules_core/inline")], ["linkify", e("./rules_core/linkify")], ["replacements", e("./rules_core/replacements")], ["smartquotes", e("./rules_core/smartquotes")]];
            r.prototype.process = function(e) {
                var t, n, r;
                for (r = this.ruler.getRules(""),
                t = 0,
                n = r.length; n > t; t++)
                    r[t](e)
            }
            ,
            r.prototype.State = e("./rules_core/state_core"),
            t.exports = r
        }
        , {
            "./ruler": 18,
            "./rules_core/block": 31,
            "./rules_core/inline": 32,
            "./rules_core/linkify": 33,
            "./rules_core/normalize": 34,
            "./rules_core/replacements": 35,
            "./rules_core/smartquotes": 36,
            "./rules_core/state_core": 37
        }],
        13: [function(e, t, n) {
            "use strict";
            function r() {
                var e;
                for (this.ruler = new i,
                e = 0; e < o.length; e++)
                    this.ruler.push(o[e][0], o[e][1]);
                for (this.ruler2 = new i,
                e = 0; e < a.length; e++)
                    this.ruler2.push(a[e][0], a[e][1])
            }
            var i = e("./ruler")
              , o = [["text", e("./rules_inline/text")], ["newline", e("./rules_inline/newline")], ["escape", e("./rules_inline/escape")], ["backticks", e("./rules_inline/backticks")], ["strikethrough", e("./rules_inline/strikethrough").tokenize], ["emphasis", e("./rules_inline/emphasis").tokenize], ["link", e("./rules_inline/link")], ["image", e("./rules_inline/image")], ["autolink", e("./rules_inline/autolink")], ["html_inline", e("./rules_inline/html_inline")], ["entity", e("./rules_inline/entity")]]
              , a = [["balance_pairs", e("./rules_inline/balance_pairs")], ["strikethrough", e("./rules_inline/strikethrough").postProcess], ["emphasis", e("./rules_inline/emphasis").postProcess], ["text_collapse", e("./rules_inline/text_collapse")]];
            r.prototype.skipToken = function(e) {
                var t, n = e.pos, r = this.ruler.getRules(""), i = r.length, o = e.md.options.maxNesting, a = e.cache;
                if ("undefined" != typeof a[n])
                    return void (e.pos = a[n]);
                if (e.level < o)
                    for (t = 0; i > t; t++)
                        if (r[t](e, !0))
                            return void (a[n] = e.pos);
                e.pos++,
                a[n] = e.pos
            }
            ,
            r.prototype.tokenize = function(e) {
                for (var t, n, r = this.ruler.getRules(""), i = r.length, o = e.posMax, a = e.md.options.maxNesting; e.pos < o; ) {
                    if (e.level < a)
                        for (n = 0; i > n && !(t = r[n](e, !1)); n++)
                            ;
                    if (t) {
                        if (e.pos >= o)
                            break
                    } else
                        e.pending += e.src[e.pos++]
                }
                e.pending && e.pushPending()
            }
            ,
            r.prototype.parse = function(e, t, n, r) {
                var i, o, a, s = new this.State(e,t,n,r);
                for (this.tokenize(s),
                o = this.ruler2.getRules(""),
                a = o.length,
                i = 0; a > i; i++)
                    o[i](s)
            }
            ,
            r.prototype.State = e("./rules_inline/state_inline"),
            t.exports = r
        }
        , {
            "./ruler": 18,
            "./rules_inline/autolink": 38,
            "./rules_inline/backticks": 39,
            "./rules_inline/balance_pairs": 40,
            "./rules_inline/emphasis": 41,
            "./rules_inline/entity": 42,
            "./rules_inline/escape": 43,
            "./rules_inline/html_inline": 44,
            "./rules_inline/image": 45,
            "./rules_inline/link": 46,
            "./rules_inline/newline": 47,
            "./rules_inline/state_inline": 48,
            "./rules_inline/strikethrough": 49,
            "./rules_inline/text": 50,
            "./rules_inline/text_collapse": 51
        }],
        14: [function(e, t, n) {
            "use strict";
            t.exports = {
                options: {
                    html: !0,
                    xhtmlOut: !0,
                    breaks: !1,
                    langPrefix: "language-",
                    linkify: !1,
                    typographer: !1,
                    quotes: "“”‘’",
                    highlight: null ,
                    maxNesting: 20
                },
                components: {
                    core: {
                        rules: ["normalize", "block", "inline"]
                    },
                    block: {
                        rules: ["blockquote", "code", "fence", "heading", "hr", "html_block", "lheading", "list", "reference", "paragraph"]
                    },
                    inline: {
                        rules: ["autolink", "backticks", "emphasis", "entity", "escape", "html_inline", "image", "link", "newline", "text"],
                        rules2: ["balance_pairs", "emphasis", "text_collapse"]
                    }
                }
            }
        }
        , {}],
        15: [function(e, t, n) {
            "use strict";
            t.exports = {
                options: {
                    html: !1,
                    xhtmlOut: !1,
                    breaks: !1,
                    langPrefix: "language-",
                    linkify: !1,
                    typographer: !1,
                    quotes: "“”‘’",
                    highlight: null ,
                    maxNesting: 20
                },
                components: {
                    core: {},
                    block: {},
                    inline: {}
                }
            }
        }
        , {}],
        16: [function(e, t, n) {
            "use strict";
            t.exports = {
                options: {
                    html: !1,
                    xhtmlOut: !1,
                    breaks: !1,
                    langPrefix: "language-",
                    linkify: !1,
                    typographer: !1,
                    quotes: "“”‘’",
                    highlight: null ,
                    maxNesting: 20
                },
                components: {
                    core: {
                        rules: ["normalize", "block", "inline"]
                    },
                    block: {
                        rules: ["paragraph"]
                    },
                    inline: {
                        rules: ["text"],
                        rules2: ["balance_pairs", "text_collapse"]
                    }
                }
            }
        }
        , {}],
        17: [function(e, t, n) {
            "use strict";
            function r() {
                this.rules = i({}, s)
            }
            var i = e("./common/utils").assign
              , o = e("./common/utils").unescapeAll
              , a = e("./common/utils").escapeHtml
              , s = {};
            s.code_inline = function(e, t) {
                return "<code>" + a(e[t].content) + "</code>"
            }
            ,
            s.code_block = function(e, t) {
                return "<pre><code>" + a(e[t].content) + "</code></pre>\n"
            }
            ,
            s.fence = function(e, t, n, r, i) {
                var s, u = e[t], c = u.info ? o(u.info).trim() : "", l = "";
                return c && (l = c.split(/\s+/g)[0],
                u.attrPush(["class", n.langPrefix + l])),
                s = n.highlight ? n.highlight(u.content, l) || a(u.content) : a(u.content),
                "<pre><code" + i.renderAttrs(u) + ">" + s + "</code></pre>\n"
            }
            ,
            s.image = function(e, t, n, r, i) {
                var o = e[t];
                return o.attrs[o.attrIndex("alt")][1] = i.renderInlineAsText(o.children, n, r),
                i.renderToken(e, t, n)
            }
            ,
            s.hardbreak = function(e, t, n) {
                return n.xhtmlOut ? "<br />\n" : "<br>\n"
            }
            ,
            s.softbreak = function(e, t, n) {
                return n.breaks ? n.xhtmlOut ? "<br />\n" : "<br>\n" : "\n"
            }
            ,
            s.text = function(e, t) {
                return a(e[t].content)
            }
            ,
            s.html_block = function(e, t) {
                return e[t].content
            }
            ,
            s.html_inline = function(e, t) {
                return e[t].content
            }
            ,
            r.prototype.renderAttrs = function(e) {
                var t, n, r;
                if (!e.attrs)
                    return "";
                for (r = "",
                t = 0,
                n = e.attrs.length; n > t; t++)
                    r += " " + a(e.attrs[t][0]) + '="' + a(e.attrs[t][1]) + '"';
                return r
            }
            ,
            r.prototype.renderToken = function(e, t, n) {
                var r, i = "", o = !1, a = e[t];
                return a.hidden ? "" : (a.block && -1 !== a.nesting && t && e[t - 1].hidden && (i += "\n"),
                i += (-1 === a.nesting ? "</" : "<") + a.tag,
                i += this.renderAttrs(a),
                0 === a.nesting && n.xhtmlOut && (i += " /"),
                a.block && (o = !0,
                1 === a.nesting && t + 1 < e.length && (r = e[t + 1],
                "inline" === r.type || r.hidden ? o = !1 : -1 === r.nesting && r.tag === a.tag && (o = !1))),
                i += o ? ">\n" : ">")
            }
            ,
            r.prototype.renderInline = function(e, t, n) {
                for (var r, i = "", o = this.rules, a = 0, s = e.length; s > a; a++)
                    r = e[a].type,
                    i += "undefined" != typeof o[r] ? o[r](e, a, t, n, this) : this.renderToken(e, a, t);
                return i
            }
            ,
            r.prototype.renderInlineAsText = function(e, t, n) {
                for (var r = "", i = this.rules, o = 0, a = e.length; a > o; o++)
                    "text" === e[o].type ? r += i.text(e, o, t, n, this) : "image" === e[o].type && (r += this.renderInlineAsText(e[o].children, t, n));
                return r
            }
            ,
            r.prototype.render = function(e, t, n) {
                var r, i, o, a = "", s = this.rules;
                for (r = 0,
                i = e.length; i > r; r++)
                    o = e[r].type,
                    a += "inline" === o ? this.renderInline(e[r].children, t, n) : "undefined" != typeof s[o] ? s[e[r].type](e, r, t, n, this) : this.renderToken(e, r, t, n);
                return a
            }
            ,
            t.exports = r
        }
        , {
            "./common/utils": 5
        }],
        18: [function(e, t, n) {
            "use strict";
            function r() {
                this.__rules__ = [],
                this.__cache__ = null
            }
            r.prototype.__find__ = function(e) {
                for (var t = 0; t < this.__rules__.length; t++)
                    if (this.__rules__[t].name === e)
                        return t;
                return -1
            }
            ,
            r.prototype.__compile__ = function() {
                var e = this
                  , t = [""];
                e.__rules__.forEach(function(e) {
                    e.enabled && e.alt.forEach(function(e) {
                        t.indexOf(e) < 0 && t.push(e)
                    })
                }),
                e.__cache__ = {},
                t.forEach(function(t) {
                    e.__cache__[t] = [],
                    e.__rules__.forEach(function(n) {
                        n.enabled && (t && n.alt.indexOf(t) < 0 || e.__cache__[t].push(n.fn))
                    })
                })
            }
            ,
            r.prototype.at = function(e, t, n) {
                var r = this.__find__(e)
                  , i = n || {};
                if (-1 === r)
                    throw new Error("Parser rule not found: " + e);
                this.__rules__[r].fn = t,
                this.__rules__[r].alt = i.alt || [],
                this.__cache__ = null
            }
            ,
            r.prototype.before = function(e, t, n, r) {
                var i = this.__find__(e)
                  , o = r || {};
                if (-1 === i)
                    throw new Error("Parser rule not found: " + e);
                this.__rules__.splice(i, 0, {
                    name: t,
                    enabled: !0,
                    fn: n,
                    alt: o.alt || []
                }),
                this.__cache__ = null
            }
            ,
            r.prototype.after = function(e, t, n, r) {
                var i = this.__find__(e)
                  , o = r || {};
                if (-1 === i)
                    throw new Error("Parser rule not found: " + e);
                this.__rules__.splice(i + 1, 0, {
                    name: t,
                    enabled: !0,
                    fn: n,
                    alt: o.alt || []
                }),
                this.__cache__ = null
            }
            ,
            r.prototype.push = function(e, t, n) {
                var r = n || {};
                this.__rules__.push({
                    name: e,
                    enabled: !0,
                    fn: t,
                    alt: r.alt || []
                }),
                this.__cache__ = null
            }
            ,
            r.prototype.enable = function(e, t) {
                Array.isArray(e) || (e = [e]);
                var n = [];
                return e.forEach(function(e) {
                    var r = this.__find__(e);
                    if (0 > r) {
                        if (t)
                            return;
                        throw new Error("Rules manager: invalid rule name " + e)
                    }
                    this.__rules__[r].enabled = !0,
                    n.push(e)
                }, this),
                this.__cache__ = null ,
                n
            }
            ,
            r.prototype.enableOnly = function(e, t) {
                Array.isArray(e) || (e = [e]),
                this.__rules__.forEach(function(e) {
                    e.enabled = !1
                }),
                this.enable(e, t)
            }
            ,
            r.prototype.disable = function(e, t) {
                Array.isArray(e) || (e = [e]);
                var n = [];
                return e.forEach(function(e) {
                    var r = this.__find__(e);
                    if (0 > r) {
                        if (t)
                            return;
                        throw new Error("Rules manager: invalid rule name " + e)
                    }
                    this.__rules__[r].enabled = !1,
                    n.push(e)
                }, this),
                this.__cache__ = null ,
                n
            }
            ,
            r.prototype.getRules = function(e) {
                return null  === this.__cache__ && this.__compile__(),
                this.__cache__[e] || []
            }
            ,
            t.exports = r
        }
        , {}],
        19: [function(e, t, n) {
            "use strict";
            var r = e("../common/utils").isSpace;
            t.exports = function(e, t, n, i) {
                var o, a, s, u, c, l, p, f, h, d, m, g, v, b, y, _, k = e.bMarks[t] + e.tShift[t], C = e.eMarks[t];
                if (62 !== e.src.charCodeAt(k++))
                    return !1;
                if (i)
                    return !0;
                for (32 === e.src.charCodeAt(k) && k++,
                l = e.blkIndent,
                e.blkIndent = 0,
                h = d = e.sCount[t] + k - (e.bMarks[t] + e.tShift[t]),
                c = [e.bMarks[t]],
                e.bMarks[t] = k; C > k && (m = e.src.charCodeAt(k),
                r(m)); )
                    9 === m ? d += 4 - d % 4 : d++,
                    k++;
                for (a = k >= C,
                u = [e.sCount[t]],
                e.sCount[t] = d - h,
                s = [e.tShift[t]],
                e.tShift[t] = k - e.bMarks[t],
                g = e.md.block.ruler.getRules("blockquote"),
                o = t + 1; n > o && !(e.sCount[o] < l) && (k = e.bMarks[o] + e.tShift[o],
                C = e.eMarks[o],
                !(k >= C)); o++)
                    if (62 !== e.src.charCodeAt(k++)) {
                        if (a)
                            break;
                        for (_ = !1,
                        b = 0,
                        y = g.length; y > b; b++)
                            if (g[b](e, o, n, !0)) {
                                _ = !0;
                                break
                            }
                        if (_)
                            break;
                        c.push(e.bMarks[o]),
                        s.push(e.tShift[o]),
                        u.push(e.sCount[o]),
                        e.sCount[o] = -1
                    } else {
                        for (32 === e.src.charCodeAt(k) && k++,
                        h = d = e.sCount[o] + k - (e.bMarks[o] + e.tShift[o]),
                        c.push(e.bMarks[o]),
                        e.bMarks[o] = k; C > k && (m = e.src.charCodeAt(k),
                        r(m)); )
                            9 === m ? d += 4 - d % 4 : d++,
                            k++;
                        a = k >= C,
                        u.push(e.sCount[o]),
                        e.sCount[o] = d - h,
                        s.push(e.tShift[o]),
                        e.tShift[o] = k - e.bMarks[o]
                    }
                for (p = e.parentType,
                e.parentType = "blockquote",
                v = e.push("blockquote_open", "blockquote", 1),
                v.markup = ">",
                v.map = f = [t, 0],
                e.md.block.tokenize(e, t, o),
                v = e.push("blockquote_close", "blockquote", -1),
                v.markup = ">",
                e.parentType = p,
                f[1] = e.line,
                b = 0; b < s.length; b++)
                    e.bMarks[b + t] = c[b],
                    e.tShift[b + t] = s[b],
                    e.sCount[b + t] = u[b];
                return e.blkIndent = l,
                !0
            }
        }
        , {
            "../common/utils": 5
        }],
        20: [function(e, t, n) {
            "use strict";
            t.exports = function(e, t, n) {
                var r, i, o;
                if (e.sCount[t] - e.blkIndent < 4)
                    return !1;
                for (i = r = t + 1; n > r; )
                    if (e.isEmpty(r))
                        r++;
                    else {
                        if (!(e.sCount[r] - e.blkIndent >= 4))
                            break;
                        r++,
                        i = r
                    }
                return e.line = r,
                o = e.push("code_block", "code", 0),
                o.content = e.getLines(t, i, 4 + e.blkIndent, !0),
                o.map = [t, e.line],
                !0
            }
        }
        , {}],
        21: [function(e, t, n) {
            "use strict";
            t.exports = function(e, t, n, r) {
                var i, o, a, s, u, c, l, p = !1, f = e.bMarks[t] + e.tShift[t], h = e.eMarks[t];
                if (f + 3 > h)
                    return !1;
                if (i = e.src.charCodeAt(f),
                126 !== i && 96 !== i)
                    return !1;
                if (u = f,
                f = e.skipChars(f, i),
                o = f - u,
                3 > o)
                    return !1;
                if (l = e.src.slice(u, f),
                a = e.src.slice(f, h),
                a.indexOf("`") >= 0)
                    return !1;
                if (r)
                    return !0;
                for (s = t; s++,
                !(s >= n || (f = u = e.bMarks[s] + e.tShift[s],
                h = e.eMarks[s],
                h > f && e.sCount[s] < e.blkIndent)); )
                    if (e.src.charCodeAt(f) === i && !(e.sCount[s] - e.blkIndent >= 4 || (f = e.skipChars(f, i),
                    o > f - u || (f = e.skipSpaces(f),
                    h > f)))) {
                        p = !0;
                        break
                    }
                return o = e.sCount[t],
                e.line = s + (p ? 1 : 0),
                c = e.push("fence", "code", 0),
                c.info = a,
                c.content = e.getLines(t + 1, s, o, !0),
                c.markup = l,
                c.map = [t, e.line],
                !0
            }
        }
        , {}],
        22: [function(e, t, n) {
            "use strict";
            var r = e("../common/utils").isSpace;
            t.exports = function(e, t, n, i) {
                var o, a, s, u, c = e.bMarks[t] + e.tShift[t], l = e.eMarks[t];
                if (o = e.src.charCodeAt(c),
                35 !== o || c >= l)
                    return !1;
                for (a = 1,
                o = e.src.charCodeAt(++c); 35 === o && l > c && 6 >= a; )
                    a++,
                    o = e.src.charCodeAt(++c);
                return a > 6 || l > c && 32 !== o ? !1 : i ? !0 : (l = e.skipSpacesBack(l, c),
                s = e.skipCharsBack(l, 35, c),
                s > c && r(e.src.charCodeAt(s - 1)) && (l = s),
                e.line = t + 1,
                u = e.push("heading_open", "h" + String(a), 1),
                u.markup = "########".slice(0, a),
                u.map = [t, e.line],
                u = e.push("inline", "", 0),
                u.content = e.src.slice(c, l).trim(),
                u.map = [t, e.line],
                u.children = [],
                u = e.push("heading_close", "h" + String(a), -1),
                u.markup = "########".slice(0, a),
                !0)
            }
        }
        , {
            "../common/utils": 5
        }],
        23: [function(e, t, n) {
            "use strict";
            var r = e("../common/utils").isSpace;
            t.exports = function(e, t, n, i) {
                var o, a, s, u, c = e.bMarks[t] + e.tShift[t], l = e.eMarks[t];
                if (o = e.src.charCodeAt(c++),
                42 !== o && 45 !== o && 95 !== o)
                    return !1;
                for (a = 1; l > c; ) {
                    if (s = e.src.charCodeAt(c++),
                    s !== o && !r(s))
                        return !1;
                    s === o && a++
                }
                return 3 > a ? !1 : i ? !0 : (e.line = t + 1,
                u = e.push("hr", "hr", 0),
                u.map = [t, e.line],
                u.markup = Array(a + 1).join(String.fromCharCode(o)),
                !0)
            }
        }
        , {
            "../common/utils": 5
        }],
        24: [function(e, t, n) {
            "use strict";
            var r = e("../common/html_blocks")
              , i = e("../common/html_re").HTML_OPEN_CLOSE_TAG_RE
              , o = [[/^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, !0], [/^<!--/, /-->/, !0], [/^<\?/, /\?>/, !0], [/^<![A-Z]/, />/, !0], [/^<!\[CDATA\[/, /\]\]>/, !0], [new RegExp("^</?(" + r.join("|") + ")(?=(\\s|/?>|$))","i"), /^$/, !0], [new RegExp(i.source + "\\s*$"), /^$/, !1]];
            t.exports = function(e, t, n, r) {
                var i, a, s, u, c = e.bMarks[t] + e.tShift[t], l = e.eMarks[t];
                if (!e.md.options.html)
                    return !1;
                if (60 !== e.src.charCodeAt(c))
                    return !1;
                for (u = e.src.slice(c, l),
                i = 0; i < o.length && !o[i][0].test(u); i++)
                    ;
                if (i === o.length)
                    return !1;
                if (r)
                    return o[i][2];
                if (a = t + 1,
                !o[i][1].test(u))
                    for (; n > a && !(e.sCount[a] < e.blkIndent); a++)
                        if (c = e.bMarks[a] + e.tShift[a],
                        l = e.eMarks[a],
                        u = e.src.slice(c, l),
                        o[i][1].test(u)) {
                            0 !== u.length && a++;
                            break
                        }
                return e.line = a,
                s = e.push("html_block", "", 0),
                s.map = [t, a],
                s.content = e.getLines(t, a, e.blkIndent, !0),
                !0
            }
        }
        , {
            "../common/html_blocks": 2,
            "../common/html_re": 3
        }],
        25: [function(e, t, n) {
            "use strict";
            t.exports = function(e, t, n) {
                var r, i, o, a, s, u = t + 1;
                return u >= n ? !1 : e.sCount[u] < e.blkIndent ? !1 : e.sCount[u] - e.blkIndent > 3 ? !1 : (i = e.bMarks[u] + e.tShift[u],
                o = e.eMarks[u],
                i >= o ? !1 : (r = e.src.charCodeAt(i),
                45 !== r && 61 !== r ? !1 : (i = e.skipChars(i, r),
                i = e.skipSpaces(i),
                o > i ? !1 : (i = e.bMarks[t] + e.tShift[t],
                e.line = u + 1,
                s = 61 === r ? 1 : 2,
                a = e.push("heading_open", "h" + String(s), 1),
                a.markup = String.fromCharCode(r),
                a.map = [t, e.line],
                a = e.push("inline", "", 0),
                a.content = e.src.slice(i, e.eMarks[t]).trim(),
                a.map = [t, e.line - 1],
                a.children = [],
                a = e.push("heading_close", "h" + String(s), -1),
                a.markup = String.fromCharCode(r),
                !0))))
            }
        }
        , {}],
        26: [function(e, t, n) {
            "use strict";
            function r(e, t) {
                var n, r, i, o;
                return r = e.bMarks[t] + e.tShift[t],
                i = e.eMarks[t],
                n = e.src.charCodeAt(r++),
                42 !== n && 45 !== n && 43 !== n ? -1 : i > r && (o = e.src.charCodeAt(r),
                !a(o)) ? -1 : r
            }
            function i(e, t) {
                var n, r = e.bMarks[t] + e.tShift[t], i = r, o = e.eMarks[t];
                if (i + 1 >= o)
                    return -1;
                if (n = e.src.charCodeAt(i++),
                48 > n || n > 57)
                    return -1;
                for (; ; ) {
                    if (i >= o)
                        return -1;
                    if (n = e.src.charCodeAt(i++),
                    !(n >= 48 && 57 >= n)) {
                        if (41 === n || 46 === n)
                            break;
                        return -1
                    }
                    if (i - r >= 10)
                        return -1
                }
                return o > i && (n = e.src.charCodeAt(i),
                !a(n)) ? -1 : i
            }
            function o(e, t) {
                var n, r, i = e.level + 2;
                for (n = t + 2,
                r = e.tokens.length - 2; r > n; n++)
                    e.tokens[n].level === i && "paragraph_open" === e.tokens[n].type && (e.tokens[n + 2].hidden = !0,
                    e.tokens[n].hidden = !0,
                    n += 2)
            }
            var a = e("../common/utils").isSpace;
            t.exports = function(e, t, n, s) {
                var u, c, l, p, f, h, d, m, g, v, b, y, _, k, C, w, E, T, x, A, M, D, L, S, F, q, R, N, I = !0;
                if ((b = i(e, t)) >= 0)
                    T = !0;
                else {
                    if (!((b = r(e, t)) >= 0))
                        return !1;
                    T = !1
                }
                if (E = e.src.charCodeAt(b - 1),
                s)
                    return !0;
                for (A = e.tokens.length,
                T ? (v = e.bMarks[t] + e.tShift[t],
                w = Number(e.src.substr(v, b - v - 1)),
                F = e.push("ordered_list_open", "ol", 1),
                1 !== w && (F.attrs = [["start", w]])) : F = e.push("bullet_list_open", "ul", 1),
                F.map = D = [t, 0],
                F.markup = String.fromCharCode(E),
                u = t,
                M = !1,
                S = e.md.block.ruler.getRules("list"); n > u; ) {
                    for (_ = b,
                    k = e.eMarks[u],
                    c = l = e.sCount[u] + b - (e.bMarks[t] + e.tShift[t]); k > _ && (y = e.src.charCodeAt(_),
                    a(y)); )
                        9 === y ? l += 4 - l % 4 : l++,
                        _++;
                    if (x = _,
                    C = x >= k ? 1 : l - c,
                    C > 4 && (C = 1),
                    p = c + C,
                    F = e.push("list_item_open", "li", 1),
                    F.markup = String.fromCharCode(E),
                    F.map = L = [t, 0],
                    h = e.blkIndent,
                    m = e.tight,
                    f = e.tShift[t],
                    d = e.sCount[t],
                    g = e.parentType,
                    e.blkIndent = p,
                    e.tight = !0,
                    e.parentType = "list",
                    e.tShift[t] = x - e.bMarks[t],
                    e.sCount[t] = l,
                    e.md.block.tokenize(e, t, n, !0),
                    (!e.tight || M) && (I = !1),
                    M = e.line - t > 1 && e.isEmpty(e.line - 1),
                    e.blkIndent = h,
                    e.tShift[t] = f,
                    e.sCount[t] = d,
                    e.tight = m,
                    e.parentType = g,
                    F = e.push("list_item_close", "li", -1),
                    F.markup = String.fromCharCode(E),
                    u = t = e.line,
                    L[1] = u,
                    x = e.bMarks[t],
                    u >= n)
                        break;
                    if (e.isEmpty(u))
                        break;
                    if (e.sCount[u] < e.blkIndent)
                        break;
                    for (N = !1,
                    q = 0,
                    R = S.length; R > q; q++)
                        if (S[q](e, u, n, !0)) {
                            N = !0;
                            break
                        }
                    if (N)
                        break;
                    if (T) {
                        if (b = i(e, u),
                        0 > b)
                            break
                    } else if (b = r(e, u),
                    0 > b)
                        break;
                    if (E !== e.src.charCodeAt(b - 1))
                        break
                }
                return F = T ? e.push("ordered_list_close", "ol", -1) : e.push("bullet_list_close", "ul", -1),
                F.markup = String.fromCharCode(E),
                D[1] = u,
                e.line = u,
                I && o(e, A),
                !0
            }
        }
        , {
            "../common/utils": 5
        }],
        27: [function(e, t, n) {
            "use strict";
            t.exports = function(e, t) {
                for (var n, r, i, o, a, s = t + 1, u = e.md.block.ruler.getRules("paragraph"), c = e.lineMax; c > s && !e.isEmpty(s); s++)
                    if (!(e.sCount[s] - e.blkIndent > 3 || e.sCount[s] < 0)) {
                        for (r = !1,
                        i = 0,
                        o = u.length; o > i; i++)
                            if (u[i](e, s, c, !0)) {
                                r = !0;
                                break
                            }
                        if (r)
                            break
                    }
                return n = e.getLines(t, s, e.blkIndent, !1).trim(),
                e.line = s,
                a = e.push("paragraph_open", "p", 1),
                a.map = [t, e.line],
                a = e.push("inline", "", 0),
                a.content = n,
                a.map = [t, e.line],
                a.children = [],
                a = e.push("paragraph_close", "p", -1),
                !0
            }
        }
        , {}],
        28: [function(e, t, n) {
            "use strict";
            var r = e("../helpers/parse_link_destination")
              , i = e("../helpers/parse_link_title")
              , o = e("../common/utils").normalizeReference
              , a = e("../common/utils").isSpace;
            t.exports = function(e, t, n, s) {
                var u, c, l, p, f, h, d, m, g, v, b, y, _, k, C, w = 0, E = e.bMarks[t] + e.tShift[t], T = e.eMarks[t], x = t + 1;
                if (91 !== e.src.charCodeAt(E))
                    return !1;
                for (; ++E < T; )
                    if (93 === e.src.charCodeAt(E) && 92 !== e.src.charCodeAt(E - 1)) {
                        if (E + 1 === T)
                            return !1;
                        if (58 !== e.src.charCodeAt(E + 1))
                            return !1;
                        break
                    }
                for (p = e.lineMax,
                k = e.md.block.ruler.getRules("reference"); p > x && !e.isEmpty(x); x++)
                    if (!(e.sCount[x] - e.blkIndent > 3 || e.sCount[x] < 0)) {
                        for (_ = !1,
                        h = 0,
                        d = k.length; d > h; h++)
                            if (k[h](e, x, p, !0)) {
                                _ = !0;
                                break
                            }
                        if (_)
                            break
                    }
                for (y = e.getLines(t, x, e.blkIndent, !1).trim(),
                T = y.length,
                E = 1; T > E; E++) {
                    if (u = y.charCodeAt(E),
                    91 === u)
                        return !1;
                    if (93 === u) {
                        g = E;
                        break
                    }
                    10 === u ? w++ : 92 === u && (E++,
                    T > E && 10 === y.charCodeAt(E) && w++)
                }
                if (0 > g || 58 !== y.charCodeAt(g + 1))
                    return !1;
                for (E = g + 2; T > E; E++)
                    if (u = y.charCodeAt(E),
                    10 === u)
                        w++;
                    else if (!a(u))
                        break;
                if (v = r(y, E, T),
                !v.ok)
                    return !1;
                if (f = e.md.normalizeLink(v.str),
                !e.md.validateLink(f))
                    return !1;
                for (E = v.pos,
                w += v.lines,
                c = E,
                l = w,
                b = E; T > E; E++)
                    if (u = y.charCodeAt(E),
                    10 === u)
                        w++;
                    else if (!a(u))
                        break;
                for (v = i(y, E, T),
                T > E && b !== E && v.ok ? (C = v.str,
                E = v.pos,
                w += v.lines) : (C = "",
                E = c,
                w = l); T > E && (u = y.charCodeAt(E),
                a(u)); )
                    E++;
                if (T > E && 10 !== y.charCodeAt(E) && C)
                    for (C = "",
                    E = c,
                    w = l; T > E && (u = y.charCodeAt(E),
                    a(u)); )
                        E++;
                return T > E && 10 !== y.charCodeAt(E) ? !1 : (m = o(y.slice(1, g))) ? s ? !0 : ("undefined" == typeof e.env.references && (e.env.references = {}),
                "undefined" == typeof e.env.references[m] && (e.env.references[m] = {
                    title: C,
                    href: f
                }),
                e.line = t + w + 1,
                !0) : !1
            }
        }
        , {
            "../common/utils": 5,
            "../helpers/parse_link_destination": 7,
            "../helpers/parse_link_title": 9
        }],
        29: [function(e, t, n) {
            "use strict";
            function r(e, t, n, r) {
                var i, a, s, u, c, l, p, f;
                for (this.src = e,
                this.md = t,
                this.env = n,
                this.tokens = r,
                this.bMarks = [],
                this.eMarks = [],
                this.tShift = [],
                this.sCount = [],
                this.blkIndent = 0,
                this.line = 0,
                this.lineMax = 0,
                this.tight = !1,
                this.parentType = "root",
                this.ddIndent = -1,
                this.level = 0,
                this.result = "",
                a = this.src,
                f = !1,
                s = u = l = p = 0,
                c = a.length; c > u; u++) {
                    if (i = a.charCodeAt(u),
                    !f) {
                        if (o(i)) {
                            l++,
                            9 === i ? p += 4 - p % 4 : p++;
                            continue
                        }
                        f = !0
                    }
                    (10 === i || u === c - 1) && (10 !== i && u++,
                    this.bMarks.push(s),
                    this.eMarks.push(u),
                    this.tShift.push(l),
                    this.sCount.push(p),
                    f = !1,
                    l = 0,
                    p = 0,
                    s = u + 1)
                }
                this.bMarks.push(a.length),
                this.eMarks.push(a.length),
                this.tShift.push(0),
                this.sCount.push(0),
                this.lineMax = this.bMarks.length - 1
            }
            var i = e("../token")
              , o = e("../common/utils").isSpace;
            r.prototype.push = function(e, t, n) {
                var r = new i(e,t,n);
                return r.block = !0,
                0 > n && this.level--,
                r.level = this.level,
                n > 0 && this.level++,
                this.tokens.push(r),
                r
            }
            ,
            r.prototype.isEmpty = function(e) {
                return this.bMarks[e] + this.tShift[e] >= this.eMarks[e]
            }
            ,
            r.prototype.skipEmptyLines = function(e) {
                for (var t = this.lineMax; t > e && !(this.bMarks[e] + this.tShift[e] < this.eMarks[e]); e++)
                    ;
                return e
            }
            ,
            r.prototype.skipSpaces = function(e) {
                for (var t, n = this.src.length; n > e && (t = this.src.charCodeAt(e),
                o(t)); e++)
                    ;
                return e
            }
            ,
            r.prototype.skipSpacesBack = function(e, t) {
                if (t >= e)
                    return e;
                for (; e > t; )
                    if (!o(this.src.charCodeAt(--e)))
                        return e + 1;
                return e
            }
            ,
            r.prototype.skipChars = function(e, t) {
                for (var n = this.src.length; n > e && this.src.charCodeAt(e) === t; e++)
                    ;
                return e
            }
            ,
            r.prototype.skipCharsBack = function(e, t, n) {
                if (n >= e)
                    return e;
                for (; e > n; )
                    if (t !== this.src.charCodeAt(--e))
                        return e + 1;
                return e
            }
            ,
            r.prototype.getLines = function(e, t, n, r) {
                var i, a, s, u, c, l, p, f = e;
                if (e >= t)
                    return "";
                for (l = new Array(t - e),
                i = 0; t > f; f++,
                i++) {
                    for (a = 0,
                    p = u = this.bMarks[f],
                    c = t > f + 1 || r ? this.eMarks[f] + 1 : this.eMarks[f]; c > u && n > a; ) {
                        if (s = this.src.charCodeAt(u),
                        o(s))
                            9 === s ? a += 4 - a % 4 : a++;
                        else {
                            if (!(u - p < this.tShift[f]))
                                break;
                            a++
                        }
                        u++
                    }
                    l[i] = this.src.slice(u, c)
                }
                return l.join("")
            }
            ,
            r.prototype.Token = i,
            t.exports = r
        }
        , {
            "../common/utils": 5,
            "../token": 52
        }],
        30: [function(e, t, n) {
            "use strict";
            function r(e, t) {
                var n = e.bMarks[t] + e.blkIndent
                  , r = e.eMarks[t];
                return e.src.substr(n, r - n)
            }
            function i(e) {
                var t, n = [], r = 0, i = e.length, o = 0, a = 0, s = !1, u = 0;
                for (t = e.charCodeAt(r); i > r; )
                    96 === t && o % 2 === 0 ? (s = !s,
                    u = r) : 124 !== t || o % 2 !== 0 || s ? 92 === t ? o++ : o = 0 : (n.push(e.substring(a, r)),
                    a = r + 1),
                    r++,
                    r === i && s && (s = !1,
                    r = u + 1),
                    t = e.charCodeAt(r);
                return n.push(e.substring(a)),
                n
            }
            t.exports = function(e, t, n, o) {
                var a, s, u, c, l, p, f, h, d, m, g;
                if (t + 2 > n)
                    return !1;
                if (l = t + 1,
                e.sCount[l] < e.blkIndent)
                    return !1;
                if (u = e.bMarks[l] + e.tShift[l],
                u >= e.eMarks[l])
                    return !1;
                if (a = e.src.charCodeAt(u),
                124 !== a && 45 !== a && 58 !== a)
                    return !1;
                if (s = r(e, t + 1),
                !/^[-:| ]+$/.test(s))
                    return !1;
                if (p = s.split("|"),
                p.length < 2)
                    return !1;
                for (h = [],
                c = 0; c < p.length; c++) {
                    if (d = p[c].trim(),
                    !d) {
                        if (0 === c || c === p.length - 1)
                            continue;return !1
                    }
                    if (!/^:?-+:?$/.test(d))
                        return !1;
                    58 === d.charCodeAt(d.length - 1) ? h.push(58 === d.charCodeAt(0) ? "center" : "right") : 58 === d.charCodeAt(0) ? h.push("left") : h.push("")
                }
                if (s = r(e, t).trim(),
                -1 === s.indexOf("|"))
                    return !1;
                if (p = i(s.replace(/^\||\|$/g, "")),
                h.length !== p.length)
                    return !1;
                if (o)
                    return !0;
                for (f = e.push("table_open", "table", 1),
                f.map = m = [t, 0],
                f = e.push("thead_open", "thead", 1),
                f.map = [t, t + 1],
                f = e.push("tr_open", "tr", 1),
                f.map = [t, t + 1],
                c = 0; c < p.length; c++)
                    f = e.push("th_open", "th", 1),
                    f.map = [t, t + 1],
                    h[c] && (f.attrs = [["style", "text-align:" + h[c]]]),
                    f = e.push("inline", "", 0),
                    f.content = p[c].trim(),
                    f.map = [t, t + 1],
                    f.children = [],
                    f = e.push("th_close", "th", -1);
                for (f = e.push("tr_close", "tr", -1),
                f = e.push("thead_close", "thead", -1),
                f = e.push("tbody_open", "tbody", 1),
                f.map = g = [t + 2, 0],
                l = t + 2; n > l && !(e.sCount[l] < e.blkIndent) && (s = r(e, l).trim(),
                -1 !== s.indexOf("|")); l++) {
                    for (p = i(s.replace(/^\||\|$/g, "")),
                    p.length = h.length,
                    f = e.push("tr_open", "tr", 1),
                    c = 0; c < p.length; c++)
                        f = e.push("td_open", "td", 1),
                        h[c] && (f.attrs = [["style", "text-align:" + h[c]]]),
                        f = e.push("inline", "", 0),
                        f.content = p[c] ? p[c].trim() : "",
                        f.children = [],
                        f = e.push("td_close", "td", -1);
                    f = e.push("tr_close", "tr", -1)
                }
                return f = e.push("tbody_close", "tbody", -1),
                f = e.push("table_close", "table", -1),
                m[1] = g[1] = l,
                e.line = l,
                !0
            }
        }
        , {}],
        31: [function(e, t, n) {
            "use strict";
            t.exports = function(e) {
                var t;
                e.inlineMode ? (t = new e.Token("inline","",0),
                t.content = e.src,
                t.map = [0, 1],
                t.children = [],
                e.tokens.push(t)) : e.md.block.parse(e.src, e.md, e.env, e.tokens)
            }
        }
        , {}],
        32: [function(e, t, n) {
            "use strict";
            t.exports = function(e) {
                var t, n, r, i = e.tokens;
                for (n = 0,
                r = i.length; r > n; n++)
                    t = i[n],
                    "inline" === t.type && e.md.inline.parse(t.content, e.md, e.env, t.children)
            }
        }
        , {}],
        33: [function(e, t, n) {
            "use strict";
            function r(e) {
                return /^<a[>\s]/i.test(e)
            }
            function i(e) {
                return /^<\/a\s*>/i.test(e)
            }
            var o = e("../common/utils").arrayReplaceAt;
            t.exports = function(e) {
                var t, n, a, s, u, c, l, p, f, h, d, m, g, v, b, y, _, k = e.tokens;
                if (e.md.options.linkify)
                    for (n = 0,
                    a = k.length; a > n; n++)
                        if ("inline" === k[n].type && e.md.linkify.pretest(k[n].content))
                            for (s = k[n].children,
                            g = 0,
                            t = s.length - 1; t >= 0; t--)
                                if (c = s[t],
                                "link_close" !== c.type) {
                                    if ("html_inline" === c.type && (r(c.content) && g > 0 && g--,
                                    i(c.content) && g++),
                                    !(g > 0) && "text" === c.type && e.md.linkify.test(c.content)) {
                                        for (f = c.content,
                                        _ = e.md.linkify.match(f),
                                        l = [],
                                        m = c.level,
                                        d = 0,
                                        p = 0; p < _.length; p++)
                                            v = _[p].url,
                                            b = e.md.normalizeLink(v),
                                            e.md.validateLink(b) && (y = _[p].text,
                                            y = _[p].schema ? "mailto:" !== _[p].schema || /^mailto:/i.test(y) ? e.md.normalizeLinkText(y) : e.md.normalizeLinkText("mailto:" + y).replace(/^mailto:/, "") : e.md.normalizeLinkText("http://" + y).replace(/^http:\/\//, ""),
                                            h = _[p].index,
                                            h > d && (u = new e.Token("text","",0),
                                            u.content = f.slice(d, h),
                                            u.level = m,
                                            l.push(u)),
                                            u = new e.Token("link_open","a",1),
                                            u.attrs = [["href", b]],
                                            u.level = m++,
                                            u.markup = "linkify",
                                            u.info = "auto",
                                            l.push(u),
                                            u = new e.Token("text","",0),
                                            u.content = y,
                                            u.level = m,
                                            l.push(u),
                                            u = new e.Token("link_close","a",-1),
                                            u.level = --m,
                                            u.markup = "linkify",
                                            u.info = "auto",
                                            l.push(u),
                                            d = _[p].lastIndex);
                                        d < f.length && (u = new e.Token("text","",0),
                                        u.content = f.slice(d),
                                        u.level = m,
                                        l.push(u)),
                                        k[n].children = s = o(s, t, l)
                                    }
                                } else
                                    for (t--; s[t].level !== c.level && "link_open" !== s[t].type; )
                                        t--
            }
        }
        , {
            "../common/utils": 5
        }],
        34: [function(e, t, n) {
            "use strict";
            var r = /\r[\n\u0085]|[\u2424\u2028\u0085]/g
              , i = /\u0000/g;
            t.exports = function(e) {
                var t;
                t = e.src.replace(r, "\n"),
                t = t.replace(i, "�"),
                e.src = t
            }
        }
        , {}],
        35: [function(e, t, n) {
            "use strict";
            function r(e, t) {
                return c[t.toLowerCase()]
            }
            function i(e) {
                var t, n;
                for (t = e.length - 1; t >= 0; t--)
                    n = e[t],
                    "text" === n.type && (n.content = n.content.replace(u, r))
            }
            function o(e) {
                var t, n;
                for (t = e.length - 1; t >= 0; t--)
                    n = e[t],
                    "text" === n.type && a.test(n.content) && (n.content = n.content.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])\u2026/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---([^-]|$)/gm, "$1—$2").replace(/(^|\s)--(\s|$)/gm, "$1–$2").replace(/(^|[^-\s])--([^-\s]|$)/gm, "$1–$2"))
            }
            var a = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/
              , s = /\((c|tm|r|p)\)/i
              , u = /\((c|tm|r|p)\)/gi
              , c = {
                c: "©",
                r: "®",
                p: "§",
                tm: "™"
            };
            t.exports = function(e) {
                var t;
                if (e.md.options.typographer)
                    for (t = e.tokens.length - 1; t >= 0; t--)
                        "inline" === e.tokens[t].type && (s.test(e.tokens[t].content) && i(e.tokens[t].children),
                        a.test(e.tokens[t].content) && o(e.tokens[t].children))
            }
        }
        , {}],
        36: [function(e, t, n) {
            "use strict";
            function r(e, t, n) {
                return e.substr(0, t) + n + e.substr(t + 1)
            }
            function i(e, t) {
                var n, i, u, p, f, h, d, m, g, v, b, y, _, k, C, w, E, T, x, A, M;
                for (x = [],
                n = 0; n < e.length; n++) {
                    for (i = e[n],
                    d = e[n].level,
                    E = x.length - 1; E >= 0 && !(x[E].level <= d); E--)
                        ;
                    if (x.length = E + 1,
                    "text" === i.type) {
                        u = i.content,
                        f = 0,
                        h = u.length;
                        e: for (; h > f && (c.lastIndex = f,
                        p = c.exec(u)); )
                            if (C = w = !0,
                            f = p.index + 1,
                            T = "'" === p[0],
                            g = p.index - 1 >= 0 ? u.charCodeAt(p.index - 1) : 32,
                            v = h > f ? u.charCodeAt(f) : 32,
                            b = s(g) || a(String.fromCharCode(g)),
                            y = s(v) || a(String.fromCharCode(v)),
                            _ = o(g),
                            k = o(v),
                            k ? C = !1 : y && (_ || b || (C = !1)),
                            _ ? w = !1 : b && (k || y || (w = !1)),
                            34 === v && '"' === p[0] && g >= 48 && 57 >= g && (w = C = !1),
                            C && w && (C = !1,
                            w = y),
                            C || w) {
                                if (w)
                                    for (E = x.length - 1; E >= 0 && (m = x[E],
                                    !(x[E].level < d)); E--)
                                        if (m.single === T && x[E].level === d) {
                                            m = x[E],
                                            T ? (A = t.md.options.quotes[2],
                                            M = t.md.options.quotes[3]) : (A = t.md.options.quotes[0],
                                            M = t.md.options.quotes[1]),
                                            i.content = r(i.content, p.index, M),
                                            e[m.token].content = r(e[m.token].content, m.pos, A),
                                            f += M.length - 1,
                                            m.token === n && (f += A.length - 1),
                                            u = i.content,
                                            h = u.length,
                                            x.length = E;
                                            continue e
                                        }
                                C ? x.push({
                                    token: n,
                                    pos: p.index,
                                    single: T,
                                    level: d
                                }) : w && T && (i.content = r(i.content, p.index, l))
                            } else
                                T && (i.content = r(i.content, p.index, l))
                    }
                }
            }
            var o = e("../common/utils").isWhiteSpace
              , a = e("../common/utils").isPunctChar
              , s = e("../common/utils").isMdAsciiPunct
              , u = /['"]/
              , c = /['"]/g
              , l = "’";
            t.exports = function(e) {
                var t;
                if (e.md.options.typographer)
                    for (t = e.tokens.length - 1; t >= 0; t--)
                        "inline" === e.tokens[t].type && u.test(e.tokens[t].content) && i(e.tokens[t].children, e)
            }
        }
        , {
            "../common/utils": 5
        }],
        37: [function(e, t, n) {
            "use strict";
            function r(e, t, n) {
                this.src = e,
                this.env = n,
                this.tokens = [],
                this.inlineMode = !1,
                this.md = t
            }
            var i = e("../token");
            r.prototype.Token = i,
            t.exports = r
        }
        , {
            "../token": 52
        }],
        38: [function(e, t, n) {
            "use strict";
            var r = e("../common/url_schemas")
              , i = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/
              , o = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;
            t.exports = function(e, t) {
                var n, a, s, u, c, l, p = e.pos;
                return 60 !== e.src.charCodeAt(p) ? !1 : (n = e.src.slice(p),
                n.indexOf(">") < 0 ? !1 : o.test(n) ? (a = n.match(o),
                r.indexOf(a[1].toLowerCase()) < 0 ? !1 : (u = a[0].slice(1, -1),
                c = e.md.normalizeLink(u),
                e.md.validateLink(c) ? (t || (l = e.push("link_open", "a", 1),
                l.attrs = [["href", c]],
                l = e.push("text", "", 0),
                l.content = e.md.normalizeLinkText(u),
                l = e.push("link_close", "a", -1)),
                e.pos += a[0].length,
                !0) : !1)) : i.test(n) ? (s = n.match(i),
                u = s[0].slice(1, -1),
                c = e.md.normalizeLink("mailto:" + u),
                e.md.validateLink(c) ? (t || (l = e.push("link_open", "a", 1),
                l.attrs = [["href", c]],
                l.markup = "autolink",
                l.info = "auto",
                l = e.push("text", "", 0),
                l.content = e.md.normalizeLinkText(u),
                l = e.push("link_close", "a", -1),
                l.markup = "autolink",
                l.info = "auto"),
                e.pos += s[0].length,
                !0) : !1) : !1)
            }
        }
        , {
            "../common/url_schemas": 4
        }],
        39: [function(e, t, n) {
            "use strict";
            t.exports = function(e, t) {
                var n, r, i, o, a, s, u = e.pos, c = e.src.charCodeAt(u);
                if (96 !== c)
                    return !1;
                for (n = u,
                u++,
                r = e.posMax; r > u && 96 === e.src.charCodeAt(u); )
                    u++;
                for (i = e.src.slice(n, u),
                o = a = u; -1 !== (o = e.src.indexOf("`", a)); ) {
                    for (a = o + 1; r > a && 96 === e.src.charCodeAt(a); )
                        a++;
                    if (a - o === i.length)
                        return t || (s = e.push("code_inline", "code", 0),
                        s.markup = i,
                        s.content = e.src.slice(u, o).replace(/[ \n]+/g, " ").trim()),
                        e.pos = a,
                        !0
                }
                return t || (e.pending += i),
                e.pos += i.length,
                !0
            }
        }
        , {}],
        40: [function(e, t, n) {
            "use strict";
            t.exports = function(e) {
                var t, n, r, i, o = e.delimiters, a = e.delimiters.length;
                for (t = 0; a > t; t++)
                    if (r = o[t],
                    r.close)
                        for (n = t - r.jump - 1; n >= 0; ) {
                            if (i = o[n],
                            i.open && i.marker === r.marker && i.end < 0 && i.level === r.level) {
                                r.jump = t - n,
                                r.open = !1,
                                i.end = t,
                                i.jump = 0;
                                break
                            }
                            n -= i.jump + 1
                        }
            }
        }
        , {}],
        41: [function(e, t, n) {
            "use strict";
            t.exports.tokenize = function(e, t) {
                var n, r, i, o = e.pos, a = e.src.charCodeAt(o);
                if (t)
                    return !1;
                if (95 !== a && 42 !== a)
                    return !1;
                for (r = e.scanDelims(e.pos, 42 === a),
                n = 0; n < r.length; n++)
                    i = e.push("text", "", 0),
                    i.content = String.fromCharCode(a),
                    e.delimiters.push({
                        marker: a,
                        jump: n,
                        token: e.tokens.length - 1,
                        level: e.level,
                        end: -1,
                        open: r.can_open,
                        close: r.can_close
                    });
                return e.pos += r.length,
                !0
            }
            ,
            t.exports.postProcess = function(e) {
                var t, n, r, i, o, a, s = e.delimiters, u = e.delimiters.length;
                for (t = 0; u > t; t++)
                    n = s[t],
                    (95 === n.marker || 42 === n.marker) && -1 !== n.end && (r = s[n.end],
                    a = u > t + 1 && s[t + 1].end === n.end - 1 && s[t + 1].token === n.token + 1 && s[n.end - 1].token === r.token - 1 && s[t + 1].marker === n.marker,
                    o = String.fromCharCode(n.marker),
                    i = e.tokens[n.token],
                    i.type = a ? "strong_open" : "em_open",
                    i.tag = a ? "strong" : "em",
                    i.nesting = 1,
                    i.markup = a ? o + o : o,
                    i.content = "",
                    i = e.tokens[r.token],
                    i.type = a ? "strong_close" : "em_close",
                    i.tag = a ? "strong" : "em",
                    i.nesting = -1,
                    i.markup = a ? o + o : o,
                    i.content = "",
                    a && (e.tokens[s[t + 1].token].content = "",
                    e.tokens[s[n.end - 1].token].content = "",
                    t++))
            }
        }
        , {}],
        42: [function(e, t, n) {
            "use strict";
            var r = e("../common/entities")
              , i = e("../common/utils").has
              , o = e("../common/utils").isValidEntityCode
              , a = e("../common/utils").fromCodePoint
              , s = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i
              , u = /^&([a-z][a-z0-9]{1,31});/i;
            t.exports = function(e, t) {
                var n, c, l, p = e.pos, f = e.posMax;
                if (38 !== e.src.charCodeAt(p))
                    return !1;
                if (f > p + 1)
                    if (n = e.src.charCodeAt(p + 1),
                    35 === n) {
                        if (l = e.src.slice(p).match(s))
                            return t || (c = "x" === l[1][0].toLowerCase() ? parseInt(l[1].slice(1), 16) : parseInt(l[1], 10),
                            e.pending += a(o(c) ? c : 65533)),
                            e.pos += l[0].length,
                            !0
                    } else if (l = e.src.slice(p).match(u),
                    l && i(r, l[1]))
                        return t || (e.pending += r[l[1]]),
                        e.pos += l[0].length,
                        !0;
                return t || (e.pending += "&"),
                e.pos++,
                !0
            }
        }
        , {
            "../common/entities": 1,
            "../common/utils": 5
        }],
        43: [function(e, t, n) {
            "use strict";
            for (var r = e("../common/utils").isSpace, i = [], o = 0; 256 > o; o++)
                i.push(0);
            "\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(e) {
                i[e.charCodeAt(0)] = 1
            }),
            t.exports = function(e, t) {
                var n, o = e.pos, a = e.posMax;
                if (92 !== e.src.charCodeAt(o))
                    return !1;
                if (o++,
                a > o) {
                    if (n = e.src.charCodeAt(o),
                    256 > n && 0 !== i[n])
                        return t || (e.pending += e.src[o]),
                        e.pos += 2,
                        !0;
                    if (10 === n) {
                        for (t || e.push("hardbreak", "br", 0),
                        o++; a > o && (n = e.src.charCodeAt(o),
                        r(n)); )
                            o++;
                        return e.pos = o,
                        !0
                    }
                }
                return t || (e.pending += "\\"),
                e.pos++,
                !0
            }
        }
        , {
            "../common/utils": 5
        }],
        44: [function(e, t, n) {
            "use strict";
            function r(e) {
                var t = 32 | e;
                return t >= 97 && 122 >= t
            }
            var i = e("../common/html_re").HTML_TAG_RE;
            t.exports = function(e, t) {
                var n, o, a, s, u = e.pos;
                return e.md.options.html ? (a = e.posMax,
                60 !== e.src.charCodeAt(u) || u + 2 >= a ? !1 : (n = e.src.charCodeAt(u + 1),
                (33 === n || 63 === n || 47 === n || r(n)) && (o = e.src.slice(u).match(i)) ? (t || (s = e.push("html_inline", "", 0),
                s.content = e.src.slice(u, u + o[0].length)),
                e.pos += o[0].length,
                !0) : !1)) : !1
            }
        }
        , {
            "../common/html_re": 3
        }],
        45: [function(e, t, n) {
            "use strict";
            var r = e("../helpers/parse_link_label")
              , i = e("../helpers/parse_link_destination")
              , o = e("../helpers/parse_link_title")
              , a = e("../common/utils").normalizeReference
              , s = e("../common/utils").isSpace;
            t.exports = function(e, t) {
                var n, u, c, l, p, f, h, d, m, g, v, b, y = "", _ = e.pos, k = e.posMax;
                if (33 !== e.src.charCodeAt(e.pos))
                    return !1;
                if (91 !== e.src.charCodeAt(e.pos + 1))
                    return !1;
                if (p = e.pos + 2,
                l = r(e, e.pos + 1, !1),
                0 > l)
                    return !1;
                if (f = l + 1,
                k > f && 40 === e.src.charCodeAt(f)) {
                    for (f++; k > f && (u = e.src.charCodeAt(f),
                    s(u) || 10 === u); f++)
                        ;
                    if (f >= k)
                        return !1;
                    for (b = f,
                    d = i(e.src, f, e.posMax),
                    d.ok && (y = e.md.normalizeLink(d.str),
                    e.md.validateLink(y) ? f = d.pos : y = ""),
                    b = f; k > f && (u = e.src.charCodeAt(f),
                    s(u) || 10 === u); f++)
                        ;
                    if (d = o(e.src, f, e.posMax),
                    k > f && b !== f && d.ok)
                        for (m = d.str,
                        f = d.pos; k > f && (u = e.src.charCodeAt(f),
                        s(u) || 10 === u); f++)
                            ;
                    else
                        m = "";
                    if (f >= k || 41 !== e.src.charCodeAt(f))
                        return e.pos = _,
                        !1;
                    f++
                } else {
                    if ("undefined" == typeof e.env.references)
                        return !1;
                    for (; k > f && (u = e.src.charCodeAt(f),
                    s(u) || 10 === u); f++)
                        ;
                    if (k > f && 91 === e.src.charCodeAt(f) ? (b = f + 1,
                    f = r(e, f),
                    f >= 0 ? c = e.src.slice(b, f++) : f = l + 1) : f = l + 1,
                    c || (c = e.src.slice(p, l)),
                    h = e.env.references[a(c)],
                    !h)
                        return e.pos = _,
                        !1;
                    y = h.href,
                    m = h.title
                }
                return t || (e.md.inline.parse(e.src.slice(p, l), e.md, e.env, v = []),
                g = e.push("image", "img", 0),
                g.attrs = n = [["src", y], ["alt", ""]],
                g.children = v,
                m && n.push(["title", m])),
                e.pos = f,
                e.posMax = k,
                !0
            }
        }
        , {
            "../common/utils": 5,
            "../helpers/parse_link_destination": 7,
            "../helpers/parse_link_label": 8,
            "../helpers/parse_link_title": 9
        }],
        46: [function(e, t, n) {
            "use strict";
            var r = e("../helpers/parse_link_label")
              , i = e("../helpers/parse_link_destination")
              , o = e("../helpers/parse_link_title")
              , a = e("../common/utils").normalizeReference
              , s = e("../common/utils").isSpace;
            t.exports = function(e, t) {
                var n, u, c, l, p, f, h, d, m, g, v = "", b = e.pos, y = e.posMax, _ = e.pos;
                if (91 !== e.src.charCodeAt(e.pos))
                    return !1;
                if (p = e.pos + 1,
                l = r(e, e.pos, !0),
                0 > l)
                    return !1;
                if (f = l + 1,
                y > f && 40 === e.src.charCodeAt(f)) {
                    for (f++; y > f && (u = e.src.charCodeAt(f),
                    s(u) || 10 === u); f++)
                        ;
                    if (f >= y)
                        return !1;
                    for (_ = f,
                    h = i(e.src, f, e.posMax),
                    h.ok && (v = e.md.normalizeLink(h.str),
                    e.md.validateLink(v) ? f = h.pos : v = ""),
                    _ = f; y > f && (u = e.src.charCodeAt(f),
                    s(u) || 10 === u); f++)
                        ;
                    if (h = o(e.src, f, e.posMax),
                    y > f && _ !== f && h.ok)
                        for (m = h.str,
                        f = h.pos; y > f && (u = e.src.charCodeAt(f),
                        s(u) || 10 === u); f++)
                            ;
                    else
                        m = "";
                    if (f >= y || 41 !== e.src.charCodeAt(f))
                        return e.pos = b,
                        !1;
                    f++
                } else {
                    if ("undefined" == typeof e.env.references)
                        return !1;
                    for (; y > f && (u = e.src.charCodeAt(f),
                    s(u) || 10 === u); f++)
                        ;
                    if (y > f && 91 === e.src.charCodeAt(f) ? (_ = f + 1,
                    f = r(e, f),
                    f >= 0 ? c = e.src.slice(_, f++) : f = l + 1) : f = l + 1,
                    c || (c = e.src.slice(p, l)),
                    d = e.env.references[a(c)],
                    !d)
                        return e.pos = b,
                        !1;
                    v = d.href,
                    m = d.title
                }
                return t || (e.pos = p,
                e.posMax = l,
                g = e.push("link_open", "a", 1),
                g.attrs = n = [["href", v]],
                m && n.push(["title", m]),
                e.md.inline.tokenize(e),
                g = e.push("link_close", "a", -1)),
                e.pos = f,
                e.posMax = y,
                !0
            }
        }
        , {
            "../common/utils": 5,
            "../helpers/parse_link_destination": 7,
            "../helpers/parse_link_label": 8,
            "../helpers/parse_link_title": 9
        }],
        47: [function(e, t, n) {
            "use strict";
            t.exports = function(e, t) {
                var n, r, i = e.pos;
                if (10 !== e.src.charCodeAt(i))
                    return !1;
                for (n = e.pending.length - 1,
                r = e.posMax,
                t || (n >= 0 && 32 === e.pending.charCodeAt(n) ? n >= 1 && 32 === e.pending.charCodeAt(n - 1) ? (e.pending = e.pending.replace(/ +$/, ""),
                e.push("hardbreak", "br", 0)) : (e.pending = e.pending.slice(0, -1),
                e.push("softbreak", "br", 0)) : e.push("softbreak", "br", 0)),
                i++; r > i && 32 === e.src.charCodeAt(i); )
                    i++;
                return e.pos = i,
                !0
            }
        }
        , {}],
        48: [function(e, t, n) {
            "use strict";
            function r(e, t, n, r) {
                this.src = e,
                this.env = n,
                this.md = t,
                this.tokens = r,
                this.pos = 0,
                this.posMax = this.src.length,
                this.level = 0,
                this.pending = "",
                this.pendingLevel = 0,
                this.cache = {},
                this.delimiters = []
            }
            var i = e("../token")
              , o = e("../common/utils").isWhiteSpace
              , a = e("../common/utils").isPunctChar
              , s = e("../common/utils").isMdAsciiPunct;
            r.prototype.pushPending = function() {
                var e = new i("text","",0);
                return e.content = this.pending,
                e.level = this.pendingLevel,
                this.tokens.push(e),
                this.pending = "",
                e
            }
            ,
            r.prototype.push = function(e, t, n) {
                this.pending && this.pushPending();
                var r = new i(e,t,n);
                return 0 > n && this.level--,
                r.level = this.level,
                n > 0 && this.level++,
                this.pendingLevel = this.level,
                this.tokens.push(r),
                r
            }
            ,
            r.prototype.scanDelims = function(e, t) {
                var n, r, i, u, c, l, p, f, h, d = e, m = !0, g = !0, v = this.posMax, b = this.src.charCodeAt(e);
                for (n = e > 0 ? this.src.charCodeAt(e - 1) : 32; v > d && this.src.charCodeAt(d) === b; )
                    d++;
                return i = d - e,
                r = v > d ? this.src.charCodeAt(d) : 32,
                p = s(n) || a(String.fromCharCode(n)),
                h = s(r) || a(String.fromCharCode(r)),
                l = o(n),
                f = o(r),
                f ? m = !1 : h && (l || p || (m = !1)),
                l ? g = !1 : p && (f || h || (g = !1)),
                t ? (u = m,
                c = g) : (u = m && (!g || p),
                c = g && (!m || h)),
                {
                    can_open: u,
                    can_close: c,
                    length: i
                }
            }
            ,
            r.prototype.Token = i,
            t.exports = r
        }
        , {
            "../common/utils": 5,
            "../token": 52
        }],
        49: [function(e, t, n) {
            "use strict";
            t.exports.tokenize = function(e, t) {
                var n, r, i, o, a, s = e.pos, u = e.src.charCodeAt(s);
                if (t)
                    return !1;
                if (126 !== u)
                    return !1;
                if (r = e.scanDelims(e.pos, !0),
                o = r.length,
                a = String.fromCharCode(u),
                2 > o)
                    return !1;
                for (o % 2 && (i = e.push("text", "", 0),
                i.content = a,
                o--),
                n = 0; o > n; n += 2)
                    i = e.push("text", "", 0),
                    i.content = a + a,
                    e.delimiters.push({
                        marker: u,
                        jump: n,
                        token: e.tokens.length - 1,
                        level: e.level,
                        end: -1,
                        open: r.can_open,
                        close: r.can_close
                    });
                return e.pos += r.length,
                !0
            }
            ,
            t.exports.postProcess = function(e) {
                var t, n, r, i, o, a = [], s = e.delimiters, u = e.delimiters.length;
                for (t = 0; u > t; t++)
                    r = s[t],
                    126 === r.marker && -1 !== r.end && (i = s[r.end],
                    o = e.tokens[r.token],
                    o.type = "s_open",
                    o.tag = "s",
                    o.nesting = 1,
                    o.markup = "~~",
                    o.content = "",
                    o = e.tokens[i.token],
                    o.type = "s_close",
                    o.tag = "s",
                    o.nesting = -1,
                    o.markup = "~~",
                    o.content = "",
                    "text" === e.tokens[i.token - 1].type && "~" === e.tokens[i.token - 1].content && a.push(i.token - 1));
                for (; a.length; ) {
                    for (t = a.pop(),
                    n = t + 1; n < e.tokens.length && "s_close" === e.tokens[n].type; )
                        n++;
                    n--,
                    t !== n && (o = e.tokens[n],
                    e.tokens[n] = e.tokens[t],
                    e.tokens[t] = o)
                }
            }
        }
        , {}],
        50: [function(e, t, n) {
            "use strict";
            function r(e) {
                switch (e) {
                case 10:
                case 33:
                case 35:
                case 36:
                case 37:
                case 38:
                case 42:
                case 43:
                case 45:
                case 58:
                case 60:
                case 61:
                case 62:
                case 64:
                case 91:
                case 92:
                case 93:
                case 94:
                case 95:
                case 96:
                case 123:
                case 125:
                case 126:
                    return !0;
                default:
                    return !1
                }
            }
            t.exports = function(e, t) {
                for (var n = e.pos; n < e.posMax && !r(e.src.charCodeAt(n)); )
                    n++;
                return n === e.pos ? !1 : (t || (e.pending += e.src.slice(e.pos, n)),
                e.pos = n,
                !0)
            }
        }
        , {}],
        51: [function(e, t, n) {
            "use strict";
            t.exports = function(e) {
                var t, n, r = 0, i = e.tokens, o = e.tokens.length;
                for (t = n = 0; o > t; t++)
                    r += i[t].nesting,
                    i[t].level = r,
                    "text" === i[t].type && o > t + 1 && "text" === i[t + 1].type ? i[t + 1].content = i[t].content + i[t + 1].content : (t !== n && (i[n] = i[t]),
                    n++);
                t !== n && (i.length = n)
            }
        }
        , {}],
        52: [function(e, t, n) {
            "use strict";
            function r(e, t, n) {
                this.type = e,
                this.tag = t,
                this.attrs = null ,
                this.map = null ,
                this.nesting = n,
                this.level = 0,
                this.children = null ,
                this.content = "",
                this.markup = "",
                this.info = "",
                this.meta = null ,
                this.block = !1,
                this.hidden = !1
            }
            r.prototype.attrIndex = function(e) {
                var t, n, r;
                if (!this.attrs)
                    return -1;
                for (t = this.attrs,
                n = 0,
                r = t.length; r > n; n++)
                    if (t[n][0] === e)
                        return n;
                return -1
            }
            ,
            r.prototype.attrPush = function(e) {
                this.attrs ? this.attrs.push(e) : this.attrs = [e]
            }
            ,
            t.exports = r
        }
        , {}],
        53: [function(t, n, r) {
            (function(t) {
                !function(i) {
                    function o(e) {
                        throw RangeError(R[e])
                    }
                    function a(e, t) {
                        for (var n = e.length, r = []; n--; )
                            r[n] = t(e[n]);
                        return r
                    }
                    function s(e, t) {
                        var n = e.split("@")
                          , r = "";
                        n.length > 1 && (r = n[0] + "@",
                        e = n[1]),
                        e = e.replace(q, ".");
                        var i = e.split(".")
                          , o = a(i, t).join(".");
                        return r + o
                    }
                    function u(e) {
                        for (var t, n, r = [], i = 0, o = e.length; o > i; )
                            t = e.charCodeAt(i++),
                            t >= 55296 && 56319 >= t && o > i ? (n = e.charCodeAt(i++),
                            56320 == (64512 & n) ? r.push(((1023 & t) << 10) + (1023 & n) + 65536) : (r.push(t),
                            i--)) : r.push(t);
                        return r
                    }
                    function c(e) {
                        return a(e, function(e) {
                            var t = "";
                            return e > 65535 && (e -= 65536,
                            t += z(e >>> 10 & 1023 | 55296),
                            e = 56320 | 1023 & e),
                            t += z(e)
                        }).join("")
                    }
                    function l(e) {
                        return 10 > e - 48 ? e - 22 : 26 > e - 65 ? e - 65 : 26 > e - 97 ? e - 97 : w
                    }
                    function p(e, t) {
                        return e + 22 + 75 * (26 > e) - ((0 != t) << 5)
                    }
                    function f(e, t, n) {
                        var r = 0;
                        for (e = n ? I(e / A) : e >> 1,
                        e += I(e / t); e > N * T >> 1; r += w)
                            e = I(e / N);
                        return I(r + (N + 1) * e / (e + x))
                    }
                    function h(e) {
                        var t, n, r, i, a, s, u, p, h, d, m = [], g = e.length, v = 0, b = D, y = M;
                        for (n = e.lastIndexOf(L),
                        0 > n && (n = 0),
                        r = 0; n > r; ++r)
                            e.charCodeAt(r) >= 128 && o("not-basic"),
                            m.push(e.charCodeAt(r));
                        for (i = n > 0 ? n + 1 : 0; g > i; ) {
                            for (a = v,
                            s = 1,
                            u = w; i >= g && o("invalid-input"),
                            p = l(e.charCodeAt(i++)),
                            (p >= w || p > I((C - v) / s)) && o("overflow"),
                            v += p * s,
                            h = y >= u ? E : u >= y + T ? T : u - y,
                            !(h > p); u += w)
                                d = w - h,
                                s > I(C / d) && o("overflow"),
                                s *= d;
                            t = m.length + 1,
                            y = f(v - a, t, 0 == a),
                            I(v / t) > C - b && o("overflow"),
                            b += I(v / t),
                            v %= t,
                            m.splice(v++, 0, b)
                        }
                        return c(m)
                    }
                    function d(e) {
                        var t, n, r, i, a, s, c, l, h, d, m, g, v, b, y, _ = [];
                        for (e = u(e),
                        g = e.length,
                        t = D,
                        n = 0,
                        a = M,
                        s = 0; g > s; ++s)
                            m = e[s],
                            128 > m && _.push(z(m));
                        for (r = i = _.length,
                        i && _.push(L); g > r; ) {
                            for (c = C,
                            s = 0; g > s; ++s)
                                m = e[s],
                                m >= t && c > m && (c = m);
                            for (v = r + 1,
                            c - t > I((C - n) / v) && o("overflow"),
                            n += (c - t) * v,
                            t = c,
                            s = 0; g > s; ++s)
                                if (m = e[s],
                                t > m && ++n > C && o("overflow"),
                                m == t) {
                                    for (l = n,
                                    h = w; d = a >= h ? E : h >= a + T ? T : h - a,
                                    !(d > l); h += w)
                                        y = l - d,
                                        b = w - d,
                                        _.push(z(p(d + y % b, 0))),
                                        l = I(y / b);
                                    _.push(z(p(l, 0))),
                                    a = f(n, v, r == i),
                                    n = 0,
                                    ++r
                                }
                            ++n,
                            ++t
                        }
                        return _.join("")
                    }
                    function m(e) {
                        return s(e, function(e) {
                            return S.test(e) ? h(e.slice(4).toLowerCase()) : e
                        })
                    }
                    function g(e) {
                        return s(e, function(e) {
                            return F.test(e) ? "xn--" + d(e) : e
                        })
                    }
                    var v = "object" == typeof r && r && !r.nodeType && r
                      , b = "object" == typeof n && n && !n.nodeType && n
                      , y = "object" == typeof t && t;
                    (y.global === y || y.window === y || y.self === y) && (i = y);
                    var _, k, C = 2147483647, w = 36, E = 1, T = 26, x = 38, A = 700, M = 72, D = 128, L = "-", S = /^xn--/, F = /[^\x20-\x7E]/, q = /[\x2E\u3002\uFF0E\uFF61]/g, R = {
                        overflow: "Overflow: input needs wider integers to process",
                        "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                        "invalid-input": "Invalid input"
                    }, N = w - E, I = Math.floor, z = String.fromCharCode;
                    if (_ = {
                        version: "1.3.2",
                        ucs2: {
                            decode: u,
                            encode: c
                        },
                        decode: h,
                        encode: d,
                        toASCII: g,
                        toUnicode: m
                    },
                    "function" == typeof e && "object" == typeof e.amd && e.amd)
                        e("punycode", function() {
                            return _
                        });
                    else if (v && b)
                        if (n.exports == v)
                            b.exports = _;
                        else
                            for (k in _)
                                _.hasOwnProperty(k) && (v[k] = _[k]);
                    else
                        i.punycode = _
                }(this)
            }
            ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }
        , {}],
        54: [function(e, t, n) {
            t.exports = {
                Aacute: "Á",
                aacute: "á",
                Abreve: "Ă",
                abreve: "ă",
                ac: "∾",
                acd: "∿",
                acE: "∾̳",
                Acirc: "Â",
                acirc: "â",
                acute: "´",
                Acy: "А",
                acy: "а",
                AElig: "Æ",
                aelig: "æ",
                af: "⁡",
                Afr: "𝔄",
                afr: "𝔞",
                Agrave: "À",
                agrave: "à",
                alefsym: "ℵ",
                aleph: "ℵ",
                Alpha: "Α",
                alpha: "α",
                Amacr: "Ā",
                amacr: "ā",
                amalg: "⨿",
                amp: "&",
                AMP: "&",
                andand: "⩕",
                And: "⩓",
                and: "∧",
                andd: "⩜",
                andslope: "⩘",
                andv: "⩚",
                ang: "∠",
                ange: "⦤",
                angle: "∠",
                angmsdaa: "⦨",
                angmsdab: "⦩",
                angmsdac: "⦪",
                angmsdad: "⦫",
                angmsdae: "⦬",
                angmsdaf: "⦭",
                angmsdag: "⦮",
                angmsdah: "⦯",
                angmsd: "∡",
                angrt: "∟",
                angrtvb: "⊾",
                angrtvbd: "⦝",
                angsph: "∢",
                angst: "Å",
                angzarr: "⍼",
                Aogon: "Ą",
                aogon: "ą",
                Aopf: "𝔸",
                aopf: "𝕒",
                apacir: "⩯",
                ap: "≈",
                apE: "⩰",
                ape: "≊",
                apid: "≋",
                apos: "'",
                ApplyFunction: "⁡",
                approx: "≈",
                approxeq: "≊",
                Aring: "Å",
                aring: "å",
                Ascr: "𝒜",
                ascr: "𝒶",
                Assign: "≔",
                ast: "*",
                asymp: "≈",
                asympeq: "≍",
                Atilde: "Ã",
                atilde: "ã",
                Auml: "Ä",
                auml: "ä",
                awconint: "∳",
                awint: "⨑",
                backcong: "≌",
                backepsilon: "϶",
                backprime: "‵",
                backsim: "∽",
                backsimeq: "⋍",
                Backslash: "∖",
                Barv: "⫧",
                barvee: "⊽",
                barwed: "⌅",
                Barwed: "⌆",
                barwedge: "⌅",
                bbrk: "⎵",
                bbrktbrk: "⎶",
                bcong: "≌",
                Bcy: "Б",
                bcy: "б",
                bdquo: "„",
                becaus: "∵",
                because: "∵",
                Because: "∵",
                bemptyv: "⦰",
                bepsi: "϶",
                bernou: "ℬ",
                Bernoullis: "ℬ",
                Beta: "Β",
                beta: "β",
                beth: "ℶ",
                between: "≬",
                Bfr: "𝔅",
                bfr: "𝔟",
                bigcap: "⋂",
                bigcirc: "◯",
                bigcup: "⋃",
                bigodot: "⨀",
                bigoplus: "⨁",
                bigotimes: "⨂",
                bigsqcup: "⨆",
                bigstar: "★",
                bigtriangledown: "▽",
                bigtriangleup: "△",
                biguplus: "⨄",
                bigvee: "⋁",
                bigwedge: "⋀",
                bkarow: "⤍",
                blacklozenge: "⧫",
                blacksquare: "▪",
                blacktriangle: "▴",
                blacktriangledown: "▾",
                blacktriangleleft: "◂",
                blacktriangleright: "▸",
                blank: "␣",
                blk12: "▒",
                blk14: "░",
                blk34: "▓",
                block: "█",
                bne: "=⃥",
                bnequiv: "≡⃥",
                bNot: "⫭",
                bnot: "⌐",
                Bopf: "𝔹",
                bopf: "𝕓",
                bot: "⊥",
                bottom: "⊥",
                bowtie: "⋈",
                boxbox: "⧉",
                boxdl: "┐",
                boxdL: "╕",
                boxDl: "╖",
                boxDL: "╗",
                boxdr: "┌",
                boxdR: "╒",
                boxDr: "╓",
                boxDR: "╔",
                boxh: "─",
                boxH: "═",
                boxhd: "┬",
                boxHd: "╤",
                boxhD: "╥",
                boxHD: "╦",
                boxhu: "┴",
                boxHu: "╧",
                boxhU: "╨",
                boxHU: "╩",
                boxminus: "⊟",
                boxplus: "⊞",
                boxtimes: "⊠",
                boxul: "┘",
                boxuL: "╛",
                boxUl: "╜",
                boxUL: "╝",
                boxur: "└",
                boxuR: "╘",
                boxUr: "╙",
                boxUR: "╚",
                boxv: "│",
                boxV: "║",
                boxvh: "┼",
                boxvH: "╪",
                boxVh: "╫",
                boxVH: "╬",
                boxvl: "┤",
                boxvL: "╡",
                boxVl: "╢",
                boxVL: "╣",
                boxvr: "├",
                boxvR: "╞",
                boxVr: "╟",
                boxVR: "╠",
                bprime: "‵",
                breve: "˘",
                Breve: "˘",
                brvbar: "¦",
                bscr: "𝒷",
                Bscr: "ℬ",
                bsemi: "⁏",
                bsim: "∽",
                bsime: "⋍",
                bsolb: "⧅",
                bsol: "\\",
                bsolhsub: "⟈",
                bull: "•",
                bullet: "•",
                bump: "≎",
                bumpE: "⪮",
                bumpe: "≏",
                Bumpeq: "≎",
                bumpeq: "≏",
                Cacute: "Ć",
                cacute: "ć",
                capand: "⩄",
                capbrcup: "⩉",
                capcap: "⩋",
                cap: "∩",
                Cap: "⋒",
                capcup: "⩇",
                capdot: "⩀",
                CapitalDifferentialD: "ⅅ",
                caps: "∩︀",
                caret: "⁁",
                caron: "ˇ",
                Cayleys: "ℭ",
                ccaps: "⩍",
                Ccaron: "Č",
                ccaron: "č",
                Ccedil: "Ç",
                ccedil: "ç",
                Ccirc: "Ĉ",
                ccirc: "ĉ",
                Cconint: "∰",
                ccups: "⩌",
                ccupssm: "⩐",
                Cdot: "Ċ",
                cdot: "ċ",
                cedil: "¸",
                Cedilla: "¸",
                cemptyv: "⦲",
                cent: "¢",
                centerdot: "·",
                CenterDot: "·",
                cfr: "𝔠",
                Cfr: "ℭ",
                CHcy: "Ч",
                chcy: "ч",
                check: "✓",
                checkmark: "✓",
                Chi: "Χ",
                chi: "χ",
                circ: "ˆ",
                circeq: "≗",
                circlearrowleft: "↺",
                circlearrowright: "↻",
                circledast: "⊛",
                circledcirc: "⊚",
                circleddash: "⊝",
                CircleDot: "⊙",
                circledR: "®",
                circledS: "Ⓢ",
                CircleMinus: "⊖",
                CirclePlus: "⊕",
                CircleTimes: "⊗",
                cir: "○",
                cirE: "⧃",
                cire: "≗",
                cirfnint: "⨐",
                cirmid: "⫯",
                cirscir: "⧂",
                ClockwiseContourIntegral: "∲",
                CloseCurlyDoubleQuote: "”",
                CloseCurlyQuote: "’",
                clubs: "♣",
                clubsuit: "♣",
                colon: ":",
                Colon: "∷",
                Colone: "⩴",
                colone: "≔",
                coloneq: "≔",
                comma: ",",
                commat: "@",
                comp: "∁",
                compfn: "∘",
                complement: "∁",
                complexes: "ℂ",
                cong: "≅",
                congdot: "⩭",
                Congruent: "≡",
                conint: "∮",
                Conint: "∯",
                ContourIntegral: "∮",
                copf: "𝕔",
                Copf: "ℂ",
                coprod: "∐",
                Coproduct: "∐",
                copy: "©",
                COPY: "©",
                copysr: "℗",
                CounterClockwiseContourIntegral: "∳",
                crarr: "↵",
                cross: "✗",
                Cross: "⨯",
                Cscr: "𝒞",
                cscr: "𝒸",
                csub: "⫏",
                csube: "⫑",
                csup: "⫐",
                csupe: "⫒",
                ctdot: "⋯",
                cudarrl: "⤸",
                cudarrr: "⤵",
                cuepr: "⋞",
                cuesc: "⋟",
                cularr: "↶",
                cularrp: "⤽",
                cupbrcap: "⩈",
                cupcap: "⩆",
                CupCap: "≍",
                cup: "∪",
                Cup: "⋓",
                cupcup: "⩊",
                cupdot: "⊍",
                cupor: "⩅",
                cups: "∪︀",
                curarr: "↷",
                curarrm: "⤼",
                curlyeqprec: "⋞",
                curlyeqsucc: "⋟",
                curlyvee: "⋎",
                curlywedge: "⋏",
                curren: "¤",
                curvearrowleft: "↶",
                curvearrowright: "↷",
                cuvee: "⋎",
                cuwed: "⋏",
                cwconint: "∲",
                cwint: "∱",
                cylcty: "⌭",
                dagger: "†",
                Dagger: "‡",
                daleth: "ℸ",
                darr: "↓",
                Darr: "↡",
                dArr: "⇓",
                dash: "‐",
                Dashv: "⫤",
                dashv: "⊣",
                dbkarow: "⤏",
                dblac: "˝",
                Dcaron: "Ď",
                dcaron: "ď",
                Dcy: "Д",
                dcy: "д",
                ddagger: "‡",
                ddarr: "⇊",
                DD: "ⅅ",
                dd: "ⅆ",
                DDotrahd: "⤑",
                ddotseq: "⩷",
                deg: "°",
                Del: "∇",
                Delta: "Δ",
                delta: "δ",
                demptyv: "⦱",
                dfisht: "⥿",
                Dfr: "𝔇",
                dfr: "𝔡",
                dHar: "⥥",
                dharl: "⇃",
                dharr: "⇂",
                DiacriticalAcute: "´",
                DiacriticalDot: "˙",
                DiacriticalDoubleAcute: "˝",
                DiacriticalGrave: "`",
                DiacriticalTilde: "˜",
                diam: "⋄",
                diamond: "⋄",
                Diamond: "⋄",
                diamondsuit: "♦",
                diams: "♦",
                die: "¨",
                DifferentialD: "ⅆ",
                digamma: "ϝ",
                disin: "⋲",
                div: "÷",
                divide: "÷",
                divideontimes: "⋇",
                divonx: "⋇",
                DJcy: "Ђ",
                djcy: "ђ",
                dlcorn: "⌞",
                dlcrop: "⌍",
                dollar: "$",
                Dopf: "𝔻",
                dopf: "𝕕",
                Dot: "¨",
                dot: "˙",
                DotDot: "⃜",
                doteq: "≐",
                doteqdot: "≑",
                DotEqual: "≐",
                dotminus: "∸",
                dotplus: "∔",
                dotsquare: "⊡",
                doublebarwedge: "⌆",
                DoubleContourIntegral: "∯",
                DoubleDot: "¨",
                DoubleDownArrow: "⇓",
                DoubleLeftArrow: "⇐",
                DoubleLeftRightArrow: "⇔",
                DoubleLeftTee: "⫤",
                DoubleLongLeftArrow: "⟸",
                DoubleLongLeftRightArrow: "⟺",
                DoubleLongRightArrow: "⟹",
                DoubleRightArrow: "⇒",
                DoubleRightTee: "⊨",
                DoubleUpArrow: "⇑",
                DoubleUpDownArrow: "⇕",
                DoubleVerticalBar: "∥",
                DownArrowBar: "⤓",
                downarrow: "↓",
                DownArrow: "↓",
                Downarrow: "⇓",
                DownArrowUpArrow: "⇵",
                DownBreve: "̑",
                downdownarrows: "⇊",
                downharpoonleft: "⇃",
                downharpoonright: "⇂",
                DownLeftRightVector: "⥐",
                DownLeftTeeVector: "⥞",
                DownLeftVectorBar: "⥖",
                DownLeftVector: "↽",
                DownRightTeeVector: "⥟",
                DownRightVectorBar: "⥗",
                DownRightVector: "⇁",
                DownTeeArrow: "↧",
                DownTee: "⊤",
                drbkarow: "⤐",
                drcorn: "⌟",
                drcrop: "⌌",
                Dscr: "𝒟",
                dscr: "𝒹",
                DScy: "Ѕ",
                dscy: "ѕ",
                dsol: "⧶",
                Dstrok: "Đ",
                dstrok: "đ",
                dtdot: "⋱",
                dtri: "▿",
                dtrif: "▾",
                duarr: "⇵",
                duhar: "⥯",
                dwangle: "⦦",
                DZcy: "Џ",
                dzcy: "џ",
                dzigrarr: "⟿",
                Eacute: "É",
                eacute: "é",
                easter: "⩮",
                Ecaron: "Ě",
                ecaron: "ě",
                Ecirc: "Ê",
                ecirc: "ê",
                ecir: "≖",
                ecolon: "≕",
                Ecy: "Э",
                ecy: "э",
                eDDot: "⩷",
                Edot: "Ė",
                edot: "ė",
                eDot: "≑",
                ee: "ⅇ",
                efDot: "≒",
                Efr: "𝔈",
                efr: "𝔢",
                eg: "⪚",
                Egrave: "È",
                egrave: "è",
                egs: "⪖",
                egsdot: "⪘",
                el: "⪙",
                Element: "∈",
                elinters: "⏧",
                ell: "ℓ",
                els: "⪕",
                elsdot: "⪗",
                Emacr: "Ē",
                emacr: "ē",
                empty: "∅",
                emptyset: "∅",
                EmptySmallSquare: "◻",
                emptyv: "∅",
                EmptyVerySmallSquare: "▫",
                emsp13: " ",
                emsp14: " ",
                emsp: " ",
                ENG: "Ŋ",
                eng: "ŋ",
                ensp: " ",
                Eogon: "Ę",
                eogon: "ę",
                Eopf: "𝔼",
                eopf: "𝕖",
                epar: "⋕",
                eparsl: "⧣",
                eplus: "⩱",
                epsi: "ε",
                Epsilon: "Ε",
                epsilon: "ε",
                epsiv: "ϵ",
                eqcirc: "≖",
                eqcolon: "≕",
                eqsim: "≂",
                eqslantgtr: "⪖",
                eqslantless: "⪕",
                Equal: "⩵",
                equals: "=",
                EqualTilde: "≂",
                equest: "≟",
                Equilibrium: "⇌",
                equiv: "≡",
                equivDD: "⩸",
                eqvparsl: "⧥",
                erarr: "⥱",
                erDot: "≓",
                escr: "ℯ",
                Escr: "ℰ",
                esdot: "≐",
                Esim: "⩳",
                esim: "≂",
                Eta: "Η",
                eta: "η",
                ETH: "Ð",
                eth: "ð",
                Euml: "Ë",
                euml: "ë",
                euro: "€",
                excl: "!",
                exist: "∃",
                Exists: "∃",
                expectation: "ℰ",
                exponentiale: "ⅇ",
                ExponentialE: "ⅇ",
                fallingdotseq: "≒",
                Fcy: "Ф",
                fcy: "ф",
                female: "♀",
                ffilig: "ﬃ",
                fflig: "ﬀ",
                ffllig: "ﬄ",
                Ffr: "𝔉",
                ffr: "𝔣",
                filig: "ﬁ",
                FilledSmallSquare: "◼",
                FilledVerySmallSquare: "▪",
                fjlig: "fj",
                flat: "♭",
                fllig: "ﬂ",
                fltns: "▱",
                fnof: "ƒ",
                Fopf: "𝔽",
                fopf: "𝕗",
                forall: "∀",
                ForAll: "∀",
                fork: "⋔",
                forkv: "⫙",
                Fouriertrf: "ℱ",
                fpartint: "⨍",
                frac12: "½",
                frac13: "⅓",
                frac14: "¼",
                frac15: "⅕",
                frac16: "⅙",
                frac18: "⅛",
                frac23: "⅔",
                frac25: "⅖",
                frac34: "¾",
                frac35: "⅗",
                frac38: "⅜",
                frac45: "⅘",
                frac56: "⅚",
                frac58: "⅝",
                frac78: "⅞",
                frasl: "⁄",
                frown: "⌢",
                fscr: "𝒻",
                Fscr: "ℱ",
                gacute: "ǵ",
                Gamma: "Γ",
                gamma: "γ",
                Gammad: "Ϝ",
                gammad: "ϝ",
                gap: "⪆",
                Gbreve: "Ğ",
                gbreve: "ğ",
                Gcedil: "Ģ",
                Gcirc: "Ĝ",
                gcirc: "ĝ",
                Gcy: "Г",
                gcy: "г",
                Gdot: "Ġ",
                gdot: "ġ",
                ge: "≥",
                gE: "≧",
                gEl: "⪌",
                gel: "⋛",
                geq: "≥",
                geqq: "≧",
                geqslant: "⩾",
                gescc: "⪩",
                ges: "⩾",
                gesdot: "⪀",
                gesdoto: "⪂",
                gesdotol: "⪄",
                gesl: "⋛︀",
                gesles: "⪔",
                Gfr: "𝔊",
                gfr: "𝔤",
                gg: "≫",
                Gg: "⋙",
                ggg: "⋙",
                gimel: "ℷ",
                GJcy: "Ѓ",
                gjcy: "ѓ",
                gla: "⪥",
                gl: "≷",
                glE: "⪒",
                glj: "⪤",
                gnap: "⪊",
                gnapprox: "⪊",
                gne: "⪈",
                gnE: "≩",
                gneq: "⪈",
                gneqq: "≩",
                gnsim: "⋧",
                Gopf: "𝔾",
                gopf: "𝕘",
                grave: "`",
                GreaterEqual: "≥",
                GreaterEqualLess: "⋛",
                GreaterFullEqual: "≧",
                GreaterGreater: "⪢",
                GreaterLess: "≷",
                GreaterSlantEqual: "⩾",
                GreaterTilde: "≳",
                Gscr: "𝒢",
                gscr: "ℊ",
                gsim: "≳",
                gsime: "⪎",
                gsiml: "⪐",
                gtcc: "⪧",
                gtcir: "⩺",
                gt: ">",
                GT: ">",
                Gt: "≫",
                gtdot: "⋗",
                gtlPar: "⦕",
                gtquest: "⩼",
                gtrapprox: "⪆",
                gtrarr: "⥸",
                gtrdot: "⋗",
                gtreqless: "⋛",
                gtreqqless: "⪌",
                gtrless: "≷",
                gtrsim: "≳",
                gvertneqq: "≩︀",
                gvnE: "≩︀",
                Hacek: "ˇ",
                hairsp: " ",
                half: "½",
                hamilt: "ℋ",
                HARDcy: "Ъ",
                hardcy: "ъ",
                harrcir: "⥈",
                harr: "↔",
                hArr: "⇔",
                harrw: "↭",
                Hat: "^",
                hbar: "ℏ",
                Hcirc: "Ĥ",
                hcirc: "ĥ",
                hearts: "♥",
                heartsuit: "♥",
                hellip: "…",
                hercon: "⊹",
                hfr: "𝔥",
                Hfr: "ℌ",
                HilbertSpace: "ℋ",
                hksearow: "⤥",
                hkswarow: "⤦",
                hoarr: "⇿",
                homtht: "∻",
                hookleftarrow: "↩",
                hookrightarrow: "↪",
                hopf: "𝕙",
                Hopf: "ℍ",
                horbar: "―",
                HorizontalLine: "─",
                hscr: "𝒽",
                Hscr: "ℋ",
                hslash: "ℏ",
                Hstrok: "Ħ",
                hstrok: "ħ",
                HumpDownHump: "≎",
                HumpEqual: "≏",
                hybull: "⁃",
                hyphen: "‐",
                Iacute: "Í",
                iacute: "í",
                ic: "⁣",
                Icirc: "Î",
                icirc: "î",
                Icy: "И",
                icy: "и",
                Idot: "İ",
                IEcy: "Е",
                iecy: "е",
                iexcl: "¡",
                iff: "⇔",
                ifr: "𝔦",
                Ifr: "ℑ",
                Igrave: "Ì",
                igrave: "ì",
                ii: "ⅈ",
                iiiint: "⨌",
                iiint: "∭",
                iinfin: "⧜",
                iiota: "℩",
                IJlig: "Ĳ",
                ijlig: "ĳ",
                Imacr: "Ī",
                imacr: "ī",
                image: "ℑ",
                ImaginaryI: "ⅈ",
                imagline: "ℐ",
                imagpart: "ℑ",
                imath: "ı",
                Im: "ℑ",
                imof: "⊷",
                imped: "Ƶ",
                Implies: "⇒",
                incare: "℅",
                "in": "∈",
                infin: "∞",
                infintie: "⧝",
                inodot: "ı",
                intcal: "⊺",
                "int": "∫",
                Int: "∬",
                integers: "ℤ",
                Integral: "∫",
                intercal: "⊺",
                Intersection: "⋂",
                intlarhk: "⨗",
                intprod: "⨼",
                InvisibleComma: "⁣",
                InvisibleTimes: "⁢",
                IOcy: "Ё",
                iocy: "ё",
                Iogon: "Į",
                iogon: "į",
                Iopf: "𝕀",
                iopf: "𝕚",
                Iota: "Ι",
                iota: "ι",
                iprod: "⨼",
                iquest: "¿",
                iscr: "𝒾",
                Iscr: "ℐ",
                isin: "∈",
                isindot: "⋵",
                isinE: "⋹",
                isins: "⋴",
                isinsv: "⋳",
                isinv: "∈",
                it: "⁢",
                Itilde: "Ĩ",
                itilde: "ĩ",
                Iukcy: "І",
                iukcy: "і",
                Iuml: "Ï",
                iuml: "ï",
                Jcirc: "Ĵ",
                jcirc: "ĵ",
                Jcy: "Й",
                jcy: "й",
                Jfr: "𝔍",
                jfr: "𝔧",
                jmath: "ȷ",
                Jopf: "𝕁",
                jopf: "𝕛",
                Jscr: "𝒥",
                jscr: "𝒿",
                Jsercy: "Ј",
                jsercy: "ј",
                Jukcy: "Є",
                jukcy: "є",
                Kappa: "Κ",
                kappa: "κ",
                kappav: "ϰ",
                Kcedil: "Ķ",
                kcedil: "ķ",
                Kcy: "К",
                kcy: "к",
                Kfr: "𝔎",
                kfr: "𝔨",
                kgreen: "ĸ",
                KHcy: "Х",
                khcy: "х",
                KJcy: "Ќ",
                kjcy: "ќ",
                Kopf: "𝕂",
                kopf: "𝕜",
                Kscr: "𝒦",
                kscr: "𝓀",
                lAarr: "⇚",
                Lacute: "Ĺ",
                lacute: "ĺ",
                laemptyv: "⦴",
                lagran: "ℒ",
                Lambda: "Λ",
                lambda: "λ",
                lang: "⟨",
                Lang: "⟪",
                langd: "⦑",
                langle: "⟨",
                lap: "⪅",
                Laplacetrf: "ℒ",
                laquo: "«",
                larrb: "⇤",
                larrbfs: "⤟",
                larr: "←",
                Larr: "↞",
                lArr: "⇐",
                larrfs: "⤝",
                larrhk: "↩",
                larrlp: "↫",
                larrpl: "⤹",
                larrsim: "⥳",
                larrtl: "↢",
                latail: "⤙",
                lAtail: "⤛",
                lat: "⪫",
                late: "⪭",
                lates: "⪭︀",
                lbarr: "⤌",
                lBarr: "⤎",
                lbbrk: "❲",
                lbrace: "{",
                lbrack: "[",
                lbrke: "⦋",
                lbrksld: "⦏",
                lbrkslu: "⦍",
                Lcaron: "Ľ",
                lcaron: "ľ",
                Lcedil: "Ļ",
                lcedil: "ļ",
                lceil: "⌈",
                lcub: "{",
                Lcy: "Л",
                lcy: "л",
                ldca: "⤶",
                ldquo: "“",
                ldquor: "„",
                ldrdhar: "⥧",
                ldrushar: "⥋",
                ldsh: "↲",
                le: "≤",
                lE: "≦",
                LeftAngleBracket: "⟨",
                LeftArrowBar: "⇤",
                leftarrow: "←",
                LeftArrow: "←",
                Leftarrow: "⇐",
                LeftArrowRightArrow: "⇆",
                leftarrowtail: "↢",
                LeftCeiling: "⌈",
                LeftDoubleBracket: "⟦",
                LeftDownTeeVector: "⥡",
                LeftDownVectorBar: "⥙",
                LeftDownVector: "⇃",
                LeftFloor: "⌊",
                leftharpoondown: "↽",
                leftharpoonup: "↼",
                leftleftarrows: "⇇",
                leftrightarrow: "↔",
                LeftRightArrow: "↔",
                Leftrightarrow: "⇔",
                leftrightarrows: "⇆",
                leftrightharpoons: "⇋",
                leftrightsquigarrow: "↭",
                LeftRightVector: "⥎",
                LeftTeeArrow: "↤",
                LeftTee: "⊣",
                LeftTeeVector: "⥚",
                leftthreetimes: "⋋",
                LeftTriangleBar: "⧏",
                LeftTriangle: "⊲",
                LeftTriangleEqual: "⊴",
                LeftUpDownVector: "⥑",
                LeftUpTeeVector: "⥠",
                LeftUpVectorBar: "⥘",
                LeftUpVector: "↿",
                LeftVectorBar: "⥒",
                LeftVector: "↼",
                lEg: "⪋",
                leg: "⋚",
                leq: "≤",
                leqq: "≦",
                leqslant: "⩽",
                lescc: "⪨",
                les: "⩽",
                lesdot: "⩿",
                lesdoto: "⪁",
                lesdotor: "⪃",
                lesg: "⋚︀",
                lesges: "⪓",
                lessapprox: "⪅",
                lessdot: "⋖",
                lesseqgtr: "⋚",
                lesseqqgtr: "⪋",
                LessEqualGreater: "⋚",
                LessFullEqual: "≦",
                LessGreater: "≶",
                lessgtr: "≶",
                LessLess: "⪡",
                lesssim: "≲",
                LessSlantEqual: "⩽",
                LessTilde: "≲",
                lfisht: "⥼",
                lfloor: "⌊",
                Lfr: "𝔏",
                lfr: "𝔩",
                lg: "≶",
                lgE: "⪑",
                lHar: "⥢",
                lhard: "↽",
                lharu: "↼",
                lharul: "⥪",
                lhblk: "▄",
                LJcy: "Љ",
                ljcy: "љ",
                llarr: "⇇",
                ll: "≪",
                Ll: "⋘",
                llcorner: "⌞",
                Lleftarrow: "⇚",
                llhard: "⥫",
                lltri: "◺",
                Lmidot: "Ŀ",
                lmidot: "ŀ",
                lmoustache: "⎰",
                lmoust: "⎰",
                lnap: "⪉",
                lnapprox: "⪉",
                lne: "⪇",
                lnE: "≨",
                lneq: "⪇",
                lneqq: "≨",
                lnsim: "⋦",
                loang: "⟬",
                loarr: "⇽",
                lobrk: "⟦",
                longleftarrow: "⟵",
                LongLeftArrow: "⟵",
                Longleftarrow: "⟸",
                longleftrightarrow: "⟷",
                LongLeftRightArrow: "⟷",
                Longleftrightarrow: "⟺",
                longmapsto: "⟼",
                longrightarrow: "⟶",
                LongRightArrow: "⟶",
                Longrightarrow: "⟹",
                looparrowleft: "↫",
                looparrowright: "↬",
                lopar: "⦅",
                Lopf: "𝕃",
                lopf: "𝕝",
                loplus: "⨭",
                lotimes: "⨴",
                lowast: "∗",
                lowbar: "_",
                LowerLeftArrow: "↙",
                LowerRightArrow: "↘",
                loz: "◊",
                lozenge: "◊",
                lozf: "⧫",
                lpar: "(",
                lparlt: "⦓",
                lrarr: "⇆",
                lrcorner: "⌟",
                lrhar: "⇋",
                lrhard: "⥭",
                lrm: "‎",
                lrtri: "⊿",
                lsaquo: "‹",
                lscr: "𝓁",
                Lscr: "ℒ",
                lsh: "↰",
                Lsh: "↰",
                lsim: "≲",
                lsime: "⪍",
                lsimg: "⪏",
                lsqb: "[",
                lsquo: "‘",
                lsquor: "‚",
                Lstrok: "Ł",
                lstrok: "ł",
                ltcc: "⪦",
                ltcir: "⩹",
                lt: "<",
                LT: "<",
                Lt: "≪",
                ltdot: "⋖",
                lthree: "⋋",
                ltimes: "⋉",
                ltlarr: "⥶",
                ltquest: "⩻",
                ltri: "◃",
                ltrie: "⊴",
                ltrif: "◂",
                ltrPar: "⦖",
                lurdshar: "⥊",
                luruhar: "⥦",
                lvertneqq: "≨︀",
                lvnE: "≨︀",
                macr: "¯",
                male: "♂",
                malt: "✠",
                maltese: "✠",
                Map: "⤅",
                map: "↦",
                mapsto: "↦",
                mapstodown: "↧",
                mapstoleft: "↤",
                mapstoup: "↥",
                marker: "▮",
                mcomma: "⨩",
                Mcy: "М",
                mcy: "м",
                mdash: "—",
                mDDot: "∺",
                measuredangle: "∡",
                MediumSpace: " ",
                Mellintrf: "ℳ",
                Mfr: "𝔐",
                mfr: "𝔪",
                mho: "℧",
                micro: "µ",
                midast: "*",
                midcir: "⫰",
                mid: "∣",
                middot: "·",
                minusb: "⊟",
                minus: "−",
                minusd: "∸",
                minusdu: "⨪",
                MinusPlus: "∓",
                mlcp: "⫛",
                mldr: "…",
                mnplus: "∓",
                models: "⊧",
                Mopf: "𝕄",
                mopf: "𝕞",
                mp: "∓",
                mscr: "𝓂",
                Mscr: "ℳ",
                mstpos: "∾",
                Mu: "Μ",
                mu: "μ",
                multimap: "⊸",
                mumap: "⊸",
                nabla: "∇",
                Nacute: "Ń",
                nacute: "ń",
                nang: "∠⃒",
                nap: "≉",
                napE: "⩰̸",
                napid: "≋̸",
                napos: "ŉ",
                napprox: "≉",
                natural: "♮",
                naturals: "ℕ",
                natur: "♮",
                nbsp: " ",
                nbump: "≎̸",
                nbumpe: "≏̸",
                ncap: "⩃",
                Ncaron: "Ň",
                ncaron: "ň",
                Ncedil: "Ņ",
                ncedil: "ņ",
                ncong: "≇",
                ncongdot: "⩭̸",
                ncup: "⩂",
                Ncy: "Н",
                ncy: "н",
                ndash: "–",
                nearhk: "⤤",
                nearr: "↗",
                neArr: "⇗",
                nearrow: "↗",
                ne: "≠",
                nedot: "≐̸",
                NegativeMediumSpace: "​",
                NegativeThickSpace: "​",
                NegativeThinSpace: "​",
                NegativeVeryThinSpace: "​",
                nequiv: "≢",
                nesear: "⤨",
                nesim: "≂̸",
                NestedGreaterGreater: "≫",
                NestedLessLess: "≪",
                NewLine: "\n",
                nexist: "∄",
                nexists: "∄",
                Nfr: "𝔑",
                nfr: "𝔫",
                ngE: "≧̸",
                nge: "≱",
                ngeq: "≱",
                ngeqq: "≧̸",
                ngeqslant: "⩾̸",
                nges: "⩾̸",
                nGg: "⋙̸",
                ngsim: "≵",
                nGt: "≫⃒",
                ngt: "≯",
                ngtr: "≯",
                nGtv: "≫̸",
                nharr: "↮",
                nhArr: "⇎",
                nhpar: "⫲",
                ni: "∋",
                nis: "⋼",
                nisd: "⋺",
                niv: "∋",
                NJcy: "Њ",
                njcy: "њ",
                nlarr: "↚",
                nlArr: "⇍",
                nldr: "‥",
                nlE: "≦̸",
                nle: "≰",
                nleftarrow: "↚",
                nLeftarrow: "⇍",
                nleftrightarrow: "↮",
                nLeftrightarrow: "⇎",
                nleq: "≰",
                nleqq: "≦̸",
                nleqslant: "⩽̸",
                nles: "⩽̸",
                nless: "≮",
                nLl: "⋘̸",
                nlsim: "≴",
                nLt: "≪⃒",
                nlt: "≮",
                nltri: "⋪",
                nltrie: "⋬",
                nLtv: "≪̸",
                nmid: "∤",
                NoBreak: "⁠",
                NonBreakingSpace: " ",
                nopf: "𝕟",
                Nopf: "ℕ",
                Not: "⫬",
                not: "¬",
                NotCongruent: "≢",
                NotCupCap: "≭",
                NotDoubleVerticalBar: "∦",
                NotElement: "∉",
                NotEqual: "≠",
                NotEqualTilde: "≂̸",
                NotExists: "∄",
                NotGreater: "≯",
                NotGreaterEqual: "≱",
                NotGreaterFullEqual: "≧̸",
                NotGreaterGreater: "≫̸",
                NotGreaterLess: "≹",
                NotGreaterSlantEqual: "⩾̸",
                NotGreaterTilde: "≵",
                NotHumpDownHump: "≎̸",
                NotHumpEqual: "≏̸",
                notin: "∉",
                notindot: "⋵̸",
                notinE: "⋹̸",
                notinva: "∉",
                notinvb: "⋷",
                notinvc: "⋶",
                NotLeftTriangleBar: "⧏̸",
                NotLeftTriangle: "⋪",
                NotLeftTriangleEqual: "⋬",
                NotLess: "≮",
                NotLessEqual: "≰",
                NotLessGreater: "≸",
                NotLessLess: "≪̸",
                NotLessSlantEqual: "⩽̸",
                NotLessTilde: "≴",
                NotNestedGreaterGreater: "⪢̸",
                NotNestedLessLess: "⪡̸",
                notni: "∌",
                notniva: "∌",
                notnivb: "⋾",
                notnivc: "⋽",
                NotPrecedes: "⊀",
                NotPrecedesEqual: "⪯̸",
                NotPrecedesSlantEqual: "⋠",
                NotReverseElement: "∌",
                NotRightTriangleBar: "⧐̸",
                NotRightTriangle: "⋫",
                NotRightTriangleEqual: "⋭",
                NotSquareSubset: "⊏̸",
                NotSquareSubsetEqual: "⋢",
                NotSquareSuperset: "⊐̸",
                NotSquareSupersetEqual: "⋣",
                NotSubset: "⊂⃒",
                NotSubsetEqual: "⊈",
                NotSucceeds: "⊁",
                NotSucceedsEqual: "⪰̸",
                NotSucceedsSlantEqual: "⋡",
                NotSucceedsTilde: "≿̸",
                NotSuperset: "⊃⃒",
                NotSupersetEqual: "⊉",
                NotTilde: "≁",
                NotTildeEqual: "≄",
                NotTildeFullEqual: "≇",
                NotTildeTilde: "≉",
                NotVerticalBar: "∤",
                nparallel: "∦",
                npar: "∦",
                nparsl: "⫽⃥",
                npart: "∂̸",
                npolint: "⨔",
                npr: "⊀",
                nprcue: "⋠",
                nprec: "⊀",
                npreceq: "⪯̸",
                npre: "⪯̸",
                nrarrc: "⤳̸",
                nrarr: "↛",
                nrArr: "⇏",
                nrarrw: "↝̸",
                nrightarrow: "↛",
                nRightarrow: "⇏",
                nrtri: "⋫",
                nrtrie: "⋭",
                nsc: "⊁",
                nsccue: "⋡",
                nsce: "⪰̸",
                Nscr: "𝒩",
                nscr: "𝓃",
                nshortmid: "∤",
                nshortparallel: "∦",
                nsim: "≁",
                nsime: "≄",
                nsimeq: "≄",
                nsmid: "∤",
                nspar: "∦",
                nsqsube: "⋢",
                nsqsupe: "⋣",
                nsub: "⊄",
                nsubE: "⫅̸",
                nsube: "⊈",
                nsubset: "⊂⃒",
                nsubseteq: "⊈",
                nsubseteqq: "⫅̸",
                nsucc: "⊁",
                nsucceq: "⪰̸",
                nsup: "⊅",
                nsupE: "⫆̸",
                nsupe: "⊉",
                nsupset: "⊃⃒",
                nsupseteq: "⊉",
                nsupseteqq: "⫆̸",
                ntgl: "≹",
                Ntilde: "Ñ",
                ntilde: "ñ",
                ntlg: "≸",
                ntriangleleft: "⋪",
                ntrianglelefteq: "⋬",
                ntriangleright: "⋫",
                ntrianglerighteq: "⋭",
                Nu: "Ν",
                nu: "ν",
                num: "#",
                numero: "№",
                numsp: " ",
                nvap: "≍⃒",
                nvdash: "⊬",
                nvDash: "⊭",
                nVdash: "⊮",
                nVDash: "⊯",
                nvge: "≥⃒",
                nvgt: ">⃒",
                nvHarr: "⤄",
                nvinfin: "⧞",
                nvlArr: "⤂",
                nvle: "≤⃒",
                nvlt: "<⃒",
                nvltrie: "⊴⃒",
                nvrArr: "⤃",
                nvrtrie: "⊵⃒",
                nvsim: "∼⃒",
                nwarhk: "⤣",
                nwarr: "↖",
                nwArr: "⇖",
                nwarrow: "↖",
                nwnear: "⤧",
                Oacute: "Ó",
                oacute: "ó",
                oast: "⊛",
                Ocirc: "Ô",
                ocirc: "ô",
                ocir: "⊚",
                Ocy: "О",
                ocy: "о",
                odash: "⊝",
                Odblac: "Ő",
                odblac: "ő",
                odiv: "⨸",
                odot: "⊙",
                odsold: "⦼",
                OElig: "Œ",
                oelig: "œ",
                ofcir: "⦿",
                Ofr: "𝔒",
                ofr: "𝔬",
                ogon: "˛",
                Ograve: "Ò",
                ograve: "ò",
                ogt: "⧁",
                ohbar: "⦵",
                ohm: "Ω",
                oint: "∮",
                olarr: "↺",
                olcir: "⦾",
                olcross: "⦻",
                oline: "‾",
                olt: "⧀",
                Omacr: "Ō",
                omacr: "ō",
                Omega: "Ω",
                omega: "ω",
                Omicron: "Ο",
                omicron: "ο",
                omid: "⦶",
                ominus: "⊖",
                Oopf: "𝕆",
                oopf: "𝕠",
                opar: "⦷",
                OpenCurlyDoubleQuote: "“",
                OpenCurlyQuote: "‘",
                operp: "⦹",
                oplus: "⊕",
                orarr: "↻",
                Or: "⩔",
                or: "∨",
                ord: "⩝",
                order: "ℴ",
                orderof: "ℴ",
                ordf: "ª",
                ordm: "º",
                origof: "⊶",
                oror: "⩖",
                orslope: "⩗",
                orv: "⩛",
                oS: "Ⓢ",
                Oscr: "𝒪",
                oscr: "ℴ",
                Oslash: "Ø",
                oslash: "ø",
                osol: "⊘",
                Otilde: "Õ",
                otilde: "õ",
                otimesas: "⨶",
                Otimes: "⨷",
                otimes: "⊗",
                Ouml: "Ö",
                ouml: "ö",
                ovbar: "⌽",
                OverBar: "‾",
                OverBrace: "⏞",
                OverBracket: "⎴",
                OverParenthesis: "⏜",
                para: "¶",
                parallel: "∥",
                par: "∥",
                parsim: "⫳",
                parsl: "⫽",
                part: "∂",
                PartialD: "∂",
                Pcy: "П",
                pcy: "п",
                percnt: "%",
                period: ".",
                permil: "‰",
                perp: "⊥",
                pertenk: "‱",
                Pfr: "𝔓",
                pfr: "𝔭",
                Phi: "Φ",
                phi: "φ",
                phiv: "ϕ",
                phmmat: "ℳ",
                phone: "☎",
                Pi: "Π",
                pi: "π",
                pitchfork: "⋔",
                piv: "ϖ",
                planck: "ℏ",
                planckh: "ℎ",
                plankv: "ℏ",
                plusacir: "⨣",
                plusb: "⊞",
                pluscir: "⨢",
                plus: "+",
                plusdo: "∔",
                plusdu: "⨥",
                pluse: "⩲",
                PlusMinus: "±",
                plusmn: "±",
                plussim: "⨦",
                plustwo: "⨧",
                pm: "±",
                Poincareplane: "ℌ",
                pointint: "⨕",
                popf: "𝕡",
                Popf: "ℙ",
                pound: "£",
                prap: "⪷",
                Pr: "⪻",
                pr: "≺",
                prcue: "≼",
                precapprox: "⪷",
                prec: "≺",
                preccurlyeq: "≼",
                Precedes: "≺",
                PrecedesEqual: "⪯",
                PrecedesSlantEqual: "≼",
                PrecedesTilde: "≾",
                preceq: "⪯",
                precnapprox: "⪹",
                precneqq: "⪵",
                precnsim: "⋨",
                pre: "⪯",
                prE: "⪳",
                precsim: "≾",
                prime: "′",
                Prime: "″",
                primes: "ℙ",
                prnap: "⪹",
                prnE: "⪵",
                prnsim: "⋨",
                prod: "∏",
                Product: "∏",
                profalar: "⌮",
                profline: "⌒",
                profsurf: "⌓",
                prop: "∝",
                Proportional: "∝",
                Proportion: "∷",
                propto: "∝",
                prsim: "≾",
                prurel: "⊰",
                Pscr: "𝒫",
                pscr: "𝓅",
                Psi: "Ψ",
                psi: "ψ",
                puncsp: " ",
                Qfr: "𝔔",
                qfr: "𝔮",
                qint: "⨌",
                qopf: "𝕢",
                Qopf: "ℚ",
                qprime: "⁗",
                Qscr: "𝒬",
                qscr: "𝓆",
                quaternions: "ℍ",
                quatint: "⨖",
                quest: "?",
                questeq: "≟",
                quot: '"',
                QUOT: '"',
                rAarr: "⇛",
                race: "∽̱",
                Racute: "Ŕ",
                racute: "ŕ",
                radic: "√",
                raemptyv: "⦳",
                rang: "⟩",
                Rang: "⟫",
                rangd: "⦒",
                range: "⦥",
                rangle: "⟩",
                raquo: "»",
                rarrap: "⥵",
                rarrb: "⇥",
                rarrbfs: "⤠",
                rarrc: "⤳",
                rarr: "→",
                Rarr: "↠",
                rArr: "⇒",
                rarrfs: "⤞",
                rarrhk: "↪",
                rarrlp: "↬",
                rarrpl: "⥅",
                rarrsim: "⥴",
                Rarrtl: "⤖",
                rarrtl: "↣",
                rarrw: "↝",
                ratail: "⤚",
                rAtail: "⤜",
                ratio: "∶",
                rationals: "ℚ",
                rbarr: "⤍",
                rBarr: "⤏",
                RBarr: "⤐",
                rbbrk: "❳",
                rbrace: "}",
                rbrack: "]",
                rbrke: "⦌",
                rbrksld: "⦎",
                rbrkslu: "⦐",
                Rcaron: "Ř",
                rcaron: "ř",
                Rcedil: "Ŗ",
                rcedil: "ŗ",
                rceil: "⌉",
                rcub: "}",
                Rcy: "Р",
                rcy: "р",
                rdca: "⤷",
                rdldhar: "⥩",
                rdquo: "”",
                rdquor: "”",
                rdsh: "↳",
                real: "ℜ",
                realine: "ℛ",
                realpart: "ℜ",
                reals: "ℝ",
                Re: "ℜ",
                rect: "▭",
                reg: "®",
                REG: "®",
                ReverseElement: "∋",
                ReverseEquilibrium: "⇋",
                ReverseUpEquilibrium: "⥯",
                rfisht: "⥽",
                rfloor: "⌋",
                rfr: "𝔯",
                Rfr: "ℜ",
                rHar: "⥤",
                rhard: "⇁",
                rharu: "⇀",
                rharul: "⥬",
                Rho: "Ρ",
                rho: "ρ",
                rhov: "ϱ",
                RightAngleBracket: "⟩",
                RightArrowBar: "⇥",
                rightarrow: "→",
                RightArrow: "→",
                Rightarrow: "⇒",
                RightArrowLeftArrow: "⇄",
                rightarrowtail: "↣",
                RightCeiling: "⌉",
                RightDoubleBracket: "⟧",
                RightDownTeeVector: "⥝",
                RightDownVectorBar: "⥕",
                RightDownVector: "⇂",
                RightFloor: "⌋",
                rightharpoondown: "⇁",
                rightharpoonup: "⇀",
                rightleftarrows: "⇄",
                rightleftharpoons: "⇌",
                rightrightarrows: "⇉",
                rightsquigarrow: "↝",
                RightTeeArrow: "↦",
                RightTee: "⊢",
                RightTeeVector: "⥛",
                rightthreetimes: "⋌",
                RightTriangleBar: "⧐",
                RightTriangle: "⊳",
                RightTriangleEqual: "⊵",
                RightUpDownVector: "⥏",
                RightUpTeeVector: "⥜",
                RightUpVectorBar: "⥔",
                RightUpVector: "↾",
                RightVectorBar: "⥓",
                RightVector: "⇀",
                ring: "˚",
                risingdotseq: "≓",
                rlarr: "⇄",
                rlhar: "⇌",
                rlm: "‏",
                rmoustache: "⎱",
                rmoust: "⎱",
                rnmid: "⫮",
                roang: "⟭",
                roarr: "⇾",
                robrk: "⟧",
                ropar: "⦆",
                ropf: "𝕣",
                Ropf: "ℝ",
                roplus: "⨮",
                rotimes: "⨵",
                RoundImplies: "⥰",
                rpar: ")",
                rpargt: "⦔",
                rppolint: "⨒",
                rrarr: "⇉",
                Rrightarrow: "⇛",
                rsaquo: "›",
                rscr: "𝓇",
                Rscr: "ℛ",
                rsh: "↱",
                Rsh: "↱",
                rsqb: "]",
                rsquo: "’",
                rsquor: "’",
                rthree: "⋌",
                rtimes: "⋊",
                rtri: "▹",
                rtrie: "⊵",
                rtrif: "▸",
                rtriltri: "⧎",
                RuleDelayed: "⧴",
                ruluhar: "⥨",
                rx: "℞",
                Sacute: "Ś",
                sacute: "ś",
                sbquo: "‚",
                scap: "⪸",
                Scaron: "Š",
                scaron: "š",
                Sc: "⪼",
                sc: "≻",
                sccue: "≽",
                sce: "⪰",
                scE: "⪴",
                Scedil: "Ş",
                scedil: "ş",
                Scirc: "Ŝ",
                scirc: "ŝ",
                scnap: "⪺",
                scnE: "⪶",
                scnsim: "⋩",
                scpolint: "⨓",
                scsim: "≿",
                Scy: "С",
                scy: "с",
                sdotb: "⊡",
                sdot: "⋅",
                sdote: "⩦",
                searhk: "⤥",
                searr: "↘",
                seArr: "⇘",
                searrow: "↘",
                sect: "§",
                semi: ";",
                seswar: "⤩",
                setminus: "∖",
                setmn: "∖",
                sext: "✶",
                Sfr: "𝔖",
                sfr: "𝔰",
                sfrown: "⌢",
                sharp: "♯",
                SHCHcy: "Щ",
                shchcy: "щ",
                SHcy: "Ш",
                shcy: "ш",
                ShortDownArrow: "↓",
                ShortLeftArrow: "←",
                shortmid: "∣",
                shortparallel: "∥",
                ShortRightArrow: "→",
                ShortUpArrow: "↑",
                shy: "­",
                Sigma: "Σ",
                sigma: "σ",
                sigmaf: "ς",
                sigmav: "ς",
                sim: "∼",
                simdot: "⩪",
                sime: "≃",
                simeq: "≃",
                simg: "⪞",
                simgE: "⪠",
                siml: "⪝",
                simlE: "⪟",
                simne: "≆",
                simplus: "⨤",
                simrarr: "⥲",
                slarr: "←",
                SmallCircle: "∘",
                smallsetminus: "∖",
                smashp: "⨳",
                smeparsl: "⧤",
                smid: "∣",
                smile: "⌣",
                smt: "⪪",
                smte: "⪬",
                smtes: "⪬︀",
                SOFTcy: "Ь",
                softcy: "ь",
                solbar: "⌿",
                solb: "⧄",
                sol: "/",
                Sopf: "𝕊",
                sopf: "𝕤",
                spades: "♠",
                spadesuit: "♠",
                spar: "∥",
                sqcap: "⊓",
                sqcaps: "⊓︀",
                sqcup: "⊔",
                sqcups: "⊔︀",
                Sqrt: "√",
                sqsub: "⊏",
                sqsube: "⊑",
                sqsubset: "⊏",
                sqsubseteq: "⊑",
                sqsup: "⊐",
                sqsupe: "⊒",
                sqsupset: "⊐",
                sqsupseteq: "⊒",
                square: "□",
                Square: "□",
                SquareIntersection: "⊓",
                SquareSubset: "⊏",
                SquareSubsetEqual: "⊑",
                SquareSuperset: "⊐",
                SquareSupersetEqual: "⊒",
                SquareUnion: "⊔",
                squarf: "▪",
                squ: "□",
                squf: "▪",
                srarr: "→",
                Sscr: "𝒮",
                sscr: "𝓈",
                ssetmn: "∖",
                ssmile: "⌣",
                sstarf: "⋆",
                Star: "⋆",
                star: "☆",
                starf: "★",
                straightepsilon: "ϵ",
                straightphi: "ϕ",
                strns: "¯",
                sub: "⊂",
                Sub: "⋐",
                subdot: "⪽",
                subE: "⫅",
                sube: "⊆",
                subedot: "⫃",
                submult: "⫁",
                subnE: "⫋",
                subne: "⊊",
                subplus: "⪿",
                subrarr: "⥹",
                subset: "⊂",
                Subset: "⋐",
                subseteq: "⊆",
                subseteqq: "⫅",
                SubsetEqual: "⊆",
                subsetneq: "⊊",
                subsetneqq: "⫋",
                subsim: "⫇",
                subsub: "⫕",
                subsup: "⫓",
                succapprox: "⪸",
                succ: "≻",
                succcurlyeq: "≽",
                Succeeds: "≻",
                SucceedsEqual: "⪰",
                SucceedsSlantEqual: "≽",
                SucceedsTilde: "≿",
                succeq: "⪰",
                succnapprox: "⪺",
                succneqq: "⪶",
                succnsim: "⋩",
                succsim: "≿",
                SuchThat: "∋",
                sum: "∑",
                Sum: "∑",
                sung: "♪",
                sup1: "¹",
                sup2: "²",
                sup3: "³",
                sup: "⊃",
                Sup: "⋑",
                supdot: "⪾",
                supdsub: "⫘",
                supE: "⫆",
                supe: "⊇",
                supedot: "⫄",
                Superset: "⊃",
                SupersetEqual: "⊇",
                suphsol: "⟉",
                suphsub: "⫗",
                suplarr: "⥻",
                supmult: "⫂",
                supnE: "⫌",
                supne: "⊋",
                supplus: "⫀",
                supset: "⊃",
                Supset: "⋑",
                supseteq: "⊇",
                supseteqq: "⫆",
                supsetneq: "⊋",
                supsetneqq: "⫌",
                supsim: "⫈",
                supsub: "⫔",
                supsup: "⫖",
                swarhk: "⤦",
                swarr: "↙",
                swArr: "⇙",
                swarrow: "↙",
                swnwar: "⤪",
                szlig: "ß",
                Tab: "	",
                target: "⌖",
                Tau: "Τ",
                tau: "τ",
                tbrk: "⎴",
                Tcaron: "Ť",
                tcaron: "ť",
                Tcedil: "Ţ",
                tcedil: "ţ",
                Tcy: "Т",
                tcy: "т",
                tdot: "⃛",
                telrec: "⌕",
                Tfr: "𝔗",
                tfr: "𝔱",
                there4: "∴",
                therefore: "∴",
                Therefore: "∴",
                Theta: "Θ",
                theta: "θ",
                thetasym: "ϑ",
                thetav: "ϑ",
                thickapprox: "≈",
                thicksim: "∼",
                ThickSpace: "  ",
                ThinSpace: " ",
                thinsp: " ",
                thkap: "≈",
                thksim: "∼",
                THORN: "Þ",
                thorn: "þ",
                tilde: "˜",
                Tilde: "∼",
                TildeEqual: "≃",
                TildeFullEqual: "≅",
                TildeTilde: "≈",
                timesbar: "⨱",
                timesb: "⊠",
                times: "×",
                timesd: "⨰",
                tint: "∭",
                toea: "⤨",
                topbot: "⌶",
                topcir: "⫱",
                top: "⊤",
                Topf: "𝕋",
                topf: "𝕥",
                topfork: "⫚",
                tosa: "⤩",
                tprime: "‴",
                trade: "™",
                TRADE: "™",
                triangle: "▵",
                triangledown: "▿",
                triangleleft: "◃",
                trianglelefteq: "⊴",
                triangleq: "≜",
                triangleright: "▹",
                trianglerighteq: "⊵",
                tridot: "◬",
                trie: "≜",
                triminus: "⨺",
                TripleDot: "⃛",
                triplus: "⨹",
                trisb: "⧍",
                tritime: "⨻",
                trpezium: "⏢",
                Tscr: "𝒯",
                tscr: "𝓉",
                TScy: "Ц",
                tscy: "ц",
                TSHcy: "Ћ",
                tshcy: "ћ",
                Tstrok: "Ŧ",
                tstrok: "ŧ",
                twixt: "≬",
                twoheadleftarrow: "↞",
                twoheadrightarrow: "↠",
                Uacute: "Ú",
                uacute: "ú",
                uarr: "↑",
                Uarr: "↟",
                uArr: "⇑",
                Uarrocir: "⥉",
                Ubrcy: "Ў",
                ubrcy: "ў",
                Ubreve: "Ŭ",
                ubreve: "ŭ",
                Ucirc: "Û",
                ucirc: "û",
                Ucy: "У",
                ucy: "у",
                udarr: "⇅",
                Udblac: "Ű",
                udblac: "ű",
                udhar: "⥮",
                ufisht: "⥾",
                Ufr: "𝔘",
                ufr: "𝔲",
                Ugrave: "Ù",
                ugrave: "ù",
                uHar: "⥣",
                uharl: "↿",
                uharr: "↾",
                uhblk: "▀",
                ulcorn: "⌜",
                ulcorner: "⌜",
                ulcrop: "⌏",
                ultri: "◸",
                Umacr: "Ū",
                umacr: "ū",
                uml: "¨",
                UnderBar: "_",
                UnderBrace: "⏟",
                UnderBracket: "⎵",
                UnderParenthesis: "⏝",
                Union: "⋃",
                UnionPlus: "⊎",
                Uogon: "Ų",
                uogon: "ų",
                Uopf: "𝕌",
                uopf: "𝕦",
                UpArrowBar: "⤒",
                uparrow: "↑",
                UpArrow: "↑",
                Uparrow: "⇑",
                UpArrowDownArrow: "⇅",
                updownarrow: "↕",
                UpDownArrow: "↕",
                Updownarrow: "⇕",
                UpEquilibrium: "⥮",
                upharpoonleft: "↿",
                upharpoonright: "↾",
                uplus: "⊎",
                UpperLeftArrow: "↖",
                UpperRightArrow: "↗",
                upsi: "υ",
                Upsi: "ϒ",
                upsih: "ϒ",
                Upsilon: "Υ",
                upsilon: "υ",
                UpTeeArrow: "↥",
                UpTee: "⊥",
                upuparrows: "⇈",
                urcorn: "⌝",
                urcorner: "⌝",
                urcrop: "⌎",
                Uring: "Ů",
                uring: "ů",
                urtri: "◹",
                Uscr: "𝒰",
                uscr: "𝓊",
                utdot: "⋰",
                Utilde: "Ũ",
                utilde: "ũ",
                utri: "▵",
                utrif: "▴",
                uuarr: "⇈",
                Uuml: "Ü",
                uuml: "ü",
                uwangle: "⦧",
                vangrt: "⦜",
                varepsilon: "ϵ",
                varkappa: "ϰ",
                varnothing: "∅",
                varphi: "ϕ",
                varpi: "ϖ",
                varpropto: "∝",
                varr: "↕",
                vArr: "⇕",
                varrho: "ϱ",
                varsigma: "ς",
                varsubsetneq: "⊊︀",
                varsubsetneqq: "⫋︀",
                varsupsetneq: "⊋︀",
                varsupsetneqq: "⫌︀",
                vartheta: "ϑ",
                vartriangleleft: "⊲",
                vartriangleright: "⊳",
                vBar: "⫨",
                Vbar: "⫫",
                vBarv: "⫩",
                Vcy: "В",
                vcy: "в",
                vdash: "⊢",
                vDash: "⊨",
                Vdash: "⊩",
                VDash: "⊫",
                Vdashl: "⫦",
                veebar: "⊻",
                vee: "∨",
                Vee: "⋁",
                veeeq: "≚",
                vellip: "⋮",
                verbar: "|",
                Verbar: "‖",
                vert: "|",
                Vert: "‖",
                VerticalBar: "∣",
                VerticalLine: "|",
                VerticalSeparator: "❘",
                VerticalTilde: "≀",
                VeryThinSpace: " ",
                Vfr: "𝔙",
                vfr: "𝔳",
                vltri: "⊲",
                vnsub: "⊂⃒",
                vnsup: "⊃⃒",
                Vopf: "𝕍",
                vopf: "𝕧",
                vprop: "∝",
                vrtri: "⊳",
                Vscr: "𝒱",
                vscr: "𝓋",
                vsubnE: "⫋︀",
                vsubne: "⊊︀",
                vsupnE: "⫌︀",
                vsupne: "⊋︀",
                Vvdash: "⊪",
                vzigzag: "⦚",
                Wcirc: "Ŵ",
                wcirc: "ŵ",
                wedbar: "⩟",
                wedge: "∧",
                Wedge: "⋀",
                wedgeq: "≙",
                weierp: "℘",
                Wfr: "𝔚",
                wfr: "𝔴",
                Wopf: "𝕎",
                wopf: "𝕨",
                wp: "℘",
                wr: "≀",
                wreath: "≀",
                Wscr: "𝒲",
                wscr: "𝓌",
                xcap: "⋂",
                xcirc: "◯",
                xcup: "⋃",
                xdtri: "▽",
                Xfr: "𝔛",
                xfr: "𝔵",
                xharr: "⟷",
                xhArr: "⟺",
                Xi: "Ξ",
                xi: "ξ",
                xlarr: "⟵",
                xlArr: "⟸",
                xmap: "⟼",
                xnis: "⋻",
                xodot: "⨀",
                Xopf: "𝕏",
                xopf: "𝕩",
                xoplus: "⨁",
                xotime: "⨂",
                xrarr: "⟶",
                xrArr: "⟹",
                Xscr: "𝒳",
                xscr: "𝓍",
                xsqcup: "⨆",
                xuplus: "⨄",
                xutri: "△",
                xvee: "⋁",
                xwedge: "⋀",
                Yacute: "Ý",
                yacute: "ý",
                YAcy: "Я",
                yacy: "я",
                Ycirc: "Ŷ",
                ycirc: "ŷ",
                Ycy: "Ы",
                ycy: "ы",
                yen: "¥",
                Yfr: "𝔜",
                yfr: "𝔶",
                YIcy: "Ї",
                yicy: "ї",
                Yopf: "𝕐",
                yopf: "𝕪",
                Yscr: "𝒴",
                yscr: "𝓎",
                YUcy: "Ю",
                yucy: "ю",
                yuml: "ÿ",
                Yuml: "Ÿ",
                Zacute: "Ź",
                zacute: "ź",
                Zcaron: "Ž",
                zcaron: "ž",
                Zcy: "З",
                zcy: "з",
                Zdot: "Ż",
                zdot: "ż",
                zeetrf: "ℨ",
                ZeroWidthSpace: "​",
                Zeta: "Ζ",
                zeta: "ζ",
                zfr: "𝔷",
                Zfr: "ℨ",
                ZHcy: "Ж",
                zhcy: "ж",
                zigrarr: "⇝",
                zopf: "𝕫",
                Zopf: "ℤ",
                Zscr: "𝒵",
                zscr: "𝓏",
                zwj: "‍",
                zwnj: "‌"
            }
        }
        , {}],
        55: [function(e, t, n) {
            "use strict";
            function r(e) {
                var t = Array.prototype.slice.call(arguments, 1);
                return t.forEach(function(t) {
                    t && Object.keys(t).forEach(function(n) {
                        e[n] = t[n]
                    })
                }),
                e
            }
            function i(e) {
                return Object.prototype.toString.call(e)
            }
            function o(e) {
                return "[object String]" === i(e)
            }
            function a(e) {
                return "[object Object]" === i(e)
            }
            function s(e) {
                return "[object RegExp]" === i(e)
            }
            function u(e) {
                return "[object Function]" === i(e);
            }
            function c(e) {
                return e.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&")
            }
            function l(e) {
                return Object.keys(e || {}).reduce(function(e, t) {
                    return e || b.hasOwnProperty(t)
                }, !1)
            }
            function p(e) {
                e.__index__ = -1,
                e.__text_cache__ = ""
            }
            function f(e) {
                return function(t, n) {
                    var r = t.slice(n);
                    return e.test(r) ? r.match(e)[0].length : 0
                }
            }
            function h() {
                return function(e, t) {
                    t.normalize(e)
                }
            }
            function d(t) {
                function n(e) {
                    return e.replace("%TLDS%", l.src_tlds)
                }
                function i(e, t) {
                    throw new Error('(LinkifyIt) Invalid schema "' + e + '": ' + t)
                }
                var l = t.re = r({}, e("./lib/re"))
                  , d = t.__tlds__.slice();
                t.__tlds_replaced__ || d.push(_),
                d.push(l.src_xn),
                l.src_tlds = d.join("|"),
                l.email_fuzzy = RegExp(n(l.tpl_email_fuzzy), "i"),
                l.link_fuzzy = RegExp(n(l.tpl_link_fuzzy), "i"),
                l.link_no_ip_fuzzy = RegExp(n(l.tpl_link_no_ip_fuzzy), "i"),
                l.host_fuzzy_test = RegExp(n(l.tpl_host_fuzzy_test), "i");
                var m = [];
                t.__compiled__ = {},
                Object.keys(t.__schemas__).forEach(function(e) {
                    var n = t.__schemas__[e];
                    if (null  !== n) {
                        var r = {
                            validate: null ,
                            link: null
                        };
                        return t.__compiled__[e] = r,
                        a(n) ? (s(n.validate) ? r.validate = f(n.validate) : u(n.validate) ? r.validate = n.validate : i(e, n),
                        void (u(n.normalize) ? r.normalize = n.normalize : n.normalize ? i(e, n) : r.normalize = h())) : o(n) ? void m.push(e) : void i(e, n)
                    }
                }),
                m.forEach(function(e) {
                    t.__compiled__[t.__schemas__[e]] && (t.__compiled__[e].validate = t.__compiled__[t.__schemas__[e]].validate,
                    t.__compiled__[e].normalize = t.__compiled__[t.__schemas__[e]].normalize)
                }),
                t.__compiled__[""] = {
                    validate: null ,
                    normalize: h()
                };
                var g = Object.keys(t.__compiled__).filter(function(e) {
                    return e.length > 0 && t.__compiled__[e]
                }).map(c).join("|");
                t.re.schema_test = RegExp("(^|(?!_)(?:>|" + l.src_ZPCc + "))(" + g + ")", "i"),
                t.re.schema_search = RegExp("(^|(?!_)(?:>|" + l.src_ZPCc + "))(" + g + ")", "ig"),
                t.re.pretest = RegExp("(" + t.re.schema_test.source + ")|(" + t.re.host_fuzzy_test.source + ")|@", "i"),
                p(t)
            }
            function m(e, t) {
                var n = e.__index__
                  , r = e.__last_index__
                  , i = e.__text_cache__.slice(n, r);
                this.schema = e.__schema__.toLowerCase(),
                this.index = n + t,
                this.lastIndex = r + t,
                this.raw = i,
                this.text = i,
                this.url = i
            }
            function g(e, t) {
                var n = new m(e,t);
                return e.__compiled__[n.schema].normalize(n, e),
                n
            }
            function v(e, t) {
                return this instanceof v ? (t || l(e) && (t = e,
                e = {}),
                this.__opts__ = r({}, b, t),
                this.__index__ = -1,
                this.__last_index__ = -1,
                this.__schema__ = "",
                this.__text_cache__ = "",
                this.__schemas__ = r({}, y, e),
                this.__compiled__ = {},
                this.__tlds__ = k,
                this.__tlds_replaced__ = !1,
                this.re = {},
                void d(this)) : new v(e,t)
            }
            var b = {
                fuzzyLink: !0,
                fuzzyEmail: !0,
                fuzzyIP: !1
            }
              , y = {
                "http:": {
                    validate: function(e, t, n) {
                        var r = e.slice(t);
                        return n.re.http || (n.re.http = new RegExp("^\\/\\/" + n.re.src_auth + n.re.src_host_port_strict + n.re.src_path,"i")),
                        n.re.http.test(r) ? r.match(n.re.http)[0].length : 0
                    }
                },
                "https:": "http:",
                "ftp:": "http:",
                "//": {
                    validate: function(e, t, n) {
                        var r = e.slice(t);
                        return n.re.no_http || (n.re.no_http = new RegExp("^" + n.re.src_auth + n.re.src_host_port_strict + n.re.src_path,"i")),
                        n.re.no_http.test(r) ? t >= 3 && ":" === e[t - 3] ? 0 : r.match(n.re.no_http)[0].length : 0
                    }
                },
                "mailto:": {
                    validate: function(e, t, n) {
                        var r = e.slice(t);
                        return n.re.mailto || (n.re.mailto = new RegExp("^" + n.re.src_email_name + "@" + n.re.src_host_strict,"i")),
                        n.re.mailto.test(r) ? r.match(n.re.mailto)[0].length : 0
                    }
                }
            }
              , _ = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]"
              , k = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");
            v.prototype.add = function(e, t) {
                return this.__schemas__[e] = t,
                d(this),
                this
            }
            ,
            v.prototype.set = function(e) {
                return this.__opts__ = r(this.__opts__, e),
                this
            }
            ,
            v.prototype.test = function(e) {
                if (this.__text_cache__ = e,
                this.__index__ = -1,
                !e.length)
                    return !1;
                var t, n, r, i, o, a, s, u, c;
                if (this.re.schema_test.test(e))
                    for (s = this.re.schema_search,
                    s.lastIndex = 0; null  !== (t = s.exec(e)); )
                        if (i = this.testSchemaAt(e, t[2], s.lastIndex)) {
                            this.__schema__ = t[2],
                            this.__index__ = t.index + t[1].length,
                            this.__last_index__ = t.index + t[0].length + i;
                            break
                        }
                return this.__opts__.fuzzyLink && this.__compiled__["http:"] && (u = e.search(this.re.host_fuzzy_test),
                u >= 0 && (this.__index__ < 0 || u < this.__index__) && null  !== (n = e.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) && (o = n.index + n[1].length,
                (this.__index__ < 0 || o < this.__index__) && (this.__schema__ = "",
                this.__index__ = o,
                this.__last_index__ = n.index + n[0].length))),
                this.__opts__.fuzzyEmail && this.__compiled__["mailto:"] && (c = e.indexOf("@"),
                c >= 0 && null  !== (r = e.match(this.re.email_fuzzy)) && (o = r.index + r[1].length,
                a = r.index + r[0].length,
                (this.__index__ < 0 || o < this.__index__ || o === this.__index__ && a > this.__last_index__) && (this.__schema__ = "mailto:",
                this.__index__ = o,
                this.__last_index__ = a))),
                this.__index__ >= 0
            }
            ,
            v.prototype.pretest = function(e) {
                return this.re.pretest.test(e)
            }
            ,
            v.prototype.testSchemaAt = function(e, t, n) {
                return this.__compiled__[t.toLowerCase()] ? this.__compiled__[t.toLowerCase()].validate(e, n, this) : 0
            }
            ,
            v.prototype.match = function(e) {
                var t = 0
                  , n = [];
                this.__index__ >= 0 && this.__text_cache__ === e && (n.push(g(this, t)),
                t = this.__last_index__);
                for (var r = t ? e.slice(t) : e; this.test(r); )
                    n.push(g(this, t)),
                    r = r.slice(this.__last_index__),
                    t += this.__last_index__;
                return n.length ? n : null
            }
            ,
            v.prototype.tlds = function(e, t) {
                return e = Array.isArray(e) ? e : [e],
                t ? (this.__tlds__ = this.__tlds__.concat(e).sort().filter(function(e, t, n) {
                    return e !== n[t - 1]
                }).reverse(),
                d(this),
                this) : (this.__tlds__ = e.slice(),
                this.__tlds_replaced__ = !0,
                d(this),
                this)
            }
            ,
            v.prototype.normalize = function(e) {
                e.schema || (e.url = "http://" + e.url),
                "mailto:" !== e.schema || /^mailto:/i.test(e.url) || (e.url = "mailto:" + e.url)
            }
            ,
            t.exports = v
        }
        , {
            "./lib/re": 56
        }],
        56: [function(e, t, n) {
            "use strict";
            var r = n.src_Any = e("uc.micro/properties/Any/regex").source
              , i = n.src_Cc = e("uc.micro/categories/Cc/regex").source
              , o = n.src_Z = e("uc.micro/categories/Z/regex").source
              , a = n.src_P = e("uc.micro/categories/P/regex").source
              , s = n.src_ZPCc = [o, a, i].join("|")
              , u = n.src_ZCc = [o, i].join("|")
              , c = "(?:(?!" + s + ")" + r + ")"
              , l = "(?:(?![0-9]|" + s + ")" + r + ")"
              , p = n.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
            n.src_auth = "(?:(?:(?!" + u + ").)+@)?";
            var f = n.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?"
              , h = n.src_host_terminator = "(?=$|" + s + ")(?!-|_|:\\d|\\.-|\\.(?!$|" + s + "))"
              , d = n.src_path = "(?:[/?#](?:(?!" + u + "|[()[\\]{}.,\"'?!\\-]).|\\[(?:(?!" + u + "|\\]).)*\\]|\\((?:(?!" + u + "|[)]).)*\\)|\\{(?:(?!" + u + '|[}]).)*\\}|\\"(?:(?!' + u + '|["]).)+\\"|\\\'(?:(?!' + u + "|[']).)+\\'|\\'(?=" + c + ").|\\.{2,3}[a-zA-Z0-9%/]|\\.(?!" + u + "|[.]).|\\-(?!--(?:[^-]|$))(?:-*)|\\,(?!" + u + ").|\\!(?!" + u + "|[!]).|\\?(?!" + u + "|[?]).)+|\\/)?"
              , m = n.src_email_name = '[\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]+'
              , g = n.src_xn = "xn--[a-z0-9\\-]{1,59}"
              , v = n.src_domain_root = "(?:" + g + "|" + l + "{1,63})"
              , b = n.src_domain = "(?:" + g + "|(?:" + c + ")|(?:" + c + "(?:-(?!-)|" + c + "){0,61}" + c + "))"
              , y = n.src_host = "(?:" + p + "|(?:(?:(?:" + b + ")\\.)*" + v + "))"
              , _ = n.tpl_host_fuzzy = "(?:" + p + "|(?:(?:(?:" + b + ")\\.)+(?:%TLDS%)))"
              , k = n.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + b + ")\\.)+(?:%TLDS%))";
            n.src_host_strict = y + h;
            var C = n.tpl_host_fuzzy_strict = _ + h;
            n.src_host_port_strict = y + f + h;
            var w = n.tpl_host_port_fuzzy_strict = _ + f + h
              , E = n.tpl_host_port_no_ip_fuzzy_strict = k + f + h;
            n.tpl_host_fuzzy_test = "localhost|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + s + "|$))",
            n.tpl_email_fuzzy = "(^|>|" + u + ")(" + m + "@" + C + ")",
            n.tpl_link_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|]|" + s + "))((?![$+<=>^`|])" + w + d + ")",
            n.tpl_link_no_ip_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|]|" + s + "))((?![$+<=>^`|])" + E + d + ")"
        }
        , {
            "uc.micro/categories/Cc/regex": 62,
            "uc.micro/categories/P/regex": 64,
            "uc.micro/categories/Z/regex": 65,
            "uc.micro/properties/Any/regex": 67
        }],
        57: [function(e, t, n) {
            "use strict";
            function r(e) {
                var t, n, r = o[e];
                if (r)
                    return r;
                for (r = o[e] = [],
                t = 0; 128 > t; t++)
                    n = String.fromCharCode(t),
                    r.push(n);
                for (t = 0; t < e.length; t++)
                    n = e.charCodeAt(t),
                    r[n] = "%" + ("0" + n.toString(16).toUpperCase()).slice(-2);
                return r
            }
            function i(e, t) {
                var n;
                return "string" != typeof t && (t = i.defaultChars),
                n = r(t),
                e.replace(/(%[a-f0-9]{2})+/gi, function(e) {
                    var t, r, i, o, a, s, u, c = "";
                    for (t = 0,
                    r = e.length; r > t; t += 3)
                        i = parseInt(e.slice(t + 1, t + 3), 16),
                        128 > i ? c += n[i] : 192 === (224 & i) && r > t + 3 && (o = parseInt(e.slice(t + 4, t + 6), 16),
                        128 === (192 & o)) ? (u = i << 6 & 1984 | 63 & o,
                        c += 128 > u ? "��" : String.fromCharCode(u),
                        t += 3) : 224 === (240 & i) && r > t + 6 && (o = parseInt(e.slice(t + 4, t + 6), 16),
                        a = parseInt(e.slice(t + 7, t + 9), 16),
                        128 === (192 & o) && 128 === (192 & a)) ? (u = i << 12 & 61440 | o << 6 & 4032 | 63 & a,
                        c += 2048 > u || u >= 55296 && 57343 >= u ? "���" : String.fromCharCode(u),
                        t += 6) : 240 === (248 & i) && r > t + 9 && (o = parseInt(e.slice(t + 4, t + 6), 16),
                        a = parseInt(e.slice(t + 7, t + 9), 16),
                        s = parseInt(e.slice(t + 10, t + 12), 16),
                        128 === (192 & o) && 128 === (192 & a) && 128 === (192 & s)) ? (u = i << 18 & 1835008 | o << 12 & 258048 | a << 6 & 4032 | 63 & s,
                        65536 > u || u > 1114111 ? c += "����" : (u -= 65536,
                        c += String.fromCharCode(55296 + (u >> 10), 56320 + (1023 & u))),
                        t += 9) : c += "�";
                    return c
                })
            }
            var o = {};
            i.defaultChars = ";/?:@&=+$,#",
            i.componentChars = "",
            t.exports = i
        }
        , {}],
        58: [function(e, t, n) {
            "use strict";
            function r(e) {
                var t, n, r = o[e];
                if (r)
                    return r;
                for (r = o[e] = [],
                t = 0; 128 > t; t++)
                    n = String.fromCharCode(t),
                    /^[0-9a-z]$/i.test(n) ? r.push(n) : r.push("%" + ("0" + t.toString(16).toUpperCase()).slice(-2));
                for (t = 0; t < e.length; t++)
                    r[e.charCodeAt(t)] = e[t];
                return r
            }
            function i(e, t, n) {
                var o, a, s, u, c, l = "";
                for ("string" != typeof t && (n = t,
                t = i.defaultChars),
                "undefined" == typeof n && (n = !0),
                c = r(t),
                o = 0,
                a = e.length; a > o; o++)
                    if (s = e.charCodeAt(o),
                    n && 37 === s && a > o + 2 && /^[0-9a-f]{2}$/i.test(e.slice(o + 1, o + 3)))
                        l += e.slice(o, o + 3),
                        o += 2;
                    else if (128 > s)
                        l += c[s];
                    else if (s >= 55296 && 57343 >= s) {
                        if (s >= 55296 && 56319 >= s && a > o + 1 && (u = e.charCodeAt(o + 1),
                        u >= 56320 && 57343 >= u)) {
                            l += encodeURIComponent(e[o] + e[o + 1]),
                            o++;
                            continue
                        }
                        l += "%EF%BF%BD"
                    } else
                        l += encodeURIComponent(e[o]);
                return l
            }
            var o = {};
            i.defaultChars = ";/?:@&=+$,-_.!~*'()#",
            i.componentChars = "-_.!~*'()",
            t.exports = i
        }
        , {}],
        59: [function(e, t, n) {
            "use strict";
            t.exports = function(e) {
                var t = "";
                return t += e.protocol || "",
                t += e.slashes ? "//" : "",
                t += e.auth ? e.auth + "@" : "",
                t += e.hostname && -1 !== e.hostname.indexOf(":") ? "[" + e.hostname + "]" : e.hostname || "",
                t += e.port ? ":" + e.port : "",
                t += e.pathname || "",
                t += e.search || "",
                t += e.hash || ""
            }
        }
        , {}],
        60: [function(e, t, n) {
            "use strict";
            t.exports.encode = e("./encode"),
            t.exports.decode = e("./decode"),
            t.exports.format = e("./format"),
            t.exports.parse = e("./parse")
        }
        , {
            "./decode": 57,
            "./encode": 58,
            "./format": 59,
            "./parse": 61
        }],
        61: [function(e, t, n) {
            "use strict";
            function r() {
                this.protocol = null ,
                this.slashes = null ,
                this.auth = null ,
                this.port = null ,
                this.hostname = null ,
                this.hash = null ,
                this.search = null ,
                this.pathname = null
            }
            function i(e, t) {
                if (e && e instanceof r)
                    return e;
                var n = new r;
                return n.parse(e, t),
                n
            }
            var o = /^([a-z0-9.+-]+:)/i
              , a = /:[0-9]*$/
              , s = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/
              , u = ["<", ">", '"', "`", " ", "\r", "\n", "	"]
              , c = ["{", "}", "|", "\\", "^", "`"].concat(u)
              , l = ["'"].concat(c)
              , p = ["%", "/", "?", ";", "#"].concat(l)
              , f = ["/", "?", "#"]
              , h = 255
              , d = /^[+a-z0-9A-Z_-]{0,63}$/
              , m = /^([+a-z0-9A-Z_-]{0,63})(.*)$/
              , g = {
                javascript: !0,
                "javascript:": !0
            }
              , v = {
                http: !0,
                https: !0,
                ftp: !0,
                gopher: !0,
                file: !0,
                "http:": !0,
                "https:": !0,
                "ftp:": !0,
                "gopher:": !0,
                "file:": !0
            };
            r.prototype.parse = function(e, t) {
                var n, r, i, a, u, c = e;
                if (c = c.trim(),
                !t && 1 === e.split("#").length) {
                    var l = s.exec(c);
                    if (l)
                        return this.pathname = l[1],
                        l[2] && (this.search = l[2]),
                        this
                }
                var b = o.exec(c);
                if (b && (b = b[0],
                i = b.toLowerCase(),
                this.protocol = b,
                c = c.substr(b.length)),
                (t || b || c.match(/^\/\/[^@\/]+@[^@\/]+/)) && (u = "//" === c.substr(0, 2),
                !u || b && g[b] || (c = c.substr(2),
                this.slashes = !0)),
                !g[b] && (u || b && !v[b])) {
                    var y = -1;
                    for (n = 0; n < f.length; n++)
                        a = c.indexOf(f[n]),
                        -1 !== a && (-1 === y || y > a) && (y = a);
                    var _, k;
                    for (k = -1 === y ? c.lastIndexOf("@") : c.lastIndexOf("@", y),
                    -1 !== k && (_ = c.slice(0, k),
                    c = c.slice(k + 1),
                    this.auth = _),
                    y = -1,
                    n = 0; n < p.length; n++)
                        a = c.indexOf(p[n]),
                        -1 !== a && (-1 === y || y > a) && (y = a);
                    -1 === y && (y = c.length),
                    ":" === c[y - 1] && y--;
                    var C = c.slice(0, y);
                    c = c.slice(y),
                    this.parseHost(C),
                    this.hostname = this.hostname || "";
                    var w = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
                    if (!w) {
                        var E = this.hostname.split(/\./);
                        for (n = 0,
                        r = E.length; r > n; n++) {
                            var T = E[n];
                            if (T && !T.match(d)) {
                                for (var x = "", A = 0, M = T.length; M > A; A++)
                                    x += T.charCodeAt(A) > 127 ? "x" : T[A];
                                if (!x.match(d)) {
                                    var D = E.slice(0, n)
                                      , L = E.slice(n + 1)
                                      , S = T.match(m);
                                    S && (D.push(S[1]),
                                    L.unshift(S[2])),
                                    L.length && (c = L.join(".") + c),
                                    this.hostname = D.join(".");
                                    break
                                }
                            }
                        }
                    }
                    this.hostname.length > h && (this.hostname = ""),
                    w && (this.hostname = this.hostname.substr(1, this.hostname.length - 2))
                }
                var F = c.indexOf("#");
                -1 !== F && (this.hash = c.substr(F),
                c = c.slice(0, F));
                var q = c.indexOf("?");
                return -1 !== q && (this.search = c.substr(q),
                c = c.slice(0, q)),
                c && (this.pathname = c),
                v[i] && this.hostname && !this.pathname && (this.pathname = ""),
                this
            }
            ,
            r.prototype.parseHost = function(e) {
                var t = a.exec(e);
                t && (t = t[0],
                ":" !== t && (this.port = t.substr(1)),
                e = e.substr(0, e.length - t.length)),
                e && (this.hostname = e)
            }
            ,
            t.exports = i
        }
        , {}],
        62: [function(e, t, n) {
            t.exports = /[\0-\x1F\x7F-\x9F]/
        }
        , {}],
        63: [function(e, t, n) {
            t.exports = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804\uDCBD|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/
        }
        , {}],
        64: [function(e, t, n) {
            t.exports = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDE38-\uDE3D]|\uD805[\uDCC6\uDDC1-\uDDC9\uDE41-\uDE43]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F/
        }
        , {}],
        65: [function(e, t, n) {
            t.exports = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/
        }
        , {}],
        66: [function(e, t, n) {
            t.exports.Any = e("./properties/Any/regex"),
            t.exports.Cc = e("./categories/Cc/regex"),
            t.exports.Cf = e("./categories/Cf/regex"),
            t.exports.P = e("./categories/P/regex"),
            t.exports.Z = e("./categories/Z/regex")
        }
        , {
            "./categories/Cc/regex": 62,
            "./categories/Cf/regex": 63,
            "./categories/P/regex": 64,
            "./categories/Z/regex": 65,
            "./properties/Any/regex": 67
        }],
        67: [function(e, t, n) {
            t.exports = /[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF]/
        }
        , {}],
        68: [function(e, t, n) {
            "use strict";
            t.exports = e("./lib/")
        }
        , {
            "./lib/": 10
        }]
    }, {}, [68])(68);
});
var htmlTagRegex = /<html(.|\s)*>(.|\s)*<\/html>/im;
define("KnockoutMarkdownBinding", ["sanitizeCaja", "MarkdownIt"], function(e, t) {
    function n(n) {
        var r = t.render(n);
        return a.allowUnsafeHtml ? r : e(r, i, o)
    }
    function r(e) {
        if (e instanceof HTMLAnchorElement && (e.target = "_blank"),
        e.childNodes && e.childNodes.length > 0)
            for (var t = 0; t < e.childNodes.length; ++t)
                r(e.childNodes[t])
    }
    function i(e) {
        return /^https?/.test(e.getScheme()) ? e.toString() : /^mailto?/.test(e.getScheme()) ? e.toString() : e.getScheme() || e.getDomain() ? "data" === e.getScheme() && /^image/.test(e.getPath()) ? e.toString() : void 0 : e.toString()
    }
    function o(e) {
        return e
    }
    var a = {
        allowUnsafeHtml: !1,
        register: function(e) {
            e.bindingHandlers.markdown = {
                init: function() {
                    return {
                        controlsDescendantBindings: !0
                    }
                },
                update: function(t, i) {
                    for (; t.firstChild; )
                        e.removeNode(t.firstChild);
                    var o, a = e.unwrap(i());
                    o = htmlTagRegex.test(a) ? a : n(a);
                    var s = e.utils.parseHtmlFragment(o, t);
                    t.className = t.className + " markdown";
                    for (var u = 0; u < s.length; ++u) {
                        var c = s[u];
                        r(c),
                        t.appendChild(c)
                    }
                }
            }
        }
    };
    return a
}),
!function(e, t, n, r) {
    "use strict";
    function i(e, t, n) {
        return setTimeout(l(e, n), t)
    }
    function o(e, t, n) {
        return Array.isArray(e) ? (a(e, n[t], n),
        !0) : !1
    }
    function a(e, t, n) {
        var i;
        if (e)
            if (e.forEach)
                e.forEach(t, n);
            else if (e.length !== r)
                for (i = 0; i < e.length; )
                    t.call(n, e[i], i, e),
                    i++;
            else
                for (i in e)
                    e.hasOwnProperty(i) && t.call(n, e[i], i, e)
    }
    function s(e, t, n) {
        for (var i = Object.keys(t), o = 0; o < i.length; )
            (!n || n && e[i[o]] === r) && (e[i[o]] = t[i[o]]),
            o++;
        return e
    }
    function u(e, t) {
        return s(e, t, !0)
    }
    function c(e, t, n) {
        var r, i = t.prototype;
        r = e.prototype = Object.create(i),
        r.constructor = e,
        r._super = i,
        n && s(r, n)
    }
    function l(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }
    function p(e, t) {
        return typeof e == le ? e.apply(t ? t[0] || r : r, t) : e
    }
    function f(e, t) {
        return e === r ? t : e
    }
    function h(e, t, n) {
        a(v(t), function(t) {
            e.addEventListener(t, n, !1)
        })
    }
    function d(e, t, n) {
        a(v(t), function(t) {
            e.removeEventListener(t, n, !1)
        })
    }
    function m(e, t) {
        for (; e; ) {
            if (e == t)
                return !0;
            e = e.parentNode
        }
        return !1
    }
    function g(e, t) {
        return e.indexOf(t) > -1
    }
    function v(e) {
        return e.trim().split(/\s+/g)
    }
    function b(e, t, n) {
        if (e.indexOf && !n)
            return e.indexOf(t);
        for (var r = 0; r < e.length; ) {
            if (n && e[r][n] == t || !n && e[r] === t)
                return r;
            r++
        }
        return -1
    }
    function y(e) {
        return Array.prototype.slice.call(e, 0)
    }
    function _(e, t, n) {
        for (var r = [], i = [], o = 0; o < e.length; ) {
            var a = t ? e[o][t] : e[o];
            b(i, a) < 0 && r.push(e[o]),
            i[o] = a,
            o++
        }
        return n && (r = t ? r.sort(function(e, n) {
            return e[t] > n[t]
        }) : r.sort()),
        r
    }
    function k(e, t) {
        for (var n, i, o = t[0].toUpperCase() + t.slice(1), a = 0; a < ue.length; ) {
            if (n = ue[a],
            i = n ? n + o : t,
            i in e)
                return i;
            a++
        }
        return r
    }
    function C() {
        return de++
    }
    function w(e) {
        var t = e.ownerDocument;
        return t.defaultView || t.parentWindow
    }
    function E(e, t) {
        var n = this;
        this.manager = e,
        this.callback = t,
        this.element = e.element,
        this.target = e.options.inputTarget,
        this.domHandler = function(t) {
            p(e.options.enable, [e]) && n.handler(t)
        }
        ,
        this.init()
    }
    function T(e) {
        var t, n = e.options.inputClass;
        return new (t = n ? n : ve ? P : be ? j : ge ? V : O)(e,x)
    }
    function x(e, t, n) {
        var r = n.pointers.length
          , i = n.changedPointers.length
          , o = t & Ee && r - i === 0
          , a = t & (xe | Ae) && r - i === 0;
        n.isFirst = !!o,
        n.isFinal = !!a,
        o && (e.session = {}),
        n.eventType = t,
        A(e, n),
        e.emit("hammer.input", n),
        e.recognize(n),
        e.session.prevInput = n
    }
    function A(e, t) {
        var n = e.session
          , r = t.pointers
          , i = r.length;
        n.firstInput || (n.firstInput = L(t)),
        i > 1 && !n.firstMultiple ? n.firstMultiple = L(t) : 1 === i && (n.firstMultiple = !1);
        var o = n.firstInput
          , a = n.firstMultiple
          , s = a ? a.center : o.center
          , u = t.center = S(r);
        t.timeStamp = he(),
        t.deltaTime = t.timeStamp - o.timeStamp,
        t.angle = N(s, u),
        t.distance = R(s, u),
        M(n, t),
        t.offsetDirection = q(t.deltaX, t.deltaY),
        t.scale = a ? z(a.pointers, r) : 1,
        t.rotation = a ? I(a.pointers, r) : 0,
        D(n, t);
        var c = e.element;
        m(t.srcEvent.target, c) && (c = t.srcEvent.target),
        t.target = c
    }
    function M(e, t) {
        var n = t.center
          , r = e.offsetDelta || {}
          , i = e.prevDelta || {}
          , o = e.prevInput || {};
        (t.eventType === Ee || o.eventType === xe) && (i = e.prevDelta = {
            x: o.deltaX || 0,
            y: o.deltaY || 0
        },
        r = e.offsetDelta = {
            x: n.x,
            y: n.y
        }),
        t.deltaX = i.x + (n.x - r.x),
        t.deltaY = i.y + (n.y - r.y)
    }
    function D(e, t) {
        var n, i, o, a, s = e.lastInterval || t, u = t.timeStamp - s.timeStamp;
        if (t.eventType != Ae && (u > we || s.velocity === r)) {
            var c = s.deltaX - t.deltaX
              , l = s.deltaY - t.deltaY
              , p = F(u, c, l);
            i = p.x,
            o = p.y,
            n = fe(p.x) > fe(p.y) ? p.x : p.y,
            a = q(c, l),
            e.lastInterval = t
        } else
            n = s.velocity,
            i = s.velocityX,
            o = s.velocityY,
            a = s.direction;
        t.velocity = n,
        t.velocityX = i,
        t.velocityY = o,
        t.direction = a
    }
    function L(e) {
        for (var t = [], n = 0; n < e.pointers.length; )
            t[n] = {
                clientX: pe(e.pointers[n].clientX),
                clientY: pe(e.pointers[n].clientY)
            },
            n++;
        return {
            timeStamp: he(),
            pointers: t,
            center: S(t),
            deltaX: e.deltaX,
            deltaY: e.deltaY
        }
    }
    function S(e) {
        var t = e.length;
        if (1 === t)
            return {
                x: pe(e[0].clientX),
                y: pe(e[0].clientY)
            };
        for (var n = 0, r = 0, i = 0; t > i; )
            n += e[i].clientX,
            r += e[i].clientY,
            i++;
        return {
            x: pe(n / t),
            y: pe(r / t)
        }
    }
    function F(e, t, n) {
        return {
            x: t / e || 0,
            y: n / e || 0
        }
    }
    function q(e, t) {
        return e === t ? Me : fe(e) >= fe(t) ? e > 0 ? De : Le : t > 0 ? Se : Fe
    }
    function R(e, t, n) {
        n || (n = Ie);
        var r = t[n[0]] - e[n[0]]
          , i = t[n[1]] - e[n[1]];
        return Math.sqrt(r * r + i * i)
    }
    function N(e, t, n) {
        n || (n = Ie);
        var r = t[n[0]] - e[n[0]]
          , i = t[n[1]] - e[n[1]];
        return 180 * Math.atan2(i, r) / Math.PI
    }
    function I(e, t) {
        return N(t[1], t[0], ze) - N(e[1], e[0], ze)
    }
    function z(e, t) {
        return R(t[0], t[1], ze) / R(e[0], e[1], ze)
    }
    function O() {
        this.evEl = Pe,
        this.evWin = He,
        this.allow = !0,
        this.pressed = !1,
        E.apply(this, arguments)
    }
    function P() {
        this.evEl = Ue,
        this.evWin = Ve,
        E.apply(this, arguments),
        this.store = this.manager.session.pointerEvents = []
    }
    function H() {
        this.evTarget = Ge,
        this.evWin = We,
        this.started = !1,
        E.apply(this, arguments)
    }
    function B(e, t) {
        var n = y(e.touches)
          , r = y(e.changedTouches);
        return t & (xe | Ae) && (n = _(n.concat(r), "identifier", !0)),
        [n, r]
    }
    function j() {
        this.evTarget = Ze,
        this.targetIds = {},
        E.apply(this, arguments)
    }
    function U(e, t) {
        var n = y(e.touches)
          , r = this.targetIds;
        if (t & (Ee | Te) && 1 === n.length)
            return r[n[0].identifier] = !0,
            [n, n];
        var i, o, a = y(e.changedTouches), s = [], u = this.target;
        if (o = n.filter(function(e) {
            return m(e.target, u)
        }),
        t === Ee)
            for (i = 0; i < o.length; )
                r[o[i].identifier] = !0,
                i++;
        for (i = 0; i < a.length; )
            r[a[i].identifier] && s.push(a[i]),
            t & (xe | Ae) && delete r[a[i].identifier],
            i++;
        return s.length ? [_(o.concat(s), "identifier", !0), s] : void 0
    }
    function V() {
        E.apply(this, arguments);
        var e = l(this.handler, this);
        this.touch = new j(this.manager,e),
        this.mouse = new O(this.manager,e)
    }
    function $(e, t) {
        this.manager = e,
        this.set(t)
    }
    function G(e) {
        if (g(e, tt))
            return tt;
        var t = g(e, nt)
          , n = g(e, rt);
        return t && n ? nt + " " + rt : t || n ? t ? nt : rt : g(e, et) ? et : Qe
    }
    function W(e) {
        this.id = C(),
        this.manager = null ,
        this.options = u(e || {}, this.defaults),
        this.options.enable = f(this.options.enable, !0),
        this.state = it,
        this.simultaneous = {},
        this.requireFail = []
    }
    function Y(e) {
        return e & ct ? "cancel" : e & st ? "end" : e & at ? "move" : e & ot ? "start" : ""
    }
    function Z(e) {
        return e == Fe ? "down" : e == Se ? "up" : e == De ? "left" : e == Le ? "right" : ""
    }
    function K(e, t) {
        var n = t.manager;
        return n ? n.get(e) : e
    }
    function X() {
        W.apply(this, arguments)
    }
    function J() {
        X.apply(this, arguments),
        this.pX = null ,
        this.pY = null
    }
    function Q() {
        X.apply(this, arguments)
    }
    function ee() {
        W.apply(this, arguments),
        this._timer = null ,
        this._input = null
    }
    function te() {
        X.apply(this, arguments)
    }
    function ne() {
        X.apply(this, arguments)
    }
    function re() {
        W.apply(this, arguments),
        this.pTime = !1,
        this.pCenter = !1,
        this._timer = null ,
        this._input = null ,
        this.count = 0
    }
    function ie(e, t) {
        return t = t || {},
        t.recognizers = f(t.recognizers, ie.defaults.preset),
        new oe(e,t)
    }
    function oe(e, t) {
        t = t || {},
        this.options = u(t, ie.defaults),
        this.options.inputTarget = this.options.inputTarget || e,
        this.handlers = {},
        this.session = {},
        this.recognizers = [],
        this.element = e,
        this.input = T(this),
        this.touchAction = new $(this,this.options.touchAction),
        ae(this, !0),
        a(t.recognizers, function(e) {
            var t = this.add(new e[0](e[1]));
            e[2] && t.recognizeWith(e[2]),
            e[3] && t.requireFailure(e[3])
        }, this)
    }
    function ae(e, t) {
        var n = e.element;
        a(e.options.cssProps, function(e, r) {
            n.style[k(n.style, r)] = t ? e : ""
        })
    }
    function se(e, n) {
        var r = t.createEvent("Event");
        r.initEvent(e, !0, !0),
        r.gesture = n,
        n.target.dispatchEvent(r)
    }
    var ue = ["", "webkit", "moz", "MS", "ms", "o"]
      , ce = t.createElement("div")
      , le = "function"
      , pe = Math.round
      , fe = Math.abs
      , he = Date.now
      , de = 1
      , me = /mobile|tablet|ip(ad|hone|od)|android/i
      , ge = "ontouchstart" in e
      , ve = k(e, "PointerEvent") !== r
      , be = ge && me.test(navigator.userAgent)
      , ye = "touch"
      , _e = "pen"
      , ke = "mouse"
      , Ce = "kinect"
      , we = 25
      , Ee = 1
      , Te = 2
      , xe = 4
      , Ae = 8
      , Me = 1
      , De = 2
      , Le = 4
      , Se = 8
      , Fe = 16
      , qe = De | Le
      , Re = Se | Fe
      , Ne = qe | Re
      , Ie = ["x", "y"]
      , ze = ["clientX", "clientY"];
    E.prototype = {
        handler: function() {},
        init: function() {
            this.evEl && h(this.element, this.evEl, this.domHandler),
            this.evTarget && h(this.target, this.evTarget, this.domHandler),
            this.evWin && h(w(this.element), this.evWin, this.domHandler)
        },
        destroy: function() {
            this.evEl && d(this.element, this.evEl, this.domHandler),
            this.evTarget && d(this.target, this.evTarget, this.domHandler),
            this.evWin && d(w(this.element), this.evWin, this.domHandler)
        }
    };
    var Oe = {
        mousedown: Ee,
        mousemove: Te,
        mouseup: xe
    }
      , Pe = "mousedown"
      , He = "mousemove mouseup";
    c(O, E, {
        handler: function(e) {
            var t = Oe[e.type];
            t & Ee && 0 === e.button && (this.pressed = !0),
            t & Te && 1 !== e.which && (t = xe),
            this.pressed && this.allow && (t & xe && (this.pressed = !1),
            this.callback(this.manager, t, {
                pointers: [e],
                changedPointers: [e],
                pointerType: ke,
                srcEvent: e
            }))
        }
    });
    var Be = {
        pointerdown: Ee,
        pointermove: Te,
        pointerup: xe,
        pointercancel: Ae,
        pointerout: Ae
    }
      , je = {
        2: ye,
        3: _e,
        4: ke,
        5: Ce
    }
      , Ue = "pointerdown"
      , Ve = "pointermove pointerup pointercancel";
    e.MSPointerEvent && (Ue = "MSPointerDown",
    Ve = "MSPointerMove MSPointerUp MSPointerCancel"),
    c(P, E, {
        handler: function(e) {
            var t = this.store
              , n = !1
              , r = e.type.toLowerCase().replace("ms", "")
              , i = Be[r]
              , o = je[e.pointerType] || e.pointerType
              , a = o == ye
              , s = b(t, e.pointerId, "pointerId");
            i & Ee && (0 === e.button || a) ? 0 > s && (t.push(e),
            s = t.length - 1) : i & (xe | Ae) && (n = !0),
            0 > s || (t[s] = e,
            this.callback(this.manager, i, {
                pointers: t,
                changedPointers: [e],
                pointerType: o,
                srcEvent: e
            }),
            n && t.splice(s, 1))
        }
    });
    var $e = {
        touchstart: Ee,
        touchmove: Te,
        touchend: xe,
        touchcancel: Ae
    }
      , Ge = "touchstart"
      , We = "touchstart touchmove touchend touchcancel";
    c(H, E, {
        handler: function(e) {
            var t = $e[e.type];
            if (t === Ee && (this.started = !0),
            this.started) {
                var n = B.call(this, e, t);
                t & (xe | Ae) && n[0].length - n[1].length === 0 && (this.started = !1),
                this.callback(this.manager, t, {
                    pointers: n[0],
                    changedPointers: n[1],
                    pointerType: ye,
                    srcEvent: e
                })
            }
        }
    });
    var Ye = {
        touchstart: Ee,
        touchmove: Te,
        touchend: xe,
        touchcancel: Ae
    }
      , Ze = "touchstart touchmove touchend touchcancel";
    c(j, E, {
        handler: function(e) {
            var t = Ye[e.type]
              , n = U.call(this, e, t);
            n && this.callback(this.manager, t, {
                pointers: n[0],
                changedPointers: n[1],
                pointerType: ye,
                srcEvent: e
            })
        }
    }),
    c(V, E, {
        handler: function(e, t, n) {
            var r = n.pointerType == ye
              , i = n.pointerType == ke;
            if (r)
                this.mouse.allow = !1;
            else if (i && !this.mouse.allow)
                return;
            t & (xe | Ae) && (this.mouse.allow = !0),
            this.callback(e, t, n)
        },
        destroy: function() {
            this.touch.destroy(),
            this.mouse.destroy()
        }
    });
    var Ke = k(ce.style, "touchAction")
      , Xe = Ke !== r
      , Je = "compute"
      , Qe = "auto"
      , et = "manipulation"
      , tt = "none"
      , nt = "pan-x"
      , rt = "pan-y";
    $.prototype = {
        set: function(e) {
            e == Je && (e = this.compute()),
            Xe && (this.manager.element.style[Ke] = e),
            this.actions = e.toLowerCase().trim()
        },
        update: function() {
            this.set(this.manager.options.touchAction)
        },
        compute: function() {
            var e = [];
            return a(this.manager.recognizers, function(t) {
                p(t.options.enable, [t]) && (e = e.concat(t.getTouchAction()))
            }),
            G(e.join(" "))
        },
        preventDefaults: function(e) {
            if (!Xe) {
                var t = e.srcEvent
                  , n = e.offsetDirection;
                if (this.manager.session.prevented)
                    return void t.preventDefault();
                var r = this.actions
                  , i = g(r, tt)
                  , o = g(r, rt)
                  , a = g(r, nt);
                return i || o && n & qe || a && n & Re ? this.preventSrc(t) : void 0
            }
        },
        preventSrc: function(e) {
            this.manager.session.prevented = !0,
            e.preventDefault()
        }
    };
    var it = 1
      , ot = 2
      , at = 4
      , st = 8
      , ut = st
      , ct = 16
      , lt = 32;
    W.prototype = {
        defaults: {},
        set: function(e) {
            return s(this.options, e),
            this.manager && this.manager.touchAction.update(),
            this
        },
        recognizeWith: function(e) {
            if (o(e, "recognizeWith", this))
                return this;
            var t = this.simultaneous;
            return e = K(e, this),
            t[e.id] || (t[e.id] = e,
            e.recognizeWith(this)),
            this
        },
        dropRecognizeWith: function(e) {
            return o(e, "dropRecognizeWith", this) ? this : (e = K(e, this),
            delete this.simultaneous[e.id],
            this)
        },
        requireFailure: function(e) {
            if (o(e, "requireFailure", this))
                return this;
            var t = this.requireFail;
            return e = K(e, this),
            -1 === b(t, e) && (t.push(e),
            e.requireFailure(this)),
            this
        },
        dropRequireFailure: function(e) {
            if (o(e, "dropRequireFailure", this))
                return this;
            e = K(e, this);
            var t = b(this.requireFail, e);
            return t > -1 && this.requireFail.splice(t, 1),
            this
        },
        hasRequireFailures: function() {
            return this.requireFail.length > 0
        },
        canRecognizeWith: function(e) {
            return !!this.simultaneous[e.id]
        },
        emit: function(e) {
            function t(t) {
                n.manager.emit(n.options.event + (t ? Y(r) : ""), e)
            }
            var n = this
              , r = this.state;
            st > r && t(!0),
            t(),
            r >= st && t(!0)
        },
        tryEmit: function(e) {
            return this.canEmit() ? this.emit(e) : void (this.state = lt)
        },
        canEmit: function() {
            for (var e = 0; e < this.requireFail.length; ) {
                if (!(this.requireFail[e].state & (lt | it)))
                    return !1;
                e++
            }
            return !0
        },
        recognize: function(e) {
            var t = s({}, e);
            return p(this.options.enable, [this, t]) ? (this.state & (ut | ct | lt) && (this.state = it),
            this.state = this.process(t),
            void (this.state & (ot | at | st | ct) && this.tryEmit(t))) : (this.reset(),
            void (this.state = lt))
        },
        process: function() {},
        getTouchAction: function() {},
        reset: function() {}
    },
    c(X, W, {
        defaults: {
            pointers: 1
        },
        attrTest: function(e) {
            var t = this.options.pointers;
            return 0 === t || e.pointers.length === t
        },
        process: function(e) {
            var t = this.state
              , n = e.eventType
              , r = t & (ot | at)
              , i = this.attrTest(e);
            return r && (n & Ae || !i) ? t | ct : r || i ? n & xe ? t | st : t & ot ? t | at : ot : lt
        }
    }),
    c(J, X, {
        defaults: {
            event: "pan",
            threshold: 10,
            pointers: 1,
            direction: Ne
        },
        getTouchAction: function() {
            var e = this.options.direction
              , t = [];
            return e & qe && t.push(rt),
            e & Re && t.push(nt),
            t
        },
        directionTest: function(e) {
            var t = this.options
              , n = !0
              , r = e.distance
              , i = e.direction
              , o = e.deltaX
              , a = e.deltaY;
            return i & t.direction || (t.direction & qe ? (i = 0 === o ? Me : 0 > o ? De : Le,
            n = o != this.pX,
            r = Math.abs(e.deltaX)) : (i = 0 === a ? Me : 0 > a ? Se : Fe,
            n = a != this.pY,
            r = Math.abs(e.deltaY))),
            e.direction = i,
            n && r > t.threshold && i & t.direction
        },
        attrTest: function(e) {
            return X.prototype.attrTest.call(this, e) && (this.state & ot || !(this.state & ot) && this.directionTest(e))
        },
        emit: function(e) {
            this.pX = e.deltaX,
            this.pY = e.deltaY;
            var t = Z(e.direction);
            t && this.manager.emit(this.options.event + t, e),
            this._super.emit.call(this, e)
        }
    }),
    c(Q, X, {
        defaults: {
            event: "pinch",
            threshold: 0,
            pointers: 2
        },
        getTouchAction: function() {
            return [tt]
        },
        attrTest: function(e) {
            return this._super.attrTest.call(this, e) && (Math.abs(e.scale - 1) > this.options.threshold || this.state & ot)
        },
        emit: function(e) {
            if (this._super.emit.call(this, e),
            1 !== e.scale) {
                var t = e.scale < 1 ? "in" : "out";
                this.manager.emit(this.options.event + t, e)
            }
        }
    }),
    c(ee, W, {
        defaults: {
            event: "press",
            pointers: 1,
            time: 500,
            threshold: 5
        },
        getTouchAction: function() {
            return [Qe]
        },
        process: function(e) {
            var t = this.options
              , n = e.pointers.length === t.pointers
              , r = e.distance < t.threshold
              , o = e.deltaTime > t.time;
            if (this._input = e,
            !r || !n || e.eventType & (xe | Ae) && !o)
                this.reset();
            else if (e.eventType & Ee)
                this.reset(),
                this._timer = i(function() {
                    this.state = ut,
                    this.tryEmit()
                }, t.time, this);
            else if (e.eventType & xe)
                return ut;
            return lt
        },
        reset: function() {
            clearTimeout(this._timer)
        },
        emit: function(e) {
            this.state === ut && (e && e.eventType & xe ? this.manager.emit(this.options.event + "up", e) : (this._input.timeStamp = he(),
            this.manager.emit(this.options.event, this._input)))
        }
    }),
    c(te, X, {
        defaults: {
            event: "rotate",
            threshold: 0,
            pointers: 2
        },
        getTouchAction: function() {
            return [tt]
        },
        attrTest: function(e) {
            return this._super.attrTest.call(this, e) && (Math.abs(e.rotation) > this.options.threshold || this.state & ot)
        }
    }),
    c(ne, X, {
        defaults: {
            event: "swipe",
            threshold: 10,
            velocity: .65,
            direction: qe | Re,
            pointers: 1
        },
        getTouchAction: function() {
            return J.prototype.getTouchAction.call(this)
        },
        attrTest: function(e) {
            var t, n = this.options.direction;
            return n & (qe | Re) ? t = e.velocity : n & qe ? t = e.velocityX : n & Re && (t = e.velocityY),
            this._super.attrTest.call(this, e) && n & e.direction && e.distance > this.options.threshold && fe(t) > this.options.velocity && e.eventType & xe
        },
        emit: function(e) {
            var t = Z(e.direction);
            t && this.manager.emit(this.options.event + t, e),
            this.manager.emit(this.options.event, e)
        }
    }),
    c(re, W, {
        defaults: {
            event: "tap",
            pointers: 1,
            taps: 1,
            interval: 300,
            time: 250,
            threshold: 2,
            posThreshold: 10
        },
        getTouchAction: function() {
            return [et]
        },
        process: function(e) {
            var t = this.options
              , n = e.pointers.length === t.pointers
              , r = e.distance < t.threshold
              , o = e.deltaTime < t.time;
            if (this.reset(),
            e.eventType & Ee && 0 === this.count)
                return this.failTimeout();
            if (r && o && n) {
                if (e.eventType != xe)
                    return this.failTimeout();
                var a = this.pTime ? e.timeStamp - this.pTime < t.interval : !0
                  , s = !this.pCenter || R(this.pCenter, e.center) < t.posThreshold;
                this.pTime = e.timeStamp,
                this.pCenter = e.center,
                s && a ? this.count += 1 : this.count = 1,
                this._input = e;
                var u = this.count % t.taps;
                if (0 === u)
                    return this.hasRequireFailures() ? (this._timer = i(function() {
                        this.state = ut,
                        this.tryEmit()
                    }, t.interval, this),
                    ot) : ut
            }
            return lt
        },
        failTimeout: function() {
            return this._timer = i(function() {
                this.state = lt
            }, this.options.interval, this),
            lt
        },
        reset: function() {
            clearTimeout(this._timer)
        },
        emit: function() {
            this.state == ut && (this._input.tapCount = this.count,
            this.manager.emit(this.options.event, this._input))
        }
    }),
    ie.VERSION = "2.0.4",
    ie.defaults = {
        domEvents: !1,
        touchAction: Je,
        enable: !0,
        inputTarget: null ,
        inputClass: null ,
        preset: [[te, {
            enable: !1
        }], [Q, {
            enable: !1
        }, ["rotate"]], [ne, {
            direction: qe
        }], [J, {
            direction: qe
        }, ["swipe"]], [re], [re, {
            event: "doubletap",
            taps: 2
        }, ["tap"]], [ee]],
        cssProps: {
            userSelect: "none",
            touchSelect: "none",
            touchCallout: "none",
            contentZooming: "none",
            userDrag: "none",
            tapHighlightColor: "rgba(0,0,0,0)"
        }
    };
    var pt = 1
      , ft = 2;
    oe.prototype = {
        set: function(e) {
            return s(this.options, e),
            e.touchAction && this.touchAction.update(),
            e.inputTarget && (this.input.destroy(),
            this.input.target = e.inputTarget,
            this.input.init()),
            this
        },
        stop: function(e) {
            this.session.stopped = e ? ft : pt
        },
        recognize: function(e) {
            var t = this.session;
            if (!t.stopped) {
                this.touchAction.preventDefaults(e);
                var n, r = this.recognizers, i = t.curRecognizer;
                (!i || i && i.state & ut) && (i = t.curRecognizer = null );
                for (var o = 0; o < r.length; )
                    n = r[o],
                    t.stopped === ft || i && n != i && !n.canRecognizeWith(i) ? n.reset() : n.recognize(e),
                    !i && n.state & (ot | at | st) && (i = t.curRecognizer = n),
                    o++
            }
        },
        get: function(e) {
            if (e instanceof W)
                return e;
            for (var t = this.recognizers, n = 0; n < t.length; n++)
                if (t[n].options.event == e)
                    return t[n];
            return null
        },
        add: function(e) {
            if (o(e, "add", this))
                return this;
            var t = this.get(e.options.event);
            return t && this.remove(t),
            this.recognizers.push(e),
            e.manager = this,
            this.touchAction.update(),
            e
        },
        remove: function(e) {
            if (o(e, "remove", this))
                return this;
            var t = this.recognizers;
            return e = this.get(e),
            t.splice(b(t, e), 1),
            this.touchAction.update(),
            this
        },
        on: function(e, t) {
            var n = this.handlers;
            return a(v(e), function(e) {
                n[e] = n[e] || [],
                n[e].push(t)
            }),
            this
        },
        off: function(e, t) {
            var n = this.handlers;
            return a(v(e), function(e) {
                t ? n[e].splice(b(n[e], t), 1) : delete n[e]
            }),
            this
        },
        emit: function(e, t) {
            this.options.domEvents && se(e, t);
            var n = this.handlers[e] && this.handlers[e].slice();
            if (n && n.length) {
                t.type = e,
                t.preventDefault = function() {
                    t.srcEvent.preventDefault()
                }
                ;
                for (var r = 0; r < n.length; )
                    n[r](t),
                    r++
            }
        },
        destroy: function() {
            this.element && ae(this, !1),
            this.handlers = {},
            this.session = {},
            this.input.destroy(),
            this.element = null
        }
    },
    s(ie, {
        INPUT_START: Ee,
        INPUT_MOVE: Te,
        INPUT_END: xe,
        INPUT_CANCEL: Ae,
        STATE_POSSIBLE: it,
        STATE_BEGAN: ot,
        STATE_CHANGED: at,
        STATE_ENDED: st,
        STATE_RECOGNIZED: ut,
        STATE_CANCELLED: ct,
        STATE_FAILED: lt,
        DIRECTION_NONE: Me,
        DIRECTION_LEFT: De,
        DIRECTION_RIGHT: Le,
        DIRECTION_UP: Se,
        DIRECTION_DOWN: Fe,
        DIRECTION_HORIZONTAL: qe,
        DIRECTION_VERTICAL: Re,
        DIRECTION_ALL: Ne,
        Manager: oe,
        Input: E,
        TouchAction: $,
        TouchInput: j,
        MouseInput: O,
        PointerEventInput: P,
        TouchMouseInput: V,
        SingleTouchInput: H,
        Recognizer: W,
        AttrRecognizer: X,
        Tap: re,
        Pan: J,
        Swipe: ne,
        Pinch: Q,
        Rotate: te,
        Press: ee,
        on: h,
        off: d,
        each: a,
        merge: u,
        extend: s,
        inherit: c,
        bindFn: l,
        prefixed: k
    }),
    typeof define == le && define.amd ? define("Hammer", [], function() {
        return ie
    }) : "undefined" != typeof module && module.exports ? module.exports = ie : e[n] = ie
}(window, document, "Hammer"),
define("KnockoutHammerBinding", ["Knockout", "Hammer"], function(e, t) {
    var n = {
        register: function(e) {
            e.bindingHandlers.swipeLeft = {
                init: function(t, n, r, i, o) {
                    var a = e.unwrap(n());
                    new Hammer(t).on("swipeleft", function(e) {
                        var t = o.$data;
                        a.apply(t, arguments)
                    })
                }
            },
            e.bindingHandlers.swipeRight = {
                init: function(t, n, r, i, o) {
                    var a = e.unwrap(n());
                    new Hammer(t).on("swiperight", function(e) {
                        var t = o.$data;
                        a.apply(t, arguments)
                    })
                }
            }
        }
    };
    return n
}),
define("registerKnockoutBindings", ["Knockout", "KnockoutMarkdownBinding", "KnockoutHammerBinding"], function(e, t, n) {
    var r = function() {
        Cesium.SvgPathBindingHandler.register(e),
        t.register(e),
        n.register(e),
        e.bindingHandlers.embeddedComponent = {
            init: function(t, n, r, i, o) {
                var a = e.unwrap(n());
                return a.show(t),
                {
                    controlsDescendantBindings: !0
                }
            },
            update: function(e, t, n, r, i) {}
        }
    }
    ;
    return r
}),
define("DistanceLegendViewModel", ["Knockout", "loadView"], function(e, t) {
    function n(e, t) {
        var n = Cesium.getTimestamp();
        if (!(n < e._lastLegendUpdate + 250)) {
            e._lastLegendUpdate = n;
            var r = t.canvas.clientWidth
              , i = t.canvas.clientHeight
              , s = t.camera.getPickRay(new Cesium.Cartesian2(r / 2 | 0,i - 1))
              , u = t.camera.getPickRay(new Cesium.Cartesian2(1 + r / 2 | 0,i - 1))
              , c = t.globe
              , l = c.pick(s, t)
              , p = c.pick(u, t);
            if (!Cesium.defined(l) || !Cesium.defined(p))
                return e.barWidth = void 0,
                void (e.distanceLabel = void 0);
            var f = c.ellipsoid.cartesianToCartographic(l)
              , h = c.ellipsoid.cartesianToCartographic(p);
            o.setEndPoints(f, h);
            for (var d, m = o.surfaceDistance, g = 100, v = a.length - 1; !Cesium.defined(d) && v >= 0; --v)
                a[v] / m < g && (d = a[v]);
            if (Cesium.defined(d)) {
                var b;
                b = d >= 1e3 ? (d / 1e3).toString() + " km" : d.toString() + " m",
                e.barWidth = d / m | 0,
                e.distanceLabel = b
            } else
                e.barWidth = void 0,
                e.distanceLabel = void 0
        }
    }
    function r(e, t) {
        var n = t.getSize().y / 2
          , r = 100
          , i = t.containerPointToLatLng([0, n]).distanceTo(t.containerPointToLatLng([r, n]))
          , o = L.control.scale()._getRoundNum(i)
          , a = 1e3 > o ? o + " m" : o / 1e3 + " km";
        e.barWidth = o / i * r,
        e.distanceLabel = a
    }
    var i = function(t) {
        function i() {
            if (Cesium.defined(o.terria)) {
                var e = o.terria.scene;
                o._removeSubscription = e.postRender.addEventListener(function() {
                    n(this, e)
                }, o)
            } else if (Cesium.defined(o.terria.leaflet)) {
                var t = o.terria.leaflet.map
                  , i = function() {
                    r(o, t)
                }
                ;
                o._removeSubscription = function() {
                    t.off("zoomend", i),
                    t.off("moveend", i)
                }
                ,
                t.on("zoomend", i),
                t.on("moveend", i),
                r(o, t)
            }
        }
        if (!Cesium.defined(t) || !Cesium.defined(t.terria))
            throw new DeveloperError("options.terria is required.");
        this.terria = t.terria,
        this._removeSubscription = void 0,
        this._lastLegendUpdate = void 0,
        this.eventHelper = new Cesium.EventHelper,
        this.distanceLabel = void 0,
        this.barWidth = void 0,
        e.track(this, ["distanceLabel", "barWidth"]),
        this.eventHelper.add(this.terria.afterViewerChanged, function() {
            Cesium.defined(this._removeSubscription) && (this._removeSubscription(),
            this._removeSubscription = void 0)
        }, this);
        var o = this;
        i(),
        this.eventHelper.add(this.terria.afterViewerChanged, function() {
            i()
        }, this)
    }
    ;
    i.prototype.destroy = function() {
        this.eventHelper.removeAll()
    }
    ,
    i.prototype.show = function(e) {
        var n = '<div class="distance-legend" data-bind="visible: distanceLabel && barWidth"><div class="distance-legend-label" data-bind="text: distanceLabel"></div><div class="distance-legend-scale-bar" data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div></div>';
        t(n, e, this)
    }
    ,
    i.create = function(e) {
        var t = new i(e);
        return t.show(e.container),
        t
    }
    ;
    var o = new Cesium.EllipsoidGeodesic
      , a = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1e3, 2e3, 3e3, 5e3, 1e4, 2e4, 3e4, 5e4, 1e5, 2e5, 3e5, 5e5, 1e6, 2e6, 3e6, 5e6, 1e7, 2e7, 3e7, 5e7];
    return i
}),
define("CameraView", [], function() {
    var e = function(e, t, n, r) {
        Cesium.defined(e) || console.log("rectangle is required."),
        (Cesium.defined(t) || Cesium.defined(n) || Cesium.defined(r)) && (Cesium.defined(t) && Cesium.defined(n) && Cesium.defined(r) || console.log("If any of position, direction, or up are specified, all must be specified.")),
        this._rectangle = e,
        this._position = t,
        this._direction = n,
        this._up = r
    }
    ;
    return Cesium.defineProperties(e.prototype, {
        rectangle: {
            get: function() {
                return this._rectangle
            }
        },
        position: {
            get: function() {
                return this._position
            }
        },
        direction: {
            get: function() {
                return this._direction
            }
        },
        up: {
            get: function() {
                return this._up
            }
        }
    }),
    e
}),
define("Navigation", ["Knockout", "NavigationViewModel", "registerKnockoutBindings", "DistanceLegendViewModel", "CameraView"], function(e, t, n, r, i) {
    return {
        distanceLegendViewModel: void 0,
        navigationViewModel: void 0,
        navigationDiv: void 0,
        distanceLegendDiv: void 0,
        terria: void 0,
        initialize: function(e, o) {
            this.terria = o,
            this.terria.afterViewerChanged = new Cesium.Event,
            this.terria.beforeViewerChanged = new Cesium.Event,
            this.navigationDiv = document.createElement("div"),
            this.navigationDiv.setAttribute("id", "navigationDiv"),
            this.distanceLegendDiv = document.createElement("div"),
            this.navigationDiv.setAttribute("id", "distanceLegendDiv"),
            e.appendChild(this.navigationDiv),
            e.appendChild(this.distanceLegendDiv),
            this.terria.homeView = new i(Cesium.Rectangle.MAX_VALUE),
            n(),
            this.distanceLegendViewModel = r.create({
                container: this.distanceLegendDiv,
                terria: this.terria,
                mapElement: e
            }),
            this.navigationViewModel = t.create({
                container: this.navigationDiv,
                terria: this.terria
            })
        },
        destroy: function() {
            this.navigationViewModel && this.navigationViewModel.destroy(),
            this.distanceLegendViewModel && this.distanceLegendViewModel.destroy(),
            this.navigationDiv && this.navigationDiv.parentNode.removeChild(this.navigationDiv),
            this.navigationDiv = void 0,
            this.distanceLegendDiv && this.distanceLegendDiv.parentNode.removeChild(this.distanceLegendDiv),
            this.distanceLegendDiv = void 0,
            this.terria && (this.terria.homeView = void 0)
        }
    }
});
var startupScriptRegex = /(.*?)(cesium-navigation)\w*\.js(?:\W|$)/i
  , baseTerriaNavigationUrl = "";
"undefined" != typeof window && (baseTerriaNavigationUrl = getBaseTerriaNavigationUrl()),
requirejs.config({
    baseUrl: baseTerriaNavigationUrl,
    paths: {
        Knockout: "lib/ThirdParty/knockout-3.3.0",
        knockoutes5: "lib/ThirdParty/knockout-es5.min",
        Hammer: "lib/ThirdParty/hammerjs",
        sanitizeCaja: "lib/ThirdParty/sanitizer-bundle",
        MarkdownIt: "lib/ThirdParty/markdown-it.min",
        navigatorTemplate: "lib/Views/Navigation.html",
        distanceLegendTemplate: "lib/Views/DistanceLegend.html",
        DistanceLegendViewModel: "lib/ViewModels/DistanceLegendViewModel",
        createFragmentFromTemplate: "lib/Core/createFragmentFromTemplate",
        loadView: "lib/Core/loadView",
        inherit: "lib/Core/inherit",
        svgReset: "lib/SvgPaths/svgReset",
        UserInterfaceControl: "lib/ViewModels/UserInterfaceControl",
        NavigationControl: "lib/ViewModels/NavigationControl",
        ResetViewNavigationControl: "lib/ViewModels/ResetViewNavigationControl",
        ZoomInNavigationControl: "lib/ViewModels/ZoomInNavigationControl",
        ZoomOutNavigationControl: "lib/ViewModels/ZoomOutNavigationControl",
        svgCompassOuterRing: "lib/SvgPaths/svgCompassOuterRing",
        svgCompassGyro: "lib/SvgPaths/svgCompassGyro",
        svgCompassRotationMarker: "lib/SvgPaths/svgCompassRotationMarker",
        KnockoutMarkdownBinding: "lib/Core/KnockoutMarkdownBinding",
        KnockoutHammerBinding: "lib/Core/KnockoutHammerBinding",
        registerKnockoutBindings: "lib/Core/registerKnockoutBindings",
        NavigationViewModel: "lib/ViewModels/NavigationViewModel",
        Navigation: "Navigation",
        CameraView: "lib/Models/CameraView"
    }
}),
define("NavigationStartup", ["Navigation"], function() {});
return {
    navigationInitialization: navigationInitialization
};
})();
} else {
    window.Cesium = null;
}
/* eslint-enable */
