# 📚 Bibliotheca

![Badge em Desenvolvimento](https://img.shields.io/badge/STATUS-EM_DESENVOLVIMENTO-yellow?style=for-the-badge)
![Badge Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
![Badge Spring Boot](https://img.shields.io/badge/Spring_Boot-3-green?style=for-the-badge&logo=spring)
![Badge React](https://img.shields.io/badge/React-JS-blue?style=for-the-badge&logo=react)

> **Uma plataforma moderna para gestão de acervo pessoal e acompanhamento de leituras, impulsionada por Inteligência Artificial.**

---

## 📖 Sobre o Projeto

O **Bibliotheca** nasceu como um projeto ambicioso para consolidar conhecimentos em Engenharia de Software. O objetivo principal foi criar uma aplicação Full Stack robusta, simulando desafios reais do mercado de trabalho, como integração de APIs externas, armazenamento em nuvem e segurança.

Atualmente, o projeto está passando por uma fase de **refatoração e polimento** (Clean Code), preparando a base para futuras implementações de CI/CD e arquitetura de microsserviços.

### O que ele faz?
A aplicação permite que o usuário cadastre seus livros, acompanhe o progresso de leitura e receba insights automatizados sobre as obras.

## 🚀 Stack Tecnológica

O projeto foi o meu "laboratório" para experimentar uma arquitetura híbrida e moderna:

### Back-end (API)
* **Linguagem:** Java 17+
* **Framework:** Spring Boot 3 (Spring Web, Spring Data JPA, Validation)
* **IA Generativa:** Integração com **Google Gemini API** para gerar resumos e recomendações literárias.
* **Banco de Dados:** MySQL / PostgreSQL.

### Front-end (Web)
* **Framework:** React.js.
* **Estilização:** CSS Modules / Styled Components.
* **Roteamento:** React Router DOM.

### Cloud & Infraestrutura (Serviços Utilizados/Testados)
* **AWS S3:** Armazenamento de objetos (capas dos livros).
* **AWS RDS:** Instância de banco de dados relacional na nuvem.
* **Firebase:** Utilizado para estratégias de Autenticação e Hospedagem (Hosting).
* **Docker:** (Em implementação) Containerização da aplicação.

---

## ⚙️ Funcionalidades

- [x] **CRUD de Livros:** Cadastro completo com título, autor, gênero e status.
- [x] **Integração com IA:** O sistema consulta a Gemini API para enriquecer os dados do livro automaticamente.
- [x] **Upload de Imagens:** Gerenciamento de capas de livros via AWS S3.
- [x] **Autenticação:** Login seguro via Firebase Auth / Spring Security.
- [ ] **Dashboard:** Gráficos de leitura e metas anuais.
- [ ] **Modo Escuro:** Tema visual para leitura noturna.

---

## 🔧 Como Executar Localmente

Para rodar este projeto na sua máquina, você precisará ter o **Java 17 (JDK)**, **Maven** e **Node.js** instalados.

### 1. Clone o repositório
```bash
git clone [https://github.com/seu-usuario/bibliotheca.git](https://github.com/seu-usuario/bibliotheca.git)
cd bibliotheca