'use strict'

// MASS represents an elastic connection between two masses in the MODEL.  It
// wraps all of the spring's physical properties and state.  It also tracks
// whether the spring is a muscle, which periodically changes its length
// according to the WAVE.
var SPRING = SPRING || {};

// Creates a new spring, given the masses at either end (m1 and m2) and the
// resting length of the unstressed spring measured in meters (restlength).  If
// restlength is not specified, it is calculated from the distance between m1
// and m2 at time of spring creation.  Optionally, muscle parameters can be
// specified, such as the amount of deflection (amplitude, which ranges from 0
// for no deflection, to 1 or -1 for maximum deflection) and the phase of the
// deflection in radians (phase).  A final optional parameter (isBar) specifies
// whether the spring collides with masses (TBD - Not yet implemented).
SPRING.create = (function(m1, m2, restlength, amplitude, phase, isBar, reflection, friction)
{
// private
    // The mass at one end of the spring
    var _m1 = m1;
    // The mass at the other end of the spring
    var _m2 = m2;
    // The unstressed length of the spring
    var _restlength = (restlength == undefined)?
            VECTOR.mag(VECTOR.sub(m2.s, m1.s)) : restlength;
    // The amplitude of the muscle, ranging from 0 for no deflection, to 1 for
    // maximum deflection, and -1 for maximum deflection 180 degrees out of
    // phase.
    var _amplitude = (amplitude == undefined)? 0 : amplitude;
    // The phase of the muscle in radians.
    var _phase = (phase == undefined)? 0 : phase;
    // True if the spring is a barspring (which collides with masses);
    // otherwise false.
    var _isBar = (isBar == undefined)? false : isBar;
// public
    var _reflection = (reflection == undefined)? 0 : reflection;
    var _friction = (friction == undefined)? 0 : friction;
    // Accessors
    function __restlength(restlength)
    {
        if (restlength !== undefined)
        {
            _restlength = restlength;
        }
        // If the spring is a muscle, its resting length varies depending
        // on the muscle parameters and on the WAVE amplitude and phase,
        // so must be calculated here.
        var phase = _phase + MODEL.instance.wavePhase();
        return _restlength * (1 - Math.sin(phase)*_amplitude*MODEL.instance.waveAmplitude());
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
    function __isBar(isBar)
    {
        if (isBar !== undefined)
        {
            _isBar = isBar;
        }
        return _isBar;
    }
    function __reflection(reflection)
    {
        if (reflection !== undefined)
        {
            _reflection = reflection;
        }
        return _reflection;
    }
    function __friction(friction)
    {
        if (friction !== undefined)
        {
            _friction = friction;
        }
        return _friction;
    }

    // Emit a simple object containing the spring parameters.  Used by
    // JSON.stringify() during model export.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
    function _toJSON()
    {
        // Instead of references to the mass objects, we emit their indices in
        // the MODEL masses array.  This is a reliable way of conveying the same
        // information, because the order of this array is preserved when the
        // model is exported and imported.
        if (!_isBar)
        {
            return {"m1": MODEL.instance.masses.indexOf(_m1),
                    "m2": MODEL.instance.masses.indexOf(_m2),
                    "restlength": _restlength,
                    "amplitude": _amplitude,
                    "phase": _phase};
        }
            else
        {
            return {"m1": MODEL.instance.masses.indexOf(_m1),
                    "m2": MODEL.instance.masses.indexOf(_m2),
                    "restlength": _restlength,
                    "amplitude": _amplitude,
                    "phase": _phase,
                    "isBar": _isBar,
                    "reflection": _reflection,
                    "friction": _friction};
        }
    }
    return {
        m1: _m1,
        m2: _m2,
        restlength: __restlength,
        amplitude: __amplitude,
        phase: __phase,
        isBar: __isBar,
        reflection: __reflection,
        friction: __friction,
        toJSON: _toJSON
    }
});

// Find whether a given item exposes all the same public members as a spring.
// If it looks like a spring, and quacks like a spring, then it is a spring.
// See:  https://en.wikipedia.org/wiki/Duck_typing
SPRING.isSpring = function(candidate)
{
    // If any of these members are undefined, then it isn't a spring.  The
    // "!!" is an ugly hack that coerces the return value to true or false.
    return (candidate !== undefined) && (candidate !== null) &&
           !!(candidate.m1 && candidate.m2 && candidate.restlength &&
           candidate.amplitude && candidate.phase && candidate.isBar &&
           candidate.toJSON);
}
