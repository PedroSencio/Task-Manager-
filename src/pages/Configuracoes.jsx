import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import './static/Configuracoes.css';

export default function Configuracoes() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [tarefasAtualizadas, setTarefasAtualizadas] = useState(0);
    const [popUpPessoal, setPopUpPessoal] = useState(false);

    const userId = localStorage.getItem('userId');

    const handleAbrirTarefa = () => {
        // Função vazia para o Sidebar (não usado na tela de configurações)
    };

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000);
    };

    const handleUpdateName = async () => {
        if (!userName.trim()) {
            showMessage('O nome não pode estar vazio', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('usuarios')
                .update({ nome: userName.trim() })
                .eq('id', userId);

            if (error) {
                console.error('Erro ao atualizar nome:', error);
                showMessage('Erro ao atualizar nome', 'error');
            } else {
                localStorage.setItem('userName', userName.trim());
                showMessage('Nome atualizado com sucesso!', 'success');
            }
        } catch (err) {
            console.error('Erro inesperado:', err);
            showMessage('Erro inesperado ao atualizar nome', 'error');
        }
        setIsLoading(false);
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('Todos os campos de senha são obrigatórios', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('A nova senha e confirmação não coincidem', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('A nova senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // Verificar senha atual
            const { data: user, error: verifyError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .eq('senha', currentPassword)
                .single();

            if (verifyError || !user) {
                showMessage('Senha atual incorreta', 'error');
                setIsLoading(false);
                return;
            }

            // Atualizar senha
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ senha: newPassword })
                .eq('id', userId);

            if (updateError) {
                console.error('Erro ao atualizar senha:', updateError);
                showMessage('Erro ao atualizar senha', 'error');
            } else {
                showMessage('Senha atualizada com sucesso!', 'success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            console.error('Erro inesperado:', err);
            showMessage('Erro inesperado ao atualizar senha', 'error');
        }
        setIsLoading(false);
    };

    const handleDeleteAccount = async () => {
        const confirmation = window.confirm(
            'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos.'
        );

        if (!confirmation) return;

        const doubleConfirmation = window.confirm(
            'Esta é sua última chance! Confirma que deseja excluir permanentemente sua conta?'
        );

        if (!doubleConfirmation) return;

        setIsLoading(true);
        try {
            // Deletar todas as tarefas do usuário
            await supabase
                .from('tarefas')
                .delete()
                .eq('usuario_id', userId);

            // Deletar todos os blocos do usuário
            await supabase
                .from('blocos')
                .delete()
                .eq('usuario_id', userId);

            // Deletar o usuário
            const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', userId);

            if (error) {
                console.error('Erro ao deletar conta:', error);
                showMessage('Erro ao deletar conta', 'error');
            } else {
                // Fazer logout e limpar dados
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                await supabase.auth.signOut().catch(() => {});
                
                alert('Conta excluída com sucesso!');
                navigate('/');
            }
        } catch (err) {
            console.error('Erro inesperado:', err);
            showMessage('Erro inesperado ao deletar conta', 'error');
        }
        setIsLoading(false);
    };

    return (
        <div style={{display: 'flex', backgroundColor: 'rgb(0, 0, 0)', width: '100vw', height: '100vh'}}>
            <Sidebar
                userName={userName}
                userId={userId}
                handleAbrirTarefa={handleAbrirTarefa}
                tarefasAtualizadas={tarefasAtualizadas}
                setPopUpPessoal={setPopUpPessoal}
            />
            <div className="configuracoes-container">
                <div className="configuracoes-header">
                    <button className="back-button" onClick={() => navigate('/home')}>
                        ← Voltar
                    </button>
                    <h1>Configurações</h1>
                </div>

                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <div className="configuracoes-content">
                    {/* Seção de Perfil */}
                    <div className="config-section">
                        <h2>Perfil</h2>
                        <div className="config-item">
                            <label>Nome de usuário</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Seu nome"
                                    disabled={isLoading}
                                />
                                <button 
                                    onClick={handleUpdateName}
                                    disabled={isLoading}
                                    className="btn-primary"
                                >
                                    Atualizar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Segurança */}
                    <div className="config-section">
                        <h2>Segurança</h2>
                        <div className="config-item">
                            <label>Alterar senha</label>
                            <div className="password-inputs">
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Senha atual"
                                    disabled={isLoading}
                                />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nova senha"
                                    disabled={isLoading}
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmar nova senha"
                                    disabled={isLoading}
                                />
                            </div>
                            <button 
                                onClick={handleUpdatePassword}
                                disabled={isLoading}
                                className="btn-primary"
                            >
                                Alterar Senha
                            </button>
                        </div>
                    </div>

                    {/* Seção de Conta */}
                    <div className="config-section danger-section">
                        <h2>Zona de Perigo</h2>
                        <div className="config-item">
                            <label>Excluir conta</label>
                            <p className="warning-text">
                                Esta ação é irreversível. Todos os seus dados serão perdidos permanentemente.
                            </p>
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={isLoading}
                                className="btn-danger"
                            >
                                Excluir Conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
