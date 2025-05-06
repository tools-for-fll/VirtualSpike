// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import * as Display from "./Display.js";
import * as Editor from "./Editor.js";
import * as hubs from "./pybricks/hubs.js";
import * as parameters from "./pybricks/parameters.js";
import * as pupdevices from "./pybricks/pupdevices.js";
import * as robotics from "./pybricks/robotics.js";
import * as umath from "./micropython/umath.js";

/**
 * The horizontal (east-west) position of the robot, in inches (with zero being
 * in the middle of the table).
 */
let robotX;

/**
 * The vertical (north-south) position of the robot, in inches (with zero being
 * in the middle of the table).
 */
let robotY;

/**
 * The rotation of the robot, in degrees.
 */
let robotR;

/**
 * The motor that drives the left side of the robot.
 */
let robotLeft;

/**
 * The motor that drives the right side of the robot.
 */
let robotRight;

/**
 * The diameter of the robot wheels, in millimeters.
 */
let robotWheel;

/**
 * The track width of the robot, in millimeters.
 */
let robotTrack;

/**
 * The previous time that the step function was called.  When zero, it has not
 * been called yet.
 */
let previousTime = 0;

/**
 * The offset between the robot's field-centric heading and the IMU's "start of
 * program"-centric heading.
 */
let imuOffset = 0;

/**
 * A boolean that is **true** when the simulation is paused.
 */
let paused = false;

/**
 * Resets the robot simulation.
 *
 * @param soft A boolean that is **true** if a soft reset should be performed
 *             (maintaining the current set of devices, just resetting their
 *             internal state) or **false** if a hard reset should be performed
 *             (removing all devices).
 */
export function
reset(soft)
{
  let tokens, idx;

  // See if a soft reset has been requested.
  if(soft)
  {
    // For a soft reset, loop over all the devices.
    for(let port = parameters.Port.A; port <= parameters.Port.F; port++)
    {
      // If the device attached to this port is a motor, reset its angle to
      // zero.
      if(pupdevices.deviceType[port] === pupdevices.DeviceType.Motor)
      {
        pupdevices.devicesUsed[port].reset_angle(0);
      }
    }

    // Loop over all the drive bases.
    for(let idx = 0; idx < robotics.driveBase.length; idx++)
    {
      // Reset the drive base angle and distance to zero.
      robotics.driveBase[idx].reset();
    }
  }
  else
  {
    // Loop through all the ports.
    for(let port = parameters.Port.A; port <= parameters.Port.F; port++)
    {
      // See if there is a Motor connected to this port.
      if(pupdevices.deviceType[port] === pupdevices.DeviceType.Motor)
      {
        // Send the completion event for this port.  This might be a harmless
        // NOP.
        sendEvent(portEvent(pupdevices.devicesUsed[port]._port));
      }
    }

    // Loop through all the drive bases.
    //
    for(let base = 0; base < robotics.driveBase.length; base++)
    {
      // Send the completion event for this drive base.  This might be a
      // harmless NOP.
      sendEvent(baseEvent(robotics.driveBase[base]._idx));
    }

    // For a hard reset, empty all the device arrays.
    while(pupdevices.deviceType.length !== 0)
    {
      pupdevices.deviceType.pop();
    }
    while(pupdevices.devicesUsed.length !== 0)
    {
      pupdevices.devicesUsed.pop();
    }
    while(robotics.driveBase.length !== 0)
    {
      robotics.driveBase.pop();
    }
  }

  // Set the starting position from the source.
  [ robotX, robotY, robotR ] = Editor.robotStartPosition();

  // Set the left motor from the source.
  robotLeft = Editor.robotLeftMotor();

  // Set the right motor from the source.
  robotRight = Editor.robotRightMotor();

  // Set the wheel diameter from the source.
  robotWheel = Editor.robotWheelDiameter();

  // Set the wheel track from the source.
  robotTrack = Editor.robotWheelTrack();

  // Update the position of the robot.
  Display.setRobotPosition(robotX, robotY, robotR);

  // Update the gyro sensor in the hub.
  imuOffset = robotR;
  hubs._hub.imu.reset_heading(0);

  // Reset the previous time so that the simulation starts over from scratch.
  previousTime = 0;

  // The simulation is not paused by default.
  paused = false;
}

/**
 * Pauses execution of the simulation.
 */
export function
pause()
{
  paused = true;
}

/**
 * Resumes execution of the simulation.
 */
export function
resume()
{
  paused = false;
}

