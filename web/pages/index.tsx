import useSWR from 'swr';
import { useMemo, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lightbulb as LightbulbIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                AI Project Tracker
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Панель администратора
              </Typography>
              
              <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', mt: 3 }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Пароль администратора"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  required
                />
                
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  sx={{ mt: 3, mb: 2 }}
                >
                  Войти
                </Button>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Пароль по умолчанию: admin123
              </Typography>
            </Box>
          </Paper>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminPanel />
    </ThemeProvider>
  );
}

function AdminPanel() {
  const { data, mutate } = useSWR('/api/admin/users', fetcher);
  const users = data ?? [];
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    window.location.reload();
  };

  const showSnackbar = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await fetch(`/api/admin/ideas/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' }),
      });
      await mutate();
      showSnackbar('Задача отмечена как выполненная');
    } catch (e) {
      showSnackbar('Ошибка обновления задачи');
    }
  };

  const handleAiReview = async (ideaId: string) => {
    try {
      const res = await fetch(`/api/admin/ai/review/${ideaId}`, { method: 'POST' });
      const data = await res.json();
      showSnackbar(`AI Review: ${data.completedPercent}% выполнено. ${data.comment}`);
    } catch (e) {
      showSnackbar('Ошибка получения AI анализа');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'success';
      case 'IN_PROGRESS': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DONE': return 'Выполнено';
      case 'IN_PROGRESS': return 'В работе';
      default: return 'К выполнению';
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <PsychologyIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Project Tracker - Панель администратора
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Пользователи и проекты
        </Typography>
        
        {users.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {users.map((user: any) => (
              <Box key={user.id} sx={{ mb: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">{user.name}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    
                    {user.ideas?.map((idea: any) => {
                      const totalTasks = idea.tasks?.length || 0;
                      const completedTasks = idea.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
                      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                      
                      return (
                        <Card key={idea.id} variant="outlined" sx={{ mt: 2 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
                              <Typography variant="h6">{idea.title}</Typography>
                            </Box>
                            
                            <Box mb={2}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Прогресс: {completedTasks}/{totalTasks} задач ({Math.round(progress)}%)
                              </Typography>
                              <LinearProgress variant="determinate" value={progress} />
                            </Box>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Задачи:
                            </Typography>
                            
                            {idea.tasks?.map((task: any) => (
                              <Box key={task.id} display="flex" alignItems="center" mb={1}>
                                <AssignmentIcon sx={{ mr: 1, fontSize: 16 }} />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    flexGrow: 1,
                                    textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                                    opacity: task.status === 'DONE' ? 0.6 : 1
                                  }}
                                >
                                  {task.index}. {task.title}
                                </Typography>
                                <Chip 
                                  label={getStatusLabel(task.status)} 
                                  color={getStatusColor(task.status) as any}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckIcon />}
                                  disabled={task.status === 'DONE'}
                                  onClick={() => handleTaskComplete(task.id)}
                                  sx={{ ml: 1 }}
                                >
                                  {task.status === 'DONE' ? 'Выполнено' : 'Сделано'}
                                </Button>
                              </Box>
                            ))}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Button
                              variant="outlined"
                              startIcon={<PsychologyIcon />}
                              onClick={() => handleAiReview(idea.id)}
                              fullWidth
                            >
                              AI Review
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}


