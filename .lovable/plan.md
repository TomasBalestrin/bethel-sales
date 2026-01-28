

# Plano: Aplicar Identidade Visual Bethel ao Formulario

## Referencia Visual

A imagem mostra o estilo visual da marca Bethel:
- **Fundo**: Gradiente azul escuro (navy) para azul mais claro
- **Logo**: Bethel Educacao com icone branco
- **Tipografia**: Titulos brancos em italico/bold
- **Subtitulos**: Texto cinza claro
- **Botao CTA**: Branco com texto azul escuro
- **Estilo geral**: Corporativo, profissional, elegante

## Cores a Usar

| Elemento | Cor Atual | Nova Cor |
|----------|-----------|----------|
| Fundo | Gradiente roxo/rosa | Gradiente azul escuro (#0f172a to #1e3a5f) |
| Titulos | Roxo/Rosa | Branco |
| Botao principal | Gradiente roxo/rosa | Branco com texto azul |
| Cards | Branco/transparente | Branco/10 com backdrop |
| Barra progresso | Roxo/Rosa | Branco |
| Bordas | Roxo claro | Branco/20 |

## Paleta de Cores Bethel

```text
Primaria:     #1e3a5f (Azul escuro)
Secundaria:   #0f172a (Navy muito escuro)
Destaque:     #ffffff (Branco)
Texto:        #94a3b8 (Cinza claro)
Botao hover:  #f1f5f9 (Cinza muito claro)
```

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/DiscForm.tsx` | Mudar todos os backgrounds de roxo para azul |
| `src/components/disc-form/WelcomeScreen.tsx` | Novo layout inspirado na imagem, logo Bethel, cores azuis |
| `src/components/disc-form/QuestionBlock.tsx` | Cards com estilo azul, barra progresso branca |
| `src/components/disc-form/OpenQuestionsScreen.tsx` | Mesmo estilo visual azul |
| `src/components/disc-form/LoadingScreen.tsx` | Animacao em tons de azul |
| `src/components/disc-form/ResultScreen.tsx` | Resultado com visual Bethel |
| `src/components/disc-form/ErrorScreen.tsx` | Erro com estilo consistente |

## Implementacao Detalhada

### 1. WelcomeScreen - Novo Layout

Inspirado diretamente na imagem de referencia:

```typescript
<div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e3a5f] to-[#1e4a7a] flex items-center justify-center p-4">
  <div className="max-w-lg w-full text-center animate-fade-in">
    {/* Logo Bethel */}
    <div className="mb-10">
      <div className="flex items-center justify-center gap-3 mb-2">
        {/* Icone estilizado */}
        <svg className="w-14 h-14 text-white" .../>
        <div className="text-left">
          <span className="text-3xl font-bold text-white">Bethel</span>
          <span className="block text-sm text-gray-300">Educacao</span>
        </div>
      </div>
    </div>

    {/* Titulo Principal */}
    <h1 className="text-4xl md:text-5xl font-bold italic text-white mb-4">
      Intensivo da Alta Performance
    </h1>
    
    {/* Subtitulo */}
    <p className="text-xl text-gray-300 mb-6">
      Transforme seu potencial em resultados extraordinarios
    </p>
    
    {/* Descricao */}
    <p className="text-gray-400 mb-10 max-w-md mx-auto">
      Voce esta prestes a dar o primeiro passo rumo a alta performance...
    </p>

    {/* Saudacao ao participante */}
    {participantName && (
      <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-8">
        <p className="text-gray-300">Ola,</p>
        <p className="text-xl font-semibold text-white">{participantName}!</p>
      </div>
    )}

    {/* Botao CTA */}
    <Button className="w-full max-w-md h-14 text-lg font-semibold bg-white text-[#1e3a5f] hover:bg-gray-100 rounded-full shadow-lg">
      Iniciar Minha Jornada →
    </Button>
  </div>
</div>
```

### 2. QuestionBlock - Estilo Azul

```typescript
{/* Fundo */}
<div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e3a5f] py-6 px-4">
  {/* Barra de progresso branca */}
  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
    <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
  </div>
  
  {/* Cards de pergunta */}
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
    <h3 className="text-lg font-medium text-white mb-4">{question.text}</h3>
    
    {/* Opcoes */}
    <button className={cn(
      "w-full text-left p-4 rounded-xl border transition-all",
      selected 
        ? "border-white bg-white/20 text-white" 
        : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
    )}>
      {option}
    </button>
  </div>
</div>
```

### 3. OpenQuestionsScreen - Visual Consistente

```typescript
<div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e3a5f]">
  <h2 className="text-2xl font-bold text-white mb-2">
    Conta mais um pouco sobre voce...
  </h2>
  
  <Textarea className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
</div>
```

### 4. ResultScreen - Estilo Bethel

```typescript
<div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e3a5f]">
  {/* Card do arquetipo com fundo branco/10 */}
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
    <span className="text-5xl">{emoji}</span>
    <p className="text-white/70 uppercase text-xs">Seu Arquetipo Principal</p>
    <h2 className="text-2xl font-bold text-white">{name}</h2>
  </div>
  
  {/* Botao compartilhar */}
  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
    Compartilhar
  </Button>
</div>
```

### 5. Navegacao Inferior - Estilo Atualizado

```typescript
{/* Barra de navegacao */}
<div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-sm border-t border-white/10 p-4">
  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
    Voltar
  </Button>
  <Button className="bg-white text-[#1e3a5f] hover:bg-gray-100">
    Proximo →
  </Button>
</div>
```

### 6. LoadingScreen - Tons de Azul

Manter animacao mas trocar cores de roxo/rosa para azul/branco.

## Resultado Visual Esperado

```text
+------------------------------------------+
|       ╔═══╗  Bethel                      |
|       ╚═══╝  Educacao                    |
|                                          |
|     Intensivo da Alta                    |
|       Performance                        |
|                                          |
|   Transforme seu potencial em            |
|   resultados extraordinarios             |
|                                          |
|  Voce esta prestes a dar o primeiro      |
|  passo rumo a alta performance...        |
|                                          |
|         +------------------+             |
|         |   Ola, Maria!    |             |
|         +------------------+             |
|                                          |
|    [ Iniciar Minha Jornada → ]           |
|                                          |
+------------------------------------------+
```

## Beneficios

1. **Consistencia de marca**: Visual alinhado com identidade Bethel
2. **Profissionalismo**: Look corporativo e elegante
3. **Contraste**: Texto branco em fundo escuro fica muito legivel
4. **Modernidade**: Glassmorphism com backdrop-blur nos cards

