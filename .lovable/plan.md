
# Plano: Corrigir Link do Instagram

## Problema Identificado

Ao clicar no link do Instagram, a URL está sendo tratada como rota interna da aplicação:
```
/participantes/instagram.com/sabrinalice_
```

Quando deveria ir para:
```
https://instagram.com/sabrinalice_
```

O código está correto no arquivo, mas algo está causando a perda do prefixo `https://`.

## Solução

Aplicar correções em dois arquivos para garantir que a URL seja absoluta:

### Correção 1: Usar URL completa com www

Alterar de:
```tsx
href={`https://instagram.com/${participant.instagram.replace("@", "")}`}
```

Para:
```tsx
href={`https://www.instagram.com/${participant.instagram.replace("@", "").trim()}`}
```

### Correção 2: Adicionar tratamento para URLs já completas

Alguns campos de instagram podem vir já com a URL completa. Adicionar lógica para detectar isso:

```tsx
const getInstagramUrl = (instagram: string) => {
  const clean = instagram.replace("@", "").trim();
  if (clean.startsWith("http")) return clean;
  return `https://www.instagram.com/${clean}`;
};
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Participants.tsx` | Atualizar href do link do Instagram (linha ~373) |
| `src/components/participants/ParticipantPanel.tsx` | Atualizar href do link do Instagram (linha ~387) |

## Detalhes Técnicos

- Adicionar `.trim()` para remover espaços extras que possam existir
- Usar `www.instagram.com` para garantir compatibilidade
- Verificar se o valor já contém `http` para evitar duplicação do protocolo
