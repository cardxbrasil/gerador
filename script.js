// Tabs switching
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Botão "começar"
document.getElementById('startBtn').addEventListener('click', () => {
  const task = document.getElementById('taskInput').value.trim();
  if (!task) {
    alert("Por favor, digite uma tarefa antes de começar!");
    return;
  }
  alert("Agente Neo iniciou a tarefa: " + task);
});