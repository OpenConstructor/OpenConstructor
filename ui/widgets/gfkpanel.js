'use strict'

var GFKPANEL = GFKPANEL || {};

GFKPANEL.create = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    var _children = [
        BUTTON.create(x, y, w/3, 22,
            function() {},
            function() {return "g"}),
        BUTTON.create(x+w/3, y, w/3, 22,
            function() {},
            function() {return "f"}),
        BUTTON.create(x+2*w/3, y, w/3, 22,
            function() {},
            function() {return "k"}),
        SLIDER.create(x, y+22, w/3, h-22, MODEL.instance.g, 0, -0.25),
        SLIDER.create(x+w/3, y+22, w/3, h-22, MODEL.instance.f, 0, 0.5),
        SLIDER.create(x+2*w/3, y+22, w/3, h-22, MODEL.instance.k, 0, 10)
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
        UTIL.drawBoundingRectangle(ctx, _x, _y, _w, _h);
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
