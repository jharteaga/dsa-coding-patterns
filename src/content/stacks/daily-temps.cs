// #region brute
int[] DailyTemperaturesBrute(int[] temps)
{
    var wait = new int[temps.Length];
    for (int i = 0; i < temps.Length; i++)
    {
        for (int j = i + 1; j < temps.Length; j++)
        {
            if (temps[j] > temps[i])
            {
                wait[i] = j - i;
                break;
            }
        }
    }
    return wait;
}
// #endregion

// #region stack
int[] DailyTemperatures(int[] temps)
{
    var wait = new int[temps.Length];
    var stack = new Stack<int>(); // indices of days still waiting for a warmer day
    for (int i = 0; i < temps.Length; i++)
    {
        // Today answers every waiting day that is colder than today.
        while (stack.Count > 0 && temps[stack.Peek()] < temps[i])
        {
            int day = stack.Pop(); // @resolve
            wait[day] = i - day;
        }
        stack.Push(i); // today now waits for its own warmer day // @push
    }
    return wait; // @done
}
// #endregion
