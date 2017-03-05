'use strict'

var WAVEPANEL = WAVEPANEL || {};

WAVEPANEL.create = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    var _children = [
        SLIDER.create(x, y, 10, h, MODEL.instance.waveSpeed, 0, 0.5, true),
        BUTTON.create(x+w-10, y, 10, h, function(){}),
    ];
    var _selectionColor = "#6ab5ff";
    function _drawSineWave(ctx)
    {
        var amplitudeX = MODEL.instance.waveAmplitude() * (_w-20)/2.0 + _x;
        var resolution = 10;
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.moveTo(_x+_w/2, _y);
        for (var i = 0; i <= resolution; i++)
        {
            var yy = _y + (i*_h*1.0/resolution);
            var pp = 2*Math.PI * i / resolution;
            pp += MODEL.instance.wavePhase();
            var xx = Math.sin(pp);
            xx *= amplitudeX * -1;
            xx += _x + _w/2;
            ctx.lineTo(xx, yy);
        }
        ctx.stroke();
        ctx.closePath();
    }
    function _drawMuscleBars(ctx)
    {
        MODEL.instance.springs.forEach(function(spr) {
            if (spr.amplitude() != 0)
            {
                var barDotRadius = 2;
                var xx = spr.amplitude() * (_w-20)/2.0 + _x + _w/2;
                var yy = spr.phase() / (2*Math.PI) * _h + _y;
                var color = "#000000";
                if (spr === MODEL.instance.selectedItem())
                {
                    color = _selectionColor;
                }
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.arc(
                    xx, yy, barDotRadius,
                    0, Math.PI * 2, false
                );
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.moveTo(_x + 10, yy);
                ctx.lineTo(_x + _w - 10, yy);
                ctx.stroke();
                ctx.closePath();
            }
        });
    }
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
        _drawSineWave(ctx);
        _drawMuscleBars(ctx);
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
