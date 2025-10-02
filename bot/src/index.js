import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is not set');
  process.exit(1);
}

console.log('Starting bot with token:', token.substring(0, 10) + '...');
const backendUrl = process.env.BACKEND_URL || 'http://backend:3001/api';
console.log('Backend URL:', backendUrl);

const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

console.log('Bot started, waiting for messages...');

// Устанавливаем меню команд
bot.setMyCommands([
  { command: 'start', description: '🚀 Начать работу с ботом' },
  { command: 'idea', description: '💡 Создать новую идею проекта' },
  { command: 'projects', description: '📋 Показать все проекты' },
  { command: 'update', description: '✏️ Обновить статус задачи' },
  { command: 'report', description: '📊 Получить отчёт по проектам' },
  { command: 'help', description: '❓ Справка по командам' }
]);

const state = new Map();

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  state.delete(chatId);
  await bot.sendMessage(chatId, `🚀 **Добро пожаловать в AI Project Tracker!**

Этот бот поможет вам:
• 💡 Создавать идеи проектов с AI roadmap
• 📋 Отслеживать прогресс выполнения задач
• 📊 Получать умные отчёты от AI

**Для начала работы:**
Отправьте ваше имя и email через запятую:
\`Иван Иванов, ivan@example.com\`

**Доступные команды:**
• /idea <название> - Создать проект
• /projects - Мои проекты  
• /update <идея> <задача> <статус> - Обновить задачу
• /report - Отчёт по проектам
• /help - Подробная справка`, { parse_mode: 'Markdown' });
  state.set(chatId, { step: 'register' });
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const helpText = `🤖 **AI Project Tracker - Справка**

**Основные команды:**
• /start - Регистрация в системе
• /idea <название> - Создать новую идею проекта
• /projects - Показать все ваши проекты
• /update <идея> <задача> <статус> - Обновить статус задачи
• /report - Получить отчёт по всем проектам
• /help - Показать эту справку

**Примеры:**
• /idea Мой новый проект
• /update 1 2 done
• /update 2 1 in_progress

**Статусы задач:**
• TODO - К выполнению
• IN_PROGRESS - В работе  
• DONE - Выполнено

Удачи в реализации ваших идей! 🚀`;
  
  await bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const s = state.get(chatId);
  if (s?.step === 'register' && text && !text.startsWith('/')) {
    const [name, email] = text.split(',').map((t) => t.trim());
    if (!name || !email) {
      return bot.sendMessage(chatId, 'Формат: Имя Фамилия, email');
    }
    try {
      const res = await fetch(`${backendUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, telegramId: String(chatId) }),
      });
      if (!res.ok) throw new Error('registration failed');
      await bot.sendMessage(chatId, 'Готово! Используй /idea чтобы отправить идею.');
    } catch (e) {
      await bot.sendMessage(chatId, 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      state.delete(chatId);
    }
  }
});

bot.onText(/\/idea (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const title = (match?.[1] || '').trim();
  if (!title) return bot.sendMessage(chatId, 'Укажи идею: /idea Мой проект');
  try {
    let resUser = await fetch(`${backendUrl}/users/by-telegram/${chatId}`);
    let user;
    if (resUser.ok) {
      user = await resUser.json();
    } else {
      // auto-register if not found
      const fullName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || `tg_${chatId}`;
      const email = `${chatId}@telegram.local`;
      const reg = await fetch(`${backendUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, telegramId: String(chatId) }),
      });
      if (!reg.ok) throw new Error('auto-register failed');
      user = await reg.json();
    }
    const aiRes = await fetch(`${backendUrl}/ai/roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const ai = await aiRes.json();
    const create = await fetch(`${backendUrl}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, title, description: ai.description, tasks: ai.tasks ?? [] }),
    });
    const idea = await create.json();
    const tasksList = idea.tasks.map((t) => `${t.index}. ${t.title}`).join('\n');
    await bot.sendMessage(chatId, `Создано!\n${tasksList}`);
  } catch (e) {
    await bot.sendMessage(chatId, 'Ошибка создания идеи.');
  }
});

