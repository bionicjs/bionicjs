import os

import redis
from rq import Queue

redis_conn = redis.Redis.from_url(os.environ["REDIS_URL"])

queue = Queue(connection=redis_conn)