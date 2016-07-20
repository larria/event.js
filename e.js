(function(){
    var evt = {};
    var special = {};

    function on (el) {
        var type, deleQuery, handle;
        if(arguments.length < 3) {
            throw new Error('Parameter error: at least 3 parameters needed!');
        } else {
            type = arguments[1];
            if(arguments[3]) {
                deleQuery = arguments[2];
                handle = arguments[3];
                delegate(el, type, deleQuery, handle);
            } else {
                handle = arguments[2];
                bind(el, type, handle);
            }
        }
    }

    function off (el) {
        var type, deleQuery, handle;
        type = arguments[1];
        if(arguments.length > 3) {
            deleQuery = arguments[2];
            handle = arguments[3];
            undelegate(el, type, deleQuery, handle);
        } else {
            handle = arguments[2];
            unbind(el, type, handle);
            if(!handle) {
                undelegate(el, type);
            }
        }
    }

    function bind (el, type, handle) {
        if(!el.events || !el.events[type]) {
            _initElement(el, type);
        }
        el.events[type].push(handle);
    }

    function unbind (el, type, handle) {
        if(!el.events) {
            return;
        }
        if(handle) {
            if(el.events[type]) {
                for(var i = 0, len = el.events[type].length; i < len; i++) {
                    if(el.events[type][i] === handle) {
                        el.events[type].splice(i, 1);
                        break;
                    }
                }
            }
        } else if(type) {
            if(el.events[type]) {
                el.events[type].length = 0;
            }
        } else {
            for(var i in el.events) {
                if(el.events[i]) {
                    el.events[i].length = 0;
                }
            }
        }
    }

    function delegate (el, type, deleQuery, handle) {
        _initElement(el, type);
        el.delegs[type].push({
            deleQuery : deleQuery,
            handle : handle,
            wrapHandle : function (e) {
                var ev = e || window.event,
                    target = ev.target || ev.srcElement,
                    els = el.querySelectorAll(deleQuery);
                target = target || this;
                for (var i = 0, len = els.length; i < len; i++) {
                    if (_contains(els[i], target)) {
                        handle.apply(els[i], arguments);
                        break;
                    }
                }
            }
        });
    }

    function undelegate (el, type, deleQuery, handle) {
        if(!el.delegs) {
            return;
        }
        if(handle) {
            if(el.delegs[type]) {
                for(var i = 0, len = el.delegs[type].length; i < len; i++) {
                    if(el.delegs[type][i].deleQuery === deleQuery && el.delegs[type][i].handle === handle) {
                        el.delegs[type].splice(i, 1);
                        break;
                    }
                }
            }
        } else if(type) {
            if(el.delegs[type]) {
                el.delegs[type].length = 0;
            }
        } else {
            for(var i in el.delegs) {
                el.delegs[i].length = 0;
            }
        }
    }

    function trigger (el, type, e) {
        e = e || {target : el};
        while(el) {
            _dispatch(el, type, e);
            el = el.parentNode;
        }
    }

    function _dispatch (el, type, e) {
        e = e || {target : el};
        var i, len;
        if(el.delegs && el.delegs[type]) {
            for(i = 0, len = el.delegs[type].length; i < len; i++) {
                el.delegs[type][i].wrapHandle.call(el, e);
            }
        }
        if(el.events && el.events[type]) {
            for(i = 0, len = el.events[type].length; i < len; i++) {
                el.events[type][i].call(el, e);
            }
        }
    }

    function _initElement (el, type) {
        var inited = el.delegs && el.events;
        el.delegs = el.delegs || {};
        el.delegs[type] = el.delegs[type] || [];
        el.events = el.events || {};
        el.events[type] = el.events[type] || [];
        if(!inited) {
            if('on' + type in el) {
                _addEvent(el, type, function () {
                    var i, len;
                    for(i = 0, len = el.delegs[type].length; i < len; i++) {
                        el.delegs[type][i].wrapHandle.apply(el, arguments);
                    }
                    for(i = 0, len = el.events[type].length; i < len; i++) {
                        el.events[type][i].apply(el, arguments);
                    }
                });
            } else if(special[type]) {
                special[type](el);
            }
        }
    }

    function _addEvent (el, type, fn) {
        if (el.addEventListener)
            el.addEventListener(type, fn, false);
        else if (el.attachEvent) {
            el.attachEvent('on' + type, fn);
        }
    }

    function _contains(a, b) {
        if (a === b) {
            return true;
        }
        if (a.contains) {
            if (a.nodeType === 9) return true;
            return a.contains(b);
        } else if (a.compareDocumentPosition) {
            return !!(a.compareDocumentPosition(b) & 16);
        }
        while ((b = b.parentNode)) {
            if (a === b) return true;
        }
        return false;
    }
    // export
    evt._addEvent = _addEvent;
    evt._dispatch = _dispatch;
    evt.on = on;
    evt.off = off;
    evt.bind = bind;
    evt.unbind = unbind;
    evt.delegate = delegate;
    evt.undelegate = undelegate;
    evt.trigger = trigger;
    evt.special = special;
    if (typeof module !== 'undefined' && module.exports && this.module !== module) { module.evt = evt; }
    else if (typeof define === 'function' && define.amd) { define(evt); }
    else { window.evt = evt; };
})();