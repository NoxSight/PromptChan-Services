FROM python:3.12-alpine as builder

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/home/appuser/.local/bin:$PATH

WORKDIR /app

# Copy Python site-packages from builder to non-root user directory
COPY --from=builder /root/.local /home/appuser/.local

# Copy project files
COPY requirements.txt .
COPY app ./app
COPY alembic.ini .
COPY project_description.md .
COPY .gitignore .

# Create non-root user and fix permissions
RUN adduser -D -s /bin/sh appuser && \
    chown -R appuser:appuser /app && \
    chown -R appuser:appuser /home/appuser/.local && \
    chmod -R +x /home/appuser/.local/bin

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]