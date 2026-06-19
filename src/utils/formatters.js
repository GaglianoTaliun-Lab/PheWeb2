export function formatScientific(num) {
    if (!num || isNaN(num)) return 'NA';  
    return Number(num).toExponential(2);  
};

export function roundEAF(eaf) {
  const num_decimal = 4;

  if (eaf === null || eaf === undefined || isNaN(eaf)) return 'NA';

  const eafNum = Number(eaf);
  const eafString = eafNum.toString();

  const parts = eafString.split('.');
  const mantis = parts[1];

  // No decimal part
  if (!mantis) return eafString;

  // No rounding
  if (mantis.length <= num_decimal) return eafString;

  // Special case: leading zeros after decimal
  if (mantis.slice(0, num_decimal) === "0".repeat(num_decimal)) {
    return eafNum.toExponential(2);
  }

  let eaf_round = eafNum.toFixed(num_decimal);

  // trim trailing zeros
  while (eaf_round.endsWith("0")) {
    eaf_round = eaf_round.slice(0, -1);
  }

  // remove trailing dot
  if (eaf_round.endsWith(".")) {
    eaf_round = eaf_round.slice(0, -1);
  }

  return eaf_round;
}
