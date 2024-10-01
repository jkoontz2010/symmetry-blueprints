import * as React from "react";
import Button from "@mui/joy/Button";
import { genTemplateWithVars, tts } from "symmetric-parser";
import Tooltip from "@mui/joy/Tooltip";
import Chip from "@mui/joy/Chip";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import Accordion from "@mui/joy/Accordion";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionSummary from "@mui/joy/AccordionSummary";
import Typography from "@mui/joy/Typography";
import { SortableItem } from "./SortableItem";
import { Box, Card, ChipDelete, Select, Sheet } from "@mui/joy";
import ClearIcon from "@mui/icons-material/Clear";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Item } from "./Item";
import {
  BuilderGenerator,
  BuilderTemplate,
  BuilderWord,
  Types,
  useWordBuilder,
} from "../hooks/useWordBuilder";
import {
  hotKeyToItem,
  itemToHotKey,
  getHotKeyMapForItems,
  getHotkeyMapForOutputItems,
} from "../util/hotKeyBuilder";
import { useHotkeys } from "react-hotkeys-hook";
import DynamicForm from "./DynamicForm";
import { template } from "@babel/core";
import { useForm } from "react-hook-form";

function identity(t: Template): Template {
  return t;
}
function combine(t1: Template, t2: Template): Template {
  return { ...t1, ...t2 };
}

type TemplateMeta = {
  name: string;
  templateBody: string;
  hotkey: string;
  showHotkey: boolean;
  vars: string[];
};

const TemplateNode = ({
  name,
  templateBody,
  vars,
  hotkey,
  showHotkey,
}: TemplateMeta) => {
  return (
    <Tooltip title={templateBody}>
      <Chip variant="outlined">
        {name}: {vars?.join(", ")} {showHotkey && <>| {hotkey}</>}
      </Chip>
    </Tooltip>
  );
};
type GeneratorMeta = {
  name: string;
  hotkey: string;
  showHotkey: boolean;
};

const GeneratorNode = ({ name, hotkey, showHotkey }: GeneratorMeta) => {
  return (
    <Tooltip title={name}>
      <Chip variant="outlined">
        {name} {showHotkey && <>| {hotkey}</>}
      </Chip>
    </Tooltip>
  );
};

type WordMeta = {
  name: string;
  steps: BuilderGenerator[];
  hotkey: string;
  showHotkey: boolean;
};

const WordNode = ({ name, steps, hotkey, showHotkey }: WordMeta) => {
  const text = steps.toString();
  return (
    <Tooltip title={text}>
      <Chip variant="outlined">
        {name} {showHotkey && <>| {hotkey}</>}
      </Chip>
    </Tooltip>
  );
};

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
  steps
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
  steps: BuilderGenerator[]
}) => {
  //  console.log("RENDERING", name, inputs, outputs);
  const registerWithPrefix = (key: string) => {
    return formObject.register(`${formKeyPrefix}.${key}`);
  };
  console.log("FORM OBJECT", formObject)
  // we'll need to parse the input schema to determine what to put in the form
  return (
    <Card>
      <div style={{ cursor: "pointer" }}>
        <ClearIcon onClick={() => removeStepFromWord(idx)} />
      </div>
      <Typography>{name}</Typography>
      <Typography>Inputs</Typography>
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
      <Typography>Outputs</Typography>
      <Chip variant="outlined" color="primary">
        {outputName} {showOutputHotkey && <>| {outputHotkey}</>}
      </Chip>
    </Card>
  );
};
//  console.log("RENDERING", name, inputs, outputs);
function handleSubmit(results) {
  console.log("submit", results);
}

export enum FocusableElements {
  builder,
  templateInput,
  none,
}

const BuilderAccordion = ({
  generatorsFileText,
  templatesFileText,
  wordsFileText,
}: {
  generatorsFileText: string;
  templatesFileText: string;
  wordsFileText: string;
}) => {
  if (
    generatorsFileText == null ||
    templatesFileText == null ||
    wordsFileText == null
  ) {
    return <div>Loading...</div>;
  }
  const {
    wordsMeta,
    templatesMeta,
    generatorsMeta,
    newWord,
    runtimeError,
    addStepToWord,
    updateStepPosition,
    runWord,
    removeStepFromWord,
    submitWord,
  } = useWordBuilder({ wordsFileText, templatesFileText, generatorsFileText });

  const [focusedElement, setFocusedElement] = React.useState<FocusableElements>(
    FocusableElements.builder
  );
  const [focusedStepIdx, setFocusedStepIdx] = React.useState(null);

  const templateHotKeys = getHotKeyMapForItems(templatesMeta);
  const stepHotKeys = getHotKeyMapForItems([...generatorsMeta, ...wordsMeta]);
  const outputTemplateHotkeys = getHotkeyMapForOutputItems(
    newWord.steps,
    focusedStepIdx
  );
  const isStepHotKeysEnabled = focusedElement === FocusableElements.builder;
  const isTemplateHotKeysEnabled =
    focusedElement === FocusableElements.templateInput;
  useHotkeys(
    Array.from(stepHotKeys.keys()),
    (event) =>
      addStepToWord(hotKeyToItem(event.key, stepHotKeys), newWord.steps.length),
    { enabled: isStepHotKeysEnabled }
  );
  console.log("what is focused?", focusedElement);
  const { steps } = newWord;
  function onSubmit(results) {
    console.log("submit", results, "steps", steps);
    submitWord(results);
  }

  const formObject = useForm();
  const { handleSubmit } = formObject;

  // have a useEffect check that the form properly sets the input template value based on what is in step.
  // that's odd though...there has to be a better way
  return (
    <div>
      <Sheet variant="outlined" color="neutral">
        Words
        {wordsMeta.map((w) => (
          <WordNode
            name={w.name}
            steps={w.steps}
            hotkey={itemToHotKey(w, stepHotKeys)}
            showHotkey={isStepHotKeysEnabled}
          />
        ))}
        <hr />
        Generators
        {generatorsMeta.map((g) => (
          <GeneratorNode
            name={g.name}
            hotkey={itemToHotKey(g, stepHotKeys)}
            showHotkey={isStepHotKeysEnabled}
          />
        ))}
        <hr />
        Template Pool
        {templatesMeta.map((t) => (
          <TemplateNode
            name={t.name}
            templateBody={t.templateBody}
            vars={t.vars}
            hotkey={itemToHotKey(t, templateHotKeys)}
            showHotkey={isTemplateHotKeysEnabled}
          />
        ))}
        <hr />
        Word Builder
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
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
              outputHotkey={itemToHotKey(
                step.outputName,
                outputTemplateHotkeys
              )}
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
      </Sheet>
    </div>
  );
};

export default BuilderAccordion;
