// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import * as hubs from "./hubs.js";
import { Stop } from "./parameters.js";
import * as sim from "../sim.js";

export let driveBase = [];

/**
 * A robotic vehicle with two powered wheels and an optional support wheel or
 * caster.
 *
 * By specifying the dimensions of your robot, this class makes it easy to
 * drive a given distance in millimeters or turn by a given number of degrees.
 *
 * Positive distances, radii, or drive speeds mean driving forward.  Negative
 * means backward.
 *
 * Positive angles and turn rates mean turning right.  Negative means left.
 * So when viewed from the top, positive means clockwise and negative means
 * counterclockwise.
 */
class _DriveBase
{
  // The various run modes of a drive base.
  modeIdle = 0;
  modeStraight = 1;
  modeTurn = 2;
  modeCurve = 3;
  modeDrive = 4;

  /**
   * A robotic vehicle with two powered wheels and an optional support wheel or
   * caster.
   *
   * By specifying the dimensions of your robot, this class makes it easy to
   * drive a given distance in millimeters or turn by a given number of
   * degrees.
   *
   * Positive distances, radii, or drive speeds mean driving forward.  Negative
   * means backward.
   *
   * Positive angles and turn rates mean turning right.  Negative means left.
   * So when viewed from the top, positive means clockwise and negative means
   * counterclockwise.
   *
   * @param left_motor The motor that drives the left wheel.
   *
   * @param right_motor The motor that drives the right wheel.
   *
   * @param wheel_diameter Diameter of the wheels, in mm.
   *
   * @param axle_track Distance between the points where both wheels touch the
   *                   ground, in mm.
   */
  constructor(left_motor, right_motor, wheel_diameter, axle_track)
  {
    this._left_motor = left_motor;
    this._right_motor = right_motor;
    this._wheel_diameter = wheel_diameter;
    this._axle_track = axle_track;
    this._use_gyro = false;

    this._straight_speed = 195;
    this._straight_acceleration = 733;
    this._turn_rate = 166;
    this._turn_rate_acceleration = 750;

    this._angle = 0;
    this._distance = 0;

    this._mode = this.modeIdle;
    this._target_distance = 0;
    this._start_angle = 0;
    this._target_angle = 0;
    this._target_radius = 0;

    this._idx = driveBase.length;

    driveBase.push(this);
  }

  /**
   * Drives straight for a given distance and then stops.
   *
   * @param distance Distance to travel, in mm.
   *
   * @param then What to do after coming to a standstill.
   *
   * @param wait Wait for the maneuver to complete before continuing with the
   *             rest of the program.
   */
  async straight(distance, then = Stop.HOLD, wait = true)
  {
    this._mode = this.modeStraight;
    this._target_distance = distance;
    this._target_angle = hubs._hub.imu.heading();

    if(wait)
    {
      await sim.waitForEvent(sim.baseEvent(this._idx));
    }
  }

  /**
   * Turns in place by a given angle and then stops.
   *
   * @param angle Angle of the turn, in deg.
   *
   * @param then What to do after coming to a standstill.
   *
   * @param wait Wait for the maneuver to complete before continuing with the
   *             rest of the program.
   */
  async turn(angle, then = Stop.HOLD, wait = true)
  {
    this._mode = this.modeTurn;
    this._start_angle = hubs._hub.imu.heading();
    this._target_angle = angle;

    if(wait)
    {
      await sim.waitForEvent(sim.baseEvent(this._idx));
    }
  }

  /**
   * Drives an arc along a circle of a given radius, by a given angle.
   *
   * @param radius Radius of the circle, in mm.
   *
   * @param angle Angle along the circle, in deg.
   *
   * @param then What to do after coming to a standstill.
   *
   * @param wait Wait for the maneuver to complete before continuing with the
   *             rest of the program.
   */
  async curve(radius, angle, then = Stop.HOLD, wait = true)
  {
    this._mode = this.modeCurve;
    this._target_radius = radius;
    this._start_angle = hubs._hub.imu.heading();
    if(radius < 0)
    {
      this._target_angle = this._start_angle - angle;
    }
    else
    {
      this._target_angle = this._start_angle + angle;
    }

    if(wait)
    {
      await sim.waitForEvent(sim.baseEvent(this._idx));
    }
  }

