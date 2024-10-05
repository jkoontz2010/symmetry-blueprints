import {
    genTemplateWithVars,
    joiner,
    orderedFold,
    performOnNodes,
    recursiveFold,
    stringCleaning,
    swapValuesForGenericKeysWithCb,
    joinOnValue,
    replaceWithAllIsomorphic,
    collapseTemplateAtKey,
    stringUnCleaning,
    multiply,
    FoldMode,
    divide,
    Template,
  } from "symmetric-parser";
  
  export function parseGenerators(generatorFile: string) {
    const cleaned = stringCleaning(generatorFile);
    const file = { file: () => cleaned };
    const generator = genTemplateWithVars(
      {
        generator: () => `export function genName(genArgs): Template {genBody\n}`,
      },
      ["genName", "genArgs", "genBody"]
    );
    const fr = recursiveFold(
      file,
      [generator],
      [],
      { scope: () => `\n` },
      "  ",
      1
    );
  
    const frAll = {
      ...fr.result,
      ...fr.divisors,
    };
  
    const generatorParseTree = buildGeneratorParseTree(frAll);
  
    const generatorMeta = buildGeneratorMeta(generatorParseTree);
  
    const generatorString = stringUnCleaning(
      "[" + generatorMeta["metas"]() + "]"
    );
  // console.log("EVAL THIS", generatorString)
    const final = eval(generatorString);
    return final;
  }
  const replaceTempl = genTemplateWithVars(
    {
      typeDef: () => `{ typeDefBody\n}`,
    },
    ["typeDefBody"]
  );
  function buildGeneratorMeta(template: Template) {
    const replacedTypeNames = joinOnValue(
      "MapArg",
      "typeDefName", // better to use a template for the type safety
      "typeDefBody", // refactor for tomorrow^
      (t: Template) => {
        const of = orderedFold(t, [finalTypeKeyVal, finalTypeDefKeyVal], {
          mode: FoldMode.Strict,
        });
        if (of == null) throw new Error("null fold");
        const allOf = { ...of.result, ...of.divisors };
        const iso = multiply(
          replaceWithAllIsomorphic(allOf, [newTypeKeyVal]),
          {}
        );
  
        return multiply(iso, replaceTempl);
      },
      "typeValue",
      template
    );
    const replacedTypeNames2 = joinOnValue(
      "MapOnto",
      "typeDefName", // better to use a template for the type safety
      "typeDefBody", // refactor for tomorrow^
      (t: Template) => {
        const of = orderedFold(t, [finalTypeKeyVal, finalTypeDefKeyVal], {
          mode: FoldMode.Strict,
        });
        if (of == null) throw new Error("null fold");
        const allOf = { ...of.result, ...of.divisors };
        const iso = multiply(
          replaceWithAllIsomorphic(allOf, [newTypeKeyVal]),
          {}
        );
  
        return multiply(iso, replaceTempl);
      },
      "typeValue",
      replacedTypeNames
    );
    // console.log("JOIN", replacedTypeNames2);
    const genMeta = performOnNodes("generator", replacedTypeNames2, buildMeta);
    // console.log("GENMETA", tts(genMeta, false));
    // we want {name: "genName", inputSchema: {metaBody}}
    const allMeta = joiner(genMeta, "meta", "metas", ",\n");
    return allMeta;
  }
  
  function buildMeta(template: Template, index: number): Template {
    const cbFuncStringd = replaceWithAllIsomorphic(template, [newCbTemplFunc]);
    const folded = orderedFold(cbFuncStringd, [
      stringArrayTypeValueTempl,
      templateArrayTypeValueTempl,
      templateTypeValueTempl,
      stringTypeValueTempl,
      numberTypeValueTempl,
    ]);
    if (folded == null) throw new Error("null fold");
    const all = { ...folded.result, ...folded.divisors };
    //console.log("ALL", tts(all, false));
  
    const swapped = swapValuesForGenericKeysWithCb(all, [
      { key: "schemaTemplType", newValue: () => "'Template'" },
      { key: "schemaStrArrType", newValue: () => "'StringArray'" },
      { key: "schemaStrType", newValue: () => "'String'" },
      { key: "schemaTemplArrType", newValue: () => "'TemplateArray'" },
      { key: "schemaNumType", newValue: () => "'Number'" },
    ]);
  
    // what do we want this structure to be again..?
    // g1:()=>`{name:"identity",inputSchema:{template:Template}}`
  
    const funcStringd = replaceWithAllIsomorphic(swapped, [
      newFinalRemainderFuncTypes,
    ]);
  
    const normalized = replaceWithAllIsomorphic(funcStringd, [
      singleLineTypeKeyVal,
    ]);
  
    const replaced = replaceWithAllIsomorphic(normalized, [
      schemaArrayObjectTypeTempl,
      schemaSingleLineArrayObjectTypeTempl,
    ]);
  
    const collapsed = collapseTemplateAtKey(replaced, "genArgs");
    if (collapsed == null) throw new Error("null collapsed");
  
    const joined = joiner(collapsed, "genArgs", "genInputSchema", ",");
    // joiner, uh...works for single values pretty well, too.
    const name = joiner(template, "genName", "genName", "");
    const metaTempl = genTemplateWithVars(
      {
        ["meta" + index]: () =>
          "{ name: 'genName', inputSchema: { genInputSchema }}",
      },
      ["genName", "genInputSchema"]
    );
    const multi = multiply(multiply(joined, metaTempl), name);
    const commaFix = { doubleComma: () => `,,` };
    const detection = divide(multi, commaFix);
    const newDoubleComma = { doubleComma: () => `,` };
    const singleCommaOnly = multiply(detection, newDoubleComma);
  
    //console.log("FINISHEd33", tts(singleCommaOnly,false))
    return singleCommaOnly;
  }
  function buildGeneratorParseTree(generators: Template) {
    const gWithTypes = orderedFold(generators, [typesTempl]);
    if (gWithTypes == null) {
      throw new Error("No generators found");
    }
    const all = { ...gWithTypes.result, ...gWithTypes.divisors };
    //console.log("perf on nodeds");
    const parsedGenArgs = performOnNodes("genArgs", all, parseGenArgs);
    //console.log("fin parse tree");
    return parsedGenArgs;
  }
  function parseGenArgs(template: Template, index: number): Template {
    //console.count("parsegenargs");
    //console.log("*******************************************");
    //console.log("template", template);
    const of = recursiveFold(
      template,
      [
        cbFuncCommaTempl,
        cbFuncNewlineTempl,
        arrayObjectTypeTempl,
        singleLineArrayObjectTypeTempl,
        typeKeyVal,
        inlineSemiColonFuncKeyVal,
        semiColonTypes,
        finalLineTypeFuncKeyVal,
        finalTypeKeyVal,
        finalLineTypeKeyVal,
        remainderTypes,
        finalRemainderFuncTypes,
        finalRemainderTypes,
        singleLineTypeKeyVal,
        finalSingleLineTypeKeyVal,
        singleTypeTempl,
      ],
      [],
      { scope: () => `\n` },
      "  ",
      3,
      index
    );
    if (of == null) {
      throw new Error("No genArgs found");
    }
  
    const all = { ...of.result, ...of.divisors };
  
    return all;
  }
  
  const typesTempl = genTemplateWithVars(
    {
      typeDef: () => `type typeDefName = {typeDefBody\n};`,
    },
    ["typeDefName", "typeDefBody"]
  );
  
  const typeKeyVal = genTemplateWithVars(
    {
      typeKeyVal1: () => `\n  typeKeyName: typeValue,`,
    },
    ["typeKeyName", "typeValue"]
  );
  const finalTypeKeyVal = genTemplateWithVars(
    {
      typeKeyVal: () => `\n  typeKeyName: typeValue;\n`,
    },
    ["typeKeyName", "typeValue"]
  );
  const finalTypeDefKeyVal = genTemplateWithVars(
    {
      typeKeyVal: () => `  typeKeyName: typeValue;`,
    },
    ["typeKeyName", "typeValue"]
  );
  const newTypeKeyVal = genTemplateWithVars(
    {
      typeKeyVal: () => `typeKeyName: typeValue, `,
    },
    ["typeKeyName", "typeValue"]
  );
  const singleLineTypeKeyVal = genTemplateWithVars(
    {
      typeKeyVal: () => `typeKeyName: typeValue,`,
    },
    ["typeKeyName", "typeValue"]
  );
  const finalSingleLineTypeKeyVal = genTemplateWithVars(
    {
      typeKeyVal: () => ` typeKeyName: typeValue`,
    },
    ["typeKeyName", "typeValue"]
  );
  
  const finalLineTypeFuncKeyVal = genTemplateWithVars(
    {
      typeKeyVal898: () => `  typeKeyName: (typeFuncBody) => typeFuncReturn\n`,
    },
    ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
  );
  const finalLineTypeKeyVal = genTemplateWithVars(
    {
      typeKeyVal5: () => `  typeKeyName: typeValue\n`,
    },
    ["typeKeyName", "typeValue"]
  );
  const remainderTypes = genTemplateWithVars(
    {
      typeKeyVal: () => `typeKeyName: typeValue;`,
    },
    ["typeKeyName", "typeValue"]
  );
  const finalRemainderFuncTypes = genTemplateWithVars(
    {
      typeKeyVal: () => ` typeKeyName: (typeFuncBody) => typeFuncReturn `,
    },
    ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
  );
  const newFinalRemainderFuncTypes = genTemplateWithVars(
    {
      typeKeyVal: () => ` typeKeyName: "(typeFuncBody) => typeFuncReturn",`,
    },
    ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
  );
  const cbFuncCommaTempl = genTemplateWithVars(
    {
      cbTempl: () => `  cb: (cbTypeFuncBody) => Template,`,
    },
  
    ["cbTypeFuncBody"]
  );
  const numberTypeValueTempl = {
    schemaNumType: () => `number`,
  };
  const cbFuncNewlineTempl = genTemplateWithVars(
    {
      cbTempl: () => `  cb: (cbTypeFuncBody) => Template`,
    },
  
    ["cbTypeFuncBody"]
  );
  const newCbTemplFunc = genTemplateWithVars(
    {
      cbTempl: () => `  cb: "(cbTypeFuncBody) => Template",`,
    },
  
    ["cbTypeFuncBody"]
  );
  const finalRemainderTypes = genTemplateWithVars(
    {
      typeKeyVal: () => ` typeKeyName: typeValue `,
    },
    ["typeKeyName", "typeValue"]
  );
  
  const arrayObjectTypeTempl = genTemplateWithVars(
    {
      arrayNestType: () => `Array<{objTypeBody\n  }>`,
    },
    ["objTypeBody"]
  );
  
  const schemaArrayObjectTypeTempl = genTemplateWithVars(
    {
      arrayNestType: () => `[{objTypeBody\n  }]`,
    },
    ["objTypeBody"]
  );
  
  const singleLineArrayObjectTypeTempl = genTemplateWithVars(
    {
      arrayObjectType: () => `Array<{ objTypeBody}>`,
    },
    ["objTypeBody"]
  );
  
  const schemaSingleLineArrayObjectTypeTempl = genTemplateWithVars(
    {
      arrayObjectType: () => `[{ objTypeBody}]`,
    },
    ["objTypeBody"]
  );
  
  const semiColonTypes = genTemplateWithVars(
    {
      typeKeyVal: () => `  typeKeyName: typeValue;`,
    },
    ["typeKeyName", "typeValue"]
  );
  
  const singleTypeTempl = genTemplateWithVars(
    {
      singleType: () => `typeKeyName: typeValue`,
    },
    ["typeKeyName", "typeValue"]
  );
  const templateTypeValueTempl = {
    schemaTemplType: () => `Template`,
  };
  const stringTypeValueTempl = {
    schemaStrType: () => `string`,
  };
  const stringArrayTypeValueTempl = {
    schemaStrArrType: () => `string[]`,
  };
  const templateArrayTypeValueTempl = {
    schemaTemplArrType: () => `Template[]`,
  };
  
  const singleLineTypeFuncKeyVal = genTemplateWithVars(
    {
      typeKeyVal: () => `  typeKeyName: (typeFuncBody) => typeFuncReturn,\n`,
    },
  
    ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
  );
  
  const inlineSemiColonFuncKeyVal = genTemplateWithVars(
    {
      typeKeyVal: () => `typeKeyName: (typeFuncBody) => typeFuncReturn;`,
    },
  
    ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
  );
  