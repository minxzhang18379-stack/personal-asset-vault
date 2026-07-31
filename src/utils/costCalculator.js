/**
 * 资产每日使用成本 (Daily Cost of Use) 计算工具类
 * 结合购买时间、购买价格与当前评估残值，精准计算持用天数与每日摊销费用
 */

export function calculateDailyCost(purchasePrice, purchaseDate, currentValue = 0) {
  const pPrice = Number(purchasePrice) || 0;
  const cValue = Number(currentValue) || 0;

  if (!pPrice || !purchaseDate) {
    return {
      daysOwned: 0,
      grossDailyCost: '0.00',
      netDailyCost: '0.00',
      formattedGross: '¥ 0.00 / 天',
      formattedNet: '¥ 0.00 / 天'
    };
  }

  const pDate = new Date(purchaseDate);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - pDate.getTime());
  const daysOwned = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // 1. 每日采购均摊成本 (原价 / 持有天数)
  const grossDaily = pPrice / daysOwned;
  // 2. 每日实际净折旧成本 ((原价 - 当前残值) / 持有天数)
  const depAmount = Math.max(0, pPrice - cValue);
  const netDaily = depAmount / daysOwned;

  return {
    daysOwned,
    grossDailyCost: grossDaily.toFixed(2),
    netDailyCost: netDaily.toFixed(2),
    formattedGross: `¥ ${grossDaily.toFixed(2)} / 天`,
    formattedNet: `¥ ${netDaily.toFixed(2)} / 天`
  };
}
