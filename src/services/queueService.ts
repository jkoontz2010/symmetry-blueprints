import { readFromFile } from "../panel";
import { readFromConfig } from "./commandService";

export async function getQueues(pathToStorageBase: string) {
    const queueFile = pathToStorageBase + "/queues.json";
    const contents = await readFromFile(queueFile) as string;
    return JSON.parse(contents);
}

export async function getQueueByName(pathToStorageBase:string, name:string) {
    const queues = await getQueues(pathToStorageBase);
    return queues.find((queue: { name: string; }) => queue.name === name);
}