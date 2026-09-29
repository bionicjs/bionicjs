import os

from celery import Celery

celery_app = Celery(
    "{{appName}}",
    broker=os.environ["CELERY_BROKER_URL"],
)

celery_app.autodiscover_tasks()