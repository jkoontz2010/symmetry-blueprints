import React, { useEffect } from "react";

export function useRunner() {
  const [generatorModule, setGeneratorModule] = React.useState<any>(null);
  const [templateModule, setTemplateModule] = React.useState<any>(null);
  const [wordModule, setWordModule] = React.useState<any>(null);

  const fetchGenerators = async () => {
    const data = await import("../../pools/utility-templates");
    setGeneratorModule(data);
  };
  const fetchTemplates = async () => {
    const data = await import("../../pools/template-pool");
    setTemplateModule(data);
  };
  const fetchWords = async () => {
    const data = await import("../../pools/word-pool");
    setWordModule(data);
  };
  useEffect(() => {
    fetchGenerators();
    fetchTemplates();
    fetchWords();
  }, []);

  //console.log("here we are", generatorModule, templateModule, wordModule);

  return {
    templateModule,
    generatorModule,
    wordModule,
  };
}
