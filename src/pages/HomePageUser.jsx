import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './static/HomePageUser.css';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import PopUpPessoal from '../components/PopUpPessoal';
import ListaTarefas from './components/ListaTarefas';
import './static/ListaTarefas.css';

export default function HomePageUser() {
    const location = useLocation();
    const localStorageData = localStorage.getItem('data');
    
    // Usar localStorage como fallback se location.state não estiver disponível
    const userName = location.state?.userName || localStorage.getItem('userName')
    const userId = location.state?.userId || localStorage.getItem('userId')
    
    const [tarefas, setTarefas] = React.useState([]);
    const [modelo, setModelo] = React.useState(0);
    const [input, setInput] = React.useState(false);
    const [nomeBloco, setNomeBloco] = React.useState('');
    const [button, setButton] = React.useState(true);
    const [blocos, setBlocos] = React.useState([]);
    const [blocoAtualizado, setBlocoAtualizado] = React.useState(0);
    const [tarefasAtualizadas, setTarefasAtualizadas] = React.useState(0);
    const [popUpPessoal, setPopUpPessoal] = React.useState(false);

    async function handleDeleteBloco(blocoId) {
        if (!blocoId) return;
        
        try {
            console.log('Deleting bloco:', blocoId);
            const { error } = await supabase
                .from('blocos')
                .delete()
                .eq('id', blocoId);
                
            if (error) {
                console.error('Erro ao deletar bloco:', error);
                alert('Erro ao deletar bloco: ' + error.message);
            } else {
                console.log('Bloco deletado com sucesso');
                setBlocoAtualizado(prev => prev + 1); // Atualiza lista
            }
        } catch (err) {
            console.error('Erro inesperado ao deletar bloco:', err);
            alert('Erro inesperado ao deletar bloco.');
        }
    }

    async function handleAbrirTarefa(tarefaId) {
        if (!tarefaId) {
            console.error('Tarefa ID is undefined');
            return;
        }
        if (!userId) {
            console.error('User ID is undefined');
            return;
        }
        
        try {
            console.log('Opening task:', tarefaId, 'for user:', userId);
            const { data, error } = await supabase
                .from('tarefas')
                .select('*')
                .eq('id', tarefaId)
                .eq('usuario_id', userId)
                .single();
                
            if (error) {
                console.error('Error fetching task:', error);
                alert('Erro ao carregar tarefa: ' + error.message);
                return;
            }
            
            if (data) {
                console.log('Task data loaded:', data);
                setTarefas(data);
                if (data.tipo === 'blocos') {
                    setModelo(1);
                } else if (data.tipo === 'lista') {
                    setModelo(2);
                } else {
                    setModelo(0);
                }
            } else {
                console.error('Tarefa não encontrada ou não pertence ao usuário.');
                alert('Tarefa não encontrada.');
            }
        } catch (err) {
            console.error('Unexpected error opening task:', err);
            alert('Erro inesperado ao abrir tarefa.');
        }
    }

    

    useEffect(() => {
        console.log('HomePageUser - userName:', userName, 'userId:', userId);
        if (!userName || !userId) {
            console.error('User name or ID not found in state or localStorage');
        }
    }, [userName, userId]);

    async function handleAddBlocoPessoal(nomeBloco) {
        if (!nomeBloco || !userId || !tarefas.id) {
            console.error('Nome do bloco, User ID ou Tarefa ID não pode ser vazio');
            return;
        }
        
        // Com RLS desabilitado, podemos inserir diretamente
        try {
            const { data, error } = await supabase
                .from('blocos')
                .insert([{ 
                    nome: nomeBloco, 
                    usuario_id: userId,
                    tarefa_id: tarefas.id,
                    done: false
                }])
                .select();
                
            if (error) {
                console.error('Erro ao adicionar bloco:', error);
                alert('Erro ao adicionar bloco: ' + error.message);
            } else {
                console.log('Bloco adicionado com sucesso:', data);
                setNomeBloco(''); // Clear input after adding block
                setInput(false); // Reset input state
                setButton(true); // Reset button state
                setBlocoAtualizado(prev => prev + 1); // Dispara atualização dos blocos
            }
        } catch (err) {
            console.error('Erro inesperado ao adicionar bloco:', err);
            alert('Erro inesperado ao adicionar bloco. Tente novamente.');
        }
    }

    useEffect(() => {
        async function fetchBlocos() {
            if (!userId || !tarefas.id) {
                console.error('User ID ou Tarefa ID not found');
                setBlocos([]);
                return;
            }
            
            try {
                console.log('Fetching blocos for userId:', userId, 'tarefaId:', tarefas.id);
                const { data, error } = await supabase
                    .from('blocos')
                    .select('*')
                    .eq('usuario_id', userId)
                    .eq('tarefa_id', tarefas.id);
                    
                if (error) {
                    console.error('Error fetching blocks:', error);
                    setBlocos([]);
                } else {
                    console.log('Blocks fetched successfully:', data);
                    setBlocos(data || []);
                }
            } catch (err) {
                console.error('Unexpected error fetching blocks:', err);
                setBlocos([]);
            }
        }
        fetchBlocos();
    }, [userId, blocoAtualizado, tarefas.id]);

    // Função para marcar bloco como concluído ou não concluído
    async function handleBlocoDone(blocoId, doneValue) {
        if (!blocoId) return;
        
        try {
            console.log(`Updating bloco ${blocoId} to done: ${doneValue}`);
            const { error } = await supabase
                .from('blocos')
                .update({ done: doneValue })
                .eq('id', blocoId);
                
            if (error) {
                console.error('Erro ao atualizar status do bloco:', error);
                alert('Erro ao atualizar bloco: ' + error.message);
            } else {
                console.log('Bloco status updated successfully');
                setBlocoAtualizado(prev => prev + 1); // Atualiza lista
            }
        } catch (err) {
            console.error('Erro inesperado ao atualizar bloco:', err);
            alert('Erro inesperado ao atualizar bloco.');
        }
    }

    // Função para deletar tarefa
    async function handleDeleteTarefa() {
        const confirmation = window.confirm(
            `Tem certeza que deseja excluir a tarefa "${tarefas.nome}"?\n\nEsta ação não pode ser desfeita e todos os blocos/itens associados serão perdidos.`
        );

        if (!confirmation) return;

        try {
            console.log('Deleting task:', tarefas.id);
            
            // Primeiro, deletar todos os blocos associados à tarefa específica
            const { error: blocosError } = await supabase
                .from('blocos')
                .delete()
                .eq('tarefa_id', tarefas.id)
                .eq('usuario_id', userId);

            if (blocosError) {
                console.error('Erro ao deletar blocos da tarefa:', blocosError);
            }

            // Depois, deletar a tarefa
            const { error: tarefaError } = await supabase
                .from('tarefas')
                .delete()
                .eq('id', tarefas.id)
                .eq('usuario_id', userId);

            if (tarefaError) {
                console.error('Erro ao deletar tarefa:', tarefaError);
                alert('Erro ao deletar tarefa: ' + tarefaError.message);
            } else {
                console.log('Tarefa deletada com sucesso');
                // Voltar para a tela inicial
                setTarefas([]);
                setModelo(0);
                setTarefasAtualizadas(prev => prev + 1);
            }
        } catch (err) {
            console.error('Erro inesperado ao deletar tarefa:', err);
            alert('Erro inesperado ao deletar tarefa.');
        }
    }

    return (
        <div id="homePageUser">
            <Sidebar
                userName={userName}
                userId={userId}
                handleAbrirTarefa={handleAbrirTarefa}
                tarefasAtualizadas={tarefasAtualizadas}
                setPopUpPessoal={setPopUpPessoal}
            />
            {popUpPessoal && (
                <PopUpPessoal
                    popUpPessoal={popUpPessoal}
                    setPopUpPessoal={setPopUpPessoal}
                    onTaskAdded={() => setTarefasAtualizadas(prev => prev + 1)}
                />
            )}
            <div id='content'>
                {modelo === 1 && tarefas && tarefas.nome ? (
                    <div className='task-details-blocos'>
                        <div className='task-header'>
                            <h2>Tarefa: {tarefas.nome}</h2>
                            <button className='delete-task-btn' onClick={handleDeleteTarefa} title="Excluir tarefa">
                                🗑️
                            </button>
                        </div>
                        <div className='info-blocos'>
                            <p>Tipo: {tarefas.tipo}</p>
                            <p>Data de criação: {tarefas.data}</p>
                        </div>
                        <div className='blocos'>
                            <div className='blocos-andamento'>
                                {blocos.filter(bloco => !bloco.done).map((bloco) => (
                                    <div className='blocoContainer' key={bloco.id}>
                                        <button
                                            key={bloco.id}
                                            className='bloco'
                                            onClick={() => handleBlocoDone(bloco.id, true)}
                                        >
                                            <h3>{bloco.nome}</h3>
                                        </button>
                                        <button className='deleteBloco' onClick={() => handleDeleteBloco(bloco.id)}>
                                            X
                                        </button>
                                    </div>
                                ))}
                                {input && (
                                    <input
                                        className='input-bloco'
                                        type="text"
                                        value={nomeBloco}
                                        onChange={e => setNomeBloco(e.target.value)}
                                        placeholder="Nome do bloco"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddBlocoPessoal(nomeBloco);
                                            }
                                        }}
                                    />
                                )}
                                {button && (
                                    <button className='add-bloco-btn' onClick={() => {
                                        setInput(true);
                                        setButton(false);
                                    }}>Adicionar bloco</button>
                                )}
                            </div>
                            <div className='linha' />
                            <div className='blocos-concluidas'>
                                {/* Blocos concluídos */}
                                {blocos.filter(bloco => bloco.done).map((bloco) => (
                                    <div className='blocoContainer' key={bloco.id}>
                                        <button
                                            key={bloco.id}
                                            className='bloco'
                                            style={{ backgroundColor: '#16406dff', color: '#fff', textDecoration: 'line-through' }}
                                            onClick={() => handleBlocoDone(bloco.id, false)}
                                        >
                                            <h3>{bloco.nome}</h3>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : modelo === 2 && tarefas && tarefas.nome ? (
                    <div className='task-details-lista'>
                        <div className='task-header'>
                            <h2>Tarefa: {tarefas.nome}</h2>
                            <button className='delete-task-btn' onClick={handleDeleteTarefa} title="Excluir tarefa">
                                🗑️
                            </button>
                        </div>
                        <div className='info-lista'>
                            <p>Tipo: {tarefas.tipo}</p>
                            <p>Data de criação: {tarefas.data}</p>
                        </div>
                        <div className='lista-container'>
                            <div className='lista-items'>
                                {/* Items da lista */}
                                {blocos.map((item) => (
                                    <div className='lista-item' key={item.id}>
                                        <input
                                            type="checkbox"
                                            className='lista-checkbox'
                                            checked={item.done || false}
                                            onChange={() => handleBlocoDone(item.id, !item.done)}
                                        />
                                        <div className={`lista-content ${item.done ? 'completed' : ''}`}>
                                            {item.nome}
                                        </div>
                                        <button className='delete-item' onClick={() => handleDeleteBloco(item.id)}>
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {input && (
                                    <div className='lista-item'>
                                        <input
                                            type="checkbox"
                                            className='lista-checkbox'
                                            disabled
                                        />
                                        <input
                                            className='input-lista-item'
                                            type="text"
                                            value={nomeBloco}
                                            onChange={e => setNomeBloco(e.target.value)}
                                            placeholder="Digite o item da lista"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddBlocoPessoal(nomeBloco);
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                {button && (
                                    <button className='add-lista-btn' onClick={() => {
                                        setInput(true);
                                        setButton(false);
                                    }}>+ Adicionar item</button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1>Task Manager.</h1>
                        <h2>Selecione uma tarefa para ver os detalhes.</h2>
                        <h2>Atenção!</h2>
                        <h2>Funcionalidades de espaço de equipe em desenvolvimento</h2>
                    </div>
                )}
            </div>
        </div>
    );
}