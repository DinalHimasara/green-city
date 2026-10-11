import { toast } from "sonner";

export const reportService = {
  exportToCSV: (headers: string[], rows: string[][], filename: string): void => {
    try {
      const csvRows = [headers.join(",")];
      rows.forEach((row) => {
        const escapedRow = row.map((val) => {
          const stringVal = String(val ?? "");
          return `"${stringVal.replace(/"/g, '""')}"`;
        });
        csvRows.push(escapedRow.join(","));
      });
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvRows.join("\n"));
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename} exported to Excel/CSV!`);
    } catch {
      toast.error("Failed to export CSV report.");
    }
  },

  exportToPDF: (title: string): void => {
    try {
      toast.info(`Preparing printable document for: ${title}`);
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }, 500);
    } catch {
      toast.error("Failed to trigger printer layout.");
    }
  }
};
