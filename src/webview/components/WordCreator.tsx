import React, { useState } from "react";
export const WordCreator = ({
    createNewWord
}: {
    createNewWord: (wordName: string) => void;
}) => {
    const [newWordName, setNewWordName] = React.useState<string>("");

  return (
    <>
      <input
        type="text"
        value={newWordName}
        onChange={(e) => setNewWordName(e.target.value)}
      />
      <button onClick={() => createNewWord(newWordName)}>Create Word</button>
    </>
  );
};
