// #region brute
int MaxProfitBrute(int[] prices)
{
    int best = 0;
    for (int buy = 0; buy < prices.Length; buy++)
    {
        for (int sell = buy + 1; sell < prices.Length; sell++)
        {
            best = Math.Max(best, prices[sell] - prices[buy]);
        }
    }
    return best;
}
// #endregion

// #region onepass
int MaxProfit(int[] prices)
{
    int cheapest = int.MaxValue; // lowest price seen so far = best day to have bought
    int best = 0;
    foreach (int price in prices)
    {
        cheapest = Math.Min(cheapest, price);
        best = Math.Max(best, price - cheapest); // sell today
    }
    return best;
}
// #endregion
