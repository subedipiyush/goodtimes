# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3-slim

EXPOSE 8080

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Install pip requirements
COPY requirements.txt .
RUN python -m pip install -r requirements.txt

# Set NLTK_DATA environment variable to a writable path inside the container
ENV NLTK_DATA=/usr/local/share/nltk_data

# Create the NLTK data directory if it doesn't exist
RUN mkdir -p ${NLTK_DATA}

# Download NLTK VADER lexicon
# This is crucial for the SentimentAnalyzer to work
RUN python -m nltk.downloader -d ${NLTK_DATA} vader_lexicon

WORKDIR /app
COPY . /app

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
