/**
 * A2UI v0.9 TypeScript Specification & Type Definitions
 * Compatible with Google A2UI standard (https://github.com/a2ui-project/a2ui)
 */

export type A2UIVersion = 'v0.8' | 'v0.9';

export type DynamicBoundValue<T = any> = 
  | T 
  | { path: string } 
  | { literal: T };

export interface A2UITheme {
  primaryColor?: string;
  font?: string;
  borderRadius?: number;
}

export interface CreateSurfaceMessage {
  version: A2UIVersion;
  createSurface: {
    surfaceId: string;
    catalogId?: string;
    theme?: A2UITheme;
  };
}

export interface A2UIActionContext {
  [key: string]: DynamicBoundValue | string | number | boolean | object;
}

export interface A2UIAction {
  event: {
    name: string;
    context?: A2UIActionContext;
  };
}

export interface TemplateChildren {
  componentId: string;
  path: string;
}

export type ChildrenType = string[] | TemplateChildren;

export interface ComponentDefinition {
  id: string;
  component: string;
  weight?: number;
  child?: string;
  children?: ChildrenType;
  action?: A2UIAction;
  [key: string]: any;
}

export interface UpdateComponentsMessage {
  version: A2UIVersion;
  updateComponents: {
    surfaceId: string;
    components: ComponentDefinition[];
  };
}

export interface UpdateDataModelMessage {
  version: A2UIVersion;
  updateDataModel: {
    surfaceId: string;
    path: string;
    value: any;
  };
}

export interface DeleteSurfaceMessage {
  version: A2UIVersion;
  deleteSurface: {
    surfaceId: string;
  };
}

export type A2UIMessage =
  | CreateSurfaceMessage
  | UpdateComponentsMessage
  | UpdateDataModelMessage
  | DeleteSurfaceMessage;

export interface SurfaceState {
  surfaceId: string;
  catalogId?: string;
  theme?: A2UITheme;
  components: Map<string, ComponentDefinition>;
  dataModel: Record<string, any>;
  rootComponentId?: string;
}

export interface ClientEventPayload {
  eventName: string;
  surfaceId: string;
  context: Record<string, any>;
  timestamp: string;
}
