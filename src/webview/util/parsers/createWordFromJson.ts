import { applyToGenericHomomorphism, collapseAllBelowChildrenOfKey, FoldMode, genTemplateWithVars, joiner, joinOnSameValue, orderedFold, performIfHasTemplates, performOnNodes, recursiveFold, replaceWithAllIsomorphic, swapValuesForGenericKeysWithCb } from "symmetric-parser";
import { sortTemplateByDeps, Template } from "symmetric-parser/dist/src/templator/template-group";

const inputSchemaArrayKeyVal = genTemplateWithVars(
    {
      inputSchemaArrayKeyVal: () =>
        `\n      "schemaInputKey": [schemaInputValue\n      ],`,
    },
    ["schemaInputKey", "schemaInputValue"]
  );
  
  const inputSchemaObjectBody = genTemplateWithVars(
    {
      inputSchemaObjectBody: () => `      {schemaObjectBody\n      }`,
    },
    ["schemaObjectBody"]
  );
  
  const quotedSchemaKeyVal = genTemplateWithVars(
    {
      inputSchemaKeyVal: () => `\n    "schemaInputKey": "schemaInputValue",`,
    },
    ["schemaInputKey", "schemaInputValue"]
  );
  
  const endingSchemaKeyVal = genTemplateWithVars(
    {
      inputSchemaKeyVal: () => `\n    "schemaInputKey": "schemaInputValue"`,
    },
    ["schemaInputKey", "schemaInputValue"]
  );
  
  const inputValueArrayKeyVal = genTemplateWithVars(
    {
      inputValueArrayKeyVal: () =>
        `\n      "valueInputKey": [valueInputValue\n      ]`,
    },
    ["valueInputKey", "valueInputValue"]
  );
  
  const inputValueObjectBody = genTemplateWithVars(
    {
      inputValueObjectBody: () => `      {valueObjectBody\n      }`,
    },
    ["valueObjectBody"]
  );
  
  const quotedValueKeyVal = genTemplateWithVars(
    {
      inputValueKeyVal: () => `\n    "valueInputKey": "valueInputValue",`,
    },
    ["valueInputKey", "valueInputValue"]
  );
  
  const quotedKeyUnquotedValue = genTemplateWithVars(
    {
      inputValueKeyVal: () => `\n    "valueInputKey": valueInputValue,`,
    },
    ["valueInputKey", "valueInputValue"]
  );
  
  const endingValueKeyVal = genTemplateWithVars(
    {
      inputValueKeyVal: () => `\n    "valueInputKey": "valueInputValue"`,
    },
    ["valueInputKey", "valueInputValue"]
  );
  
  const stepBody = genTemplateWithVars(
    {
      stepBody: () => `\n  {stepElement\n  }`,
    },
    ["stepElement"]
  );

const inputSchemaTempl = genTemplateWithVars(
    {
      inputSchema: () => `\n    "inputSchema": {schemaBody
      }`,
    },
    ["schemaBody"]
  );
  
  const inputValuesTempl = genTemplateWithVars(
    {
      inputValues: () => `\n    "inputValues": {inputValuesBody
      }`,
    },
    ["inputValuesBody"]
  );
  const templNameSchema = genTemplateWithVars(
    {
      templNameSchema: () => `\n    "name": "templName",`,
    },
    ["templName"]
  );
  
  const outputNameSchema = genTemplateWithVars(
    {
      outputNameSchema: () => `\n    "outputName": "varNameForOutput",`,
    },
    ["varNameForOutput"]
  );
