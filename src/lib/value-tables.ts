/**
 * Estado das tabelas de valores da aba Funções: cada função cadastrada (slot)
 * guarda suas próprias linhas nas duas modalidades ("fx": x → f(x); "x": f(x) → x),
 * e os dados são invalidados apenas quando a expressão daquela função muda.
 */
export const MAX_TABLE_ROWS = 5;
export type TableMode = "fx" | "x";
export type FunctionTableData = { expr: string; fx: string[]; x: string[] };
export type TablesState = Record<number, FunctionTableData>;

export const emptyRows = (): string[] => [""];

/** Linhas de um slot/modalidade; vazias quando a expressão mudou desde que os dados foram salvos. */
export function tableRows(data: FunctionTableData | undefined, expression: string, mode: TableMode): string[] {
  if (!data || data.expr !== expression) return emptyRows();
  return data[mode].length ? data[mode] : emptyRows();
}

/** Grava as linhas de uma modalidade sem tocar na outra nem nos demais slots. */
export function writeRows(tables: TablesState, slot: number, expression: string, mode: TableMode, rows: string[]): TablesState {
  const prev = tables[slot];
  const keep = prev && prev.expr === expression ? prev : { expr: expression, fx: emptyRows(), x: emptyRows() };
  return { ...tables, [slot]: { ...keep, expr: expression, [mode]: rows } };
}

/** Adiciona uma linha em branco até o limite de MAX_TABLE_ROWS. */
export function addTableRow(rows: string[]): string[] {
  return rows.length >= MAX_TABLE_ROWS ? rows : [...rows, ""];
}
