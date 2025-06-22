# Votra - Collaborative Decision Making Platform

Votra is a real-time collaborative decision-making platform that enables groups to vote on important choices with ease. Built with modern technologies like Prisma ORM, Prisma Accelerate, Next.js, React, and server actions and better-auth Votra provides a seamless experience for creating decision rooms, casting votes, and viewing live results.

## Key Features
🔐 Secure user authentication with better-auth

🚀 Real-time collaboration with WebSockets

📊 Live vote tallies and results visualization

⏰ Time-limited voting sessions

🔗 Unique, shareable room URLs

🕵️‍♂️ Anonymous voting system

📱 Responsive design for all devices


## Technologies Used

Frontend: Next.js, React, Tailwind CSS

Backend: Next.js API routes

Database: PostgreSQL with Prisma ORM

Realtime: Prisma Accelerate, WebSockets

Authentication: better-auth

Deployment: Vercel

Styling: Tailwind CSS, Shadcn UI
## Getting Started

Follow these steps to set up and run DecisionHub on your local machine.

Prerequisites
Node.js (v18 or higher)

PostgreSQL database (I used Prisma postgresql database from the prisma console).

Prisma Accelerate account

1. Clone the repository
```bash
git clone https://github.com/okosaleo/votra.git
cd votra
```

2. Install dependencies
```bash
npm install
```
3. Set up environment variables
```env
DATABASE_URL=""
BETTER_AUTH_URL="http://localhost:3000" #Base URL of your app
BETTER_AUTH_SECRET=""
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. Set up the database
```bash
npx prisma migrate dev --name init
```

6. Start the development server
```bash
npm run dev
```
