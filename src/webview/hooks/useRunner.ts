import React, { useEffect } from "react";


export function useRunner() {
    const [generators, setGenerators] = React.useState<any>(null);
    const [templates,setTemplates] = React.useState<any>(null);
    const [words, setWords] = React.useState<any>(null);

    const fetchGenerators = async () => {
        const data = await import("../../pools/utility-templates");
        setGenerators(data);
    }
    const fetchTemplates = async () => {
        const data = await import("../../pools/template-pool");
        setTemplates(data);
    }
    const fetchWords = async () => {
        const data = await import("../../pools/word-pool");
        setWords(data);
    }
    useEffect(() => {
        fetchGenerators();
        fetchTemplates();
        fetchWords();
      }, [])

    console.log("here we are", generators,templates,words)
    const runTemplate = (templateName:string) => {
        const template = templates[templateName];
        console.log("template", template);
        return template;
    }
    const runGenerator = (generatorName:string) => {
        const generator = generators[generatorName];
        console.log("generator", generator);
        return generator;
    }

    return {
        runTemplate,
        runGenerator
    }
}