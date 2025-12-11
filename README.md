# Planeador Financeiro 2026 - Portugal 🇵🇹

Ferramenta gratuita para ajudar famílias portuguesas a planear as suas finanças pessoais para 2026.

## Características

- ✅ Sistema de salário português (14 meses - Subsídio de Férias e Natal)
- 💳 Gestão de múltiplos empréstimos e dívidas
- 📊 Análise detalhada de despesas fixas e variáveis
- 🎯 Recomendações personalizadas e prioritizadas
- 💰 Cálculo de fundo de emergência
- 📈 Projeção financeira para fim de 2026
- 🇵🇹 Recursos e contexto específicos de Portugal

## Deploy no Vercel

### Opção 1: Deploy via GitHub (Recomendado)

1. **Criar repositório no GitHub:**
   - Vai a https://github.com/new
   - Cria um novo repositório (pode ser privado)
   - Não inicializes com README

2. **Fazer upload do código:**
   ```bash
   cd portugal-finance-planner-deploy
   git init
   git add .
   git commit -m "Initial commit: Portugal Finance Planner 2026"
   git branch -M main
   git remote add origin https://github.com/SEU-USERNAME/SEU-REPO.git
   git push -u origin main
   ```

3. **Deploy no Vercel:**
   - Vai a https://vercel.com
   - Clica em "Add New Project"
   - Importa o teu repositório do GitHub
   - Vercel vai detectar automaticamente Next.js
   - Clica em "Deploy"
   - Pronto! 🎉

### Opção 2: Deploy via Vercel CLI

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login e Deploy:**
   ```bash
   cd portugal-finance-planner-deploy
   vercel login
   vercel
   ```

3. **Seguir as instruções no terminal**

### Opção 3: Deploy via Drag & Drop

1. Vai a https://vercel.com/new
2. Arrasta a pasta `portugal-finance-planner-deploy` para o browser
3. Aguarda o deploy
4. Pronto! 🎉

## Desenvolvimento Local

Para testar localmente antes de fazer deploy:

```bash
cd portugal-finance-planner-deploy
npm install
npm run dev
```

Abre http://localhost:3000 no browser.

## Estrutura do Projeto

```
portugal-finance-planner-deploy/
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.js            # Layout principal
│   └── page.js              # Página inicial
├── components/
│   └── PortugalFinancePlanner2026.jsx  # Componente principal
├── package.json             # Dependências
├── next.config.js           # Configuração Next.js
├── tailwind.config.js       # Configuração Tailwind
└── README.md               # Este ficheiro
```

## Tecnologias

- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## Funcionalidades Futuras (Ideias)

- [ ] Exportar plano para PDF
- [ ] Guardar dados localmente (localStorage)
- [ ] Gráficos interativos
- [ ] Comparação ano a ano
- [ ] Modo escuro
- [ ] Múltiplos utilizadores/famílias

## Licença

Uso livre para famílias portuguesas 🇵🇹

---

Feito com ❤️ para ajudar famílias portuguesas a gerir melhor as suas finanças.
