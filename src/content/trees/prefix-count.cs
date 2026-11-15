// #region scan
int[] PrefixCountsScan(string[] words, string[] prefixes)
{
    var result = new int[prefixes.Length];
    for (int q = 0; q < prefixes.Length; q++)
    {
        foreach (string word in words)
        {
            // compares up to prefix.Length characters
            if (word.StartsWith(prefixes[q], StringComparison.Ordinal)) result[q]++;
        }
    }
    return result;
}
// #endregion

// #region trie
class TrieNode
{
    public Dictionary<char, TrieNode> Children = new();
    public int Count; // how many words pass through this node
}

int[] PrefixCounts(string[] words, string[] prefixes)
{
    var root = new TrieNode();

    // Build: one node per character, shared by all words with the same prefix.
    foreach (string word in words)
    {
        var node = root;
        foreach (char ch in word)
        {
            if (!node.Children.TryGetValue(ch, out var next))
            {
                next = new TrieNode(); // @create
                node.Children[ch] = next;
            }
            node = next;
            node.Count++; // @count
        }
    }

    // Query: walk down one character at a time.
    var result = new int[prefixes.Length];
    for (int q = 0; q < prefixes.Length; q++)
    {
        TrieNode? node = root;
        foreach (char ch in prefixes[q])
        {
            if (!node.Children.TryGetValue(ch, out var next)) // @walk
            {
                node = null; // @dead
                break;
            }
            node = next;
        }
        result[q] = node?.Count ?? 0; // @answer
    }
    return result;
}
// #endregion
