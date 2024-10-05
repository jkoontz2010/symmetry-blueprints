import * as React from "react";
import { Controller, set, useFieldArray, useForm } from "react-hook-form";
import { BuilderGenerator, BuilderTemplate, Schema, Types } from "../hooks/useWordBuilder";
import { useHotkeys } from "../hooks/useHotkeys";
import { hotKeyToItem } from "../util/hotKeyBuilder";
import { Box, Chip, ChipDelete, Sheet } from "@mui/joy";
import { FocusableElements } from "./BuilderAccordion";
import { compact, isObject } from "lodash";
import { arrayMove } from "@dnd-kit/sortable";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableItem } from "./SortableItem";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

interface FormProps {
  schema: Schema;
  hotkeys: Map<string, any>;
  setFocusedElement: (element: FocusableElements) => void;
  setFocusedStepIdx: () => void;
  outputHotkeys: Map<string, any>;
  templatesMeta: BuilderTemplate[];
  formObject: any;
  formKeyPrefix: string;
  steps:BuilderGenerator[];
  stepIdx: number;
}

const NestedFormFields = ({
  register,
  unregister,
  control,
  schema,
  hotkeys,
  hotkeyEnabledIndex,
  setHotkeyEnabledIndex,
  setValue,
  getValues,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  keyPrefix = null,
  arrayFields,
  setArrayFields,
  nestIndex,
  templatesMeta,
  keyWithPrefix,
  steps,
  stepIdx
}: {
  register: any;
  unregister: any;
  control: any;
  schema: Schema;
  hotkeys: Map<string, any>;
  hotkeyEnabledIndex: number;
  setHotkeyEnabledIndex: (index: number) => void;
  setValue: any;
  getValues: any;
  setFocusedElement: (element: FocusableElements) => void;
  setFocusedStepIdx: (index: number) => void;
  outputHotkeys: Map<string, any>;
  keyPrefix: string | null;
  arrayFields: Record<string, number>;
  setArrayFields: (fields: Record<string, number>) => void;
  nestIndex?: number;
  templatesMeta: BuilderTemplate[];
  keyWithPrefix: (key: string) => string;
  steps: BuilderGenerator[],
  stepIdx: number;
}) => {
  //console.count("generateFormFields");
  if (schema == null) return null;
  //console.log("THE SCHEMA", schema);
  const [arrayCount, setArrayCount] = React.useState({});
  const components = Object.keys(schema).map((schemaKey, i) => {
    let key = schemaKey;
    //console.log("doing key", key);
    //console.log("and schema at key...", schema[key]);
    if (Array.isArray(schema[key])) {
      // RECURSE!!
      //console.log("IS ARRAY!!!", schema[key]);
      // we must have an array field here, so can add multiple.
      // but, we add multiple of the schema inside it, which can also have an array of objects.
      const nestedSchema: Schema = schema[key][0] as Schema;

      // we need the key to say "key.0.subKey", ex "mappings.0.from", "mappings.0.to", etc.
      // while also being able to add to it....

      const fullKey = keyPrefix != null ? `${keyPrefix}.${key}` : key;

      if (arrayCount[fullKey] == null) {
        setArrayCount({ ...arrayCount, [fullKey]: 1 });
      }

      const nestedFormFields = [];
      for (let i = 0; i < (arrayCount[fullKey] ?? 1); i++) {
        const nestedKeyPrefix =
          keyPrefix != null ? `${fullKey}.${i}` : `${fullKey}.${i}`;
        nestedFormFields.push(
          <div>
            {i}:
            {i === arrayCount[fullKey] - 1 && (
              <button
                onClick={() => {
                  setArrayCount({
                    ...arrayCount,
                    [fullKey]: arrayCount[fullKey] - 1,
                  });
                  unregister(keyWithPrefix(nestedKeyPrefix));
                }}
              >
                Remove
              </button>
            )}
            <NestedFormFields
              register={register}
              unregister={unregister}
              control={control}
              schema={nestedSchema}
              hotkeys={hotkeys}
              hotkeyEnabledIndex={hotkeyEnabledIndex}
              setHotkeyEnabledIndex={setHotkeyEnabledIndex}
              setValue={setValue}
              getValues={getValues}
              setFocusedElement={setFocusedElement}
              setFocusedStepIdx={setFocusedStepIdx}
              outputHotkeys={outputHotkeys}
              keyPrefix={nestedKeyPrefix}
              arrayFields={arrayFields}
              setArrayFields={setArrayFields}
              templatesMeta={templatesMeta}
              keyWithPrefix={keyWithPrefix}
              steps={steps}
              stepIdx={stepIdx}
            />
          </div>
        );
      }
      // we need the key to say "key.0.subKey", ex "mappings.0.from", "mappings.0.to", etc.

      return (
        <div>
          <button
            onClick={() => {
              // add to the array count
              setArrayCount({
                ...arrayCount,
                [fullKey]: arrayCount[fullKey] + 1,
              });
            }}
          >
            Add
          </button>
          {nestedFormFields}
        </div>
      );
    }
    if (!Array.isArray(schema[key]) && isObject(schema[key])) {
      //console.log("IS OBJECT!!!", schema[key]);
      // if it's an object, then the object is another schema.
      // nest, and call generateFormFields again.
      const nestedSchema: Schema = schema[key] as Schema;
      const nestedFormFields = (
        <NestedFormFields
          register={register}
          unregister={unregister}
          control={control}
          schema={nestedSchema}
          hotkeys={hotkeys}
          hotkeyEnabledIndex={hotkeyEnabledIndex}
          setHotkeyEnabledIndex={setHotkeyEnabledIndex}
          setValue={setValue}
          getValues={getValues}
          setFocusedElement={setFocusedElement}
          setFocusedStepIdx={setFocusedStepIdx}
          outputHotkeys={outputHotkeys}
          keyPrefix={null}
          arrayFields={arrayFields}
          setArrayFields={setArrayFields}
          templatesMeta={templatesMeta}
          keyWithPrefix={keyWithPrefix}
          steps={steps}
          stepIdx={stepIdx}
        />
      );
      return <div key={key}>{nestedFormFields}</div>;
    }

    const schemaValue = schema[key];
    // sneaky use of let, bad!
    key = keyPrefix ? `${keyPrefix}.${key}` : key;

    switch (schemaValue) {
      case Types.String:
        return (
          <div key={key}>
            <label>{key}</label>
            <input {...register(keyWithPrefix(key))} />
          </div>
        );
      case Types.Number:
        return (
          <div key={key}>
            <label>{key}</label>
            <input {...register(keyWithPrefix(key))} />
          </div>
        );
      case Types.Template:
        return (
          <div key={keyWithPrefix(key)}>
            <SingleTemplatefield
              name={keyWithPrefix(key)}
              control={control}
              hotkeys={hotkeys}
              outputHotkeys={outputHotkeys}
              idx={i}
              isHotkeyEnabled={hotkeyEnabledIndex === i}
              setIsHotkeyEnabled={setHotkeyEnabledIndex}
              setValue={setValue}
              setFocusedElement={setFocusedElement}
              setFocusedStepIdx={setFocusedStepIdx}
              templatesMeta={templatesMeta}
              steps={steps}
              stepIdx={stepIdx}
            />
          </div>
        );
      case Types.TemplateArray:
        return (
          <div key={keyWithPrefix(key)}>
            <DynamicTemplatesField
              name={keyWithPrefix(key)}
              control={control}
              hotkeys={hotkeys}
              outputHotkeys={outputHotkeys}
              idx={i}
              isHotkeyEnabled={hotkeyEnabledIndex === i}
              setIsHotkeyEnabled={setHotkeyEnabledIndex}
              setValue={setValue}
              getValues={getValues}
              setFocusedElement={setFocusedElement}
              setFocusedStepIdx={setFocusedStepIdx}
              templatesMeta={templatesMeta}
            />
          </div>
        );
      default:
        return null;
    }
  });

  return (
    <Box fontSize={12} p={1} m={1} sx={{ border: "1px solid grey" }}>
      {components}
    </Box>
  );
};
const SingleTemplatefield = ({
  name,
  control,
  hotkeys,
  idx,
  isHotkeyEnabled,
  setIsHotkeyEnabled,
  setValue,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  templatesMeta,
  steps,
  stepIdx
}) => {
  console.log("single templ field name", name, idx)
  React.useEffect(() => {
    if(name.split(".").some(n=>n==="input")) {
      const priorStepOutput = steps[stepIdx-1]?.outputName ?? "wordInput";
      console.log("did we nail it?", priorStepOutput, steps, steps[stepIdx-1])
      setValue(name, priorStepOutput)
    }
  },[])
  useHotkeys(
    Array.from(hotkeys.keys()),
    (event) => {
      console.log("ITEM FROM HOTKEY31", hotKeyToItem(event.key, hotkeys));
      setValue(name, (hotKeyToItem(event.key, hotkeys) as Template).name);
    },
    { enabled: isHotkeyEnabled }
  );
  useHotkeys(
    Array.from(outputHotkeys.keys()),
    (event) => {
      console.log("ITEM FROM HOTKEY4",hotKeyToItem(event.key, outputHotkeys))
      // stored as a string, so we need to make it a "Template" with a name
      setValue(name, hotKeyToItem(event.key, outputHotkeys));
    },
    { enabled: isHotkeyEnabled }
  );
  return (
    <div
      key={idx}
      onClick={(e) => {
        setFocusedElement(FocusableElements.templateInput);
        setIsHotkeyEnabled(idx);
        // idx provided by parent, we don't call it here
        setFocusedStepIdx();
        e.stopPropagation();
      }}
      onFocus={() => {
        setFocusedElement(FocusableElements.templateInput);
        setIsHotkeyEnabled(idx);
        setFocusedStepIdx();
      }}
      onBlur={() => {
        setFocusedElement(FocusableElements.builder);
        setFocusedStepIdx(null);
        setIsHotkeyEnabled(null);
      }}
      tabIndex={idx}
    >
      <label>{name}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <div>
              <Sheet
                variant="outlined"
                color="neutral"
                sx={{ width: 1, minHeight: 30 }}
              >
                {field.value != null && (
                  <Chip
                    size="sm"
                    variant="outlined"
                    endDecorator={
                      <ChipDelete
                        onDelete={() => {
                          setValue(name, null);
                        }}
                      />
                    }
                  >
                    {field.value}:
                    {templatesMeta
                      .find((t) => t?.name === field.value)
                      ?.vars?.join(", ")}
                  </Chip>
                )}
              </Sheet>
            </div>
          );
        }}
      />
    </div>
  );
};

