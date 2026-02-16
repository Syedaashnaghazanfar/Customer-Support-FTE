"""
Load Test — Locust configuration for 24-hour stress testing.
Run with: locust -f tests/load_test.py --host=http://localhost:8000
"""

import json
import random
from locust import HttpUser, task, between, tag


class CustomerSuccessUser(HttpUser):
    """Simulates customer interactions across all channels."""
    
    wait_time = between(1, 5)

    NAMES = ["Alice Smith", "Bob Johnson", "Carol Williams", "David Brown", "Eva Martinez",
             "Frank Lee", "Grace Kim", "Henry Zhang", "Ivy Thompson", "Jack Davis"]
    
    SUBJECTS = [
        "Cannot login to my account",
        "How to add team members?",
        "Integration with Slack not working",
        "Need help with Gantt chart",
        "Feature request: dark mode",
        "Bug: tasks not saving",
        "Billing question",
        "Password reset not working",
        "API rate limit hit",
        "Mobile app crashing",
    ]

    CATEGORIES = ["general", "technical", "billing", "bug_report", "feedback"]
    PRIORITIES = ["low", "medium", "high", "critical"]

    def _random_email(self) -> str:
        name = random.choice(self.NAMES).lower().replace(" ", ".")
        domain = random.choice(["gmail.com", "company.com", "corp.io", "example.org"])
        return f"{name}.{random.randint(1,999)}@{domain}"

    @tag("web_form")
    @task(5)
    def submit_web_form(self):
        """Submit a support form (most common action)."""
        payload = {
            "name": random.choice(self.NAMES),
            "email": self._random_email(),
            "subject": random.choice(self.SUBJECTS),
            "category": random.choice(self.CATEGORIES),
            "priority": random.choice(self.PRIORITIES),
            "message": f"I need help with {random.choice(self.SUBJECTS)}. "
                       f"This has been happening since yesterday and affects my workflow. "
                       f"I'm on the Professional plan. Please help!",
        }
        self.client.post("/support/submit", json=payload, name="/support/submit")

    @tag("health")
    @task(2)
    def health_check(self):
        """Check API health."""
        self.client.get("/health", name="/health")

    @tag("ticket")
    @task(3)
    def check_ticket_status(self):
        """Look up a ticket status."""
        ticket_num = f"TICKET-{random.randint(1, 100):04d}"
        self.client.get(f"/support/ticket/{ticket_num}", name="/support/ticket/[id]")

    @tag("metrics")
    @task(1)
    def get_metrics(self):
        """Fetch dashboard metrics."""
        hours = random.choice([1, 6, 24, 72])
        self.client.get(f"/metrics/channels?hours={hours}", name="/metrics/channels")

    @tag("customer")
    @task(2)
    def customer_lookup(self):
        """Look up customer history."""
        self.client.post(
            "/customers/lookup",
            json={"email": self._random_email()},
            name="/customers/lookup",
        )
