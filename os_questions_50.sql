-- ============================================
-- OPERATING SYSTEMS - 50 MCQ QUESTIONS
-- ============================================
-- Run this after practice_questions_schema.sql

-- Get the topic_id for Operating Systems
DO $$
DECLARE
    os_topic_id UUID;
BEGIN
    SELECT id INTO os_topic_id FROM practice_topics WHERE title = 'Operating Systems';
    
    -- Question 1
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is not a function of an operating system?', 'Memory management', 'File management', 'Virus protection', 'Process management', 'C');
    
    -- Question 2
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'The main purpose of an operating system is to:', 'Provide entertainment', 'Control system resources', 'Perform compilation', 'Manage database', 'B');
    
    -- Question 3
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is a type of system software?', 'Compiler', 'Operating System', 'Text Editor', 'Word Processor', 'B');
    
    -- Question 4
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of these is not a valid example of an OS?', 'Linux', 'Windows', 'Oracle', 'macOS', 'C');
    
    -- Question 5
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'An OS acts as an interface between:', 'User and hardware', 'User and application', 'Application and database', 'Compiler and user', 'A');
    
    -- Question 6
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'What is a process?', 'A program in secondary storage', 'A program in execution', 'A program in main memory', 'An instruction in CPU', 'B');
    
    -- Question 7
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is not a process state?', 'Running', 'Waiting', 'Ready', 'Completed', 'D');
    
    -- Question 8
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'The Process Control Block (PCB) does not contain:', 'Process ID', 'Program counter', 'Stack pointer', 'Linked list', 'D');
    
    -- Question 9
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Context switching means:', 'Stopping a process permanently', 'Saving and restoring process state', 'Starting a new process', 'Changing process priority', 'B');
    
    -- Question 10
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is used for interprocess communication?', 'Pipes', 'Signals', 'Shared memory', 'All of these', 'D');
    
    -- Question 11
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is non-preemptive scheduling?', 'FCFS', 'Round Robin', 'SJF (preemptive)', 'Priority (preemptive)', 'A');
    
    -- Question 12
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'In Round Robin scheduling, time quantum means:', 'CPU burst time', 'Time allotted per process', 'Average waiting time', 'Priority value', 'B');
    
    -- Question 13
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which algorithm can lead to starvation?', 'FCFS', 'SJF', 'Round Robin', 'None', 'B');
    
    -- Question 14
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which scheduling algorithm gives minimum average waiting time?', 'FCFS', 'SJF', 'Round Robin', 'Priority', 'B');
    
    -- Question 15
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Priority scheduling can suffer from:', 'Starvation', 'Deadlock', 'Thrashing', 'Fragmentation', 'A');
    
    -- Question 16
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is a synchronization tool?', 'Thread', 'Semaphore', 'Process ID', 'Stack', 'B');
    
    -- Question 17
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Busy waiting occurs in:', 'Semaphore', 'Spinlock', 'Mutex', 'Monitor', 'B');
    
    -- Question 18
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following solves critical section problems?', 'Dekker''s algorithm', 'Peterson''s algorithm', 'Bakery algorithm', 'All of these', 'D');
    
    -- Question 19
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'The bounded buffer problem is an example of:', 'Synchronization problem', 'Deadlock', 'Fragmentation', 'Paging', 'A');
    
    -- Question 20
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following ensures mutual exclusion?', 'Monitor', 'Semaphore', 'Mutex', 'All of these', 'D');
    
    -- Question 21
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'What is a deadlock?', 'Infinite loop', 'Processes waiting indefinitely for resources', 'CPU halted', 'Memory overflow', 'B');
    
    -- Question 22
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Deadlock can occur when:', 'Mutual exclusion holds', 'Hold and wait holds', 'Circular wait holds', 'All of these', 'D');
    
    -- Question 23
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is a deadlock prevention technique?', 'Resource ordering', 'Process suspension', 'Paging', 'Swapping', 'A');
    
    -- Question 24
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Deadlock detection uses:', 'Resource allocation graph', 'CPU scheduling', 'Paging table', 'Mutex lock', 'A');
    
    -- Question 25
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Banker''s algorithm is used for:', 'Deadlock avoidance', 'Deadlock detection', 'Process synchronization', 'Memory allocation', 'A');
    
    -- Question 26
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Paging is used for:', 'Virtual memory management', 'CPU scheduling', 'File management', 'I/O management', 'A');
    
    -- Question 27
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'In paging, the address generated by CPU is called:', 'Physical address', 'Logical address', 'Virtual address', 'Both B and C', 'D');
    
    -- Question 28
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Page fault occurs when:', 'Page is not in main memory', 'Page is in cache', 'Page is in TLB', 'Page is swapped out', 'A');
    
    -- Question 29
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Thrashing occurs when:', 'Too many pages are in memory', 'Processes spend more time paging than executing', 'CPU is idle', 'Disk is full', 'B');
    
    -- Question 30
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Demand paging uses:', 'Swapping entire process', 'Loading pages as needed', 'Preloading all pages', 'None', 'B');
    
    -- Question 31
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'A page replacement algorithm replaces:', 'Unused page', 'Least recently used page', 'Any random page', 'The oldest page', 'B');
    
    -- Question 32
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Optimal page replacement is:', 'Practical', 'Theoretical', 'Random', 'FIFO-based', 'B');
    
    -- Question 33
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'In segmentation, each segment has:', 'Fixed size', 'Variable size', 'Same base', 'Same limit', 'B');
    
    -- Question 34
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Fragmentation in memory occurs due to:', 'Dynamic allocation', 'Fixed partitions', 'Variable partitions', 'Both B and C', 'D');
    
    -- Question 35
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Internal fragmentation occurs in:', 'Paging', 'Segmentation', 'Variable partitions', 'Linked allocation', 'A');
    
    -- Question 36
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'External fragmentation occurs in:', 'Paging', 'Segmentation', 'Contiguous allocation', 'Both B and C', 'C');
    
    -- Question 37
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'The main function of file system is to:', 'Allocate CPU', 'Manage data storage', 'Manage devices', 'Perform scheduling', 'B');
    
    -- Question 38
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'FAT stands for:', 'File Allocation Table', 'File Access Type', 'File Address Table', 'File Allocation Tree', 'A');
    
    -- Question 39
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is not a file access method?', 'Sequential', 'Direct', 'Random', 'Indexed-sequential', 'C');
    
    -- Question 40
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'The root directory of Windows is represented by:', '/', 'C:\', 'Root:/', 'D:/', 'B');
    
    -- Question 41
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Disk scheduling algorithm that gives minimum average seek time:', 'FCFS', 'SSTF', 'SCAN', 'LOOK', 'B');
    
    -- Question 42
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'In SCAN scheduling, the disk arm:', 'Moves in one direction only', 'Moves back and forth', 'Stays at center', 'Randomly seeks', 'B');
    
    -- Question 43
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'The OS module that manages input/output devices is:', 'Device Manager', 'File Manager', 'Memory Manager', 'Process Manager', 'A');
    
    -- Question 44
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Spooling stands for:', 'Simultaneous Peripheral Operations On-Line', 'Simple Program Operation Layer', 'Sequential Peripheral Operation', 'Simple Peripheral Operation Loop', 'A');
    
    -- Question 45
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which device is used for virtual memory?', 'Hard disk', 'RAM', 'Cache', 'ROM', 'A');
    
    -- Question 46
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'A system call is used to:', 'Request service from OS', 'Perform computation', 'Execute a process', 'Compile a program', 'A');
    
    -- Question 47
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'The kernel is:', 'Part of hardware', 'Core part of OS', 'Compiler', 'Utility software', 'B');
    
    -- Question 48
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'A shell is:', 'Command interpreter', 'Kernel module', 'GUI system', 'Compiler', 'A');
    
    -- Question 49
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'UNIX is a:', 'Time-sharing OS', 'Real-time OS', 'Batch OS', 'Multiprocessing OS', 'A');
    
    -- Question 50
    INSERT INTO practice_questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (os_topic_id, 'Which of the following is not a type of OS?', 'Batch', 'Network', 'Real-time', 'Compiler', 'D');
    
END $$;

-- Verify
SELECT COUNT(*) as total_os_questions FROM practice_questions 
WHERE topic_id = (SELECT id FROM practice_topics WHERE title = 'Operating Systems');
