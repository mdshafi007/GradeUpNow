/**
 * Sample Coding Test Creator
 * Creates a sample coding test for testing the student interface
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import CodingTest from './models/CodingTest_lms.js';

dotenv.config();

async function createSampleCodingTest() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if there are existing coding tests
    const existingTests = await CodingTest.find({ collegeName: 'Vignan University' });
    console.log(`📊 Found ${existingTests.length} existing coding tests for Vignan University`);

    if (existingTests.length > 0) {
      console.log('📋 Existing tests:');
      existingTests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.title} (${test.questions?.length || 0} questions)`);
      });
      
      console.log('\n✅ Coding tests already exist. No need to create sample data.');
      return;
    }

    console.log('🚀 Creating sample coding test...');

    const sampleTest = new CodingTest({
      title: 'Coding Assessment',
      instructions: 'Solve all coding problems within the given time limit. Read each problem carefully and implement efficient solutions. You can submit multiple times for each problem.',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in 1 week
      durationType: 'fixed',
      fixedDuration: 120, // 2 hours
      totalQuestions: 1,
      questions: [{
        questionName: 'Two Sum',
        problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
        inputFormat: 'The first line contains an integer n, the size of the array.\nThe second line contains n space-separated integers representing the array.\nThe third line contains the target integer.',
        outputFormat: 'Return two space-separated integers representing the indices of the two numbers that add up to the target.',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
        explanation: 'Find two numbers in the array that sum to the target value and return their indices.',
        testCases: [
          {
            input: '4\n2 7 11 15\n9',
            expectedOutput: '0 1',
            isSample: true,
            isHidden: false,
            explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].'
          },
          {
            input: '3\n3 2 4\n6',
            expectedOutput: '1 2',
            isSample: true,
            isHidden: false,
            explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2].'
          },
          {
            input: '2\n3 3\n6',
            expectedOutput: '0 1',
            isSample: false,
            isHidden: true,
            explanation: 'Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1].'
          }
        ],
        difficulty: 'Medium',
        points: 10,
        timeLimit: 30,
        memoryLimit: 128,
        supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
        codeTemplates: {
          javascript: `// Write your solution here
function twoSum(nums, target) {
    // Your code here
    
}

// Read input
const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const n = parseInt(input[0]);
const nums = input[1].split(' ').map(Number);
const target = parseInt(input[2]);

const result = twoSum(nums, target);
console.log(result[0] + ' ' + result[1]);`,
          python: `# Write your solution here
def two_sum(nums, target):
    # Your code here
    pass

# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())

result = two_sum(nums, target)
print(result[0], result[1])`,
          java: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{0, 0};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`,
          cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {0, 0};
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    
    return 0;
}`,
          c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    result[0] = 0;
    result[1] = 0;
    return result;
}

int main() {
    int n;
    scanf("%d", &n);
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }
    int target;
    scanf("%d", &target);
    
    int returnSize;
    int* result = twoSum(nums, n, target, &returnSize);
    printf("%d %d\\n", result[0], result[1]);
    
    free(nums);
    free(result);
    return 0;
}`
        }
      }],
      settings: {
        allowLanguageSwitching: true,
        showTestCaseResults: true,
        allowMultipleSubmissions: true,
        maxSubmissionsPerQuestion: 10,
        preventTabSwitching: true,
        enableCodePlayback: false
      },
      createdBy: 'system',
      createdByName: 'System Admin',
      collegeName: 'Vignan University',
      department: 'Computer Science',
      isActive: true,
      status: 'published'
    });

    const savedTest = await sampleTest.save();
    console.log('✅ Sample coding test created successfully!');
    console.log(`📝 Test ID: ${savedTest._id}`);
    console.log(`📋 Title: ${savedTest.title}`);
    console.log(`❓ Questions: ${savedTest.questions.length}`);

  } catch (error) {
    console.error('❌ Error creating sample coding test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createSampleCodingTest();