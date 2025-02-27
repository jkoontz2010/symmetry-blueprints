import { promises as fs } from "fs";
import { compact, uniq } from "lodash";
import path from "path";
import {
  argsAndTemplateToFunction,
  genTemplateWithVars,
  insertIntoTemplate,
  orderedParse,
  stringCleaning,
  stringUnCleaning,
  tts,
} from "symmetric-parser";
import { QUEUE_SPLITTER, RESULT_SPLITTER } from "./hardToParse/util";
import { getTemplateFile, getWordsFile } from "../panel";

export async function appendToFile(filePath: string, data: string) {
  try {
    await fs.appendFile(filePath, data);
  } catch (error) {
    console.error(`Error appending to file: ${error.message}`);
    throw error;
  }
}

export async function readFromConfig(configVar: string, pathToConfig: string) {
  try {
    const data = await fs.readFile(pathToConfig, { encoding: "utf8" });

    const lines = data.split("\n");
    const result = lines.find((line) => line.includes(configVar)).split("=")[1];
    return result;
  } catch (error) {
    console.error("WRONG CONFIG VAR NAME PROVIDED");

    throw error;
  }
}

export async function readMultipleFromConfig(configVars: string[], pathToConfig: string) {
  try {
    let results = [];
    const data = await fs.readFile(pathToConfig, { encoding: "utf8" });

    const lines = data.split("\n");
    configVars.forEach((configVar) => {
      const result = lines.find((line) => line.includes(configVar)).split("=")[1];
      results.push(result);
    });
    
    return results;
  } catch (error) {
    console.error("WRONG CONFIG VAR NAME PROVIDED");

    throw error;
  }
}
export const getWordPath = async (pathToStorage: string, wordName: string) => {
  const wordPaths = await getWordJsonFiles(pathToStorage+"words");
  const wordNames = getWordNamesFromWordPaths(wordPaths);
  const wordIndex = wordNames.indexOf(wordName);
  return wordPaths[wordIndex];
};

const getHashFilePath = async (pathToStorage) => {
  const hashFilePath = path.join(pathToStorage, "/filePathHashes.txt");
  return hashFilePath;
};
export const storeFileHashes = async (
  pathToStorage: string,
  filePathHashesMap: Record<string, string>
) => {
  const allStores = Object.entries(filePathHashesMap).map(
    async ([filePath, fileHash]) => {
      return storeFileHash(pathToStorage, fileHash, filePath);
    }
  );
  return await Promise.all(allStores);
};
export const storeFileHash = async (
  pathToStorage: string,
  fileHash: string,
  filePath: string
) => {
  const hashFilePath = await getHashFilePath(pathToStorage);
  const currentHashes = await getFilePathHashes(pathToStorage);
  if (currentHashes[fileHash] !== undefined) {
    return;
  }
  await fs.appendFile(hashFilePath, `${fileHash}=${filePath}\n`);
};

export const getAllFileTemplates = async (
  pathToStorage: string,
  onlyIncludePaths?: string[]
) => {
  if (pathToStorage == null) {
    throw new Error("pathToConfig is null in getAllFileTemplates");
  }
  const currentHashes = await getFilePathHashes(pathToStorage);
  const filePaths = new Set<string>();
  for (const filePath of Object.values(currentHashes)) {
    if (onlyIncludePaths?.length > 0) {
      if (onlyIncludePaths?.includes(filePath)) {
        filePaths.add(filePath);
      }
    } else {
      filePaths.add(filePath);
    }
  }
  //console.log("getAllFileTemplates");
  //console.log("FILE PATHS", Array.from(filePaths));
  const readPromises = Array.from(filePaths).map(async (filePath) => {
    try {
    const data = await fs.readFile(filePath, { encoding: "utf8" });
    return { filePath, data };
    }catch {
      return null;
    }
  });
  const allFiles = compact(await Promise.all(readPromises))
  //console.log("ALL FILES", allFiles);
  let allFileTemplates = {};
  let idx = 1;
  for (const file of allFiles) {
    const { filePath, data } = file;
    const cleanedData = stringCleaning(data);
    const fileHash = Object.keys(currentHashes).find(
      (key) => currentHashes[key] === filePath
    );
    if (fileHash == null) {
      throw new Error(
        "file hash not found in getAllFileTemplates, it should exist!!"
      );
    }
    // try with string cleaning
    const funcPart = argsAndTemplateToFunction([], cleanedData);
    if (funcPart == null || !(funcPart instanceof Function)) {
      throw new Error(
        "funcPart is null or not a Function type in getAllFileTemplates, it should exist!!"
      );
    }
    // don't try to make this readable. it fucks up the template.
    const readableFileHash = fileHash;
    const fileTempl = {};
    const newKey = "fileContents" + idx;
    fileTempl[newKey] = funcPart;
    const newTempl = genTemplateWithVars(
      {
        [readableFileHash]: () => `${newKey}`,
      },
      [newKey]
    );
    allFileTemplates = { ...allFileTemplates, ...newTempl, ...fileTempl };
    idx++;
  }
  //console.log("ALL FILE TEMPLATES", allFileTemplates)
  return allFileTemplates;
};
export const getRawFilePathHashes = async (pathToStorage: string) => {
  const hashFilePath = await getHashFilePath(pathToStorage);
  const data = await fs.readFile(hashFilePath, { encoding: "utf8" });
  const lines = data.split("\n");
  return lines;
};
export const getFilePathHashes = async (
  pathToStorage: string
): Promise<Record<string, string>> => {
  const lines = await getRawFilePathHashes(pathToStorage);
  // go from "hash=file/path/thing.ts" to {[hash]: "file/path/thing.ts"} in one object
  const cleanLines = uniq(compact(lines));
  const result = cleanLines.reduce((acc, line) => {
    const [hash, filePath] = line.split("=");
    acc[hash] = filePath;
    return acc;
  }, {});
  return result;
};
export const getFilePathFromHash = async (
  pathToStorage: string,
  fileHash: string
) => {
  const hashFilePath = path.join(pathToStorage, "filePathHashes.txt");
  const data = await fs.readFile(hashFilePath, { encoding: "utf8" });
  const lines = data.split("\n");
  const result = lines.find((line) => line.includes(fileHash)).split("=")[1];
  return result;
};
export const getFilePathFromHashes = (
  hashes: Record<string, string>,
  fileHash: string
) => {
  const result = hashes[fileHash];
  return result;
};
export const getWordNamesFromWordPaths = (wordPaths: string[]) => {
  const wordNames = wordPaths.map(
    (wordPath) => path.basename(wordPath, ".json").split("_")[1]
  );
  return wordNames;
};