const DynamicTemplatesField = ({
  name,
  control,
  hotkeys,
  isHotkeyEnabled,
  setIsHotkeyEnabled,
  idx,
  setValue,
  getValues,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  templatesMeta,
}) => {
  useHotkeys(
    Array.from(hotkeys.keys()),
    (event) => {
      const currentValues = getValues(name) ?? [];
      console.log("ITEM FROM HOTKEY1", hotKeyToItem(event.key, hotkeys));
      setValue(
        name,
        compact([
          ...currentValues,
          (hotKeyToItem(event.key, hotkeys) as Template).name,
        ])
      );
    },
    { enabled: isHotkeyEnabled }
  );
  useHotkeys(
    Array.from(outputHotkeys.keys()),
    (event) => {
      const currentValues = getValues(name) ?? [];
      console.log("ITEM FROM HOTKEY",hotKeyToItem(event.key, outputHotkeys))
      setValue(
        name,
        compact([
          ...currentValues,
          hotKeyToItem(event.key, outputHotkeys),
        ])
      );
    },
    { enabled: isHotkeyEnabled }
  );
  const [focusedIdx, setFocusedIdx] = React.useState(null);

  return (
    <div
      key={idx}
      onClick={(e) => {
        setFocusedElement(FocusableElements.templateInput);
        setIsHotkeyEnabled(idx);
        setFocusedStepIdx(idx);
        e.stopPropagation();
      }}
      onFocus={() => {
        setFocusedElement(FocusableElements.templateInput);
        setIsHotkeyEnabled(idx);
        setFocusedStepIdx(idx);
      }}
      onBlur={() => {
        setIsHotkeyEnabled(null);
        setFocusedElement(FocusableElements.builder);
        setFocusedIdx(null);
        setFocusedStepIdx(null);
      }}
      tabIndex={idx}
    >
      <label>{name}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // use the hot keys, it will swap the focused index
          // finish by setting the new focusedIdx to the new idx it's in.
          useHotkeys(
            ["arrowLeft", "arrowRight"],
            (event) => {
              const newIdx =
                event.key === "ArrowLeft" ? focusedIdx - 1 : focusedIdx + 1;
              if (newIdx < 0 || newIdx >= field.value.length) {
                return;
              }
              const newValues = arrayMove(field.value, focusedIdx, newIdx);
              setValue(name, newValues);
              setFocusedIdx(newIdx);
            },
            { enabled: focusedIdx !== null }
          );
          return (
            <div>
              <Sheet
                variant="outlined"
                color="neutral"
                sx={{ width: 1, minHeight: 30 }}
              >
                {field.value?.map((item, i) => (
                  <Chip
                    size="sm"
                    variant="outlined"
                    onClick={() => {
                      setFocusedIdx(i);
                    }}
                    color={focusedIdx === i ? "primary" : "neutral"}
                    endDecorator={
                      <ChipDelete
                        onDelete={() => {
                          const newValues = getValues(name).filter(
                            (_, i2) => i2 !== i
                          );
                          setValue(name, newValues);
                          setFocusedIdx(null);
                        }}
                      />
                    }
                  >
                    {item}:{" "}
                    {templatesMeta
                      .find((t) => t?.name === item)
                      ?.vars?.join(", ")}
                  </Chip>
                ))}
              </Sheet>
            </div>
          );
        }}
      />
    </div>
  );
};