  /**
   * Configures the drive base speed and acceleration.
   *
   * If you give no arguments, this returns the current values as a tuple.
   *
   * The initial values are automatically configured based on your wheel
   * diameter and axle track.  They are selected such that your robot drives at
   * about 40% of its maximum speed.
   *
   * The speed values given here do not apply to the drive() method, since you
   * provide your own speed values as arguments in that method.
   *
   * @param straight_speed Straight-line speed of the robot, in mm/s.
   *
   * @param straight_acceleration Straight-line acceleration and deceleration
   *                              of the robot, in mm/s².  Provide a tuple with
   *                              two values to set acceleration and
   *                              deceleration separately.
   *
   * @param turn_rate Turn rate of the robot, in deg/s.
   *
   * @param turn_rate_acceleration Angular acceleration and deceleration of the
   *                               robot, in deg/s².  Provide a tuple with two
   *                               values to set acceleration and deceleration
   *                               separately.
   */
  settings(straight_speed, straight_acceleration, turn_rate,
           turn_rate_acceleration)
  {
    if(straight_speed > 488)
    {
      straight_speed = 488;
    }
    if(straight_acceleration > 9775)
    {
      straight_acceleration = 9775;
    }
    if(turn_rate > 500)
    {
      turn_rate = 500;
    }
    if(turn_rate_acceleration > 10000)
    {
      turn_rate_acceleration = 10000;
    }

    this._straight_speed = straight_speed;
    this._straight_acceleration = straight_acceleration;
    this._turn_rate = turn_rate;
    this._turn_rate_acceleration = turn_rate_acceleration;
  }

  /**
   * Gets the drive base speed and acceleration.
   *
   * @returns The drive base speed and acceleration as an array.
   */
  settings()
  {
    return([ this._straight_speed, this._straight_acceleration,
             this._turn_rate, this._turn_rate_acceleration]);
  }

  /**
   * Checks if an ongoing command or maneuver is done.
   *
   * @returns True if the command is done, False if not.
   */
  done()
  {
    return(this._mode === this.modeIdle);
  }

  /**
   * Starts driving at the specified speed and turn rate.  Both values are
   * measured at the center point between the wheels of the robot.
   *
   * @param speed Speed of the robot, in mm/s.
   *
   * @param turn_rate Turn rate of the robot, in deg/s.
   */
  drive(speed, turn_rate)
  {
    let speedL, speedR;

    // Set the mode to drive (updating the angle and distance in the
    // background).
    this._mode = this.modeDrive;

    // Limit the speed and turn rate if necessary.
    if((speed > 0) && (speed > this._straight_speed))
    {
      speed = this._straight_speed;
    }
    if((speed < 0) && (Math.abs(speed) > this._straight_speed))
    {
      speed = -this._straight_speed;
    }
    if((turn_rate > 0) && (turn_rate > this._turn_rate))
    {
      turn_rate = this._turn_rate;
    }
    if((turn_rate < 0) && (Math.abs(turn_rate > this._turn_rate)))
    {
      turn_rate = -this._turn_rate;
    }

    // Convert the speed from mm/s to deg/s.
    speed = (360 * speed) / (Math.PI * this._wheel_diameter);

    // Convert the turn rate from deg/s of the robot to deg/s of the wheel.
    turn_rate = turn_rate * this._axle_track / this._wheel_diameter;

    // See if the turn rate is zero (meaning the robot should drive straight).
    if(turn_rate === 0)
    {
      // Set the speed of both motor to the given speed.
      speedL = speed;
      speedR = speed;
    }

    // See if the speed is zero (meaning the robot should spin in place).
    else if(speed === 0)
    {
      // Run the left motor the sign of the turn rate and the right motor the
      // opposite way.
      speedL = turn_rate;
      speedR = -turn_rate;
    }

    // Otherwise, the robot is curving.
    else
    {
      // Adjust the speed by the turn rate with opposite signs so the robot
      // curves.
      speedL = speed + turn_rate;
      speedR = speed - turn_rate;
    }

    // Start the motors running at the computed speeds.
    this._left_motor.run(speedL);
    this._right_motor.run(speedR);
  }

