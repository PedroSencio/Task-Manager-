-- SQL para adicionar a coluna tarefa_id na tabela blocos
-- Execute este comando no Supabase SQL Editor se a coluna não existir

-- Verificar se a coluna existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'blocos' AND column_name = 'tarefa_id';

-- Se a coluna não existir, execute:
ALTER TABLE blocos ADD COLUMN IF NOT EXISTS tarefa_id bigint REFERENCES tarefas(id) ON DELETE CASCADE;

-- Comando para limpar dados existentes (opcional, se necessário):
-- DELETE FROM blocos WHERE tarefa_id IS NULL;

-- Comando para verificar a estrutura da tabela:
-- \d blocos
