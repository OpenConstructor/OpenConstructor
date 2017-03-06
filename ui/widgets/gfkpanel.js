'use strict'

// GFKPANEL is the WIDGET that contains the G, F, and K sliders.
var GFKPANEL = GFKPANEL || {};

// Creates the panel, with top-left corner at the specified coordinates (x, y)
// measured in pixels from the top-left corner of the browser's client, and
// with the specified width and height (w, h) in pixels.
GFKPANEL.create = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    // GFKPANEL needs children in order to work.
    var _children = [
        // The "g" caption, implemented as a button without an onclick action.
        BUTTON.create(x, y, w/3, 22,
            function() {},
            function() {return "g"}),
        // The "f" caption...
        BUTTON.create(x+w/3, y, w/3, 22,
            function() {},
            function() {return "f"}),
        // The "k" caption...
        BUTTON.create(x+2*w/3, y, w/3, 22,
            function() {},
            function() {return "k"}),
        // The "g" slider.
        SLIDER.create(x, y+22, w/3, h-22, MODEL.instance.g, 0, -0.25),
        // The "f" slider.
        SLIDER.create(x+w/3, y+22, w/3, h-22, MODEL.instance.f, 0, 0.5),
        // The "k" slider.
        SLIDER.create(x+2*w/3, y+22, w/3, h-22, MODEL.instance.k, 0, 10)
    ];
// public
    // Accessors
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
    // Draw the panel to the given drawing context (ctx).  Called once per
    // frame.
    function _draw(ctx)
    {
        // Draw self
        UTIL.drawBoundingRectangle(ctx, _x, _y, _w, _h);
        // Delegate to children
        _children.forEach(function(child) {
            child.draw(ctx);
        });
    }
    // Called by a mouse event (e) at client coordinates (exy).
    function _signal(e, exy)
    {
        // Delegate to children
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
