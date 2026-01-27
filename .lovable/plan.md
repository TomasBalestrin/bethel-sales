

# Plano: Atualizar Fotos de Perfil dos Closers

## Resumo

Atualizar o campo `avatar_url` de 4 closers com as URLs de imagem fornecidas.

## Atualizações a Executar

| Closer | URL da Foto |
|--------|-------------|
| Tainara | http://cleitonquerobin2.com/wp-content/uploads/2025/10/Tai.png |
| Isis | http://cleitonquerobin2.com/wp-content/uploads/2025/10/Isis-2.png |
| Hannah | https://cleitonquerobin2.com/wp-content/uploads/2025/10/Hanna.png |
| Leandro | http://cleitonquerobin2.com/wp-content/uploads/2025/10/Leandro.png |

## SQL a Executar

```sql
UPDATE profiles SET avatar_url = 'http://cleitonquerobin2.com/wp-content/uploads/2025/10/Tai.png' 
WHERE id = 'de22d9b1-4194-448c-8513-382afbca3478';

UPDATE profiles SET avatar_url = 'http://cleitonquerobin2.com/wp-content/uploads/2025/10/Isis-2.png' 
WHERE id = '165eb190-ea3e-4536-903b-e6a8d7233ec8';

UPDATE profiles SET avatar_url = 'https://cleitonquerobin2.com/wp-content/uploads/2025/10/Hanna.png' 
WHERE id = '58c59f6e-3677-4017-855e-466db6ddde7b';

UPDATE profiles SET avatar_url = 'http://cleitonquerobin2.com/wp-content/uploads/2025/10/Leandro.png' 
WHERE id = 'a9974cb1-66aa-4761-bc78-626abe2c7985';
```

## Resultado Esperado

Após a execução:
- 4 closers terão suas fotos de perfil atualizadas
- As fotos aparecerão nos cards da tela de Closers e nos painéis de detalhes
- Closers sem foto: Kennedy e Tomas Balestrin (não foram fornecidas URLs)

## Implementação

Atualizações serão feitas diretamente no banco via ferramenta de atualização de dados.

