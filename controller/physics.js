'use strict'

// PHYSICS defines a singleton containing the physics engine.  The engine is called
// once per frame (via its tick() function) and updates the positions of all masses
// and springs in the MODEL.
var PHYSICS = PHYSICS || {};

// Creates the physics engine.
PHYSICS.instance = (function()
{
// private
    // Checks whether a vector has a NaN component.  It is futile to
    // directly compare (value === NaN) because all comparisons with NaN return
    // false.  Hence we compare the value against itself, which will only
    // return false if it is NaN.  This function is not used normally but is
    // provided for ease of debugging in case you start getting NaNs
    // everywhere.
    function _checkNan(v)
    {
        if (v.x() != v.x() || 
            v.y() != v.y())
        {
            v.set(0, 0);
        }
    }
    // For each mass in the model, zero the mass's force accumulator.
    function _clearForces()
    {
        MODEL.instance.masses.forEach(function(mass) {
            mass.f.set(0, 0);
        });
    }
    // For each mass in the model, apply gravity.
    function _gForce()
    {
        MODEL.instance.masses.forEach(function(mass) {
            // "g"ravity
            var gravity = undefined;
            switch (MODEL.instance.gravityDirection())
            {
            case MODEL.GravityDirections.DOWN:
                gravity = MODEL.instance.g();
                break;
            case MODEL.GravityDirections.UP:
                gravity = -1 * MODEL.instance.g();
                break;
            case MODEL.GravityDirections.OFF:
                gravity = 0;
                break;
            }
            mass.f.y(mass.f.y() + gravity);
        });
    }
    // For each mass in the model, apply friction.
    function _fForce()
    {
        MODEL.instance.masses.forEach(function(mass) {
            // "f"riction (damping) opposes velocity
            mass.f.add(VECTOR.mul(mass.v, -1 * MODEL.instance.f()));
        });
    }
    // For each spring in the model, apply springwise force to both masses in
    // the spring.
    function _kForce()
    {
        MODEL.instance.springs.forEach(function(spr) {
            // hoo"k"e's law (springiness)
            var ds = VECTOR.sub(spr.m2.s, spr.m1.s);
            var length = VECTOR.mag(ds); // distance between m1 and m2
            var dh = VECTOR.hat(ds);     // direction from m1 to m2
            // hooke's law:  F=kX
            // here, positive magnitude = inward (attraction to other mass)
            var fMag = MODEL.instance.k() * (length - spr.restlength());
            spr.m1.f.add(VECTOR.mul(dh, fMag));
            spr.m2.f.add(VECTOR.mul(dh, -fMag));

        });
    }
    // Given the force on each mass, calculate each mass's new acceleration,
    // velocity and position.
    function _integrate(dt)
    {
        var state = { dt: dt }
        MODEL.instance.masses.forEach(function(mass) {
            // F=ma -> a=F/m
            // Euler's method
            if (mass.isFreeMass())
            {
                // The order is important.  We must update each accumulator
                // using the value calculated last frame (not this frame).
                // Therefore we must add s += v before calculating the new v,
                // etc.
                mass.s.add(VECTOR.mul(mass.v, this.dt));
                mass.v.add(VECTOR.mul(mass.a, this.dt));
                mass.a = VECTOR.div(mass.f, mass.m());
            }
        }, state);
    }
    // For each mass, check whether the mass has collided with the model
    // boundary, and update its position and velocity to make it bounce off.
    // If colliding with the left and right walls, perform auto-reverse.
    function _collide()
    {
        MODEL.instance.masses.forEach(function(mass) {
            // floor and ceiling
            if(mass.s.y() < 0 || mass.s.y() > MODEL.instance.height())
            {
                mass.s.y((mass.s.y() < 0)? 0 : MODEL.instance.height());
                // hack: "friction" directly affects velocity which is not
                // how static friction works in the real world.
                mass.v.x(mass.v.x() * (1 - MODEL.instance.surfaceFriction()));
                mass.v.y(mass.v.y() * MODEL.instance.surfaceReflection());
            }
            // left and right wall
            if(mass.s.x() < 0 || mass.s.x() > MODEL.instance.width())
            {
                mass.s.x(mass.s.x() < 0? 0 : MODEL.instance.width());
                // hack: "friction" directly affects velocity which is not
                // how static friction works in the real world.
                mass.v.y(mass.v.y() * (1 - MODEL.instance.surfaceFriction()));
                mass.v.x(mass.v.x() * MODEL.instance.surfaceReflection());
                // If auto-reverse mode is on, hitting a wall should make the
                // model reverse direction, but only if it isn't the same wall
                // the model last hit.  Without this "debouncing", models will
                // constantly switch direction as long as they are touching a
                // wall.
                if (MODEL.instance.waveMode() === MODEL.WaveModes.AUTOREVERSE)
                {
                    if (mass.s.x() <= 0)
                    {
                        // hit left wall
                        if (MODEL.instance.lastWall() !== MODEL.Walls.LEFT)
                        {
                            MODEL.instance.lastWall(MODEL.Walls.LEFT);
                            MODEL.instance.waveDirection(MODEL.instance.waveDirection()*-1);
                        }
                    }
                    else
                    {
                        // hit right wall
                        if (MODEL.instance.lastWall() !== MODEL.Walls.RIGHT)
                        {
                            MODEL.instance.lastWall(MODEL.Walls.RIGHT);
                            MODEL.instance.waveDirection(MODEL.instance.waveDirection()*-1);
                        }
                    }
                }
            }
        });
    }
    // Run a single tick of the physics engine.  Takes (dt), which is the
    // amount of simulated time measured in seconds.
    function _subtick(dt)
    {
        // calculate forces
        _clearForces();
        _gForce();
        _fForce();
        _kForce();
        // apply forces
        _integrate(dt);
        // collide
        _collide();
    }
// public
    // Should be called once per frame.
    function _tick(dt)
    {
        // The physics engine is run with lots of oversampling and frameskip in
        // order to make springs look sufficiently "rigid".  This wrapper
        // function achieves this by calling the primitive "tick" function
        // many times per frame.
        var kFrameskip = 10;
        var kOversampling = 10;
        for (var i = 0; i < kFrameskip; i++)
        {
            for (var j = 0; j < kOversampling; j++)
            {
                _subtick(dt/kOversampling);
            }
        }
    }
    return {
        tick: _tick
    };
})();
// singleton

