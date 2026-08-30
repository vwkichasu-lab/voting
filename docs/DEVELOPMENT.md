# Development Guide

## Local Development Setup

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18 or higher
- npm or yarn
- MySQL 8.0 or PostgreSQL 13+
- Git
- VS Code or similar editor

### Initial Setup

#### 1. Clone the Project

```bash
git clone <repository-url>
cd voting
```

#### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Generate application key (Laravel)
cd backend
php artisan key:generate
cd ..
```

#### 3. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE voting_system;
EXIT;

# Run migrations
cd backend
php artisan migrate
php artisan db:seed --class=DummyDataSeeder
cd ..
```

#### 4. Backend Installation

```bash
cd backend

# Install dependencies
composer install

# Generate app key
php artisan key:generate

# Create storage symlink
php artisan storage:link

# Start development server
php artisan serve
```

This will serve the backend at `http://localhost:8000`

#### 5. Frontend Installation

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

This will serve the frontend at `http://localhost:3000`

### Accessing the Application

- **Student Interface:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **API Documentation:** http://localhost:8000/api/docs

### Development Servers

Run these in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
php artisan serve

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 (optional) - Database GUI
mysql -u root -p
```

## Project Structure Details

### Backend Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── ElectionController.php
│   │   │   │   ├── CandidateController.php
│   │   │   │   ├── VoterController.php
│   │   │   │   ├── ResultsController.php
│   │   │   │   └── AuditController.php
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php
│   │   │   ├── Election/
│   │   │   │   └── VotingController.php
│   │   │   └── Student/
│   │   │       └── BallotController.php
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── CheckRole.php
│   │   │   ├── VerifyElectionOpen.php
│   │   │   └── CSRF.php
│   │   ├── Requests/
│   │   │   ├── RequestCodeRequest.php
│   │   │   ├── VerifyCodeRequest.php
│   │   │   └── SubmitVoteRequest.php
│   │   └── Resources/
│   │       └── (JSON response formatting)
│   ├── Models/
│   │   ├── User.php
│   │   ├── Student.php
│   │   ├── Election.php
│   │   ├── Position.php
│   │   ├── Candidate.php
│   │   ├── OtpChallenge.php
│   │   ├── Session.php
│   │   ├── Ballot.php
│   │   ├── Vote.php
│   │   └── AuditLog.php
│   ├── Services/
│   │   ├── AuthService.php
│   │   ├── VotingService.php
│   │   ├── ElectionService.php
│   │   ├── ResultsService.php
│   │   └── AuditService.php
│   ├── Exceptions/
│   │   ├── AlreadyVotedException.php
│   │   ├── ElectionClosedException.php
│   │   └── InvalidCandidateException.php
│   └── Traits/
│       ├── HasAudit.php
│       └── LogsActivity.php
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000000_create_users_table.php
│   │   ├── 2024_01_02_000000_create_students_table.php
│   │   ├── 2024_01_03_000000_create_elections_table.php
│   │   └── ... (other migrations)
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── AdminSeeder.php
│   │   ├── StudentSeeder.php
│   │   ├── ElectionSeeder.php
│   │   ├── CandidateSeeder.php
│   │   └── DummyDataSeeder.php
│   └── factories/
│       ├── StudentFactory.php
│       └── CandidateFactory.php
├── routes/
│   ├── api.php              # Public API routes
│   ├── admin.php            # Admin routes
│   └── middleware.php       # Route groups
├── config/
│   ├── app.php
│   ├── database.php
│   ├── auth.php
│   ├── session.php
│   ├── cache.php
│   └── election.php        # Election-specific config
├── storage/
│   ├── app/
│   │   └── public/
│   │       └── candidates/  # Candidate photos
│   ├── logs/
│   └── framework/
├── tests/
│   ├── Unit/
│   │   ├── AuthServiceTest.php
│   │   ├── VotingServiceTest.php
│   │   └── ValidationTest.php
│   ├── Feature/
│   │   ├── AuthenticationTest.php
│   │   ├── VotingTest.php
│   │   ├── AdminTest.php
│   │   └── SecurityTest.php
│   └── TestCase.php
└── composer.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Student/
│   │   │   ├── Pages/
│   │   │   │   ├── WelcomePage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── VerificationPage.jsx
│   │   │   │   ├── BallotPage.jsx
│   │   │   │   ├── ReviewPage.jsx
│   │   │   │   └── SuccessPage.jsx
│   │   │   ├── Forms/
│   │   │   │   ├── StudentIdForm.jsx
│   │   │   │   ├── OtpForm.jsx
│   │   │   │   └── BallotForm.jsx
│   │   │   └── UI/
│   │   │       ├── CandidateCard.jsx
│   │   │       ├── PositionSection.jsx
│   │   │       └── VoteReview.jsx
│   │   ├── Admin/
│   │   │   ├── Dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ElectionStats.jsx
│   │   │   │   └── RecentActivity.jsx
│   │   │   ├── Elections/
│   │   │   │   ├── ElectionList.jsx
│   │   │   │   ├── ElectionForm.jsx
│   │   │   │   └── ElectionControl.jsx
│   │   │   ├── Candidates/
│   │   │   │   ├── CandidateList.jsx
│   │   │   │   └── CandidateForm.jsx
│   │   │   ├── Voters/
│   │   │   │   ├── VoterList.jsx
│   │   │   │   └── ImportForm.jsx
│   │   │   └── Results/
│   │   │       └── ResultsView.jsx
│   │   ├── Common/
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   └── Layout/
│   │       ├── StudentLayout.jsx
│   │       └── AdminLayout.jsx
│   ├── pages/
│   │   ├── StudentPages/
│   │   │   ├── index.jsx
│   │   │   ├── login.jsx
│   │   │   ├── ballot.jsx
│   │   │   └── success.jsx
│   │   ├── AdminPages/
│   │   │   ├── index.jsx
│   │   │   ├── elections.jsx
│   │   │   ├── candidates.jsx
│   │   │   ├── voters.jsx
│   │   │   └── results.jsx
│   │   └── 404.jsx
│   ├── services/
│   │   ├── api.js           # HTTP client
│   │   ├── authService.js   # Auth API calls
│   │   ├── votingService.js # Voting API calls
│   │   ├── adminService.js  # Admin API calls
│   │   └── storage.js       # Session storage
│   ├── hooks/
│   │   ├── useAuth.js       # Auth logic
│   │   ├── useElection.js   # Election status
│   │   ├── useVoting.js     # Voting state
│   │   ├── useFetch.js      # Generic fetch hook
│   │   └── useLocalStorage.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ElectionContext.jsx
│   │   └── VotingContext.jsx
│   ├── styles/
│   │   ├── index.css
│   │   ├── variables.css
│   │   ├── components.css
│   │   ├── responsive.css
│   │   └── animations.css
│   ├── utils/
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   ├── constants.js
│   │   ├── api-errors.js
│   │   └── storage-keys.js
│   ├── App.jsx
│   └── main.jsx
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── images/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.js
├── package.json
├── vite.config.js
└── .env.example
```

