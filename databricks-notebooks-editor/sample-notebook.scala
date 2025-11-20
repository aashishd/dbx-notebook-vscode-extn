// Databricks notebook source
// MAGIC %md
// MAGIC # Sample Databricks Notebook
// MAGIC 
// MAGIC This is a sample notebook to test the VS Code extension.

// COMMAND ----------

// MAGIC %md
// MAGIC ## Introduction
// MAGIC 
// MAGIC This cell contains markdown content with **bold** and *italic* text.

// COMMAND ----------

// Define a case class
case class Person(name: String, age: Int)

// Create some sample data
val people = Seq(
  Person("Alice", 25),
  Person("Bob", 30),
  Person("Charlie", 35)
)

println("Sample people:")
people.foreach(println)

// COMMAND ----------

// MAGIC %md
// MAGIC ## Data Processing
// MAGIC 
// MAGIC Let's do some data processing with Spark.

// COMMAND ----------

// Filter and transform the data
val adults = people.filter(_.age >= 30)
val names = adults.map(_.name)

println("Adults (age >= 30):")
names.foreach(println)

// COMMAND ----------

// MAGIC %md
// MAGIC ## Summary
// MAGIC 
// MAGIC This notebook demonstrated:
// MAGIC - Markdown cells with formatting
// MAGIC - Scala code cells
// MAGIC - Data processing examples
