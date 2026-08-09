# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Flask backend and combine with React build
FROM python:3.10-slim
WORKDIR /app

# Kopiranje i instalacija Python zavisnosti
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Kopiranje backend koda
COPY backend/ .

# Kopiranje izgrađenog React aplikacijskog koda u static folder Flask-a
COPY --from=frontend-build /app/frontend/build ./static

EXPOSE 5000

ENV FLASK_ENV=production

CMD ["python", "app.py"]