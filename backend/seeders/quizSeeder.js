import { Question, Quiz } from '../models/Quiz.js';

// Data Structures Quiz Questions
const dataStructuresQuestions = [
  {
    questionText: "What is the time complexity of inserting an element at the beginning of an array?",
    options: [
      "O(1)",
      "O(n)",
      "O(log n)",
      "O(n²)"
    ],
    correctAnswer: 1,
    explanation: "Inserting at the beginning of an array requires shifting all existing elements one position to the right, which takes O(n) time.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "arrays",
    tags: ["arrays", "time complexity", "insertion"]
  },
  {
    questionText: "Which data structure follows the Last In First Out (LIFO) principle?",
    options: [
      "Queue",
      "Stack",
      "Linked List",
      "Tree"
    ],
    correctAnswer: 1,
    explanation: "A stack follows the LIFO principle where the last element added is the first one to be removed.",
    difficulty: "easy",
    category: "data structures",
    subcategory: "stack",
    tags: ["stack", "LIFO", "basic concepts"]
  },
  {
    questionText: "What is the worst-case time complexity of searching in a Binary Search Tree?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n log n)"
    ],
    correctAnswer: 2,
    explanation: "In the worst case (when the BST becomes a skewed tree), searching takes O(n) time as we might need to traverse all nodes.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "trees",
    tags: ["BST", "search", "time complexity"]
  },
  {
    questionText: "Which operation is NOT typically supported by a queue?",
    options: [
      "Enqueue",
      "Dequeue",
      "Peek/Front",
      "Random Access"
    ],
    correctAnswer: 3,
    explanation: "Queues do not support random access to elements. You can only access the front element and add elements at the rear.",
    difficulty: "easy",
    category: "data structures",
    subcategory: "queue",
    tags: ["queue", "operations", "FIFO"]
  },
  {
    questionText: "What is the space complexity of the merge sort algorithm?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n²)"
    ],
    correctAnswer: 2,
    explanation: "Merge sort requires O(n) additional space to store the temporary arrays used during the merging process.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "sorting",
    tags: ["merge sort", "space complexity", "algorithms"]
  },
  {
    questionText: "In a hash table with separate chaining, what happens when two keys hash to the same index?",
    options: [
      "The second key overwrites the first",
      "An error occurs",
      "Both keys are stored in a linked list at that index",
      "The table is resized automatically"
    ],
    correctAnswer: 2,
    explanation: "In separate chaining, collisions are handled by maintaining a linked list of all elements that hash to the same index.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "hash tables",
    tags: ["hashing", "collision resolution", "chaining"]
  },
  {
    questionText: "What is the minimum number of nodes in a complete binary tree of height h?",
    options: [
      "2^h",
      "2^h - 1",
      "2^(h-1)",
      "2^(h+1) - 1"
    ],
    correctAnswer: 0,
    explanation: "A complete binary tree of height h has minimum 2^h nodes (when only the leftmost node exists at the last level).",
    difficulty: "hard",
    category: "data structures",
    subcategory: "trees",
    tags: ["binary tree", "complete tree", "height"]
  },
  {
    questionText: "Which of the following is true about a doubly linked list compared to a singly linked list?",
    options: [
      "Uses less memory",
      "Faster insertion at the beginning",
      "Allows bidirectional traversal",
      "Has better cache performance"
    ],
    correctAnswer: 2,
    explanation: "Doubly linked lists have pointers to both next and previous nodes, allowing traversal in both directions.",
    difficulty: "easy",
    category: "data structures",
    subcategory: "linked lists",
    tags: ["linked list", "doubly linked", "traversal"]
  },
  {
    questionText: "What is the time complexity of finding the kth smallest element in a min-heap?",
    options: [
      "O(1)",
      "O(log k)",
      "O(k)",
      "O(k log k)"
    ],
    correctAnswer: 3,
    explanation: "Finding the kth smallest element in a min-heap requires extracting k elements, each taking O(log n) time, resulting in O(k log k) complexity.",
    difficulty: "hard",
    category: "data structures",
    subcategory: "heaps",
    tags: ["heap", "kth smallest", "priority queue"]
  },
  {
    questionText: "Which data structure is most suitable for implementing a breadth-first search (BFS) algorithm?",
    options: [
      "Stack",
      "Queue",
      "Priority Queue",
      "Hash Table"
    ],
    correctAnswer: 1,
    explanation: "BFS uses a queue to process nodes level by level in a First In First Out (FIFO) manner.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "graph algorithms",
    tags: ["BFS", "queue", "graph traversal"]
  },
  {
    questionText: "What is the height of an AVL tree with n nodes in the worst case?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(sqrt(n))"],
    correctAnswer: 1,
    explanation: "AVL trees are self-balancing, so the height is always O(log n) even in the worst case.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "trees",
    tags: ["AVL", "balanced trees", "height"]
  },
  {
    questionText: "Which data structure is most efficient for implementing autocomplete functionality?",
    options: ["Binary Search Tree", "Hash Table", "Trie", "Array"],
    correctAnswer: 2,
    explanation: "Trie (prefix tree) is ideal for autocomplete as it stores strings in a way that allows efficient prefix matching.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "trees",
    tags: ["trie", "autocomplete", "strings"]
  },
  {
    questionText: "What is the time complexity of Dijkstra's algorithm using a binary heap?",
    options: ["O(V + E)", "O(V log V)", "O((V + E) log V)", "O(V²)"],
    correctAnswer: 2,
    explanation: "Dijkstra's algorithm with a binary heap has time complexity O((V + E) log V) where V is vertices and E is edges.",
    difficulty: "hard",
    category: "data structures",
    subcategory: "graph algorithms",
    tags: ["Dijkstra", "shortest path", "heap"]
  },
  {
    questionText: "In a red-black tree, what is the maximum number of black nodes on any path from root to leaf if the tree has height h?",
    options: ["h", "h/2", "⌊h/2⌋ + 1", "h - 1"],
    correctAnswer: 2,
    explanation: "In a red-black tree, the number of black nodes on any path from root to leaf is at most ⌊h/2⌋ + 1.",
    difficulty: "hard",
    category: "data structures",
    subcategory: "trees",
    tags: ["red-black tree", "balanced trees", "properties"]
  },
  {
    questionText: "Which sorting algorithm has the best average-case time complexity for sorting strings?",
    options: ["Quick Sort", "Merge Sort", "Radix Sort", "Heap Sort"],
    correctAnswer: 2,
    explanation: "Radix sort can sort strings in O(d*n) time where d is the maximum string length, which is often better than comparison-based sorts.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "sorting",
    tags: ["radix sort", "strings", "sorting algorithms"]
  },
  {
    questionText: "What is the space complexity of the quick sort algorithm in the worst case?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    explanation: "In the worst case, quick sort's recursion depth can be O(n), leading to O(n) space complexity due to the call stack.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "sorting",
    tags: ["quick sort", "space complexity", "recursion"]
  },
  {
    questionText: "Which data structure allows range queries (sum/min/max) in O(log n) time?",
    options: ["Array", "Linked List", "Segment Tree", "Hash Table"],
    correctAnswer: 2,
    explanation: "Segment trees allow range queries and updates in O(log n) time, making them ideal for range-based operations.",
    difficulty: "hard",
    category: "data structures",
    subcategory: "trees",
    tags: ["segment tree", "range queries", "optimization"]
  },
  {
    questionText: "What happens when you delete a node with two children from a Binary Search Tree?",
    options: ["Replace with any leaf node", "Replace with inorder predecessor or successor", "Tree becomes invalid", "Node cannot be deleted"],
    correctAnswer: 1,
    explanation: "When deleting a node with two children, we replace it with either its inorder predecessor or successor to maintain BST property.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "trees",
    tags: ["BST", "deletion", "tree operations"]
  },
  {
    questionText: "Which graph representation is more space-efficient for sparse graphs?",
    options: ["Adjacency Matrix", "Adjacency List", "Edge List", "Incidence Matrix"],
    correctAnswer: 1,
    explanation: "Adjacency list uses O(V + E) space, which is more efficient than adjacency matrix's O(V²) for sparse graphs where E << V².",
    difficulty: "medium",
    category: "data structures",
    subcategory: "graphs",
    tags: ["graph representation", "adjacency list", "space efficiency"]
  },
  {
    questionText: "What is the minimum number of swaps needed to convert a max-heap to a min-heap?",
    options: ["0", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    explanation: "Converting a max-heap to min-heap requires rebuilding the heap structure, which takes O(n) swaps in the worst case.",
    difficulty: "hard",
    category: "data structures",
    subcategory: "heaps",
    tags: ["heap conversion", "min-heap", "max-heap"]
  },
  {
    questionText: "Which collision resolution technique in hash tables provides better cache performance?",
    options: ["Separate Chaining", "Linear Probing", "Quadratic Probing", "Double Hashing"],
    correctAnswer: 1,
    explanation: "Linear probing provides better cache performance due to better locality of reference compared to chaining or other probing methods.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "hashing",
    tags: ["hash tables", "collision resolution", "cache performance"]
  },
  {
    questionText: "What is the time complexity of finding the Lowest Common Ancestor (LCA) in a binary tree using preprocessing?",
    options: ["O(n)", "O(log n)", "O(1)", "O(sqrt(n))"],
    correctAnswer: 2,
    explanation: "With preprocessing techniques like binary lifting or sparse table, LCA queries can be answered in O(1) time.",
    difficulty: "hard",
    category: "data structures",
    subcategory: "trees",
    tags: ["LCA", "binary tree", "preprocessing"]
  },
  {
    questionText: "Which data structure is used in the implementation of Kruskal's algorithm?",
    options: ["Priority Queue", "Union-Find (Disjoint Set)", "Stack", "Binary Search Tree"],
    correctAnswer: 1,
    explanation: "Kruskal's algorithm uses Union-Find data structure to detect cycles and build the minimum spanning tree efficiently.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "graph algorithms",
    tags: ["Kruskal", "MST", "union-find"]
  },
  {
    questionText: "What is the expected time complexity of searching in a skip list?",
    options: ["O(1)", "O(log n)", "O(n)", "O(sqrt(n))"],
    correctAnswer: 1,
    explanation: "Skip list provides O(log n) expected time complexity for search, insert, and delete operations through probabilistic balancing.",
    difficulty: "hard",
    category: "data structures",
    subcategory: "advanced structures",
    tags: ["skip list", "probabilistic", "search"]
  },
  {
    questionText: "In dynamic programming with memoization, which data structure is commonly used for storage?",
    options: ["Array", "Hash Table", "Stack", "Both Array and Hash Table"],
    correctAnswer: 3,
    explanation: "Both arrays (for problems with bounded integer parameters) and hash tables (for general parameters) are used for memoization in DP.",
    difficulty: "medium",
    category: "data structures",
    subcategory: "dynamic programming",
    tags: ["memoization", "dynamic programming", "optimization"]
  }
];

