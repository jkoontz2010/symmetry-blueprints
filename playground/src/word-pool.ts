import {
  bgRule,
  cssDecl,
  genTempl,
  selectorFinTempl,
  selectorTempl,
  gen2Templ
} from "./template-pool";

import {
  Template,
} from "symmetric-parser/dist/src/templator/template-group";
import {
  applyAtDuplicate,
  applyToSkeleton,
  genTemplateWithVars,
  joiner,
  performIfHasTemplates,
  performIfNotHasTemplates,
  performOnNodes,
  recursiveFold,
  replaceAllAWithB,
  replaceWithAllIsomorphic,
  swapValuesForGenericKeysWithCb,
  combine,
} from "symmetric-parser";



export function applyToDupe(input: Template): Template {
  const swap = swapValuesForGenericKeysWithCb(input, [
    { key: "bgValue", newValue: () => "#eee" },
    { key: "selectorName", newValue: (s) => s + ":focus" },
    { key: "cssSelectors", newValue: (s) => s + ":focus" },
    { key: "selectorFinName", newValue: (s) => s + ":focus" },
  ]);

  return swap;
}

export function cbGen(input: Template): Template {
  const appDupe = applyAtDuplicate("cssDecl", input, applyToDupe);

  return appDupe;
}

export function someWord(input: Template): Template {
  const replaceAllAWithB_tO4T = replaceAllAWithB(
    genTempl,
    selectorTempl,
    selectorFinTempl
  );
  const replaceWithAllIsomorphic_s7mG = replaceWithAllIsomorphic(
    replaceAllAWithB_tO4T,
    [selectorFinTempl, selectorTempl, cssDecl]
  );
  const joiner_gAlt = joiner(
    replaceWithAllIsomorphic_s7mG,
    "cssSelectors",
    "something",
    "\\n"
  );
  return joiner_gAlt;
}

export function wcb(wordInput: Template): Template {
  const replaceWithAllIsomorphic_ScYm = replaceWithAllIsomorphic(wordInput, [
        bgRule,
        gen2Templ,
        cssDecl,
        selectorTempl,
        bgRule
]);
return replaceWithAllIsomorphic_ScYm;
}

export function w1(input: Template): Template {
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

  const filledSkeleton = applyToSkeleton(
    pon,
    skeleton,
    [{ key: "cssDecl", toKey: "cssDecls" }],
    ""
  );

  return filledSkeleton;
}