/**
 * Determines if the simulation is paused.
 *
 * @returns **true** if the simulation is paused and **false** if it is
 *          running.
 */
export function
isPaused()
{
  return(paused);
}

/**
 * Updates a motor.
 *
 * @param motor The Motor object for the motor to be updated.
 *
 * @param delta The amount of time that has passed, in ms.
 */
function
updateMotor(motor, delta)
{
  // See if this is the idle mode.
  if(motor._mode == motor.modeIdle)
  {
    // The motor is no longer moving.
    motor._delta = 0;
  }

  // See if this is the run mode.
  else if(motor._mode === motor.modeRun)
  {
    // Increment the motor angle by the run speed.
    motor._delta = (motor._speed * delta) / 1000;
    motor._angle += motor._delta;
  }

  // See if this is the DC mode.
  else if(motor._mode === motor.modeDC)
  {
    // Increment the motor angle by the run speed, with a bit of randomness
    // added (since the DC mode is an open-loop mode).
    motor._delta = (motor._speed * delta * ((Math.random() / 5) + 0.9)) / 1000;
    motor._angle += motor._delta;
  }

  // See if this is the run time mode.
  else if(motor._mode === motor.modeRunTime)
  {
    // See if the time delta is less than the remaining time.
    if(delta < motor._time)
    {
      // Increment the angle for the entire time period.
      motor._delta = (motor._speed * delta) / 1000;
      motor._angle += motor._delta;

      // Decrement the time left to run.
      motor._time -= delta;
    }
    else
    {
      // Increment the angle for the remaining time period.
      motor._delta = (motor._speed * motor._time) / 1000;
      motor._angle += motor._delta;

      // The request is complete, so move to the idle state.
      motor._mode = motor.modeIdle;

      // Send the completion event so the Promise can complete.
      sendEvent(portEvent(motor._port));
    }
  }

  // See if this is the run angle mode.
  else if(motor._mode === motor.modeRunAngle)
  {
    // Compute how far the motor moved in this time period.
    let step = (motor._speed * delta) / 1000;

    // See if the rotation angle is negative.
    if(motor._rotation_angle < 0)
    {
      // See if the remaining rotation is greater than the how far the motor
      // moved.
      if(Math.abs(motor._rotation_angle) >= step)
      {
        // Decrement the motor angle by how far it moved.
        motor._delta = -step;
        motor._angle -= step;

        // Decrement the remaining rotation by how far the motor moved.
        motor._rotation_angle += step;
      }
      else
      {
        // Decrement the motor angle by the remaining rotation (which is
        // negative, hence the addition).
        motor._delta = motor._rotation_angle;
        motor._angle += motor._rotation_angle;

        // Set the remaining rotation to zero as the move is complete.
        motor._rotation_angle = 0;
      }
    }
    else
    {
      // See if the remaining rotation is greater than the how far the motor
      // moved.
      if(motor._rotation_angle >= step)
      {
        // Increment the motor angle by how far it moved.
        motor._delta = step;
        motor._angle += step;

        // Decrement the remaining rotation by how far the motor moved.
        motor._rotation_angle -= step;
      }
      else
      {
        // Increment the motor angle by the remaining rotation.
        motor._delta = motor._rotation_angle;
        motor._angle += motor._rotation_angle;

        // Set the remaining rotation to zero as the move is complete.
        motor._rotation_angle = 0;
      }
    }

    // See if the move is complete.
    if(motor._rotation_angle === 0)
    {
      // The request is complete, so move to the idle state.
      motor._mode = motor.modeIdle;

      // Send the completion event so the Promise can complete.
      sendEvent(portEvent(motor._port));
    }
  }

  // See if this is the track target mode.
  else if(motor._mode === motor.modeTrackTarget)
  {
    // Compute how far the motor turned during this time period.
    let step = (motor.control._limit_speed * delta) / 1000;

    // See if the target angle is less than the current angle.
    if(motor._rotation_angle < motor._angle)
    {
      // See if the different in the target angle and current angle is less
      // than how far the motor turned.
      if((motor._angle - motor._rotation_angle) < step)
      {
        // Set the angle to the target angle.
        motor._delta = motor._angle - motor._rotation_angle;
        motor._angle = motor._rotation_angle;
      }
      else
      {
        // Decrement the motor angle by how far the motor turned.
        motor._delta = -step;
        motor._angle -= step;
      }
    }
    else
    {
      // See if the different in the target angle and current angle is less
      // than how far the motor turned.
      if((motor._rotation_angle - motor._angle) < step)
      {
        // Set the angle to the target angle.
        motor._delta = motor._rotation_angle - motor._angle;
        motor._angle = motor._rotation_angle;
      }
      else
      {
        // Increment the motor angle by how far the motor turned.
        motor._delta = step;
        motor._angle += step;
      }
    }
  }
}

