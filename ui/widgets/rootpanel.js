'use strict'

// ROOTPANEL is the top-level WIDGET in the user interface.  All UI
// elements, windows, frames, controls, etc. are instances of a type called
// WIDGET.  The constructor UI is built from a tree structure of WIDGETS.
// The UI handles events (such as mouse movements and drawing requests) by
// passing them to the root.  If the root doesn't know what to do with this
// event, it propagates the event downward to its children.  The event
// keeps propagating down the tree until until it reaches a WIDGET that
// knows how to handle it, or until it reaches the leaves of the tree (at
// which point it's finally dropped if the leaf doesn't know how to handle
// it).  This is very similar to the way most windowing toolkits work. If
// you have never heard of a WIDGET, take a look at the Qt documentation
// for a Qt WIDGET.  Of course these are much more complicated than the
// WIDGETS in this simple constructor but they give you an idea of what a
// WIDGET is.
// See:  http://doc.qt.io/qt-5/qtwidgets-index.html
var ROOTPANEL = ROOTPANEL || {};

// Creates the panel, with top-left corner at (0,0) and with the specified
// width and height (w,h), measured in pixels.
ROOTPANEL.create = (function(w, h)
{
// private
    var _x = 0;
    var _y = 0;
    var _w = w;
    var _h = h;

    // ROOTPANEL needs children in order to work.
    var _children = [
        MODELPANEL.create(64, 22, 657, 428),
        WAVEPANEL.create(0, 22, 64, 298),
        MENUPANEL.create(0, 0, 720, 22),
        GFKPANEL.create (0, 320, 64, 130)
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
        // Delegate to children
        _children.forEach(function(child) {
            child.draw(ctx);
        });
    }
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
