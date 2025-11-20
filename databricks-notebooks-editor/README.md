# Databricks Notebooks Editor

A VS Code extension that displays Databricks Scala source notebooks as interactive notebooks within VS Code.

## Features

- **Read Databricks Source Format**: Opens `.scala` files containing Databricks notebook source code
- **Cell Parsing**: Automatically splits notebooks by `// COMMAND ----------` separators
- **Markdown Support**: Recognizes and renders `// MAGIC` prefixed content as markdown cells
- **Bidirectional Conversion**: Edit in notebook format and save back to Databricks source format

## What's Done

✅ Notebook serializer/deserializer for Databricks source format  
✅ Parsing of cell separators (`// COMMAND ----------`)  
✅ Markdown cell detection (`// MAGIC`)  
✅ Code cell preservation (Scala)  
✅ Round-trip conversion (notebook ↔ source file)  

## Next Steps

- [ ] Add support for other Databricks languages (Python, SQL, R)
- [ ] Handle magic commands (`%md`, `%python`, `%sql`, etc.)
- [ ] Implement code execution kernel support
- [ ] Add syntax highlighting for mixed-language cells
- [ ] Support Databricks widgets and parameters
- [ ] Handle notebook metadata and configuration
- [ ] Add unit tests for parser/serializer

## Usage

1. Open any `.scala` file with Databricks source format
2. The file will automatically display as a notebook
3. Edit cells in the notebook interface
4. Save to convert back to Databricks source format

## Example

See `sample-notebook.scala` for a sample Databricks notebook.

**Enjoy!**