// Operating Systems Questions Array
const operatingSystemsQuestions = [
  {
    questionText: "What is the primary function of an operating system?",
    options: ["Compile programs", "Manage system resources", "Create user interfaces", "Store data permanently"],
    correctAnswer: 1,
    explanation: "The primary function of an operating system is to manage system resources including CPU, memory, storage, and I/O devices.",
    difficulty: "easy",
    category: "operating systems",
    subcategory: "fundamentals",
    tags: ["OS basics", "resource management", "system software"]
  },
  {
    questionText: "Which scheduling algorithm can cause starvation?",
    options: ["Round Robin", "First Come First Serve", "Shortest Job First", "Priority Scheduling"],
    correctAnswer: 3,
    explanation: "Priority scheduling can cause starvation when high-priority processes continuously arrive, preventing low-priority processes from executing.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "process scheduling",
    tags: ["scheduling", "starvation", "priority"]
  },
  {
    questionText: "What is a deadlock in operating systems?",
    options: ["When a process runs indefinitely", "When processes wait for each other indefinitely", "When memory is full", "When CPU usage is 100%"],
    correctAnswer: 1,
    explanation: "A deadlock occurs when two or more processes are blocked forever, each waiting for the other to release resources.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "deadlocks",
    tags: ["deadlock", "synchronization", "blocking"]
  },
  {
    questionText: "Which memory management technique divides memory into fixed-size blocks?",
    options: ["Segmentation", "Paging", "Virtual Memory", "Dynamic Allocation"],
    correctAnswer: 1,
    explanation: "Paging divides both physical memory and logical memory into fixed-size blocks called pages and frames respectively.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "memory management",
    tags: ["paging", "memory", "fixed-size blocks"]
  },
  {
    questionText: "What happens during a context switch?",
    options: ["Process creates new thread", "CPU switches between processes", "Memory is deallocated", "File system is updated"],
    correctAnswer: 1,
    explanation: "A context switch occurs when the CPU switches from executing one process to another, saving and restoring process states.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "process management",
    tags: ["context switch", "CPU scheduling", "process state"]
  },
  {
    questionText: "Which condition is NOT required for deadlock to occur?",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
    correctAnswer: 2,
    explanation: "No Preemption (not Preemption) is required for deadlock. The four conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
    difficulty: "hard",
    category: "operating systems",
    subcategory: "deadlocks",
    tags: ["deadlock conditions", "Coffman conditions", "prevention"]
  },
  {
    questionText: "What is the purpose of virtual memory?",
    options: ["Increase CPU speed", "Allow programs larger than physical memory", "Improve file access", "Enhance network performance"],
    correctAnswer: 1,
    explanation: "Virtual memory allows programs to use more memory than physically available by using disk storage as an extension of RAM.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "memory management",
    tags: ["virtual memory", "paging", "memory extension"]
  },
  {
    questionText: "Which IPC mechanism is fastest for communication between processes on the same machine?",
    options: ["Pipes", "Message Queues", "Shared Memory", "Sockets"],
    correctAnswer: 2,
    explanation: "Shared memory is the fastest IPC mechanism as it allows processes to communicate by reading/writing to the same memory region without kernel intervention.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "inter-process communication",
    tags: ["IPC", "shared memory", "performance"]
  },
  {
    questionText: "What is thrashing in virtual memory systems?",
    options: ["Too many page faults", "CPU overheating", "Memory fragmentation", "Process starvation"],
    correctAnswer: 0,
    explanation: "Thrashing occurs when a system spends more time paging (swapping pages in and out) than executing processes due to insufficient physical memory.",
    difficulty: "hard",
    category: "operating systems",
    subcategory: "memory management",
    tags: ["thrashing", "page faults", "virtual memory"]
  },
  {
    questionText: "Which file system structure provides fastest access to file data?",
    options: ["Linked allocation", "Indexed allocation", "Contiguous allocation", "FAT allocation"],
    correctAnswer: 2,
    explanation: "Contiguous allocation provides fastest access as file blocks are stored consecutively, minimizing seek time and enabling efficient sequential access.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "file systems",
    tags: ["file allocation", "disk access", "performance"]
  },
  {
    questionText: "What is the main advantage of multilevel page tables?",
    options: ["Faster page access", "Reduced memory overhead", "Simplified addressing", "Better security"],
    correctAnswer: 1,
    explanation: "Multilevel page tables reduce memory overhead by only allocating page table space for used portions of the address space.",
    difficulty: "hard",
    category: "operating systems",
    subcategory: "memory management",
    tags: ["page tables", "memory overhead", "hierarchical"]
  },
  {
    questionText: "Which semaphore operation is atomic?",
    options: ["Only wait()", "Only signal()", "Both wait() and signal()", "Neither operation"],
    correctAnswer: 2,
    explanation: "Both wait() and signal() operations on semaphores are atomic, meaning they cannot be interrupted during execution.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "synchronization",
    tags: ["semaphores", "atomic operations", "synchronization"]
  },
  {
    questionText: "What is the banker's algorithm used for?",
    options: ["CPU scheduling", "Deadlock avoidance", "Memory allocation", "File management"],
    correctAnswer: 1,
    explanation: "The banker's algorithm is used for deadlock avoidance by ensuring the system never enters an unsafe state.",
    difficulty: "hard",
    category: "operating systems",
    subcategory: "deadlocks",
    tags: ["banker's algorithm", "deadlock avoidance", "safe state"]
  },
  {
    questionText: "Which replacement algorithm suffers from Belady's anomaly?",
    options: ["LRU", "LFU", "FIFO", "Optimal"],
    correctAnswer: 2,
    explanation: "FIFO (First In First Out) page replacement algorithm can suffer from Belady's anomaly where increasing the number of page frames can increase page faults.",
    difficulty: "hard",
    category: "operating systems",
    subcategory: "memory management",
    tags: ["page replacement", "Belady's anomaly", "FIFO"]
  },
  {
    questionText: "What is the difference between preemptive and non-preemptive scheduling?",
    options: ["Priority levels", "CPU can forcibly remove processes vs cannot", "Memory usage", "I/O operations"],
    correctAnswer: 1,
    explanation: "In preemptive scheduling, the CPU can forcibly remove a running process, while in non-preemptive scheduling, a process runs until completion or voluntary release.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "process scheduling",
    tags: ["preemptive", "non-preemptive", "scheduling"]
  },
  {
    questionText: "Which disk scheduling algorithm minimizes seek time but may cause starvation?",
    options: ["FCFS", "SSTF", "SCAN", "C-SCAN"],
    correctAnswer: 1,
    explanation: "SSTF (Shortest Seek Time First) minimizes seek time by selecting the closest request, but can cause starvation of requests far from current head position.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "disk scheduling",
    tags: ["disk scheduling", "SSTF", "seek time", "starvation"]
  },
  {
    questionText: "What is a race condition?",
    options: ["CPU running too fast", "Multiple processes accessing shared data concurrently", "Memory running out", "Disk failure"],
    correctAnswer: 1,
    explanation: "A race condition occurs when multiple processes access and manipulate shared data concurrently, and the outcome depends on the timing of their execution.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "synchronization",
    tags: ["race condition", "shared data", "concurrency"]
  },
  {
    questionText: "Which process state indicates a process is ready to run but waiting for CPU?",
    options: ["Running", "Blocked", "Ready", "Terminated"],
    correctAnswer: 2,
    explanation: "The Ready state indicates that a process has all required resources except CPU and is waiting to be scheduled for execution.",
    difficulty: "easy",
    category: "operating systems",
    subcategory: "process management",
    tags: ["process states", "ready queue", "scheduling"]
  },
  {
    questionText: "What is internal fragmentation?",
    options: ["Unused space within allocated blocks", "Unused space between allocated blocks", "Disk fragmentation", "Memory leaks"],
    correctAnswer: 0,
    explanation: "Internal fragmentation occurs when allocated memory blocks contain unused space, typically seen in fixed-size allocation schemes like paging.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "memory management",
    tags: ["fragmentation", "memory allocation", "wasted space"]
  },
  {
    questionText: "Which system call is used to create a new process in Unix?",
    options: ["exec()", "fork()", "wait()", "exit()"],
    correctAnswer: 1,
    explanation: "The fork() system call creates a new process by duplicating the current process, creating a parent-child relationship.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "process management",
    tags: ["system calls", "fork", "process creation", "Unix"]
  },
  {
    questionText: "What is the main purpose of spooling in operating systems?",
    options: ["Speed up CPU", "Handle slow I/O devices", "Manage memory", "Prevent deadlocks"],
    correctAnswer: 1,
    explanation: "Spooling (Simultaneous Peripheral Operations On-Line) is used to handle slow I/O devices by buffering data in high-speed storage.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "I/O management",
    tags: ["spooling", "I/O devices", "buffering"]
  },
  {
    questionText: "Which scheduling algorithm guarantees that every process will eventually execute?",
    options: ["Priority Scheduling", "Shortest Job First", "Round Robin", "LIFO"],
    correctAnswer: 2,
    explanation: "Round Robin scheduling guarantees that every process will eventually execute as it uses time slices and rotates through all processes.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "process scheduling",
    tags: ["round robin", "fairness", "time slice"]
  },
  {
    questionText: "What is the primary advantage of threads over processes?",
    options: ["Better security", "Lower resource overhead", "Faster execution", "More memory"],
    correctAnswer: 1,
    explanation: "Threads have lower resource overhead compared to processes because they share memory space and other resources within the same process.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "threads",
    tags: ["threads vs processes", "resource overhead", "lightweight"]
  },
  {
    questionText: "Which page replacement algorithm requires future knowledge?",
    options: ["LRU", "FIFO", "Optimal", "Clock"],
    correctAnswer: 2,
    explanation: "The Optimal page replacement algorithm requires knowledge of future page references to select the page that will be used farthest in the future.",
    difficulty: "hard",
    category: "operating systems",
    subcategory: "memory management",
    tags: ["page replacement", "optimal algorithm", "future knowledge"]
  },
  {
    questionText: "What happens when a process calls exit() system call?",
    options: ["Process pauses", "Process becomes zombie", "Process restarts", "Process sleeps"],
    correctAnswer: 1,
    explanation: "When a process calls exit(), it becomes a zombie process until its parent collects its exit status, then it's completely removed from the system.",
    difficulty: "medium",
    category: "operating systems",
    subcategory: "process management",
    tags: ["exit system call", "zombie process", "process termination"]
  }
];

