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

export const identity = async (pathToConfig: string, input: TemplateAsString) => {
    return input
}

export const get = async (pathToConfig: string, input: TemplateAsString) => {
  const baseDir = await readFromConfig("BASE_DIR", pathToConfig);
  const ignore = await readFromConfig("IGNORE", pathToConfig);
  const allFilePaths = await getAllFilePaths(baseDir, ignore);

  const allFilePathsTemplate: Template = allFilePaths.reduce(
    (t: Template, path: string) => {
      const rt = insertIntoTemplate(t, { localFilePath: () => path });
      return rt;
    },
    {}
  );

  const parseTemplate = new Function("return " + input)();

  const division = orderedParse(allFilePathsTemplate, [parseTemplate]);

  // find all keys with filePath in the denominator
  const filePaths = Object.keys(division)
    .filter((key) => key.includes("/filePath"))
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

async function getAllFilePaths(dir: string, ignore: string): Promise<string[]> {
  let results: string[] = [];

  // Read directory entries (files & folders)
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Construct the full path
    const fullPath = path.join(dir, entry.name);

    // Skip if the path includes the ignore string
    if (ignore && fullPath.includes(ignore)) {
      continue;
    }

    // Check if the entry is a directory or a file
    if (entry.isDirectory()) {
      // Recursively gather paths from the subdirectory
      const subPaths = await getAllFilePaths(fullPath, ignore);
      results.push(...subPaths);
    } else {
      // It's a file; add to results
      results.push(fullPath);
    }
  }

  return results;
}
