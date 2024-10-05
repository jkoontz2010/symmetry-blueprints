import { useState, useEffect, useCallback } from 'react';

export const useHotkeys = (hotkeysArray, callback, options = { enabled: true }) => {
  // State to keep track of key sequences
  const [keySequence, setKeySequence] = useState('');

  const handleKeyDown = useCallback(
    (event) => {
      if (!options.enabled) return;

      const key = event.key.toLowerCase();

      // Append the new key to the sequence
      const newSequence = keySequence + key;

      // Check if the new sequence matches any of the hotkeys in the array
      const matchedHotkey = hotkeysArray.find((hotkey) => newSequence.endsWith(hotkey));

      if (matchedHotkey) {
        // Trigger the callback with the matched hotkey
        callback({key: matchedHotkey});
        // Reset the sequence
        setKeySequence('');
      } else {
        // Update the sequence with the new key
        setKeySequence(newSequence);
      }
      if(newSequence.length>hotkeysArray[0].length){
        setKeySequence('');
      }
    },
    [keySequence, hotkeysArray, callback, options.enabled]
  );

  useEffect(() => {
    if (options.enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, options.enabled]);

  return {
    clearSequence: () => setKeySequence(''),
  };
};

export default useHotkeys;