## Database Migrations

Run migrations to create database schema:

```bash
cd backend

# Run all pending migrations
php artisan migrate

# Create specific tables
php artisan migrate --path=/database/migrations/2024_01_01_000000_create_users_table.php

# Rollback last migration
php artisan migrate:rollback

# Rollback all
php artisan migrate:reset
```

## Database Seeders

Run seeders to populate test data:

```bash
cd backend

# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=AdminSeeder

# Seed in production (prompts for confirmation)
php artisan db:seed --force
```

## Code Standards

### PHP (Backend)

- Follow PSR-12 coding standards
- Use PHP 8.2+ features (typed properties, named arguments, etc.)
- Use Laravel conventions
- Write meaningful variable/function names
- Add docblocks to all public methods
- Keep methods small (< 30 lines)

Example:

```php
/**
 * Request a verification code for student
 *
 * @param string $studentId
 * @return array
 * @throws StudentNotFoundException
 * @throws AlreadyVotedException
 */
public function requestCode(string $studentId): array
{
    $student = $this->studentService->findByStudentId($studentId);
    
    if (!$student->is_eligible) {
        throw new StudentIneligibleException();
    }
    
    if ($student->has_voted) {
        throw new AlreadyVotedException();
    }
    
    $code = $this->authService->generateOtpCode();
    
    return [
        'success' => true,
        'expires_in_seconds' => 300
    ];
}
```

### JavaScript/React (Frontend)

- Use functional components with hooks
- Use descriptive component names
- PropTypes or TypeScript for type checking
- JSDoc for complex functions
- Meaningful variable names
- Keep components focused (single responsibility)

Example:

