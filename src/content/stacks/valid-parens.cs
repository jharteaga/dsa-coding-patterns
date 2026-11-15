// #region brute
bool IsValidBrute(string s)
{
    // Keep deleting adjacent matching pairs until none are left.
    string prev = null!;
    while (s != prev)
    {
        prev = s;
        s = s.Replace("()", "").Replace("[]", "").Replace("{}", ""); // each pass is O(n)
    }
    return s.Length == 0;
}
// #endregion

// #region stack
bool IsValid(string s)
{
    var closes = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
    var stack = new Stack<char>();
    foreach (char ch in s)
    {
        if (ch == '(' || ch == '[' || ch == '{')
        {
            stack.Push(ch); // @push
        }
        else
        {
            // A closer must match the most recent unclosed opener.
            if (stack.Count == 0 || stack.Pop() != closes[ch]) return false; // @pop
        }
    }
    return stack.Count == 0; // @end
}
// #endregion
