// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const DATABRICKS_NOTEBOOK_HEADER = '// Databricks notebook source';
const MARKDOWN_PREFIX = '// MAGIC';
const MARKDOWN_CELL_HEADER = `${MARKDOWN_PREFIX} %md`;
const CELL_SEPARATOR = '// COMMAND ----------';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "databricks-notebooks-editor" is now active!');
	context.subscriptions.push(vscode.workspace.registerNotebookSerializer('my-notebook', new SampleSerializer()));
}

interface DatabricksCell {
	content: string;
	cellType: 'code' | 'markdown';
	language: string;
}

class SampleSerializer implements vscode.NotebookSerializer {
	async deserializeNotebook(
    content: Uint8Array,
    _token: vscode.CancellationToken
  ): Promise<vscode.NotebookData> {
    const contents = new TextDecoder().decode(content);
    
    // Parse Databricks source format
    const databricksCells: DatabricksCell[] = this.parseDatabricksSource(contents);
    
    const cells = databricksCells.map(
      item =>
        new vscode.NotebookCellData(
          item.cellType === 'code'
            ? vscode.NotebookCellKind.Code
            : vscode.NotebookCellKind.Markup,
          item.content,
          item.cellType === 'code' ? item.language : 'markdown'
        )
    );

    return new vscode.NotebookData(cells);
  }

  private parseDatabricksSource(content: string): DatabricksCell[] {
    // ignore the first line as it is always going to be `// Databricks notebook source`
    const lines = content.split('\n');
    // Remove the first line (Databricks notebook source)
    const contentWithoutHeader = lines.slice(1).join('\n');
    const cells: DatabricksCell[] = [];
    
    // Split by cell separator
    const rawCells = contentWithoutHeader.split(CELL_SEPARATOR);

    for (const rawCell of rawCells) {
      const trimmedCell = rawCell.trim();
      if (!trimmedCell) {
        continue;
      }

      let isMarkdown = trimmedCell.startsWith(MARKDOWN_CELL_HEADER);
      
      const lines = trimmedCell.split('\n');
      if(isMarkdown){
        // Remove the first line which contains the %md magic
        lines.shift();
      }
      let cellContent: string[] = [];
      
      // Check if this is a markdown cell (starts with // MAGIC)
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (isMarkdown){
            cellContent.push(this.removeMagicPrefix(trimmedLine, MARKDOWN_PREFIX));
        }
        else{
            cellContent.push(trimmedLine);
        }
      }
      if (cellContent.length > 0) {
        cells.push({
          content: cellContent.join('\n').trim(),
          cellType: isMarkdown ? 'markdown' : 'code',
          language: 'scala'
        });
      }
  }
    
    return cells;
  }

  private removeMagicPrefix(line: string, magicPrefix: string): string {
    if (line.trim().startsWith(magicPrefix)) {
      const contentAfterMagic = line.substring(line.indexOf(magicPrefix) + magicPrefix.length);
      return contentAfterMagic.startsWith(' ') ? contentAfterMagic.substring(1) : contentAfterMagic;
    }
    return line;
  }

  async serializeNotebook(
    data: vscode.NotebookData,
    _token: vscode.CancellationToken
  ): Promise<Uint8Array> {
    const databricksFormat = this.serializeToDatabricksFormat(data);
    return new TextEncoder().encode(databricksFormat);
  }

  private serializeToDatabricksFormat(data: vscode.NotebookData): string {
    const output: string[] = [];
    // Add header
    output.push(DATABRICKS_NOTEBOOK_HEADER);
    output.push('');

    for (let i = 0; i < data.cells.length; i++) {
      const cell = data.cells[i];
      
      // Add cell separator (except before the first cell)
      if (i > 0 || output.length > 0) {
        output.push(CELL_SEPARATOR);
        output.push('');
      }
      
      if (cell.kind === vscode.NotebookCellKind.Markup) {
        // Markdown cell - prefix each line with // MAGIC
        output.push(MARKDOWN_CELL_HEADER)
        const lines = cell.value.split(/\r?\n/);
        for (const line of lines) {
          output.push(`${MARKDOWN_PREFIX} ${line}`);
        }
      } else {
        // Code cell - output as-is
        output.push(cell.value);
      }
      
      output.push('');
    }

    return output.join('\n');
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
