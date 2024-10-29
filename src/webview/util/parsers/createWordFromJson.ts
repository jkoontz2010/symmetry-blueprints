
import {
  collapseAllBelowChildrenOfKey,
  sortTemplateByDeps,
  FoldMode,
  genTemplateWithVars,
  joiner,
  joinOnSameValue,
  orderedFold,
  performIfHasTemplates,
  performOnNodes,
  recursiveFold,
  replaceWithAllIsomorphic,
  swapValuesForGenericKeysWithCb,
  generateTemplateFromTemplate,
  multiply,
  mapIndexOfKey1AndValueOfKey2ToKey3,
  performIfGenericKeyIsTemplate,
  performIfHasGenericKey,
  tts,
  makeTemplateGenericAtKey,
  findFirst,
  findLast,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

const fullWord = genTemplateWithVars(
  {
    fullWord: () => `export function wordName(wordInput: Template) {
  wordBody
}`,
  },
  ["wordName", "wordBody"]
);

export function buildWordFromNameAndBody(name: string, body: Template) {
  const nameTempl = {wordName:()=> `${name}`}
  const word = multiply(multiply(fullWord, body), nameTempl);
  return word;
}
export function buildWordBodyFromSteps(steps: string) {
  const file = { file: () => steps };
  //console.log("STEPS", steps)
  const stepOf = orderedFold(file, [stepBody], { mode: FoldMode.Strict });
  if (stepOf == null) throw new Error("null fold");
  const stepOfResult = { ...stepOf.result, ...stepOf.divisors };
  //console.log("OFRESULT", tts(stepOfResult, false));
  const sortedByDeps = sortTemplateByDeps(stepOfResult);
  // console.log("OFRESULT", tts(sortedByDeps, false));
  const stepFunctions = performOnNodes(
    "stepElement",
    sortedByDeps,
    createFunctionCodeFromStep
  );
  // console.log("STEP FUNCTIONS", tts(stepFunctions, false));

  const word = buildWordBody(stepFunctions);
 //console.log("FINAL WORD", tts(word, false));

  return word;
}
function buildWordBody(stepExpressions: Template) {
  // create word wrapper with name, etc
  // build the return stmt from the last stepExpression, orderFold on const name =
  const lastStepExpr = findLast(stepExpressions, "stepExpression");

  const something = orderedFold(lastStepExpr, [stepExprName], {
    mode: FoldMode.Strict,
  });
  if (something == null) return stepExpressions;
  const { result } = something;
  const nameExpr = findFirst(result, "name");
  const generic = makeTemplateGenericAtKey(nameExpr, "name");
  const retStepExpr = genTemplateWithVars(
    {
      stepExpression99999: () => `return name;`,
    },
    ["name"]
  );
  const returnStmt = multiply(generic, retStepExpr);
  const combined = {...stepExpressions, ...returnStmt};
  return joiner(combined, "stepExpression", "wordBody", "\n");
}

function createFunctionCodeFromStep(stepTemplate: Template, index: number) {
  console.log("STEP TEMPLATE", tts(stepTemplate, false));
  const of = recursiveFold(
    stepTemplate,
    [outputNameSchema, templNameSchema, inputSchemaTempl, inputValuesTempl],
    [],
    { scope: () => `\n` },
    "  ",
    1
  );
  const ofResult = { ...of.result, ...of.divisors };
console.log("OF RESULT W#@@@", ofResult)
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
    // NEW: create code template from the schema stuff
     console.log("ALL OF", tts(allOf, false));
    return allOf;
  });

  const valuesParsed = performOnNodes("inputValues", typed, (t: Template) => {
    const of = recursiveFold(
      t,
      [
        inputValueObjectBody,
        quotedValueKeyVal, //save for last
        inputValueArrayKeyVal,
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
    "schemaInputKey",
    "valueInputKey",
    (t: Template) => {
      console.log("JOIN ON VALUE", tts(t, false));
      // we leave strings as is, so don't bother transforming them.
      // stick to Template and Number.
      // ONLY DO THIS on the schemaInputKey. If you check valueInputKey for these templates, it'll snag the wrong ones.
      const t1 = performIfGenericKeyIsTemplate(
        t,
        "schemaInputValue",
        templateTypeTempl,
        (t: Template) => {
          // the beautiful replaceWithAllIsomorphic
          const iso = replaceWithAllIsomorphic(t, [quotedKeyUnquotedValue]);
          return iso;
        }
      );

      const t2 = performIfGenericKeyIsTemplate(
        t1,
        "schemaInputValue",
        templateArrayTypeTempl,
        (t: Template) => {
          // you can flip and flop and do a bunch of gymnastics
          // but sometime the quickest path is just a string replace.
          const newlyArrayed = swapValuesForGenericKeysWithCb(t, [
            {
              key: "valueInputValue",
              newValue: (str: string) => `[${str.split(`"`).join("")}]`,
            },
          ]);

          return newlyArrayed;
        }
      );

      const t3 = performIfHasTemplates(t2, [numberTypeTempl], (t: Template) => {
        const iso = replaceWithAllIsomorphic(t, [quotedKeyUnquotedValue]);
        return iso;
      });

      return t3;
    },
    valuesParsed,
    undefined
  );

  // this will come home to bite us.
  // it only collapses the arrays.
  // what when there's an object to pass?
  // ...actually I guess you'd just pass the object.
  // ......huh.
  const collapsedAtArray = collapseAllBelowChildrenOfKey(
    joinedOnValue,
    "inputValueArrayKeyVal"
  );
  const collapsedSchema = collapseAllBelowChildrenOfKey(
    collapsedAtArray,
    "inputSchemaArrayKeyVal"
  );
  console.log("COLLAPSEATARRY", tts(collapsedSchema, false));
  const joinedOnValueAfterCollapse = joinOnSameValue(
    "valueInputKey",
    "schemaInputKey",
    (t: Template) => {
      console.log("NEXT JOIN ON VALUE", t);
      // we leave strings as is, so don't bother transforming them.
      // stick to Template and Number.
      const t0 = performIfHasGenericKey(
        t,
        "inputSchemaArrayKeyVal",
        (t: Template) => {
          //  console.log("OBJECT WORK", tts(t,false))
          const newlyArrayed = swapValuesForGenericKeysWithCb(t, [
            {
              key: "valueInputValue",
              newValue: (str: string) => `[${str}]`,
            },
          ]);
          return newlyArrayed;
        }
      );
      //console.log("__________________________________________")
      const t1 = performIfGenericKeyIsTemplate(
        t0,
        "schemaInputValue",
        stringTypeTempl,
        (t: Template) => {
          // the beautiful replaceWithAllIsomorphic
          const swapped = swapValuesForGenericKeysWithCb(t, [
            { key: "valueInputValue", newValue: (s) => `"${s}"` },
          ]);
          return swapped;
        }
      );
      // what I want from this is {arg232: () => viv}
      const t2 = mapIndexOfKey1AndValueOfKey2ToKey3(
        t1,
        "schemaInputKey",
        "valueInputValue",
        "arg"
      );
      console.log("WHAT IS t2",  t2);
      return t2;
    },
    collapsedSchema,
    "schemaInputKey"
  );
  console.log("POST COLLAPDS", tts(joinedOnValueAfterCollapse, false));

  const wordTemplate = generateTemplateFromTemplate(
    joinedOnValueAfterCollapse,
    "stepExpression" + index,
    `const varNameForOutput = templName(arg);`,
    ["varNameForOutput", "templName", "arg"],
    [{ key: "arg", delimiter: ", " }]
  );

  const step = multiply(wordTemplate, joinedOnValueAfterCollapse);
  // console.log("step TEMPLATE", tts(step, false));
  return step;
  /*
  const sortedJoinedOnValueAfterCollapse = sortTemplateByDeps(
    joinedOnValueAfterCollapse
  );
  //console.log("SORTED", tts(sortedJoinedOnValueAfterCollapse, false));
  const joinedValues = joiner(
    sortedJoinedOnValueAfterCollapse,
    "valueInputValue",
    "stepArgs",
    ", "
  );
  //console.log("ALL JOINED", tts(joinedValues, false));

  const stepTempl = genTemplateWithVars(
    {
      ["stepExpression" + index]: () =>
        `const varNameForOutput = templName(stepArgs);\n`,
    },
    ["varNameForOutput", "templName", "stepArgs"]
  );

  const step = applyToGenericHomomorphism(
    { ...collapsedAtArray, ...joinedValues },
    stepTempl
  );
  
  console.log("STEP FINAL", tts(step,false))
  return step;
  */
}

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

const stepExprName = genTemplateWithVars(
  {
    stepExprName: () => `const name = `,
  },
  ["name"]
);