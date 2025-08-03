import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../static/Home.css';

const LoginGoogle = () => {
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    // URL de redirecionamento sempre para a página inicial
    const redirectUrl = window.location.origin;

    console.log('Hostname:', window.location.hostname);
    console.log('Redirect URL:', redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
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
