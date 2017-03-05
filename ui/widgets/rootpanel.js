'use strict'

var ROOTPANEL = ROOTPANEL || {};

ROOTPANEL.create = (function(w, h)
{
// private
    var _x = 0;
    var _y = 0;
    var _w = w;
    var _h = h;

    var _children = [
        MODELPANEL.create(64, 22, 657, 428),
        WAVEPANEL.create(0, 22, 64, 298),
        MENUPANEL.create(0, 0, 720, 22),
        GFKPANEL.create (0, 320, 64, 130)
    ];
// public
    function __x(x)
    {
        if (x !== undefined)
        {
            _x = x;
        }
        return _x;
    }
    function __y(y)
    {
        if (y !== undefined)
        {
            _y = y;
        }
        return _y;
    }
    function __w(w)
    {
        if (w !== undefined)
        {
            _w = w;
        }
        return _w;
    }
    function __h(h)
    {
        if (h !== undefined)
        {
            _h = h;
        }
        return _h;
    }
    function _draw(ctx)
    {
        _children.forEach(function(child) {
            child.draw(ctx);
        });
    }
    function _signal(e, exy)
    {
        _children.forEach(function(child) {
            if (UTIL.inBounds(exy.x(), exy.y(),
                            child.x(), child.y(), child.w(), child.h()))
            {
                child.signal(e, exy);
            }
        });
    }
    return {
        x: __x,
        y: __y,
        w: __w,
        h: __h,
        draw: _draw,
        signal: _signal
    };
});