// Computer Networks Questions Array
const computerNetworksQuestions = [
  {
    questionText: "What is the primary function of the Network Layer in the OSI model?",
    options: ["Error detection", "Routing packets", "Data compression", "User authentication"],
    correctAnswer: 1,
    explanation: "The Network Layer (Layer 3) is responsible for routing packets between different networks and logical addressing using IP addresses.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "OSI model",
    tags: ["network layer", "routing", "OSI model"]
  },
  {
    questionText: "Which protocol is used to automatically assign IP addresses to devices?",
    options: ["DNS", "DHCP", "FTP", "HTTP"],
    correctAnswer: 1,
    explanation: "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses and other network configuration to devices on a network.",
    difficulty: "easy",
    category: "computer networks",
    subcategory: "network protocols",
    tags: ["DHCP", "IP addressing", "network configuration"]
  },
  {
    questionText: "What is the maximum segment size (MSS) in TCP?",
    options: ["The maximum size of TCP header", "The maximum size of data in a TCP segment", "The maximum number of connections", "The maximum window size"],
    correctAnswer: 1,
    explanation: "MSS (Maximum Segment Size) is the maximum amount of data that TCP can send in a single segment, excluding headers.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "TCP/IP",
    tags: ["TCP", "MSS", "data transmission"]
  },
  {
    questionText: "Which routing algorithm is used by OSPF?",
    options: ["Distance Vector", "Link State", "Path Vector", "Hybrid"],
    correctAnswer: 1,
    explanation: "OSPF (Open Shortest Path First) uses the Link State routing algorithm, where each router maintains a complete topology of the network.",
    difficulty: "hard",
    category: "computer networks",
    subcategory: "routing protocols",
    tags: ["OSPF", "link state", "routing algorithms"]
  },
  {
    questionText: "What happens during a TCP three-way handshake?",
    options: ["Data encryption", "Connection establishment", "Error correction", "Bandwidth allocation"],
    correctAnswer: 1,
    explanation: "The TCP three-way handshake (SYN, SYN-ACK, ACK) is used to establish a reliable connection between client and server.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "TCP/IP",
    tags: ["TCP", "three-way handshake", "connection establishment"]
  },
  {
    questionText: "Which layer of the OSI model handles data compression and encryption?",
    options: ["Session Layer", "Presentation Layer", "Application Layer", "Transport Layer"],
    correctAnswer: 1,
    explanation: "The Presentation Layer (Layer 6) is responsible for data formatting, compression, and encryption/decryption.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "OSI model",
    tags: ["presentation layer", "encryption", "data formatting"]
  },
  {
    questionText: "What is the purpose of ARP (Address Resolution Protocol)?",
    options: ["Convert domain names to IP addresses", "Convert IP addresses to MAC addresses", "Route packets between networks", "Manage network security"],
    correctAnswer: 1,
    explanation: "ARP resolves IP addresses to MAC addresses, enabling communication at the data link layer within the same network segment.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "network protocols",
    tags: ["ARP", "MAC address", "IP address resolution"]
  },
  {
    questionText: "Which congestion control algorithm is used by TCP Reno?",
    options: ["Slow Start only", "Fast Recovery only", "Slow Start and Congestion Avoidance", "All: Slow Start, Congestion Avoidance, and Fast Recovery"],
    correctAnswer: 3,
    explanation: "TCP Reno implements all four congestion control algorithms: Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery.",
    difficulty: "hard",
    category: "computer networks",
    subcategory: "TCP/IP",
    tags: ["TCP Reno", "congestion control", "network performance"]
  },
  {
    questionText: "What is the difference between a hub and a switch?",
    options: ["No difference", "Hub operates at Physical layer, Switch at Data Link layer", "Hub is faster than Switch", "Switch only works with wireless"],
    correctAnswer: 1,
    explanation: "A hub operates at the Physical layer and creates a single collision domain, while a switch operates at the Data Link layer and creates separate collision domains for each port.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "network devices",
    tags: ["hub", "switch", "collision domain", "network layers"]
  },
  {
    questionText: "Which field in the IP header is used to prevent infinite loops?",
    options: ["Version", "TTL (Time To Live)", "Protocol", "Checksum"],
    correctAnswer: 1,
    explanation: "TTL (Time To Live) field is decremented at each router, and the packet is discarded when TTL reaches zero, preventing infinite routing loops.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "IP protocol",
    tags: ["TTL", "IP header", "routing loops"]
  },
  {
    questionText: "What is the main advantage of IPv6 over IPv4?",
    options: ["Faster transmission", "Better security", "Larger address space", "Lower cost"],
    correctAnswer: 2,
    explanation: "IPv6 provides a much larger address space (128-bit vs 32-bit addresses) to handle the growing number of internet-connected devices.",
    difficulty: "easy",
    category: "computer networks",
    subcategory: "IP protocol",
    tags: ["IPv6", "IPv4", "address space", "internet addressing"]
  },
  {
    questionText: "Which protocol is used for secure email transmission?",
    options: ["SMTP", "POP3", "IMAP", "TLS/SSL with SMTP"],
    correctAnswer: 3,
    explanation: "TLS/SSL with SMTP (often called SMTPS) provides secure email transmission with encryption, while plain SMTP transmits emails in clear text.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "application protocols",
    tags: ["email security", "TLS", "SMTP", "encryption"]
  },
  {
    questionText: "What is the purpose of VLAN (Virtual LAN)?",
    options: ["Increase bandwidth", "Segment network logically", "Reduce hardware costs", "Improve wireless range"],
    correctAnswer: 1,
    explanation: "VLANs allow logical segmentation of a physical network, improving security, reducing broadcast domains, and enabling flexible network management.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "network architecture",
    tags: ["VLAN", "network segmentation", "broadcast domain"]
  },
  {
    questionText: "Which transport protocol is connectionless and unreliable?",
    options: ["TCP", "UDP", "SCTP", "DCCP"],
    correctAnswer: 1,
    explanation: "UDP (User Datagram Protocol) is connectionless and unreliable, meaning it doesn't guarantee delivery, ordering, or error checking.",
    difficulty: "easy",
    category: "computer networks",
    subcategory: "transport protocols",
    tags: ["UDP", "connectionless", "unreliable transport"]
  },
  {
    questionText: "What is NAT (Network Address Translation) primarily used for?",
    options: ["Encrypt network traffic", "Convert private IPs to public IPs", "Route packets faster", "Compress data"],
    correctAnswer: 1,
    explanation: "NAT translates private IP addresses to public IP addresses, allowing multiple devices with private IPs to share a single public IP address.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "network protocols",
    tags: ["NAT", "IP addressing", "private networks"]
  },
  {
    questionText: "Which layer of the TCP/IP model corresponds to both Session and Presentation layers of OSI?",
    options: ["Application Layer", "Transport Layer", "Internet Layer", "Network Access Layer"],
    correctAnswer: 0,
    explanation: "The Application Layer in TCP/IP model combines the functionality of Session, Presentation, and Application layers of the OSI model.",
    difficulty: "hard",
    category: "computer networks",
    subcategory: "network models",
    tags: ["TCP/IP model", "OSI model", "layer mapping"]
  },
  {
    questionText: "What is the main purpose of DNS (Domain Name System)?",
    options: ["Secure data transmission", "Convert domain names to IP addresses", "Manage network traffic", "Compress web pages"],
    correctAnswer: 1,
    explanation: "DNS translates human-readable domain names (like google.com) into IP addresses that computers use to communicate.",
    difficulty: "easy",
    category: "computer networks",
    subcategory: "application protocols",
    tags: ["DNS", "domain names", "name resolution"]
  },
  {
    questionText: "Which algorithm does Ethernet use for collision detection?",
    options: ["TDMA", "CDMA", "CSMA/CD", "ALOHA"],
    correctAnswer: 2,
    explanation: "Ethernet uses CSMA/CD (Carrier Sense Multiple Access with Collision Detection) to detect and handle collisions in shared media.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "data link layer",
    tags: ["Ethernet", "CSMA/CD", "collision detection"]
  },
  {
    questionText: "What is the maximum data rate of a standard Ethernet cable (Cat 5e)?",
    options: ["10 Mbps", "100 Mbps", "1 Gbps", "10 Gbps"],
    correctAnswer: 2,
    explanation: "Cat 5e cable supports up to 1 Gbps (Gigabit Ethernet) data transmission rate at distances up to 100 meters.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "physical layer",
    tags: ["Ethernet", "Cat 5e", "data rate", "cable specifications"]
  },
  {
    questionText: "Which HTTP status code indicates that a resource was not found?",
    options: ["200", "301", "404", "500"],
    correctAnswer: 2,
    explanation: "HTTP status code 404 indicates 'Not Found', meaning the server cannot find the requested resource.",
    difficulty: "easy",
    category: "computer networks",
    subcategory: "application protocols",
    tags: ["HTTP", "status codes", "web protocols"]
  },
  {
    questionText: "What is the purpose of the sliding window protocol in TCP?",
    options: ["Error detection", "Flow control and reliable delivery", "Routing optimization", "Data compression"],
    correctAnswer: 1,
    explanation: "The sliding window protocol in TCP provides flow control and ensures reliable delivery by managing the amount of unacknowledged data.",
    difficulty: "hard",
    category: "computer networks",
    subcategory: "TCP/IP",
    tags: ["sliding window", "flow control", "TCP reliability"]
  },
  {
    questionText: "Which wireless security protocol is considered most secure?",
    options: ["WEP", "WPA", "WPA2", "WPA3"],
    correctAnswer: 3,
    explanation: "WPA3 is the latest and most secure wireless security protocol, offering improved encryption and protection against various attacks.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "wireless networks",
    tags: ["wireless security", "WPA3", "encryption", "network security"]
  },
  {
    questionText: "What is the function of a default gateway?",
    options: ["Assign IP addresses", "Route packets to other networks", "Provide wireless access", "Monitor network traffic"],
    correctAnswer: 1,
    explanation: "A default gateway routes packets from the local network to other networks when the destination is not in the same subnet.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "routing",
    tags: ["default gateway", "routing", "network communication"]
  },
  {
    questionText: "Which protocol is used for network time synchronization?",
    options: ["SNMP", "NTP", "DHCP", "DNS"],
    correctAnswer: 1,
    explanation: "NTP (Network Time Protocol) is used to synchronize clocks across network devices, ensuring accurate timekeeping.",
    difficulty: "medium",
    category: "computer networks",
    subcategory: "network management",
    tags: ["NTP", "time synchronization", "network protocols"]
  },
  {
    questionText: "What is the main difference between circuit switching and packet switching?",
    options: ["Speed difference", "Circuit switching reserves dedicated path, packet switching shares resources", "Cost difference", "Security difference"],
    correctAnswer: 1,
    explanation: "Circuit switching establishes a dedicated communication path for the entire session, while packet switching shares network resources among multiple communications.",
    difficulty: "hard",
    category: "computer networks",
    subcategory: "switching techniques",
    tags: ["circuit switching", "packet switching", "network architecture"]
  }
];

