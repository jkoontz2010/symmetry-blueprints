import { Template } from "symmetric-parser/dist/src/templator/template-group";
import { TemplateAsString } from "./wordRunService";
import {
  getAllFileTemplates,
  readFromConfig,
  storeFileHashes,
} from "./commandService";

import { promises as fs } from "fs";
import * as path from "path";
import { insertIntoTemplate, orderedParse, tts } from "symmetric-parser";
import { formFilePathHash } from "../panel";

export const identity = async (
  pathToConfig: string,
  input: TemplateAsString
) => {
  return input;
};

export const get = async (pathToConfig: string, input: TemplateAsString) => {
  const baseDir = await readFromConfig("BASE_DIR", pathToConfig);
  const ignore = await readFromConfig("IGNORE", pathToConfig);
  const parseTemplate = new Function("return " + input)();
  const excludeTempl = {};
  Object.keys(parseTemplate).filter((key) => key.includes("excludePath")).forEach((key) => {
    excludeTempl[key] = parseTemplate[key]
  })
  const excludeValues = Object.keys(excludeTempl).map((key) => excludeTempl[key]());
  const allFilePaths = await getAllFilePaths(baseDir, [ignore,...excludeValues]);

  const allFilePathsTemplate: Template = allFilePaths.reduce(
    (t: Template, path: string) => {
      const rt = insertIntoTemplate(t, { localFilePath: () => path });
      return rt;
    },
    {}
  );

console.log("THE PARSE TEMPLAT", tts(parseTemplate, false))

  const includeTempl = {};
  Object.keys(parseTemplate).filter((key) => key.includes("filePath")).forEach((key) => {
    includeTempl[key] = parseTemplate[key]
  })


  const division = orderedParse(allFilePathsTemplate, [includeTempl]);

  // find all keys with filePath in the denominator
  const filePaths = Object.keys(division)
    .filter((key) => key.includes("/filePath"))
    .map((test) => {
      console.log("TEST", test);
      return test;
    })
    .map((key) => key.split("/")[0])
    .map((numerator) => allFilePathsTemplate[numerator]());




  const filePathHashesMap = {};

  filePaths.forEach(
    (filePath) => (filePathHashesMap[filePath] = formFilePathHash(filePath))
  );

  await storeFileHashes(pathToConfig, filePathHashesMap);

  const fileTemplates = await getAllFileTemplates(pathToConfig, filePaths);

  return tts(fileTemplates, false);
};

export const getOrCreate = async (
  pathToConfig: string,
  input: TemplateAsString
) => {
  return input;
};

async function getAllFilePaths(dir: string, ignoreAll: string[]): Promise<string[]> {
  let results: string[] = [];

  // Read directory entries (files & folders)
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Construct the full path
    const fullPath = path.join(dir, entry.name);

    // Skip if the path includes the ignore string
    if (ignoreAll && ignoreAll.some(i=>fullPath.includes(i))) {
      continue;
    }

    // Check if the entry is a directory or a file
    if (entry.isDirectory()) {
      // Recursively gather paths from the subdirectory
      const subPaths = await getAllFilePaths(fullPath, ignoreAll);
      results.push(...subPaths);
    } else {
      // It's a file; add to results
      results.push(fullPath);
    }
  }

  return results;
}