```jsx
/**
 * CandidateCard - Displays a single candidate with selection option
 * 
 * @param {Object} props
 * @param {number} props.id - Candidate ID
 * @param {string} props.name - Candidate name
 * @param {string} props.intake - Candidate intake (January/September)
 * @param {string} props.manifesto - Candidate manifesto
 * @param {Function} props.onSelect - Callback when candidate is selected
 * @param {boolean} props.isSelected - Whether candidate is currently selected
 */
function CandidateCard({ 
    id, 
    name, 
    intake, 
    manifesto, 
    onSelect, 
    isSelected 
}) {
    return (
        <div className="candidate-card">
            <h3>{name}</h3>
            <p className="intake">{intake} Intake</p>
            <p className="manifesto">{manifesto}</p>
            <button 
                onClick={() => onSelect(id)}
                className={isSelected ? 'selected' : ''}
            >
                {isSelected ? 'Selected' : 'Select'}
            </button>
        </div>
    );
}

CandidateCard.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    intake: PropTypes.oneOf(['January', 'September']).isRequired,
    manifesto: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired
};
```

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/VotingTest.php

# Run with coverage report
php artisan test --coverage

# Run tests matching pattern
php artisan test --filter=VotingTest
```

Example test:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Student;
use App\Models\Election;

class VotingTest extends TestCase
{
    public function test_student_can_submit_valid_vote()
    {
        $student = Student::factory()->create();
        $election = Election::factory()->create();
        
        $response = $this->post('/api/vote', [
            'votes' => [
                ['position_id' => 1, 'candidate_id' => 10],
                ['position_id' => 2, 'candidate_id' => 12],
            ]
        ]);
        
        $response->assertStatus(200);
        $this->assertTrue($student->refresh()->has_voted);
    }
    
    public function test_student_cannot_vote_twice()
    {
        $student = Student::factory()->voted()->create();
        
        $response = $this->post('/api/vote', [
            'votes' => [/* ... */]
        ]);
        
        $response->assertStatus(409);
    }
}
```

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- CandidateCard.test.jsx
```

Example test:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateCard from './CandidateCard';

describe('CandidateCard', () => {
    test('renders candidate information', () => {
        render(
            <CandidateCard
                id={1}
                name="Test Candidate"
                intake="January"
                manifesto="Test manifesto"
                onSelect={() => {}}
                isSelected={false}
            />
        );
        
        expect(screen.getByText('Test Candidate')).toBeInTheDocument();
        expect(screen.getByText('January Intake')).toBeInTheDocument();
    });
    
    test('calls onSelect when select button is clicked', () => {
        const onSelect = jest.fn();
        render(
            <CandidateCard
                id={1}
                name="Test Candidate"
                intake="January"
                manifesto="Test manifesto"
                onSelect={onSelect}
                isSelected={false}
            />
        );
        
        fireEvent.click(screen.getByText('Select'));
        expect(onSelect).toHaveBeenCalledWith(1);
    });
});
```

## Debugging

### Backend Debugging

```php
// Log messages
Log::info('Voter ID: ' . $student_id);
Log::debug('Current time: ' . now());

// Dump and stop
dd($variable);  // Dump and die

// Peek at data without stopping
dump($variable);

// Use storage logs
tail -f storage/logs/laravel.log
```

### Frontend Debugging

```javascript
// Console logging
console.log('Vote state:', votes);
console.error('API Error:', error);

// React DevTools Chrome Extension
// - Inspect component hierarchy
// - View props and state
// - Trace re-renders

// Network tab in DevTools
// - Monitor API calls
// - Check request/response headers
// - Inspect payloads
```

## Common Development Tasks

### Add a New Endpoint

1. Create controller method
2. Define route in routes/api.php
3. Add request validation class
4. Create corresponding frontend service call
5. Add component to consume the endpoint
6. Write tests

### Add a New Database Field

1. Create migration: `php artisan make:migration add_field_to_table`
2. Define the field in migration
3. Update model
4. Update seeders if needed
5. Run migration: `php artisan migrate`

### Debug Authentication Issues

```php
// In controller
$session = request()->session();
Log::debug('Session data:', $session->all());

// Check auth status
if (!Auth::check()) {
    Log::warning('User not authenticated');
}
```

### Debug Voting Issues

```php
// Trace vote submission
Log::info('Vote submission started', ['student_id' => $student_id]);
Log::info('Database transaction started');
Log::info('Vote validation passed');
Log::info('Ballot created', ['ballot_id' => $ballot->id]);
Log::info('Votes inserted');
Log::info('Database transaction committed');
```

## Performance Tips

- Use eager loading: `Student::with('election')->get()`
- Implement pagination: `Student::paginate(50)`
- Cache election data: `Cache::remember('election', 3600, fn()...)`
- Use database indexes on frequently queried fields
- Minimize API calls from frontend
- Lazy load components in React

## Deployment

See deployment documentation for:
- Server setup
- Environment configuration
- Database backup procedures
- HTTPS configuration
- Docker deployment
