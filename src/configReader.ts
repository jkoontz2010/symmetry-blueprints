import { promises as fs } from "fs";

export async function readFromConfig(configVar: string, pathToConfig: string) {
  const data = await fs.readFile(pathToConfig, { encoding: "utf8" });

  const lines = data.split("\n");
  const result = lines.find((line) => line.includes(configVar)).split("=")[1];

  return result;
}
