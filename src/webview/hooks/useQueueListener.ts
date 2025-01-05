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

export function useQueueListener() {
  const [queueSteps, setQueueSteps] = useState<QueueStepData[]>([]);
  function handleQueueUpdate(message) {
    const data = message.data;
    const currentQueue = JSON.parse(data.currentQueue);
    setQueueSteps(currentQueue);
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
