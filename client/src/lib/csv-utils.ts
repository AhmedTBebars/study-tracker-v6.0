import Papa from "papaparse";

export interface CSVTaskData {
  Date: string;
  Title: string;
  Topic: string;
  Is_Done: string | number;
  Time?: string;
  Progress?: string | number;
  Difficulty?: string;
  Focus_Sessions?: string | number;
  Order_Index?: string | number;
}

export function parseCSV(file: File): Promise<{
  data: CSVTaskData[];
  errors: string[];
}> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const errors: string[] = [];
        const validData: CSVTaskData[] = [];

        result.data.forEach((row: any, index: number) => {
          if (!row.Date || !row.Title || !row.Topic) {
            errors.push(
              `Row ${index + 1}: Missing required fields (Date, Title, Topic)`
            );
            return;
          }

          // Validate date format
          if (!isValidDate(row.Date)) {
            errors.push(
              `Row ${index + 1}: Invalid date format. Expected YYYY-MM-DD`
            );
            return;
          }

          validData.push(row as CSVTaskData);
        });

        if (result.errors.length > 0) {
          result.errors.forEach((error) => {
            errors.push(`Parse error: ${error.message}`);
          });
        }

        resolve({ data: validData, errors });
      },
    });
  });
}

export function exportToCSV(
  data: any[],
  filename: string = "study-tracker-export.csv"
) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateCSVStructure(headers: string[]): string[] {
  const required = ["Date", "Title", "Topic"];
  const missing = required.filter((field) => !headers.includes(field));

  if (missing.length > 0) {
    return [`Missing required columns: ${missing.join(", ")}`];
  }

  return [];
}
