import React from "react";
import {
  BuilderGenerator,
  BuilderTemplate,
  BuilderWord,
  Types,
  useWordBuilder,
} from "../hooks/useWordBuilder";
import { FocusableElements } from "./BuilderAccordion";

import Typography from "@mui/joy/Typography";
import { Card } from "@mui/joy";
import ClearIcon from "@mui/icons-material/Clear";
import DynamicForm from "./DynamicForm";
import { useForm } from "react-hook-form";
import Chip from "@mui/joy/Chip";
import { useHotkeys } from "../hooks/useHotkeys";
import {
  getHotkeyMapForOutputItems,
  hotKeyToItem,
  itemToHotKey,
} from "../util/hotKeyBuilder";

export const WordEditorCard = ({
  name,
  inputs,
  inputSchema,
  outputName,
  hotkeys,
  setFocusedElement,
  idx,
  outputHotkey,
  showOutputHotkey,
  setFocusedStepIdx,
  outputHotkeys,
  removeStepFromWord,
  templatesMeta,
  formObject,
  formKeyPrefix,
  steps,
}: {
  name: string;
  inputs?: Record<string, any>;
  inputSchema: Record<string, Types>;
  outputName?: string;
  hotkeys: Map<string, any>;
  setFocusedElement: (val: FocusableElements) => void;
  idx: number;
  outputHotkey: string;
  showOutputHotkey: boolean;
  setFocusedStepIdx: (idx: number) => void;
  outputHotkeys: Map<string, any>;
  removeStepFromWord: (idx: number) => void;
  templatesMeta: BuilderTemplate[];
  formObject: any; // really, the react-hook-form object
  formKeyPrefix: string;
  steps: BuilderGenerator[];
}) => {
  //  console.log("RENDERING", name, inputs, outputs);
  const registerWithPrefix = (key: string) => {
    return formObject.register(`${formKeyPrefix}.${key}`);
  };
  console.log("FORM OBJECT", formObject);
  // we'll need to parse the input schema to determine what to put in the form
  return (
    <div
      style={{
        border: "1px solid black",
        padding: "10px",
        margin: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <span style={{ cursor: "pointer" }}>
          <ClearIcon fontSize="small" onClick={() => removeStepFromWord(idx)} />
        </span>
        <Typography level="body-xs">{name}</Typography>
      </div>
      <DynamicForm
        schema={inputSchema}
        steps={steps}
        stepIdx={idx}
        hotkeys={hotkeys}
        outputHotkeys={outputHotkeys}
        setFocusedElement={setFocusedElement}
        setFocusedStepIdx={() => setFocusedStepIdx(idx)}
        templatesMeta={templatesMeta}
        formObject={formObject}
        formKeyPrefix={formKeyPrefix}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <Typography level="body-xs">Outputs</Typography>
        <Chip variant="outlined" color="primary" size="sm">
          {outputName} {showOutputHotkey && <>| {outputHotkey}</>}
        </Chip>
      </div>
    </div>
  );
};
export const WordBuilderForm = ({
  stepHotKeys,
  wordsMeta,
  templatesMeta,
  generatorsMeta,
  setFocusedElement,
  setFocusedWord,
  templateHotKeys,
  wordIdx,
  focusedWord,
  isStepHotKeysEnabled,
  isTemplateHotKeysEnabled,
}: {
  stepHotKeys: Map<string, any>;
  wordsMeta: BuilderWord[];
  templatesMeta: BuilderTemplate[];
  generatorsMeta: BuilderGenerator[];
  setFocusedElement: (val: FocusableElements) => void;
  setFocusedWord: (val: number) => void;
  templateHotKeys: Map<string, any>;
  wordIdx: number;
  focusedWord: number;
  isStepHotKeysEnabled: boolean;
  isTemplateHotKeysEnabled: boolean;
}) => {
  const {
    newWord,
    runtimeError,
    addStepToWord,
    updateStepPosition,
    runWord,
    removeStepFromWord,
    submitWord,
  } = useWordBuilder({ wordsMeta, templatesMeta, generatorsMeta });
  const isFocused = wordIdx === focusedWord;
  useHotkeys(
    Array.from(stepHotKeys.keys()),
    (event) =>
      addStepToWord(hotKeyToItem(event.key, stepHotKeys), newWord.steps.length),
    { enabled: isFocused && isStepHotKeysEnabled }
  );
  const [focusedStepIdx, setFocusedStepIdx] = React.useState(null);
  function onSubmit(results) {
    console.log("submit", results, "steps", steps);
    submitWord(results);
  }
  const outputTemplateHotkeys = getHotkeyMapForOutputItems(
    newWord.steps,
    focusedStepIdx
  );
  const formObject = useForm();
  const { handleSubmit } = formObject;
  const { steps } = newWord;

  return (
    <div onClick={() => setFocusedWord(wordIdx)}>
      Word Builder
      <form onSubmit={handleSubmit(onSubmit)}>
        <label style={{fontSize: "12px"}}>
          Word name
          <input type="text" {...formObject.register("wordName")} />
        </label>
        <br />
        {steps.map((step, idx) => (
          <WordEditorCard
            {...step}
            steps={steps}
            hotkeys={templateHotKeys}
            setFocusedElement={setFocusedElement}
            idx={idx}
            outputHotkeys={outputTemplateHotkeys}
            outputHotkey={itemToHotKey(step.outputName, outputTemplateHotkeys)}
            showOutputHotkey={
              isTemplateHotKeysEnabled &&
              itemToHotKey(step.outputName, outputTemplateHotkeys) != null
            }
            setFocusedStepIdx={setFocusedStepIdx}
            removeStepFromWord={removeStepFromWord}
            templatesMeta={templatesMeta}
            formObject={formObject}
            formKeyPrefix={step.outputName}
          />
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
