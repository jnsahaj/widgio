export type WidgetMode = "svg" | "html";

interface BaseEvent {
  id: string;
  createdAt: number;
}

export interface WidgetCompleteEvent extends BaseEvent {
  kind: "complete";
  title: string;
  mode: WidgetMode;
  code: string;
  loadingMessages: string[];
}

export interface WidgetStartEvent extends BaseEvent {
  kind: "start";
  title: string;
  mode: WidgetMode;
  rootAttrs?: string;
  loadingMessages: string[];
}

export interface WidgetChunkEvent extends BaseEvent {
  kind: "chunk";
  seq: number;
  label?: string;
  code: string;
}

export interface WidgetEndEvent extends BaseEvent {
  kind: "end";
}

export type WidgetEvent =
  | WidgetCompleteEvent
  | WidgetStartEvent
  | WidgetChunkEvent
  | WidgetEndEvent;

export interface ServerInfo {
  pid: number;
  port: number;
  url: string;
  startedAt: number;
}

export interface ShowRequest {
  title: string;
  code: string;
  loadingMessages: string[];
  mode?: WidgetMode | "auto";
}

export interface StartRequest {
  id: string;
  title: string;
  mode: WidgetMode;
  rootAttrs?: string;
  loadingMessages: string[];
}

export interface ChunkRequest {
  code: string;
  label?: string;
  seq?: number;
}

/**
 * On-disk thread record. The `v` field is a hard schema version — bump it and
 * write a migration if the shape changes. Plain JSON, one file per thread, so
 * users can back these up, sync them, or hand-edit.
 */
export interface Thread {
  v: 1;
  id: string;
  title: string;
  mode: WidgetMode;
  rootAttrs?: string;
  code: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

export interface ThreadSummary {
  id: string;
  title: string;
  mode: WidgetMode;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  inProgress: boolean;
}
