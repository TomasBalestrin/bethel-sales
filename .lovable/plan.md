
Objetivo
- Corrigir o erro “Failed to send a request to the Edge Function” ao criar usuário (closer) no /admin, garantindo que o backend receba a requisição e responda corretamente.

Diagnóstico (o que está acontecendo)
- O backend “create-user” está funcionando: ao testar diretamente, ele responde 200 e criou o usuário e a role no banco.
- Porém, no navegador a chamada está falhando com “Failed to fetch”, o que indica erro de rede/CORS (a requisição nem chega ao backend).
- A requisição do navegador inclui o header `x-supabase-client-platform` (além de `authorization`, `apikey`, etc.). Hoje o CORS do `create-user` não permite esse header, então o preflight (OPTIONS) pode falhar e o browser bloqueia a chamada.

Solução proposta (alto nível)
- Ajustar o CORS da função `create-user` para:
  1) Permitir o header `x-supabase-client-platform`
  2) Incluir explicitamente `Access-Control-Allow-Methods` (boa prática para preflight)
  3) (Opcional) padronizar o mesmo CORS nas outras funções para evitar erros parecidos no futuro

Mudanças a implementar (código)
1) Editar `supabase/functions/create-user/index.ts`
   - Atualizar `corsHeaders` para algo como:
     - `Access-Control-Allow-Origin: *`
     - `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, x-supabase-client-platform`
     - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
   - Manter o handler de OPTIONS retornando `new Response(null, { headers: corsHeaders })`

2) (Recomendado) Padronizar CORS também em:
   - `supabase/functions/disc-form/index.ts`
   - `supabase/functions/webhook-credenciamento/index.ts`
   - `supabase/functions/webhook-participants/index.ts`
   Motivo: qualquer chamada via browser pode começar a falhar se o cliente incluir headers adicionais.

Validação / Testes (para confirmar que resolveu)
- Teste 1 (UI): no Painel Admin, criar um usuário closer novo e confirmar:
  - O toast não mostra mais “Failed to send a request…”
  - O usuário aparece na lista de usuários
- Teste 2 (rede): inspecionar a chamada no navegador e confirmar que:
  - O OPTIONS retorna 200/204 com os headers CORS corretos
  - O POST retorna 200 com `{ success: true }` (ou 400 com mensagem amigável em caso de email já existente)
- Teste 3 (log): conferir logs do backend e ver “Starting create-user function” + “User created successfully …”

Riscos e cuidados
- Segurança: manter a verificação de admin no backend (já existe) e continuar registrando roles apenas na tabela `user_roles` (já está correto).
- Compatibilidade: permitir apenas os headers necessários (em vez de liberar tudo) para manter CORS restritivo o suficiente.

Resultado esperado
- A criação de usuários (admin/closer) pelo Painel Admin funciona de forma consistente no navegador, sem erro de “Failed to fetch”, e o backend recebe as requisições normalmente.
