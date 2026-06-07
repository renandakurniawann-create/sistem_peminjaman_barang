import clsx from "clsx";
import {
  BORROWING_STATUS_META,
  ITEM_STATUS_META,
} from "../utils/constants.js";

export default function StatusBadge({ status, type = "item" }) {
  const meta =
    type === "borrowing"
      ? BORROWING_STATUS_META[status]
      : ITEM_STATUS_META[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        meta?.className || "bg-slate-50 text-slate-700 ring-slate-200"
      )}
    >
      {meta?.label || status || "-"}
    </span>
  );
}
