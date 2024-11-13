import React, { useEffect, useState } from "react";
import {
  getDescendentsOfKey,
  rs,
  rsCompact,
  tts,
  sortTemplateByDeps,
  genTemplateWithVars,
  argsAndTemplateToFunction,
  multiply,
} from "symmetric-parser";

import { useTemplate, WordStep } from "../hooks/useTemplate";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import { useRunner } from "../hooks/useRunner";

export const TemplateEditors = ({
  templateDefinitions,
}: {
  templateDefinitions: {
    name: string;
    templateInit: Template;
    meta?: Record<string, any>;
  }[];
}) => {
  const { templateModule, generatorModule, wordModule } = useRunner();
  const [runnableSteps, setRunnableSteps] = useState<string[]>([]);
  const [stepsForPanel, setStepsForPanel] = useState<
    Record<string, WordStep[]>
  >({});

  return (
    <div>
      <PanelGroup direction="horizontal">
        {templateDefinitions.map((def, i) => {
          const generatorsTemplate = def.meta?.generators ?? {};

          return (
            <>
              <TemplateEditor
                templateInit={def.templateInit}
                name={def.name}
                templateModule={templateModule}
                generatorModule={generatorModule}
                generatorsTemplate={generatorsTemplate}
                wordModule={wordModule}
                setStepsForPanel={setStepsForPanel}
                setRunnableSteps={setRunnableSteps}
                runnableSteps={runnableSteps}
              />
            </>
          );
        })}
      </PanelGroup>
      <div>
        {Object.keys(stepsForPanel)?.map((k) => {
          //console.log("steps for panel", stepsForPanel, k, stepsForPanel?.[k]);
          return (
            <div>
              Tree: {k}{" "}
              {stepsForPanel?.[k]?.map((step) => {
                return <div>{step.name}---[result]</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// THAT TEMPLATE BETTER BE SORTED or we could sort it idk
const filterTemplateToKey = (input: Template, rootKey: string) => {
  const family = getDescendentsOfKey(rootKey, input, true);
  const newTemplate = {};
  family.forEach((key) => {
    newTemplate[key] = input[key];
  });
  return sortTemplateByDeps(newTemplate);
};

function getGeneratorSignatureFromKey(
  key: string,
  generatorsTemplate: Template
) {
  for (const v of Object.values(generatorsTemplate)) {
    const str = v();
    if (str.indexOf(key + "(") === 0) {
      return str;
    }
  }
}
export const SkeletonPanel = ({
  templateModule,
  generatorModule,
  handleTemplateClick,
  handleAddDefinition,
  handleAddSkeleton,
  handleGeneratorClick,
  generatorsTemplate,
  runnableSteps,
  handleRunStep,
}: {
  templateModule: any;
  generatorModule: any;
  handleTemplateClick: (templateName: string) => void;
  handleAddDefinition: (key: string, value: string) => void;
  handleAddSkeleton: (key: string, value: string, args: string[]) => void;
  handleGeneratorClick: (generatorName: string) => void;
  generatorsTemplate: Template;
  runnableSteps: string[];
  handleRunStep: any;
}) => {
  if (templateModule == null) return <div>loading templates...</div>;
  const [defKeyName, setDefKeyName] = useState("");
  const [defValue, setDefValue] = useState("");
  const [gtKey, setGtKey] = useState("");
  const [gtValue, setGtValue] = useState("");
  const [gtArgs, setGtArgs] = useState("");
  const [lastClickedGenerator, setLastClickedGenerator] = useState("");
  return (
    <Panel defaultSize={15} minSize={15}>
      <div>
        <input
          value={defKeyName}
          onChange={(e) => setDefKeyName(e.target.value)}
          placeholder="key"
        />
        <input
          value={defValue}
          onChange={(e) => setDefValue(e.target.value)}
          placeholder="value"
        />
        <button
          onClick={() => {
            handleAddDefinition(defKeyName, defValue);
            setDefKeyName("");
            setDefValue("");
          }}
        >
          Add Definition
        </button>
      </div>
      <div>
        <input
          value={gtKey}
          onChange={(e) => setGtKey(e.target.value)}
          placeholder="key"
        />
        <input
          value={gtValue}
          onChange={(e) => setGtValue(e.target.value)}
          placeholder="value"
        />
        <input
          value={gtArgs}
          onChange={(e) => setGtArgs(e.target.value)}
          placeholder="args"
        />
        <button
          onClick={() => {
            handleAddSkeleton(gtKey, gtValue, gtArgs.split(","));
            setGtKey("");
            setGtValue("");
            setGtArgs("");
          }}
        >
          Gen Templ
        </button>
      </div>
      {runnableSteps?.map((rs) => {
        return (
          <div
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            onClick={() => handleRunStep(rs)}
          >
            {rs}
          </div>
        );
      })}
      {Object.keys(templateModule)?.map((k) => {
        return (
          <div
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            onClick={() => handleTemplateClick(k)}
          >
            {k}
          </div>
        );
      })}
      <div style={{ color: "black" }}>Generators</div>
      {lastClickedGenerator != null && (
        <div style={{ color: "red", textDecoration: "none" }}>
          {getGeneratorSignatureFromKey(
            lastClickedGenerator,
            generatorsTemplate
          )}
        </div>
      )}
      {Object.keys(generatorModule)?.map((k) => {
        return (
          <div
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            onClick={() => {
              handleGeneratorClick(k);
              setLastClickedGenerator(k);
            }}
          >
            {k}{" "}
          </div>
        );
      })}
    </Panel>
  );
};
export const TemplateEditor = ({
  templateInit,
  name,
  templateModule,
  generatorModule,
  wordModule,
  setStepsForPanel,
  generatorsTemplate,
  setRunnableSteps,
  runnableSteps,
}: {
  templateInit: Template;
  name: string;
  templateModule: any;
  generatorModule: any;
  wordModule: any;
  setStepsForPanel: any;
  generatorsTemplate: Template;
  setRunnableSteps: any;
  runnableSteps: string[];
}) => {
  const {
    template,
    addKey,
    addKeyToNumerator,
    insertTemplateIntoTemplate,
    insertTemplateIntoTemplateAtKey,
    wordSteps,
    applyGeneratorString,
    removeKey,
  } = useTemplate(templateInit, templateModule, generatorModule, wordModule);
  const [insertMode, setInsertMode] = React.useState(false);
  const [insertToKey, setInsertToKey] = React.useState("");

  useEffect(() => {
    setStepsForPanel((prev) => ({ ...prev, [name]: wordSteps }));
  }, [wordSteps]);

  const [filteredTemplates, setFilteredTemplates] = useState([]);
  function handleOpenFilter(key: string) {
    const newFilteredTemplates = [
      ...filteredTemplates,
      filterTemplateToKey(template, key),
    ];
    setFilteredTemplates(newFilteredTemplates);
  }
  function handleRemoveKey(key: string) {
    removeKey(key);
  }
  function handleClosePanel(idx: number) {
    const newFilteredTemplates = [...filteredTemplates];
    newFilteredTemplates.splice(idx, 1);
    setFilteredTemplates(newFilteredTemplates);
  }
  function handleRunStep(stepString: string) {
    applyGeneratorString(stepString);
  }
  function handleTemplateClick(templateName: string) {
    const newTemplate = templateModule[templateName];

    if (!insertMode) {
      insertTemplateIntoTemplate(newTemplate);
    } else if (insertMode) {
      insertTemplateIntoTemplateAtKey(newTemplate, insertToKey);
    }
  }
  function handleGeneratorClick(generatorName: string) {
    // create the insertion template based off name, finding it in generators string, etc
    const genTempl = genTemplateWithVars(
      {
        step: () => `${generatorName}(template, genArgs)`,
      },
      ["genArgs"]
    );
    if (!insertMode) {
      insertTemplateIntoTemplate(genTempl);
    } else if (insertMode) {
      insertTemplateIntoTemplateAtKey(genTempl, insertToKey);
    }
  }
  function handleAddDefinition(key: string, value: string) {
    const funcPart = argsAndTemplateToFunction([], value);
    const newTemplate = { [key]: funcPart };

    if (insertMode) {
      insertTemplateIntoTemplateAtKey(newTemplate, insertToKey);
    } else {
      insertTemplateIntoTemplate(newTemplate);
    }
  }

  function handleAddSkeleton(key: string, value: string, args: string[]) {
    const funcPart = argsAndTemplateToFunction([], value);
    const templ = { [key]: funcPart };
    const newTemplate = genTemplateWithVars(templ, args);
    insertTemplateIntoTemplate(newTemplate);
  }
  const templates = [template, ...filteredTemplates];
  return (
    <>
      {templates.map((template, i) => {
        return (
          <>
            <SkeletonPanel
              handleTemplateClick={handleTemplateClick}
              templateModule={templateModule}
              generatorModule={generatorModule}
              handleGeneratorClick={handleGeneratorClick}
              handleAddDefinition={handleAddDefinition}
              handleAddSkeleton={handleAddSkeleton}
              generatorsTemplate={generatorsTemplate}
              runnableSteps={runnableSteps}
              handleRunStep={handleRunStep}
            />
            <Panel
              defaultSize={30}
              minSize={20}
              style={{ overflowX: "scroll" }}
            >
              <h3 style={{ color: "black" }}>{name}</h3>
              {i > 0 && (
                <button onClick={() => handleClosePanel(i - 1)}>Close</button>
              )}
              <TemplateTree
                template={template}
                addKeyToNumerator={addKeyToNumerator}
                addKey={addKey}
                handleOpenFilter={handleOpenFilter}
                insertMode={insertMode}
                setInsertMode={setInsertMode}
                insertToKey={insertToKey}
                setInsertToKey={setInsertToKey}
                handleRemoveKey={handleRemoveKey}
              />
              <button
                onClick={() =>
                  setRunnableSteps((prev) => [
                    ...prev,
                    multiply(sortTemplateByDeps(template), {})["step1"](),
                  ])
                }
              >
                SAVE step1
              </button>
            </Panel>
            <PanelResizeHandle
              style={{ border: "1px solid black", marginRight: "6px" }}
            />
          </>
        );
      })}
    </>
  );
};

// EXPECTS A SORTED input TEMPLATE
export const TemplateTree = ({
  template,
  addKeyToNumerator,
  addKey,
  handleOpenFilter,
  handleRemoveKey,
  insertMode,
  setInsertMode,
  insertToKey,
  setInsertToKey,
}: {
  addKey: any;
  addKeyToNumerator: any;
  template: Template;
  handleOpenFilter: any;
  handleRemoveKey: any;
  insertMode: boolean;
  setInsertMode: any;
  insertToKey: string;
  setInsertToKey: any;
}) => {
  const [compiledTemplate, setCompiledTemplate] = React.useState("");
  const [collapsedSet, setCollapsedSet] = React.useState(new Set<string>());
  const [hiddenSet, setHiddenSet] = React.useState(new Set<string>());
  const indentHash = new Map<string, number>();

  function handleRsClick(arg: string) {
    addKey(arg);
  }
  const handleNumeratorClick = (numerator: string) => {
    if (insertMode) {
      if (numerator !== insertToKey) {
        addKeyToNumerator(numerator, insertToKey);
      } else {
        setInsertMode(false);
        setInsertToKey("");
      }
    } else {
      setInsertMode(true);
      setInsertToKey(numerator);
    }
  };
  //console.log("TEMPLATE", template);
  const handleCompile = () => {
    setCompiledTemplate(tts(template));
  };

  const handleCollapse = (key: string) => {
    const allChildren = getDescendentsOfKey(key, template, false);
    const newCollapsedSet = new Set(collapsedSet);
    const newHiddenSet = new Set(hiddenSet);
    if (collapsedSet.has(key)) {
      newCollapsedSet.delete(key);
      allChildren.forEach((child) => {
        newHiddenSet.delete(child);
      });
    } else {
      newCollapsedSet.add(key);
      allChildren.forEach((child) => {
        newHiddenSet.add(child);
      });
    }

    setHiddenSet(newHiddenSet);
    setCollapsedSet(newCollapsedSet);
  };
  return (
    <div>
      {Object.keys(template).map((k, i) => {
        const denoms = k.split("/")[1]?.split(",");

        const numerator = k.split("/")[0];
        const indentionMultiplier = indentHash.get(numerator) ?? 0;
        denoms?.forEach((d) => {
          indentHash.set(d, indentionMultiplier + 1);
        });

        const peekTreeNodes = denoms?.map((d) => {
          if (template[d] != null) {
            // we have a non-denom key, need to display and extra TreeNode while giving it the proper indentation
            return (
              <TreeNode
                tKey={d}
                indentionMultiplier={indentionMultiplier + 1}
                insertMode={insertMode}
                insertToKey={insertToKey}
                hiddenSet={hiddenSet}
                handleCollapse={handleCollapse}
                handleNumeratorClick={handleNumeratorClick}
                collapsedSet={collapsedSet}
                template={template}
                handleRsClick={handleRsClick}
                denoms={denoms}
                handleOpenFilter={handleOpenFilter}
                handleRemoveKey={handleRemoveKey}
              />
            );
          } else {
            return null;
          }
        });

        return (
          <>
            <TreeNode
              tKey={k}
              indentionMultiplier={indentionMultiplier}
              insertMode={insertMode}
              insertToKey={insertToKey}
              hiddenSet={hiddenSet}
              handleCollapse={handleCollapse}
              handleNumeratorClick={handleNumeratorClick}
              collapsedSet={collapsedSet}
              template={template}
              handleRsClick={handleRsClick}
              denoms={denoms}
              handleOpenFilter={handleOpenFilter}
              handleRemoveKey={handleRemoveKey}
            />
            {peekTreeNodes?.map((node) => node)}
          </>
        );
      })}

      <button onClick={handleCompile}>Compile</button>
      {compiledTemplate !== "" && (
        <pre style={{ color: "black", fontSize: "12px" }}>
          {compiledTemplate}
        </pre>
      )}
    </div>
  );
};

const TreeNode = ({
  tKey,
  insertMode,
  hiddenSet,
  handleCollapse,
  insertToKey,
  handleNumeratorClick,
  collapsedSet,
  template,
  handleRsClick,
  denoms,
  indentionMultiplier,
  handleOpenFilter,
  handleRemoveKey,
}) => {
  const numerator = tKey.split("/")[0];

  const clickableNumeratorColor = insertMode ? "blue" : "green";
  return (
    <div
      style={{
        marginLeft: `${denoms != null ? indentionMultiplier * 15 : 0}px`,
        display: hiddenSet.has(tKey) ? "none" : "block",
      }}
    >
      <button onClick={() => handleCollapse(tKey)}>C</button>
      <span
        style={{
          color: insertToKey === numerator ? "black" : clickableNumeratorColor,
          textDecoration: insertToKey === numerator ? "" : "underline",
          cursor: "pointer",
        }}
        onClick={() => handleNumeratorClick(numerator)}
      >
        {numerator}
      </span>
      <button onClick={() => handleOpenFilter(tKey)}>I</button>
      <button
        style={{ marginLeft: "14px" }}
        onClick={() => handleRemoveKey(tKey)}
      >
        R
      </button>

      {collapsedSet.has(tKey) ? (
        <span
          onClick={() => handleCollapse(tKey)}
          style={{
            cursor: "pointer",
            color: "blue",
            textDecoration: "underline",
            marginLeft: "3px",
          }}
        >
          . . .
        </span>
      ) : (
        renderPart(template[tKey].toString(), handleRsClick)
      )}
    </div>
  );
};

function nakedPartToString(part: string) {
  if (part.includes("`")) {
    return part.substring(part.indexOf("`") + 1, part.lastIndexOf("`"));
  } else {
    return part.substring(part.indexOf('"') + 1, part.lastIndexOf('"'));
  }
}

function rsToArg(rs: string) {
  //    return `\${run(${v},'${v}')}`;
  return rs.substring(rs.indexOf("(") + 1, rs.indexOf(","));
}
function renderPart(part: string, handleRsClick: (arg: string) => void) {
  const args = part
    .substring(part.indexOf("{") + 1, part.indexOf("}"))
    .split(",")
    .map((arg) => arg.trim());
  const compactRs = args.map((arg) => rsCompact(arg));
  const nonCompactRs = args.map((arg) => rs(arg));

  let funcPart = part.substring(part.indexOf("`") + 1, part.lastIndexOf("`"));
  const parts = funcPart.split(/(\${[^}]+})/g);
  if (parts.length === 1) {
    return (
      <div style={{ color: "red", padding: "0px 5px" }}>
        {nakedPartToString(part)}
      </div>
    );
  }
  let finalParts = [];
  parts.forEach((part, index) => {
    if (compactRs.includes(part) || nonCompactRs.includes(part)) {
      const arg = rsToArg(part);
      finalParts.push(
        <span
          style={{
            color: "purple",
            cursor: "pointer",
            margin: "0px 2px",
            border: "1px solid black",
            backgroundColor: "#eee",
            padding: "0px 2px",
          }}
          onClick={() => handleRsClick(arg)}
        >
          {arg}
        </span>
      );
    } else {
      finalParts.push(part);
    }
  });
  return <div style={{ color: "red", padding: "0px 5px" }}>{finalParts}</div>;
}
