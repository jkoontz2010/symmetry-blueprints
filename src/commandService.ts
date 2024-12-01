import { promises as fs } from "fs";
import path from "path";

export async function appendToFile(filePath: string, data: string) {
  try {
    await fs.appendFile(filePath, data);
  }
  catch (error) {
    console.error(`Error appending to file: ${error.message}`);
    throw error;
  }
}

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

export const storeFileHash = async (pathToConfig: string, fileHash: string, filePath: string) => {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const hashFilePath = path.join(projectDir, "filePathHashes.txt");
  const currentHashes = getFilePathHashes(pathToConfig);
  if(currentHashes[fileHash] !== undefined){
    return;
  }
  await fs.appendFile(hashFilePath, `${fileHash}=${filePath}\n`);
}
export const getFilePathHashes = async (pathToConfig: string): Promise<Record<string,string>> => {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const hashFilePath = path.join(projectDir, "filePathHashes.txt");
  const data = await fs.readFile(hashFilePath, { encoding: "utf8" });
  const lines = data.split("\n");
  // go from "hash=file/path/thing.ts" to {[hash]: "file/path/thing.ts"} in one object
  const result = lines.reduce((acc, line) => {
    const [hash, filePath] = line.split("=");
    acc[hash] = filePath;
    return acc;
  },{});
  return result;
}
export const getFilePathFromHash = async (pathToConfig: string, fileHash: string) => {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const hashFilePath = path.join(projectDir, "filePathHashes.txt");
  const data = await fs.readFile(hashFilePath, { encoding: "utf8" });
  const lines = data.split("\n");
  const result = lines.find((line) => line.includes(fileHash)).split("=")[1];
  return result;
}
export const getFilePathFromHashes = (hashes: Record<string,string>, fileHash: string) => {
  const result = hashes[fileHash];
  return result;
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

export const overwriteFile = async (filePath: string, data: string) => {
  try {
    await fs
      .writeFile(filePath, data)
      .then(() => console.log(`File ${filePath} has been overwritten`));
  } catch (error) {
    console.error(`Error overwriting file: ${error.message}`);
    throw error;
  }
}