// Object-Oriented Programming (OOPS) Questions Array
const oopsQuestions = [
  {
    questionText: "What is encapsulation in object-oriented programming?",
    options: ["Hiding implementation details", "Creating multiple objects", "Inheriting from parent class", "Overloading methods"],
    correctAnswer: 0,
    explanation: "Encapsulation is the principle of hiding internal implementation details of a class and exposing only necessary interfaces to the outside world.",
    difficulty: "easy",
    category: "oops",
    subcategory: "fundamentals",
    tags: ["encapsulation", "data hiding", "OOP principles"]
  },
  {
    questionText: "Which OOP principle allows a child class to provide specific implementation of a method defined in parent class?",
    options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
    correctAnswer: 2,
    explanation: "Polymorphism allows objects of different classes to be treated as objects of a common base class, with each providing its own specific implementation.",
    difficulty: "medium",
    category: "oops",
    subcategory: "polymorphism",
    tags: ["polymorphism", "method overriding", "inheritance"]
  },
  {
    questionText: "What is the difference between method overloading and method overriding?",
    options: ["No difference", "Overloading is compile-time, overriding is runtime", "Overloading is runtime, overriding is compile-time", "Both are compile-time"],
    correctAnswer: 1,
    explanation: "Method overloading is resolved at compile-time (static polymorphism), while method overriding is resolved at runtime (dynamic polymorphism).",
    difficulty: "medium",
    category: "oops",
    subcategory: "polymorphism",
    tags: ["method overloading", "method overriding", "polymorphism"]
  },
  {
    questionText: "Which keyword is used to prevent inheritance in Java?",
    options: ["private", "static", "final", "abstract"],
    correctAnswer: 2,
    explanation: "The 'final' keyword when applied to a class prevents it from being inherited by other classes.",
    difficulty: "medium",
    category: "oops",
    subcategory: "inheritance",
    tags: ["final keyword", "inheritance", "Java"]
  },
  {
    questionText: "What is an abstract class?",
    options: ["A class with only static methods", "A class that cannot be instantiated", "A class with private constructors", "A class with no methods"],
    correctAnswer: 1,
    explanation: "An abstract class is a class that cannot be instantiated directly and typically contains one or more abstract methods that must be implemented by subclasses.",
    difficulty: "medium",
    category: "oops",
    subcategory: "abstraction",
    tags: ["abstract class", "abstraction", "inheritance"]
  },
  {
    questionText: "Which of the following best describes composition in OOP?",
    options: ["Is-a relationship", "Has-a relationship", "Can-do relationship", "Was-a relationship"],
    correctAnswer: 1,
    explanation: "Composition represents a 'has-a' relationship where one class contains objects of another class as part of its implementation.",
    difficulty: "medium",
    category: "oops",
    subcategory: "composition",
    tags: ["composition", "has-a relationship", "object relationships"]
  },
  {
    questionText: "What is the purpose of a constructor in OOP?",
    options: ["Destroy objects", "Initialize objects", "Copy objects", "Compare objects"],
    correctAnswer: 1,
    explanation: "A constructor is a special method that is automatically called when an object is created to initialize the object's state.",
    difficulty: "easy",
    category: "oops",
    subcategory: "constructors",
    tags: ["constructor", "object initialization", "object creation"]
  },
  {
    questionText: "Which access modifier allows access within the same package but not from outside?",
    options: ["private", "protected", "package-private (default)", "public"],
    correctAnswer: 2,
    explanation: "Package-private (default) access modifier allows access within the same package but restricts access from outside the package.",
    difficulty: "medium",
    category: "oops",
    subcategory: "access modifiers",
    tags: ["access modifiers", "package-private", "encapsulation"]
  },
  {
    questionText: "What is multiple inheritance and why is it not supported in Java?",
    options: ["Inheriting from multiple interfaces", "Inheriting from multiple classes - causes diamond problem", "Inheriting multiple methods", "Creating multiple objects"],
    correctAnswer: 1,
    explanation: "Multiple inheritance means inheriting from multiple classes, which Java doesn't support to avoid the diamond problem (ambiguity in method resolution).",
    difficulty: "hard",
    category: "oops",
    subcategory: "inheritance",
    tags: ["multiple inheritance", "diamond problem", "Java limitations"]
  },
  {
    questionText: "What is the difference between interface and abstract class?",
    options: ["No difference", "Interface has only abstract methods, abstract class can have concrete methods", "Interface is faster", "Abstract class is deprecated"],
    correctAnswer: 1,
    explanation: "Interfaces traditionally contain only abstract methods (though modern languages allow default methods), while abstract classes can have both abstract and concrete methods.",
    difficulty: "medium",
    category: "oops",
    subcategory: "abstraction",
    tags: ["interface", "abstract class", "abstraction"]
  },
  {
    questionText: "What is a virtual function?",
    options: ["A function that doesn't exist", "A function that enables runtime polymorphism", "A static function", "A private function"],
    correctAnswer: 1,
    explanation: "A virtual function enables runtime polymorphism by allowing the correct method implementation to be called based on the actual object type.",
    difficulty: "hard",
    category: "oops",
    subcategory: "polymorphism",
    tags: ["virtual functions", "runtime polymorphism", "C++"]
  },
  {
    questionText: "What is the 'this' keyword used for?",
    options: ["Reference to parent class", "Reference to current object", "Reference to static methods", "Reference to global variables"],
    correctAnswer: 1,
    explanation: "The 'this' keyword refers to the current object instance and is used to access instance variables and methods.",
    difficulty: "easy",
    category: "oops",
    subcategory: "object references",
    tags: ["this keyword", "object reference", "instance variables"]
  },
  {
    questionText: "What is method chaining?",
    options: ["Calling multiple methods sequentially", "Returning 'this' to enable fluent interface", "Inheriting methods", "Overloading methods"],
    correctAnswer: 1,
    explanation: "Method chaining is achieved by returning 'this' from methods, allowing multiple method calls to be chained together in a fluent interface pattern.",
    difficulty: "medium",
    category: "oops",
    subcategory: "design patterns",
    tags: ["method chaining", "fluent interface", "design patterns"]
  },
  {
    questionText: "What is the Liskov Substitution Principle?",
    options: ["Objects should be replaceable with instances of their subtypes", "All methods should be public", "Classes should be final", "Interfaces should be small"],
    correctAnswer: 0,
    explanation: "The Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of a subclass without altering program correctness.",
    difficulty: "hard",
    category: "oops",
    subcategory: "SOLID principles",
    tags: ["Liskov substitution", "SOLID principles", "inheritance"]
  },
  {
    questionText: "What is the difference between aggregation and composition?",
    options: ["No difference", "Aggregation is weak association, composition is strong association", "Aggregation is inheritance, composition is interface", "Aggregation is public, composition is private"],
    correctAnswer: 1,
    explanation: "Aggregation is a weak 'has-a' relationship where parts can exist independently, while composition is a strong relationship where parts cannot exist without the whole.",
    difficulty: "hard",
    category: "oops",
    subcategory: "object relationships",
    tags: ["aggregation", "composition", "object relationships"]
  },
  {
    questionText: "What is a singleton pattern?",
    options: ["A class with only one method", "A class that can have only one instance", "A class with static methods only", "A class that inherits from one parent"],
    correctAnswer: 1,
    explanation: "Singleton pattern ensures that a class has only one instance throughout the application lifetime and provides global access to that instance.",
    difficulty: "medium",
    category: "oops",
    subcategory: "design patterns",
    tags: ["singleton pattern", "design patterns", "instance control"]
  },
  {
    questionText: "What is late binding (dynamic binding)?",
    options: ["Binding methods at compile time", "Binding methods at runtime", "Binding variables", "Binding interfaces"],
    correctAnswer: 1,
    explanation: "Late binding (dynamic binding) means that the method to be called is determined at runtime based on the actual object type, enabling polymorphism.",
    difficulty: "hard",
    category: "oops",
    subcategory: "polymorphism",
    tags: ["late binding", "dynamic binding", "runtime polymorphism"]
  },
  {
    questionText: "What is the Open/Closed Principle?",
    options: ["Classes should be open for extension, closed for modification", "All methods should be public", "Classes should have public constructors", "Interfaces should be implemented"],
    correctAnswer: 0,
    explanation: "The Open/Closed Principle states that software entities should be open for extension but closed for modification, promoting extensibility without changing existing code.",
    difficulty: "hard",
    category: "oops",
    subcategory: "SOLID principles",
    tags: ["open/closed principle", "SOLID principles", "software design"]
  },
  {
    questionText: "What is operator overloading?",
    options: ["Using multiple operators", "Giving additional meanings to operators for user-defined types", "Overriding operators", "Creating new operators"],
    correctAnswer: 1,
    explanation: "Operator overloading allows developers to define custom behavior for operators when used with user-defined types or classes.",
    difficulty: "medium",
    category: "oops",
    subcategory: "polymorphism",
    tags: ["operator overloading", "polymorphism", "custom operators"]
  },
  {
    questionText: "What is a copy constructor?",
    options: ["A constructor that copies methods", "A constructor that creates a new object as a copy of existing object", "A constructor that copies classes", "A static constructor"],
    correctAnswer: 1,
    explanation: "A copy constructor creates a new object as a copy of an existing object, initializing the new object with the same values as the original.",
    difficulty: "medium",
    category: "oops",
    subcategory: "constructors",
    tags: ["copy constructor", "object copying", "constructors"]
  },
  {
    questionText: "What is the difference between static and instance methods?",
    options: ["No difference", "Static methods belong to class, instance methods belong to objects", "Static methods are faster", "Instance methods are private"],
    correctAnswer: 1,
    explanation: "Static methods belong to the class and can be called without creating an object, while instance methods belong to specific object instances.",
    difficulty: "easy",
    category: "oops",
    subcategory: "methods",
    tags: ["static methods", "instance methods", "class vs object"]
  },
  {
    questionText: "What is the factory method pattern?",
    options: ["A method that creates objects", "A method in a factory class", "A design pattern for creating objects without specifying exact classes", "A method that destroys objects"],
    correctAnswer: 2,
    explanation: "Factory method pattern is a creational design pattern that provides an interface for creating objects without specifying their exact classes.",
    difficulty: "hard",
    category: "oops",
    subcategory: "design patterns",
    tags: ["factory method", "design patterns", "object creation"]
  },
  {
    questionText: "What is dependency injection?",
    options: ["Injecting bugs into code", "A technique where dependencies are provided from external sources", "Creating dependent classes", "Inheriting dependencies"],
    correctAnswer: 1,
    explanation: "Dependency injection is a technique where an object's dependencies are provided by external sources rather than the object creating them itself.",
    difficulty: "hard",
    category: "oops",
    subcategory: "design patterns",
    tags: ["dependency injection", "inversion of control", "design patterns"]
  },
  {
    questionText: "What is the purpose of a destructor?",
    options: ["Create objects", "Initialize objects", "Clean up resources when object is destroyed", "Copy objects"],
    correctAnswer: 2,
    explanation: "A destructor is automatically called when an object is destroyed to clean up resources like memory, file handles, or network connections.",
    difficulty: "medium",
    category: "oops",
    subcategory: "memory management",
    tags: ["destructor", "resource cleanup", "object lifecycle"]
  },
  {
    questionText: "What is the difference between shallow copy and deep copy?",
    options: ["No difference", "Shallow copy copies references, deep copy copies actual objects", "Shallow copy is faster", "Deep copy uses less memory"],
    correctAnswer: 1,
    explanation: "Shallow copy creates a new object but copies references to nested objects, while deep copy creates completely independent copies of all nested objects.",
    difficulty: "hard",
    category: "oops",
    subcategory: "object copying",
    tags: ["shallow copy", "deep copy", "object cloning"]
  }
];

