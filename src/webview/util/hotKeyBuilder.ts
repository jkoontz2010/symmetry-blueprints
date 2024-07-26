// pattern is:
// if items.length < 26, we use a-z

import { BuilderGenerator } from "../hooks/useWordBuilder";

// if items.length > 26, we use aa, ab, ac, ... az, ba, bb, bc, ... zz
export function getHotKeyMapForItems<T>(items: T[]): Map<string, T> {
  // if doubled, we get 26^2 = 676 options
  const isDoubled = items.length > 26;
  let result = new Map<string, T>();

  if (isDoubled) {
    let master = "asdfghjklqwertyuiopzxcvbnm".split("");
    for (let i = 0; i < items.length; i++) {
      const first = i < 26 ? i % 26 : Math.floor(i / 26) - 1;

      const second = i % 26;

      const str = master[first] + master[second];

      result.set(str, items[i]);
    }
    return result;
  } else {
    "asdfghjklqwertyuiopzxcvbnm"
      .split("")
      .slice(0, items.length)
      .forEach((key, idx) => {
        result.set(key, items[idx]);
      });

    return result;
  }
}

// pattern is:
// index of step + output index
// so step 0, output 0 is 01 for first output
// if we have 10 steps, we add a 0 to the front of the first 9
// ex: 001, 012, 101
// we will never have more than 9 outputs, god forbid.

export function getHotkeyMapForOutputItems(
  steps: BuilderGenerator[],
  selectedStepIdx: number
): Map<string, any> {
  let result = new Map<string, any>();
  // what's the string length of 10? -> 2.
  const size = Number(steps.length).toString().length;
  steps.forEach((step, idx) => {
    if (idx >= selectedStepIdx) {
      return;
    }
    const outputName = step.outputName;
    console.log("step", idx, "padded", padNumber(size, idx), outputName);
    result.set(padNumber(size, idx), outputName);
  });
  return result;
}
function padNumber(size, number) {
  // Convert the number to a string
  let numberStr = number.toString();

  // Calculate the number of leading zeros needed
  let zerosNeeded = size - numberStr.length;

  // Pad the number with leading zeros if necessary
  if (zerosNeeded > 0) {
    numberStr = "0".repeat(zerosNeeded) + numberStr;
  }

  return numberStr;
}
export function hotKeyToItem<T>(hotKey: string, hotKeys: Map<string, T>) {
  return hotKeys.get(hotKey);
}

export function itemToHotKey<T>(item: T, hotKeys: Map<string, T>) {
  return [...hotKeys.entries()].find(([key, value]) => value === item)?.[0];
}