/**
 * Updates all of the low level devices connected to the hub.
 *
 * @param delta The amount of time that has passed, in ms.
 */
function
updateDevices(delta)
{
  // Loop through all the ports.
  for(let port = parameters.Port.A; port <= parameters.Port.F; port++)
  {
    // If there is a Motor connected to this port, update it now.
    if(pupdevices.deviceType[port] === pupdevices.DeviceType.Motor)
    {
      updateMotor(pupdevices.devicesUsed[port], delta);
    }
  }
}

/**
 * Update the position and rotation of the robot based on changes to the
 * motors.
 */
function
updateRobot()
{
  // Update the position and rotation of the robot based on the drive motor
  // movements (if any).
  if((robotLeft != -1) &&
     (pupdevices.deviceType[robotLeft] === pupdevices.DeviceType.Motor) &&
     (robotRight != -1) &&
     (pupdevices.deviceType[robotRight] === pupdevices.DeviceType.Motor))
  {
    // Get the amount of rotation of the two drive motors.
    let deltaL = pupdevices.devicesUsed[robotLeft]._delta;
    let deltaR = pupdevices.devicesUsed[robotRight]._delta;

    // Scale the rotation to simulate the slip that occurs with a real robot.
    deltaL *= 0.9825;
    deltaR *= 0.9825;

    // Convert the rotation into inches.
    deltaL = (deltaL * robotWheel * Math.PI) / (25.4 * 360);
    deltaR = (deltaR * robotWheel * Math.PI) / (25.4 * 360);

    // See if the two motors rotated by the same amount, meaning the robot
    // drove straight (either forward or backward).
    if(deltaL === deltaR)
    {
      // Update the robot position by moving it along the current heading by
      // the amount that it moved.
      robotX += deltaL * Math.cos(robotR * Math.PI / 180);
      robotY += deltaL * Math.sin(robotR * Math.PI / 180);
    }

    // See if the left motor rotated less thean the right motor.
    else if(Math.abs(deltaL) < Math.abs(deltaR))
    {
      // Compute the ratio of the motor rotations, as a value between -1 and 1.
      let ratio = deltaL / deltaR;

      // Compute the diameter of the circle being followed by the outer (right)
      // wheel.
      let douter = (2 * (robotTrack / 25.4)) / (1 - ratio);

      // Compute the number of degrees the outer (right) wheel traveled along
      // its circle.
      let a = (360 * deltaR) / (douter * Math.PI);

      // Compute the diameter of the circle being followed by the center of the
      // robot.
      let drobot = douter - (robotTrack / 25.4);

      // Compute the center of the circle being followed by the center of the
      // robot.
      let cx = robotX + (drobot * Math.cos((robotR + 90) * Math.PI / 180) / 2);
      let cy = robotY + (drobot * Math.sin((robotR + 90) * Math.PI / 180) / 2);

      // Translate the position of the robot such that the center of the circle
      // it is following is at the origin.
      let rx = robotX - cx;
      let ry = robotY - cy;

      // Robot the robot around the circle that it is following by the number
      // of degrees that it traveled.
      let nx = ((rx * Math.cos(a * Math.PI / 180)) -
                (ry * Math.sin(a * Math.PI / 180)));
      let ny = ((rx * Math.sin(a * Math.PI / 180)) +
                (ry * Math.cos(a * Math.PI / 180)));

      // Translate the position of the robot back to original center of the
      // circle it is following.
      robotX = nx + cx;
      robotY = ny + cy;

      // Increase the robot rotation by the number of degrees it just traveled.
      robotR += a;
    }

    // Otherwise, the left motor rotated more than the right motor.
    else
    {
      // Compute the ratio of the motor rotations, as a value between -1 and 1.
      let ratio = deltaR / deltaL;

      // Compute the diameter of the circle being followed by the outer (left)
      // wheel.
      let douter = (2 * (robotTrack / 25.4)) / (1 - ratio);

      // Compute the number of degrees the outer (left) wheel traveled along
      // its circle.
      let a = -(360 * deltaL) / (douter * Math.PI);

      // Compute the diameter of the circle being followed by the center of the
      // robot.
      let drobot = douter - (robotTrack / 25.4);

      // Compute the center of the circle being followed by the center of the
      // robot.
      let cx = robotX + (drobot * Math.cos((robotR - 90) * Math.PI / 180) / 2);
      let cy = robotY + (drobot * Math.sin((robotR - 90) * Math.PI / 180) / 2);

      // Translate the position of the robot such that the center of the circle
      // it is following is at the origin.
      let rx = robotX - cx;
      let ry = robotY - cy;

      // Robot the robot around the circle that it is following by the number
      // of degrees that it traveled.
      let nx = ((rx * Math.cos(a * Math.PI / 180)) -
                (ry * Math.sin(a * Math.PI / 180)));
      let ny = ((rx * Math.sin(a * Math.PI / 180)) +
                (ry * Math.cos(a * Math.PI / 180)));

      // Translate the position of the robot back to original center of the
      // circle it is following.
      robotX = nx + cx;
      robotY = ny + cy;

      // Increase the robot rotation by the number of degrees it just traveled.
      robotR += a;
    }
  }

  // Update the position of the robot.
  Display.setRobotPosition(robotX, robotY, robotR);

  // Update the gyro sensor in the hub.
  hubs._hub.imu.reset_heading(imuOffset - robotR);
}

