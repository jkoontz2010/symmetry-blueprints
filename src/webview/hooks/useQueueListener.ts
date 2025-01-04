import { useEffect, useState } from "react";
import { DequeueStep } from "../../runner/runner";
type QueueStepData = {
  type: string;
  name: string;
  description: string;
  word: string;
  isWaitingForCommand: boolean;
  transitionAction: string;
}
const FAKE_DATA = [
  {
      "type": "template",
      "name": "parseFifth_subTemplate",
      "description": "Queue item from subTemplate",
      "word": "-",
      "isWaitingForCommand": true,
      "transitionAction": "identity"
  },
  {
      "type": "template",
      "name": "parseFifth",
      "description": "runs the word that parses fifth.tsx",
      "word": "-",
      "isWaitingForCommand": false,
      "transitionAction": "identity"
  }
]
export function useQueueListener() {
  const [queueSteps, setQueueSteps] = useState<QueueStepData[]>(FAKE_DATA);
  function handleQueueUpdate(message) {
    const newQueueSteps = message.data;

  }
  function handleMessage(event: MessageEvent) {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case "queue_update":
        console.log("handling generator result");
        handleQueueUpdate(message);
        break;
      default: {
        // defaults give a good end-of-switch-statement parse hack
        break;
      }
    }
  }
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return {
    queueSteps,
  }
}
