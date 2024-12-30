import _, { compact, isEmpty } from "lodash";
import {
  applyToIndex,
  changeTemplateArgs,
  FoldMode,
  getAllKeys,
  getDenominators,
  getKeyDenominators,
  getKeyNumerator,
  orderedFold,
  recursiveFold,

  argsAndTemplateToFunction,
  combine,
  gatherRunStatements,
  getRunStatements,
  multiply,
  sortDeps,
  sortTemplateByDeps,



  genTemplateWithVars,
  getArgsFromRunStatements,
  getKeyIndex,
  getKeyName,
  rs,
  tts,
  cleanIndexingFromKeys,
  findAncestorFromChild,
  findMatchingKeysForGenericTemplate,
  getAllKeysWithNumeratorString,
  getChildrenOfKey,
  getDescendentsOfKey,
  getKeysWithMatchingValues,
  getParentOfKey,
  getSiblingValue,
  getTemplatesFromKeys,
  lowestCommonAncestor,
  makeKeyGeneric,

getTemplateTextFromFunc, rsCompact,
hasDuplicateValuesAtKey,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

const { cloneDeep, flatten } = _;

type MapOnto = {
  froms: string[];
  onto: Template;
};

// when you have a lot of the same template, it shows like:
// key1, key2, key3, keyN.
// we want to map a template onto all of these but don't wannt
// address the keys this way.
// so whatever you pass as "onto" will take key1..n, and map it onto
// the template.
// the result is a template that will take in all the key1..n because it's been
// reproduced to match the number of keys.
// so if it's mapping on {a:({b})=>`${b}`}, and the templates is `{b1:..., b2:...}
// the result is {a1:({b1})=>`${b1}`, a2:({b2})=>`${b2}`}
export function applyManyToGeneric(
  input: Template,
  mapOnto: MapOnto
): Template {
  console.log(
    "applyManyToGeneric",
    tts(input),
    tts(mapOnto.onto),
    mapOnto.froms
  );
  const fromKeyPairs: { [keyIndex: string]: Array<string> } = {};
  let finalTemplate: Template = {};
  // on each key, we want to map the onto onto the key.
  Object.keys(input).forEach((key) => {
    const keyName = key.split(/[0-9]/)[0];
    const keyIndex = key.substring(key.search(/[0-9]/));
    if (mapOnto.froms.includes(keyName)) {
      if (!Array.isArray(fromKeyPairs[keyIndex])) {
        fromKeyPairs[keyIndex] = [];
      }
      fromKeyPairs[keyIndex].push(key);
    }
  });
  console.log("appMany FROM KEY PAIRS", fromKeyPairs);

  Object.keys(fromKeyPairs).forEach((keyIndex, i) => {
    const keyNames = fromKeyPairs[keyIndex];
    const keyNameMap = keyNames.reduce((acc, keyName) => {
      acc = Object.assign(acc, { [keyName.split(/[0-9]/)[0]]: keyName });
      return acc;
    }, {});
    // take the keyNameMap and use it to change the args
    console.log("appMany KEYNAMEMAP", keyNameMap);
    console.log("appMany ONTO", tts(mapOnto.onto, false));
    // note we're giving it the same keyIndex it had. makes conversions easier. OR DOES IT BREAK THINGS??
    const result = changeTemplateArgs(mapOnto.onto, keyNameMap, keyIndex);
    console.log("appMany RESULT", tts(result, false));
    finalTemplate = combine(finalTemplate, result);
  });
  return finalTemplate;
  /*
  // assume fromKeys aligns on index
  console.log("FROM KEYS", fromKeys, mapOnto, Object.keys(templates));
  const reduced = fromKeys.reduce(
    (acc: Template, fromKey: string, i: number) => {
      const key = fromKey.split(/[0-9]/)[0];

      acc = changeTemplateArgs(acc, { [key]: fromKey }, i);

      console.log("NEW ONTO", acc, tts(acc));
      return acc;
    },
    mapOnto.onto
  );
  console.log("ontoGetter", tts(reduced));
  return reduced;
  */
}

type MapArg = {
  from: string;
  to: string;
  index: number;
};
// change the keys from "from" to "to". very simple, that's it.
// used when you want to change the names of keys.
export function mapper(input: Template, map: MapArg): Template {
  const fromKeys = Object.keys(input).filter((key) => {
    const keyName = key.split(/[0-9]/)[0];

    return keyName === map.from;
  });
  //  console.log("MAPPER FROM KEYS", fromKeys, map, Object.keys(templates));
  const reduced = fromKeys.reduce(
    (acc: Template, fromKey: string, i: number) => {
      // notes continued on Obsidian
      // obsidian://open?vault=All&file=HGCG%20reducer%20templates%20for%20creating%20sections%20of%20template%20types
      const newIdentifier = `${i}m${map.index}`;
      acc = { ...acc, [map.to + newIdentifier]: input[fromKey] };
      return acc;
    },
    {}
  );
  //console.log("FINAL MAPPER", tts(reduced));
  return reduced;
}

// the better "reducer". this will join templates on a key with a delimiter.
// compared to the old one, thsi one actually returns a Template.
export function joiner(
  input: Template,
  joinOn: string,
  keyName: string,
  joinWith: string
): Template {
  // /console.log("JOINER HERE", joinOn, keyName, joinWith, tts(templates, false));
  const filteredTemplateKeys = Object.keys(input).filter((t) => {
    const tKey = t.split(/[0-9]/)[0];
    return tKey === joinOn;
  });
  // console.log("filtered templ keys", filteredTemplateKeys);
  return {
    [keyName]: argsAndTemplateToFunction(
      [],
      filteredTemplateKeys.map((t) => input[t]()).join(joinWith)
    ),
  };
}

// shallow copy, but still monoidal
export function filterOn(input: Template, filterFor: string[]): Template {
  const toDelete = Object.keys(input).filter((t) => {
    const tKey = t.split(/[0-9]/)[0];

    return !filterFor.includes(tKey);
  });
  // otherwise it'll destroy the referenced arg
  const newTemplate = cloneDeep(input);
  toDelete.forEach((t) => delete newTemplate[t]);
  return newTemplate;
}

export function swapValuesForKeys(
  input: Template,
  keyVals: Array<{ newValue: string; key: string }>
): Template {
  keyVals.forEach(({ key, newValue }) => {
    if (key.split("/")[1] != null) {
      throw new Error("CAN ONLY SWAP ON PURE KEYS, NOT ONES with denominators");
    }
    input[key] = () => newValue;
  });

  return input;
}

export function swapValuesForGenericKeysWithCb(
  input: Template,
  keyVals: Array<{ newValue: (str: string) => string; key: string }>
): Template {
  keyVals.forEach(({ key, newValue }) => {
    if (key.split("/")[1] != null) {
      throw new Error("CAN ONLY SWAP ON PURE KEYS, NOT ONES with denominators");
    }
    const matchingKeys = Object.keys(input).filter((tk) => {
      const keyName = getKeyName(tk);
      return keyName === key;
    });

    try {
      matchingKeys.forEach((mk) => {
        const value = newValue(input[mk]());
        input[mk] = () => value;
      });
    } catch (e) {
      console.log("ERROR in swapValuesForGenericKeysWithCb", e);
    }
  });

  return input;
}

export function makeTemplateGenericAtKey(
  input: Template,
  key: string
): Template {
  const fieldKeys = getAllKeysWithNumeratorString(input, key);
  const genT = getDescendentsOfKey(fieldKeys[0], input);
  const t = getTemplatesFromKeys(genT, input);
  return cleanIndexingFromKeys(t);
}

const DEBUG_FILL_TEMPLATE_WITH_MAPPED_KEYS = false;
export function fillTemplateWithMappedKeys(
  mappings: Array<{
    input: Template;
    fromToKeys: Array<{ from: string; to: string }>;
    index: number;
  }>,
  toFill: Template
): Template {
  let mappedTemplate: Template = {};
  let ontoTemplate: Template = {};
  mappings.forEach(({ input, fromToKeys, index }, i) => {
    fromToKeys.forEach(({ from, to }, i) => {
      const mapping = mapper(input, { from, to, index });
      if (DEBUG_FILL_TEMPLATE_WITH_MAPPED_KEYS)
        console.log("HERE WITH MAPPINg", tts(mapping, false));
      mappedTemplate = combine(mappedTemplate, mapping);
    });
    if (DEBUG_FILL_TEMPLATE_WITH_MAPPED_KEYS)
      console.log("WE HAVE MAPPED TEMPL", tts(mappedTemplate, false));
    const onto = applyManyToGeneric(mappedTemplate, {
      froms: fromToKeys.map((ftk) => ftk.to),
      onto: toFill,
    });
    if (DEBUG_FILL_TEMPLATE_WITH_MAPPED_KEYS)
      console.log("HERE WITH ONTO", tts(onto, false));
    if (DEBUG_FILL_TEMPLATE_WITH_MAPPED_KEYS)
      console.log("ONTO TEMPL", tts(ontoTemplate, false));
    ontoTemplate = combine(ontoTemplate, onto);
  });

  const result = multiply(mappedTemplate, ontoTemplate);
  console.log("HERE WITH RESULT", tts(result, false));
  return result;
}

export function replaceWithAllIsomorphic(
  input: Template,
  replacers: Template[]
): Template {
  let result = input;
  replacers.forEach((replacer) => {
    result = replaceWithIsomorphic(result, replacer);
  });
  return result;
}
// why isomorphic? if the "holes" are given the same name,
// we just need to transfer the keys from one to the other.
export function replaceWithIsomorphic(
  input: Template,
  replacer: Template
): Template {
  // what we're trying to do here is take template, find A, and then transfer the exact same keys from template's A to B.
  // A itself will have generic keys. B will, too. so we gotta change that. we're using findMatchingKeysForGenericTemplate, and it's
  // going to find the keys in template to use. From there, we just need to use those keys in B instead of the generic ones.
  // the upshot is that we should be able to do all this while preserving the structure in template.
  // the downshot is I'm tired, cya next time.

  // we need to find all templates that match A. we then supply B the keys found, which will have indices.
  const matchingKeys = findMatchingKeysForGenericTemplate(replacer, input);
  //console.log("template", template, "replacer", replacer);
  if (matchingKeys.length === 0) {
    console.log(
      "template keys: ",
      Object.keys(input),
      "Replacer keys:",
      Object.keys(replacer)
    );
    return input;
  }
  //console.log("matching keys", matchingKeys);

  matchingKeys.forEach((mk) => {
    delete input[mk];
    const denoms = mk.split("/")[1]?.split(",") ?? [];
    const generic = makeKeyGeneric(mk);
    const genericDenoms = generic.split("/")[1]?.split(",") ?? [];
    // what if there's more than one?

    const replacerFuncStr = replacer[generic].toString();
    // this captures some extra backticks, ensure it's removed.
    //console.log("Before", replacerFuncStr);
    // shit it's gonna split things big time.....if there's another =>
    let replacerFuncLit = replacerFuncStr.substring(
      replacerFuncStr.indexOf("=>") + 2
    );
    //console.log("pre", replacerFuncLit);
    replacerFuncLit = replacerFuncLit.substring(1, replacerFuncLit.length - 1);

    //console.log("replacerFuncLit", replacerFuncLit);
    const rsStringsGeneric = genericDenoms.map((d) => rs(d));
    rsStringsGeneric.forEach((rsg, i) => {
      const newDenomRs = rs(denoms[i]);
      //console.log("old", rsg, "new", newDenomRs);
      replacerFuncLit = replacerFuncLit.replaceAll(rsg, newDenomRs);
    });
    // console.log("REPLACED", replacerFuncLit);
    // for this part, we need to take every key/index pair from mk
    // and replace replacerCopy's key with the key/index pair.
    const newFunc = argsAndTemplateToFunction(denoms, replacerFuncLit);
    // console.log("NEW FUNC", newFunc.toString());
    input[mk] = newFunc;
  });
  return input;
}

export function replaceAllAWithB(
  input: Template,
  a: Template,
  b: Template
): Template {
  const scopeTemplate = {
    scope: () => `\n`,
  };
  const { result } = recursiveFold(input, [a], [], scopeTemplate, "  ", 12);
  console.log("the fold", tts(result, false));
  const toB = applyManyToGeneric(result, {
    froms: flatten(Object.keys(a).map((k) => k.split("/")[1]?.split(","))),
    onto: b,
  });
  console.log("replaceAllWith?", tts(toB, false));
  const multi = multiply(result, toB);
  console.log("multid", tts(multi));
  return multi;
}

export function performIfHasTemplates(
  input: Template,
  templates: Template[],
  cb: (t: Template) => Template
): Template {
  let of = orderedFold(input, templates, { mode: FoldMode.AllOrNothing });
  if (of == null) {
    return input;
  } else {
    return cb({ ...of.result, ...of.divisors });
  }
}

export function performIfHasGenericKey(
  input: Template,
  genericKey: string,
  cb: (t: Template) => Template
): Template {
  const keys = Object.keys(input);
  let hasGeneric = false;
  for (const k of keys) {
    const keyName = getKeyName(k);
    // console.log("compare", keyName, genericKey);
    if (keyName === genericKey) {
      hasGeneric = true;
      break;
    }
  }
  if (!hasGeneric) return input;
  return cb(input);
}

export function performIfIsTemplate(
  input: Template,
  template: Template,
  cb: (t: Template) => Template
): Template {
  let of = orderedFold(input, [template], {
    mode: FoldMode.AllOrNothing,
  });
  if (of == null) {
    return input;
  } else {
    // for IS TEMPLATE, we want to see if the result is fully a template var whose key is the same as template.
    // if it is, we want to apply the callback to it.
    const resultKeys = Object.keys(of.result);
    //const isTemplate = templateKeys.every((tk) => resultKeys.includes(tk));
    //if (!isTemplate) return input;
    const templText = getTemplateTextFromFunc(of.result[resultKeys[0]]);
    console.log("TEMPLTE±T", templText, resultKeys[0]);
    const denom = getKeyDenominators(resultKeys[0])?.[0];
    const templRs = rs(denom);
    if (templText === templRs) {
      return cb({ ...input, ...of.result, ...of.divisors });
    } else {
      return input;
    }
  }
}
export function performIfGenericKeyHasTemplates(
  input: Template,
  genericKey: string,
  templates: Template[],
  cb: (t: Template) => Template
): Template {
  const modifiedInput: Template = {};
  Object.keys(input).forEach((k) => {
    const keyName = getKeyName(k);
    if (keyName === genericKey) {
      modifiedInput[k] = input[k];
    }
  });
  console.log("WHAT IS MODIFIED INPUTS?", tts(modifiedInput, false));
  let of = orderedFold(modifiedInput, templates, {
    mode: FoldMode.AllOrNothing,
  });
  if (of == null) {
    return input;
  } else {
    return cb({ ...input, ...of.result, ...of.divisors });
  }
}

export function performIfGenericKeyIsTemplate(
  input: Template,
  genericKey: string,
  template: Template,
  cb: (t: Template) => Template
): Template {
  const modifiedInput: Template = {};
  Object.keys(input).forEach((k) => {
    const keyName = getKeyName(k);
    if (keyName === genericKey) {
      modifiedInput[k] = input[k];
    }
  });
  let of = orderedFold(modifiedInput, [template], {
    mode: FoldMode.AllOrNothing,
  });
  if (of == null) {
    return input;
  } else {
    // for IS TEMPLATE, we want to see if the result is fully a template var whose key is the same as template.
    // if it is, we want to apply the callback to it.
    const resultKeys = Object.keys(of.result);
    //const isTemplate = templateKeys.every((tk) => resultKeys.includes(tk));
    //if (!isTemplate) return input;
    const templText = getTemplateTextFromFunc(of.result[resultKeys[0]]);
    const denom = getKeyDenominators(resultKeys[0])[0];
    const templRs = rs(denom);
    if (templText === templRs) {
      return cb({ ...input, ...of.result, ...of.divisors });
    } else {
      return input;
    }
  }
}

export function performIfNotHasTemplates(
  input: Template,
  templates: Template[],
  cb: (t: Template) => Template
): Template {
  let of = orderedFold(input, templates, { mode: FoldMode.AllOrNothing });
  if (of == null) {
    return cb(input);
  } else {
    return input;
  }
}

export function applyAtDuplicate(
  rootKey: string,
  input: Template,
  cb: (t: Template) => Template
): Template {
  const keys = Object.keys(input);
  let result: Template = {};
  keys.forEach((k) => {
    let duplicate: Template = {};
    const normalKey = getKeyName(k);
    if (normalKey === rootKey) {
      const childKeys = getDescendentsOfKey(k, input).concat(k);
      const filteredTemplates: Template = {};
      childKeys.forEach((ck) => {
        filteredTemplates[ck] = input[ck];
      });
      const duplicate: Template = applyToIndex(filteredTemplates, "0d");
      /*
      console.log(
        "created duplicate",
        tts(duplicate, false),
        "VS",
        tts(filteredTemplates, false)
      );*/
      // change key names to reflect the new dupe key
      const cbResult = cb(duplicate);
      //console.log("CBRESULT", tts(cbResult, false));

      result = { ...result, ...cbResult };
    } else {
      result[k] = input[k];
    }
  });
  // console.log("WHAT IS RESULT?", tts({ ...template, ...result }, false));
  return { ...input, ...result };
}

export function performOnMatchingValues(
  input: Template,
  keys: string[],
  cb: (t: Template) => Template
): Template {
  const keysToValues = keys.map((k) => input[k]());
  const uniqueValues = [...new Set(keysToValues)];
  const result: Template = {};
  uniqueValues.forEach((uv) => {
    const matchingKeys = keys.filter((k) => input[k]() === uv);
    const matchingTemplates: Template = {};
    matchingKeys.forEach((mk) => {
      matchingTemplates[mk] = input[mk];
    });
    const cbResult = cb(matchingTemplates);
    Object.keys(cbResult).forEach((k) => {
      result[k] = cbResult[k];
    });
  });
  return result;
}

export function performIfNotHasMatchingValuesAtKey(
  input: Template,
  matchingGenericKey: string,
  cb: (t: Template) => Template
): Template {
  if (!hasDuplicateValuesAtKey(input, matchingGenericKey)) {
    return cb(input);
  } else {
    return input;
  }
}

export function performIfHasMatchingValuesAtKey(
  input: Template,
  matchingGenericKey: string,
  cb: (t: Template) => Template
): Template {
  if (hasDuplicateValuesAtKey(input, matchingGenericKey)) {
    return cb(input);
  } else {
    return input;
  }
}

export function performIfGenericKeyHasValue(
  input: Template,
  genericKey: string,
  value: string,
  cb: (t: Template) => Template
): Template {
  const keys = Object.keys(input).filter((k) => {
    const keyName = getKeyName(k);
    return keyName === genericKey;
  });

  if (keys.some((k) => input[k]() === value)) {
    return cb(input);
  } else {
    return input;
  }
}

export function performIfNotGenericKeyHasValue(
  input: Template,
  genericKey: string,
  value: string,
  cb: (t: Template) => Template
): Template {
  const keys = Object.keys(input).filter((k) => {
    const keyName = getKeyName(k);
    return keyName === genericKey;
  });

  if (!keys.some((k) => input[k]() === value)) {
    return cb(input);
  } else {
    return input;
  }
}

// alternative name: isolateCallbackToKey
export function performOnNodes(
  input: Template,
  rootKey: string,
  cb: (t: Template, index: number) => Template
): Template {
  const keys = Object.keys(input);
  let result: Template = {}; // must include all prior!!
  let index = 0;
  keys.forEach((k) => {
    //console.log("AND", k);
    let operatedOnTemplate = { ...result };
    const normalKey = k.split(/[0-9]/)[0]; // or whatever we call strip
    if (normalKey === rootKey) {
      index++;
      // . . .
      //console.log("it's here as index", index);
      const childKeys = getDescendentsOfKey(k, input, true);
      //console.log("CHILDKEYS", childKeys, k);
      const filteredTemplates: Template = {};
      childKeys.forEach((ck) => {
        filteredTemplates[ck] = input[ck];
      });
      //console.log("FILTERED OUT KEYS", childKeys);
      childKeys.forEach((fok) => {
        delete operatedOnTemplate[fok];
      });
      //console.log("_____________________________________");
      const cbResult = cb(filteredTemplates, index);
      //console.log("HERE WITH CBRULEST", tts(cbResult,false));

      // NEW WAY THAT INSERTS INTO TEMPLATE, PROVIDING UNIQUE INDICES
      result = insertIntoTemplate(operatedOnTemplate, cbResult);
      // OLD WAY THAT REQUIRED INDICES TO BE FIGURED OUT IN CALLBACK
      // result = { ...operatedOnTemplate, ...cbResult }; //mergeResult(cbResult, result);
      //     console.log("MERGERESULT", result);
      // BUT!! what if cbResult keys conflict? do we need to
      // rework the key names??
      // this is why it might be better to findPairs, do generic work,
      // and then applyTemplatesToGeneric.
      // thing is, that's monoidally destructive. we need to re-work
      // this into the original set of keys.
      // we must apply a new key name to all keys in cbResult.
      // but..we must also have the original key match from the original op.
    } else {
      result[k] = input[k];
    }
  });
  //console.log("FIN OF PON");
  return result;
}

// probably not even monoidal. not reversible? not associative?
// might be though, should check some day.
export function applyToSkeleton(
  input: Template,
  skeleton: Template,
  mappings: Array<{ key: string; toKey: string }>,
  delimiter: string
): Template {
  let joinedTemplate: Template = {};
  mappings.forEach((mapping) => {
    const { key, toKey } = mapping;
    // might not need, test without first
    const ct = collapseTemplateAtKey(input, key);
    if (ct == null) throw new Error("collapse is null");
    const joined = joiner(ct, key, toKey, delimiter);
    //console.log("joined", tts(joined, false));
    joinedTemplate = { ...joinedTemplate, ...multiply(joinedTemplate, joined) };
  });

  //console.log("FINAL JOINEd", tts(joinedTemplate, false));
  //console.log("SKELEOTN", tts(skeleton, false))
  return multiply(joinedTemplate, skeleton);
}

export function altCollapseTemplateAtKey(
  input: Template,
  key: string
): Template {
  // get the keys that match the key
  // delete any key above it in the dep tree
  const keys = Object.keys(input);
  let result: Template = {};
  keys.forEach((k) => {
    const normalKey = getKeyName(k);
    if (normalKey === key) {
      result = { ...result, [k]: input[k] };
    }
  });
  return result;
}

export function collapseTemplateAtKey(input: Template, key: string): Template {
  const keys = Object.keys(input);
  //console.log("KEYS", keys, "KEY", key);
  //console.log("THIS IS THE THING", tts(input, false));
  //console.log("ALLL", tts(input));
  const tCopy = cloneDeep(input);
  //console.log("CLONES", tCopy);
  let result: Template = {};
  keys.forEach((k) => {
    const normalKey = getKeyName(k);
    //console.log("NORMAL", normalKey, key);
    if (normalKey === key) {
      //console.log("YUP", tCopy[k].toString());
      result = { ...result, [k]: tCopy[k] };
      //console.log("RESULT, ", tts(result, false));
      //console.log("TO DELETE", k);
      delete tCopy[k];
    }
  });
  //console.log("PRE", tts(result, false), tts(tCopy, false));
  //console.log("RESULT", tts(multiply(result, tCopy), false));

  // so it's still being multiplied by file. we need to remove it
  // to do so, we need to remove all keys with "keys" in the denom

  // unfortunately sometimes a key that belongs to a descendent is in this list. we can't delete those.
  // so we need to filter out the keys that have the key in.
  const keysToRemove = Object.keys(tCopy).filter((k) =>
    k.split("/")[1]?.includes(key)
  );
  //console.log("LAKSJDFLKASJDFLKASJDFLKAJSDFLKJ", keysToRemove);
  keysToRemove.forEach((k) => delete tCopy[k]);
  //console.log("TCIPY", tts(tCopy, false), "RESULT", tts(result, false), "raw", result);
  if (isEmpty(result)) throw new Error("collapseTemplateAtKey is empty");
  //console.log("tcopy BEFORE", tts(tCopy, false));
  //console.log("tcopy TOGETHER", tts(tCopy));

  // for some ungodly reason, this needs to happen or else it might bork on certain parses
  const sortedTemplate = sortTemplateByDeps(tCopy);
  const preCopy = multiply(sortedTemplate, {});
  //console.log("PRECOPY", tts(preCopy, false));
  const final = multiply(result, preCopy);
  //console.log("FINAL", tts(final, false));
  return final;
}

export function collapseAllBelowChildrenOfKey(
  input: Template,
  key: string
): Template {
  const keys = Object.keys(input);
  let result: Template = {};
  const parentKeys = keys.filter((k) => {
    const normalKey = getKeyName(k);
    return normalKey === key;
  });
  const childKeys = compact(
    parentKeys.map((pk) => getChildrenOfKey(pk, input)).flat()
  );

  let isChildren = true;
  childKeys.forEach((pk) => {
    const children = getDescendentsOfKey(pk, input, true);
    if (!isChildren) {
      children.forEach((c) => {
        result = { ...result, [c]: input[c] };
        delete input[c];
      });
    } else {
      isChildren = false;
    }
  });

  result = multiply(result, {});

  return { ...input, ...result };
}

export function collpaseKey(input: Template, genericKey: string): Template {
  const keys = Object.keys(input);
  let result: Template = input;
  let multiplier: Template = {};
  let multiplied: Template = {};
  //console.log("Before", result);

  keys.forEach((k) => {
    const genericKeyFromTemplate = makeKeyGeneric(k);
    if (genericKeyFromTemplate === genericKey) {
      //console.log("generic key", k);
      const toMultiply = { [k]: input[k] };
      const parentKey = getParentOfKey(k, input);
      if (parentKey == null)
        throw new Error("no parent key found, cant delete");
      const parentToMultiply = { [parentKey]: input[parentKey] };

      //console.log("PARENTKEY", parentKey);
      delete result[k];
      delete result[parentKey];
      multiplier = multiply(multiplier, toMultiply);
      multiplied = multiply(multiplied, parentToMultiply);
      //console.log("RESULT", result);
    }
  });
  //console.log("m", multiplier);
  //console.log("multiplied", multiplied);

  const toAdd = multiply(multiplied, multiplier);
  result = { ...result, ...toAdd };
  //console.log("after", result);
  return result;
}

// we want to call cb on every pair of keys that have the same value.
export function joinOnSameValue(
  genericKeyA: string,
  genericKeyB: string,
  cb: (t: Template) => Template,
  input: Template,
  orderByKey: string | undefined
): Template {
  console.log(
    "joinOnSameValue",
    genericKeyA,
    genericKeyB,
    input,
    tts(input, false)
  );
  const keys = Object.keys(input);
  const aKeyedByValue: Record<string, string[]> = {};
  const bKeyedByValue: Record<string, string[]> = {};
  keys.forEach((k) => {
    const keyName = getKeyName(k);
    if (keyName === genericKeyA) {
      const value = input[k]();
      if (aKeyedByValue[value] == null) {
        aKeyedByValue[value] = [];
      }
      aKeyedByValue[value].push(k);
    }
    if (keyName === genericKeyB) {
      const value = input[k]();
      if (bKeyedByValue[value] == null) {
        bKeyedByValue[value] = [];
      }
      bKeyedByValue[value].push(k);
    }
  });
  // go through all the values in a, and if they're in b, add it toa  list of matches
  let matches: Array<{ a: string; b: string }> = [];
  Object.keys(aKeyedByValue).forEach((aValue) => {
    if (bKeyedByValue[aValue] != null) {
      aKeyedByValue[aValue].forEach((a) => {
        bKeyedByValue[aValue].forEach((b) => {
          matches.push({ a, b });
        });
      });
    }
  });
  function sortByValue(arr: { a: string; b: string }[], value: string) {
    // Helper function to extract numeric suffix
    function getNumericSuffix(obj: any) {
      for (let key in obj) {
        let propValue = obj[key];
        if (propValue.startsWith(value)) {
          let suffix = propValue.substring(value.length);
          let num = parseInt(suffix, 10);
          return isNaN(num) ? Infinity : num;
        }
      }
      return Infinity; // If prefix not found, place it at the end
    }
    // Sort the array based on the extracted numeric suffix
    arr.sort(function (a, b) {
      return getNumericSuffix(a) - getNumericSuffix(b);
    });
    return arr;
  }
  // for each matching template, we wanna run the callback on its parent.
  let result: Template = input;
  console.log("HYOW OT ORDER", matches, orderByKey);
  if (orderByKey != null) {
    matches = sortByValue(matches, orderByKey);
    //console.log("ORDERED MATCHES, ", matches);
  }
  matches.forEach(({ a, b }) => {
    const allA = getImmediateFamily(input, a);
    const allB = getImmediateFamily(input, b);
    const together = { ...allA, ...allB };
    if (Object.values(together).some((v) => v == null)) {
      // if one of the values is undefined, it's because
      // it has a denominator. we can't join on that.
      // we must join on full values only.

      console.log(
        "skipping bc joined on denom",
        a,
        b,
        "values",
        Object.values(together)
      );

      return;
    }

    const cbResult = cb({ ...allA, ...allB });
    result = { ...result, ...cbResult };
  });

  return result;
}

// there's nothing better than seeing this be a utility template. good work
// returns the parent, the child in question, and its siblings.
export function getImmediateFamily(
  input: Template,
  keyWithIdx: string
): Template {
  const parentKey = getParentOfKey(keyWithIdx, input);
  if (parentKey == null)
    throw new Error(`parentKey of ${keyWithIdx} not found in getSiblingValue`);

  const parentDenoms = getKeyDenominators(parentKey);
  const siblingsTemplate: Template = parentDenoms.reduce((acc, curr) => {
    return { ...acc, [curr]: input[curr] };
  }, {});
  return { ...siblingsTemplate, [parentKey]: input[parentKey] };
}

// value must be complete, no denoms
export function joinOnValue(
  valueToFindAB: string,
  keyToFindGenericA: string,
  siblingKeyGenericA: string,
  cb: (t: Template) => Template,
  keyToFillB: string,
  input: Template
): Template {
  const keys = Object.keys(input);
  let foundAFlag = false;
  let foundB: Template = {};

  let transformedTemplate: Template = {};
  keys.forEach((k) => {
    if (k.indexOf("/") > 0) return;
    const normalizedKey = getKeyName(k);
    // find A, must be unique
    const aValue = input[k]();
    if (normalizedKey === keyToFindGenericA && aValue === valueToFindAB) {
      if (foundAFlag) {
        throw new Error(
          `Found more than one A with key ${keyToFindGenericA}, must have a unique template A`
        );
      }
      const templValue = input[k]();
      //console.log("TEMPL VALUE", templValue, "vs", valueToFindAB);
      if (templValue === valueToFindAB) {
        const siblingValue = getSiblingValue(input, k, siblingKeyGenericA);
        //console.log("SIBLING VALUE", siblingValue);
        const templateWithSiblingValue = {
          [siblingKeyGenericA]: () => siblingValue,
        };
        //console.log("YEAHSIBLIG", tts(templateWithSiblingValue, false));
        transformedTemplate = cb(templateWithSiblingValue);
      }
      foundAFlag = true;
    }
    // find B, can be many
    if (normalizedKey === keyToFillB) {
      const value = input[k]();
      if (value === valueToFindAB) {
        foundB = { ...foundB, [k]: input[k] };
      }
    }
  });

  const transformedTemplateValueFunc =
    transformedTemplate[Object.keys(transformedTemplate)?.[0]];

  const transformedTemplateValue = transformedTemplateValueFunc?.();
  let finalB = {};
  Object.keys(foundB).forEach((k) => {
    finalB = {
      ...finalB,
      ...swapValuesForKeys(foundB, [
        { key: k, newValue: transformedTemplateValue },
      ]),
    };
  });
  console.log("returning...");
  return { ...input, ...finalB };
}

export function applyToGenericHomomorphism(
  input: Template,
  genericHomomorphism: Template
): Template {
  // so we want to see what keys match the keys that genericHomomorphism takes.
  const genericHomomorphismDenoms = getDenominators(genericHomomorphism);
  let result: Template = genericHomomorphism;
  const matches = new Set<string>();
  Object.keys(input).forEach((k) => {
    const genericKey = getKeyName(k);
    if (genericHomomorphismDenoms.includes(genericKey)) {
      if (matches.has(genericKey)) {
        throw new Error(
          "Multiple keys found for a single generic key in applyToGenericHomomorphism. We don't want to use this function for that use case. Use or create another generator instead."
        );
      }
      matches.add(genericKey);
      result = multiply(result, { [genericKey]: input[k] });
    }
  });
  return result;
}

// ex `schemaBody41/inputSchemaKeyVal111,inputSchemaKeyVal112,inputSchemaArrayKeyVal191,inputSchemaKeyVal251`
// we want to:
// 1. find the key with numerator genericNumeratorKey
// 2. for each denom (in order) matching genericDenominatorKey, apply cb to template with denom key in numerator
// 3. return the result
// In a homomorphism, the result is not the original object.
// It's an object that's been mapped-to from the original object.
// It will return a unique template based off input but IS NOT input itself.
export function inOrderHomomorphism(
  input: Template,
  genericNumeratorKey: string,
  genericDenominatorKeys: string[],
  cb: (t: Template, index: number) => Template
): Template {
  const keys = Object.keys(input);
  let result = {};
  const keysWithGenericNumerator = keys.filter((k) => {
    const numerator = getKeyName(k);
    console.log("NUMERATOR?", numerator, genericNumeratorKey);
    return getKeyName(k) === genericNumeratorKey;
  });

  console.log("KEYS WITH GENERIC NUMERATOR", keysWithGenericNumerator);
  keysWithGenericNumerator.forEach((k) => {
    const denoms = getKeyDenominators(k);
    console.log("DENOMS", denoms, "vs", genericDenominatorKeys);
    const denomsWithGenericDenominator = denoms.filter((d) =>
      genericDenominatorKeys.includes(getKeyName(d))
    );
    console.log(
      "DENOMS WITH GENERIC DENOMINATOR",
      denomsWithGenericDenominator
    );
    denomsWithGenericDenominator.forEach((d, i) => {
      console.log("WORKING WITH D", d);
      const denomKeyTemplateKey = keys.find((k) => k.split("/")[0] === d);
      console.log("DENOM KEY TEMPLATE", denomKeyTemplateKey);
      if (denomKeyTemplateKey == null) return;
      const desc = getDescendentsOfKey(denomKeyTemplateKey, input);
      const descTempl = getTemplatesFromKeys(desc, input);
      const ret = cb(descTempl, i);
      result = { ...result, ...ret };
      console.log("RESULT", result);
    });
  });

  return result;
}

export function findFirst(input: Template, genericKey: string): Template {
  const keys = sortDeps(Object.keys(input));

  let result: Template = {};
  for (const k of keys) {
    const keyName = getKeyName(k);
    if (keyName === genericKey) {
      result = { [k]: input[k] };
      break;
    }
  }
  return result;
}

export function findLast(input: Template, genericKey: string): Template {
  const keys = sortDeps(Object.keys(input));

  let result: Template = {};
  for (const k of keys) {
    const keyName = getKeyName(k);
    if (keyName === genericKey) {
      result = { [k]: input[k] };
    }
  }
  return result;
}

// GETS RID OF DENOMINATOR!!
// POTENTIALLY HOMOMORPHIC!!
export function mapIndexToNewKey(
  input: Template,
  oldKey: string,
  newKey: string
): Template {
  const keys = Object.keys(input);
  let result: Template = {};
  keys.forEach((k) => {
    const keyName = getKeyName(k);
    const keyIndex = getKeyIndex(k);
    if (keyName === oldKey) {
      const fullNewKey = `${newKey}${keyIndex}`;
      result = { ...result, [fullNewKey]: input[k] };
    }
  });
  return result;
}

export function mapIndexOfKey1AndValueOfKey2ToKey3(
  input: Template,
  key1: string,
  key2: string,
  key3: string
): Template {
  const keys = Object.keys(input);
  let result: Template = {};
  const valueKey = keys.find((k) => getKeyName(k) === key2);
  if (valueKey == null)
    throw new Error("valueKey not found in mapIndexOfKey1AndValueOfKey2ToKey3");
  keys.forEach((k) => {
    const keyName = getKeyName(k);
    if (keyName === key1) {
      const index = getKeyIndex(k);
      const newKey = `${key3}${index}`;
      const newTemplate = { [newKey]: input[valueKey] };
      result = { ...result, ...newTemplate };
    }
  });

  return result;
}

export function generateTemplateFromTemplate(
  input: Template,
  genTemplateMainKey: string,
  genTemplateString: string,
  genTemplateKeys: string[],
  keyJoiner: Array<{ key: string; delimiter: string }>
): Template {
  // todo: if multiple keys in input BUT no joiner in keyJoiner, throw error.

  // SO the genTemplateKeys are all generic. They are placed in the genTemplate.
  // We want to replace the generic keys with the matching keys from the template,
  // preserving order by index. if multiple are encountered, we find the
  // generic key in keyJoiner and find the delimiter for joiner.

  const keys = Object.keys(input);
  const matchedGenericKeys = new Set<string>();
  const matchedInputKeys: string[] = [];
  genTemplateKeys.forEach((genTemplKey) => {
    keys.forEach((inputKey) => {
      const keyName = getKeyName(inputKey);
      if (keyName === genTemplKey) {
        matchedGenericKeys.add(keyName);
        matchedInputKeys.push(inputKey);
      }
    });
  });
  if (matchedGenericKeys.size !== genTemplateKeys.length) {
    console.log("MATCHED GENERIC KEYS", matchedGenericKeys);
    console.log("GENERIC KEYS", genTemplateKeys);
    throw new Error("Not all keys were found in generateTemplateFromTemplate");
  }
  // console.log("MATCHED INPUT KEYS", matchedInputKeys);
  // console.log("GENERIC KEYS", genTemplateKeys);
  // matches now holds all keys from input that match the generic keys
  // in genTemplateKeys.
  // we can do a direct string swap for the keys in genTemplate.
  // genTemplateString is the template string that we want to replace
  // the generic keys with.

  let genTemplate = genTemplateString;
  genTemplateKeys.forEach((genTemplKey) => {
    const allMatchingKeys = matchedInputKeys.filter(
      (k) => getKeyName(k) === genTemplKey
    );
    const joinedMatchingKeys =
      allMatchingKeys.length > 1
        ? allMatchingKeys.join(
            keyJoiner.find((kj) => kj.key === genTemplKey)?.delimiter
          )
        : allMatchingKeys[0];
    genTemplate = genTemplate.replace(genTemplKey, joinedMatchingKeys);
  });
  // console.log("HOW DID IT GO??", genTemplate);
  const result = genTemplateWithVars(
    { [genTemplateMainKey]: () => genTemplate },
    matchedInputKeys
  );
  // console.log("FINAL", result, tts(result, false));
  return result;
}

export function performIfKeyHasDuplicateValue(
  input: Template,
  genericKey: string,
  cb: (t: Template) => Template
): Template {
  const ikeys = Object.keys(input);
  const genericKeyMatchesInput = ikeys.filter(
    (k) => getKeyName(k) === genericKey
  );
  if (genericKeyMatchesInput.length === 0) {
    throw new Error(
      "no matches found for input generic key in performIfTemplatesKeysHaveSameValue"
    );
  }
  const inputValues = genericKeyMatchesInput.map((k) => input[k]());
  const ivLength = inputValues.length;
  const ivSetLength = new Set(inputValues).size;
  if (ivLength > ivSetLength) {
    return cb(input);
  }
  return input;
}

export function swapMatchingValuesWithTemplate(
  input: Template,
  toSwapWith: Template,
  genericParentKey: string,
  genericMatchesOnValueKey: string
): Template {
  //console.log("INPUT", tts(input,false), "TOSWAPWITH", tts(toSwapWith, false));
  const keys = Object.keys(input);
  let result: Template = toSwapWith;
  const parentKeys = keys.filter((k) => getKeyName(k) === genericParentKey);
  if (parentKeys.length === 0)
    throw new Error("no parent keys found in swapMatchingValuesWithTemplate");
  //console.log("PARENT KEYS", parentKeys)
  const swapKeys = Object.keys(toSwapWith);
  const toMatchWithKey = swapKeys.find(
    (k) => getKeyName(k) === genericMatchesOnValueKey
  );
  if (toMatchWithKey == null)
    throw new Error(
      "toMatchWithKey not found in swapMatchingValuesWithTemplate"
    );
  const toMatchWithValue = toSwapWith[toMatchWithKey]();

  for (const pk of parentKeys) {
    const descendents = getDescendentsOfKey(pk, input);
    console.log("DESC", descendents);

    const toMatchOn = descendents.find(
      (d) => getKeyName(d) === genericMatchesOnValueKey
    );
    console.log("toMatchOn", toMatchOn);
    if (toMatchOn == null) break;
    const toMatchOnValue = input[toMatchOn]();
    console.log("toMatchOnValue", toMatchOnValue, "vs", toMatchWithValue);
    let matchedKeys: string[] = [];
    if (toMatchOnValue === toMatchWithValue) {
      const oldTemplate = getTemplatesFromKeys(descendents, input);
      console.log("oldTemplate", tts(oldTemplate, false));
      descendents.forEach((curr) => {
        console.log("CURRENT DESC KEY", curr, "vs swapKeys", swapKeys);
        swapKeys.forEach((k) => {
          console.log("k1", getKeyName(k), k, "curr", getKeyName(curr), curr);
          if (getKeyName(k) === getKeyName(curr)) {
            console.log("CHANGING KEY NAME", k, "to", curr);
            result = changeKeyName(result, k, curr);
            console.log("RESULT", changeKeyName(result, k, curr));
            matchedKeys.push(k);
          }
        });
      });

      // not all toSwapTemplate keys are used. we need to remove the unused ones.
      let unMatchedSwapKeys = swapKeys.filter((k) => !matchedKeys.includes(k));
      console.log("UNMATCHED", unMatchedSwapKeys);
      unMatchedSwapKeys.forEach((k) => {
        delete result[k];
      });

      console.log("REDUCTION", tts(result, false));
      console.log("PRESSWAP", tts(input, false));
      console.log("RESULT KEYS", Object.keys(result));
      Object.keys(result).forEach((k) => {
        input[k] = result[k];
      });
      console.log("POST SWAP", tts(input, false));
      return input;
    }
  }
  return input;
}

// will swap freakin' anything!!
// - A has denoms but B doesnt, vice versa
// - both have denoms
// - neither have denoms
// fuck yes.
export function swapAtKey(
  input: Template,
  keyA: string,
  keyB: string
): Template {
  const result = input;
  const aDenoms = getKeyDenominators(keyA);
  const bDenoms = getKeyDenominators(keyB);
  const aNumerator = keyA.split("/")[0];
  const bNumerator = keyB.split("/")[0];
  const newADenom = bDenoms.length > 0 ? "/" + bDenoms.join(",") : "";
  const newBDenom = aDenoms.length > 0 ? "/" + aDenoms.join(",") : "";
  const newAKey = aNumerator + newADenom;
  const newBKey = bNumerator + newBDenom;
  result[newAKey] = input[keyB];
  result[newBKey] = input[keyA];
  delete result[keyA];
  delete result[keyB];

  return result;
}

export function swapValuesWhenChildHasMatchingValue(
  input: Template,
  genericParentKey: string,
  genericMatchesOnValueKey: string
): Template {
  //console.log("INPUT", tts(input,false), "TOSWAPWITH", tts(toSwapWith, false));
  const matches = getKeysWithMatchingValues(input, genericMatchesOnValueKey);
  let result = input;
  Object.entries(matches).forEach(([k, v]) => {
    //console.log("K", k, "V", v);
    const parentKeys = compact(
      v.map((k) => findAncestorFromChild(k, genericParentKey, input))
    );
    //console.log("PARENT KEYS", parentKeys);
    result = swapAtKey(result, parentKeys[0], parentKeys[1]);
    //console.log("AFTER SWAP", tts(result, false));
    //console.log("SWAP COMBO", tts(result));
  });

  return result;
}

export function changeKeyName(
  input: Template,
  from: string,
  to: string
): Template {
  // console.log("changeKeyName", from, to);
  const keys = Object.keys(input);
  const fromNumerator = from.split("/")[0];

  const matchingKeys = keys.filter((k) => {
    const denoms = getKeyDenominators(k);
    const numerator = k.split("/")[0];
    return denoms?.includes(from) || numerator === fromNumerator;
  });

  const toNumerator = to.split("/")[0];
  matchingKeys.forEach((k) => {
    // change Template key
    const denoms = getKeyDenominators(k);
    const numerator = k.split("/")[0];
    const newNumerator =
      getKeyName(numerator) === getKeyName(fromNumerator)
        ? toNumerator
        : numerator;
    // console.log("NEW NUMERATOR", newNumerator);
    const newDenoms = denoms?.map((d) => (d === from ? to : d));
    const newKey =
      denoms != null ? `${newNumerator}/${newDenoms.join(",")}` : newNumerator;

    // change Template Part
    let templatePart = input[k].toString();
    // must change args and run statements in templatePart
    // to reflect new key
    const args = getArgsFromRunStatements(templatePart);
    if (args == null || args.length == 0) {
      input[newKey] = input[k];
    } else {
      const newArgs = args.map((a) => (a === from ? to : a));
      const runStatements: string[] = getRunStatements(templatePart);
      runStatements.forEach((runStmt) => {
        // unforunately, it could be either the compact rs or not
        if (runStmt === rsCompact(from)) {
          const newRs = rsCompact(to);
          templatePart = templatePart.replaceAll(runStmt, newRs);
        }
        if (runStmt === rs(from)) {
          const newRs = rs(to);
          templatePart = templatePart.replaceAll(runStmt, newRs);
        }
      });

      const templateString = templatePart.substring(
        templatePart.indexOf("`") + 1,
        templatePart.lastIndexOf("`")
      );
      const newTemplatePart = argsAndTemplateToFunction(
        newArgs,
        templateString
      );
      // console.log("NEW TEMPLATE PART!!!", newTemplatePart.toString());
      input[newKey] = newTemplatePart;
    }
    delete input[k];
  });

  return input;
}

// "it's not dumb if it works!"
export function dumbCombine(t1: Template, t2: Template): Template {
  return { ...t1, ...t2 };
}

export function insertIntoTemplate(
  input: Template,
  toInsert: Template
): Template {
  //console.log("TO INSERT", tts(toInsert, false), "INPUT", tts(input, false));
  // get all the keys in toInsert and make sure they have unique indexes before being inserted into input
  const allInputKeys = getAllKeys(input);
  let finalToInsert = cloneDeep(toInsert);

  const allToInsertKeys = getAllKeys(toInsert);
  allToInsertKeys.forEach((k) => {
    //check if k has a number in it
    if (k.match(/\d+/) == null) {
      // add a number to it, changeKeyName and move on.
      const newKey = k + 1;
      finalToInsert = changeKeyName(finalToInsert, k, newKey);
      // console.log("NEW FINAL", tts(finalToInsert, false));
    }
  });
  const finalToInsertKeys = getAllKeys(finalToInsert);
  const matchingInputKeys = allInputKeys.filter((ik) =>
    finalToInsertKeys.includes(ik)
  );

  // now re-write any keys with matching indices btwn input and toInsert
  matchingInputKeys.forEach((ik) => {
    // console.log("MATCHING KEY", ik);
    // guess what the dumb way is? add random number to index, recheck for existence
    // and repeat until it's unique
    let newKey = ik;
    let currentIndex = Number(getKeyIndex(ik) ?? 0);
    const keyName = getKeyName(ik);
    let isUnique = false;
    while (!isUnique) {
      newKey = keyName + currentIndex;
      // console.log("NEW KEY", newKey);
      if (
        !allInputKeys.includes(newKey) &&
        !finalToInsertKeys.includes(newKey)
      ) {
        isUnique = true;
        finalToInsert = changeKeyName(finalToInsert, ik, newKey);
      }
      currentIndex++;
    }
  });
  // console.log("returning")
  // combining this way means the input indices come first in the object for some reason
  return { ...finalToInsert, ...input };
}

// when it's mapped, we don't swap out the value.
// we say { key1: ({mappedKey1})=>`${mappedKey1}` }
// but we error out if emptyKey is not actually empty
export function appendKeyToKey(
  input: Template,
  appendKey: string,
  toKey: string
): Template {
  const result = cloneDeep(input);
  const fullToKey = Object.keys(input).find(
    (k) => getKeyNumerator(k) === toKey
  );
  // console.log("fulltoKey", fullToKey, "Tokey", toKey)
  const currentDenoms =
    fullToKey != null ? (getKeyDenominators(fullToKey) ?? []) : [];

  const args = [...currentDenoms, appendKey];

  const template =
    fullToKey != null
      ? getTemplateTextFromFunc(input[fullToKey]) + rsCompact(appendKey)
      : rsCompact(appendKey);
  const newKey = `${toKey}/${args.join(",")}`;
  const templatePart = argsAndTemplateToFunction(args, template);
  //console.log("NEW KEY", newKey, "TEMPL PART", templatePart.toString())
  result[newKey] = templatePart;
  if (fullToKey != null) delete result[fullToKey];
  return result;
}

export function orderedParse(
  input: Template,
  orderedParseTemplates: Template[]
): Template {
  const of = orderedFold(input, orderedParseTemplates, {
    mode: FoldMode.AllOrNothing,
  });
  if (of == null) throw new Error("orderedParse failed");
  return { ...of.result, ...of.divisors };
}

export function nestedParse(
  input: Template,
  orderedParseTemplates: Template[],
  nestCount: number
): Template {
  const rf = recursiveFold(
    input,
    orderedParseTemplates,
    [],
    { scope: () => `\n` },
    "  ",
    nestCount
  );

  return { ...rf.result, ...rf.divisors };
}