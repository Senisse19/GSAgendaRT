import Papa from 'papaparse';
import { DashboardData } from '../types';

const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXOGs8wFakDRmzl-EnhwzikT5pTj0mnGCCqMg55yDVKN44fbLF8tKsKECVKM-NffuddJhKXSoFcK-o/pub?gid=1531635550&single=true&output=tsv';

const parseCurrency = (value: any): number => {
  if (value === null || value === undefined) return 0;
  let strValue = String(value).trim();
  if (strValue === '') return 0;

  const isNegative = strValue.includes('(') && strValue.includes(')');
  
  // Remove currency symbols, thousands separators (dots), and parentheses
  strValue = strValue.replace(/R\$\s?|\(|\)/g, '').replace(/\./g, '');

  // Replace decimal comma with a dot
  strValue = strValue.replace(',', '.');
  
  // Parse the number
  let num = parseFloat(strValue);

  // Apply negative sign if it was in parentheses format
  if (isNegative) {
    num = -Math.abs(num);
  }

  // If parsing fails, return 0
  return isNaN(num) ? 0 : num;
};

const parseDate = (value: string): Date | null => {
    if (!value || typeof value !== 'string' || !value.includes('/')) {
        return null;
    }
    const parts = value.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts.map(p => parseInt(p, 10));

    if (isNaN(day) || isNaN(month) || isNaN(year) || year < 2000 || month < 1 || month > 12) {
        return null;
    }

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }
    return date;
};


export const fetchData = async (): Promise<DashboardData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(SPREADSHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      beforeFirstChunk: (chunk) => {
        const rows = chunk.split(/\r\n|\n|\r/);
        rows.splice(0, 1);
        return rows.join('\n');
      },
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            console.error('Erros de parsing:', results.errors);
          }
          
          const mappedData = (results.data as any[]).map((row, index) => {
            const parsedDate = parseDate(row.DATA);
            // A única condição para descartar uma linha é a data ser inválida.
            if (!parsedDate) {
              return null;
            }

            return {
              data: parsedDate,
              empresa: row.EMPRESA || '',
              gestaoDeProjetos: row['Gestão de Projetos'] || '',
              job: row.JOB || '',
              totalDeCreditos: parseCurrency(row['TOTAL DE CRÉDITOS']),
              totalDeHonorarios: parseCurrency(row['TOTAL DE HONORÁRIOS']),
              statusRT: row['STATUS RT'] || '',
              aprovadoEmRT: row['APROVADO EM RT'] || '',
              restituicao: parseCurrency(row['RESTITUIÇÃO']),
              compensacao: parseCurrency(row['COMPENSAÇÃO']),
            };
          });

          const validData = mappedData.filter((item): item is DashboardData => item !== null);
          resolve(validData);
        } catch (e) {
          console.error("Erro ao processar os dados:", e);
          reject(e);
        }
      },
      error: (error: Error) => {
        console.error("Erro ao buscar ou parsear a planilha:", error);
        reject(error);
      },
    });
  });
};