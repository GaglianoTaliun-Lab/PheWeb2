/*
 * Shared logic to choose which stratifications are displayed on load, and to pass one
 * stratification between pages through the url query (e.g. ?ancestry=european&sex=female).
 *
 * A stratification is written as its values joined by "." in the order of
 * STRATIFICATION_CATEGORIES (e.g. "european.female").
 */

import { PRIORITY_STRATIFICATIONS, PRIORITY_STRATIFICATIONS_COMBINATIONS, STRATIFICATION_CATEGORIES } from '@/config.js';

const NO_STRATIFICATION = "No stratification";
const QUERY_KEYS = STRATIFICATION_CATEGORIES.map(cat => cat.toLowerCase());


// ---------------- Url query ----------------

// "european.female" -> "?ancestry=european&sex=female"
export function stratificationToQuery(stratification) {
  const values = stratification.split('.');
  return '?' + new URLSearchParams(QUERY_KEYS.map((key, i) => [key, values[i]])).toString();
}

// first available stratification matching the url query (keys may be partial or in any order), or null
export function findStratificationFromQuery(available, query = {}) {
  const requested = QUERY_KEYS
    .map((key, i) => [i, query[key]])
    .filter(([, value]) => value)
    .map(([i, value]) => [i, String(value).toLowerCase()]);

  if (requested.length === 0) {
    return null;
  }

  return available.find(stratification => {
    const values = stratification.toLowerCase().split('.');
    return requested.every(([i, value]) => values[i] === value);
  }) ?? null;
}


// ---------------- Default stratifications ----------------

// [first, second] stratifications displayed on load, among the available ones
// first: url query, then the first PRIORITY_STRATIFICATIONS available, then the first available
// second: config combination of the first, then any other available, then "No stratification"
export function chooseStratifications(available, query = {}) {
  if (!available || available.length === 0) {
    return ["", NO_STRATIFICATION];
  }

  const first = findStratificationFromQuery(available, query)
    ?? PRIORITY_STRATIFICATIONS.find(stratification => available.includes(stratification))
    ?? available[0];

  const others = available.filter(stratification => stratification !== first);
  const combination = PRIORITY_STRATIFICATIONS_COMBINATIONS[first];
  const second = others.includes(combination) ? combination : others[0];

  return [first, second ?? NO_STRATIFICATION];
}