// Database Management Systems (DBMS) Questions Array
const dbmsQuestions = [
  {
    questionText: "What does ACID stand for in database transactions?",
    options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integration, Design", "Automatic, Consistent, Independent, Distributed", "Authentication, Compliance, Integrity, Documentation"],
    correctAnswer: 0,
    explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability - the four key properties that guarantee reliable database transactions.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "transactions",
    tags: ["ACID", "transactions", "database properties"]
  },
  {
    questionText: "What is the primary key in a relational database?",
    options: ["A key that can have duplicate values", "A unique identifier for each row in a table", "A foreign key reference", "An index for faster searching"],
    correctAnswer: 1,
    explanation: "A primary key is a unique identifier for each row in a table, ensuring no duplicate values and providing a way to uniquely reference each record.",
    difficulty: "easy",
    category: "dbms",
    subcategory: "relational model",
    tags: ["primary key", "relational database", "unique identifier"]
  },
  {
    questionText: "Which normal form eliminates partial dependencies?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctAnswer: 1,
    explanation: "Second Normal Form (2NF) eliminates partial dependencies by ensuring that all non-key attributes are fully functionally dependent on the primary key.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "normalization",
    tags: ["2NF", "normalization", "partial dependencies"]
  },
  {
    questionText: "What is a deadlock in database systems?",
    options: ["When a transaction takes too long", "When two transactions wait for each other indefinitely", "When a database crashes", "When queries run slowly"],
    correctAnswer: 1,
    explanation: "A deadlock occurs when two or more transactions are waiting for each other to release locks, creating a circular wait condition that prevents any transaction from proceeding.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "concurrency control",
    tags: ["deadlock", "transactions", "locking"]
  },
  {
    questionText: "Which SQL command is used to remove duplicates from query results?",
    options: ["UNIQUE", "DISTINCT", "REMOVE", "FILTER"],
    correctAnswer: 1,
    explanation: "The DISTINCT keyword is used in SQL SELECT statements to eliminate duplicate rows from the result set.",
    difficulty: "easy",
    category: "dbms",
    subcategory: "SQL",
    tags: ["SQL", "DISTINCT", "duplicates"]
  },
  {
    questionText: "What is the difference between DELETE and TRUNCATE in SQL?",
    options: ["No difference", "DELETE can use WHERE clause, TRUNCATE removes all rows", "TRUNCATE is slower than DELETE", "DELETE is DDL, TRUNCATE is DML"],
    correctAnswer: 1,
    explanation: "DELETE can selectively remove rows using WHERE clause and can be rolled back, while TRUNCATE removes all rows quickly and cannot be rolled back in most databases.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "SQL",
    tags: ["DELETE", "TRUNCATE", "SQL commands"]
  },
  {
    questionText: "Which isolation level allows dirty reads?",
    options: ["READ COMMITTED", "READ UNCOMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
    correctAnswer: 1,
    explanation: "READ UNCOMMITTED is the lowest isolation level that allows dirty reads, where a transaction can read uncommitted changes from other transactions.",
    difficulty: "hard",
    category: "dbms",
    subcategory: "transactions",
    tags: ["isolation levels", "dirty reads", "READ UNCOMMITTED"]
  },
  {
    questionText: "What is denormalization in database design?",
    options: ["The process of normalizing data", "Intentionally introducing redundancy for performance", "Removing all relationships", "Creating more tables"],
    correctAnswer: 1,
    explanation: "Denormalization is the process of intentionally introducing redundancy into a normalized database to improve read performance at the cost of storage space and update complexity.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "database design",
    tags: ["denormalization", "performance", "redundancy"]
  },
  {
    questionText: "Which join returns all rows from both tables, matching where possible?",
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
    correctAnswer: 3,
    explanation: "FULL OUTER JOIN returns all rows from both tables, showing NULL values where there's no match between the tables.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "SQL joins",
    tags: ["FULL OUTER JOIN", "SQL joins", "relationships"]
  },
  {
    questionText: "What is a clustered index?",
    options: ["An index stored separately from data", "An index that determines physical storage order", "A group of multiple indexes", "An index on multiple columns"],
    correctAnswer: 1,
    explanation: "A clustered index determines the physical storage order of data in a table. A table can have only one clustered index because data can be physically ordered in only one way.",
    difficulty: "hard",
    category: "dbms",
    subcategory: "indexing",
    tags: ["clustered index", "physical storage", "indexing"]
  },
  {
    questionText: "What is the CAP theorem in distributed databases?",
    options: ["Consistency, Availability, Partition tolerance", "Concurrency, Atomicity, Persistence", "Create, Alter, Process", "Cache, Access, Performance"],
    correctAnswer: 0,
    explanation: "CAP theorem states that a distributed database system can only guarantee two out of three properties: Consistency, Availability, and Partition tolerance.",
    difficulty: "hard",
    category: "dbms",
    subcategory: "distributed systems",
    tags: ["CAP theorem", "distributed databases", "consistency"]
  },
  {
    questionText: "Which SQL aggregate function returns the number of rows?",
    options: ["SUM()", "AVG()", "COUNT()", "MAX()"],
    correctAnswer: 2,
    explanation: "COUNT() is an aggregate function that returns the number of rows in a result set or the number of non-NULL values in a specific column.",
    difficulty: "easy",
    category: "dbms",
    subcategory: "SQL",
    tags: ["COUNT", "aggregate functions", "SQL"]
  },
  {
    questionText: "What is a foreign key constraint?",
    options: ["A key from another database", "A reference to primary key in another table", "An encrypted key", "A backup key"],
    correctAnswer: 1,
    explanation: "A foreign key constraint ensures referential integrity by requiring that values in one table must match values of a primary key in another table.",
    difficulty: "easy",
    category: "dbms",
    subcategory: "relational model",
    tags: ["foreign key", "referential integrity", "constraints"]
  },
  {
    questionText: "Which storage engine in MySQL supports transactions?",
    options: ["MyISAM", "InnoDB", "Memory", "Archive"],
    correctAnswer: 1,
    explanation: "InnoDB is MySQL's default storage engine that supports ACID transactions, foreign keys, and row-level locking.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "storage engines",
    tags: ["InnoDB", "MySQL", "transactions"]
  },
  {
    questionText: "What is the purpose of database indexing?",
    options: ["To compress data", "To speed up query performance", "To backup data", "To encrypt data"],
    correctAnswer: 1,
    explanation: "Database indexing creates data structures that improve the speed of data retrieval operations by providing fast access paths to table data.",
    difficulty: "easy",
    category: "dbms",
    subcategory: "indexing",
    tags: ["indexing", "performance", "query optimization"]
  },
  {
    questionText: "What is a view in SQL?",
    options: ["A physical table", "A virtual table based on query results", "A backup of data", "A user interface"],
    correctAnswer: 1,
    explanation: "A view is a virtual table that presents data from one or more tables in a specific way, defined by a SQL query but not physically stored.",
    difficulty: "easy",
    category: "dbms",
    subcategory: "SQL",
    tags: ["views", "virtual table", "SQL"]
  },
  {
    questionText: "Which SQL command is used to modify existing data in a table?",
    options: ["INSERT", "UPDATE", "ALTER", "MODIFY"],
    correctAnswer: 1,
    explanation: "UPDATE command is used to modify existing records in a table, typically used with WHERE clause to specify which rows to update.",
    difficulty: "easy",
    category: "dbms",
    subcategory: "SQL",
    tags: ["UPDATE", "SQL commands", "data modification"]
  },
  {
    questionText: "What is database sharding?",
    options: ["Backing up data", "Horizontally partitioning data across multiple databases", "Encrypting data", "Compressing data"],
    correctAnswer: 1,
    explanation: "Sharding is a database scaling technique that horizontally partitions data across multiple database instances, distributing the load.",
    difficulty: "hard",
    category: "dbms",
    subcategory: "scaling",
    tags: ["sharding", "horizontal partitioning", "scaling"]
  },
  {
    questionText: "Which normal form ensures that there are no transitive dependencies?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctAnswer: 2,
    explanation: "Third Normal Form (3NF) eliminates transitive dependencies by ensuring that non-key attributes are not dependent on other non-key attributes.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "normalization",
    tags: ["3NF", "transitive dependencies", "normalization"]
  },
  {
    questionText: "What is OLTP vs OLAP?",
    options: ["Online Transaction Processing vs Online Analytical Processing", "Object Linking vs Object Analysis", "Operational Logic vs Analytical Procedures", "Optimized Learning vs Advanced Processing"],
    correctAnswer: 0,
    explanation: "OLTP focuses on fast transaction processing for day-to-day operations, while OLAP is designed for complex analytical queries on large datasets.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "database types",
    tags: ["OLTP", "OLAP", "transaction processing"]
  },
  {
    questionText: "What is a stored procedure?",
    options: ["A backup procedure", "Precompiled SQL code stored in database", "A data storage method", "An indexing technique"],
    correctAnswer: 1,
    explanation: "A stored procedure is precompiled SQL code that is stored in the database and can be executed repeatedly, improving performance and security.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "database programming",
    tags: ["stored procedures", "SQL", "database programming"]
  },
  {
    questionText: "Which SQL command creates a new table?",
    options: ["MAKE TABLE", "CREATE TABLE", "NEW TABLE", "BUILD TABLE"],
    correctAnswer: 1,
    explanation: "CREATE TABLE is the SQL DDL command used to create a new table with specified columns, data types, and constraints.",
    difficulty: "easy",
    category: "dbms",
    subcategory: "DDL",
    tags: ["CREATE TABLE", "DDL", "table creation"]
  },
  {
    questionText: "What is database replication?",
    options: ["Creating backups", "Copying data across multiple database instances", "Removing duplicates", "Compressing data"],
    correctAnswer: 1,
    explanation: "Database replication is the process of copying data from one database to another to ensure data availability, fault tolerance, and load distribution.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "database administration",
    tags: ["replication", "data copying", "high availability"]
  },
  {
    questionText: "Which lock granularity provides the highest concurrency?",
    options: ["Database level", "Table level", "Page level", "Row level"],
    correctAnswer: 3,
    explanation: "Row-level locking provides the highest concurrency as it locks only the specific rows being accessed, allowing multiple transactions to work on different rows simultaneously.",
    difficulty: "hard",
    category: "dbms",
    subcategory: "concurrency control",
    tags: ["row-level locking", "concurrency", "lock granularity"]
  },
  {
    questionText: "What is a trigger in database systems?",
    options: ["A performance optimization tool", "Special stored procedure that runs automatically on events", "A backup mechanism", "An indexing method"],
    correctAnswer: 1,
    explanation: "A trigger is a special type of stored procedure that automatically executes (fires) in response to specific database events like INSERT, UPDATE, or DELETE operations.",
    difficulty: "medium",
    category: "dbms",
    subcategory: "database programming",
    tags: ["triggers", "stored procedures", "database events"]
  }
];

export const seedDataStructuresQuiz = async () => {
  try {
    console.log('🌱 Seeding Data Structures quiz...');

    // Check if questions already exist
    const existingQuestions = await Question.find({ 
      category: 'data structures' 
    }).countDocuments();

    const totalExpectedQuestions = dataStructuresQuestions.length;
    console.log(`📊 Found ${existingQuestions} existing questions, expecting ${totalExpectedQuestions} total`);

    if (existingQuestions >= totalExpectedQuestions) {
      console.log(`✅ Data Structures questions are up to date (${existingQuestions} found)`);
      return;
    }

    // If we have fewer questions than expected, add all questions
    // (using insertMany with ordered:false to skip duplicates)
    try {
      const insertedQuestions = await Question.insertMany(dataStructuresQuestions, { ordered: false });
      console.log(`✅ Inserted ${insertedQuestions.length} new Data Structures questions`);
    } catch (error) {
      // Handle duplicate key errors (questions that already exist)
      if (error.code === 11000) {
        console.log(`✅ Some questions already existed, added new ones successfully`);
      } else {
        throw error;
      }
    }

    // Check current question count after insertion
    const currentQuestions = await Question.find({ category: 'data structures' });
    console.log(`📊 Total Data Structures questions after seeding: ${currentQuestions.length}`);

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ 
      category: 'data structures',
      title: 'Data Structures Quiz'
    });

    if (existingQuiz) {
      // Update existing quiz with all current questions
      existingQuiz.questions = currentQuestions.map(q => q._id);
      await existingQuiz.save();
      console.log('✅ Updated existing Data Structures quiz with new questions');
      return;
    }

    // Create new quiz
    const quiz = new Quiz({
      title: 'Data Structures Quiz',
      description: 'Test your knowledge of fundamental data structures including arrays, stacks, queues, trees, and graphs.',
      category: 'data structures',
      subcategory: 'fundamentals',
      difficulty: 'medium',
      questions: currentQuestions.map(q => q._id),
      timeLimit: null, // No time limit
      passingScore: 60,
      maxAttempts: null, // Unlimited attempts
      isActive: true,
      createdBy: 'system'
    });

    const savedQuiz = await quiz.save();
    console.log(`✅ Created Data Structures quiz with ID: ${savedQuiz._id}`);

    return {
      quiz: savedQuiz,
      questions: currentQuestions
    };

  } catch (error) {
    console.error('❌ Error seeding Data Structures quiz:', error);
    throw error;
  }
};