const DynamicForm: React.FC<FormProps> = ({
  schema,
  hotkeys,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  templatesMeta,
  formObject,
  formKeyPrefix,
  steps,
  stepIdx,
}) => {
  const { control, setValue, getValues, unregister, register } = formObject;
  const [hotkeyEnabledIndex, setHotkeyEnabledIndex] = React.useState(null);
  const [arrayFields, setArrayFields] = React.useState({});

  function keyWithPrefix(key: string) {
    return `${formKeyPrefix}.${key}`;
  }

  return (
    <div
      onClick={() => {
        setHotkeyEnabledIndex(null);
        setFocusedElement(FocusableElements.builder);
      }}
    >
      <NestedFormFields
      steps={steps}
      stepIdx={stepIdx}
        register={register}
        unregister={unregister}
        control={control}
        schema={schema}
        hotkeys={hotkeys}
        hotkeyEnabledIndex={hotkeyEnabledIndex}
        setHotkeyEnabledIndex={setHotkeyEnabledIndex}
        setValue={setValue}
        getValues={getValues}
        setFocusedElement={setFocusedElement}
        setFocusedStepIdx={setFocusedStepIdx}
        outputHotkeys={outputHotkeys}
        keyPrefix={null}
        arrayFields={arrayFields}
        setArrayFields={setArrayFields}
        templatesMeta={templatesMeta}
        keyWithPrefix={keyWithPrefix}
      />
    </div>
  );
};

export default DynamicForm;
