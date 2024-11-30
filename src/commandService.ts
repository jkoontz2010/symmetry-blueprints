import { promises as fs } from "fs";
import path from "path";

export async function readFromConfig(configVar: string, pathToConfig: string) {
  const data = await fs.readFile(pathToConfig, { encoding: "utf8" });

  const lines = data.split("\n");
  const result = lines.find((line) => line.includes(configVar)).split("=")[1];

  return result;
}
export  const getWordPath = async (pathToConfig: string, wordName:string) =>{
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const wordPaths = await getWordJsonFiles(projectDir);
  const wordNames = getWordNamesFromWordPaths(wordPaths);
  const wordIndex = wordNames.indexOf(wordName);
  return wordPaths[wordIndex];
}
export const getWordNamesFromWordPaths = (wordPaths: string[]) => {
    const wordNames = wordPaths.map((wordPath) => path.basename(wordPath, ".json").split("_")[1]);
    return wordNames;
    }

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

export const getAllWordPathsByLastModified = async (pathToConfig: string) => {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const wordPaths = await getWordJsonFiles(projectDir);
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
