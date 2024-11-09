import * as templPool from "./template-pool";

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
    templPool.genTempl,
    templPool.selectorTempl,
    templPool.selectorFinTempl
  );
  const replaceWithAllIsomorphic_s7mG = replaceWithAllIsomorphic(
    replaceAllAWithB_tO4T,
    [templPool.selectorFinTempl, templPool.selectorTempl, templPool.cssDecl]
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
    templPool.bgRule,
    templPool.genTempl,
    templPool.cssDecl,
    templPool.selectorTempl,
    templPool.bgRule
]);
return replaceWithAllIsomorphic_ScYm;
}

export function w1(input: Template): Template {
  const fr = recursiveFold(
    input,
    [templPool.cssDecl, templPool.bgRule],
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

export function updateOrAppendNewWord(t: Template): Template {
  const wordTempls = orderedFold(t, [fullWord], {
    mode: FoldMode.AllOrNothing,
  });
  if (wordTempls == null) {
    throw new Error("Could not parse word file for some reason");
  }
  const { result, divisors } = wordTempls;
  const input = { ...result, ...divisors };
  //console.log("STARTING WITH", tts(input, false));

  const ifNotMatching = performIfNotHasMatchingValuesAtKey(
    input,
    "wordName",
    (t: Template) => {
      //console.log("NOT MATCHING", tts(t, false));
      const skeleton = applyToSkeleton(
        t,
        wordSkeleton,
        [{ key: "fullWord", toKey: "words" }],
        "\n"
      );
      //console.log("SKELETON", tts(skeleton, false));
      return skeleton;
    }
  );
  const ifMatching = performIfHasMatchingValuesAtKey(
    ifNotMatching,
    "wordName",
    (t: Template) => {
      const withDupe = swapValuesWhenChildHasMatchingValue(
        t,
        "fullWord",
        "wordName"
      );

      return withDupe;
    }
  );
  const sortedWD = sortTemplateByDeps(ifMatching);
  const fin = multiply(sortedWD, {});
  return fin;
}