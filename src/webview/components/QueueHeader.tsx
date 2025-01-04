import * as React from "react";
import { useQueueListener } from "../hooks/useQueueListener";

import { css } from "@emotion/css";

const currentStepStyle = {
  color: "red",
};
const upcomingStepStyle = {
  color: "blue",
};
const descriptionStyle = {
  color: "black",
  marginLeft: "10px",
};

const baseStyle = css`
  overflow: hidden;
  max-height: 17px;
  &:hover {
max-height: 200px;
  }
`;
export const QueueHeader = ({}) => {
  const { queueSteps } = useQueueListener();
  const currentStep = queueSteps[0];
  return (
    <div className={baseStyle}>
      {queueSteps.map((step, i) => {
        const style = i === 0 ? currentStepStyle : upcomingStepStyle;
        const bridge = i !== queueSteps.length - 1 ? `-->` : "";
        return (
          <span style={style}>
            {step.name}
            {bridge}
          </span>
        );
      })}
      <span style={descriptionStyle}>
        Current step: {currentStep.description}
      </span>
      <div>Next action: {currentStep.transitionAction}</div>
    </div>
  );
};
