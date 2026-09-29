## Workers {#workers}

The `jobs/` folder is Python. Each file defines tasks that can be enqueued
from TypeScript and executed by a worker process.

```
jobs/
├── __init__.py
├── tasks.py         # Task definitions
├── workers.py       # Worker entrypoint
└── schedules.py     # Scheduled tasks
```

## The flow {#flow}

1. TypeScript enqueues a task: `jobs.enqueue("process_data", args=[id])`
2. The broker (Redis/RabbitMQ) receives the message
3. A Python worker picks it up and executes the function
4. Results are stored or returned

```python # jobs/tasks.py
from bionicjs import jobs

@jobs.task
def process_data(record_id: int) -> dict:
    """Process a data record."""
    # Your processing logic here
    return {"status": "done", "id": record_id}
```

## Why Python workers {#why-python}

Background jobs are Python because they often need the same AI/ML
libraries as the `ai/` folder. Celery, RQ, and Dramatiq are all Python
native — they integrate with NumPy, pandas, scikit-learn, and your AI
models without FFI overhead.
