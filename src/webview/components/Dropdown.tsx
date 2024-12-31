import React from "react";
export default function Dropdown({ options, onSelect, placeholder="Select an option" }) {
    const handleChange = (event) => {
      onSelect(event.target.value);
    };
  
    return (
      <select onChange={handleChange}>
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