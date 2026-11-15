// #region brute
int LongestUniqueBrute(string s)
{
    int best = 0;
    for (int start = 0; start < s.Length; start++)
    {
        var seen = new HashSet<char>();
        // Extend from `start` until a character repeats.
        for (int end = start; end < s.Length; end++)
        {
            if (!seen.Add(s[end])) break;
            best = Math.Max(best, end - start + 1);
        }
    }
    return best;
}
// #endregion

// #region window
int LongestUnique(string s)
{
    var lastSeen = new Dictionary<char, int>(); // character -> its most recent index
    int left = 0; // window is s[left..right], always free of repeats
    int best = 0;
    for (int right = 0; right < s.Length; right++)
    {
        char ch = s[right];
        if (lastSeen.TryGetValue(ch, out int prev) && prev >= left)
        {
            left = prev + 1; // jump past the earlier copy of ch // @shrink
        }
        lastSeen[ch] = right; // @grow
        best = Math.Max(best, right - left + 1); // @best
    }
    return best; // @done
}
// #endregion
