export type WidgetMode = "svg" | "html";

export interface ThreadSummary {
  id: string;
  title: string;
  mode: WidgetMode;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  inProgress: boolean;
}

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
