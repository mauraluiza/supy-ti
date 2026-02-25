# Documentação Técnica - Suppy (Sistema de Suporte)

## 1. Visão Geral da Arquitetura

A aplicação é uma **SPA (Single Page Application)** desenvolvida com **React** e **TypeScript**, utilizando **Vite** como build tool para máxima performance. O Backend é totalmente servido pelo **Supabase** (BaaS - Backend as a Service), aprovechando suas capacidades de Realtime e Segurança.

### Stack Tecnológica

- **Frontend:** React 18, TypeScript, TailwindCSS (Estilização), Lucide React (Ícones).
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage).
- **Hosting:** Vercel (Frontend), Supabase Cloud (Backend).
- **State Management:** React Context API + Hooks customizados.
- **Routing:** React Router v6.

---

## 2. Estrutura de Pastas

A organização do código segue o padrão de separação de responsabilidades:

```bash
src/
├── assets/          # Recursos estáticos (imagens, fontes)
├── components/      # Componentes React
│   ├── Dashboard/   # Componentes específicos do Dashboard (DashboardSectionHeader)
│   ├── Layout/      # Estruturas de página (Sidebar, Header, MainContainer)
│   └── UI/          # Componentes visuais genéricos (Button, Input, Card, Modal)
├── context/         # Gerenciamento de estado global (AuthContext)
├── hooks/           # Lógica reutilizável (useAuth)
├── pages/           # Páginas da aplicação (Dashboard, Clients, Tasks, Notes)
├── services/        # Camada de Serviços (api/CRUD encapsulado)
├── styles/          # Configurações globais de estilo (Tailwind, CSS)
├── types/           # Definições de tipos TypeScript
└── utils/           # Funções auxiliares (formatters, constants)
```

---

## 3. Modelo de Dados (Banco de Dados)

O banco de dados PostgreSQL no Supabase possui 3 tabelas principais, protegidas por RLS e com timestamps padronizados.

### Tabela `clients`
Armazena os clientes do sistema.
- **id (UUID):** Identificador único.
- **user_id (UUID):** Vínculo com o usuário dono do registro.
- **name (Text):** Nome do cliente.
- **system (Text):** 'winfood' | 'cplug'.
- **status (Text):** 'implantation' | 'active' | 'inactive'.
- **encrypted_password (Text):** Senha criptografada.
- **created_at / updated_at:** Timestamps automáticos (Gerenciados via Trigger).

### Tabela `tasks`
Tarefas vinculadas a clientes.
- **id (UUID):** Identificador único.
- **client_id (UUID):** FK para `clients`.
- **description (Text):** Conteúdo da tarefa (HTML/Rich Text).
- **status (Text):** 'urgent' | 'in_progress' | 'pending' | 'done'.
- **created_at / updated_at:** Timestamps automáticos.

### Tabela `notes`
Anotações gerais.
- **id (UUID):** Identificador único.
- **title (Text):** Título da nota.
- **content (Text):** Conteúdo enriquecido.
- **is_favorite (Boolean):** Flag de destaque.
- **created_at / updated_at:** Timestamps automáticos.

---

## 4. Camada de Serviços (Services)

A aplicação utiliza uma camada de serviços para isolar a lógica de comunicação com o Supabase:

- **`clientService.ts`**: Gerenciamento de clientes (CRUD).
- **`taskService.ts`**: Gerenciamento de tarefas (CRUD com Join de clientes).
- **`noteService.ts`**: Gerenciamento de anotações (CRUD).
- **`index.ts`**: Barrel file para exportação centralizada dos serviços.

Esta camada garante que o frontend não precise manipular diretamente o cliente do Supabase e facilita a manutenção e substituição de lógica de dados.

---

## 5. Automação e Timestamps

Foi implementada uma padronização via SQL para garantir a integridade dos dados temporais:

- **Função `update_updated_at_column()`**: Função em PL/pgSQL que atualiza automaticamente o campo `updated_at` para o tempo atual.
- **Triggers**: Configurados em todas as tabelas (`clients`, `tasks`, `notes`) para disparar a função de atualização `BEFORE UPDATE`.
- **Frontend**: O frontend não envia manualmente campos de data, delegando a responsabilidade total ao banco de dados (`DEFAULT NOW()`).

---

## 6. Segurança

### Autenticação
Gerenciada pelo Supabase Auth.

### Autorização (RLS)
Todas as tabelas possuem Row Level Security ativado.
Política padrão: `auth.uid() == user_id`.

### Criptografia de Dados Sensíveis
Senhas são criptografadas no frontend antes da persistência.
