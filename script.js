// Sidebar toggle
const sidebar=document.getElementById('sidebar');
document.getElementById('openSidebar').onclick=()=>sidebar.classList.add('open');
document.getElementById('closeSidebar').onclick=()=>sidebar.classList.remove('open');

// Tabs
const tabs=document.querySelectorAll('.tab');
const contents=document.querySelectorAll('.tab-content');
tabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    contents.forEach(c=>c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Botão começar
document.getElementById('startBtn').addEventListener('click',()=>{
  const task=document.getElementById('taskInput').value.trim();
  if(!task){alert('Digite uma tarefa primeiro!');return;}
  alert('Agente Neo iniciou a tarefa: '+task);
});
