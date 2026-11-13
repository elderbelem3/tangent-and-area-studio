import { useMemo } from "react";
import { Plus, Eraser, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { Panel, num } from "@/components/Lab";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fmt, parseFn } from "@/lib/calc";
import { solveForX } from "@/lib/inverse";
import { needs3D } from "@/lib/smart3d";
import { FUNCTION_BG_COLORS, FUNCTION_SLOTS, type ComparisonFunction } from "@/lib/comparison";
import { useModuleState } from "@/lib/module-state";
import { MAX_TABLE_ROWS, addTableRow, emptyRows, tableRows, writeRows, type TableMode, type TablesState } from "@/lib/value-tables";

const inputClass = "h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-base sm:text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

/**
 * Tabela de valores com duas modalidades por função cadastrada:
 * "Encontre valores de f(x)" (informa x) e "Encontre valores de x" (informa f(x)).
 * Cada função mantém seus dados de forma independente.
 */
export function ValueTables({ functions }: { functions: ComparisonFunction[] }) {
  const valid = functions.filter((f) => f.expression.trim());
  const [slot, setSlot] = useModuleState<number>("tabela.slot", 0);
  const [mode, setMode] = useModuleState<TableMode>("tabela.mode", "fx");
  const [tables, setTables] = useModuleState<TablesState>("tabela.tables", {});

  const active = valid.find((f) => f.slot === slot) ?? valid[0];
  const expression = active?.expression ?? "";
  const label = active ? FUNCTION_SLOTS[active.slot] : "f";
  const is3D = active ? needs3D(active.expression) : false;

  const rows = active ? tableRows(tables[active.slot], expression, mode) : emptyRows();
  const setRows = (next: string[]) => { if (active) setTables((prev) => writeRows(prev, active.slot, expression, mode, next)); };

  const { fn } = useMemo(() => parseFn(expression), [expression]);
  const solutions = useMemo(
    () => mode === "x" && fn ? rows.map((r) => { const n = num(r); return n === null ? null : solveForX(expression, n); }) : [],
    [mode, fn, rows, expression],
  );

  const resultFor = (row: string, index: number): { text: string; roots?: number[]; error?: boolean } => {
    const n = num(row);
    if (n === null) return { text: row.trim() ? "valor inválido" : "—", error: Boolean(row.trim()) };
    if (mode === "fx") {
      if (!fn) return { text: "—" };
      const v = fn(n);
      return Number.isFinite(v) ? { text: fmt(v, 6) } : { text: "indefinido", error: true };
    }
    const roots = solutions[index];
    if (!roots) return { text: "—" };
    if (!roots.length) return { text: "sem solução real em [−50, 50]", error: true };
    return roots.length === 1 ? { text: `x = ${fmt(roots[0]!, 6)}` } : { text: "", roots };
  };

  return (
    <Panel title="Tabela de valores">
      {!active ? (
        <p className="text-sm text-muted-foreground">Cadastre uma função acima para consultar valores.</p>
      ) : (
        <div className="space-y-4">
          {valid.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Função da tabela">
              {valid.map((f) => (
                <button
                  key={f.slot}
                  type="button"
                  role="tab"
                  aria-selected={f.slot === active.slot}
                  onClick={() => setSlot(f.slot)}
                  className={`inline-flex h-11 items-center gap-2 rounded-lg border px-3 font-mono text-sm transition sm:h-9 ${f.slot === active.slot ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${FUNCTION_BG_COLORS[f.slot]}`} />
                  {FUNCTION_SLOTS[f.slot]}(x)
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Modalidade de consulta">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "fx"}
              onClick={() => setMode("fx")}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-2 text-sm transition sm:h-10 ${mode === "fx" ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
            >
              <ArrowRight className="h-4 w-4 shrink-0" />Encontre {label}(x)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "x"}
              onClick={() => setMode("x")}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-2 text-sm transition sm:h-10 ${mode === "x" ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />Encontre x
            </button>
          </div>

          {is3D ? (
            <p className="text-sm text-muted-foreground">{label}(x, y) é uma função de duas variáveis — explore-a no gráfico 3D. As tabelas de valores trabalham com funções de uma variável.</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {mode === "fx"
                  ? `Informe valores de x e veja ${label}(x) calculado pela expressão cadastrada.`
                  : `Informe valores de ${label}(x) e a calculadora encontra os valores de x correspondentes.`}
              </p>
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1 pr-2">{mode === "fx" ? "x" : `${label}(x)`}</th>
                    <th className="py-1">{mode === "fx" ? `${label}(x)` : "x"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const result = resultFor(row, i);
                    return (
                      <tr key={i} className="border-t border-border">
                        <td className="py-1.5 pr-2">
                          <input
                            aria-label={mode === "fx" ? `x da linha ${i + 1}` : `${label}(x) da linha ${i + 1}`}
                            value={row}
                            placeholder={mode === "fx" ? "valor de x" : `valor de ${label}(x)`}
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            inputMode="decimal"
                            onChange={(e) => setRows(rows.map((r, j) => (j === i ? e.target.value : r)))}
                            className={inputClass}
                          />
                        </td>
                        <td className={`py-1.5 align-middle ${result.error ? "text-destructive" : ""}`}>
                          {result.roots ? (
                            <div className="flex flex-col gap-0.5">
                              {result.roots.map((r, k) => (
                                <span key={k} className="whitespace-nowrap">
                                  x<sub>{k + 1}</sub> = {fmt(r, 6)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            result.text
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" disabled={rows.length >= MAX_TABLE_ROWS} onClick={() => setRows(addTableRow(rows))}>
                  <Plus className="h-4 w-4" />Adicionar valores
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setRows(emptyRows())}>
                  <Eraser className="h-4 w-4" />Limpar tabela
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />Limpar todas as tabelas
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar todas as tabelas?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso apaga os valores e resultados de todas as funções cadastradas, nas duas modalidades de consulta. As expressões das funções são mantidas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => setTables({})}>Limpar tudo</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </div>
      )}
    </Panel>
  );
}
