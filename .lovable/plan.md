

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

## Solucao

Aplicar correcoes em dois arquivos para garantir que a URL seja absoluta:

### Correcao 1: Usar URL completa com www

Alterar de:
```tsx
href={`https://instagram.com/${participant.instagram.replace("@", "")}`}
```

Para:
```tsx
href={`https://www.instagram.com/${participant.instagram.replace("@", "").trim()}`}
```

### Correcao 2: Adicionar tratamento para URLs ja completas

Alguns campos de instagram podem vir ja com a URL completa. Adicionar logica para detectar isso:

```tsx
const getInstagramUrl = (instagram: string) => {
  const clean = instagram.replace("@", "").trim();
  if (clean.startsWith("http")) return clean;
  return `https://www.instagram.com/${clean}`;
};
```

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Participants.tsx` | Atualizar href do link do Instagram (linha ~276) |
| `src/components/participants/ParticipantPanel.tsx` | Atualizar href do link do Instagram (linha ~387) |

## Detalhes Tecnicos

- Adicionar `.trim()` para remover espacos extras que possam existir
- Usar `www.instagram.com` para garantir compatibilidade
- Verificar se o valor ja contem `http` para evitar duplicacao do protocolo
- Criar funcao helper `getInstagramUrl` em ambos os arquivos para padronizar