/**
 * Updates the drive base.
 *
 * @param delta The amount of time that has passed, in ms.
 */
function
updateDriveBase(delta)
{
  // Loop through the drive bases (should really be only one...).
  for(let idx = 0; idx < robotics.driveBase.length; idx++)
  {
    // Get this drive base.
    let driveBase = robotics.driveBase[idx];

    // Skip this drive base if it is in idle mode.
    if(driveBase._mode === driveBase.modeIdle)
    {
      continue;
    }

    // See if this drive base is in straight mode.
    if(driveBase._mode === driveBase.modeStraight)
    {
      // Get the change in the left and right motors.
      let deltaL = driveBase._left_motor._delta;
      let deltaR = driveBase._right_motor._delta;

      // Average the two motors.
      let delta = (deltaL + deltaR) / 2;

      // Compute the distance the robot drove.
      let distance = (driveBase._wheel_diameter * Math.PI * delta) / 360;

      // Increment the distance by the distance the robot just drove.
      driveBase._distance += distance;

      // See if the distance is less than the remaining distance to travel.
      if(((distance < 0) && (distance <= driveBase._target_distance)) ||
         ((distance > 0) && (distance >= driveBase._target_distance)))
      {
        // Stop the drive motors.
        driveBase._left_motor.stop();
        driveBase._right_motor.stop();

        // Set the mode to idle.
        driveBase._mode = driveBase.modeIdle;
      }
      else
      {
        // Decrement the distance to travel by the distance the robot just
        // drove.
        driveBase._target_distance -= distance;

        // Get the speed to drive each wheel of the robot.
        let speedL = umath.copysign(driveBase._straight_speed,
                                    driveBase._target_distance);
        let speedR = speedL;

        // If using the gyro, adjust the speeds based on any drift of the
        // robot.
        if(driveBase._use_gyro)
        {
          // TODO Implement use_gyro
        }

        // Drive the robot.
        driveBase._left_motor.run(speedL);
        driveBase._right_motor.run(speedR);
      }
    }

    // See if this drive base is in turn mode.
    if(driveBase._mode === driveBase.modeTurn)
    {
      // Get the change in the left and right motors.
      let deltaL = driveBase._left_motor._delta;
      let deltaR = driveBase._right_motor._delta;

      // Average the two motors.  The subtraction is because they are moving in
      // opposite directions; the normal addition formulation would result in
      // zero (on average).
      let delta = (deltaL - deltaR) / 2;

      // Determine how far the robot has turned.
      let angle = (delta * driveBase._wheel_diameter) / driveBase._axle_track;

      // Increment the drive base angle by the amount the robot just turned.
      driveBase._angle += angle;

      // See if the angle turned is less than the remaining angle to turn.
      if(((angle < 0) && (angle < driveBase._target_angle)) ||
         ((angle > 0) && (angle > driveBase._target_angle)))
      {
        // Stop the drive motors.
        driveBase._left_motor.stop();
        driveBase._right_motor.stop();

        // Set the mode to idle.
        driveBase._mode = driveBase.modeIdle;
      }
      else
      {
        // Decrement the angle to turn by the angle the robot just turned.
        driveBase._target_angle -= angle;

        // Get the speed to drive each wheel of the robot.
        let speedL = umath.copysign(driveBase._turn_rate,
                                    driveBase._target_angle);
        let speedR = -speedL;

        // If using the gyro, adjust the speeds based on any drift of the
        // robot.
        if(driveBase._use_gyro)
        {
          // TODO Implement use_gyro
        }

        // Spin the robot.
        driveBase._left_motor.run(speedL);
        driveBase._right_motor.run(speedR);
      }
    }

    // See if this drive base is in curve mode.
    if(driveBase._mode === driveBase.modeCurve)
    {
      let ratio, dI, dO, angle;

      // Get the change in the left and right motors.
      let deltaL = driveBase._left_motor._delta;
      let deltaR = driveBase._right_motor._delta;

      // Average the two motors.
      let delta = (deltaL + deltaR) / 2;

      // Compute the distance the robot drove.
      let distance = (driveBase._wheel_diameter * Math.PI * delta) / 360;

      // Increment the distance by the distance the robot just drove.
      driveBase._distance += distance;

      // Average the two motors.  The subtraction is because they are moving in
      // opposite directions; the normal addition formulation would result in
      // zero (on average).
      delta = (deltaL - deltaR) / 2;

      // Determine how far the robot has turned.
      angle = (delta * driveBase._wheel_diameter) / driveBase._axle_track;

      // Increment the drive base angle by the amount the robot just turned.
      driveBase._angle += angle;

      // See if the robot was not moving.
      if((deltaL == 0) && (deltaR == 0))
      {
        // The angle the robot curved is zero.
        angle = 0;
      }

      // See if the right robot motor turned more than the left robot motor.
      else if(Math.abs(deltaL) < Math.abs(deltaR))
      {
        // Compute the angle that the robot curved to the left.
        ratio = deltaL / deltaR;
        dI = (2 * ratio * driveBase._axle_track) / (1 - ratio);
        dO = dI + (2 * driveBase._axle_track);
        angle = (-deltaR * driveBase._wheel_diameter) / dO;
      }

      // Otherwise, the left robot motor turned more than the right robot
      // motor.
      else
      {
        // Compute the angle that the robot curved to the right.
        ratio = deltaR / deltaL;
        dI = (2 * ratio * driveBase._axle_track) / (1 - ratio);
        dO = dI + (2 * driveBase._axle_track);
        angle = (deltaL * driveBase._wheel_diameter) / dO;
      }

      // See if this movement crossed the target angle.
      if(((driveBase._start_angle < driveBase._target_angle) &&
          ((driveBase._start_angle + angle) > driveBase._target_angle)) ||
         ((driveBase._start_angle > driveBase._target_angle) &&
          ((driveBase._start_angle + angle) < driveBase._target_angle)))
      {
        // Stop the drive motors.
        driveBase._left_motor.stop();
        driveBase._right_motor.stop();

        // Set the mode to idle.
        driveBase._mode = driveBase.modeIdle;
      }
      else
      {
        let speedL, speedR;

        // Increment the starting angle by the amount the robot just curved.
        driveBase._start_angle += angle;

        // Compute the ratio of the motors, based on the radius of the curve.
        dO = (2 * Math.abs(driveBase._target_radius)) + driveBase._axle_track;
        ratio = (dO - (2 * driveBase._axle_track)) / dO;

        // A negative radius moves the robot backward.
        if(driveBase._target_radius < 0)
        {
          // Curve the robot the appropriate direction based on the relation of
          // the current angle to the target angle, while moving backward.
          if(driveBase._start_angle < driveBase._target_angle)
          {
            speedR = -driveBase._straight_speed;
            speedL = speedR * ratio;
          }
          else
          {
            speedL = -driveBase._straight_speed;
            speedR = speedL * ratio;
          }
        }

        // Otherwise, the robot is moving forward.
        else
        {
          // Curve the robot the appropriate direction based on the relation of
          // the current angle to the target angle, while moving forward.
          if(driveBase._start_angle < driveBase._target_angle)
          {
            speedL = driveBase._straight_speed;
            speedR = speedL * ratio;
          }
          else
          {
            speedR = driveBase._straight_speed;
            speedL = speedR * ratio;
          }
        }

        // Curve the robot.
        driveBase._left_motor.run(speedL);
        driveBase._right_motor.run(speedR);
      }
    }

    // See if the drive base is in drive mode.
    if(driveBase._mode === driveBase.modeDrive)
    {
      // Get the change in the left and right motors.
      let deltaL = driveBase._left_motor._delta;
      let deltaR = driveBase._right_motor._delta;

      // See if the left and right motors traveled the same distance (meaning
      // the robot drove straight).
      if(deltaL == deltaR)
      {
        // Compute the distance that the robot drove.
        let distance = (driveBase._wheel_diameter * Math.PI * deltaL) / 360;

        // Increment the robot's distance traveled by the distance it just
        // drove.
        driveBase._distance += distance;
      }

      // See if the left and right motors traveled the same distance in
      // opposite directions (meaning the robot spun in place).
      else if(Math.abs(deltaL) == Math.abs(deltaR))
      {
        // Compute the angle that the robot spun.
        let angle = ((deltaL * driveBase._wheel_diameter) /
                     driveBase._axle_track);

        // Increment the robot's angle by the amount it just spun.
        driveBase._angle += angle;
      }

      // Otherwise, the robot drove along a curve.
      else
      {
        let ratio, dI, dO, angle;

        // If neither motor moved, the angle turned is zero.
        if((deltaL == 0) && (deltaR == 0))
        {
          angle = 0;
        }

        // See if the robot drove to the left.
        else if(Math.abs(deltaL) < Math.abs(deltaR))
        {
          // Compute the outer diameter of the curve.
          ratio = deltaL / deltaR;
          dI = (2 * ratio * driveBase._axle_track) / (1 - ratio);
          dO = dI + (2 * driveBase._axle_track);

          // Compute the angle that the robot drove along the curve.
          angle = (deltaR * driveBase._wheel_diameter) / dO;
        }
        else
        {
          // Compute the outer diameter of the curve.
          ratio = deltaR / deltaL;
          dI = (2 * ratio * driveBase._axle_track) / (1 - ratio);
          dO = dI + (2 * driveBase._axle_track);

          // Compute the angle that the robot drove along the curve.
          angle = (deltaL * driveBase._wheel_diameter) / dO;
        }

        // Compute the distance that the robot drove.
        let distance = ((driveBase._wheel_diameter * Math.PI *
                         (deltaL + deltaR) / 2) / 360);

        // Increment the robot's distance traveled by the distance it just
        // drove.
        driveBase._distance += distance;

        // Increment the robot's angle by the amount it just curved.
        driveBase._angle += angle;
      }
    }

    // See if this drive base is now in idle mode.
    if(driveBase._mode === driveBase.modeIdle)
    {
      // Send the completion event so the Promise can complete.
      sendEvent(baseEvent(driveBase._idx));
    }
  }
}

