'use strict'

var SPRING = SPRING || {};

SPRING.spring = (function(m1, m2, restlength, amplitude, phase, isBar)
{
// private
    var _m1 = m1;
    var _m2 = m2;
    var _restlength = restlength;
    var _amplitude = amplitude;
    var _phase = phase;
    var _isBar = (isBar == undefined)? false : isBar;

// public
    function __restlength()
    {
        return _restlength;
    }
    function __amplitude(amplitude)
    {
        if (amplitude !== undefined)
        {
            _amplitude = amplitude;
        }
        return _amplitude;
    }
    function __phase(phase)
    {
        if (phase !== undefined)
        {
            _phase = phase;
        }
        return _phase;
    }
    function __isBar()
    {
        return _isBar;
    }
    return {
        m1: _m1,
        m2: _m2,
        restlength: __restlength,
        amplitude: __amplitude,
        phase: __phase,
        isBar: __isBar
    }
});

