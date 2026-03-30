import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({ providedIn: 'root' })
export class ExportExcelService {
  /** Exporta um array de objetos para Excel */
  exportJson<T extends object>(
    data: T[],
    fileName = 'export',
    sheetName = 'Dados'
  ): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: EXCEL_TYPE });
    FileSaver.saveAs(blob, `${fileName}${EXCEL_EXTENSION}`);
  }

  /** Exporta diretamente uma <table> do DOM */
  exportTable(
    table: HTMLTableElement,
    fileName = 'tabela',
    sheetName = 'Tabela'
  ): void {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: EXCEL_TYPE });
    FileSaver.saveAs(blob, `${fileName}${EXCEL_EXTENSION}`);
  }
}
