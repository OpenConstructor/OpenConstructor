'use strict'

var SLIDER = SLIDER || {};

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
    var _mouseDown = false;
    var _invert = (invert !== undefined)? invert : false;
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
    function _signal(e, exy)
    {
        switch (e.type)
        {
        case "mouseup":
            _mouseDown = false;
            break;
        case "mousedown":
            _mouseDown = true;
            // fall through
        case "mousemove":
            if (_mouseDown)
            {
                var proportion = (_h - exy.y() + _y) / (1.0 * _h);
                if (_invert)
                {
                    proportion = 1 - proportion;
                }
                var scaled = proportion * (_max-_min) + _min;
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
