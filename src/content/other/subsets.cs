// #region cascade
IList<IList<int>> SubsetsCascade(int[] nums)
{
    var result = new List<IList<int>> { new List<int>() }; // start with just the empty subset
    foreach (int x in nums)
    {
        // Every existing subset spawns a copy that also contains x.
        int count = result.Count;
        for (int i = 0; i < count; i++)
        {
            result.Add(new List<int>(result[i]) { x });
        }
    }
    return result;
}
// #endregion

// #region backtrack
IList<IList<int>> Subsets(int[] nums)
{
    var result = new List<IList<int>>();
    var current = new List<int>();

    // Decide, for nums[i], nums[i+1], ...: is it in the subset or not?
    void Decide(int i)
    {
        if (i == nums.Length)
        {
            result.Add(new List<int>(current)); // every decision made: record a copy // @record
            return;
        }
        current.Add(nums[i]); // choice 1: include nums[i] // @include
        Decide(i + 1);
        current.RemoveAt(current.Count - 1); // undo the choice (backtrack)... // @undo
        Decide(i + 1); // ...choice 2: exclude nums[i] // @exclude
    }

    Decide(0);
    return result; // @done
}
// #endregion
