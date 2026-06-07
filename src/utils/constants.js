export const ITEM_STATUS_OPTIONS = [
  { value: "tersedia", label: "Tersedia" },
  { value: "dipinjam", label: "Dipinjam" },
  { value: "rusak", label: "Rusak" },
  { value: "maintenance", label: "Maintenance" },
];

export const BORROWING_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "borrowed", label: "Borrowed" },
  { value: "returned", label: "Returned" },
  { value: "overdue", label: "Overdue" },
];

export const CONDITION_OPTIONS = [
  "Baik",
  "Cukup baik",
  "Perlu pengecekan",
  "Rusak ringan",
  "Rusak berat",
];

export const ITEM_STATUS_META = {
  tersedia: {
    label: "Tersedia",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  dipinjam: {
    label: "Dipinjam",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  rusak: {
    label: "Rusak",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
};

export const BORROWING_STATUS_META = {
  pending: {
    label: "Menunggu",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  approved: {
    label: "Disetujui",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
  borrowed: {
    label: "Dipinjam",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  returned: {
    label: "Dikembalikan",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  overdue: {
    label: "Terlambat",
    className: "bg-orange-50 text-orange-800 ring-orange-200",
  },
};

export const ACTIVE_BORROWING_STATUSES = ["approved", "borrowed", "overdue"];
