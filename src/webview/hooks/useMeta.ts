import { compact } from "lodash";
import { useEffect, useState } from "react";

import {
  BuilderGenerator,
  BuilderNewWord,
  BuilderTemplate,
  BuilderWord,
} from "./useWordBuilder";
import {  parseWords } from "../util/parsers/parseWords";
import { parseGenerators } from "../util/parsers/parseGenerators";
import { buildTemplateMeta } from "../util/parsers/parseTemplates";

export function useMeta({
  wordsFileText,
  templatesFileText,
  generatorsFileText,
}: {
  wordsFileText: string;
  templatesFileText: string;
  generatorsFileText: string;
}) {
  const [wordsMeta, setWordsMeta] = useState<BuilderWord[]>([]);
  const [templatesMeta, setTemplatesMeta] = useState<BuilderTemplate[]>([]);
  const [generatorsMeta, setGeneratorsMeta] = useState<BuilderGenerator[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  useEffect(() => {
    // start with fake, move to ....how do we get from file system.
    // VS Code API. do that separately?
    // need to turn input into meta.

    const parsedWords = parseWords(wordsFileText);
    const parsedGenerators = parseGenerators(generatorsFileText);

    const parsedTemplates = buildTemplateMeta(templatesFileText);
    console.log("PARSEDAND GOOD", {
      parsedWords,
      parsedGenerators,
      parsedTemplates,
    });

    // grab all the meta! apply to the objects! go go go!
    setWordsMeta([
      {
        name: "combineEverything",
        steps: [],
      },
    ]); 
    setGeneratorsMeta(parsedGenerators);
    setTemplatesMeta(compact(parsedTemplates));
  }, [generatorsFileText, templatesFileText, wordsFileText]);
  return { wordsMeta, templatesMeta, generatorsMeta };
}