export const getWordContents = async (wordPath: string) => {
  const wordContents = await fs.readFile(wordPath, { encoding: "utf8" });
  return wordContents;
};

export const sortFilesByLastModified = async (filePaths: string[]) => {
  const filesWithStats = await Promise.all(
    filePaths.map(async (file) => {
      const stats = await fs.stat(file); // Get file stats
      return { file, mtime: stats.mtime }; // Return file path and modified time
    })
  );

  // Sort by last modified date (mtime)
  filesWithStats.sort((a: any, b: any) => b.mtime - a.mtime); // Most recent first

  // Return sorted file paths
  return filesWithStats.map((item) => item.file);
};

export const getAllWordPathsByLastModified = async (pathToStorage: string) => {
  const wordPaths = await getWordJsonFiles(pathToStorage);
  return wordPaths;
};
async function getWordJsonFiles(directory) {
  try {
    // Read all files from the directory
    const files = await fs.readdir(directory);

    // Filter files that start with 'word_' and have '.json' extension
    const wordJsonFiles = files
      .filter((file) => file.startsWith("word_") && file.endsWith(".json"))
      .map((file) => path.join(directory, file)); // Create full file paths

    return wordJsonFiles;
  } catch (error) {
    console.error(`Error reading directory: ${error.message}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export const overwriteFile = async (filePath: string, data: string) => {
  try {
    await fs
      .writeFile(filePath, data)
      .then(() => console.log(`File ${filePath} has been overwritten`));
  } catch (error) {
    console.error(`Error overwriting file: ${error.message}`);
    throw error;
  }
};

// WILL BREAK, NEED TO PULL FROM NODE_MODULES, which will always exist in the extension
export const getAllGeneratorsExports = async () => {
  const generatorFilePath = "/Users/jaykoontz/Documents/GitHub/react-for-code/src/templator/utility-templates.ts";

  const generatorFileContents = await fs.readFile(generatorFilePath, {
    encoding: "utf8",
  });
  // this will happen a lot. we'll need a good way to do it. IMO, find the exports via parsing
  const exportTempl = genTemplateWithVars(
    {
      exportDef: () => `\nexport function exportName(`,
    },
    ["exportName"]
  );
  const fileTempl = {
    file: argsAndTemplateToFunction([], stringCleaning(generatorFileContents)),
  };
  const parsed = orderedParse(fileTempl, [exportTempl]);
  //console.log("THIS IS PARSED", parsed);
  const nameKeys = Object.keys(parsed).filter((k) =>
    k.startsWith("exportName")
  );
  const nameValues = nameKeys.map((k) => parsed[k]());
  //console.log("FOLUND ALL EXPORTS", nameValues);
  return nameValues;
};

export const getAllTemplateExports = async (pathToStorage: string) => {
  //console.log("get all template exports");
  const templateFilePath = getTemplateFile(pathToStorage);
  const templateFileContents = await fs.readFile(templateFilePath, {
    encoding: "utf8",
  });

  const exportTempl = genTemplateWithVars(
    {
      exportDef: () => `\nexport const exportName = `,
    },
    ["exportName"]
  );
  //console.log("file contents", templateFileContents);
  const fileTempl = {
    file: argsAndTemplateToFunction([], stringCleaning(templateFileContents)),
  };
  //console.log("templTHIS IS FILE", tts(fileTempl, false));
  const parsed = orderedParse(fileTempl, [exportTempl]);
  //console.log("templTHIS IS PARSED", parsed);
  const nameKeys = Object.keys(parsed).filter((k) =>
    k.startsWith("exportName")
  );
  const nameValues = nameKeys.map((k) => stringUnCleaning(parsed[k]()));
 // console.log("templFOLUND ALL EXPORTS", nameValues);
  return nameValues;
};

export const saveRunnableWord = async (pathToStorage: string, word: string) => {
  const wordPath = getWordsFile(pathToStorage);
  const wordContents = await getWordContents(wordPath);
  const templates = await getAllTemplateExports(pathToStorage);
  const generators = await getAllGeneratorsExports();
  const fullWordContents = `${wordContents}\n${word}`;
  const importedTemplates = templates.filter((t) =>
    fullWordContents.includes(t)
  );
  const importedGenerators = generators.filter((g) =>
    fullWordContents.includes(g)
  );
  const templatesImport =
    importedTemplates.length > 0
      ? `import { ${importedTemplates.join(",\n")} } from "./template-pool";`
      : "";
  const generatorsImport =
    importedGenerators.length > 0
      ? `import { ${importedGenerators.join(",\n")} } from "symmetric-parser";`
      : "";

  const otherImports = `import flow from 'lodash/flow'; import { Template } from './types';`;
  const queueDeclaration = `let QUEUE: Template[]=[]
// DO NOT PLACE CONSOLE LOGS HERE EVER
export function buildQueue(template: Template) {
    QUEUE.push(template)
    return template
}
export function getQueue() {
    return QUEUE
}
export function clearQueue() {
    QUEUE=[]
}`

  const splitOldWord = wordContents.split(queueDeclaration)[1];
  const wordContentsWithImports = `${templatesImport}\n${generatorsImport}\n${otherImports}\n${queueDeclaration}\n${splitOldWord}\n${word}`;

  await overwriteFile(wordPath, wordContentsWithImports);
};

export const createRunnableGeneratorFileContents = async (
  pathToStorage: string,
  generatorString: string,
  template: string
): Promise<string> => {
  const words = await getAllRunnableWords(pathToStorage);
  const templates = await getAllTemplateExports(pathToStorage);
  const generators = await getAllGeneratorsExports();

  const importedTemplates = templates.filter((t) =>
    generatorString.includes(t)
  );
  const importedGenerators = generators.filter((g) =>
    generatorString.includes(g)
  );
  const importedWords = words.filter((w) => generatorString.includes(w));
  const generalImports = `import { buildQueue, getQueue, clearQueue } from "./word-pool";`;
  const templatesImport =
    importedTemplates.length > 0
      ? `import { ${importedTemplates.join(",\n")} } from "./template-pool";\n`
      : "";
  const generatorsImport = `import {  tts,\nrun,\n${importedGenerators.join(
    ",\n"
  )} } from "symmetric-parser";\n`;
  const wordsImport =
    importedWords.length > 0
      ? `import { ${importedWords.join(",\n")} } from "./word-pool";\n`
      : "";

  const allImports = `${generalImports}\n${templatesImport}\n${generatorsImport}\n${wordsImport}`;

  const templateString = `const template = ${template};`;
  const generatorRun = `// @ts-ignore\nconst result = ${generatorString};\nconst queue=getQueue();\nconsole.log(tts(result,false));\nif(queue.length>0) {\nconsole.log("${RESULT_SPLITTER}");\nqueue.forEach(q=>console.log(tts(q,false),"${QUEUE_SPLITTER}"))}\nclearQueue();`;
  return `${allImports}\n${templateString}\n${generatorRun}`;
};

export const getAllRunnableWords = async (pathToStorage: string) => {
  const wordFilePath = getWordsFile(pathToStorage);
  const wordFileContents = await fs.readFile(wordFilePath, {
    encoding: "utf8",
  });
  const wordTempl = genTemplateWithVars(
    {
      wordDef: () => `\nexport const wordName = flow(`,
    },
    ["wordName"]
  );
  const fileTempl = {
    file: argsAndTemplateToFunction([], stringCleaning(wordFileContents)),
  };
  let parsed;
  try {
    parsed = orderedParse(fileTempl, [wordTempl]);
  } catch {
    return [];
  }
  //console.log("THIS IS PARSED", parsed);
  const nameKeys = Object.keys(parsed).filter((k) => k.startsWith("wordName"));
  const nameValues = nameKeys.map((k) => parsed[k]());
  //console.log("FOLUND ALL WORDS", nameValues);
  return nameValues;
};
