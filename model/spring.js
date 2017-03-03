'use strict'

var SPRING = SPRING || {};

SPRING.create = (function(m1, m2, restlength, amplitude, phase, isBar)
{
// private
    var _m1 = m1;
    var _m2 = m2;
    var _restlength = restlength;
    var _amplitude = (amplitude == undefined)? 0 : amplitude;
    var _phase = (phase == undefined)? 0 : phase;
    var _isBar = (isBar == undefined)? false : isBar;
// public
    function __restlength()
    {
        let phase = _phase + MODEL.instance.wavePhase();
        return _restlength * (1 - Math.sin(phase)*_amplitude);
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

