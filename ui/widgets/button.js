'use strict'

var BUTTON = BUTTON || {};

BUTTON.create = (function(x, y, w, h, clickFn, captionFn)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    var _clickFn = clickFn;
    var _captionFn = captionFn;
    //var _children = [];   // this widget doesn't have children
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
        UTIL.drawBoundingRectangle(ctx, _x, _y, _w, _h);
        if (_captionFn !== undefined)
        {
            ctx.font = "16px sans-serif"
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.fillText(_captionFn(), _x + _w/2, _y + _h/2 + 16/2);
        }
    }
    function _signal(e, xy)
    {
        if (_clickFn !== undefined && e.type === "mousedown")
        {
            _clickFn(e.button);
        }
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
