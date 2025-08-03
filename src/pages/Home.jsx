import React, { use } from 'react';
import './static/Home.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoginGoogle from './components/Google.jsx';

export default function Home() {
  const [nome, setNome] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const navigate = useNavigate();
  const [login, setlogin] = React.useState(true);

  // Funções para abrir links externos
  function handleGitHub() {
    window.open('https://github.com/PedroSencio/Task-Manager-', '_blank');
  }

  function handleLinkedIn() {
    window.open('https://www.linkedin.com/in/pedro-henrique-sencio-3b74a6275/', '_blank');
  }

  async function handleLogin() {
    if (nome === '' || senha === '') {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Buscar usuário na tabela users pelo nome
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nome', nome.trim())
        .single();

      if (userError || !userData) {
        alert('Nome de usuário não encontrado.');
        return;
      }

      // Verificar senha
      if (userData.senha !== senha.trim()) {
        alert('Senha incorreta.');
        return;
      }

      // Login bem-sucedido
      alert('Login bem-sucedido! Bem-vindo, ' + userData.nome);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userName', userData.nome);
      navigate(`/${userData.nome}`, { state: { userId: userData.id, userName: userData.nome } });
      
    } catch (err) {
      console.error('Erro no login:', err);
      alert('Erro inesperado no login. Tente novamente.');
    }
  }    

  async function handleCadastro() {
    if (nome === '' || senha === '') {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Validações locais
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    try {
      // Verificar se o nome de usuário já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('nome', nome.trim());

      // Se encontrou usuário, significa que já existe
      if (existingUser && existingUser.length > 0) {
        alert('Este nome de usuário já está em uso. Tente outro.');
        return;
      }

      // Criar novo usuário diretamente na tabela usuarios
      const { data: newUser, error: insertError } = await supabase
        .from('usuarios')
        .insert([{
          nome: nome.trim(),
          senha: senha.trim()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar usuário:', insertError);
        alert('Erro ao criar conta: ' + insertError.message);
        return;
      }

      // Cadastro bem-sucedido
      alert('Cadastro bem-sucedido! Bem-vindo, ' + newUser.nome);
      localStorage.setItem('userId', newUser.id);
      localStorage.setItem('userName', newUser.nome);
      navigate(`/${newUser.nome}`, { state: { userId: newUser.id, userName: newUser.nome } });
      
    } catch (err) {
      console.error('Erro no cadastro:', err);
      alert('Erro inesperado no cadastro. Tente novamente.');
    }
  }

  return (
    <div id='home'>
      <div id='header'>
        <div id='logo'>
          <img src="/logo.png" alt="Logo" /> 
          Task Manager
        </div>
        <div id='contato'>
          <button onClick={handleGitHub}>
            <img src="/git.png" alt="GitHub" />
            GitHub
          </button>
          <button id='linkedin-btn' onClick={handleLinkedIn}>
            <img src="/link.png" alt="LinkedIn" />
            LinkedIn
          </button>
        </div>
      </div>
      <div id='middle-box'>
          <button 
            className={login ? 'active' : ''}
            onClick={() => {
              setlogin(true);
            }}
          >
            <h2>login</h2>
          </button>
          <div id='line'></div>
          <button 
            className={!login ? 'active' : ''}
            onClick={() => {
              setlogin(false);
            }}
          >
            <h2>Cadastro</h2>
          </button>
      </div>
      <div id='login-box'>
        <div className={`content-container ${login ? 'login-active' : 'cadastro-active'}`}>
          <div className={`content ${login ? 'show' : 'hide'}`}>
            <div className='login-input'>
              <span>Nome de usuário:</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome de usuário" />
            </div>
            <div className='login-input'>
              <span>Senha:</span>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <button onClick={handleLogin}>Entrar</button>
            <LoginGoogle />
          </div>
          <div className={`content ${!login ? 'show-c' : 'hide-c'}`}>
            <div className='cadastro-input'>
              <span>Nome de usuário:</span>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Escolha um nome de usuário" />
            </div>
            <div className='cadastro-input'>
              <span>Senha:</span>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <button onClick={handleCadastro}>Cadastrar</button>
            <LoginGoogle />
          </div>
        </div>
      </div>
    </div>
  );
}