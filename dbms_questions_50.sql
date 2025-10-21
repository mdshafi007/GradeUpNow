-- Insert 50 Database Management questions organized topic-wise into practice_questions table

-- Get the Database Management topic_id
DO $$
DECLARE
  dbms_topic_id uuid;
BEGIN
  -- Get the topic_id for Database Management (DBMS) by title
  SELECT id INTO dbms_topic_id FROM practice_topics WHERE title = 'Database Management' LIMIT 1;

  -- Insert questions with question_number for ordering
  INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, question_number) VALUES
  
  -- DBMS Basics (Q1-5)
  (dbms_topic_id, 'Which of the following is not a type of database model?', 'Hierarchical', 'Network', 'Relational', 'Procedural', 'D', 'Procedural is a programming paradigm, not a database model.', 1),
  (dbms_topic_id, 'The DBMS acts as an interface between:', 'Data and user', 'Database and application programs', 'Database and data dictionary', 'User and compiler', 'B', 'DBMS provides interface between database and application programs.', 2),
  (dbms_topic_id, 'Which of the following is a DBMS software?', 'MySQL', 'C++', 'Python', 'HTML', 'A', 'MySQL is a popular DBMS software.', 3),
  (dbms_topic_id, 'Which of the following manages data storage, retrieval, and update?', 'Compiler', 'DBMS', 'Operating System', 'Data dictionary', 'B', 'DBMS manages all database operations including storage, retrieval, and updates.', 4),
  (dbms_topic_id, 'The property that ensures data accuracy and consistency is:', 'Atomicity', 'Consistency', 'Isolation', 'Durability', 'B', 'Consistency ensures data accuracy and maintains database rules.', 5),
  
  -- Database Architecture & Schema (Q6-10)
  (dbms_topic_id, 'Which of the following is true about data independence?', 'Changes in data affect programs', 'Programs are dependent on physical data', 'Changes in storage structure do not affect application programs', 'Data and programs are tightly coupled', 'C', 'Data independence means changes in storage do not affect applications.', 6),
  (dbms_topic_id, 'In the three-level architecture, which level describes how data is actually stored?', 'External', 'Conceptual', 'Internal', 'Physical', 'C', 'Internal level describes physical data storage.', 7),
  (dbms_topic_id, 'The term "schema" refers to:', 'Data values', 'Structure of the database', 'Relationships among data', 'Database queries', 'B', 'Schema defines the structure and organization of the database.', 8),
  
  -- Keys (Q9-12)
  (dbms_topic_id, 'Which key uniquely identifies a record in a table?', 'Foreign key', 'Primary key', 'Candidate key', 'Super key', 'B', 'Primary key uniquely identifies each record in a table.', 9),
  (dbms_topic_id, 'A table can have:', 'Only one primary key', 'Multiple primary keys', 'No keys', 'Two primary keys', 'A', 'A table can have only one primary key.', 10),
  (dbms_topic_id, 'A foreign key is:', 'A primary key in another table', 'A duplicate key', 'A composite key', 'An alternate key', 'A', 'Foreign key references primary key of another table.', 11),
  (dbms_topic_id, 'Which of the following is not a type of relationship in DBMS?', 'One-to-one', 'One-to-many', 'Many-to-one', 'One-to-zero', 'D', 'One-to-zero is not a valid relationship type.', 12),
  
  -- SQL Commands (Q13-20)
  (dbms_topic_id, 'The command to remove all records from a table but keep its structure is:', 'DROP', 'DELETE', 'TRUNCATE', 'REMOVE', 'C', 'TRUNCATE removes all records but preserves table structure.', 13),
  (dbms_topic_id, 'Which SQL command is used to retrieve data from a database?', 'GET', 'SELECT', 'RETRIEVE', 'CHOOSE', 'B', 'SELECT statement is used to retrieve data from database.', 14),
  (dbms_topic_id, 'To eliminate duplicate rows in SQL, we use:', 'UNIQUE', 'DISTINCT', 'PRIMARY', 'FILTER', 'B', 'DISTINCT keyword eliminates duplicate rows from result.', 15),
  (dbms_topic_id, 'The WHERE clause is used to:', 'Sort data', 'Filter records', 'Group data', 'Join tables', 'B', 'WHERE clause filters records based on conditions.', 16),
  (dbms_topic_id, 'Which SQL statement is used to combine rows from two or more tables?', 'MERGE', 'UNION', 'JOIN', 'COMBINE', 'C', 'JOIN combines rows from multiple tables based on conditions.', 17),
  (dbms_topic_id, 'The default sorting order of ORDER BY is:', 'Descending', 'Ascending', 'Random', 'None', 'B', 'ORDER BY sorts in ascending order by default.', 18),
  (dbms_topic_id, 'Which command is used to remove a table completely from the database?', 'DROP TABLE', 'DELETE TABLE', 'REMOVE TABLE', 'CLEAR TABLE', 'A', 'DROP TABLE removes table and its structure completely.', 19),
  (dbms_topic_id, 'A view in SQL is:', 'A physical table', 'A virtual table', 'A temporary database', 'A backup', 'B', 'View is a virtual table based on query results.', 20),
  
  -- Normalization (Q21-25)
  (dbms_topic_id, 'Which normal form removes partial dependency?', '1NF', '2NF', '3NF', 'BCNF', 'B', '2NF removes partial dependencies on primary key.', 21),
  (dbms_topic_id, 'Which normal form removes transitive dependency?', '1NF', '2NF', '3NF', '4NF', 'C', '3NF removes transitive dependencies.', 22),
  (dbms_topic_id, 'Functional dependency is represented as:', 'A → B', 'A = B', 'A ↔ B', 'A <-> B', 'A', 'A → B means A functionally determines B.', 23),
  (dbms_topic_id, 'A relation is in BCNF if:', 'It is in 1NF', 'Every determinant is a candidate key', 'It has no multi-valued dependency', 'All non-prime attributes depend on primary key', 'B', 'BCNF requires every determinant to be a candidate key.', 24),
  (dbms_topic_id, 'Denormalization is:', 'Splitting tables', 'Combining tables for performance', 'Removing redundancy', 'Creating dependencies', 'B', 'Denormalization combines tables to improve query performance.', 25),
  
  -- SQL Operations & Aggregate Functions (Q26-30)
  (dbms_topic_id, 'The Cartesian product in SQL is obtained using:', 'UNION', 'CROSS JOIN', 'INNER JOIN', 'INTERSECT', 'B', 'CROSS JOIN produces Cartesian product of two tables.', 26),
  (dbms_topic_id, 'What does the HAVING clause do?', 'Filters rows before grouping', 'Filters groups after grouping', 'Sorts data', 'Joins tables', 'B', 'HAVING filters groups created by GROUP BY.', 27),
  (dbms_topic_id, 'In SQL, COUNT(*) returns:', 'Total columns', 'Total rows', 'Total distinct values', 'Total null values', 'B', 'COUNT(*) returns total number of rows.', 28),
  (dbms_topic_id, 'Aggregate functions in SQL include:', 'SUM', 'AVG', 'MAX', 'All of these', 'D', 'SUM, AVG, MAX, MIN, COUNT are all aggregate functions.', 29),
  
  -- Indexing (Q30-31)
  (dbms_topic_id, 'The purpose of indexing is to:', 'Increase search speed', 'Increase storage', 'Reduce redundancy', 'Create foreign keys', 'A', 'Indexing improves search and retrieval speed.', 30),
  (dbms_topic_id, 'A clustered index:', 'Changes data order', 'Does not change data order', 'Is same as a non-clustered index', 'Is a foreign key', 'A', 'Clustered index physically reorders data storage.', 31),
  
  -- ER Model (Q32-35)
  (dbms_topic_id, 'In ER diagrams, rectangles represent:', 'Entities', 'Attributes', 'Relationships', 'Keys', 'A', 'Rectangles represent entities in ER diagrams.', 32),
  (dbms_topic_id, 'In ER diagrams, ovals represent:', 'Entities', 'Attributes', 'Relationships', 'Keys', 'B', 'Ovals represent attributes in ER diagrams.', 33),
  (dbms_topic_id, 'Which of the following is a weak entity?', 'One with no key', 'One that depends on another entity', 'One with multiple keys', 'One with a composite key', 'B', 'Weak entity depends on strong entity for identification.', 34),
  (dbms_topic_id, 'Cardinality defines:', 'The number of attributes in a relation', 'The number of tuples', 'The number of entities involved in a relationship', 'The size of data', 'C', 'Cardinality specifies number of entities in a relationship.', 35),
  
  -- Transactions & ACID (Q36-40)
  (dbms_topic_id, 'Transaction is defined as:', 'Single SQL command', 'Group of operations forming one logical unit', 'Backup process', 'Data update', 'B', 'Transaction is a logical unit of database operations.', 36),
  (dbms_topic_id, 'Which of the following is not an ACID property?', 'Atomicity', 'Consistency', 'Isolation', 'Dependency', 'D', 'ACID properties are Atomicity, Consistency, Isolation, and Durability.', 37),
  (dbms_topic_id, 'Dirty read occurs when:', 'A transaction reads uncommitted data', 'A transaction reads committed data', 'A transaction writes to disk', 'Two transactions read same record', 'A', 'Dirty read happens when uncommitted data is read.', 38),
  (dbms_topic_id, 'Serializability ensures:', 'Transactions execute sequentially', 'Concurrent transactions produce consistent results', 'Transactions execute in parallel', 'Transactions are aborted', 'B', 'Serializability ensures concurrent execution produces correct results.', 39),
  (dbms_topic_id, 'Concurrency control is handled using:', 'Locks', 'Keys', 'Triggers', 'Views', 'A', 'Locks are used for concurrency control in databases.', 40),
  (dbms_topic_id, 'Deadlock in DBMS occurs when:', 'Two transactions wait for each other', 'Transaction aborts', 'Commit fails', 'Read and write conflict', 'A', 'Deadlock occurs when transactions wait indefinitely for each other.', 41),
  
  -- Procedures & Functions (Q42-44)
  (dbms_topic_id, 'A trigger is:', 'Procedure activated by event', 'Index', 'Constraint', 'Key', 'A', 'Trigger is automatically executed on database events.', 42),
  (dbms_topic_id, 'A stored procedure is:', 'A precompiled SQL block', 'A runtime query', 'A temporary table', 'A constraint', 'A', 'Stored procedure is precompiled SQL code stored in database.', 43),
  (dbms_topic_id, 'A cursor is used for:', 'Row-by-row processing of results', 'Batch execution', 'Transaction management', 'Indexing', 'A', 'Cursor processes query results row by row.', 44),
  
  -- SQL Languages & Constraints (Q45-50)
  (dbms_topic_id, 'The command to give access privileges is:', 'REVOKE', 'GRANT', 'ALLOW', 'PERMIT', 'B', 'GRANT command gives access privileges to users.', 45),
  (dbms_topic_id, 'DCL stands for:', 'Data Control Language', 'Data Command Language', 'Data Communication Language', 'Database Control Logic', 'A', 'DCL is Data Control Language (GRANT, REVOKE).', 46),
  (dbms_topic_id, 'The language used to define the database schema is:', 'DML', 'DDL', 'DCL', 'TCL', 'B', 'DDL (Data Definition Language) defines database schema.', 47),
  (dbms_topic_id, 'COMMIT and ROLLBACK belong to:', 'DML', 'DDL', 'DCL', 'TCL', 'D', 'TCL (Transaction Control Language) includes COMMIT and ROLLBACK.', 48),
  (dbms_topic_id, 'A constraint that ensures no two rows have the same value in a column is:', 'UNIQUE', 'CHECK', 'NOT NULL', 'DEFAULT', 'A', 'UNIQUE constraint prevents duplicate values in column.', 49),
  (dbms_topic_id, 'The NOT NULL constraint ensures:', 'Value must be unique', 'Value cannot be left blank', 'Value must be positive', 'Value must be foreign key', 'B', 'NOT NULL ensures column cannot have null values.', 50);
  
END $$;
