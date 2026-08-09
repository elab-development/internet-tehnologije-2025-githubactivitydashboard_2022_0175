# 1. build frontenda
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build --if-present

# 2. python backend + staticki frontend
FROM python:3.10-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ .
COPY --from=frontend-build /app/frontend/build ./static

EXPOSE 5000

CMD ["python", "app.py"]