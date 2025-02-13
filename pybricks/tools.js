// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

/**
 * Pauses the user program for a specified amount of time.
 *
 * @param time How long to wait, in ms.
 */
export async function
wait(time)
{
  // Create a promise that resolves after the specified amount of time, and
  // then wait for the promise to resolve.
  await new Promise(resolve => setTimeout(resolve, time));
}

/**
 * A stopwatch to measure time intervals.  Similar to the stopwatch feature on
 * your phone.
 */
class _StopWatch
{
  // The constructor.
  constructor()
  {
    // Reset the state of the stopwatch.
    this._time = 0;
    this._start = 0;
  }

  /**
   * Gets the current time of the stopwatch.
   *
   * @returns Elapsed time, in ms.
   */
  time()
  {
    // See if the stopwatch is running.
    if(this._start === 0)
    {
      // It is not running, so return the accumulated elapsed time.
      return(this._time);
    }
    else
    {
      // It is running, so return the accumulated elapsed time plus the current
      // elapsed time.
      return(this._time + (Date.now() - this._start));
    }
  }

  /**
   * Pauses the stopwatch.
   */
  pause()
  {
    // Do nothing if the stopwatch is already paused.
    if(this._start === 0)
    {
      return;
    }

    // Add the current elapsed time to the accumulated elapsed time.
    this._time += Date.now() - this._start;

    // Pause the stopwatch by setting the start time to zero.
    this._start = 0;
  }

  /**
   * Resumes the stopwatch.
   */
  resume()
  {
    // Do nothing if the stopwatch is already running.
    if(this._start !== 0)
    {
      return;
    }

    // Resume the stopwatch by recording the time it was resumed.
    this._start = Date.now();
  }

  /**
   * Resets the stopwatch time to 0.
   */
  reset()
  {
    // Reset the accumulated elapsed time to zero.
    this._time = 0;

    // See if the stopwatch is running.
    if(this._start !== 0)
    {
      // Since the stopwatch is running, capture the current time as the start
      // time.
      this._start = Date.now();
    }
  }
}

/**
 * Creates a new StopWatch.
 *
 * @returns A new StopWatch object.
 */
export function
StopWatch()
{
  return(new _StopWatch());
}