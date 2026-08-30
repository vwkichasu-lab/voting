# Database Schema

## Tables Overview

### users

System administrators and operators.

```
id
email UNIQUE
password_hash
role (SUPER_ADMIN, ELECTION_ADMIN, ELECTION_OBSERVER)
created_at
updated_at
```

### students

Eligible voters in the election.

```
id
student_id UNIQUE
name
intake (January, September)
programme
eligible (YES/NO)
has_voted (0/1)
voted_at (nullable)
created_at
updated_at
```

### elections

Election instances.

```
id
name
description
status (DRAFT, NOMINATIONS_OPEN, NOMINATIONS_CLOSED, READY, VOTING_OPEN, VOTING_PAUSED, VOTING_CLOSED, RESULTS_PUBLISHED, ARCHIVED)
start_at
end_at
paused_at (nullable)
pause_reason (nullable)
created_at
updated_at
```

### positions

Executive positions in the election.

```
id
election_id (foreign key)
name
description
display_order
is_required (1/0)
created_at
updated_at
```

### candidates

Candidates running for positions.

```
id
election_id (foreign key)
position_id (foreign key)
name
intake (January, September)
manifesto
photo_path (nullable)
status (ACTIVE, INACTIVE)
created_at
updated_at
```

### otp_challenges

One-time verification codes.

```
id
student_id (foreign key)
code_hash
expires_at
attempts (default 0)
used_at (nullable)
created_at
```

### sessions

Voting sessions for authenticated students.

```
id
student_id (foreign key)
election_id (foreign key)
expires_at
created_at
```

### ballots

Submitted ballots.

```
id
election_id (foreign key)
ballot_reference UNIQUE
submitted_at
created_at
```

### votes

Individual votes within a ballot.

```
id
ballot_id (foreign key)
position_id (foreign key)
candidate_id (foreign key)
created_at
```

### audit_logs

Administrative action audit trail.

```
id
admin_user_id (foreign key to users)
action
entity_type
entity_id (nullable)
metadata (JSON)
ip_address
created_at
```

## Key Constraints

```sql
-- Unique constraints
ALTER TABLE students ADD UNIQUE(student_id);
ALTER TABLE ballots ADD UNIQUE(ballot_reference);

-- One vote per position per ballot
ALTER TABLE votes ADD UNIQUE(ballot_id, position_id);

-- Foreign key relationships
ALTER TABLE positions ADD FOREIGN KEY (election_id) REFERENCES elections(id);
ALTER TABLE candidates ADD FOREIGN KEY (election_id) REFERENCES elections(id);
ALTER TABLE candidates ADD FOREIGN KEY (position_id) REFERENCES positions(id);
ALTER TABLE otp_challenges ADD FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE sessions ADD FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE sessions ADD FOREIGN KEY (election_id) REFERENCES elections(id);
ALTER TABLE ballots ADD FOREIGN KEY (election_id) REFERENCES elections(id);
ALTER TABLE votes ADD FOREIGN KEY (ballot_id) REFERENCES ballots(id);
ALTER TABLE votes ADD FOREIGN KEY (position_id) REFERENCES positions(id);
ALTER TABLE votes ADD FOREIGN KEY (candidate_id) REFERENCES candidates(id);
```

## Indexes

```sql
CREATE INDEX idx_students_has_voted ON students(has_voted);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_otp_challenges_student_id ON otp_challenges(student_id);
CREATE INDEX idx_otp_challenges_expires_at ON otp_challenges(expires_at);
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_ballots_election_id ON ballots(election_id);
CREATE INDEX idx_votes_ballot_id ON votes(ballot_id);
CREATE INDEX idx_votes_position_id ON votes(position_id);
CREATE INDEX idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## Migration Files Location

All migrations are stored in `backend/database/migrations/`

See Laravel migration system for implementation details.
