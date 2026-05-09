import { homedir } from "node:os";
import { join } from "node:path";

export const WIDGIO_DIR = join(homedir(), ".widgio");
export const SERVER_INFO_PATH = join(WIDGIO_DIR, "server.json");
export const SERVER_LOG_PATH = join(WIDGIO_DIR, "server.log");
export const LAST_ID_PATH = join(WIDGIO_DIR, "last.json");
export const THREADS_DIR = join(WIDGIO_DIR, "threads");
