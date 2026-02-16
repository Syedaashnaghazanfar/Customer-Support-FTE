# TechCorp ProjectHub - Product Documentation

## Getting Started

### Creating Your Account
1. Visit https://app.techcorp.io/signup
2. Enter your email, name, and password
3. Verify your email by clicking the link sent to your inbox
4. Set up your organization name and invite team members

### Password Reset
1. Go to https://app.techcorp.io/forgot-password
2. Enter your registered email address
3. Check your inbox for a reset link (valid for 24 hours)
4. Click the link and create a new password (minimum 8 characters, including one number and one special character)

**Common Issue:** If you don't receive the reset email, check your spam/junk folder. Add support@techcorp.io to your contacts.

---

## Task Management

### Creating Tasks
1. Navigate to your project board
2. Click the "+" button or press "N" as keyboard shortcut
3. Enter task title (required) and description (optional, supports Markdown)
4. Set assignee, due date, priority (Low/Medium/High/Critical), and labels

### Task Views
- **Kanban Board:** Drag and drop tasks between columns (To Do → In Progress → Review → Done)
- **List View:** Sortable table with filters and bulk actions
- **Gantt Chart:** Timeline view with dependencies (Professional plan and above)
- **Calendar View:** See tasks by due date in monthly/weekly view

### Task Statuses
| Status | Description |
|--------|-------------|
| Open | Newly created, not yet started |
| In Progress | Actively being worked on |
| In Review | Completed, awaiting review |
| Done | Completed and approved |
| Blocked | Cannot proceed due to dependency |
| Archived | No longer active |

### Subtasks
- Click "Add Subtask" within any task
- Subtasks have their own assignee and due date
- Parent task progress bar shows subtask completion percentage

### Task Templates
- Save any task as a template: Task menu → "Save as Template"
- Apply templates when creating new tasks: "+" → "From Template"
- Organization-wide templates available in Settings → Templates

---

## Team Collaboration

### Real-time Chat
- **Project Chat:** Each project has a dedicated chat channel
- **Direct Messages:** One-on-one messaging with any team member
- **Group Chat:** Create custom chat groups
- **File Sharing:** Drag and drop files (up to 50 MB per file)
- **@Mentions:** Tag team members to notify them

### Comments & Discussions
- Add comments to any task
- Use threaded replies for organized discussions
- Format comments with Markdown (bold, italic, code blocks, links)
- React to comments with emoji

### Notifications
- **In-app:** Bell icon shows unread notifications
- **Email:** Configurable email digest (real-time / daily / weekly)
- **Mobile Push:** Available on iOS and Android apps
- **Settings:** Customize in Profile → Notification Preferences

---

## Integrations

### Slack Integration
1. Go to Settings → Integrations → Slack
2. Click "Connect to Slack"
3. Authorize TechCorp in your Slack workspace
4. Select which channels receive project updates

**Features:** Task creation from Slack, status updates in channels, slash commands (/techcorp)

### GitHub Integration
1. Go to Settings → Integrations → GitHub
2. Authenticate with your GitHub account
3. Select repositories to link
4. Map GitHub issues to TechCorp tasks

**Features:** Auto-link commits to tasks, PR status in task view, branch tracking

### Google Workspace
1. Go to Settings → Integrations → Google
2. Sign in with your Google account
3. Grant permissions for Calendar and Drive

**Features:** Sync deadlines to Google Calendar, attach Google Drive files to tasks

### Microsoft 365
1. Go to Settings → Integrations → Microsoft 365
2. Sign in with your Microsoft account

**Features:** Teams notifications, OneDrive file attachments, Outlook calendar sync

---

## API Documentation

### Authentication
All API requests require an API key in the header:
```
Authorization: Bearer YOUR_API_KEY
```

Generate API keys: Settings → API → Create New Key

**Rate Limits:**
- Free plan: 100 requests/hour
- Starter: 1,000 requests/hour
- Professional: 10,000 requests/hour
- Enterprise: Custom

### Common Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/projects | List all projects |
| POST | /api/v1/projects | Create a project |
| GET | /api/v1/tasks | List tasks (with filters) |
| POST | /api/v1/tasks | Create a task |
| PUT | /api/v1/tasks/:id | Update a task |
| DELETE | /api/v1/tasks/:id | Delete a task |

### Error Codes
| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Rate Limited - Too many requests |
| 500 | Server Error - Contact support |

---

## Time Tracking

### Starting a Timer
1. Open any task
2. Click the clock icon or press "T"
3. Timer starts counting
4. Click again to stop and log time

### Manual Time Entry
1. Open task → "Log Time"
2. Enter hours and minutes
3. Add optional description
4. Mark as billable/non-billable

### Reports
- **Timesheet:** Weekly overview per team member
- **Project Time:** Total hours per project
- **Billable Report:** Export billable hours for invoicing (CSV/PDF)

---

## Analytics & Reporting

### Project Health Dashboard
- **Completion Rate:** Percentage of completed vs total tasks
- **Overdue Tasks:** Count and list of past-due items
- **Velocity:** Tasks completed per sprint/week
- **Burndown Chart:** Remaining work over time

### Team Performance
- Individual task completion rates
- Average time per task
- Response time on assigned tasks

### Custom Reports
1. Go to Analytics → Custom Reports
2. Select metrics, date range, and filters
3. Save as recurring report
4. Export as PDF, CSV, or schedule email delivery

---

## Account Settings

### Profile Management
- Update name, avatar, and bio: Profile → Edit
- Change email: Profile → Email (requires verification)
- Two-factor authentication: Profile → Security → Enable 2FA

### Organization Settings (Admin only)
- Manage members: Settings → Members → Add/Remove
- Set roles: Owner, Admin, Member, Guest
- Custom fields: Settings → Custom Fields
- SSO configuration: Settings → Security → SSO (Enterprise only)

### Data Export
- Export all data: Settings → Data → Export (JSON/CSV)
- Available for all plan levels
- Processing time: Up to 24 hours for large datasets

### Account Deletion
- Contact support@techcorp.io for account deletion
- 30-day grace period before permanent deletion
- All data is purged after deletion (non-recoverable)

---

## Troubleshooting

### Common Issues

**Q: I can't log in**
A: Try resetting your password. If using SSO, contact your organization admin. Clear browser cache and cookies. Try a different browser.

**Q: Tasks not syncing**
A: Refresh the page (Ctrl+R / Cmd+R). Check your internet connection. If using the mobile app, pull down to refresh. If issue persists, clear app cache.

**Q: Notifications not working**
A: Check Profile → Notification Preferences. Ensure browser notifications are enabled. Check spam folder for email notifications. Reinstall mobile app for push notifications.

**Q: Integration not connecting**
A: Revoke and re-authorize the integration. Check that you have admin permissions. Ensure the third-party service is not experiencing outages.

**Q: File upload failure**
A: Maximum file size is 50 MB. Supported formats: images, PDFs, documents, spreadsheets. Check your storage quota in Settings → Storage.

**Q: Performance issues**
A: Clear browser cache. Disable browser extensions. Try incognito/private mode. Check https://status.techcorp.io for service status.
