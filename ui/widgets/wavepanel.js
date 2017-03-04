'use strict'

var WAVEPANEL = WAVEPANEL || {};

WAVEPANEL.instance = (function(w, h)
{
// private
    var _x = 0;
    var _y = 0;
    var _w = w;
    var _h = h;
    var _children = []; //TODO
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
    }
    function _signal(e)
    {
    }
    return {
        x: __x,
        y: __y,
        w: __w,
        h: __h,
        draw: _draw,
        signal: _signal
    };
})();
// singleton
