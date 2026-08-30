# Security Guidelines

## Core Security Principles

1. **Fail Secure** — When in doubt, reject the request
2. **Principle of Least Privilege** — Users get only required permissions
3. **Defense in Depth** — Multiple layers of security
4. **Assume No Trust** — Validate everything, even from frontend
5. **Audit Everything** — Log all sensitive actions
6. **Privacy First** — Separate voter identity from ballot

## Authentication Security

### Student Authentication Flow

```
1. Student ID Entry
   ├─ Validate format
   ├─ Check if exists
   ├─ Check eligibility
   └─ Check voting status

2. OTP Generation
   ├─ Generate random 6-digit code
   ├─ Hash code with bcrypt/argon2
   ├─ Store hash + expiry (5 minutes)
   ├─ Track attempts (max 5)
   └─ Invalidate previous codes

3. OTP Delivery
   ├─ Send to registered contact
   ├─ Display masked contact only
   └─ Never display full contact info

4. OTP Verification
   ├─ Verify code hash
   ├─ Check not expired
   ├─ Check attempts not exceeded
   ├─ Increment attempt counter
   └─ Mark as used

5. Session Creation
   ├─ Generate secure session token
   ├─ Store in database
   ├─ Set expiry (30 minutes)
   ├─ Use secure cookies
   └─ Rotate on each interaction
```

### Session Management

```php
// Secure cookie configuration
'session' => [
    'driver' => 'database',
    'lifetime' => 30,           // 30 minutes
    'expire_on_close' => false,
    'encrypt' => true,
    'http_only' => true,       // HttpOnly flag
    'secure' => true,          // HTTPS only
    'same_site' => 'Lax',      // CSRF protection
    'domain' => '.level200.local'
],
```

### Admin Authentication

```
- Use strong password requirements (12+ chars, mixed case, numbers, symbols)
- Implement password hashing with bcrypt/argon2
- Support two-factor authentication (optional enhancement)
- Track failed login attempts
- Lock account after 5 failed attempts (15 min lockout)
- Force password change on first login
- Implement session timeout (15 minutes of inactivity)
```

## Authorization Security

### Role-Based Access Control (RBAC)

```
SUPER_ADMIN
├─ Create elections
├─ Manage administrators
├─ Configure system settings
└─ Access all data

ELECTION_ADMIN
├─ Manage voters
├─ Manage candidates
├─ Manage positions
├─ Open/close elections
├─ View results
└─ View audit logs

ELECTION_OBSERVER
├─ View election status
├─ View published results
└─ View audit logs

STUDENT
├─ Vote (during voting window)
├─ View ballot
└─ View confirmation
```

### Authorization Checks

Every endpoint must verify:

```php
// Check user is authenticated
if (!$session->is_authenticated()) {
    return unauthorized_response();
}

// Check user has required role
if (!in_array($user->role, $required_roles)) {
    return forbidden_response();
}

// Check resource ownership (if applicable)
if ($resource->owner_id != $user->id) {
    return forbidden_response();
}

// Check business rule
if (!$election->can_add_candidates()) {
    return conflict_response();
}
```

## Input Validation

### Student ID

```php
// Must be alphanumeric format
if (!preg_match('/^[A-Z]{2}\d{6}$/', $student_id)) {
    throw InvalidInput("Invalid Student ID format");
}

// Query by exact match
$student = Student::where('student_id', $student_id)->first();
if (!$student) {
    throw NotFound("Student not found");
}
```

### OTP Code

```php
// Must be numeric
if (!preg_match('/^\d{6}$/', $code)) {
    throw InvalidInput("Code must be 6 digits");
}

// Never log the actual code
Log::info("OTP verification attempt", [
    'student_id' => $student_id,
    'attempt' => $attempt_count
    // DO NOT include: 'code' => $code
]);
```

### Candidate ID

```php
// Verify candidate exists
$candidate = Candidate::findOrFail($candidate_id);

// Verify candidate is active
if ($candidate->status !== 'ACTIVE') {
    throw ValidationError("Candidate is not active");
}

// Verify candidate belongs to election
if ($candidate->election_id !== $election_id) {
    throw ValidationError("Candidate not in this election");
}

// Verify candidate belongs to position
if ($candidate->position_id !== $position_id) {
    throw ValidationError("Candidate assigned to wrong position");
}
```

## Output Encoding

### HTML Output

```php
// Escape all user input
echo htmlspecialchars($candidate_name, ENT_QUOTES, 'UTF-8');

// Use Laravel blade escaping
<p>{{ $candidate_name }}</p>  // Auto-escaped

// Never use raw output
<p>{!! $candidate_name !!}</p>  // NEVER, unless verified safe
```

### JSON Output

```php
// Set proper content type
header('Content-Type: application/json; charset=utf-8');

// Encode properly
return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
```

## CSRF Protection

All state-changing operations must have CSRF tokens:

```php
// In forms
<form method="POST" action="/api/vote">
    {{ csrf_field() }}
    <!-- form fields -->
</form>

// In API requests
fetch('/api/vote', {
    method: 'POST',
    headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(votes)
});
```

## SQL Injection Prevention

Always use parameterized queries:

