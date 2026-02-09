# Frontend Integration: Balance Update Guide

## Overview
The backend now implements a **pay-on-success** billing model. Users are only charged after successful generation and upload to R2 storage.

## When to Update Balance on Frontend

### 1. After Polling Shows Success
When the frontend polls the history endpoint (`GET /api/v1/history/:id`) and receives `status: "success"`, it should:

```javascript
// Example polling logic
const checkStatus = async (taskId) => {
  const response = await fetch(`/api/v1/history/${taskId}`);
  const task = await response.json();
  
  if (task.status === 'success') {
    // ✅ Generation succeeded - balance was deducted
    await refreshUserBalance();
    showSuccessNotification(task.resultUrl);
  } else if (task.status === 'failed') {
    // ❌ Generation failed - NO charge
    showErrorNotification(task.errorMessage || 'Generation failed');
    // No need to refresh balance
  } else if (task.status === 'processing') {
    // ⏳ Still processing - check again later
    setTimeout(() => checkStatus(taskId), 5000);
  }
};
```

### 2. Refresh Balance Function
```javascript
const refreshUserBalance = async () => {
  const response = await fetch('/api/v1/user/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const userData = await response.json();
  
  // Update UI with new balance
  updateBalanceDisplay(userData.balance);
};
```

## Important Notes

### ✅ Charge Happens When:
- Generation completes successfully
- File is uploaded to R2 storage
- Task status changes to `success`

### ❌ NO Charge When:
- Generation fails (OpenAI policy violation, KIE error, etc.)
- Task status is `failed`
- Network errors during upload

### 💡 Best Practice
Poll the history endpoint every 5-10 seconds while `status === 'processing'`. When status changes to `success` or `failed`, refresh the balance only if successful.

## Example: Complete Flow

```javascript
// 1. Start generation
const startGeneration = async (params) => {
  const response = await fetch('/api/v1/video/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  const { id } = await response.json();
  
  // 2. Start polling
  pollTaskStatus(id);
};

// 2. Poll for status
const pollTaskStatus = async (taskId) => {
  const response = await fetch(`/api/v1/history/${taskId}`);
  const task = await response.json();
  
  if (task.status === 'success') {
    // ✅ Success - refresh balance and show result
    await refreshUserBalance();
    displayVideo(task.resultUrl);
  } else if (task.status === 'failed') {
    // ❌ Failed - show error (no charge)
    showError(task.errorMessage);
  } else {
    // ⏳ Still processing - poll again
    setTimeout(() => pollTaskStatus(taskId), 5000);
  }
};
```

## Summary
- **Only refresh balance when `status === 'success'`**
- **Do NOT refresh on `failed` status** (user wasn't charged)
- **Poll every 5-10 seconds** during `processing`