export const seedOperatingSystemsQuiz = async () => {
  try {
    console.log('🌱 Seeding Operating Systems quiz...');

    // Check if questions already exist
    const existingQuestions = await Question.find({ 
      category: 'operating systems' 
    }).countDocuments();

    const totalExpectedQuestions = operatingSystemsQuestions.length;
    console.log(`📊 Found ${existingQuestions} existing questions, expecting ${totalExpectedQuestions} total`);

    if (existingQuestions >= totalExpectedQuestions) {
      console.log(`✅ Operating Systems questions are up to date (${existingQuestions} found)`);
      return;
    }

    // If we have fewer questions than expected, add all questions
    // (using insertMany with ordered:false to skip duplicates)
    try {
      const insertedQuestions = await Question.insertMany(operatingSystemsQuestions, { ordered: false });
      console.log(`✅ Inserted ${insertedQuestions.length} new Operating Systems questions`);
    } catch (error) {
      // Handle duplicate key errors (questions that already exist)
      if (error.code === 11000) {
        console.log(`✅ Some questions already existed, added new ones successfully`);
      } else {
        throw error;
      }
    }

    // Check current question count after insertion
    const currentQuestions = await Question.find({ category: 'operating systems' });
    console.log(`📊 Total Operating Systems questions after seeding: ${currentQuestions.length}`);

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ 
      category: 'operating systems',
      title: 'Operating Systems Quiz'
    });

    if (existingQuiz) {
      // Update existing quiz with all current questions
      existingQuiz.questions = currentQuestions.map(q => q._id);
      await existingQuiz.save();
      console.log('✅ Updated existing Operating Systems quiz with new questions');
      return;
    }

    // Create new quiz
    const quiz = new Quiz({
      title: 'Operating Systems Quiz',
      description: 'Test your knowledge of operating system concepts including process management, memory management, file systems, and synchronization.',
      category: 'operating systems',
      subcategory: 'fundamentals',
      difficulty: 'medium',
      questions: currentQuestions.map(q => q._id),
      timeLimit: null, // No time limit
      passingScore: 60,
      maxAttempts: null, // Unlimited attempts
      isActive: true,
      createdBy: 'system'
    });

    const savedQuiz = await quiz.save();
    console.log(`✅ Created Operating Systems quiz with ID: ${savedQuiz._id}`);

    return {
      quiz: savedQuiz,
      questions: currentQuestions
    };

  } catch (error) {
    console.error('❌ Error seeding Operating Systems quiz:', error);
    throw error;
  }
};

