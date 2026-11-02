/** Frontend actions the help copilot may trigger. Dispatched as window events so pages stay decoupled. */
export const COPILOT_ACTIONS = ["setActiveTab", "setFunctionInput", "toggleBlackboardMode", "toggleBlacklight", "trigger3D"] as const;
export type CopilotActionType = (typeof COPILOT_ACTIONS)[number];
export type CopilotAction = { type: CopilotActionType; value: string };

export const TAB_ROUTES: Record<string, string> = {
  funcoes: "/", limites: "/limites", derivadas: "/derivadas", integrais: "/integrais", aprenda: "/aprenda", ia: "/ia", creditos: "/creditos",
};

export const EV_FUNCTION = "calculuslab:set-function";
export const EV_THEME = "calculuslab:set-theme";
export const EV_3D = "calculuslab:enable-3d";

export type ThemeEventDetail = { chalkboard?: boolean; blacklight?: boolean };

/** Parse "on"/"off"/"" into a boolean or undefined (= toggle). */
export function onOff(value: string): boolean | undefined {
  const v = value.trim().toLowerCase();
  return v === "on" || v === "true" ? true : v === "off" || v === "false" ? false : undefined;
}
