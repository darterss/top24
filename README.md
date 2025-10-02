# AI Project Tracker

MVP-продукт для отслеживания проектов с AI-анализом, состоящий из Telegram-бота, веб-панели администратора и интеграции с AI.

## 🚀 Функционал

### Telegram Bot
- `/start` — регистрация пользователя (имя + email)
- `/idea <название>` — создание идеи с AI roadmap (5-7 задач)
- `/projects` — список идей пользователя
- `/update <идея> <задача> <статус>` — обновление статуса задачи
- `/report` — отчёт с % выполненных задач и AI-комментарием
- `/help` — справка по командам

### Веб-панель (Admin)
- Авторизация администратора (пароль: `admin123`)
- Таблица пользователей и их идей
- Возможность отмечать задачи как выполненные
- Кнопка «AI Review» — отправка идеи в AI для анализа прогресса

### Backend
- NestJS + Prisma + PostgreSQL
- Redis-кэш для AI-запросов
- AI-трекер (каждые 24 часа в 10:00 UTC отправляет статус-апдейт)

## 🛠️ Технологии

- **Backend**: NestJS, Prisma, PostgreSQL, Redis
- **Bot**: Node.js, node-telegram-bot-api
- **Web**: Next.js, React, SWR
- **AI**: OpenAI GPT-3.5-turbo
- **Deploy**: Docker, Docker Compose

## 📋 Требования

- Docker & Docker Compose
- OpenAI API ключ
- Telegram Bot Token

## 🚀 Быстрый старт

### 1. Клонирование и настройка

```bash
git clone https://github.com/darterss/top24.git
cd top24
cp env.example .env
```

### 2. Настройка переменных окружения

Отредактируйте `.env` файл:

```bash
# OpenAI API Key (обязательно)
OPENAI_API_KEY=sk-your-openai-key-here

# Telegram Bot Token (обязательно)
BOT_TOKEN=your-telegram-bot-token-here

# Остальные настройки (по умолчанию)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/top24?schema=public
REDIS_HOST=redis
REDIS_PORT=6379
PORT=3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
```

### 3. Запуск

Перед запуском убедитесь, что у вас включён VPN, если вы находитесь в России и других заблокированных странах, чтобы работал ChatGPT

```bash
# Запуск всех сервисов
docker compose up --build

# Или в фоновом режиме
docker compose up --build -d
```

### 4. Проверка

- **Backend API**: http://localhost:3001/api
- **Admin Panel**: http://localhost:3000 (пароль: `admin123`)
- **Telegram Bot**: Найдите вашего бота и отправьте `/start`

## 📱 Использование

### Для пользователей (Telegram Bot)

1. **Регистрация**: `/start` → введите имя и email
2. **Создание проекта**: `/idea Мой новый проект`
3. **Просмотр проектов**: `/projects`
4. **Обновление задач**: `/update 1 2 done` (1 - номер проекта 2 - номер задачи в проекте)
5. **Отчёт**: `/report`
6. **Информация о командах**: `/help`

### Для администраторов (Web Panel)

1. Откройте http://localhost:3000
2. Введите пароль: `admin123`
3. Просматривайте пользователей и их проекты
4. Отмечайте задачи как выполненные
5. Используйте "AI Review" для анализа

## 🔧 Управление

### Полезные команды

```bash
# Логи
docker compose logs -f

# Перезапуск
docker compose restart

# Обновление
docker compose down
docker compose up --build -d

# Очистка
docker compose down -v
```

### Мониторинг

```bash
# Статус сервисов
docker compose ps

# Использование ресурсов
docker stats

# Логи конкретного сервиса
docker compose logs backend
docker compose logs bot
docker compose logs web
```

## 🐛 Troubleshooting

### Частые проблемы

1. **Bot не отвечает**:
   - Проверьте `BOT_TOKEN` в `.env`
   - Убедитесь, что бот запущен: `docker compose logs bot`

2. **AI не работает**:
   - Проверьте `OPENAI_API_KEY` в `.env`
   - Проверьте логи: `docker compose logs backend`

3. **База данных**:
   - Проверьте подключение: `docker compose logs postgres`
   - Сброс БД: `docker compose down -v && docker compose up`

4. **Порты заняты**:
   - Измените порты в `docker-compose.yml`
   - Или остановите конфликтующие сервисы

### Логи и отладка

```bash
# Все логи
docker compose logs

# Конкретный сервис
docker compose logs backend
docker compose logs bot
docker compose logs web

# Следить за логами в реальном времени
docker compose logs -f backend
```

## 📊 Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │    │   Admin Panel   │    │   AI Tracker    │
│                 │    │                 │    │                 │
│  - /start       │    │  - Auth         │    │  - Daily 10:00  │
│  - /idea        │    │  - Users table  │    │  - AI Reports   │
│  - /projects    │    │  - Task update  │    │  - Telegram     │
│  - /update      │    │  - AI Review    │    │                 │
│  - /report      │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │        Backend API        │
                    │                           │
                    │  - NestJS + Prisma        │
                    │  - PostgreSQL            │
                    │  - Redis Cache           │
                    │  - OpenAI Integration    │
                    │  - Cron Jobs             │
                    └───────────────────────────┘
```