export const seedComputerNetworksQuiz = async () => {
  try {
    console.log('🌱 Seeding Computer Networks quiz...');

    // Check if questions already exist
    const existingQuestions = await Question.find({ 
      category: 'computer networks' 
    }).countDocuments();

    const totalExpectedQuestions = computerNetworksQuestions.length;
    console.log(`📊 Found ${existingQuestions} existing questions, expecting ${totalExpectedQuestions} total`);

    if (existingQuestions >= totalExpectedQuestions) {
      console.log(`✅ Computer Networks questions are up to date (${existingQuestions} found)`);
      return;
    }

    // If we have fewer questions than expected, add all questions
    // (using insertMany with ordered:false to skip duplicates)
    try {
      const insertedQuestions = await Question.insertMany(computerNetworksQuestions, { ordered: false });
      console.log(`✅ Inserted ${insertedQuestions.length} new Computer Networks questions`);
    } catch (error) {
      // Handle duplicate key errors (questions that already exist)
      if (error.code === 11000) {
        console.log(`✅ Some questions already existed, added new ones successfully`);
      } else {
        throw error;
      }
    }

    // Check current question count after insertion
    const currentQuestions = await Question.find({ category: 'computer networks' });
    console.log(`📊 Total Computer Networks questions after seeding: ${currentQuestions.length}`);

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ 
      category: 'computer networks',
      title: 'Computer Networks Quiz'
    });

    if (existingQuiz) {
      // Update existing quiz with all current questions
      existingQuiz.questions = currentQuestions.map(q => q._id);
      await existingQuiz.save();
      console.log('✅ Updated existing Computer Networks quiz with new questions');
      return;
    }

    // Create new quiz
    const quiz = new Quiz({
      title: 'Computer Networks Quiz',
      description: 'Test your knowledge of computer networking concepts including OSI model, TCP/IP, routing protocols, and network security.',
      category: 'computer networks',
      subcategory: 'fundamentals',
      difficulty: 'medium',
      questions: currentQuestions.map(q => q._id),
      timeLimit: null, // No time limit
      passingScore: 60,
      maxAttempts: null, // Unlimited attempts
      isActive: true,
      createdBy: 'system'
    });

    const savedQuiz = await quiz.save();
    console.log(`✅ Created Computer Networks quiz with ID: ${savedQuiz._id}`);

    return {
      quiz: savedQuiz,
      questions: currentQuestions
    };

  } catch (error) {
    console.error('❌ Error seeding Computer Networks quiz:', error);
    throw error;
  }
};

