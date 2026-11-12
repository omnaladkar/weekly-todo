import { getRepository } from './repository/index.js';

const repo = await getRepository();
const existing = await repo.list('');

if (existing.length > 0) {
  console.log(`Seed skipped: ${existing.length} task(s) already exist.`);
  process.exit(0);
}

const today = new Date();
const mondayOffset = (today.getDay() + 6) % 7;
const monday = new Date(today);
monday.setDate(today.getDate() - mondayOffset);
monday.setHours(0, 0, 0, 0);

const at = (dayOffset, hour, minute = 0) => {
  const date = new Date(monday);
  date.setDate(monday.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const samples = [
  {
    title: 'Team stand-up notes',
    description: 'Share blockers and today’s focus with the squad.',
    dueAt: at(0, 10, 0),
    priority: 'medium',
    status: 'completed',
  },
  {
    title: 'Finish dashboard API',
    description: 'Add weekly summary endpoints and wire up validation.',
    dueAt: at(0, 15, 30),
    priority: 'high',
    status: 'in_progress',
  },
  {
    title: 'Review pull requests',
    description: 'Two PRs waiting on frontend feedback.',
    dueAt: at(1, 11, 0),
    priority: 'medium',
    status: 'in_progress',
  },
  {
    title: 'Gym session',
    description: 'Leg day — don’t skip it.',
    dueAt: at(2, 18, 30),
    priority: 'low',
    status: 'completed',
  },
  {
    title: 'Write release notes',
    description: 'Summarise the v1.4 changes for the changelog.',
    dueAt: at(-3, 16, 0),
    priority: 'medium',
    status: 'completed',
  },
  {
    title: 'Submit timesheet',
    description: 'Last week’s hours are still pending.',
    dueAt: at(-5, 17, 0),
    priority: 'low',
    status: 'completed',
  },
  {
    title: 'Plan sprint 24',
    description: 'Draft goals, estimate tickets, and book the planning call.',
    dueAt: at(7, 9, 30),
    priority: 'high',
    status: 'in_progress',
  },
  {
    title: '1:1 with manager',
    description: 'Prepare growth feedback and next-quarter goals.',
    dueAt: at(9, 14, 0),
    priority: 'medium',
    status: 'in_progress',
  },
];

for (const sample of samples) {
  await repo.create(sample);
}

console.log(`Seeded ${samples.length} demo tasks.`);
process.exit(0);
