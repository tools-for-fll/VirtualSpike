// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

/**
 * Rounds up.
 *
 * @param x The value to be rounded.
 *
 * @returns Value rounded towards positive infinity.
 */
export function
ceil(x)
{
  return(Math.ceil(x));
}

/**
 * Rounds down.
 *
 * @param x The value to be rounded.
 *
 * @returns Value rounded towards negative infinity.
 */
export function
floor(x)
{
  return(Math.floor(x));
}

/**
 * Truncates decimals to get the integer part of a value.
 *
 * This is the same as rounding towards 0.
 *
 * @param x The value to be truncated.
 *
 * @returns Integer part of the value.
 */
export function
trunc(x)
{
  return(Math.trunc(x));
}

/**
 * Gets the remainder of x / y.
 *
 * Not to be confused with modf().
 *
 * @param x The numerator.
 *
 * @param y The denominator.
 *
 * @returns Remainder after division.
 */
export function
fmod(x, y)
{
  return(x % y);
}

/**
 * Gets the absolute value.
 *
 * @param x The value.
 *
 * @returns Absolute value of x.
 */
export function
fabs(x)
{
  return(Math.abs(x));
}

/**
 * Gets x with the sign of y.
 *
 * @param x Determines the magnitude of the return value.
 *
 * @param y Determines the sign of the return value.
 *
 * @returns x with the sign of y.
 */
export function
copysign(x, y)
{
  return((Math.sign(x) === Math.sign(y)) ? x : -x);
}

/**
 * The mathematical constant e.
 */
export const e = Math.E;

/**
 * Gets e raised to the power of x.
 *
 * @param x The exponent.
 *
 * @returns e raised to the power of x.
 */
export function
exp(x)
{
  return(Math.exp(x));
}

/**
 * Gets x raised to the power of y.
 *
 * @param x The base number.
 *
 * @param y The exponent.
 *
 * @returns x raised to the power of y.
 */
export function
pow(x, y)
{
  return(Math.pow(x, y));
}

/**
 * Gets the natural logarithm.
 *
 * @param x The value.
 *
 * @returns The natural logarithm of x.
 */
export function
log(x)
{
  return(Math.log(x));
}

/**
 * Gets the square root.
 *
 * @param x The value x.
 *
 * @returns The square root of x.
 */
export function
sqrt(x)
{
  return(Math.sqrt(x));
}

/**
 * The mathematical constant π.
 */
export const pi = Math.PI;

/**
 * Converts an angle from radians to degrees.
 *
 * @param x Angle in radians.
 *
 * @returns Angle in degrees.
 */
export function
degrees(x)
{
  return(180 * x / pi);
}

/**
 * Converts an angle from degrees to radians.
 *
 * @param x Angle in degrees.
 *
 * @returns Angle in radians.
 */
export function
radians(x)
{
  return(pi * x / 180);
}

/**
 * Gets the sine of an angle.
 *
 * @param x Angle in radians.
 *
 * @returns Sine of x.
 */
export function
sin(x)
{
  return(Math.sin(x));
}

/**
 * Applies the inverse sine operation.
 *
 * @param x Opposite / hypotenuse.
 *
 * @returns Arcsine of x, in radians.
 */
export function
asin(x)
{
  return(Math.asin(x));
}

/**
 * Gets the cosine of an angle.
 *
 * @param x Angle in radians.
 *
 * @returns Cosine of x.
 */
export function
cos(x)
{
  return(Math.cos(x));
}

/**
 * Applies the inverse cosine operation.
 *
 * @param x Adjacent / hypotenuse.
 *
 * @returns Arccosine of x, in radians.
 */
export function
acos(x)
{
  return(Math.acos(x));
}

/**
 * Gets the tangent of an angle.
 *
 * @param x Angle in radians.
 *
 * @returns Tangent of x.
 */
export function
tan(x)
{
  return(Math.tan(x));
}

/**
 * Applies the inverse tangent operation.
 *
 * @param x Opposite / adjacent.
 *
 * @returns Arctangent of x, in radians.
 */
export function
atan(x)
{
  return(Math.atan(x));
}

/**
 * Applies the inverse tangent operation on b / a, and accounts for the signs
 * of b and a to produce the expected angle.
 *
 * @param b Opposite side of the triangle.
 *
 * @param a Adjacent side of the triangle.
 *
 * @returns Arctangent of b / a, in radians.
 */
export function
atan2(b, a)
{
  return(Math.atan2(b, a));
}

/**
 * Checks if a value is finite.
 *
 * @param x The value to be checked.
 *
 * @returns True if x is finite, else False.
 */
export function
isfinite(x)
{
  return(x !== Infinity);
}

/**
 * Checks if a value is infinite.
 *
 * @param x The value to be checked.
 *
 * @returns True if x is infinite, else False.
 */
export function
isinfinite(x)
{
  return(x === Infinity);
}

/**
 * Checks if a value is not-a-number.
 *
 * @param x The value to be checked.
 *
 * @returns True if x is not-a-number, else False.
 */
export function
isnan(x)
{
  return(isNaN(x));
}

/**
 * Gets the fractional and integral parts of x, both with the same sign as x.
 *
 * @param x The value to be decomposed.
 *
 * @returns Tuple of fractional and integral parts.
 */
export function
modf(x)
{
  return([trunc(x), x - trunc(x)]);
}

/**
 * Decomposes a value x into a tuple (m, p), such that x == m * (2 ** p).
 *
 * @param x The value to be decomposed.
 *
 * @returns Tuple of m and p.
 */
export function
frexp(x)
{
  // Implementation taken from SqueakJS (https://github.com/codefrau/SqueakJS)
  if(x === 0)
  {
    return([x, 0]);
  }
  var data = new DataView(new ArrayBuffer(8));
  data.setFloat64(0, x);
  var bits = (data.getUint32(0) >>> 20) & 0x7FF;
  if(bits === 0)
  {
    data.setFloat64(0, x * Math.pow(2, 64));
    bits = ((data.getUint32(0) >>> 20) & 0x7FF) - 64;
  }
  var exponent = bits - 1022;
  var mantissa = ldexp(x, -exponent);
  return([mantissa, exponent]);
}

/**
 * Computes m * (2 ** p).
 *
 * @param m The value.
 *
 * @param p The exponent.
 *
 * @returns Result of m * (2 ** p).
 */
export function
ldexp(m, p)
{
  // Implementation taken from SqueakJS (https://github.com/codefrau/SqueakJS)
  var steps = Math.min(3, Math.ceil(Math.abs(p) / 1023));
  var result = m;
  for(var i = 0; i < steps; i++)
  {
    result *= Math.pow(2, Math.floor((p + i) / steps));
  }
  return(result);
}