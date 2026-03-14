# 📌 HANDOFF TÉCNICO – PROJETO EM ANDAMENTO

## 1️⃣ Informações Gerais

Nome do projeto: Supy TI  
Tipo: Sistema interno de gestão de clientes, tarefas e notas  
Status: Em desenvolvimento ativo  

Objetivo do projeto:
Sistema profissional com arquitetura limpa, foco em escalabilidade e boas práticas.

---

## 2️⃣ Stack Tecnológica

Frontend:
- React
- TypeScript
- Vite
- React Router

Backend:
- Supabase
  - Auth
  - PostgreSQL

Estilo:
- Design System próprio
- Componentização reutilizável
- Layout com sidebar fixa

---

## 3️⃣ Arquitetura Atual

Estrutura baseada em:

- Páginas (pages)
- Componentes reutilizáveis
- Modais padronizados
- Serviços para comunicação com Supabase
- Separação clara entre UI e lógica

---

## 4️⃣ Funcionalidades já implementadas

✔ Login com autenticação Supabase  
✔ Dashboard  
✔ Tela de Clientes  
✔ Tela de Tarefas  
✔ Tela de Notas  
✔ Modais de cadastro padronizados  
✔ Integração com banco  
✔ Empty states padronizados  
✔ Padronização visual dos Cards (Tarefas e Notas)  
✔ Sistema avançado de Busca e Filtros unificado (Clientes, Tarefas, Notas)  
✔ Gestão de Prazos (due_at) e Tickets em Tarefas  
✔ Sistema de categorização por Tags em Notas

---

## 5️⃣ Regras de Arquitetura (OBRIGATÓRIO)

1. Trabalhar por etapas pequenas.
2. Seguir o design system definido para o projeto.
3. Componentes devem ser reutilizáveis sempre que possível.
4. Separar lógica de UI.
5. Código limpo e escalável.
6. Evitar duplicação.

---

## 6️⃣ Padrões de UI

- Setas de navegação sempre em azul padrão
- Dashboard é apenas visual (não interativo nos cards)
- Empty states padronizados
- Modais centralizados com overlay desfocado
- Nome do sistema: Supy TI
- Logo oficial: assets/supy-logo.png

---

## 7️⃣ Banco de Dados

- Banco já criado
- Tabelas existentes
- Supabase já conectado
- Auth funcionando
- CRUD em implementação

---

## 8️⃣ Estado Atual do Projeto

- **Tarefas**: Inclusão de `due_at` (prazos), detecção de tarefas "Atrasadas", campo de `ticket` autônomo e buscas interligadas.
- **Notas**: Alinhamento do design dos cards com Tarefas (`min-h-[120px]`), melhoria no hover de ações (Favoritar, Editar, Excluir), e implementação de `tags` dinâmicas usando JSONB.
- **Filtros**: Componente `PageSearch` consolidado em todas as listagens usando Dropdowns modernos.

O projeto está com a arquitetura do Frontend bastante sólida, responsiva e consistente.

---

## 9️⃣ Próximo Objetivo

Tela de dashboard:
- Implementar cards de métricas, incluindo quantidade de clientes ativos, tarefas pendentes, atrasadas e concluídas hoje e quantidade de notas cadastradas.
- Alterar o nome da seção de clientes para clientes adicionados recentemente
- Incluir saudação no topo e mostrar a data atual.
- Contadores nas seções.