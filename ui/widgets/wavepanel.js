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
        SLIDER.create(x, y, 10, h-42, MODEL.instance.waveSpeed, 0, 0.5, true),
        BUTTON.create(x+w-10, y, 10, h-42, function(){}),
    ];
    var _mousePosition = undefined;
    var _mouseDown = false;
    var _mouseSlopPx = 5;
    var _selectionColor = "#6ab5ff";
    var _hoverColor = "#0000ff";
    function _drawSineWave(ctx)
    {
        var amplitudeX = MODEL.instance.waveAmplitude() * (_w-20)/2.0 + _x;
        var resolution = 10;
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.moveTo(_x+_w/2, _y);
        for (var i = 0; i <= resolution; i++)
        {
            var yy = _y + (i*(_h-42)*1.0/resolution);
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
    function _muscleParamsToBarCoords(spr)
    {
        var xx = undefined;
        var yy = undefined;
        if (spr.amplitude() != 0.0)
        {
            xx = spr.amplitude() * (_w-20)/2.0 + _x + _w/2;
            yy = spr.phase() / (2*Math.PI) * (_h-42) + _y;
        }
        else
        {
            xx = _x+_w/2;
            yy = _y+_h-(42/2);
        }
        return [xx, yy];
    }
    function _barCoordsToMuscleParams(exy)
    {
        var amplitude = undefined;
        var phase = undefined;
        if (exy.y() >= _y+_h-42)
        {
            amplitude = 0;
            phase = 0;
        }
        else
        {
            amplitude = (2*(exy.x() - _x) - _w) / (_w - 20);
            phase = (2*Math.PI * (exy.y() - _y))/(_h - 42);
        }
        return [amplitude, phase];
    }
    function _findNearestMuscleBar(exy)
    {
        return UTIL.findNearest(exy, MODEL.instance.springs,
                function(spring) {
                    var [xx, yy] = _muscleParamsToBarCoords(spring);
                    return VECTOR.create(xx, yy);
                },
                function(spring) {
                    return (spring === MODEL.instance.selectedItem() ||
                            spring === MODEL.instance.hoveredItem());
                }
                );
    }
    function _getNearestMuscleBar(exy, maxDistanceInPixels)
    {
        var nearest = _findNearestMuscleBar(exy);
        if (nearest && nearest.distance < maxDistanceInPixels)
        {
            return nearest.item;
        }
    }
    function _drawMuscleBars(ctx)
    {
        MODEL.instance.springs.forEach(function(spr) {
            var color = "#000000";
            var circled = false;
            if (spr === MODEL.instance.selectedItem())
            {
                color = _selectionColor;
                circled = true;
            }
            else if (spr === MODEL.instance.hoveredItem())
            {
                color = _hoverColor;
                circled = true;
            }
            var barDotRadius = 2;
            var circleRadius = barDotRadius * 2;
            var [xx, yy] = _muscleParamsToBarCoords(spr);
            // draw line and dot
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
            // circle the dot
            if (circled)
            {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.arc(
                    xx, yy, circleRadius,
                    0, Math.PI * 2, false
                );
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
        UTIL.drawBoundingRectangle(ctx, _x, _y+_h-42, _w, 42);
        _children.forEach(function(child) {
            child.draw(ctx);
        });
        _drawSineWave(ctx);
        _drawMuscleBars(ctx);
    }
    function _signal(e, exy)
    {
        if (UTIL.inBounds(exy.x(), exy.y(), _x+10, _y, _w-20, _h))
        {
            // central wave view
            var nearestItem = _getNearestMuscleBar(exy, _mouseSlopPx);
            switch (e.type)
            {
            case "mousedown":
                if (e.button == 0)
                {
                    _mouseDown = true;
                    if (nearestItem)
                    {
                        MODEL.instance.selectedItem(nearestItem);
                    }
                    else
                    {
                        MODEL.instance.selectedItem(null);
                    }
                }
                else
                {
                    // deselect on right-click
                    MODEL.instance.selectedItem(null);
                }
                break;
            case "mouseup":
                _mouseDown = false;
                break;
            case "mousemove":
                _mousePosition = exy;
                if (nearestItem)
                {
                    MODEL.instance.hoveredItem(nearestItem);
                }
                else
                {
                    MODEL.instance.hoveredItem(null);
                }
                if (_mouseDown && MODEL.instance.selectedItem())
                {
                    // drag
                    var [amplitude, phase] = _barCoordsToMuscleParams(exy);
                    MODEL.instance.selectedItem().amplitude(amplitude);
                    MODEL.instance.selectedItem().phase(phase);
                }
                break;
            };
        }
        else if (UTIL.inBounds(exy.x(), exy.y(), _x+_w-10, _y, 10, _h-42))
        {
            // right-hand dragbar
        }
        else
        {
            _children.forEach(function(child) {
                if (UTIL.inBounds(exy.x(), exy.y(),
                                child.x(), child.y(), child.w(), child.h()))
                {
                    child.signal(e, exy);
                }
            });
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
