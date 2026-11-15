// #region brute
IList<string> GenerateParensBrute(int n)
{
    bool IsValid(string s)
    {
        int open = 0;
        foreach (char ch in s)
        {
            open += ch == '(' ? 1 : -1;
            if (open < 0) return false; // closed something that was never opened
        }
        return open == 0;
    }

    var result = new List<string>();
    // Build EVERY string of length 2n over "(" and ")" — 2^(2n) of them — then filter.
    void Build(string s)
    {
        if (s.Length == 2 * n)
        {
            if (IsValid(s)) result.Add(s);
            return;
        }
        Build(s + "(");
        Build(s + ")");
    }
    Build("");
    return result;
}
// #endregion

// #region backtrack
IList<string> GenerateParens(int n)
{
    var result = new List<string>();
    // `open` and `close` = how many of each bracket are already in s.
    void Build(string s, int open, int close)
    {
        if (s.Length == 2 * n)
        {
            result.Add(s); // only valid strings can ever get here
            return;
        }
        if (open < n) Build(s + "(", open + 1, close); // may open while some remain
        if (close < open) Build(s + ")", open, close + 1); // may close only what is open
    }
    Build("", 0, 0);
    return result;
}
// #endregion
