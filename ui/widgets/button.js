'use strict'

// BUTTON is a WIDGET that calls a user-specified callback function when
// clicked.
var BUTTON = BUTTON || {};

// Creates the button, with top-left corner at the specified coordinates (x, y)
// measured in pixels from the top-left corner of the browser's client, and
// with the specified width and height (w, h) in pixels.  Takes a callback
// function that is called when the button is clicked (clickFn).  This callback
// function is passed one parameter, the button that was clicked (0/1/2).  Also
// takes another callback function that is called to determine the button's
// caption (captionFn).
BUTTON.create = (function(x, y, w, h, clickFn, captionFn)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    var _clickFn = clickFn;
    var _captionFn = captionFn;
    //var _children = [];   // BUTTON WIDGET can't have child WIDGETS.
// public
    // accessors
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
    // Draw the button to the specified drawing context (ctx).  Called once per
    // frame.
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
    // Called by a mouse event (e) at client coordinates (exy).
    function _signal(e, exy)
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
