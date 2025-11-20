// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "databricks-notebooks-editor" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('databricks-notebooks-editor.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Databricks Notebooks Editor!');
	});

	const notebookSerializer = vscode.workspace.registerNotebookSerializer('my-notebook', new SampleSerializer());

	context.subscriptions.push(disposable);
	context.subscriptions.push(notebookSerializer);
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
    const databricksCells = this.parseDatabricksSource(contents);
    
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
    const cells: DatabricksCell[] = [];
    const cellSeparator = '// COMMAND ----------';
    const magicPrefix = '// MAGIC';
    
    // Split by cell separator
    const rawCells = content.split(cellSeparator);
    
    for (const rawCell of rawCells) {
      const trimmedCell = rawCell.trim();
      if (!trimmedCell) {
        continue;
      }
      
      const lines = trimmedCell.split('\n');
      let cellContent: string[] = [];
      let isMarkdown = false;
      
      // Check if this is a markdown cell (starts with // MAGIC)
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith(magicPrefix)) {
          isMarkdown = true;
          // Remove the // MAGIC prefix and keep the rest
          const contentAfterMagic = line.substring(line.indexOf(magicPrefix) + magicPrefix.length);
          // Remove leading space if present
          cellContent.push(contentAfterMagic.startsWith(' ') ? contentAfterMagic.substring(1) : contentAfterMagic);
        } else if (trimmedLine.length > 0) {
          // Regular code line
          cellContent.push(line);
        } else if (cellContent.length > 0) {
          // Preserve empty lines within content
          cellContent.push(line);
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

  async serializeNotebook(
    data: vscode.NotebookData,
    _token: vscode.CancellationToken
  ): Promise<Uint8Array> {
    const databricksFormat = this.serializeToDatabricksFormat(data);
    return new TextEncoder().encode(databricksFormat);
  }

  private serializeToDatabricksFormat(data: vscode.NotebookData): string {
    const cellSeparator = '// COMMAND ----------';
    const magicPrefix = '// MAGIC';
    const output: string[] = [];

    for (let i = 0; i < data.cells.length; i++) {
      const cell = data.cells[i];
      
      // Add cell separator (except before the first cell)
      if (i > 0 || output.length > 0) {
        output.push(cellSeparator);
        output.push('');
      }
      
      if (cell.kind === vscode.NotebookCellKind.Markup) {
        // Markdown cell - prefix each line with // MAGIC
        const lines = cell.value.split(/\r?\n/);
        for (const line of lines) {
          output.push(`${magicPrefix} ${line}`);
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