/**
 * Updates the state of the robot based on execution of the robot script.
 */
export function
step()
{
  // There is nothing to do if the simulation is paused.
  if(paused)
  {
    previousTime = 0;
    return;
  }

  // Get the current time.
  let now = Date.now();

  // Make sure there is a previous time; this avoids a huge time delta on the
  // first step.
  if(previousTime != 0)
  {
    // Update the low level devices.
    updateDevices(now - previousTime);

    // Update the position and rotation of the robot based on the drive motor
    // movements (if any).
    updateRobot();

    // Update the robotics devices.
    updateDriveBase(now - previousTime);
  }

  // Save the current time as the previous time, for the next step.
  previousTime = now;
}

/**
 * Constructs the name of the completion event for a given motor port.
 *
 * @param port The port to which the motor is attached.
 *
 * @returns A string with the name of the event associated with this motor.
 */
export function
portEvent(port)
{
  // Construct and return the event name.
  return("simPort" + port + "Done");
}

/**
 * Constructs the name of the completion event for a drive base.
 *
 * @param idx The index of the drive base.
 *
 * @returns A string with the name of the event associated with the drive base.
 */
export function
baseEvent(idx)
{
  // Return the event name.
  return("simBase" + idx + "Done");
}

/**
 * Sends a completion event.
 *
 * @param event The event to send.
 */
export function
sendEvent(event)
{
  // Trigger the event.
  $(window).trigger(event);
}

/**
 * Pauses execution until the given event has been received.
 *
 * @param event The name of the event for which to wait.
 */
export async function
waitForEvent(event)
{
  // The worker for the Promise.
  let worker = function (resolve)
  {
    // The handler for the port event.
    let done = function ()
    {
      // Remove the event handler.
      $(window).off(event);

      // Resolve the Promise.
      resolve();
    }

    // Call the done function when the port event occurs.
    $(window).on(event, done);
  }

  // Create and wait for a Promise that will resolve once the event has been
  // sent.
  await new Promise((resolve) => worker(resolve));
}