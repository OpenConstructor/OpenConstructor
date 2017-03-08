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

    // Check all the barsprings for collisions in the previous frame.
    function _collideBars(dt)
    {
        // Algorithm is O(ns), could be sped up to O((n + s) log n) fairly
        // trivially, but that appears to be counter to the goal of this project I think?

        // NOTE: There is a ton of repeated work because I wasn't sure
        // how best to cache mass positions. If there is a guarantee that
        // no masses can be spawned within a subtick, adding a stage pre-integration
        // to collect mass positions referenceable by index would be enough.
        // NOTE: limit one collision per mass per subtick.
        // Eh, this works for now I guess
        var impulses = [];
        // Right now we generate the bounding boxes of the movement of each
        // mass. This will be compared with the bounding boxes of the barsprings
        // to quickly eliminate the majority of cases where there isn't any
        // overlap between the two.
        var getMassBox = function(mass) {
            // NOTE: DO NOT MUTATE endPos
            var endPos = mass.s;
            var startPos = VECTOR.add(endPos, VECTOR.mul(mass.v, -dt));
            var minX = Math.min(endPos.x(), startPos.x());
            var maxX = Math.max(endPos.x(), startPos.x());
            var minY = Math.min(endPos.y(), startPos.y());
            var maxY = Math.max(endPos.y(), startPos.y());
            return {
                mass: mass,
                box: {
                    left: minX,
                    right: maxX,
                    top: maxY,
                    bottom: minY
                }
            };
        }

        var intersects = function(a, b) {
            if (a.right < b.left || a.left > b.right ||
                    a.top < b.bottom || a.bottom > b.top)
            {
                return false;
            }
              else
            {
                return true;
            }
        };
        var massBoxes = MODEL.instance.masses.map(getMassBox);

        MODEL.instances.springs.forEach(function(spring) {
            if (!spring.isBar())
            {
                return;
            }

            var m1Box = getMassBox(spring.m1);
            var m2Box = getMassBox(spring.m2);

            var minX = Math.min(m1Box.left, m2Box.left);
            var maxX = Math.max(m1Box.right, m2Box.right);
            var minY = Math.min(m1Box.bottom, m2Box.bottom);
            var maxY = Math.max(m1Box.top, m2Box.top);

            var springBox = {
                left: minX,
                right: maxX,
                top: maxY,
                bottom: minY
            };

            massBoxes.forEach(function(massBox) {
                if (intersects(massBox, springBox))
                {
                    // calculate the point of collision using the
                    // set of equations
                    // s_mass(t) = x*s_m1(t) + (1-x)*s_m2(t),
                    // which is nontrivially solvable, because it ends up
                    // being a system of parabolas, so let's use the somewhat
                    // simpler (and linearly solvable) case where we project
                    // s_mass(t) onto the normal of the spring, in the frame of
                    // one of the endpoints (modelling when the mass is collinear
                    // with the spring):
                    // (s_mass(t)-m1(t)).orth(m1(t)-m2(t)) = 0
                    // (mass.s - m1.s + (mass.v - m1.v)*t).orth(m1.s - m2.s + (m1.v - m2.v)*t) = 0
                    // let A = mass.s - m1.s, B = mass.v - m1.v, C = m1.s - m2.s, and D = m1.v - m2.v:
                    // (A + B*t).orth(C + D*t) = 0
                    // (Ax + Bx*t, Ay + By*t).(-Cy - Dy*t, Cx + Dx*t) = 0
                    //
                    // which turns into at^2 + bt + c = 0 for some a, b, c
                    //
                    // which you can then solve for t
                    // and see if either root of t (if -dt <= t <= 0) corresponds 
                    // to a moment when
                    // 0 <= s <= 1 (when the mass is between m1 and m2)
                    // if it does, we've found our moment of collision!
                    // TODO: all that math^^^
                    
                    // we can solve for the collision response by assuming
                    //   - conservation of momentum,
                    //   - conservation of angular momentum (at two points), and
                    //   - assuming the collision is characterized by e and mu so that
                    //      v_m_COM_after . normal = -e * (v_m_COM_before . normal)
                    //      v_m_COM_after . tangent = mu * (v_m_COM_before . tangent)
                    //  this gives us six unknowns for the three impulse vectors,
                    //  so that math should check out
                    //
                    //  let j_m, j_1, and j_2 represent the three impulses that will
                    //  affect the three masses involved in this collision
                    //  let's do all the math using normal and tangent as the basis vectors
                    //  so the conservation of momentum is
                    //  sum m_i*v_iafter = sum m_i*v_ibefore
                    //
                    //  TODO: all that math^^^

                    // now push all three impulses into the impulse array
                    // this is so that more simultaneous collisions can take place
                    // in a sensible-ish manner; there's really no nice solution
                    // that also guarantees halting
                    // TODO: a little programming
                }
            });
        });

        impulses.forEach(function(impulse) {
            var mass = impulse.mass;
            mass.s.add(VECTOR.mul(mass.v, impulse.time));
            mass.v.add(impulse.amount);
            mass.s.add(VECTOR.mul(mass.v, impulse.time));
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
        // collide more
        _collideBars(dt);
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

