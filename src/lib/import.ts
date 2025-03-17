import { type Task } from "@/db/schema";
import { toast } from "sonner";

interface ImportResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

const parseCSV = (csvText: string): string[][] => {
  const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== '');
  return rows.map(row => {
    // Handle quoted values with commas inside them
    const pattern = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    return row.split(pattern).map(value => value.replace(/^"|"$/g, '').trim());
  });
};

const validateTaskData = (data: any): boolean => {
  // Basic validation - you can expand this based on your requirements
  return (
    typeof data.title === "string" && 
    data.title.trim() !== "" &&
    typeof data.code === "string" &&
    data.code.trim() !== ""
  );
};

export const importFromCSV = async <T extends Task>(
  file: File,
  onSuccess?: (data: T[]) => void
): Promise<ImportResult<T>> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedRows = parseCSV(csvText);
        
        if (parsedRows.length < 2) {
          resolve({ 
            success: false, 
            error: "CSV file must contain a header row and at least one data row" 
          });
          return;
        }
        
        const headers = parsedRows[0];
        const dataRows = parsedRows.slice(1);
        
        // Create objects from rows
        const importedData: T[] = dataRows.map((row) => {
          const obj: Record<string, any> = {};
          
          headers?.forEach((header, index) => {
            // Handle different field types
            const value = row[index]!;
            const headerKey = header.toLowerCase().replace(/\s+/g, '_');
            
            if (headerKey === 'createdat' || headerKey === 'created_at') {
              try {
                obj['createdAt'] = new Date(value);
              } catch {
                obj['createdAt'] = new Date();
              }
            } else if (headerKey === 'updatedat' || headerKey === 'updated_at') {
              try {
                obj['updatedAt'] = new Date(value);
              } catch {
                obj['updatedAt'] = null;
              }
            } else if (headerKey === 'archived') {
              obj['archived'] = value.toLowerCase() === 'true' || value === '1';
            } else {
              obj[headerKey] = value;
            }
          });
          
          // Normalize property names to match task schema
          // Map CSV headers to Task properties
          const normalizedObj: Record<string, any> = {
            id: obj.id || crypto.randomUUID(),
            code: obj.code || `TASK-${Math.floor(Math.random() * 10000)}`,
            title: obj.title,
            status: obj.status || 'todo',
            priority: obj.priority || 'medium',
            archived: obj.archived || false,
            label: obj.label || null,
            createdAt: obj.createdAt || new Date(),
            updatedAt: obj.updatedAt || null,
          };
          
          return normalizedObj as unknown as T;
        });
        
        // Validate imported data
        const validData = importedData.filter(validateTaskData);
        const invalidCount = importedData.length - validData.length;
        
        if (invalidCount > 0) {
          toast.warning(`${invalidCount} records skipped due to validation errors`);
        }
        
        if (validData.length === 0) {
          resolve({ 
            success: false, 
            error: "No valid records found in the CSV file" 
          });
          return;
        }
        
        if (onSuccess) {
          onSuccess(validData);
        }
        
        resolve({ 
          success: true, 
          data: validData 
        });
      } catch (error) {
        console.error("Error parsing CSV:", error);
        resolve({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to parse CSV file" 
        });
      }
    };
    
    reader.onerror = () => {
      resolve({ 
        success: false, 
        error: "Failed to read the file" 
      });
    };
    
    reader.readAsText(file);
  });
};