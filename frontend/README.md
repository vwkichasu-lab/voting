# Frontend - React Application

React-based student voting interface and admin dashboard.

## Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Student/
│   │   │   ├── ElectionWelcome.jsx
│   │   │   ├── StudentLogin.jsx
│   │   │   ├── VerificationCode.jsx
│   │   │   ├── Ballot.jsx
│   │   │   ├── BallotReview.jsx
│   │   │   └── SuccessConfirmation.jsx
│   │   ├── Admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ElectionManager.jsx
│   │   │   ├── CandidateManager.jsx
│   │   │   ├── VoterManager.jsx
│   │   │   └── ResultsView.jsx
│   │   ├── Common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   └── Layout/
│   │       └── MainLayout.jsx
│   ├── pages/
│   │   ├── StudentPages/
│   │   ├── AdminPages/
│   │   └── ErrorPages/
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── votingService.js
│   │   └── adminService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useElection.js
│   │   └── useVoting.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ElectionContext.jsx
│   │   └── VotingContext.jsx
│   ├── styles/
│   │   ├── index.css
│   │   ├── variables.css
│   │   └── responsive.css
│   ├── utils/
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   └── constants.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
├── vite.config.js
└── .env.example
```

## Key Features

- Mobile-responsive design
- Real-time election status updates
- Secure session management
- OTP verification flow
- Ballot review interface
- Admin dashboard
- Results visualization

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Testing

```bash
npm run test
```
