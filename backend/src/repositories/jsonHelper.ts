import fs from "fs/promises";

export async function readJSON<T>(filePath: string): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw new Error(`File not found at: ${filePath}`);
    }
    throw new Error(`Failed to parse JSON file at ${filePath}: ${error.message}`);
  }
}

export async function writeJSON<T>(filePath: string, data: T): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, "utf-8");
  } catch (error: any) {
    throw new Error(`Failed to write JSON file at ${filePath}: ${error.message}`);
  }
}
