import os

import dramatiq
from dramatiq.brokers.rabbitmq import RabbitmqBroker
from dramatiq.brokers.redis import RedisBroker

broker_url = os.environ["DRAMATIQ_BROKER_URL"]

if broker_url.startswith("amqp://"):
    dramatiq.set_broker(RabbitmqBroker(url=broker_url))
else:
    dramatiq.set_broker(RedisBroker(url=broker_url))