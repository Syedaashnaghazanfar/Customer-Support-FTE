-- =============================================================================
-- Customer Success FTE — PostgreSQL Schema
-- Database: fte_db | Extension: pgvector
-- This schema IS the CRM system
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================================
-- CUSTOMERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    primary_email VARCHAR(255),
    primary_phone VARCHAR(50),
    company VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    sentiment_avg FLOAT DEFAULT 0.0,
    total_interactions INT DEFAULT 0,
    preferred_channel VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CUSTOMER IDENTIFIERS (for cross-channel resolution)
-- =============================================================================
CREATE TABLE IF NOT EXISTS customer_identifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    identifier_type VARCHAR(20) NOT NULL,  -- 'email', 'phone', 'whatsapp'
    identifier_value VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier_type, identifier_value)
);

-- =============================================================================
-- CONVERSATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,  -- 'email', 'whatsapp', 'web_form'
    status VARCHAR(20) DEFAULT 'active',  -- 'active', 'resolved', 'escalated'
    subject VARCHAR(500),
    sentiment_score FLOAT DEFAULT 0.0,
    message_count INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- MESSAGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,  -- 'inbound', 'outbound'
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text',
    sentiment_score FLOAT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TICKETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    conversation_id UUID REFERENCES conversations(id),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    subject VARCHAR(500),
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium',  -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'open',  -- 'open', 'in_progress', 'escalated', 'resolved', 'closed'
    assigned_to VARCHAR(255),
    escalation_reason TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- KNOWLEDGE BASE (with vector embeddings for semantic search)
-- =============================================================================
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    embedding vector(1536),  -- OpenAI/Groq embedding dimension
    source_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CHANNEL CONFIGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS channel_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel VARCHAR(20) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}',
    max_message_length INT DEFAULT 1000,
    rate_limit_per_minute INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- AGENT METRICS
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20),
    value FLOAT NOT NULL,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Customer lookups
CREATE INDEX IF NOT EXISTS idx_customer_identifiers_value ON customer_identifiers(identifier_value);
CREATE INDEX IF NOT EXISTS idx_customer_identifiers_type_value ON customer_identifiers(identifier_type, identifier_value);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(primary_email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(primary_phone);

-- Conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- Message lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer ON messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Ticket lookups
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(ticket_number);

-- Knowledge base semantic search
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding ON knowledge_base 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- Metrics
CREATE INDEX IF NOT EXISTS idx_metrics_type ON agent_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_channel ON agent_metrics(channel);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded ON agent_metrics(recorded_at);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert default channel configurations
INSERT INTO channel_configs (channel, enabled, config, max_message_length) VALUES
    ('email', TRUE, '{"tone": "professional", "format": "detailed", "greeting": "Hi {name},", "closing": "Best regards,\nTechCorp Support Team"}', 2000),
    ('whatsapp', TRUE, '{"tone": "friendly", "format": "concise", "greeting": "Hi {name}! 👋", "closing": "", "max_messages": 2}', 1600),
    ('web_form', TRUE, '{"tone": "semi-formal", "format": "moderate", "greeting": "Thank you for reaching out, {name}.", "closing": "If you need further assistance, please don''t hesitate to ask."}', 1000)
ON CONFLICT (channel) DO NOTHING;

-- Insert sample knowledge base articles
INSERT INTO knowledge_base (title, content, category, tags) VALUES
    ('Getting Started - Account Setup', 'Visit app.techcorp.io/signup to create your account. Enter your email, name, and password. Verify your email by clicking the link sent to your inbox.', 'getting_started', ARRAY['account', 'signup', 'registration']),
    ('Password Reset', 'Go to app.techcorp.io/forgot-password. Enter your registered email. Check your inbox for a reset link (valid for 24 hours). If you don''t receive the email, check spam/junk folder.', 'account', ARRAY['password', 'reset', 'login', 'access']),
    ('Task Management - Creating Tasks', 'Navigate to your project board. Click the "+" button or press "N". Enter task title (required) and description. Set assignee, due date, priority, and labels.', 'tasks', ARRAY['task', 'create', 'kanban', 'board']),
    ('Task Views', 'Kanban Board: Drag and drop tasks between columns. List View: Sortable table with filters. Gantt Chart: Timeline view with dependencies (Professional+). Calendar View: Tasks by due date.', 'tasks', ARRAY['kanban', 'list', 'gantt', 'calendar', 'view']),
    ('Slack Integration', 'Go to Settings → Integrations → Slack. Click Connect to Slack. Authorize TechCorp in your Slack workspace. Select notification channels. Supports task creation from Slack and slash commands.', 'integrations', ARRAY['slack', 'integration', 'connect']),
    ('GitHub Integration', 'Settings → Integrations → GitHub. Authenticate with GitHub. Select repositories to link. Auto-links commits to tasks, shows PR status in task view.', 'integrations', ARRAY['github', 'integration', 'git', 'repository']),
    ('Time Tracking', 'Open any task and click the clock icon or press "T" to start timer. Click again to stop and log time. Manual entry: Open task → Log Time → Enter hours. Reports available in Analytics → Timesheet.', 'time_tracking', ARRAY['time', 'tracking', 'timer', 'hours']),
    ('File Upload Limits', 'Maximum file size: 50 MB per file. Supported formats: images, PDFs, documents, spreadsheets. Check storage quota: Settings → Storage.', 'general', ARRAY['file', 'upload', 'size', 'limit', 'storage']),
    ('Two-Factor Authentication', 'Enable 2FA: Profile → Security → Enable 2FA. Scan QR code with authenticator app. Enter verification code to confirm setup.', 'account', ARRAY['2fa', 'security', 'authentication', 'two-factor']),
    ('API Rate Limits', 'Free: 100 req/hr. Starter: 1,000 req/hr. Professional: 10,000 req/hr. Enterprise: Custom. Generate API keys at Settings → API. Rate limited requests return HTTP 429.', 'api', ARRAY['api', 'rate', 'limit', '429', 'key']),
    ('Notification Settings', 'Configure at Profile → Notification Preferences. Options: In-app (bell icon), Email (real-time/daily/weekly digest), Mobile Push (iOS/Android). Customize per project.', 'general', ARRAY['notification', 'email', 'push', 'alert']),
    ('Data Export', 'Export all data: Settings → Data → Export. Formats: JSON, CSV. Processing time: Up to 24 hours for large datasets. Available on all plan levels.', 'account', ARRAY['export', 'data', 'csv', 'json', 'download']),
    ('Mobile App', 'Available for iOS and Android with full functionality. Download from App Store or Google Play. Sign in with existing credentials. Supports push notifications.', 'general', ARRAY['mobile', 'app', 'ios', 'android', 'phone']),
    ('Keyboard Shortcuts', 'N: New task. T: Start timer. /: Search. ?: Show all shortcuts. Ctrl+Enter: Submit. Tab: Next field. Escape: Close dialog.', 'general', ARRAY['keyboard', 'shortcut', 'hotkey']),
    ('Troubleshooting Login Issues', 'Clear browser cache and cookies. Try incognito/private mode. Disable browser extensions. Check status.techcorp.io for outages. If using SSO, contact your organization admin.', 'troubleshooting', ARRAY['login', 'error', 'access', 'can''t login'])
ON CONFLICT DO NOTHING;
