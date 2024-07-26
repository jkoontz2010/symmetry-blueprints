import * as React from "react";
import { Types } from "../hooks/useWordBuilder";

// The function that takes a schema and outputs a form component
export function createForm(inputSchema) {
  return function DynamicForm({ onSubmit, hotkeys, setFocusedElement }) {
    const [formState, setFormState] = React.useState(() => {
      const initialState = {};
      for (const key in inputSchema) {
        if (
          inputSchema[key] === Types.Template ||
          inputSchema[key] === Types.String
        ) {
          initialState[key] = "";
        } else if (inputSchema[key] === Types.Object) {
          initialState[key] = {};
        }
      }
      return initialState;
    });

    const handleChange = (key, value) => {
      setFormState((prevState) => ({
        ...prevState,
        [key]: value,
      }));
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      console.log("Form submitted:", formState);
      onSubmit(formState);
    };

    return (
      <form onSubmit={handleSubmit}>
        {Object.keys(inputSchema).map((key) => {
          if (
            inputSchema[key] === Types.Template ||
            inputSchema[key] === Types.String
          ) {
            return (
              <div key={key}>
                <label>{key}</label>
                <input
                  type="text"
                  value={formState[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            );
          } else if (inputSchema[key] === Types.Object) {
            // Assuming nested objects would require more complex handling
            return (
              <div key={key}>
                <label>{key} (Object)</label>
                <textarea
                  value={JSON.stringify(formState[key], null, 2)}
                  onChange={(e) =>
                    handleChange(key, JSON.parse(e.target.value))
                  }
                />
              </div>
            );
          }
          return null;
        })}
        <button type="submit">Submit</button>
      </form>
    );
  };
}
