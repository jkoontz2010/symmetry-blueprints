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
import { compact } from "lodash";

export type WordDefinition = {
  name: string;
  wordSteps: WordStep[];
  meta?: Record<string, any>;
  subTemplate?: Template;
};

const FAVORITE_GENERATORS = ["orderedParse", "nestedParse"];
const COMMON_CHARS = [
  { name: "comma", value: "," },
  { name: "newline", value: "\n" },
];
export const TemplateEditors = ({
  templateDefinitions,
  postMessage,
  configPath,
  filledGeneratorsFileText,
  templateModule,
  allFileTemplates,
  runnableWords,
  generatorNames,
}: {
  templateDefinitions: WordDefinition[];
  postMessage: any;
  configPath: string;
  filledGeneratorsFileText: string;
  templateModule: any;
  generatorNames: any;
  allFileTemplates: Template;
  runnableWords: string[];
}) => {
  const {
    addToTemplatePool,
    addToFilledGeneratorPool,
    filledGenerators,
    handleSaveAllFiles,
    addFullTemplateToPool,
  } = useRunner(postMessage, configPath, filledGeneratorsFileText);

  const [stepsForPanel, setStepsForPanel] = useState<
    Record<string, WordStep[]>
  >({});

  return (
    <div>
      <PanelGroup
        direction="horizontal"
        style={{ width: "1500px", height: "600px" }}
      >
        {templateDefinitions.map((def, i) => {
          const generatorsTemplate = def.meta?.generators ?? {};

          return (
            <>
              <TemplateEditor
                definition={def}
                templateModule={templateModule}
                generatorNames={generatorNames}
                generatorsTemplate={generatorsTemplate}
                setStepsForPanel={setStepsForPanel}
                runnableSteps={filledGenerators}
                addToTemplatePool={addToTemplatePool}
                postMessage={postMessage}
                addToFilledGeneratorPool={addToFilledGeneratorPool}
                isMainEditor={i === 0}
                handleSaveAllFiles={handleSaveAllFiles}
                allFileTemplates={allFileTemplates}
                runnableWords={runnableWords}
                addFullTemplateToPool={addFullTemplateToPool}
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

export const TemplateEditor = ({
  definition,
  templateModule,
  generatorNames,
  setStepsForPanel,
  generatorsTemplate,
  runnableSteps,
  addToTemplatePool,
  postMessage,
  addToFilledGeneratorPool,
  isMainEditor,
  handleSaveAllFiles,
  allFileTemplates,
  runnableWords,
  addFullTemplateToPool,
}: {
  definition: WordDefinition;
  templateModule: any;
  generatorNames: any;
  setStepsForPanel: any;
  generatorsTemplate: Template;
  runnableSteps: Template;
  addToTemplatePool: (key: string, template: Template) => void;
  postMessage: any;
  addToFilledGeneratorPool: (filledGenerator: Template) => void;
  isMainEditor: boolean;
  handleSaveAllFiles: (template: Template) => void;
  allFileTemplates: Template;
  runnableWords: string[];
  addFullTemplateToPool: (name: string, template: Template) => void;
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
    handleConvertWordSteps,
    handleRunnableWordClick,
    handleTransition,
    handleOpenFileAtKey,
  } = useTemplate(definition, postMessage, isMainEditor);
  const { subTemplate } = definition;
  const [insertMode, setInsertMode] = React.useState(false);
  const [insertToKey, setInsertToKey] = React.useState("");

  useEffect(() => {
    setStepsForPanel((prev) => ({ ...prev, [definition.name]: wordSteps }));
  }, [wordSteps]);

  const [filteredTemplates, setFilteredTemplates] = useState(
    compact([subTemplate ?? null])
  );
  useEffect(() => {
    setFilteredTemplates(compact([subTemplate ?? null]));
  }, [subTemplate]);
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
    const newTemplate = templateModule[templateName] ?? {
      [templateName]: allFileTemplates[templateName],
    };
    if (newTemplate == null) {
      throw new Error(
        "template not found in templateModule or allFileTemplates"
      );
    }
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

  function handleInsertTemplateName(value: string) {
    const funcPart = argsAndTemplateToFunction([], value);
    insertTemplateIntoTemplateAtKey({ templateName: funcPart }, insertToKey);
  }

  function handleRunnableWordNameClick(key: string) {
    const funcPart = argsAndTemplateToFunction([], key);
    insertTemplateIntoTemplateAtKey({ templateName: funcPart }, insertToKey);
  }

  function handleSaveIsolatedTemplate(name: string, template: Template) {
    setInsertMode(false);
    setInsertToKey("");
    addFullTemplateToPool(name, template);
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
              generatorNames={generatorNames}
              handleGeneratorClick={handleGeneratorClick}
              handleAddDefinition={handleAddDefinition}
              generatorsTemplate={generatorsTemplate}
              runnableSteps={runnableSteps}
              handleRunStep={handleRunStep}
              handleTemplateNameClick={handleInsertTemplateName}
              allFileTemplates={allFileTemplates}
              runnableWords={runnableWords}
              handleRunnableWordClick={handleRunnableWordClick}
              handleRunnableWordNameClick={handleRunnableWordNameClick}
            />
            <Panel
              defaultSize={30}
              minSize={30}
              style={{ overflowX: "scroll", overflowY: "scroll" }}
            >
              {isMainEditor && (
                <button onClick={handleTransition}>RUN TRANSITION</button>
              )}
              <h3 style={{ color: "black" }}>{definition.name}</h3>{" "}
              <SaveWordAs handleSave={(name) => handleConvertWordSteps(name)} />
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
                handleSaveAllFiles={handleSaveAllFiles}
                handleSaveIsolatedTemplate={handleSaveIsolatedTemplate}
                handleOpenFileAtKey={handleOpenFileAtKey}
              />
              {!isMainEditor && (
                <button
                  onClick={() =>
                    addToFilledGeneratorPool(
                      multiply(sortTemplateByDeps(template), {})
                    )
                  }
                >
                  SAVE step1
                </button>
              )}
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
export const SkeletonPanel = ({
  templateModule,
  generatorNames,
  handleTemplateClick,
  handleAddDefinition,
  handleGeneratorClick,
  generatorsTemplate,
  runnableSteps,
  handleRunStep,
  handleTemplateNameClick,
  allFileTemplates,
  runnableWords,
  handleRunnableWordClick,
  handleRunnableWordNameClick,
}: {
  templateModule: any;
  generatorNames: any;
  handleTemplateClick: (templateName: string) => void;
  handleAddDefinition: (key: string, value: string) => void;
  handleGeneratorClick: (generatorName: string) => void;
  generatorsTemplate: Template;
  runnableSteps: Template;
  handleRunStep: any;
  handleTemplateNameClick: (key: string) => void;
  allFileTemplates: Template;
  runnableWords: string[];
  handleRunnableWordClick: (key: string) => void;
  handleRunnableWordNameClick: (key: string) => void;
}) => {
  const [defKeyName, setDefKeyName] = useState("");
  const [defValue, setDefValue] = useState("");
  const [lastClickedGenerator, setLastClickedGenerator] = useState("");
  //console.log("WHAT IS TEMPLATE MODULE HERE", templateModule);
  //console.log("is it null?", generatorNames);
  return (
    <Panel
      defaultSize={15}
      minSize={15}
      style={{ overflowX: "scroll", overflowY: "scroll" }}
    >
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
      <div style={{ height: "550px", overflowY: "scroll" }}>
        {Object.keys(runnableSteps)?.map((rs) => {
          //console.log("HERE WE ARE WITH RUNNABLE STEPS", rs.toString(), rs);
          const full = runnableSteps[rs]();
          return (
            <div
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() => handleRunStep(full)}
            >
              {full}
            </div>
          );
        })}
        <div style={{ color: "black" }}>Runnable Words:</div>
        {runnableWords.map((k) => {
          return (
            <div>
              <span
                style={{
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                }}
                onClick={() => handleRunnableWordClick(k)}
              >
                {k}
              </span>
              <span
                onClick={() => handleRunnableWordNameClick(k)}
                style={{
                  width: "8px",
                  height: "8px",
                  padding: "0px",
                  border: "1px solid black",
                  backgroundColor: "#eee",
                  color: "black",
                  cursor: "pointer",
                }}
              >
                N
              </span>
            </div>
          );
        })}
        <div style={{ color: "black" }}>Common:</div>
        {COMMON_CHARS.map((k) => {
          return (
            <div
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() => {
                handleAddDefinition(k.name, k.value);
              }}
            >
              {k.name}
            </div>
          );
        })}

        <div style={{ color: "black" }}>Templates:</div>
        {Object.keys(templateModule)?.map((k) => {
          return (
            <div>
              <span
                style={{
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                }}
                onClick={() => handleTemplateClick(k)}
              >
                {k}
              </span>
              <span
                onClick={() => handleTemplateNameClick(k)}
                style={{
                  width: "8px",
                  height: "8px",
                  padding: "0px",
                  border: "1px solid black",
                  backgroundColor: "#eee",
                  color: "black",
                  cursor: "pointer",
                }}
              >
                N
              </span>
            </div>
          );
        })}
        {false && (
          <>
            <div style={{ color: "black" }}>
              I don't wanna display these anymore now that we have filesystem
              queue items. But I'm leaving this here in case we decide it's
              worthwhile. File Templates:
            </div>
            <>
              {Object.keys(allFileTemplates)?.map((k) => {
                return (
                  <div>
                    <span
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                      onClick={() => handleTemplateClick(k)}
                    >
                      {k}
                    </span>
                    <span
                      onClick={() => handleTemplateNameClick(k)}
                      style={{
                        width: "8px",
                        height: "8px",
                        padding: "0px",
                        border: "1px solid black",
                        backgroundColor: "#eee",
                        color: "black",
                        cursor: "pointer",
                      }}
                    >
                      N
                    </span>
                  </div>
                );
              })}
            </>
          </>
        )}
        <div style={{ color: "black" }}>Generators</div>
        {lastClickedGenerator != null && (
          <div style={{ color: "red", textDecoration: "none" }}>
            {getGeneratorSignatureFromKey(
              lastClickedGenerator,
              generatorsTemplate
            )}
          </div>
        )}
        {FAVORITE_GENERATORS.map((k) => {
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
              {k}
            </div>
          );
        })}

        {generatorNames?.sort()?.map((k) => {
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
      </div>
    </Panel>
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
  handleSaveAllFiles,
  handleSaveIsolatedTemplate,
  handleOpenFileAtKey,
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
  handleSaveAllFiles: (template: Template) => void;
  handleSaveIsolatedTemplate: (name: string, template: Template) => void;
  handleOpenFileAtKey: (key: string) => void;
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
  function handleSaveTemplate(name: string) {
    handleSaveIsolatedTemplate(name, template);
  }
  //console.log("TEMPLATE TREE TEMPLATE", template)
  return (
    <div>
      <button onClick={() => handleSaveAllFiles(template)}>
        Save All Files
      </button>
      <div>
        <IsolatedTemplateSaver handleSave={handleSaveTemplate} />
      </div>
      <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
        {Object.keys(template)?.map((k, i) => {
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
                  handleOpenFileAtKey={handleOpenFileAtKey}
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
                handleOpenFileAtKey={handleOpenFileAtKey}
              />
              {peekTreeNodes?.map((node) => node)}
            </>
          );
        })}
      </div>
      <button onClick={handleCompile}>Compile</button>
      {compiledTemplate !== "" && (
        <pre
          style={{
            color: "black",
            fontSize: "12px",
            fontFamily: "system-ui",
            maxHeight: "400px",
            overflowY: "scroll",
          }}
        >
          {compiledTemplate}
        </pre>
      )}
    </div>
  );
};
const IsolatedTemplateSaver = ({
  handleSave,
}: {
  handleSave: (name: string) => void;
}) => {
  const [name, setName] = useState("");
  return (
    <>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Isolated Template Name"
      ></input>
      <button onClick={() => handleSave(name)}>Save Templ</button>
    </>
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
  handleOpenFileAtKey,
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
      <button onClick={() => handleOpenFileAtKey(tKey)}>V</button>

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
  const doubleQuotedCompactRs = compactRs.map((crs) =>
    crs.replaceAll("'", '"')
  );
  const doubleQuotedNonCompactRs = nonCompactRs.map((ncrs) =>
    ncrs.replaceAll("'", '"')
  );
  const allRs = [
    ...compactRs,
    ...nonCompactRs,
    ...doubleQuotedCompactRs,
    ...doubleQuotedNonCompactRs,
  ];
  let funcPart = part.substring(part.indexOf("`") + 1, part.lastIndexOf("`"));
  const parts = funcPart.split(/(\${[^}]+})/g);
  if (parts.length === 1) {
    return (
      <pre
        style={{
          color: "red",
          padding: "0px 5px",
          margin: "0",
          display: "inline",
          fontSize: "12px",
          fontFamily: "system-ui",
        }}
      >
        {nakedPartToString(part)}
      </pre>
    );
  }
  let finalParts = [];
  parts.forEach((part, index) => {
    if (allRs.includes(part)) {
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
      finalParts.push(
        <pre
          style={{
            margin: "0",
            display: "inline",
            fontSize: "12px",
            fontFamily: "system-ui",
          }}
        >
          {part}
        </pre>
      );
    }
  });
  return <div style={{ color: "red", padding: "0px 5px" }}>{finalParts}</div>;
}

const SaveWordAs = ({ handleSave }) => {
  const [wordName, setWordName] = useState("");
  return (
    <div>
      <input
        placeholder="word name"
        onChange={(e) => setWordName(e.target.value)}
      ></input>
      <button onClick={() => handleSave(wordName)}>Save Steps as Word</button>
    </div>
  );
};
