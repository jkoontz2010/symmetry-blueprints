
import {
  bgRule,
  cssDecl,
  selectorFinTempl,
  selectorTempl,
} from "./template-pool";

import {
  applyAtDuplicate,
  applyToSkeleton,
  performIfHasTemplates,
  performIfNotHasTemplates,
  performOnNodes,
  swapValuesForGenericKeysWithCb,
} from "./generator-pool";
import { combine, Template } from "symmetric-parser/dist/src/templator/template-group";
import { genTemplateWithVars, recursiveFold } from "symmetric-parser";

function applyToDupe(input: Template): Template {
  const swap = swapValuesForGenericKeysWithCb(input, [
    { key: "bgValue", newValue: () => "#eee" },
    { key: "selectorName", newValue: (s) => s + ":focus" },
    { key: "cssSelectors", newValue: (s) => s + ":focus" },
    { key: "selectorFinName", newValue: (s) => s + ":focus" },
  ]);

  return swap;
}

function cbGen(input: Template): Template {
  const appDupe = applyAtDuplicate("cssDecl", input, applyToDupe);

  return appDupe;
}

function wcb(input: Template): Template {
  const res = performIfHasTemplates(
    input,
    [selectorTempl, selectorFinTempl],
    cbGen
  );
  const res2 = performIfNotHasTemplates(
    res,
    [selectorTempl, selectorFinTempl],
    cbGen
  );

  return res2;
}

function w1(input: Template): Template {
  const fr = recursiveFold(
    input,
    [cssDecl, bgRule],
    [],
    { scope: () => `\n` },
    "  ",
    1
  );
  const combo = combine(fr.result, fr.divisors);
  const pon = performOnNodes("cssDecl", combo, wcb);
  const skeleton = genTemplateWithVars({ cssFile: () => `\ncssDecls\n` }, [
    "cssDecls",
  ]);

  const filledSkeleton = applyToSkeleton(pon, skeleton, [
    { key: "cssDecl", toKey: "cssDecls" },
  ]);

  return filledSkeleton;
}
