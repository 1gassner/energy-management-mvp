/**
 * Strict type definitions to replace 'any' usage
 */

// API Response types
export type ApiResponse<T = unknown> = {
  data: T;
  status: number;
  message?: string;
  error?: string;
};

// Generic event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type ClickHandler = EventHandler<React.MouseEvent>;
export type ChangeHandler = EventHandler<React.ChangeEvent<HTMLInputElement>>;
export type SubmitHandler = EventHandler<React.FormEvent>;

// WebSocket message types
export type WebSocketMessage<T = unknown> = {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
};

// Chart data types
export type ChartDataPoint = {
  [key: string]: string | number | Date;
};

// Error types
export type ErrorWithMessage = {
  message: string;
  code?: string;
  stack?: string;
};

// Function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type VoidFunction = () => void;
export type Callback<T = void> = (data: T) => void;

// Component prop types
export type ChildrenProp = {
  children: React.ReactNode;
};

export type ClassNameProp = {
  className?: string;
};

export type StyleProp = {
  style?: React.CSSProperties;
};

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Record types
export type StringRecord = Record<string, string>;
export type NumberRecord = Record<string, number>;
export type UnknownRecord = Record<string, unknown>;

// Array types
export type StringArray = string[];
export type NumberArray = number[];
export type UnknownArray = unknown[];

// Replace common 'any' patterns
export type SafeAny = unknown;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];