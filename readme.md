# 🏛️ Bibliotheca: Cânone das Sombras

> *"O mistério da existência humana não consiste apenas em permanecer vivo, mas em encontrar algo pelo qual viver." — Fiódor Dostoiévski*

Uma plataforma moderna e imersiva para gestão de acervo pessoal e acompanhamento de leituras, impulsionada por Inteligência Artificial e desenhada sob a estética *Editorial* e *Dark Academia*.

---

## 📖 Sobre o Projeto

A **Bibliotheca** nasceu como um projeto ambicioso para consolidar conhecimentos avançados em **Engenharia de Software**. O objetivo principal é criar uma aplicação Full Stack robusta, simulando desafios reais da indústria, como integração de APIs externas (IA e Livros), armazenamento em nuvem, segurança de credenciais e design de interface fluida.

Atualmente, o projeto está passando por uma fase de refatoração, adoção de **Clean Code** e aprimoramento da identidade visual, preparando a base para futuras implementações de CI/CD, automação de estudos (Core-Brain) e arquitetura de microsserviços.

---

## 🚀 Stack Tecnológica e Arquitetura

O ecossistema adota uma arquitetura separada (Client-Server) para garantir escalabilidade e separação de responsabilidades.

### Back-end (O Motor e Cofre)
* **Linguagem:** Java 17+
* **Framework:** Spring Boot 3 (Spring Web, Spring Data JPA, Validation)
* **Segurança:** Spring Security com autenticação JWT.
* **IA Generativa:** Integração com Google Gemini API para atuar como o "Oráculo", gerando resumos e recomendações literárias.
* **Banco de Dados:** FireBase.

### Front-end (A Interface do Acervo)
* **Framework:** React.js (via Vite para alta performance).
* **Estilização:** Tailwind CSS (substituindo CSS Modules), com paletas customizadas (`burnished-gold`, `rich-charcoal`) e design tipográfico com serifa.
* **Animações:** Framer Motion para micro-interações e transições de página.
* **Iconografia e Gráficos:** Lucide React e Recharts.

### Cloud & Infraestrutura
* **AWS S3:** Armazenamento de objetos (upload de artes de capa em alta definição).
* **AWS RDS:** Instância de banco de dados relacional na nuvem.
* **Firebase:** Autenticação de usuários (Auth) gerindo o selo de segurança inicial.
* **Docker:** (Em implementação) Containerização da aplicação.

---

## ⚙️ Funcionalidades (O que ele faz?)

* **Acervo Pessoal (CRUD):** Cadastro e gestão de manuscritos, conectando-se à API do Google Books para resgatar edições e dados de ISBN.
* **O Oráculo (Integração com IA):** O sistema consulta a Gemini API para enriquecer os dados do livro automaticamente e fornecer insights.
* **Selo de Segurança:** Login seguro e protegido combinando Firebase Auth e validação de tokens JWT no back-end.
* **Dossiê Literário:** Dashboard imersivo com gráficos de leitura e metas anuais.
* **Estúdio & Panteão:** Áreas dedicadas para organização de roteiros de estudos de autores clássicos.

---

## 🔒 Configuração de Segurança (Variáveis de Ambiente)

Para garantir a segurança do projeto, as chaves de API e senhas não estão no código-fonte. Antes de executar, configure os arquivos de ambiente:

### 1. Front-end (`web-vite/.env`)
Crie um arquivo `.env` na raiz da pasta do Front-end com as suas credenciais do Firebase e Google Books:
```env
VITE_GOOGLE_BOOKS_API_KEY=sua_chave_aqui
VITE_FIREBASE_API_KEY=sua_chave_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_dominio
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_id
VITE_FIREBASE_APP_ID=seu_app_id
