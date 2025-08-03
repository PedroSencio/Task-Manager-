import React, { useEffect, useState } from 'react';
import '../pages/static/PopUpPessoal.css';
import { supabase } from '../supabaseClient';

export default function PopUpPessoal({ popUpPessoal, setPopUpPessoal, onTaskAdded }) {
    const [nameTask, setNameTask] = useState('');
    
    useEffect(() => {
        if (popUpPessoal === true) {
            const popUpPessoalElement = document.getElementById('allPopUpPessoal');
            popUpPessoalElement.style.display = 'flex';
        } else {
            const popUpPessoalElement = document.getElementById('allPopUpPessoal');
            popUpPessoalElement.style.display = 'none';
        }
    }, [popUpPessoal]);

    const [selected, setSelected] = useState(null);

    async function handleAddTaskPessoal(name, type) {
        console.log(`Adding task: ${name} of type: ${type}`);
        if (!name || !type) {
            alert('Por favor, preencha o nome da tarefa e selecione um tipo.');
            return;
        }
        
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('User ID não encontrado no localStorage');
            alert('Erro: usuário não identificado. Faça login novamente.');
            return;
        }
        
        try {
            console.log('Creating task for userId:', userId);
            const { data, error } = await supabase
                .from('tarefas')
                .insert([{ 
                    nome: name, 
                    tipo: type, 
                    usuario_id: userId,
                    data: new Date().toISOString()
                }])
                .select();
                
            if (error) {
                console.error('Erro ao adicionar tarefa:', error);
                alert('Erro ao adicionar tarefa: ' + error.message);
            } else {
                console.log('Tarefa adicionada com sucesso:', data);
                if (onTaskAdded) onTaskAdded();
                alert('Tarefa adicionada com sucesso!');
            }
        } catch (err) {
            console.error('Erro inesperado ao adicionar tarefa:', err);
            alert('Erro inesperado ao adicionar tarefa. Tente novamente.');
        }
    }

    return (
        <div id='allPopUpPessoal' onClick={(e) => {
            if (e.target.id === 'allPopUpPessoal') {
                setPopUpPessoal(false);
            }
        }}>
            <div id='popUpPessoal'>
                <h2>Escolha um opção:</h2>
                <div id='popUpPessoal-options'>
                    <button
                        className={`btn-popUpPessoal${selected === 'blocos' ? ' btn-popUpPessoal-selected' : ''}`}
                        onClick={() => setSelected('blocos')}
                        type="button"
                    >
                        Blocos
                    </button>
                    <button
                        className={`btn-popUpPessoal${selected === 'lista' ? ' btn-popUpPessoal-selected' : ''}`}
                        onClick={() => setSelected('lista')}
                        type="button"
                    >
                        Lista
                    </button>
                </div>
                <input id='input-popUpPessoal' value={nameTask} onChange={e => setNameTask(e.target.value)} placeholder='Nome da tarefa' />
                <button id='btn-popUpPessoal-confirmar' onClick={() => {
                    setPopUpPessoal(false);
                    handleAddTaskPessoal(nameTask, selected);
                    setNameTask(''); // Clear input after adding task
                    setSelected(null); // Reset selection
                }}>
                        Confirmar
                    </button>
            </div>
        </div>
    );
}