  /**
   * Stops the robot by letting the motors spin freely.
   */
  stop()
  {
    // There is nothing to be done if the robot is not moving.
    if(this._mode !== this.modeIdle)
    {
      // Stop the drive motors.
      this._left_motor.stop();
      this._right_motor.stop();

      // Set the mode to idle.
      this._mode = this.modeIdle;

      // Send the drive base done event, so that any pending wait will be
      // completed (really shouldn't happen, since there is no way to call this
      // while waiting for a previous command; however, this is harmless either
      // way).
      sim.sendEvent(sim.baseEvent(this._idx));
    }
  }

  /**
   * Stops the robot by passively braking the motors.
   */
  brake()
  {
    // There is nothing to be done if the robot is not moving.
    if(this._mode !== this.modeIdle)
    {
      // Stop the drive motors.
      this._left_motor.stop();
      this._right_motor.stop();

      // Set the mode to idle.
      this._mode = this.modeIdle;

      // Send the drive base done event, so that any pending wait will be
      // completed (really shouldn't happen, since there is no way to call this
      // while waiting for a previous command; however, this is harmless either
      // way).
      sim.sendEvent(sim.baseEvent(this._idx));
    }
  }

  /**
   * Gets the estimated driven distance.
   *
   * @returns Driven distance since last reset, in mm.
   */
  distance()
  {
    return(this._distance);
  }

  /**
   * Gets the estimated rotation angle of the drive base.
   *
   * @returns Accumulated angle since last reset, in deg.
   */
  angle()
  {
    return(this._angle);
  }

  /**
   * Gets the state of the robot.
   *
   * @returns Array of distance, drive speed, angle, and turn rate of the
   *          robot.
   */
  state()
  {
    return([this._distance, 0, this._angle, 0]);
  }

  /**
   * Resets the estimated driven distance and angle to 0.
   */
  reset()
  {
    this._distance = 0;
    this._angle = 0;
  }

  /**
   * Checks if the drive base is currently stalled.
   *
   * It is stalled when it cannot reach the target speed or position, even with
   * the maximum actuation signal.
   *
   * @returns True if the drivebase is stalled, False if not.
   */
  stalled()
  {
    return(false);
  }

  /**
   * Choose True to use the gyro sensor for turning and driving straight.
   * Choose False to rely only on the motor’s built-in rotation sensors.
   *
   * @param use_gyro True to enable, False to disable.
   */
  use_gyro(use_gyro)
  {
    this._use_gyro = use_gyro;
  }
}

/**
 * A robotic vehicle with two powered wheels and an optional support wheel or
 * caster.
 *
 * By specifying the dimensions of your robot, this class makes it easy to
 * drive a given distance in millimeters or turn by a given number of degrees.
 *
 * Positive distances, radii, or drive speeds mean driving forward.  Negative
 * means backward.
 *
 * Positive angles and turn rates mean turning right.  Negative means left.
 * So when viewed from the top, positive means clockwise and negative means
 * counterclockwise.
 *
 * @param left_motor The motor that drives the left wheel.
 *
 * @param right_motor The motor that drives the right wheel.
 *
 * @param wheel_diameter Diameter of the wheels, in mm.
 *
 * @param axle_track Distance between the points where both wheels touch the
 *                   ground, in mm.
 *
 * @returns The object for controlling the drive base.
 */
export function
DriveBase(left_motor, right_motor, wheel_diameter, axle_track)
{
  return(new _DriveBase(left_motor, right_motor, wheel_diameter, axle_track));
}