bot.onText(/\/projects/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const resUser = await fetch(`${backendUrl}/users/by-telegram/${chatId}`);
    const user = await resUser.json();
    const res = await fetch(`${backendUrl}/ideas/${user.id}`);
    const ideas = await res.json();
    const text = ideas
      .map((i, idx) => {
        // Сортируем задачи по index для правильного порядка
        const sortedTasks = i.tasks.sort((a, b) => a.index - b.index);
        return `#${idx + 1}. ${i.title}\n` + sortedTasks.map((t, taskIdx) => `  ${taskIdx + 1}. ${t.title} — ${t.status}`).join('\n');
      })
      .join('\n\n');
    await bot.sendMessage(chatId, text || 'Пока нет проектов');
  } catch {
    await bot.sendMessage(chatId, 'Ошибка запроса проектов.');
  }
});

bot.onText(/\/update (\d+) (\d+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const ideaIndex = Number(match?.[1] ?? 0);
  const taskIndex = Number(match?.[2] ?? 0);
  const statusInput = match?.[3]?.toUpperCase();
  
  // Проверяем валидность статуса
  const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
  if (!validStatuses.includes(statusInput)) {
    return bot.sendMessage(chatId, `❌ Неверный статус: "${match?.[3]}"\n\nДоступные статусы:\n• TODO\n• IN_PROGRESS\n• DONE\n\nПример: /update 1 2 done`);
  }
  
  try {
    const user = await (await fetch(`${backendUrl}/users/by-telegram/${chatId}`)).json();
    const ideas = await (await fetch(`${backendUrl}/ideas/${user.id}`)).json();
    const idea = ideas[ideaIndex - 1];
    if (!idea) return bot.sendMessage(chatId, `❌ Идея #${ideaIndex} не найдена.`);
    
    // Сортируем задачи по index для правильного порядка
    const sortedTasks = idea.tasks.sort((a, b) => a.index - b.index);
    const task = sortedTasks[taskIndex - 1];
    if (!task) return bot.sendMessage(chatId, `❌ Задача #${taskIndex} в идее "${idea.title}" не найдена.`);
    
    await fetch(`${backendUrl}/ideas/task/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusInput }),
    });
    await bot.sendMessage(chatId, `✅ Статус обновлён: "${idea.title}" - задача #${taskIndex} → ${statusInput}`);
  } catch (error) {
    console.error('Update error:', error);
    await bot.sendMessage(chatId, '❌ Ошибка обновления статуса.');
  }
});

bot.onText(/\/report/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const user = await (await fetch(`${backendUrl}/users/by-telegram/${chatId}`)).json();
    const ideas = await (await fetch(`${backendUrl}/ideas/${user.id}`)).json();
    
    if (ideas.length === 0) {
      return bot.sendMessage(chatId, '📊 У вас пока нет проектов для отчёта.');
    }
    
    let reportText = '📊 **ЕЖЕДНЕВНЫЙ ОТЧЁТ**\n\n';
    
    for (const idea of ideas) {
      // Сортируем задачи по index
      const sortedTasks = idea.tasks.sort((a, b) => a.index - b.index);
      const total = sortedTasks.length;
      const done = sortedTasks.filter(t => t.status === 'DONE').length;
      const inProgress = sortedTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const completedPercent = total > 0 ? Math.round((done / total) * 100) : 0;
      
      reportText += `🎯 **${idea.title}**\n`;
      reportText += `📈 Прогресс: ${completedPercent}% (${done}/${total} задач)\n`;
      reportText += `🔄 В работе: ${inProgress} задач\n`;
      
      // Получаем AI комментарий для этой идеи
      try {
        const aiReport = await (await fetch(`${backendUrl}/ai/review/${idea.id}`, { method: 'POST' })).json();
        reportText += `🤖 AI: ${aiReport.comment}\n`;
      } catch {
        reportText += `🤖 AI: Продолжайте работу над проектом.\n`;
      }
      
      reportText += '\n';
    }
    
    await bot.sendMessage(chatId, reportText, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Report error:', error);
    await bot.sendMessage(chatId, '❌ Ошибка получения отчёта.');
  }
});


