'use strict'

// MENUPANEL is the WIDGET at the center of the screen in which the model
// is drawn.  The user can click and drag in this panel to interact with
// the model.
var MODELPANEL = MODELPANEL || {};

// Creates the panel, with top-left corner at the specified coordinates (x, y)
// measured in pixels from the top-left corner of the browser's client, and
// with the specified width and height (w, h) in pixels.
MODELPANEL.create = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    // The current position of the mouse within the panel, in terms of the
    // browser's client coordinates, stored as a VECTOR, measured in pixels.
    var _mousePosition = undefined;
    // Whether a mouse button is currently being pressed.
    var _mouseDown = false;
    // How close the mouse must be to a mass or spring before that item
    // can be hovered or selected.  Measured as a distance in pixels.
    var _mouseSlopPx = 25;
    //var _children = [];   // MODELWIDGET can't have child WIDGETs.
    // Conversion between metric units and screen units.
    var _pixelsPerMeter = 120;
    // Color of the selected spring or mass (i.e. the item last clicked).
    var _selectionColor = "#6ab5ff";
    // Color of the hovered spring or mass (i.e. the item that the mouse cursor
    // is currently pointing at).
    var _hoverColor = "#0000ff";
    // Color of a bar spring.
    var _barColor = "#bbbbff";
    // Given a position vector in pixels from top-left of client area (v),
    // creates and returns a new vector representing the same point in metric
    // units that can be processed by the MODEL and the PHYSICS engine.
    function _pixelsToMeters(v)
    {
        var vv = VECTOR.create(v.x(), v.y());
        vv.x(vv.x() - _x);
        vv.y(_y + _h - vv.y());
        vv.div(_pixelsPerMeter);
        return vv;
    }
    // Given a position vector in meters from the model origin (v), creates and
    // returns a new vector representing the same point in pixels from top-left
    // of client area.
    function _metersToPixels(v)
    {
        var vv = VECTOR.mul(v, _pixelsPerMeter);
        vv.x(_x + vv.x());
        vv.y(_y + _h - vv.y());
        return vv;
    }
    // Draws the model's masses to the given drawing context (ctx).
    function _drawMasses(ctx)
    {
        var massRadius = 4;
        var circleRadius = massRadius * 2;
        MODEL.instance.masses.forEach(function(mass) {
            var [x, y] = _metersToPixels(mass.s).get();
            var color = "#000000";
            var circled = false;
            if (mass === MODEL.instance.selectedItem())
            {
                color = _selectionColor;
                circled = true;
            }
            else if (mass === MODEL.instance.hoveredItem())
            {
                color = _hoverColor;
                circled = true;
            }
            // draw mass
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(
                x, y, massRadius,
                0, Math.PI * 2, false
            );
            ctx.fill();
            ctx.closePath();
            // circle mass
            if (circled)
            {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.arc(
                    x, y, circleRadius,
                    0, Math.PI * 2, false
                );
                ctx.stroke();
                ctx.closePath();
            }
        });
    }
    // Draws the model's springs to the given drawing context (ctx).
    function _drawSprings(ctx)
    {
        var muscleDotRadius = 1.5;
        var circleRadius = muscleDotRadius * 2;
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
            if (spr.isBar())
            {
                color = _barColor;
            }
            // draw line
            var [x1, y1] = _metersToPixels(spr.m1.s).get();
            var [x2, y2] = _metersToPixels(spr.m2.s).get();
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.closePath();
            // draw muscle dot
            if (spr.amplitude() != 0.0)
            {
                var xm = (x1 + x2)/2;
                var ym = (y1 + y2)/2;
                ctx.beginPath();
                ctx.arc(
                    xm, ym, muscleDotRadius,
                    0, Math.PI * 2, false
                );
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();
            }
            // circle the spring
            if (circled)
            {
                var xm = (x1 + x2)/2;
                var ym = (y1 + y2)/2;
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.arc(
                    xm, ym, circleRadius,
                    0, Math.PI * 2, false
                );
                ctx.stroke();
                ctx.closePath();
            }
        });
    }
    // If a spring is currently being constructed, draw a line between the
    // spring's starting point and the current mouse position.  This is called
    // "rubberbanding".
    // See:  http://printwiki.org/Rubberbanding
    function _drawRubberbanding(ctx)
    {
        var item = MODEL.instance.selectedItem();
        if (MODEL.instance.mode() === MODEL.Modes.CONSTRUCT && MASS.isMass(item))
        {
            var [x1, y1] = _metersToPixels(item.s).get();
            item = MODEL.instance.hoveredItem();
            var [x2, y2] = (MASS.isMass(item))?
                                _metersToPixels(item.s).get() :
                                _mousePosition.get();
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();
        }
    }
    // Given a position vector in pixels from top-left of client area (exy),
    // find the nearest mass or spring in the model.  If it is within a certain
    // distance in pixels (maxDistanceInPixels), return the item.  Otherwise,
    // return undefined.
    function _getNearestItem(exy, maxDistanceInPixels)
    {
        var mxy = _pixelsToMeters(exy);
        var nearestMass = MODEL.instance.findNearestMass(mxy);
        var nearestSpring = MODEL.instance.findNearestSpring(mxy);
        if (!nearestMass) nearestMass = {item: undefined, distance: Infinity};
        if (!nearestSpring) nearestSpring = {item: undefined, distance: Infinity};
        var nearestItem = (nearestMass.distance <= nearestSpring.distance)?
                            nearestMass : nearestSpring;
        if (nearestItem.distance * _pixelsPerMeter <= maxDistanceInPixels)
        {
            return nearestItem.item;
        }
    }
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
    // Draw the MODELPANEL to the given drawing context (ctx).  Called once
    // per frame.
    function _draw(ctx)
    {
        UTIL.drawBoundingRectangle(ctx, _x, _y, _w, _h);
        _drawSprings(ctx);
        _drawRubberbanding(ctx);
        _drawMasses(ctx);
    }
    // Called by a mouse event (e) at client coordinates (exy).
    function _signal(e, exy)
    {
        // Actions generic across all modes (simulate, construct, ...)
        switch (e.type)
        {
            case "mousedown":
                if (UTIL.inBounds(exy.x(), exy.y(), _x, _y, _w, _h))
                {
                    if (e.button == 0)
                    {
                        _mouseDown = true;
                    }
                    else
                    {
                        // deselect on right-click
                        MODEL.instance.selectedItem(null);
                    }
                }
                break;
            case "mouseup":
                if (e.button == 0)
                {
                    _mouseDown = false;
                    if (UTIL.inBounds(exy.x(), exy.y(), _x, _y, _w, _h))
                    {
                        if (MASS.isMass(MODEL.instance.selectedItem()))
                        {
                            // stop dragging
                            // TODO:  Regardless of whether the mass was originally
                            // free, it is converted back to a free mass here.
                            // When real support for fixed masses is added to the
                            // constructor, this line will need to change.
                            MODEL.instance.selectedItem().isFreeMass(true);
                        }
                    }
                }
                break;
            case "mousemove":
                _mousePosition = exy;
                // hover
                MODEL.instance.hoveredItem(_getNearestItem(exy, _mouseSlopPx) || null);
                // drag
                if (_mouseDown && MASS.isMass(MODEL.instance.selectedItem()))
                {
                    // It's a mass, start dragging.  If the mouse goes outside
                    // the model window, drag to the nearest point in the model
                    // window.
                    var mxy = _pixelsToMeters(VECTOR.clamp(exy, x, y, w, h));
                    MODEL.instance.selectedItem().s.set(mxy.x(), mxy.y());
                    // When you're dragging a mass, the mass is temporarily
                    // converted to a fixed mass so the physics engine doesn't
                    // yank it away from you.
                    MODEL.instance.selectedItem().isFreeMass(false);
                }
                break;
        }

        // Actions specific to a particular mode
        switch (MODEL.instance.mode())
        {
        case MODEL.Modes.SIMULATE:
            if (UTIL.inBounds(exy.x(), exy.y(), _x, _y, _w, _h))
            {
                if (e.type === "mousedown" && e.button === 0)
                {
                    // select clicked object
                    MODEL.instance.selectedItem(_getNearestItem(exy, _mouseSlopPx) || null);
                }
            }
            break;
        case MODEL.Modes.CONSTRUCT:
            if (UTIL.inBounds(exy.x(), exy.y(), _x, _y, _w, _h))
            {
                if (e.type === "mousedown" && e.button === 0)
                {
                    var clickedItem = _getNearestItem(exy, _mouseSlopPx);
                    if (!clickedItem)
                    {
                        // clicked empty space
                        if (MASS.isMass(MODEL.instance.selectedItem()))
                        {
                            // connect selected mass with new mass
                            var mass = MASS.create(_pixelsToMeters(exy));
                            MODEL.instance.addMass(mass);
                            var spring = SPRING.create(MODEL.instance.selectedItem(), mass);
                            MODEL.instance.addSpring(spring);
                            MODEL.instance.selectedItem(mass);
                        }
                        else
                        {
                            // create new mass
                            var mass = MASS.create(_pixelsToMeters(exy));
                            MODEL.instance.addMass(mass);
                            MODEL.instance.selectedItem(mass);
                        }
                    }
                    else
                    {
                        if (MASS.isMass(clickedItem))
                        {
                            // clicked a mass
                            if (MASS.isMass(MODEL.instance.selectedItem()))
                            {
                                if (clickedItem != MODEL.instance.selectedItem())
                                {
                                    var spring = SPRING.create(clickedItem,
                                                               MODEL.instance.selectedItem());
                                    MODEL.instance.addSpring(spring);
                                }
                                MODEL.instance.selectedItem(clickedItem);
                            }
                            else
                            {
                                MODEL.instance.selectedItem(clickedItem);
                            }
                        }
                        else
                        {
                            // clicked a spring
                            MODEL.instance.selectedItem(clickedItem);
                        }
                    }
                }
            }
            break;
        case MODEL.Modes.DELETE:
            if (UTIL.inBounds(exy.x(), exy.y(), _x, _y, _w, _h))
            {
                if (e.type === "mousedown" && e.button === 0)
                {
                    // deselect all
                    MODEL.instance.selectedItem(null);
                    // delete clicked object
                    var item = _getNearestItem(exy, _mouseSlopPx);
                    if (item !== undefined)
                    {
                        MODEL.instance.removeMass(item) ||
                            MODEL.instance.removeSpring(item);
                    }
                }
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