export function parseSteps(steps: string) {
    const file = { file: () => steps };
    const stepOf = orderedFold(file, [stepBody],{mode:FoldMode.Strict});
    if(stepOf == null) throw new Error("null fold");
    const stepOfResult = { ...stepOf.result, ...stepOf.divisors };
    const sortedByDeps = sortTemplateByDeps(stepOfResult)
    // /console.log("OFRESULT", tts(sortedByDeps,false));
    const stepFunctions = performOnNodes("stepElement", sortedByDeps, createFunctionCodeFromStep);
    //console.log("STEP FUNCTIONS", tts(stepFunctions,false));
    const word = joiner(stepFunctions, "stepExpression", "word", "\n");
    //console.log("FINAL WORD", tts(word,false))
    return word;
  }
  
  function createFunctionCodeFromStep(stepTemplate: Template, index: number) {
    // console.log("STEP TEMPLATE", tts(stepTemplate, false));
    const of = recursiveFold(
      stepTemplate,
      [outputNameSchema, templNameSchema, inputSchemaTempl, inputValuesTempl],
      [],
      { scope: () => `\n` },
      "  ",
      1
    );
    const ofResult = { ...of.result, ...of.divisors };
  
    const typed = performOnNodes("inputSchema", ofResult, (t: Template) => {
      // TODO: ADD cb TEMPLATE
      const of = recursiveFold(
        t,
        [
          inputSchemaObjectBody,
          quotedSchemaKeyVal,
          inputSchemaArrayKeyVal, //save for last
          endingSchemaKeyVal,
        ],
        [],
        { scope: () => `\n` },
        "  ",
        6
      );
      if (of == null) throw new Error("null fold");
      const allOf = { ...of.result, ...of.divisors };
      return allOf;
    });
  
    const valuesParsed = performOnNodes("inputValues", typed, (t: Template) => {
      const of = recursiveFold(
        t,
        [
          inputValueObjectBody,
          quotedValueKeyVal,
          inputValueArrayKeyVal, //save for last
          endingValueKeyVal,
        ],
        [],
        { scope: () => `\n` },
        "  ",
        6
      );
      if (of == null) throw new Error("null fold");
      const allOf = { ...of.result, ...of.divisors };
  
      return allOf;
    });
    const templateTypeTempl = {
      templateType: () => `Template`,
    };
  
    const stringTypeTempl = {
      stringType: () => `String`,
    };
  
    const stringArrayTypeTempl = {
      stringArrayType: () => `StringArray`,
    };
  
    const templateArrayTypeTempl = {
      templateArrayType: () => `TemplateArray`,
    };
  
    const numberTypeTempl = {
      numberType: () => `Number`,
    };
  
    const joinedOnValue = joinOnSameValue(
      "valueInputKey",
      "schemaInputKey",
      (t: Template) => {
        // we leave strings as is, so don't bother transforming them.
        // stick to Template and Number.
        const t2 = performIfHasTemplates(
          t,
          [templateTypeTempl],
          (t: Template) => {
            // the beautiful replaceWithAllIsomorphic
            const iso = replaceWithAllIsomorphic(t, [quotedKeyUnquotedValue]);
            return iso;
          }
        );
        const t3 = performIfHasTemplates(t2, [numberTypeTempl], (t: Template) => {
          const iso = replaceWithAllIsomorphic(t, [quotedKeyUnquotedValue]);
          return iso;
        });
        return t3;
      },
      valuesParsed
    );
  
    // this will come home to bite us.
    // it only collapses the arrays.
    // what when there's an object to pass?
    // ...actually I guess you'd just pass the object.
    // ......huh.
    const collapsedAtArray = collapseAllBelowChildrenOfKey(joinedOnValue, "inputValueArrayKeyVal");
    const joinedOnValueAfterCollapse = joinOnSameValue(
      "valueInputKey",
      "schemaInputKey",
      (t: Template) => {
        // we leave strings as is, so don't bother transforming them.
        // stick to Template and Number.
        const t1 = performIfHasTemplates(
          t,
          [stringTypeTempl],
          (t: Template) => {
            // the beautiful replaceWithAllIsomorphic
            const swapped = swapValuesForGenericKeysWithCb(t, [
              { key: "valueInputValue", newValue: (s) => `"${s}"` },
            ]);
            return swapped;
          }
        );
        return t1;
      }, collapsedAtArray)
    //console.log("POST JOINED", tts(joinedOnValueAfterCollapse, false));
    const joinedValues = joiner(joinedOnValueAfterCollapse, "valueInputValue", "stepArgs", ", ");
    //console.log("ALL JOINED", tts(joinedValues,false));
  
    const stepTempl = genTemplateWithVars(
      {
        ["stepExpression"+index]: () => `const varNameForOutput = templName(stepArgs);\n`,
      },
      ["varNameForOutput", "templName", "stepArgs"]
    );
  
    const step = applyToGenericHomomorphism({...collapsedAtArray, ...joinedValues}, stepTempl);
    return step;
  }