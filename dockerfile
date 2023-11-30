FROM python:3.8-slim

RUN useradd --create-home --shell /bin/bash app_user
WORKDIR /home/app_user

RUN apt-get update && apt-get install -y nano

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

USER app_user

COPY app ./

CMD ["bash"]
