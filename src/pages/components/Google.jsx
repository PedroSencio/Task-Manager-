import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../static/Home.css';

const LoginGoogle = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Escuta mudanças de autenticação do Google (Supabase Auth ainda necessário para OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
        const userName = user.user_metadata?.name || user.email;
        const userId = user.id;
        
        try {
          // Verificar se usuário já existe na tabela usuarios
          const { data: existingUser, error: checkError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('nome', userName)
            .single();

          let finalUser;
          
          if (!existingUser) {
            // Criar usuário na tabela usuarios se não existir
            const { data: newUser, error: insertError } = await supabase
              .from('usuarios')
              .insert([{
                nome: userName,
                senha: 'google_auth' // Senha especial para login Google
              }])
              .select()
              .single();

            if (insertError) {
              console.error('Erro ao criar usuário Google:', insertError);
              return;
            }
            finalUser = newUser;
          } else {
            finalUser = existingUser;
          }

          // Salva no localStorage
          localStorage.setItem('userId', finalUser.id);
          localStorage.setItem('userName', finalUser.nome);
          
          // Redireciona para HomePageUser
          navigate(`/${finalUser.nome}`, { 
            state: { userId: finalUser.id, userName: finalUser.nome } 
          });
        } catch (err) {
          console.error('Erro ao processar login Google:', err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Erro ao fazer login com Google:', error.message);
    } else {
      console.log('Redirecionando para login com Google...');
    }
  };

  return (
    <button id='google' onClick={loginWithGoogle}>
        <img src="/google.png" alt="" />
      Entrar com Google
    </button>
  );
};

export default LoginGoogle;
