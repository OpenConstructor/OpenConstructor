'use strict'

var MODELPANEL = MODELPANEL || {};

MODELPANEL.create = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    var _mousePosition = undefined;
    var _mouseDown = false;
    var _hoveredItem = undefined;
    //var _children = [];   // this widget doesn't have children
    var _pixelsPerMeter = 120;
    var _selectionColor = "#6ab5ff";
    var _hoverColor = "#0000ff";
    var _mouseSlopPx = 50;
    function _pixelsToMeters(v)
    {
        var vv = VECTOR.create(v.x(), v.y());
        vv.x(vv.x() - _x);
        vv.y(_y + _h - vv.y());
        vv.div(_pixelsPerMeter);
        return vv;
    }
    function _metersToPixels(v)
    {
        var vv = VECTOR.mul(v, _pixelsPerMeter);
        vv.x(_x + vv.x());
        vv.y(_y + _h - vv.y());
        return vv;
    }
    function _drawMasses(ctx)
    {
        var massRadius = 4;
        MODEL.instance.masses.forEach(function(mass) {
            var [x, y] = _metersToPixels(mass.s).get();
            ctx.beginPath();
            ctx.arc(
                x, y, massRadius,
                0, Math.PI * 2, false
            );
            ctx.fillStyle = "#000000";
            if (mass === MODEL.instance.selectedItem())
            {
                ctx.fillStyle = _selectionColor;
            }
            else if (mass === _hoveredItem)
            {
                ctx.fillStyle = _hoverColor;
            }
            ctx.fill();
            ctx.closePath();
        });
    }
    function _drawSprings(ctx)
    {
        var muscleDotRadius = 1.5;
        MODEL.instance.springs.forEach(function(spr) {
            var color = "#000000";
            if (spr === MODEL.instance.selectedItem())
            {
                color = _selectionColor;
            } 
            else if (spr === _hoveredItem)
            {
                color = _hoverColor;
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
        });
    }
    function _drawRubberbanding(ctx)
    {
        var item = MODEL.instance.selectedItem();
        if (MODEL.instance.mode() === MODEL.Modes.CONSTRUCT &&
            item && item.isFreeMass !== undefined)
        {
            var [x1, y1] = _metersToPixels(item.s).get();
            var [x2, y2] = (_hoveredItem && _hoveredItem.isFreeMass)?
                                _metersToPixels(_hoveredItem.s).get() :
                                _mousePosition.get();
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();
        }
    }
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
        _drawSprings(ctx);
        _drawRubberbanding(ctx);
        _drawMasses(ctx);
    }
    function _signal(e, exy)
    {
        // Actions generic across all modes
        switch (e.type)
        {
            case "mousedown":
                if (e.button == 0)
                {
                    _mouseDown = true;
                }
                else
                {
                    // deselect on right-click
                    MODEL.instance.selectedItem(null);
                }
                break;
            case "mouseup":
                if (e.button == 0)
                {
                    _mouseDown = false;
                    if (MODEL.instance.selectedItem() &&
                        MODEL.instance.selectedItem().isFreeMass !== undefined)
                    {
                        // stop dragging
                        MODEL.instance.selectedItem().isFreeMass(true);
                    }
                }
                break;
            case "mousemove":
                _mousePosition = exy;
                // hover
                _hoveredItem = _getNearestItem(exy, _mouseSlopPx);
                // drag
                if (_mouseDown && MODEL.instance.selectedItem())
                {
                    if (MODEL.instance.selectedItem().s)
                    {
                        var mxy = _pixelsToMeters(exy);
                        MODEL.instance.selectedItem().s.set(mxy.x(), mxy.y());
                        MODEL.instance.selectedItem().isFreeMass(false);
                    }
                }
                break;
        }

        // Actions specific to a particular mode
        switch (MODEL.instance.mode())
        {
        case MODEL.Modes.SIMULATE:
            if (e.type === "mousedown" && e.button === 0)
            {
                // select clicked object
                MODEL.instance.selectedItem(_getNearestItem(exy, _mouseSlopPx) || null);
            }
            break;
        case MODEL.Modes.CONSTRUCT:
            if (e.type === "mousedown" && e.button === 0)
            {
                var clickedItem = _getNearestItem(exy, _mouseSlopPx);
                if (!clickedItem)
                {
                    if (MODEL.instance.selectedItem() &&
                        MODEL.instance.selectedItem().isFreeMass !== undefined)
                    {
                        var mass = MASS.create(_pixelsToMeters(exy));
                        MODEL.instance.addMass(mass);
                        var spring = SPRING.create(MODEL.instance.selectedItem(), mass);
                        MODEL.instance.addSpring(spring);
                        MODEL.instance.selectedItem(mass);
                    }
                    else
                    {
                        var mass = MASS.create(_pixelsToMeters(exy));
                        MODEL.instance.addMass(mass);
                        MODEL.instance.selectedItem(mass);
                    }
                }
                else
                {
                    if (clickedItem.isFreeMass !== undefined)
                    {
                        if (MODEL.instance.selectedItem() &&
                            MODEL.instance.selectedItem().isFreeMass !== undefined)
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
            break;
        case MODEL.Modes.DELETE:
            if (e.type === "mousedown" && e.button === 0)
            {
                MODEL.instance.selectedItem(null);
                // delete clicked object
                var item = _getNearestItem(exy, _mouseSlopPx);
                if (item !== undefined)
                {
                    MODEL.instance.removeMass(item) ||
                        MODEL.instance.removeSpring(item);
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
