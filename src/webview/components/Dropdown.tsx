import React from "react";
export default function Dropdown({ options, onSelect, placeholder="Select an option", id }) {
    const handleChange = (event) => {
      onSelect(event.target.value);
    };
  
    return (
      <select onChange={handleChange} id={id}>
        <option value="" disabled selected>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }