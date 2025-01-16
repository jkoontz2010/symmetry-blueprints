import React, { useState } from "react";
import AceEditor from "react-ace";

export const GTWVEditor = ({ handleSubmit, id }) => {
  const [value, setValue] = useState("");
  const [args, setArgs] = useState("");
  const [key, setKey] = useState("");
  function onChange(newValue) {
    setValue(newValue);
  }
  return (
    <div id={id}>
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="key"
      />
      <AceEditor
        mode="javascript"
        theme="github"
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        value={value}
        height="100px"
        width="500px"
      />
      <input
        type="text"
        value={args}
        onChange={(e) => setArgs(e.target.value)}
        placeholder="args"
      />
      <button disabled={key==null||key==""||value==null||value==""||args==null||args==""} onClick={() => handleSubmit({ value, args: args.split(",").map(a=>a.trim()), key })}>Submit</button>
    </div>
  );
};
