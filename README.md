# 📊 Dashboard de Vendas — Angular Challenge

Aplicação Angular que importa um arquivo CSV de vendas diretamente no navegador, processa os dados no client e exibe um dashboard interativo com agregações, gráfico e detalhes por produto.

Projeto desenvolvido como desafio técnico com foco em:

- parsing manual de CSV
- manipulação de dados
- arquitetura Angular
- UX
- testes unitários

---

## 🚀 Funcionalidades

### ✅ Importação de CSV
- Upload via FileReader (API nativa do browser)
- Validação de cabeçalho
- Parsing manual com `split`
- Tratamento de linhas inválidas

### 📈 Dashboard
- Tabela agregada por produto
- Total geral
- Produto mais vendido
- Filtro por nome
- Paginação
- Exportação CSV agregado

### 📊 Visualização
- Gráfico de barras (quantidade por produto)
- Modal com detalhes do produto

### ⚠ Tratamento de erros
- Cabeçalho inválido
- Dados inválidos
- Arquivo com formato incorreto
- Feedback visual ao usuário

### 🧪 Testes unitários
Cobertura de:

- Parsing de CSV
- Agregação de dados
- Dashboard
- Upload
- Modal de detalhes
- Pipe de moeda

---

## 🧰 Stack Técnica

- Angular 13.x
- PrimeNG (Table, Input, Chart)
- ngx-bootstrap (Modal)
- SCSS
- Karma + Jasmine
- APIs nativas do browser

> ❌ Sem bibliotecas externas para parsing CSV  
> ❌ Sem state management externo  

---

## 📂 Estrutura do Projeto

```
src/app
│
├── core
│   ├── models
│   └── services
│
├── features
│   ├── dashboard
│   ├── upload
│   └── detalhe
│
├── shared
│   ├── pipes
│   └── components
│
└── app.component
```

---

## ▶ Como rodar o projeto

### 1️⃣ Instalar dependências

```bash
npm install
```

### 2️⃣ Executar aplicação

```bash
npx ng serve
```

Acesse no navegador:

```
http://localhost:4200
```

---

## 🧪 Executar testes

```bash
npx ng test
```

Para rodar uma única vez:

```bash
npx ng test --watch=false
```

---

## 📄 Formato esperado do CSV

```csv
produto,quantidade,preco_unitario
Camiseta,3,49.90
Calça,2,99.90
Tênis,1,199.90
```

---

## 🧠 Decisões Técnicas

### Parsing manual
- Validação linha a linha
- Coleta de erros sem interromper processamento

### Agregação eficiente
- Uso de Map para performance
- Ordenação por volume vendido

### Arquitetura
- Separação clara de responsabilidades
- Componentes reutilizáveis

### UX
- Feedback visual claro
- Paginação
- Modal informativo

---

## ✨ Funcionalidades Extras

- Persistência do último CSV (localStorage)
- Exportação de relatório agregado
- Paginação customizada
- UI responsiva
- Feedback visual detalhado

---

## 🔍 Cenários tratados

✔ CSV válido  
✔ Cabeçalho inválido  
✔ Dados parcialmente inválidos  
✔ Arquivo não CSV  
✔ Nenhuma linha válida  

---

## 📌 Possíveis melhorias futuras

- Drag & drop para upload
- Filtros avançados
- Exportação XLSX
- Gráficos interativos
- i18n

---

## 👩‍💻 Autor

**Priscila Souza**

---

## ⭐ Observação

Projeto desenvolvido com foco em:

- qualidade de código
- robustez
- experiência do usuário
- testes automatizados
- boas práticas Angular

---
