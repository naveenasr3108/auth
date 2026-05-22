AUTH API DOCUMENTATION

1. LOGIN API
POST /login
Success Response:
Status: 200
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "123",
    "email": "test@gmail.com"
  }
}
Error Responses:
400 Bad Request
{
  "message": "Email and password required"
}
401 Unauthorized
{
  "message": "Invalid credentials"
}
404 Not Found (optional)
{
  "message": "User not found"
}

2. PROTECTED API (Example: GET /tasks)
Success Response:
Status: 200
{
  "tasks": []
}
Error Responses:
401 Unauthorized
{
  "message": "Token missing"
}
403 Forbidden
{
  "message": "Invalid or expired token"
}

Edge Case Testing:

3. Missing Required Fields

Test Case:
Send request without required fields (e.g., email/password in login or title in task)

Request Example:
{}

Expected Response:
Status: 400 Bad Request  
Response:
{
  "message": "Required fields missing"
}
Result: PASS

4. Duplicate Entries

Test Case:
Try creating duplicate data (e.g., same email during registration or same task)

Expected Response:
Status: 409 Conflict  
Response:
{
  "message": "Duplicate entry"
}

Result:PASS

5. SQL Injection Attempt

Test Case:
Try injecting SQL in input fields (e.g., login)

Request Example:
{
  "email": "admin' OR '1'='1",
  "password": "anything"
}

Expected Response:
Status: 400 or 401  
Response:
{
  "message": "Invalid input"
}

**Result:** PASS

6. Rate Limit Triggering

Test Case:
Send multiple requests rapidly (e.g., login API spam)

Expected Response:
Status: 429 Too Many Requests  
Response:
{
  "message": "Too many requests, please try again later"
}

Result: PASS