```php
// ❌ WRONG - vulnerable
$votes = DB::select("SELECT * FROM votes WHERE ballot_id = " . $ballot_id);

// ✅ CORRECT - parameterized
$votes = DB::select("SELECT * FROM votes WHERE ballot_id = ?", [$ballot_id]);

// ✅ CORRECT - using ORM
$votes = Vote::where('ballot_id', $ballot_id)->get();
```

## XSS Prevention

```php
// ❌ WRONG
echo "Welcome, " . $_GET['name'];

// ✅ CORRECT
echo "Welcome, " . htmlspecialchars($_GET['name']);

// ✅ CORRECT in templates
<p>Welcome, {{ $name }}</p>
```

## Duplicate Vote Prevention

The most critical security feature:

```php
DB::beginTransaction();
try {
    // Lock the voter record for this transaction
    $voter = Student::where('student_id', $student_id)
                     ->lockForUpdate()
                     ->first();
    
    // Check if already voted
    if ($voter->has_voted) {
        DB::rollback();
        throw new AlreadyVotedException();
    }
    
    // Validate entire ballot
    foreach ($votes as $vote) {
        validate_vote($vote);
    }
    
    // Create ballot
    $ballot = Ballot::create([
        'election_id' => $election_id,
        'ballot_reference' => generate_reference(),
        'submitted_at' => now()
    ]);
    
    // Create votes
    foreach ($votes as $vote) {
        Vote::create([
            'ballot_id' => $ballot->id,
            'position_id' => $vote['position_id'],
            'candidate_id' => $vote['candidate_id']
        ]);
    }
    
    // Mark voter as voted
    $voter->update([
        'has_voted' => true,
        'voted_at' => now()
    ]);
    
    // Commit transaction
    DB::commit();
    
    return success_response($ballot);
} catch (Exception $e) {
    DB::rollback();
    throw $e;
}
```

## Rate Limiting

Implement rate limiting on all public endpoints:

```php
// OTP Requests
Route::post('/request-code', [AuthController::class, 'requestCode'])
    ->middleware('throttle:3,15');  // 3 requests per 15 minutes

// OTP Verification
Route::post('/verify-code', [AuthController::class, 'verifyCode'])
    ->middleware('throttle:5,5');   // 5 attempts per 5 minutes

// Vote Submission
Route::post('/vote', [VotingController::class, 'submit'])
    ->middleware('throttle:1,60');  // 1 per minute (emergency protection)
```

## HTTPS Requirements

Production deployment MUST use HTTPS:

```
- Obtain valid SSL certificate
- Redirect all HTTP to HTTPS
- Set HSTS header
- Use secure cookies only
- Force HTTPS in .env:
  APP_URL=https://voting.level200.local
```

## Password Storage

```php
// Hash passwords with strong algorithm
$hashed = Hash::make($password);  // Uses bcrypt

// Verify password
if (Hash::check($input_password, $user->password_hash)) {
    // Authenticated
}

// Never log passwords
Log::warning("Failed login", [
    'email' => $email
    // DO NOT include: 'password' => $password
]);
```

## Error Handling

Never expose system details to users:

```php
// ❌ WRONG - exposes database details
catch (QueryException $e) {
    return response()->json([
        'error' => $e->getMessage()  // SQL error visible!
    ], 500);
}

// ✅ CORRECT - generic message
catch (QueryException $e) {
    Log::error('Database error', [
        'exception' => $e,
        'context' => 'vote_submission'
    ]);
    
    return response()->json([
        'error' => 'An error occurred processing your request',
        'error_code' => 'DB_ERROR'
    ], 500);
}
```

## Logging & Auditing

Log sensitive events:

```php
// ✅ Log authentication attempts
AuditLog::create([
    'admin_user_id' => $admin_id,
    'action' => 'student_authenticated',
    'entity_type' => 'student',
    'entity_id' => $student_id,
    'ip_address' => request()->ip(),
    'created_at' => now()
]);

// ✅ Log voting events
AuditLog::create([
    'action' => 'vote_submitted',
    'entity_type' => 'ballot',
    'entity_id' => $ballot_id,
    'ip_address' => request()->ip()
]);

// ✅ Log admin actions
AuditLog::create([
    'admin_user_id' => $admin_id,
    'action' => 'election_paused',
    'entity_type' => 'election',
    'entity_id' => $election_id,
    'metadata' => [
        'reason' => 'Technical issues reported'
    ],
    'ip_address' => request()->ip()
]);
```

## Security Headers

Set security headers in responses:

```php
// In middleware or config
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
header('Content-Security-Policy: default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'');
header('Referrer-Policy: no-referrer');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
```

## Secrets Management

Never commit secrets to version control:

```
# .gitignore
.env
.env.local
.env.*.local
secrets/
keys/
certificates/
*.key
*.pem
```

Store secrets in:
- Environment variables (.env file, not committed)
- Secret management systems (AWS Secrets Manager, etc.)
- Secure configuration management

## Security Testing Checklist

Before production:

- [ ] SQL injection tests on all endpoints
- [ ] XSS tests on all input fields
- [ ] CSRF token validation
- [ ] Session hijacking attempts
- [ ] Brute force tests on authentication
- [ ] Race condition tests on vote submission
- [ ] Duplicate vote attempts
- [ ] Unauthorized access tests
- [ ] Rate limiting tests
- [ ] HTTPS enforcement tests
- [ ] Error message information leakage
- [ ] Audit log completeness
