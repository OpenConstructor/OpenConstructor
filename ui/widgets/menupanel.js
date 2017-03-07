'use strict'

// MENUPANEL is the WIDGET at the top of the screen containing the mode and
// gravity controls.
var MENUPANEL = MENUPANEL || {};

// Creates the panel, with top-left corner at the specified coordinates (x, y)
// and with the specified width and height (w, h), measured in pixels from the
// top-left corner of the browser's client.
MENUPANEL.create = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    // MENUPANEL needs children in order to work.
    var _children = [
        // The save button
        BUTTON.create(x, y, 64, h,
            function(mouseButton) {
                MODEL.instance.exportModelToURL();
            },
            function() {return "save"}),
        // The simulation mode button
        BUTTON.create(x+64, y, (w-64)/3, h,
            function(mouseButton) {
                // When the button is pressed, deselect any spring or mass that
                // may be currently selected.  (If you don't do this, you might
                // immediately start drawing a spring when you enter construct
                // mode, which is unexpected to users.)
                //
                // "null" is used instead of "undefined" because "undefined"
                // cannot be distinguished from a missing parameter, and is
                // ignored by the accessor function.
                MODEL.instance.selectedItem(null);
                // Rotate through the modes when left-clicked.
                // Rotate backwards through the modes when right-clicked.
                switch (MODEL.instance.mode())
                {
                case MODEL.Modes.SIMULATE:
                    MODEL.instance.mode((mouseButton == 0)?
                        MODEL.Modes.CONSTRUCT :
                        MODEL.Modes.DELETE);
                    break;
                case MODEL.Modes.CONSTRUCT:
                    MODEL.instance.mode((mouseButton == 0)?
                        MODEL.Modes.DELETE :
                        MODEL.Modes.SIMULATE);
                    break;
                case MODEL.Modes.DELETE:
                    MODEL.instance.mode((mouseButton == 0)?
                        MODEL.Modes.SIMULATE :
                        MODEL.Modes.CONSTRUCT);
                    break;
                }
            },
            MODEL.instance.mode),
        // The wave mode button
        BUTTON.create(x+(w-64)/3+64, y, (w-64)/3, h,
            function(mouseButton) {
                // When the button is pressed, forget which wall was most
                // recently hit by a auto-reversing model, so it will reverse
                // next time it hits any wall.  It's a good idea to reset the
                // state because you're probably hitting the button to
                // transition this model into, or out of, auto-reverse mode.
                MODEL.instance.lastWall(MODEL.Walls.UNKNOWN);
                // Rotate through the wave modes.
                switch (MODEL.instance.waveMode())
                {
                case MODEL.WaveModes.AUTOREVERSE:
                    MODEL.instance.waveMode((mouseButton == 0)?
                        MODEL.WaveModes.FORWARD :
                        MODEL.WaveModes.MANUAL);
                    break;
                case MODEL.WaveModes.FORWARD:
                    MODEL.instance.waveMode((mouseButton == 0)?
                        MODEL.WaveModes.REVERSE :
                        MODEL.WaveModes.AUTOREVERSE);
                    break;
                case MODEL.WaveModes.REVERSE:
                    MODEL.instance.waveMode((mouseButton == 0)?
                        MODEL.WaveModes.MANUAL :
                        MODEL.WaveModes.FORWARD);
                    break;
                case MODEL.WaveModes.MANUAL:
                    MODEL.instance.waveMode((mouseButton == 0)?
                        MODEL.WaveModes.AUTOREVERSE :
                        MODEL.WaveModes.REVERSE);
                    break;
                }
            },
            MODEL.instance.waveMode),
        // The gravity button
        BUTTON.create(x+2*(w-64)/3+64, y, (w-64)/3, h,
            function(mouseButton) {
                switch (MODEL.instance.gravityDirection())
                {
                case MODEL.GravityDirections.DOWN:
                    MODEL.instance.gravityDirection((mouseButton == 0)?
                        MODEL.GravityDirections.OFF :
                        MODEL.GravityDirections.UP);
                    break;
                case MODEL.GravityDirections.OFF:
                    MODEL.instance.gravityDirection((mouseButton == 0)?
                        MODEL.GravityDirections.UP :
                        MODEL.GravityDirections.DOWN);
                    break;
                case MODEL.GravityDirections.UP:
                    MODEL.instance.gravityDirection((mouseButton == 0)?
                        MODEL.GravityDirections.DOWN :
                        MODEL.GravityDirections.OFF);
                    break;

                }
            },
            MODEL.instance.gravityDirection)
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
    // Draw the g/f/k sliders.  Called once per frame.
    function _draw(ctx)
    {
        // Draw self
        UTIL.drawBoundingRectangle(ctx, _x, _y, _w, _h);
        // Draw children
        _children.forEach(function(child) {
            child.draw(ctx);
        });
    }
    function _signal(e, exy)
    {
        _children.forEach(function(child) {
            child.signal(e, exy);
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
