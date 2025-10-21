/**
 * Create Industry-Standard Coding Test
 * Follows LeetCode/HackerRank/CodeChef best practices
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import CodingTest from './models/CodingTest_lms.js';

dotenv.config();

async function createIndustryStandardTest() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🚀 Creating industry-standard coding test...');

    const industryTest = new CodingTest({
      title: 'Data Structures & Algorithms Test',
      instructions: `
Welcome to the Data Structures & Algorithms coding test!

📋 Instructions:
• Read each problem statement carefully
• Implement efficient solutions following the input/output format
• You can test your code against sample test cases before submitting
• Your solution will be evaluated against both visible and hidden test cases
• Pay attention to time and space complexity constraints

⏱️ Time Management:
• You have access to this test during the specified time window
• Each problem has individual time and memory limits
• Submit your solutions before the test ends

🔧 Available Languages:
• JavaScript (Node.js)
• Python 3
• Java
• C++
• C

Good luck! 🚀
      `.trim(),
      startTime: new Date(Date.now() + 5 * 60 * 1000), // Start in 5 minutes
      endTime: new Date(Date.now() + 125 * 60 * 1000), // End in 2 hours 5 minutes
      durationType: 'window',
      totalQuestions: 3,
      
      questions: [
        {
          questionName: 'Two Sum',
          problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]`,
          
          inputFormat: `First line: integer n (size of array)
Second line: n space-separated integers (array elements)
Third line: integer target`,
          
          outputFormat: `Two space-separated integers (indices of the two numbers)`,
          
          constraints: `2 ≤ n ≤ 10^4
-10^9 ≤ nums[i] ≤ 10^9
-10^9 ≤ target ≤ 10^9
Only one valid answer exists`,
          
          explanation: `Use a hash map to store seen numbers and their indices. For each number, check if (target - number) exists in the hash map.`,
          
          testCases: [
            {
              input: `4\n2 7 11 15\n9`,
              expectedOutput: `0 1`,
              isSample: true,
              isHidden: false,
              explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
            },
            {
              input: `3\n3 2 4\n6`,
              expectedOutput: `1 2`,
              isSample: false,
              isHidden: true,
              explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
            },
            {
              input: `2\n3 3\n6`,
              expectedOutput: `0 1`,
              isSample: false,
              isHidden: true,
              explanation: 'nums[0] + nums[1] = 3 + 3 = 6'
            },
            {
              input: `5\n-1 -2 -3 -4 -5\n-8`,
              expectedOutput: `2 4`,
              isSample: false,
              isHidden: true,
              explanation: 'nums[2] + nums[4] = -3 + (-5) = -8'
            }
          ],
          
          difficulty: 'Easy',
          points: 100,
          timeLimit: 2000,
          memoryLimit: 256,
          supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
          
          codeTemplates: {
            javascript: `// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lines = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    // Parse input
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    const target = parseInt(lines[2]);
    
    // Write your solution here
    function twoSum(nums, target) {
        // Your code here
        
    }
    
    const result = twoSum(nums, target);
    // Output result
    console.log(result[0] + ' ' + result[1]);
});`,
            
            python: `# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Write your solution here
def two_sum(nums, target):
    # Your code here
    pass

result = two_sum(nums, target)
# Output result
print(result[0], result[1])`,

            java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        // Read input
        int n = Integer.parseInt(br.readLine());
        String[] numsStr = br.readLine().split(" ");
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = Integer.parseInt(numsStr[i]);
        }
        int target = Integer.parseInt(br.readLine());
        
        // Write your solution here
        int[] result = twoSum(nums, target);
        
        // Output result
        System.out.println(result[0] + " " + result[1]);
    }
    
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[2];
    }
}`,

            cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Read input
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;
    
    // Solve
    vector<int> result = twoSum(nums, target);
    
    // Output result
    cout << result[0] << " " << result[1] << endl;
    
    return 0;
}`,

            c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}

int main() {
    // Read input
    int n;
    scanf("%d", &n);
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }
    int target;
    scanf("%d", &target);
    
    // Solve
    int returnSize;
    int* result = twoSum(nums, n, target, &returnSize);
    
    // Output result
    printf("%d %d\\n", result[0], result[1]);
    
    free(nums);
    free(result);
    return 0;
}`
          }
        },
        
        {
          questionName: 'Valid Parentheses',
          problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false`,
          
          inputFormat: `Single line: string s (containing brackets)`,
          outputFormat: `Single line: "true" or "false"`,
          
          constraints: `1 ≤ s.length ≤ 10^4
s consists of parentheses only '()[]{}'`,
          
          explanation: `Use a stack to keep track of opening brackets. For each closing bracket, check if it matches the most recent opening bracket.`,
          
          testCases: [
            {
              input: `()`,
              expectedOutput: `true`,
              isSample: true,
              isHidden: false,
              explanation: 'Simple valid parentheses'
            },
            {
              input: `()[]{} `,
              expectedOutput: `true`,
              isSample: false,
              isHidden: true,
              explanation: 'Multiple types of valid brackets'
            },
            {
              input: `(]`,
              expectedOutput: `false`,
              isSample: false,
              isHidden: true,
              explanation: 'Mismatched bracket types'
            },
            {
              input: `([)]`,
              expectedOutput: `false`,
              isSample: false,
              isHidden: true,
              explanation: 'Wrong order of closing'
            }
          ],
          
          difficulty: 'Easy',
          points: 80,
          timeLimit: 1000,
          memoryLimit: 128,
          supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c']
        },
        
        {
          questionName: 'Maximum Subarray',
          problemStatement: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.

Example 2:
Input: nums = [1]
Output: 1

Example 3:
Input: nums = [5,4,-1,7,8]
Output: 23`,
          
          inputFormat: `First line: integer n (size of array)
Second line: n space-separated integers`,
          
          outputFormat: `Single integer (maximum subarray sum)`,
          
          constraints: `1 ≤ n ≤ 10^5
-10^4 ≤ nums[i] ≤ 10^4`,
          
          explanation: `Use Kadane's algorithm: maintain current sum and maximum sum seen so far.`,
          
          testCases: [
            {
              input: `9\n-2 1 -3 4 -1 2 1 -5 4`,
              expectedOutput: `6`,
              isSample: true,
              isHidden: false,
              explanation: 'Subarray [4,-1,2,1] has sum 6'
            },
            {
              input: `1\n1`,
              expectedOutput: `1`,
              isSample: false,
              isHidden: true,
              explanation: 'Single element'
            },
            {
              input: `5\n5 4 -1 7 8`,
              expectedOutput: `23`,
              isSample: false,
              isHidden: true,
              explanation: 'Entire array is the maximum subarray'
            }
          ],
          
          difficulty: 'Medium',
          points: 150,
          timeLimit: 3000,
          memoryLimit: 256,
          supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c']
        }
      ],
      
      settings: {
        allowLanguageSwitching: true,
        showTestCaseResults: true,
        allowMultipleSubmissions: true,
        maxSubmissionsPerQuestion: 10,
        preventTabSwitching: true,
        enableCodePlayback: true
      },
      
      createdBy: 'system',
      createdByName: 'Industry Standards Admin',
      collegeName: 'Vignan University',
      department: 'Computer Science',
      isActive: true,
      status: 'published'
    });

    const savedTest = await industryTest.save();
    console.log('✅ Industry-standard coding test created successfully!');
    console.log(`📝 Test ID: ${savedTest._id}`);
    console.log(`📋 Title: ${savedTest.title}`);
    console.log(`❓ Questions: ${savedTest.questions.length}`);
    console.log(`⏰ Start Time: ${savedTest.startTime}`);
    console.log(`⏰ End Time: ${savedTest.endTime}`);
    
    // Log test cases for verification
    console.log('\n📊 Test Cases Summary:');
    savedTest.questions.forEach((q, index) => {
      console.log(`\n${index + 1}. ${q.questionName}:`);
      console.log(`   - Total test cases: ${q.testCases.length}`);
      console.log(`   - Sample cases: ${q.testCases.filter(tc => tc.isSample).length}`);
      console.log(`   - Hidden cases: ${q.testCases.filter(tc => tc.isHidden).length}`);
      console.log(`   - Points: ${q.points}`);
      console.log(`   - Time limit: ${q.timeLimit}ms`);
      console.log(`   - Languages: ${q.supportedLanguages.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Error creating test:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createIndustryStandardTest();