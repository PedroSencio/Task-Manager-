import React, { useEffect } from 'react';
import '../pages/static/Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Sidebar({ userName, userId, handleAbrirTarefa, tarefasAtualizadas, popUpPessoal, setPopUpPessoal }) {
    const [tarefas, setTarefas] = React.useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Sidebar - userId:', userId, 'userName:', userName);
        if (!userId) {
            console.error('User ID not found');
            navigate('/');
            return;
        }
        
        async function fetchTarefas() {
            try {
                console.log('Fetching tasks for userId:', userId);
                console.log('userId type:', typeof userId);
                
                const { data, error } = await supabase
                    .from('tarefas')
                    .select('*')
                    .eq('usuario_id', userId);
                    
                if (error) {
                    console.error('Error fetching tasks:', error);
                    setTarefas([]);
                } else {
                    console.log('Tasks fetched successfully:', data);
                    setTarefas(data || []);
                }
            } catch (err) {
                console.error('Unexpected error fetching tasks:', err);
                setTarefas([]);
            }
        }
        fetchTarefas();
    }, [userId, tarefasAtualizadas, navigate]);

    function handleLogout() {
        // Fazer logout do Supabase Auth se foi login com Google
        supabase.auth.signOut().catch(error => {
            console.log('Não estava logado com Supabase Auth:', error);
        });
        
        // Limpar localStorage e redirecionar
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        navigate('/');
    }

    function handleSettings() {
        navigate('/configuracoes');
    }

    return (
        <div id='sidebar'>
            <div></div>
            <h2>Olá, {userName}</h2>
            <div id='sidebar-start'>
            <h3>Espaço de equipe</h3>
            <button className='btn-sidebar-add'>+</button>
            </div>
            <div id='sidebar-middle'>
            <h3>Pessoal</h3>
            {tarefas.map((tarefa) => (
                <button key={tarefa.id} className='btn-sidebar-task' onClick={() => handleAbrirTarefa(tarefa.id)}>
                    {tarefa.nome}
                </button>
            ))}
            <button onClick={() => setPopUpPessoal(true)} className='btn-sidebar-add'>+</button>
            </div>
            <div id='sidebar-end'>
            <button id='logout-btn' onClick={handleLogout}>
                <img src="/logout.png" alt="" />
            </button>
            <button id='settings-btn' onClick={handleSettings}>
                <img src="/setting.png" alt="" />
            </button>
            </div>
        </div>
    )
}