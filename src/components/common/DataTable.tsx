import { ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
}: {
  columns: Column<T>[];
  data: T[];
}) {
  return (
    <div className="overflow-x-auto rounded-[26px] border border-cyan-100 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.08)] backdrop-blur-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-cyan-50/80 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="px-4 py-3 font-black">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cyan-100">
          {data.map((row, index) => (
            <tr
              key={String(row.id ?? index)}
              className="transition hover:bg-cyan-50/60"
            >
              {columns.map((column) => (
                <td
                  key={column.header}
                  className="px-4 py-3 align-top text-slate-600"
                >
                  {column.cell
                    ? column.cell(row)
                    : String(
                        column.accessor ? (row[column.accessor] ?? "—") : "—",
                      )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
