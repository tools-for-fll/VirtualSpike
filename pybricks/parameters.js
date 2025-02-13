// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

/**
 * Unit axes of a coordinate system.
 */
class _Axis
{
  X = [ 1, 0, 0 ];
  Y = [ 0, 1, 0 ];
  Z = [ 0, 0, 1 ];
}

/**
 * Unit axes of a coordinate system.
 */
export const Axis = new _Axis();

/**
 * Buttons on the hub.
 */
class _Button
{
  LEFT_MINUS = 0;
  LEFT_PLUS = 1;
  RIGHT_MINUS = 2;
  RIGHT_PLUS = 3;
  CENTER = 4;
  LEFT = 5;
  RIGHT = 6;
  BLUETOOTH = 7;
  A = 8;
  B = 9;
  X = 10;
  Y = 11;
  LB = 12;
  RB = 13;
  LJ = 14;
  RJ = 15;
  GUIDE = 16;
  MENU = 17
  UPLOAD = 18;
  VIEW = 19;
  P1 = 20;
  P2 = 21;
  P3 = 22;
  P4 = 23;
}

/**
 * Buttons on the hub.
 */
export const Button = new _Button();

/**
 * Light or surface color.
 */
class _Color
{
  RED = 0;
  ORANGE = 1;
  YELLOW = 2;
  GREEN = 3;
  CYAN = 4;
  BLUE = 5;
  VIOLET = 6;
  MAGENTA = 7;
  WHITE = 8;
  GRAY = 9;
  BLACK = 10;
  NONE = 11;
}

/**
 * Light or surface color.
 */
export const Color = new _Color();

/**
 * Rotational direction for positive speed or angle values.
 */
class _Direction
{
  /**
   * A positive speed value should make the motor move clockwise.
   */
  CLOCKWISE = 0;

  /**
   * A positive speed value should make the motor move counterclockwise.
   */
  COUNTERCLOCKSIZE = 1;
}

/**
 * Rotational direction for positive speed or angle values.
 */
export const Direction = new _Direction();

/**
 * Icons to display on a light matrix.
 */
class _Icon
{
  UP = 0;
  DOWN = 1;
  LEFT = 2;
  RIGHT = 3;
  ARROW_RIGHT_UP = 4;
  ARROW_RIGHT_DOWN = 5;
  ARROW_LEFT_UP = 6;
  ARROW_LEFT_DOWN = 7;
  ARROW_UP = 8;
  ARROW_DOWN = 9;
  ARROW_LEFT = 10;
  ARROW_RIGHT = 11;
  HAPPY = 12;
  SAD = 13;
  EYE_LEFT = 14;
  EYE_RIGHT = 15;
  EYE_LEFT_BLINK = 16;
  EYE_RIGHT_BLINK = 17;
  EYE_RIGHT_BROW = 18;
  EYE_LEFT_BROW = 19;
  EYE_LEFT_BROW_UP = 20;
  EYE_RIGHT_BROW_UP = 21;
  HEART = 22;
  PAUSE = 23;
  EMPTY = 24;
  FULL = 25;
  SQUARE = 26;
  TRIANGLE_RIGHT = 27;
  TRIANGLE_LEFT = 28;
  TRIANGLE_UP = 29;
  TRIANGLE_DOWN = 30;
  CIRCLE = 31;
  CLOCKWISE = 32;
  COUNTERCLOCKWISE = 33;
  TRUE = 34;
  FALSE = 35;
}

/**
 * Icons to display on a light matrix.
 */
export const Icon = new _Icon();

/**
 * Input and output ports.
 */
class _Port
{
  A = 0;
  B = 1;
  C = 2;
  D = 3;
  E = 4;
  F = 5;
}

/**
 * Input and output ports.
 */
export const Port = new _Port();

/**
 * Side of a hub or a sensor.  These devices are mostly rectangular boxes with
 * six sides.
 *
 * Screens or light matrices have only four sides.  For those, TOP is treated
 * the same as FRONT, and BOTTOM is treated the same as BACK.
 */
class _Side
{
  TOP = 0;
  BOTTOM = 1;
  FRONT = 2;
  BACK = 3;
  LEFT = 4;
  RIGHT = 5;
}

/**
 * Side of a hub or a sensor.  These devices are mostly rectangular boxes with
 * six sides.
 *
 * Screens or light matrices have only four sides.  For those, TOP is treated
 * the same as FRONT, and BOTTOM is treated the same as BACK.
 */
export const Side = new _Side();

/**
 * Action after the motor stops.
 */
class _Stop
{
  /**
   * Let the motor move freely.
   */
  COAST = 0;

  /**
   * Let the motor move freely.  For the next relative angle maneuver, take the
   * last target angle (instead of the current angle) as the new starting
   * point.  This reduces cumulative errors.  This will apply only if the
   * current angle is less than twice the configured position tolerance.
   */
  COAST_SMART = 1;

  /**
   * Passively resist small external forces.
   */
  BRAKE = 2;

  /**
   * Keep controlling the motor to hold it at the commanded angle.
   */
  HOLD = 3;

  /**
   * Do not decelerate when approaching the target position.  This can be used
   * to concatenate multiple motor or drive base maneuvers without stopping.
   * If no further commands are given, the motor will proceed to run
   * indefinitely at the given speed.
   */
  NONE = 4;
}

/**
 * Action after the motor stops.
 */
export const Stop = new _Stop();