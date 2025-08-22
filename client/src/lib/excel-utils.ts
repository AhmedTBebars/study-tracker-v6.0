import * as XLSX from "xlsx";

export function exportToExcel(data: any[], filename: string = "study-tracker-export.xlsx") {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
  
  // Save the file
  XLSX.writeFile(workbook, filename);
}

export function exportMultiSheetExcel(
  data: { [sheetName: string]: any[] },
  filename: string = "study-tracker-export.xlsx"
) {
  const workbook = XLSX.utils.book_new();
  
  Object.entries(data).forEach(([sheetName, sheetData]) => {
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  XLSX.writeFile(workbook, filename);
}

export function readExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}
