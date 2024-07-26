import _ from "lodash";
import { applyToIndex, changeTemplateArgs, cleanIndexingFromKeys, getAllKeysWithNumeratorString, getDescendentsOfKey, getKeyName, getTemplatesFromKeys, orderedFold, recursiveFold } from "symmetric-parser";
import { argsAndTemplateToFunction, combine, multiply, Template } from "symmetric-parser/dist/src/templator/template-group";
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
  templates: Template,
  mapOnto: MapOnto
): Template {
  //console.log("ONTO REDUCER", tts(templates), tts(mapOnto.onto), mapOnto.froms);
  const fromKeyPairs: { [keyIndex: string]: Array<string> } = {};
  let finalTemplate: Template = {};
  Object.keys(templates).forEach((key) => {
    const keyName = key.split(/[0-9]/)[0];
    const keyIndex = key.substring(key.search(/[0-9]/));
    if (mapOnto.froms.includes(keyName)) {
      if (!Array.isArray(fromKeyPairs[keyIndex])) {
        fromKeyPairs[keyIndex] = [];
      }
      fromKeyPairs[keyIndex].push(key);
    }
  });
  // console.log("FROM KEY PAIRS", fromKeyPairs);
  Object.keys(fromKeyPairs).forEach((keyIndex, i) => {
    const keyNames = fromKeyPairs[keyIndex];
    const keyNameMap = keyNames.reduce((acc, keyName) => {
      acc = Object.assign(acc, { [keyName.split(/[0-9]/)[0]]: keyName });
      return acc;
    }, {});
    // note we're giving it the same keyIndex it had. makes conversions easier. OR DOES IT BREAK THINGS??
    const result = changeTemplateArgs(mapOnto.onto, keyNameMap, keyIndex);
    // console.log("RESULT", tts(result));
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
};
// change the keys from "from" to "to". very simple, that's it.
// used when you want to change the names of keys.
export function mapper(templates: Template, map: MapArg): Template {
  const fromKeys = Object.keys(templates).filter((key) => {
    const keyName = key.split(/[0-9]/)[0];

    return keyName === map.from;
  });
//  console.log("MAPPER FROM KEYS", fromKeys, map, Object.keys(templates));
  const reduced = fromKeys.reduce(
    (acc: Template, fromKey: string, i: number) => {
      // notes continued on Obsidian
      // obsidian://open?vault=All&file=HGCG%20reducer%20templates%20for%20creating%20sections%20of%20template%20types
      const newIdentifier = `${i}m`;
      acc = { ...acc, [map.to + newIdentifier]: templates[fromKey] };
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
  templates: Template,
  joinOn: string,
  keyName: string,
  joinWith: string
): Template {
  // /console.log("JOINER HERE", joinOn, keyName, joinWith, tts(templates, false));
  const filteredTemplateKeys = Object.keys(templates).filter((t) => {
    const tKey = t.split(/[0-9]/)[0];
    return tKey === joinOn;
  });
  //console.log("filtered templ keys", filteredTemplateKeys);
  return {
    [keyName]: argsAndTemplateToFunction(
      [],
      filteredTemplateKeys.map((t) => templates[t]()).join(joinWith)
    ),
  };
}

// shallow copy, but still monoidal
export function filterOn(templates: Template, filterFor: string[]): Template {
  const toDelete = Object.keys(templates).filter((t) => {
    const tKey = t.split(/[0-9]/)[0];

    return !filterFor.includes(tKey);
  });
  // otherwise it'll destroy the referenced arg
  const newTemplate = cloneDeep(templates);
  toDelete.forEach((t) => delete newTemplate[t]);
  return newTemplate;
}

export function swapValuesForKeys(
  templates: Template,
  keyVals: Array<{ key: string; newValue: string }>
): Template {
  keyVals.forEach(({ key, newValue }) => {
    if (key.split("/")[1] != null) {
      throw new Error("CAN ONLY SWAP ON PURE KEYS, NOT ONES with denominators");
    }
    templates[key] = () => newValue;
  });

  return templates;
}

export function swapValuesForGenericKeysWithCb(
  templates: Template,
  keyVals: Array<{ key: string; newValue: (str: string) => string }>
): Template {
  keyVals.forEach(({ key, newValue }) => {
    if (key.split("/")[1] != null) {
      throw new Error("CAN ONLY SWAP ON PURE KEYS, NOT ONES with denominators");
    }
    const matchingKeys = Object.keys(templates).filter((tk) => {
      const keyName = getKeyName(tk);
      return keyName === key;
    });

    try {
      matchingKeys.forEach((mk) => {
        const value = newValue(templates[mk]());
        templates[mk] = () => value;
      });
    } catch (e) {
      console.log("ERROR in swapValuesForGenericKeysWithCb", e);
    }
  });

  return templates;
}
export function makeTemplateGenericAtKey(
  template: Template,
  key: string
): Template {
  const fieldKeys = getAllKeysWithNumeratorString(template, key);
  const genT = getDescendentsOfKey(fieldKeys[0], template);
  const t = getTemplatesFromKeys(genT, template);
  return cleanIndexingFromKeys(t);
}

export function fillTemplateWithMappedKeys(
  mappings: Array<{
    template: Template;
    fromToKeys: Array<{ from: string; to: string }>;
  }>,
  toFill: Template
): Template {
  let mappedTemplate: Template = {};
  let ontoTemplate: Template = {};
  mappings.forEach(({ template, fromToKeys }, i) => {
    fromToKeys.forEach(({ from, to }, i) => {
      const mapping = mapper(template, { from, to });
      mappedTemplate = combine(mappedTemplate, mapping);
    });
    const onto = applyManyToGeneric(mappedTemplate, {
      froms: fromToKeys.map((ftk) => ftk.to),
      onto: toFill,
    });
    ontoTemplate = combine(ontoTemplate, onto);
  });

  return multiply(mappedTemplate, ontoTemplate);
}

export function replaceAllAWithB(
  template: Template,
  a: Template,
  b: Template
): Template {
  const scopeTemplate = {
    scope: () => `\n`,
  };
  const { result } = recursiveFold(template, [a], [], scopeTemplate, "  ", 12);
  //console.log("the fold", tts(result))
  const toB = applyManyToGeneric(result, {
    froms: flatten(Object.keys(a).map((k) => k.split("/")[1]?.split(","))),
    onto: b,
  });
  //console.log("replaceAllWith?", tts(toB));
  const multi = multiply(result, toB);
  //console.log("multid", tts(multi))
  return multi;
}

export function performIfHasTemplates(
  on: Template,
  templates: Template[],
  cb: (t: Template) => Template
): Template {
  let of = orderedFold(on, templates, true);
  if (of == null) {
    return on;
  } else {
    return cb({ ...of.result, ...of.divisors });
  }
}

export function performIfNotHasTemplates(
  on: Template,
  templates: Template[],
  cb: (t: Template) => Template
): Template {
  let of = orderedFold(on, templates, true);
  if (of == null) {
    return cb(on);
  } else {
    return on;
  }
}

export function applyAtDuplicate(
  rootKey: string,
  template: Template,
  cb: (t: Template) => Template
): Template {
  const keys = Object.keys(template);
  let result: Template = {};
  keys.forEach((k) => {
    let duplicate: Template = {};
    const normalKey = getKeyName(k);
    if (normalKey === rootKey) {
      const childKeys = getDescendentsOfKey(k, template).concat(k);
      const filteredTemplates: Template = {};
      childKeys.forEach((ck) => {
        filteredTemplates[ck] = template[ck];
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
      result[k] = template[k];
    }
  });
  // console.log("WHAT IS RESULT?", tts({ ...template, ...result }, false));
  return { ...template, ...result };
}

export function identity(t: Template): Template {
  return t;
}

// alternative name: isolateCallbackToKey
export function performOnNodes(
  rootKey: string,
  templates: Template,
  cb: (t: Template) => Template
): Template {
  const keys = Object.keys(templates);
  let result: Template = {}; // must include all prior!!
  keys.forEach((k) => {
    const normalKey = k.split(/[0-9]/)[0]; // or whatever we call strip
    if (normalKey === rootKey) {
      // . . .
      const childKeys = getDescendentsOfKey(k, templates).concat(k);
      const filteredTemplates: Template = {};
      childKeys.forEach((ck) => {
        filteredTemplates[ck] = templates[ck];
      });
     // console.log("_____________________________________");
      //console.log("FILTERED TEMPL", tts(filteredTemplates))
      const cbResult = cb(filteredTemplates);
   //   console.log("HERE WITH CBRULEST", tts(cbResult));
      result = { ...result, ...cbResult }; //..right?
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
      result[k] = templates[k];
    }
  });
  //console.log("FIN OF PON", tts(result));
  return result;
}

// probably not even monoidal. not reversible? not associative?
// might be though, should check some day.
export function applyToSkeleton(
  t: Template,
  skeleton: Template,
  mappings: Array<{ key: string; toKey: string }>
): Template {
  let joinedTemplate: Template = {};
  mappings.forEach((mapping) => {
    const { key, toKey } = mapping;
    // might not need, test without first
    const ct = collapseTemplateAtKey(t, key);
    const joined = joiner(ct, key, toKey, "");
    //console.log("joined", tts(joined, false));
    joinedTemplate = { ...joinedTemplate, ...multiply(joinedTemplate, joined) };
  });

  //console.log("FINAL JOINEd", tts(joinedTemplate, false));
  //console.log("SKELEOTN", tts(skeleton, false))
  return multiply(joinedTemplate, skeleton);
}

export function collapseTemplateAtKey(template: Template, key: string): Template {
  const keys = Object.keys(template);
  //console.log("KEYS", keys, "KEY", key);
  const tCopy = cloneDeep(template);
  let result: Template = {};
  keys.forEach((k) => {
    const normalKey = getKeyName(k);
    //console.log("NORMAL", normalKey, key);
    if (normalKey === key) {
      //console.log("YUP", tCopy[k]);
      result = { ...result, [k]: tCopy[k] };
      //console.log("RESULT, ", result);
      delete tCopy[k];
    }
  });
  //console.log("PRE", tts(result, false), tts(tCopy, false));
  //console.log("RESULT", tts(multiply(result, tCopy), false));
  // so it's still being multiplied by file. we need to remove it
  // to do so, we need to remove all keys with "keys" in the denom
  const keysToRemove = Object.keys(tCopy).filter((k) =>
    k.split("/")[1]?.includes(key)
  );
  //console.log("LAKSJDFLKASJDFLKASJDFLKAJSDFLKJ", keysToRemove)
  keysToRemove.forEach((k) => delete tCopy[k]);
  return multiply(result, tCopy);
}
