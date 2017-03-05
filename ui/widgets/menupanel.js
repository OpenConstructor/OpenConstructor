'use strict'

var MENUPANEL = MENUPANEL || {};

MENUPANEL.create = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    var _children = [
        BUTTON.create(x, y, 64, h,
            function(mouseButton) {
                MODEL.instance.exportModelToURL();
            },
            function() {return "save"}),
        BUTTON.create(x+64, y, (w-64)/3, h,
            function(mouseButton) {
                MODEL.instance.selectedItem(null);
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
        BUTTON.create(x+(w-64)/3+64, y, (w-64)/3, h,
            function(mouseButton) {
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