export const seedOOPSQuiz = async () => {
  try {
    console.log('🌱 Seeding Object-Oriented Programming quiz...');

    // Check if questions already exist
    const existingQuestions = await Question.find({ 
      category: 'oops' 
    }).countDocuments();

    const totalExpectedQuestions = oopsQuestions.length;
    console.log(`📊 Found ${existingQuestions} existing questions, expecting ${totalExpectedQuestions} total`);

    if (existingQuestions >= totalExpectedQuestions) {
      console.log(`✅ Object-Oriented Programming questions are up to date (${existingQuestions} found)`);
      return;
    }

    // If we have fewer questions than expected, add all questions
    // (using insertMany with ordered:false to skip duplicates)
    try {
      const insertedQuestions = await Question.insertMany(oopsQuestions, { ordered: false });
      console.log(`✅ Inserted ${insertedQuestions.length} new Object-Oriented Programming questions`);
    } catch (error) {
      // Handle duplicate key errors (questions that already exist)
      if (error.code === 11000) {
        console.log(`✅ Some questions already existed, added new ones successfully`);
      } else {
        throw error;
      }
    }

    // Check current question count after insertion
    const currentQuestions = await Question.find({ category: 'oops' });
    console.log(`📊 Total Object-Oriented Programming questions after seeding: ${currentQuestions.length}`);

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ 
      category: 'oops',
      title: 'Object-Oriented Programming Quiz'
    });

    if (existingQuiz) {
      // Update existing quiz with all current questions
      existingQuiz.questions = currentQuestions.map(q => q._id);
      await existingQuiz.save();
      console.log('✅ Updated existing Object-Oriented Programming quiz with new questions');
      return;
    }

    // Create new quiz
    const quiz = new Quiz({
      title: 'Object-Oriented Programming Quiz',
      description: 'Test your knowledge of OOP concepts including encapsulation, inheritance, polymorphism, abstraction, and design patterns.',
      category: 'oops',
      subcategory: 'fundamentals',
      difficulty: 'medium',
      questions: currentQuestions.map(q => q._id),
      timeLimit: null, // No time limit
      passingScore: 60,
      maxAttempts: null, // Unlimited attempts
      isActive: true,
      createdBy: 'system'
    });

    const savedQuiz = await quiz.save();
    console.log(`✅ Created Object-Oriented Programming quiz with ID: ${savedQuiz._id}`);

    return {
      quiz: savedQuiz,
      questions: currentQuestions
    };

  } catch (error) {
    console.error('❌ Error seeding Object-Oriented Programming quiz:', error);
    throw error;
  }
};

export const seedDBMSQuiz = async () => {
  try {
    console.log('🌱 Seeding Database Management Systems quiz...');

    // Check if questions already exist
    const existingQuestions = await Question.find({ 
      category: 'dbms' 
    }).countDocuments();

    const totalExpectedQuestions = dbmsQuestions.length;
    console.log(`📊 Found ${existingQuestions} existing questions, expecting ${totalExpectedQuestions} total`);

    if (existingQuestions >= totalExpectedQuestions) {
      console.log(`✅ Database Management Systems questions are up to date (${existingQuestions} found)`);
      return;
    }

    // If we have fewer questions than expected, add all questions
    // (using insertMany with ordered:false to skip duplicates)
    try {
      const insertedQuestions = await Question.insertMany(dbmsQuestions, { ordered: false });
      console.log(`✅ Inserted ${insertedQuestions.length} new Database Management Systems questions`);
    } catch (error) {
      // Handle duplicate key errors (questions that already exist)
      if (error.code === 11000) {
        console.log(`✅ Some questions already existed, added new ones successfully`);
      } else {
        throw error;
      }
    }

    // Check current question count after insertion
    const currentQuestions = await Question.find({ category: 'dbms' });
    console.log(`📊 Total Database Management Systems questions after seeding: ${currentQuestions.length}`);

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ 
      category: 'dbms',
      title: 'Database Management Systems Quiz'
    });

    if (existingQuiz) {
      // Update existing quiz with all current questions
      existingQuiz.questions = currentQuestions.map(q => q._id);
      await existingQuiz.save();
      console.log('✅ Updated existing Database Management Systems quiz with new questions');
      return;
    }

    // Create new quiz
    const quiz = new Quiz({
      title: 'Database Management Systems Quiz',
      description: 'Test your knowledge of DBMS concepts including SQL, normalization, transactions, indexing, and database design.',
      category: 'dbms',
      subcategory: 'fundamentals',
      difficulty: 'medium',
      questions: currentQuestions.map(q => q._id),
      timeLimit: null, // No time limit
      passingScore: 60,
      maxAttempts: null, // Unlimited attempts
      isActive: true,
      createdBy: 'system'
    });

    const savedQuiz = await quiz.save();
    console.log(`✅ Created Database Management Systems quiz with ID: ${savedQuiz._id}`);

    return {
      quiz: savedQuiz,
      questions: currentQuestions
    };

  } catch (error) {
    console.error('❌ Error seeding Database Management Systems quiz:', error);
    throw error;
  }
};

// Function to seed all quiz data
export const seedQuizData = async () => {
  try {
    console.log('🚀 Starting quiz data seeding...');
    
    await seedDataStructuresQuiz();
    await seedOperatingSystemsQuiz();
    await seedComputerNetworksQuiz();
    await seedOOPSQuiz();
    await seedDBMSQuiz();
    
    console.log('🎉 Quiz data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Quiz data seeding failed:', error);
    throw error;
  }
};
