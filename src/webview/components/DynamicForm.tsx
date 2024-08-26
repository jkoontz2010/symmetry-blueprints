import * as React from "react";
import { Controller, set, useFieldArray, useForm } from "react-hook-form";
import { Schema, Types } from "../hooks/useWordBuilder";
import { useHotkeys } from "react-hotkeys-hook";
import { hotKeyToItem } from "../util/hotKeyBuilder";
import { Chip, ChipDelete, Sheet } from "@mui/joy";
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

interface FormProps {
  schema: Schema;
  onSubmit: (data: any) => void;
  hotkeys: Map<string, any>;
  setFocusedElement: (element: FocusableElements) => void;
  setFocusedStepIdx: () => void;
  outputHotkeys: Map<string, any>;
}

const generateFormFields = (
  register,
  control,
  schema: Schema,
  hotkeys: Map<string, any>,
  hotkeyEnabledIndex,
  setHotkeyEnabledIndex,
  setValue,
  getValues,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  keyPrefix = null,
  arrayFields,
  setArrayFields
) => {
  console.count("generateFormFields");
  if (schema == null) return null;
  console.log("THE SCHEMA", schema);
  return Object.keys(schema).map((schemaKey, i) => {
    let key = schemaKey;
    console.log("doing key", key);
    console.log("and schema at key...", schema[key]);
    if (Array.isArray(schema[key])) {
      if (arrayFields[key] == null) {
        setArrayFields({ ...arrayFields, [key]: 0 });
      }
      // RECURSE!!
      console.log("IS ARRAY!!!", schema[key]);
      // we must have an array field here, so can add multiple.
      // but, we add multiple of the schema inside it, which can also have an array of objects.
      const nestedSchema: Schema = schema[key][0] as Schema;
      // we need the key to say "key.0.subKey", ex "mappings.0.from", "mappings.0.to", etc.
      // while also being able to add to it....
      console.log("KEY PREFIX", keyPrefix, "KEY", key)
      const nestedKeyPrefix = keyPrefix != null ? `${keyPrefix}.${key}.0` : `${key}.0`;

      const nestedFormFields = generateFormFields(
        register,
        control,
        nestedSchema,
        hotkeys,
        hotkeyEnabledIndex,
        setHotkeyEnabledIndex,
        setValue,
        getValues,
        setFocusedElement,
        setFocusedStepIdx,
        outputHotkeys,
        nestedKeyPrefix,
        arrayFields,
        setArrayFields
      );
      // we need the key to say "key.0.subKey", ex "mappings.0.from", "mappings.0.to", etc.
console.log("NEST FORM FIELDS?", nestedFormFields)
      return (
        <div style={{ border: "1px solid blue" }}>
          MULTIPLE ADDABLE:{nestedFormFields}
        </div>
      );
    }
    if (!Array.isArray(schema[key]) && isObject(schema[key])) {
      console.log("IS OBJECT!!!", schema[key]);
      // if it's an object, then the object is another schema.
      // nest, and call generateFormFields again.
      const nestedSchema: Schema = schema[key] as Schema;
      const nestedFormFields = generateFormFields(
        register,
        control,
        nestedSchema,
        hotkeys,
        hotkeyEnabledIndex,
        setHotkeyEnabledIndex,
        setValue,
        getValues,
        setFocusedElement,
        setFocusedStepIdx,
        outputHotkeys,
        null,
        arrayFields,
        setArrayFields
      );
      return (
        <div key={key} style={{ border: "1px solid red" }}>
          NEST{nestedFormFields}
        </div>
      );
    }

    const schemaValue = schema[key]
    // sneaky use of let, bad!
    key = keyPrefix ? `${keyPrefix}.${key}` : key;
    console.log("THE KEY", key)
    console.log("THE SCHEMA AT...", schema[key])
    switch (schemaValue) {
      case Types.String:
        return (
          <div key={key}>
            <label>{key}</label>
            <input {...register(key)} />
          </div>
        );
      case Types.Number:
        return (
          <div key={key}>
            <label>{key}</label>
            <input {...register(key)} />
          </div>
        );
      case Types.Template:
        return (
          <div key={key}>
            <SingleTemplatefield
              name={key}
              control={control}
              hotkeys={hotkeys}
              outputHotkeys={outputHotkeys}
              idx={i}
              isHotkeyEnabled={hotkeyEnabledIndex === i}
              setIsHotkeyEnabled={setHotkeyEnabledIndex}
              setValue={setValue}
              setFocusedElement={setFocusedElement}
              setFocusedStepIdx={setFocusedStepIdx}
            />
          </div>
        );
      case Types.TemplateArray:
        return (
          <div key={key}>
            <DynamicTemplatesField
              name={key}
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
            />
          </div>
        );
      default:
        console.log("DEFAULT NULL")
        return null;
    }
  });
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
}) => {
  useHotkeys(
    Array.from(hotkeys.keys()),
    (event) => {
      setValue(name, hotKeyToItem(event.key, hotkeys));
    },
    { enabled: isHotkeyEnabled }
  );
  useHotkeys(
    Array.from(outputHotkeys.keys()),
    (event) => {
      // stored as a string, so we need to make it a "Template" with a name
      setValue(name, { name: hotKeyToItem(event.key, outputHotkeys) });
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
                {field.value?.name != null && (
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
                    {field.value.name}
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
}) => {
  useHotkeys(
    Array.from(hotkeys.keys()),
    (event) => {
      const currentValues = getValues(name) ?? [];
      setValue(
        name,
        compact([...currentValues, hotKeyToItem(event.key, hotkeys)])
      );
    },
    { enabled: isHotkeyEnabled }
  );
  useHotkeys(
    Array.from(outputHotkeys.keys()),
    (event) => {
      const currentValues = getValues(name) ?? [];
      setValue(
        name,
        compact([
          ...currentValues,
          { name: hotKeyToItem(event.key, outputHotkeys) },
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
                    {item.name}
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
  onSubmit,
  hotkeys,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
}) => {
  const { register, handleSubmit, control, setValue, getValues } = useForm();
  const [hotkeyEnabledIndex, setHotkeyEnabledIndex] = React.useState(null);
  const [arrayFields, setArrayFields] = React.useState({});

  return (
    <div
      onClick={() => {
        setHotkeyEnabledIndex(null);
        setFocusedElement(FocusableElements.builder);
        console.log("SETSET");
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {generateFormFields(
          register,
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
          null,
          arrayFields,
          setArrayFields
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default DynamicForm;
