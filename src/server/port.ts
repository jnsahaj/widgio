import { createServer } from "node:net";

export async function findFreePort(start: number, attempts = 20): Promise<number> {
  for (let i = 0; i < attempts; i++) {
    const port = start + i;
    if (await isFree(port)) return port;
  }
  throw new Error(`No free port in range ${start}-${start + attempts}`);
}

function isFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port, "127.0.0.1");
  });
}
