# 📋 Example Mock Interviews

Get a preview of practicing with Candidly! Here are examples from each of the **4 Question Types**.

---

## 🎯 Question Types Overview

| Type | Best For | Example Question |
|------|----------|------------------|
| **Behavioral** | Soft skills, experiences | "Tell me about a time you led a team" |
| **Technical** | Concepts, architecture | "Explain REST vs GraphQL" |
| **Coding** | Problem-solving | "Reverse a linked list" |
| **System Design** | Large-scale architecture | "Design a URL shortener" |

---

## ✅ Example #1: Behavioral Interview

### The Question
```
🟠 MEDIUM | Behavioral

"Tell me about a time when you had to work with a difficult team member.
How did you handle the situation?"
```

### Sample Answer
```
In my previous role, I worked with a senior engineer who was very critical 
of my code. Initially I felt defensive, but I realized they wanted better 
code quality. I asked them to mentor me through pair programming sessions. 
Over time, we built a great working relationship, and they became one of 
my best advocates for my promotion.
```

### AI Feedback
```
Score: 82/100

✓ Strengths:
• Clear problem identification and proactive resolution
• Shows self-awareness and willingness to learn
• Demonstrates long-term relationship building

↑ Areas for Improvement:
• Could include specific metrics or outcomes
• Add more detail about emotions at the time
• Mention what you learned from this experience

💡 Suggestions:
1. Quantify impact: "Our collaboration reduced code review time by 30%"
2. Share a specific technical concept you learned
3. Conclude with how you apply this lesson today
```

---

## 📚 Example #2: Technical Interview

### The Question
```
🟠 MEDIUM | Technical

"Explain event-driven architecture and when you would use it over 
traditional request-response."
```

### Sample Answer
```
Event-driven architecture is where components communicate through events 
rather than direct requests. Service A emits an event that Service B 
listens for.

Use event-driven when:
- High scalability needs (services are decoupled)
- Real-time systems (chat, notifications, feeds)
- Microservices (services don't need to know about each other)

Traditional request-response is better for:
- Simple CRUD operations
- Strongly consistent systems
- When you need immediate responses

Example: Payment system where PaymentProcessed triggers multiple events:
UpdateInventory, SendConfirmation, LogAnalytics
```

### AI Feedback
```
Score: 75/100

✓ Strengths:
• Clear concept explanation
• Practical use cases
• Real-world example included

↑ Areas for Improvement:
• Could discuss trade-offs more deeply
• Missing event sourcing or CQRS mention
• No technical implementation details

💡 Suggestions:
1. Mention event ordering and eventual consistency challenges
2. Discuss message brokers: Kafka, RabbitMQ, AWS SNS/SQS
3. Add: "We used Kafka to handle 10k events/second"
```

---

## 💻 Example #3: Coding Interview

### The Question
```
🔴 HARD | Coding

"Write a function to find the longest substring without repeating characters."

Input: String (length 1-50,000)
Output: Integer (length of longest substring)
```

### Sample Answer
```javascript
function lengthOfLongestSubstring(s) {
  const charMap = {};
  let maxLen = 0;
  let start = 0;

  for (let end = 0; end < s.length; end++) {
    const char = s[end];
    
    if (charMap[char] !== undefined && charMap[char] >= start) {
      start = charMap[char] + 1;
    }
    
    charMap[char] = end;
    maxLen = Math.max(maxLen, end - start + 1);
  }
  
  return maxLen;
}

// Time: O(n), Space: O(min(n, charset_size))
```

### AI Feedback
```
Score: 88/100

✓ Strengths:
• Correct optimal solution (sliding window)
• O(n) time complexity achieved
• Clear variable naming
• Good comments

↑ Areas for Improvement:
• Could explain why sliding window works
• Didn't discuss alternative approaches
• Missing edge cases discussion

💡 Suggestions:
1. Start with brute force O(n²) vs optimal O(n)
2. Explain: "We avoid reprocessing by remembering positions"
3. Add edge cases: empty string, single character
```

---

## 🏗️ Example #4: System Design

### The Question
```
🔴 HARD | System Design

"Design a notification system for 100M+ users. Consider delivery 
guarantees, scalability, and real-time requirements."
```

### Sample Answer
```
Architecture:

1. API Layer (Load Balanced)
   - Receives notification requests
   - Input validation, rate limiting
   - Returns immediately to caller

2. Message Queue (Apache Kafka)
   - Decouples producer from processors
   - Handles 1M+ events/second
   - Built-in retry mechanism

3. Notification Workers (by type)
   - Email (AWS SES)
   - SMS (Twilio)
   - Push (Firebase)
   - In-app (WebSocket)

4. Database & Cache
   - History (PostgreSQL)
   - Preferences (Redis)

5. Monitoring
   - ELK Stack for logs
   - Datadog for metrics

Key Decisions:
• Asynchronous processing for scale
• Multiple retries with exponential backoff
• Dead letter queue for failures
• Deduplication to prevent duplicates
```

### AI Feedback
```
Score: 79/100

✓ Strengths:
• Addresses scalability
• Multiple channels considered
• Mentions key components
• Discusses failure handling

↑ Areas for Improvement:
• Missing sharding strategy
• No cost optimization discussion
• Database schema not detailed

💡 Suggestions:
1. Explain partitioning: "Shard by user_id across DB nodes"
2. Discuss consistency: "Email delayed, in-app immediate"
3. Add cost: "Batch SES for emails, Twilio for personalized SMS"
```

---

## 📊 Session Summary Example

```
Total Questions: 4
Average Score: 81/100
Time Spent: 12 minutes
Types Covered: All 4
Difficulty: 2 Medium, 2 Hard

Performance:
Behavioral      82  ████████░
Technical       75  ███████░░
Coding          88  █████████
System Design   79  ████████░

Overall: Very Good! 🎉
```

---

## 🎯 Mock Interview Flow

### Step 1: Start
```
┌─────────────────────────────┐
│ 🎯 Mock Interview Mode      │
├─────────────────────────────┤
│ Question #1                 │
│ 🟠 MEDIUM | Behavioral     │
│                             │
│ "Tell me about..."         │
│                             │
│ [Next] [End Interview]     │
└─────────────────────────────┘
```

### Step 2: Complete & Get Feedback
```
┌─────────────────────────────┐
│ Interview Complete          │
├─────────────────────────────┤
│ Would you like feedback?    │
│                             │
│ [Get Feedback] [No Thanks] │
└─────────────────────────────┘
```

### Step 3: Review Results
```
┌─────────────────────────────┐
│ Overall Score: 81           │
│                             │
│ ✓ Strengths                 │
│ • Clear communication       │
│ • Good technical knowledge  │
│                             │
│ ↑ Improve                   │
│ • Add more examples         │
│ • Quantify impacts          │
│                             │
│ [Close]                     │
└─────────────────────────────┘
```

---

## 💡 Pro Tips

**Before Interview:**
- Find quiet space
- Have notebook ready
- Do a warm-up question

**During Interview:**
- Think out loud
- Explain your approach
- Mention trade-offs

**After Interview:**
- Review all feedback
- Note improvement areas
- Practice similar questions

---

## 🚀 Ready to Start?

1. [Set up Candidly](README.md#-quick-start)
2. Start your first mock interview
3. Get feedback and improve
4. Track your progress

**Happy practicing! 🎉**
