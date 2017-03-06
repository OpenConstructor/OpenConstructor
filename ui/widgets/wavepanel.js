'use strict'

// WAVEPANEL is the WIDGET at the left of the screen where the muscle WAVE, and
// the muscle amplitudes and phases, are drawn.  The user can click and drag in
// this panel to create, modify and delete muscles.
var WAVEPANEL = WAVEPANEL || {};

// Creates the panel, with top-left corner at the specified coordinates (x, y)
// measured in pixels from the top-left corner of the browser's client, and
// with the specified width and height (w, h) in pixels.
WAVEPANEL.create = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    // WAVEPANEL needs children in order to work.
    var _children = [
        // Wave speed slider
        SLIDER.create(x, y, 10, h-42, MODEL.instance.waveSpeed, 0, 0.5, true),
        // Right-hand dragbar
        BUTTON.create(x+w-10, y, 10, h-42, function(){}),
    ];
    // The current position of the mouse within the panel, in terms of the
    // browser's client coordinates, stored as a VECTOR, measured in pixels.
    var _mousePosition = undefined;
    // Whether a mouse button is currently being pressed.
    var _mouseDown = false;
    // How close the mouse must be to a muscle bar before the muscle can be
    // hovered or selected.  Measured as a distance in pixels.
    var _mouseSlopPx = 5;
    // Color of the selected muscle (i.e. last clicked).
    var _selectionColor = "#6ab5ff";
    // Color of the hovered muscle (i.e. the one that the mouse cursor
    // is currently pointing at).
    var _hoverColor = "#0000ff";
    // Draws the WAVE to the given drawing context (ctx).
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
    // Given a spring (spr), creates and returns a new [x, y] array
    // representing the coordinates where this muscle bar should be drawn in
    // the wave panel, measured in pixels from top-left of client area.
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
            // If it isn't a muscle, draw it below the muscle bar.
            xx = _x+_w/2;
            yy = _y+_h-(42/2);
        }
        return [xx, yy];
    }
    // Given a position vector in pixels from top-left of client area (exy),
    // creates and returns a new [amplitude, phase] array for a muscle
    // bar placed in this position in the wave panel.
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
    // Given a position vector in pixels from top-left of client area (exy),
    // returns the nearest muscle bar, or undefined if there are no muscles.
    function _findNearestMuscleBar(exy)
    {
        return UTIL.findNearest(exy, MODEL.instance.springs,
                function(spring) {
                    var [xx, yy] = _muscleParamsToBarCoords(spring);
                    return VECTOR.create(xx, yy);
                },
                function(spring) {
                    // Give priority to the selected item, or if nothing is
                    // selected, the hovered item.  This lets you select a
                    // spring in the model area, and then in the wave bar drag
                    // it up into the muscle area to turn this spring into a
                    // muscle.  If the selected item were not prioritized,
                    // you'd probably get a random spring instead of the one
                    // you selected.
                    return (spring === MODEL.instance.selectedItem() ||
                            spring === MODEL.instance.hoveredItem());
                }
                );
    }
    // Given a position vector in pixels from top-left of client area (exy),
    // find the nearest muscle bar.  If it is within a certain
    // distance in pixels (maxDistanceInPixels), return the item.  Otherwise,
    // return undefined.
    function _getNearestMuscleBar(exy, maxDistanceInPixels)
    {
        var nearest = _findNearestMuscleBar(exy);
        if (nearest && nearest.distance < maxDistanceInPixels)
        {
            return nearest.item;
        }
    }
    // Draws the muscle bars to the given drawing context (ctx).
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
    // Draw the WAVEPANEL to the given drawing context (ctx).  Called once
    // per frame.
    function _draw(ctx)
    {
        // Draw bounding boxes/clear self
        UTIL.drawBoundingRectangle(ctx, _x, _y, _w, _h);
        UTIL.drawBoundingRectangle(ctx, _x, _y+_h-42, _w, 42);
        // Draw children
        _children.forEach(function(child) {
            child.draw(ctx);
        });
        // Draw rest of self
        _drawSineWave(ctx);
        _drawMuscleBars(ctx);
    }
    // Called by a mouse event (e) at client coordinates (exy).
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
                        // deselect on left-clicking empty space
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
                // hover
                MODEL.instance.hoveredItem(nearestItem || null);
                // drag
                if (_mouseDown)
                {
                    var [amplitude, phase] = _barCoordsToMuscleParams(exy);
                    if (MODEL.instance.selectedItem())
                    {
                        // dragging muscle
                        MODEL.instance.selectedItem().amplitude(amplitude);
                        MODEL.instance.selectedItem().phase(phase);
                    }
                    else
                    {
                        // dragging empty space:  adjust wave amplitude
                        if (amplitude <= 0)
                        {
                            amplitude = 0;
                        }
                        MODEL.instance.waveAmplitude(amplitude);
                    }
                }
                break;
            };
        }
        else if (UTIL.inBounds(exy.x(), exy.y(), _x+_w-10, _y, 10, _h-42))
        {
            // Right-hand dragbar;  when dragged this should move the wave
            // when in manual mode.  TODO:  Make this actually work.
        }
        else
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
