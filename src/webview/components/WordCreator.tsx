import React, { useState } from "react";
export const WordCreator = ({
    createNewWord,
    id
}: {
    createNewWord: (wordName: string) => void;
    id: string;
}) => {
    const [newWordName, setNewWordName] = React.useState<string>("");

  return (
    <span id={id}>
      <input
        type="text"
        value={newWordName}
        onChange={(e) => setNewWordName(e.target.value)}
      />
      <button onClick={() => createNewWord(newWordName)}>Create Word</button>
    </span>
  );
};
