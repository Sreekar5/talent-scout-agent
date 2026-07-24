# Use Python 3.11 slim — lightweight base image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements first (Docker caches this layer — speeds up rebuilds)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Create the data directory
RUN mkdir -p /app/data

# Expose port 8000 (where FastAPI will run)
EXPOSE 8000

# Command to start the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]