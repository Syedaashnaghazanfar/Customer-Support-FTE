# Knowledge Retrieval Skill

## Purpose
Search the TechCorp product knowledge base to find accurate answers to customer questions. This skill powers the AI agent's ability to provide helpful, factual responses.

## When to Use
- Customer asks a "how-to" question about ProductHub features
- Customer needs troubleshooting steps
- Customer asks about integrations, limits, or capabilities
- Customer references a specific feature by name

## Inputs
- `query` (string): The customer's question or keywords
- `category` (string, optional): Filter by category — "getting_started", "tasks", "collaboration", "integrations", "api", "time_tracking", "analytics", "troubleshooting", "account"

## Process
1. Parse the customer message to extract the core question
2. Generate search embeddings from the query
3. Search the knowledge_base table using pgvector similarity search
4. Return top 3 most relevant results with similarity scores
5. If similarity score < 0.5 for all results, flag as "no confident answer found"

## Output
- `results` (array): List of matching knowledge entries with:
  - `title`: Article title
  - `content`: Relevant content excerpt
  - `similarity`: Confidence score (0.0 - 1.0) 
  - `url`: Link to documentation page
- `confident`: boolean — true if best match > 0.6 similarity

## Error Handling
- If no results found: Respond with general guidance and offer to escalate
- If database connection fails: Use cached/static product-docs.md as fallback
- If query is too vague: Ask customer to provide more details

## Examples

### Input
> "How do I add team members to my project?"

### Expected Output
```json
{
  "results": [
    {
      "title": "Creating Your Account - Team Setup",
      "content": "Navigate to Settings → Members → Add/Remove. Set roles: Owner, Admin, Member, Guest.",
      "similarity": 0.89,
      "url": "/docs/getting-started#team-setup"
    }
  ],
  "confident": true
}
```

## Notes
- Always cite the source documentation when providing answers
- If the answer involves pricing, DO NOT answer — escalate to human
- If the answer involves account-specific data (billing, usage stats), escalate to human
