// #region linear
int MinSpeedLinear(int[] piles, int h)
{
    long HoursAt(int speed)
    {
        long hours = 0;
        foreach (int pile in piles) hours += (pile + speed - 1) / speed; // ceil(pile / speed)
        return hours;
    }

    // Try every speed, slowest first. The first one that is fast enough wins.
    int speed = 1;
    while (HoursAt(speed) > h) speed++;
    return speed;
}
// #endregion

// #region binary
int MinSpeed(int[] piles, int h)
{
    long HoursAt(int speed)
    {
        long hours = 0;
        foreach (int pile in piles) hours += (pile + speed - 1) / speed; // ceil(pile / speed)
        return hours;
    }

    int lo = 1; // slowest speed worth trying
    int hi = piles.Max(); // always fast enough: one pile per hour // @init
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2; // @mid
        if (HoursAt(mid) <= h) hi = mid; // @ok
        else lo = mid + 1; // @slow
    }
    return lo; // @done
}
// #endregion
