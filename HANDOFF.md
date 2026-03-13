# 📌 HANDOFF TÉCNICO – PROJETO EM ANDAMENTO

## 1️⃣ Informações Gerais

Nome do projeto: Supy TI  
Tipo: Sistema interno de gestão de clientes e tarefas  
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

## 4️⃣ Funcionalidades Já Implementadas

✔ Login com autenticação Supabase  
✔ Dashboard  
✔ Tela de Clientes  
✔ Tela de Tarefas  
✔ Tela de Informações Gerais  
✔ Modais de cadastro padronizados  
✔ Integração parcial com banco  
✔ Empty states padronizados  
✔ Padronização visual dos Cards (Tarefas e Notas)  
✔ Sistema avançado de Busca e Filtros unificado (Clientes, Tarefas, Notas)  
✔ Gestão de Prazos (due_at) e Tickets em Tarefas  
✔ Sistema de categorização por Tags em Notas

---

## 5️⃣ Regras de Arquitetura (OBRIGATÓRIO)

1. Sempre explicar antes de implementar.
2. Trabalhar por etapas pequenas.
3. Não tomar decisões silenciosamente.
4. Seguir o design system existente.
5. Componentes devem ser reutilizáveis.
6. Separar lógica de UI.
7. Código limpo e escalável.
8. Evitar duplicação.

---

## 6️⃣ Padrões de UI

- Setas de navegação sempre em azul padrão
- Dashboard é apenas visual (não interativo nos cards)
- Empty states padronizados
- Modais centralizados com overlay desfocado
- Nome do sistema: Supy TI (apenas 1 P)
- Logo oficial: assets/supy-logo.png

---

## 7️⃣ Banco de Dados

- Banco já criado
- Tabelas existentes
- Supabase já conectado
- Auth funcionando
- CRUD em implementação

Nunca criar tabela duplicada.
Sempre verificar schema antes de alterar.

---

## 8️⃣ Estado Atual do Projeto

Acabamos de finalizar uma grande unificação visual e estrutural no sistema:
- **Tarefas**: Inclusão de `due_at` (prazos), detecção de tarefas "Atrasadas", campo de `ticket` autônomo e buscas interligadas.
- **Notas**: Alinhamento do design dos cards com Tarefas (`min-h-[120px]`), melhoria no hover de ações (Favoritar, Editar, Excluir), e implementação de `tags` dinâmicas usando JSONB.
- **Filtros**: Componente `PageSearch` consolidado em todas as listagens usando Dropdowns modernos.

O projeto está com a arquitetura do Frontend bastante sólida, responsiva e consistente.

---

## 9️⃣ Próximo Objetivo

Aguardando definição do usuário. Possíveis caminhos:
- Finalizar integrações pendentes com Supabase.
- Testes gerais das novas features de Notas e Tarefas.
- Implementação de novos módulos (ex: automações, relatórios).

⚠️ IMPORTANTE:
Explique sempre o plano antes de começar a codar.
Aguarde confirmação antes de implementar.