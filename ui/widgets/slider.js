'use strict'

// SLIDER is a WIDGET that displays (and allows users to set) a value
// through calls to an accessor function.
var SLIDER = SLIDER || {};

// Creates the slider, with top-left corner at the specified coordinates (x, y)
// measured in pixels from the top-left corner of the browser's client, and
// with the specified width and height (w, h) in pixels.  Takes an accessor
// function (accessorFn), which is called to set the new value when the slider
// is moved, and is also called to retrieve the current value when the slider
// is displayed.  The slider's minimum and maximum value (min, max) are
// specified.  The slider linearly interpolates between these two values.
// There is also an optional parameter describing whether the slider grows from
// the bottom of the screen up (invert = false/undefined) or from the top of
// the screen down (invert = true).
SLIDER.create = (function(x, y, w, h, accessorFn, min, max, invert)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    var _accessorFn = accessorFn;
    var _min = min;
    var _max = max;
    var _mouseDown = null;
    var _invert = (invert !== undefined)? invert : false;
    //var _children = [];   // SLIDER WIDGET can't have child WIDGETS.
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
    // Draw the slider to the specified drawing context (ctx).  Called once per
    // frame.
    function _draw(ctx)
    {
        UTIL.drawBoundingRectangle(ctx, _x, _y, _w, _h);
        var hh = (1.0*_accessorFn()-_min)/(_max-_min)*_h;
        if (_invert)
        {
            hh = _h - hh;
        }
        var yy = _y + _h - hh;
        var sliderDotRadius = 1.5;
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        if (_invert)
        {
            ctx.moveTo(_x+_w/2, _y);
        }
        else
        {
            ctx.moveTo(_x+_w/2, _y+_h);
        }
        ctx.lineTo(_x+_w/2, yy);
        ctx.moveTo(_x, yy);
        ctx.lineTo(_x+_w, yy);
        ctx.stroke();
        ctx.arc(
            _x+_w/2, yy, sliderDotRadius,
            0, Math.PI * 2, false
        );
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.closePath();
    }
    // Called by a mouse event (e) at client coordinates (exy).
    function _signal(e, exy)
    {
        switch (e.type)
        {
        case "mouseup":
            _mouseDown = null;
            break;
        case "mousedown":
            _mouseDown = {
              pos: exy.y(),
              val: _accessorFn()
            };

        case "mousemove":
            if (_mouseDown)
            {
                var delta = (exy.y() - _mouseDown.pos)/(1.0 * _h);
                var scaledDelta = (_max-_min) * delta;
                var scaled = _mouseDown.val - scaledDelta;
                if (_invert)
                {
                    scaled = _mouseDown.val + scaledDelta;
                }
                _accessorFn(scaled);
            }
            break;
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
