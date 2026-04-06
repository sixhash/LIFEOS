        // ================================================================
        // SISTEMA COMPLETO LIFEOS - LÓGICA ORIGINAL (100% PRESERVADA)
        // ================================================================

        const Storage = {
            DB_KEY: 'lifeos_db_v2',

            defaultData() {
                return {
                    tasks: [],
                    goals: [],
                    habits: [],
                    finances: {
                        balance: 0,
                        transactions: []
                    },
                    workouts: {
                        superior1: { exercises: [], completed: false, date: null },
                        superior2: { exercises: [], completed: false, date: null },
                        inferior1: { exercises: [], completed: false, date: null },
                        inferior2: { exercises: [], completed: false, date: null }
                    },
                    godrink: {
                        active: false,
                        interval: 20,
                        lastAlert: null,
                        totalDrank: 0
                    },
                    system: {
                        active: true,
                        pausedAt: null
                    }
                };
            },

            workoutTemplates() {
                return {
                    superior1: {
                        name: 'Superior 1',
                        exercises: [
                            { id: Date.now() + 1, name: 'Supino Reto', sets: 4, reps: '8-10', completed: false },
                            { id: Date.now() + 2, name: 'Supino Inclinado', sets: 3, reps: '8-10', completed: false },
                            { id: Date.now() + 3, name: 'Rosca Barra Reta', sets: 4, reps: '6-8', completed: false },
                            { id: Date.now() + 4, name: 'Rosca Halter', sets: 3, reps: '8-10', completed: false },
                            { id: Date.now() + 5, name: 'Desenvolvimento de Ombro', sets: 3, reps: '8-10', completed: false }
                        ]
                    },
                    superior2: {
                        name: 'Superior 2',
                        exercises: [
                            { id: Date.now() + 6, name: 'Puxada Frontal', sets: 4, reps: '8-10', completed: false },
                            { id: Date.now() + 7, name: 'Remada Barra', sets: 4, reps: '6-8', completed: false },
                            { id: Date.now() + 8, name: 'Rosca Direta', sets: 4, reps: '8-10', completed: false },
                            { id: Date.now() + 9, name: 'Barra Fixa', sets: 3, reps: 'até falha', completed: false },
                            { id: Date.now() + 10, name: 'Rosca Inversa', sets: 3, reps: '8-10', completed: false }
                        ]
                    },
                    inferior1: {
                        name: 'Inferior 1',
                        exercises: [
                            { id: Date.now() + 11, name: 'Agachamento Livre', sets: 4, reps: '6-8', completed: false },
                            { id: Date.now() + 12, name: 'Leg Press', sets: 4, reps: '8-10', completed: false },
                            { id: Date.now() + 13, name: 'Extensora', sets: 3, reps: '10-12', completed: false },
                            { id: Date.now() + 14, name: 'Geminada', sets: 3, reps: '12-15', completed: false },
                            { id: Date.now() + 15, name: 'Tríceps Corda', sets: 3, reps: '10-12', completed: false }
                        ]
                    },
                    inferior2: {
                        name: 'Inferior 2',
                        exercises: [
                            { id: Date.now() + 16, name: 'Leg Press', sets: 4, reps: '8-10', completed: false },
                            { id: Date.now() + 17, name: 'Cadeira Flexora', sets: 4, reps: '8-10', completed: false },
                            { id: Date.now() + 18, name: 'Terra Romeno', sets: 3, reps: '6-8', completed: false },
                            { id: Date.now() + 19, name: 'Desenvolvimento com Halteres', sets: 3, reps: '8-10', completed: false },
                            { id: Date.now() + 20, name: 'Rosca Direta com Barra', sets: 3, reps: '8-10', completed: false }
                        ]
                    }
                };
            },

            load() {
                const data = localStorage.getItem(this.DB_KEY);
                if (!data) {
                    const defaultData = this.defaultData();
                    const templates = this.workoutTemplates();
                    
                    Object.keys(templates).forEach(key => {
                        defaultData.workouts[key].exercises = templates[key].exercises;
                    });
                    
                    return defaultData;
                }
                return JSON.parse(data);
            },

            save(data) {
                localStorage.setItem(this.DB_KEY, JSON.stringify(data));
                if (App) App.updateDashboard();
            },

            clear() {
                localStorage.removeItem(this.DB_KEY);
            }
        };

        const App = {
            data: Storage.load(),
            currentSection: 'dashboard',
            currentTaskFilter: 'all',
            currentWorkout: 'superior1',
            godrinkInterval: null,
            modalCallback: null,
            modalType: null,
            modalData: null,

            init() {
                this.setupEventListeners();
                this.setupWorkouts();
                this.render();
                this.startGoDrinkTimer();
                console.log('✓ LIFEOS Evoluído Iniciado');
            },

            setupEventListeners() {
                document.querySelectorAll('.nav-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const section = e.currentTarget.dataset.section;
                        this.switchSection(section);
                    });
                });

                document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
                document.getElementById('taskInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });
                document.querySelectorAll('[data-filter]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.currentTaskFilter = e.target.dataset.filter;
                        this.renderTasks();
                    });
                });

                document.getElementById('addGoalBtn').addEventListener('click', () => this.addGoal());
                document.getElementById('goalInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addGoal();
                });

                document.getElementById('addHabitBtn').addEventListener('click', () => this.addHabit());
                document.getElementById('habitInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addHabit();
                });

                document.getElementById('addFinanceBtn').addEventListener('click', () => this.addTransaction());
                document.getElementById('financeValue').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTransaction();
                });

                document.querySelectorAll('[data-workout]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.currentWorkout = e.target.dataset.workout;
                        this.renderWorkout();
                    });
                });
                document.getElementById('addExerciseBtn').addEventListener('click', () => this.showAddExerciseModal());

                document.getElementById('toggleGodrinkBtn').addEventListener('click', () => this.toggleGoDrink());
                document.getElementById('saveGodrinkBtn').addEventListener('click', () => this.saveGodrinkSettings());
                document.getElementById('drinkBtn').addEventListener('click', () => this.handleDrink());
                document.getElementById('ignoreBtn').addEventListener('click', () => this.handleIgnore());

                document.getElementById('toggleSystemBtn').addEventListener('click', () => this.toggleSystem());
                document.getElementById('resumeBtn').addEventListener('click', () => this.toggleSystem());

                document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
                document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
                document.getElementById('modalSave').addEventListener('click', () => this.saveModalEdit());
            },

            setupWorkouts() {
                const templates = Storage.workoutTemplates();
                Object.keys(templates).forEach(key => {
                    if (!this.data.workouts[key].exercises.length) {
                        this.data.workouts[key].exercises = templates[key].exercises;
                    }
                });
                Storage.save(this.data);
            },

            switchSection(section) {
                this.currentSection = section;
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById(section).classList.add('active');

                document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`[data-section="${section}"]`).classList.add('active');

                const titles = {
                    dashboard: '📊 Dashboard',
                    tasks: '✓ Tarefas',
                    goals: '🎯 Metas',
                    habits: '🔥 Hábitos',
                    finance: '💰 Financeiro',
                    workout: '🏋️ Treinos',
                    godrink: '💧 GoDrink'
                };

                document.getElementById('sectionTitle').textContent = titles[section];
                this.render();
            },

            addTask() {
                const input = document.getElementById('taskInput');
                const priority = document.getElementById('taskPriority');
                const value = input.value.trim();

                if (!value) {
                    this.showToast('Digite uma tarefa', 'error');
                    return;
                }

                const task = {
                    id: Date.now(),
                    title: value,
                    priority: priority.value,
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                this.data.tasks.unshift(task);
                Storage.save(this.data);
                input.value = '';
                priority.value = 'medium';
                this.renderTasks();
                this.showToast('✓ Tarefa adicionada');
            },

            toggleTask(id) {
                const task = this.data.tasks.find(t => t.id === id);
                if (task) {
                    task.completed = !task.completed;
                    Storage.save(this.data);
                    this.renderTasks();
                    this.updateDashboard();
                    this.showToast(task.completed ? '✓ Tarefa concluída!' : 'Tarefa reaberta');
                }
            },

            editTask(id) {
                const task = this.data.tasks.find(t => t.id === id);
                if (!task) return;
                
                this.openModal('Editar Tarefa', 'task', task, {
                    fields: [
                        { type: 'text', id: 'title', label: 'Nome da tarefa', value: task.title }
                    ]
                });
            },

            deleteTask(id) {
                this.data.tasks = this.data.tasks.filter(t => t.id !== id);
                Storage.save(this.data);
                this.renderTasks();
                this.updateDashboard();
                this.showToast('✗ Tarefa removida');
            },

            renderTasks() {
                const list = document.getElementById('tasksList');
                let filtered = this.data.tasks;

                if (this.currentTaskFilter === 'pending') {
                    filtered = this.data.tasks.filter(t => !t.completed);
                } else if (this.currentTaskFilter === 'completed') {
                    filtered = this.data.tasks.filter(t => t.completed);
                }

                if (!filtered.length) {
                    list.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 40px 20px;">Nenhuma tarefa</p>';
                    return;
                }

                list.innerHTML = filtered.map(task => `
                    <div class="item ${task.completed ? 'completed' : ''}">
                        <div class="item-checkbox" onclick="App.toggleTask(${task.id})" style="cursor: pointer;">
                            ${task.completed ? '✓' : ''}
                        </div>
                        <div class="item-content">
                            <div class="item-title">
                                <span class="item-priority priority-${task.priority}">${task.priority === 'high' ? 'ALTA' : task.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}</span>
                                ${this.escapeHtml(task.title)}
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="item-action-btn" onclick="App.editTask(${task.id})">✏️</button>
                            <button class="item-action-btn" onclick="App.deleteTask(${task.id})">🗑️</button>
                        </div>
                    </div>
                `).join('');

                document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`[data-filter="${this.currentTaskFilter}"]`).classList.add('active');
            },

            addGoal() {
                const title = document.getElementById('goalInput').value.trim();
                const description = document.getElementById('goalDescInput').value.trim();

                if (!title) {
                    this.showToast('Digite um nome para a meta', 'error');
                    return;
                }

                const goal = {
                    id: Date.now(),
                    title: title,
                    description: description || '',
                    progress: 0,
                    createdAt: new Date().toISOString()
                };

                this.data.goals.unshift(goal);
                Storage.save(this.data);
                document.getElementById('goalInput').value = '';
                document.getElementById('goalDescInput').value = '';
                this.renderGoals();
                this.showToast('🎯 Meta criada');
            },

            editGoal(id) {
                const goal = this.data.goals.find(g => g.id === id);
                if (!goal) return;
                
                this.openModal('Editar Meta', 'goal', goal, {
                    fields: [
                        { type: 'text', id: 'title', label: 'Nome da meta', value: goal.title },
                        { type: 'textarea', id: 'description', label: 'Descrição', value: goal.description || '' },
                        { type: 'number', id: 'progress', label: 'Progresso (%)', value: goal.progress, min: 0, max: 100 }
                    ]
                });
            },

            updateGoalProgress(id, progress) {
                const goal = this.data.goals.find(g => g.id === id);
                if (goal) {
                    goal.progress = Math.min(100, Math.max(0, progress));
                    Storage.save(this.data);
                    this.renderGoals();
                    this.updateDashboard();
                }
            },

            deleteGoal(id) {
                this.data.goals = this.data.goals.filter(g => g.id !== id);
                Storage.save(this.data);
                this.renderGoals();
                this.updateDashboard();
                this.showToast('✗ Meta removida');
            },

            renderGoals() {
                const list = document.getElementById('goalsList');

                if (!this.data.goals.length) {
                    list.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 40px 20px;">Nenhuma meta</p>';
                    return;
                }

                list.innerHTML = this.data.goals.map(goal => `
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                            <div>
                                <div style="font-weight: 600; font-size: var(--font-md);">${this.escapeHtml(goal.title)}</div>
                                ${goal.description ? `<div style="font-size: var(--font-xs); color: var(--text-secondary); margin-top: 4px;">${this.escapeHtml(goal.description)}</div>` : ''}
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="item-action-btn" onclick="App.editGoal(${goal.id})">✏️</button>
                                <button class="item-action-btn" onclick="App.deleteGoal(${goal.id})">🗑️</button>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: var(--font-xs); color: var(--text-secondary);">Progresso</span>
                            <span style="font-weight: 600; color: var(--accent-light);">${goal.progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${goal.progress}%"></div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                            <button class="btn btn-small" onclick="App.updateGoalProgress(${goal.id}, ${goal.progress - 10})">-10%</button>
                            <button class="btn btn-small" onclick="App.updateGoalProgress(${goal.id}, ${goal.progress + 10})">+10%</button>
                            <button class="btn btn-small btn-success" onclick="App.updateGoalProgress(${goal.id}, 100)">100%</button>
                        </div>
                    </div>
                `).join('');
            },

            addHabit() {
                const name = document.getElementById('habitInput').value.trim();
                const description = document.getElementById('habitDescInput').value.trim();

                if (!name) {
                    this.showToast('Digite um nome para o hábito', 'error');
                    return;
                }

                const habit = {
                    id: Date.now(),
                    name: name,
                    description: description || '',
                    streak: 0,
                    bestStreak: 0,
                    completedToday: false,
                    lastDate: null,
                    createdAt: new Date().toISOString()
                };

                this.data.habits.unshift(habit);
                Storage.save(this.data);
                document.getElementById('habitInput').value = '';
                document.getElementById('habitDescInput').value = '';
                this.renderHabits();
                this.showToast('🔥 Hábito criado');
            },

            editHabit(id) {
                const habit = this.data.habits.find(h => h.id === id);
                if (!habit) return;
                
                this.openModal('Editar Hábito', 'habit', habit, {
                    fields: [
                        { type: 'text', id: 'name', label: 'Nome do hábito', value: habit.name },
                        { type: 'textarea', id: 'description', label: 'Descrição', value: habit.description || '' }
                    ]
                });
            },

            completeHabit(id) {
                const habit = this.data.habits.find(h => h.id === id);
                if (!habit) return;

                const today = new Date().toISOString().split('T')[0];

                if (habit.completedToday) {
                    habit.completedToday = false;
                    habit.streak = Math.max(0, habit.streak - 1);
                } else {
                    habit.completedToday = true;

                    if (habit.lastDate) {
                        const lastDate = new Date(habit.lastDate);
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        
                        if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                            habit.streak++;
                        } else {
                            habit.streak = 1;
                        }
                    } else {
                        habit.streak = 1;
                    }

                    if (habit.streak > habit.bestStreak) {
                        habit.bestStreak = habit.streak;
                    }

                    habit.lastDate = today;
                }

                Storage.save(this.data);
                this.renderHabits();
                this.updateDashboard();
                this.showToast(habit.completedToday ? '🔥 Parabéns! Streak: ' + habit.streak + ' dias' : 'Hábito reaberto');
            },

            deleteHabit(id) {
                this.data.habits = this.data.habits.filter(h => h.id !== id);
                Storage.save(this.data);
                this.renderHabits();
                this.updateDashboard();
                this.showToast('✗ Hábito removido');
            },

            resetHabitsDaily() {
                const today = new Date().toISOString().split('T')[0];
                this.data.habits.forEach(habit => {
                    if (habit.lastDate && habit.lastDate !== today) {
                        habit.completedToday = false;
                    }
                });
            },

            renderHabits() {
                const list = document.getElementById('habitsList');

                if (!this.data.habits.length) {
                    list.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 40px 20px;">Nenhum hábito</p>';
                    return;
                }

                list.innerHTML = this.data.habits.map(habit => `
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                            <div>
                                <div style="font-weight: 600; font-size: var(--font-md);">${this.escapeHtml(habit.name)}</div>
                                ${habit.description ? `<div style="font-size: var(--font-xs); color: var(--text-secondary); margin-top: 4px;">${this.escapeHtml(habit.description)}</div>` : ''}
                            </div>
                            <button class="item-action-btn" onclick="App.editHabit(${habit.id})">✏️</button>
                        </div>
                        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
                            <div>
                                <div style="font-size: var(--font-xl); font-weight: 700; color: var(--accent-light);">${habit.streak}</div>
                                <div style="font-size: var(--font-xs); color: var(--text-secondary);">Dias</div>
                            </div>
                            <div>
                                <div style="font-size: var(--font-xl); font-weight: 700; color: var(--accent-light);">${habit.bestStreak}</div>
                                <div style="font-size: var(--font-xs); color: var(--text-secondary);">Melhor</div>
                            </div>
                        </div>
                        <button class="btn ${habit.completedToday ? 'btn-success' : ''}" style="width: 100%;" onclick="App.completeHabit(${habit.id})">
                            ${habit.completedToday ? '✓ Completo Hoje' : 'Marcar Hoje'}
                        </button>
                    </div>
                `).join('');
            },

            addTransaction() {
                const value = parseFloat(document.getElementById('financeValue').value);
                const type = document.getElementById('financeType').value;
                const desc = document.getElementById('financeDesc').value.trim();

                if (!value || value <= 0 || !desc) {
                    this.showToast('Preencha todos os campos corretamente', 'error');
                    return;
                }

                const transaction = {
                    id: Date.now(),
                    value: value,
                    type: type,
                    description: desc,
                    date: new Date().toISOString()
                };

                this.data.finances.transactions.unshift(transaction);
                this.calculateBalance();
                Storage.save(this.data);

                document.getElementById('financeValue').value = '';
                document.getElementById('financeDesc').value = '';

                this.renderFinance();
                this.updateDashboard();
                this.showToast('✓ Transação adicionada');
            },

            calculateBalance() {
                this.data.finances.balance = this.data.finances.transactions.reduce((acc, trans) => {
                    return trans.type === 'income' ? acc + trans.value : acc - trans.value;
                }, 0);
            },

            deleteTransaction(id) {
                this.data.finances.transactions = this.data.finances.transactions.filter(t => t.id !== id);
                this.calculateBalance();
                Storage.save(this.data);
                this.renderFinance();
                this.updateDashboard();
                this.showToast('✗ Transação removida');
            },

            renderFinance() {
                document.getElementById('financialBalance').textContent = 'R$ ' + this.data.finances.balance.toFixed(2).replace('.', ',');

                const list = document.getElementById('financeList');

                if (!this.data.finances.transactions.length) {
                    list.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 40px 20px;">Nenhuma transação</p>';
                    return;
                }

                list.innerHTML = this.data.finances.transactions.map(trans => {
                    const date = new Date(trans.date);
                    const dateStr = date.toLocaleDateString('pt-BR');
                    const isIncome = trans.type === 'income';

                    return `
                        <div class="item">
                            <div style="font-size: var(--font-lg); margin-right: 8px;">${isIncome ? '📈' : '📉'}</div>
                            <div class="item-content">
                                <div class="item-title">${this.escapeHtml(trans.description)}</div>
                                <div class="item-meta">${dateStr}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: ${isIncome ? 'var(--success)' : 'var(--danger)'};">
                                        ${isIncome ? '+' : '-'} R$ ${trans.value.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                                <button class="item-action-btn" onclick="App.deleteTransaction(${trans.id})">🗑️</button>
                            </div>
                        </div>
                    `;
                }).join('');
            },

            addExercise(exerciseData = null) {
                const workout = this.data.workouts[this.currentWorkout];
                
                if (exerciseData) {
                    workout.exercises.push(exerciseData);
                } else {
                    const name = prompt('Nome do exercício:');
                    if (!name) return;
                    const sets = parseInt(prompt('Número de séries:', '3')) || 3;
                    const reps = prompt('Repetições (ex: 8-10):', '8-10') || '8-10';
                    
                    workout.exercises.push({
                        id: Date.now(),
                        name: name,
                        sets: sets,
                        reps: reps,
                        completed: false
                    });
                }
                
                Storage.save(this.data);
                this.renderWorkout();
                this.showToast('✓ Exercício adicionado');
            },

            showAddExerciseModal() {
                this.openModal('Adicionar Exercício', 'workout_add', null, {
                    fields: [
                        { type: 'text', id: 'name', label: 'Nome do exercício', value: '' },
                        { type: 'number', id: 'sets', label: 'Séries', value: 3, min: 1 },
                        { type: 'text', id: 'reps', label: 'Repetições', value: '8-10' }
                    ]
                });
            },

            editExercise(exerciseId) {
                const workout = this.data.workouts[this.currentWorkout];
                const exercise = workout.exercises.find(e => e.id === exerciseId);
                if (!exercise) return;
                
                this.openModal('Editar Exercício', 'workout_edit', exercise, {
                    fields: [
                        { type: 'text', id: 'name', label: 'Nome do exercício', value: exercise.name },
                        { type: 'number', id: 'sets', label: 'Séries', value: exercise.sets, min: 1 },
                        { type: 'text', id: 'reps', label: 'Repetições', value: exercise.reps }
                    ]
                });
            },

            deleteExercise(exerciseId) {
                if (confirm('Tem certeza que deseja remover este exercício?')) {
                    const workout = this.data.workouts[this.currentWorkout];
                    workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
                    Storage.save(this.data);
                    this.renderWorkout();
                    this.showToast('✗ Exercício removido');
                }
            },

            toggleExercise(exerciseId) {
                const workout = this.data.workouts[this.currentWorkout];
                const exercise = workout.exercises.find(e => e.id === exerciseId);
                if (exercise) {
                    exercise.completed = !exercise.completed;
                    Storage.save(this.data);
                    this.renderWorkout();
                }
            },

            completeWorkout() {
                const workout = this.data.workouts[this.currentWorkout];
                const allCompleted = workout.exercises.every(ex => ex.completed);

                if (!allCompleted) {
                    this.showToast('Complete todos os exercícios primeiro', 'error');
                    return;
                }

                workout.completed = true;
                workout.date = new Date().toISOString();
                Storage.save(this.data);
                this.showToast('✓ Treino concluído com sucesso! 💪');
                setTimeout(() => this.resetWorkout(), 1500);
            },

            resetWorkout() {
                const workout = this.data.workouts[this.currentWorkout];
                workout.exercises.forEach(ex => ex.completed = false);
                workout.completed = false;
                Storage.save(this.data);
                this.renderWorkout();
            },

            renderWorkout() {
                const content = document.getElementById('workoutContent');
                const workout = this.data.workouts[this.currentWorkout];
                const templates = Storage.workoutTemplates();
                const workoutName = templates[this.currentWorkout]?.name || this.currentWorkout;

                const allCompleted = workout.exercises.every(ex => ex.completed);
                const completedCount = workout.exercises.filter(ex => ex.completed).length;

                if (!workout.exercises.length) {
                    content.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
                            Nenhum exercício neste treino.
                            <br>
                            <button class="btn btn-small" style="margin-top: 16px;" onclick="App.showAddExerciseModal()">+ Adicionar Exercício</button>
                        </div>
                    `;
                    return;
                }

                let html = `
                    <div style="margin-bottom: var(--spacing-lg);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                            <div style="font-size: var(--font-lg); font-weight: 600;">${this.escapeHtml(workoutName)}</div>
                            <div style="background: var(--accent-primary); color: white; padding: 4px 12px; border-radius: 20px; font-size: var(--font-xs); font-weight: 600;">
                                ${completedCount}/${workout.exercises.length}
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(completedCount / workout.exercises.length) * 100}%"></div>
                        </div>
                    </div>
                `;

                html += workout.exercises.map(exercise => `
                    <div class="exercise-item">
                        <div class="item-checkbox" onclick="App.toggleExercise(${exercise.id})" style="cursor: pointer;">
                            ${exercise.completed ? '✓' : ''}
                        </div>
                        <div class="exercise-info">
                            <div class="exercise-name">${this.escapeHtml(exercise.name)}</div>
                            <div class="exercise-details">${exercise.sets} séries x ${exercise.reps} reps</div>
                        </div>
                        <div class="item-actions">
                            <button class="item-action-btn" onclick="App.editExercise(${exercise.id})">✏️</button>
                            <button class="item-action-btn" onclick="App.deleteExercise(${exercise.id})">🗑️</button>
                        </div>
                    </div>
                `).join('');

                html += `
                    <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-xl); flex-wrap: wrap;">
                        <button class="btn btn-secondary" style="flex: 1;" onclick="App.resetWorkout()">↻ Reset</button>
                        <button class="btn ${allCompleted ? 'btn-success' : ''}" style="flex: 1;" onclick="App.completeWorkout()" ${!allCompleted ? 'disabled' : ''}>
                            ✓ ${allCompleted ? 'Concluir' : 'Complete os exercícios'}
                        </button>
                    </div>
                `;

                content.innerHTML = html;

                document.querySelectorAll('[data-workout]').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`[data-workout="${this.currentWorkout}"]`).classList.add('active');
            },

            toggleGoDrink() {
                this.data.godrink.active = !this.data.godrink.active;
                Storage.save(this.data);
                this.renderGoDrink();
                this.startGoDrinkTimer();
                this.showToast(this.data.godrink.active ? '💧 GoDrink Ativado' : '💧 GoDrink Desativado');
            },

            saveGodrinkSettings() {
                const interval = parseInt(document.getElementById('godrinkInterval').value);
                if (interval >= 1 && interval <= 120) {
                    this.data.godrink.interval = interval;
                    Storage.save(this.data);
                    this.startGoDrinkTimer();
                    this.showToast('✓ Intervalo atualizado');
                }
            },

            startGoDrinkTimer() {
                if (this.godrinkInterval) {
                    clearInterval(this.godrinkInterval);
                }

                if (!this.data.godrink.active || !this.data.system.active) return;

                this.godrinkInterval = setInterval(() => {
                    if (this.data.godrink.active && this.data.system.active) {
                        this.showGoDrinkAlert();
                    }
                }, this.data.godrink.interval * 60 * 1000);
            },

            showGoDrinkAlert() {
                if (!this.data.system.active) return;
                document.getElementById('godrinkAlert').classList.add('active');
                this.playSound();
            },

            handleDrink() {
                this.data.godrink.totalDrank++;
                this.data.godrink.lastAlert = new Date().toISOString();
                Storage.save(this.data);
                document.getElementById('godrinkAlert').classList.remove('active');
                this.showToast('✓ Hidratação registrada! 💧');
                this.renderGoDrink();
            },

            handleIgnore() {
                document.getElementById('godrinkAlert').classList.remove('active');
            },

            renderGoDrink() {
                const status = document.getElementById('godrinkStatus');
                status.textContent = this.data.godrink.active ? '💧 GoDrink Ativo' : '💧 GoDrink Inativo';
                status.style.color = this.data.godrink.active ? 'var(--success)' : 'var(--text-secondary)';

                document.getElementById('toggleGodrinkBtn').textContent = this.data.godrink.active ? '⏹️ Desativar GoDrink' : '▶️ Ativar GoDrink';
                document.getElementById('godrinkInterval').value = this.data.godrink.interval;

                const stats = document.getElementById('godrinkStats');
                stats.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-value">${this.data.godrink.totalDrank}</div>
                        <div class="stat-label">Vezes Hidratado</div>
                    </div>
                `;
            },

            playSound() {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = 880;
                    oscillator.type = 'sine';

                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                } catch(e) {}
            },

            toggleSystem() {
                this.data.system.active = !this.data.system.active;
                Storage.save(this.data);

                const overlay = document.getElementById('pausedOverlay');
                const indicator = document.getElementById('statusIndicator');
                const statusText = document.getElementById('statusText');
                const btn = document.getElementById('toggleSystemBtn');

                if (!this.data.system.active) {
                    overlay.classList.add('active');
                    indicator.classList.add('off');
                    statusText.textContent = 'Sistema Pausado';
                    btn.textContent = '▶️ Reativar Sistema';
                    this.startGoDrinkTimer();
                } else {
                    overlay.classList.remove('active');
                    indicator.classList.remove('off');
                    statusText.textContent = 'Sistema Ativo';
                    btn.textContent = '⏹️ Pausar Sistema';
                    this.startGoDrinkTimer();
                }

                this.showToast(this.data.system.active ? '▶️ Sistema Reativado' : '⏹️ Sistema Pausado');
            },

            openModal(title, type, data, config) {
                this.modalType = type;
                this.modalData = data;
                
                const modalFields = document.getElementById('modalFields');
                modalFields.innerHTML = '';
                
                if (config && config.fields) {
                    config.fields.forEach(field => {
                        if (field.type === 'textarea') {
                            const textarea = document.createElement('textarea');
                            textarea.className = 'input-field';
                            textarea.id = `modal_${field.id}`;
                            textarea.placeholder = field.label;
                            textarea.value = field.value || '';
                            if (field.rows) textarea.rows = field.rows;
                            modalFields.appendChild(textarea);
                        } else if (field.type === 'number') {
                            const input = document.createElement('input');
                            input.type = 'number';
                            input.className = 'input-field';
                            input.id = `modal_${field.id}`;
                            input.placeholder = field.label;
                            input.value = field.value || 0;
                            if (field.min !== undefined) input.min = field.min;
                            if (field.max !== undefined) input.max = field.max;
                            modalFields.appendChild(input);
                        } else {
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.className = 'input-field';
                            input.id = `modal_${field.id}`;
                            input.placeholder = field.label;
                            input.value = field.value || '';
                            modalFields.appendChild(input);
                        }
                    });
                }
                
                document.getElementById('modalTitle').textContent = title;
                document.getElementById('editModal').classList.add('active');
            },

            closeModal() {
                document.getElementById('editModal').classList.remove('active');
                this.modalType = null;
                this.modalData = null;
            },

            saveModalEdit() {
                if (!this.modalType) return;
                
                if (this.modalType === 'task' && this.modalData) {
                    const newTitle = document.getElementById('modal_title')?.value;
                    if (newTitle) this.modalData.title = newTitle;
                    Storage.save(this.data);
                    this.renderTasks();
                    this.showToast('✓ Tarefa atualizada');
                } 
                else if (this.modalType === 'goal' && this.modalData) {
                    const newTitle = document.getElementById('modal_title')?.value;
                    const newDesc = document.getElementById('modal_description')?.value;
                    const newProgress = parseInt(document.getElementById('modal_progress')?.value);
                    if (newTitle) this.modalData.title = newTitle;
                    if (newDesc !== undefined) this.modalData.description = newDesc;
                    if (!isNaN(newProgress)) this.modalData.progress = Math.min(100, Math.max(0, newProgress));
                    Storage.save(this.data);
                    this.renderGoals();
                    this.updateDashboard();
                    this.showToast('✓ Meta atualizada');
                }
                else if (this.modalType === 'habit' && this.modalData) {
                    const newName = document.getElementById('modal_name')?.value;
                    const newDesc = document.getElementById('modal_description')?.value;
                    if (newName) this.modalData.name = newName;
                    if (newDesc !== undefined) this.modalData.description = newDesc;
                    Storage.save(this.data);
                    this.renderHabits();
                    this.showToast('✓ Hábito atualizado');
                }
                else if (this.modalType === 'workout_add') {
                    const name = document.getElementById('modal_name')?.value;
                    const sets = parseInt(document.getElementById('modal_sets')?.value);
                    const reps = document.getElementById('modal_reps')?.value;
                    if (name && sets && reps) {
                        const workout = this.data.workouts[this.currentWorkout];
                        workout.exercises.push({
                            id: Date.now(),
                            name: name,
                            sets: sets,
                            reps: reps,
                            completed: false
                        });
                        Storage.save(this.data);
                        this.renderWorkout();
                        this.showToast('✓ Exercício adicionado');
                    } else {
                        this.showToast('Preencha todos os campos', 'error');
                    }
                }
                else if (this.modalType === 'workout_edit' && this.modalData) {
                    const newName = document.getElementById('modal_name')?.value;
                    const newSets = parseInt(document.getElementById('modal_sets')?.value);
                    const newReps = document.getElementById('modal_reps')?.value;
                    if (newName) this.modalData.name = newName;
                    if (!isNaN(newSets)) this.modalData.sets = newSets;
                    if (newReps) this.modalData.reps = newReps;
                    Storage.save(this.data);
                    this.renderWorkout();
                    this.showToast('✓ Exercício atualizado');
                }
                
                this.closeModal();
            },

            escapeHtml(text) {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            },

            showToast(message, type = 'success') {
                const toast = document.getElementById('toast');
                toast.textContent = message;
                toast.className = `toast show ${type}`;

                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            },

            updateDashboard() {
                const pendingTasks = this.data.tasks.filter(t => !t.completed).length;
                document.getElementById('dashPendingTasks').textContent = pendingTasks;

                const balance = this.data.finances.balance;
                document.getElementById('dashBalance').textContent = 'R$ ' + balance.toFixed(2).replace('.', ',');

                const habitsToday = this.data.habits.filter(h => h.completedToday).length;
                document.getElementById('dashHabitsToday').textContent = habitsToday;

                const totalTasks = this.data.tasks.length;
                const completedTasks = this.data.tasks.filter(t => t.completed).length;
                const rate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
                document.getElementById('dashCompletionRate').textContent = rate + '%';

                const dashboardTasks = document.getElementById('dashboardTasks');
                const upcoming = this.data.tasks.filter(t => !t.completed).slice(0, 3);
                if (upcoming.length) {
                    dashboardTasks.innerHTML = upcoming.map(task => `
                        <div class="item">
                            <div class="item-checkbox" onclick="App.toggleTask(${task.id})" style="cursor: pointer;"></div>
                            <div class="item-content">
                                <div class="item-title">${this.escapeHtml(task.title)}</div>
                                <div class="item-meta"><span class="item-priority priority-${task.priority}">${task.priority === 'high' ? 'ALTA' : task.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}</span></div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    dashboardTasks.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px;">Nenhuma tarefa pendente 🎉</p>';
                }

                const dashboardGoals = document.getElementById('dashboardGoals');
                if (this.data.goals.length) {
                    dashboardGoals.innerHTML = this.data.goals.slice(0, 2).map(goal => `
                        <div class="card">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                                <div style="font-weight: 600;">${this.escapeHtml(goal.title)}</div>
                                <div style="color: var(--accent-light); font-weight: 600;">${goal.progress}%</div>
                            </div>
                            ${goal.description ? `<div style="font-size: var(--font-xs); color: var(--text-secondary); margin-bottom: 8px;">${this.escapeHtml(goal.description)}</div>` : ''}
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${goal.progress}%"></div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    dashboardGoals.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px;">Nenhuma meta criada</p>';
                }
            },

            render() {
                if (this.currentSection === 'tasks') {
                    this.renderTasks();
                } else if (this.currentSection === 'goals') {
                    this.renderGoals();
                } else if (this.currentSection === 'habits') {
                    this.resetHabitsDaily();
                    this.renderHabits();
                } else if (this.currentSection === 'finance') {
                    this.renderFinance();
                } else if (this.currentSection === 'workout') {
                    this.renderWorkout();
                } else if (this.currentSection === 'godrink') {
                    this.renderGoDrink();
                } else {
                    this.updateDashboard();
                }
            }
        };

        App.init();

        // ── LOADING SCREEN ──
        (function() {
            const screen = document.getElementById('loading-screen');
            const statusEl = document.getElementById('loading-status-text');
            const messages = ['Inicializando...', 'Carregando dados...', 'Preparando sistema...', 'Quase lá...'];
            let i = 0;
            const msgInterval = setInterval(() => {
                i = (i + 1) % messages.length;
                if (statusEl) statusEl.textContent = messages[i];
            }, 550);

            function hideLoader() {
                clearInterval(msgInterval);
                if (statusEl) statusEl.textContent = 'Pronto!';
                setTimeout(() => {
                    if (screen) screen.classList.add('hidden');
                    setTimeout(() => { if (screen) screen.remove(); }, 900);
                }, 300);
            }

            // Hide after bar animation completes (~3.2s) or when page is ready
            const minDelay = 3200;
            const startTime = Date.now();

            if (document.readyState === 'complete') {
                const elapsed = Date.now() - startTime;
                setTimeout(hideLoader, Math.max(0, minDelay - elapsed));
            } else {
                window.addEventListener('load', function() {
                    const elapsed = Date.now() - startTime;
                    setTimeout(hideLoader, Math.max(0, minDelay - elapsed));
                });
            }
        })();


        setInterval(() => {
            App.resetHabitsDaily();
            if (App.currentSection === 'dashboard') {
                App.updateDashboard();
            }
        }, 30000);
