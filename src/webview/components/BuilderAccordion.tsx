import * as React from "react";
import Tooltip from "@mui/joy/Tooltip";
import Chip from "@mui/joy/Chip";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import { Sheet } from "@mui/joy";
import {
  BuilderGenerator
} from "../hooks/useWordBuilder";
import {
  itemToHotKey,
  getHotKeyMapForItems
} from "../util/hotKeyBuilder";
import { useMeta } from "../hooks/useMeta";
import { WordBuilderForm } from "./WordBuilderForm";

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
  const { wordsMeta, templatesMeta, generatorsMeta } = useMeta({
    wordsFileText,
    templatesFileText,
    generatorsFileText,
  });

  const [focusedElement, setFocusedElement] = React.useState<FocusableElements>(
    FocusableElements.builder
  );

  const templateHotKeys = getHotKeyMapForItems(templatesMeta);
  const stepHotKeys = getHotKeyMapForItems([...generatorsMeta, ...wordsMeta]);

  const isStepHotKeysEnabled = focusedElement === FocusableElements.builder;
  const isTemplateHotKeysEnabled =
    focusedElement === FocusableElements.templateInput;

  console.log("what is focused?", focusedElement);
  const [focusedWord, setFocusedWord] = React.useState(0);
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
        <WordBuilderForm
          stepHotKeys={stepHotKeys}
          wordsMeta={wordsMeta}
          templatesMeta={templatesMeta}
          generatorsMeta={generatorsMeta}
          setFocusedElement={setFocusedElement}
          wordIdx={0}
          templateHotKeys={templateHotKeys}
          setFocusedWord={setFocusedWord}
          focusedWord={focusedWord}
          isStepHotKeysEnabled={isStepHotKeysEnabled}
          isTemplateHotKeysEnabled={isTemplateHotKeysEnabled}
        />
        <WordBuilderForm
          stepHotKeys={stepHotKeys}
          wordsMeta={wordsMeta}
          templatesMeta={templatesMeta}
          generatorsMeta={generatorsMeta}
          setFocusedElement={setFocusedElement}
          wordIdx={1}
          templateHotKeys={templateHotKeys}
          setFocusedWord={setFocusedWord}
          focusedWord={focusedWord}
          isStepHotKeysEnabled={isStepHotKeysEnabled}
          isTemplateHotKeysEnabled={isTemplateHotKeysEnabled}
        />
      </Sheet>
    </div>
  );
};

export default BuilderAccordion;
