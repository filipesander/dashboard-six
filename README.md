# Dashboard Six🚀

Dashboard de pedidos em Laravel + Inertia/React para o desafio do Grupo Six

## O projeto pode ser rodado localmente ou acessando:
Acesse: **https://dashboard-six.on-forge.com/**

Crie uma conta em "Registrar" e acesse Dashboard e Pedidos



## Stack

| Camada   | Tecnologia                        |
|----------|-----------------------------------|
| Backend  | PHP 8.2+, Laravel 12              |
| Frontend | React 19, Inertia.js, TypeScript  |
| Estilo   | Tailwind CSS 4                    |
| Graficos | Chart.js (react-chartjs-2)        |
| Banco    | MySQL 8+                          |
| Cache    | Database (configuravel via .env)  |

## Requisitos

- PHP 8.2+ 
- Composer 2+
- Node.js 20+ e npm
- MySQL 8+

## Instalacao

```bash
# 1. Clone o repositorio
git clone git@github.com:filipesander/dashboard-six.git
cd dashboard-six

# 2. Instale as dependencias
composer install
npm install

# 3. Configure o ambiente
cp .env.example .env
```

Edite o `.env` com as credenciais do seu banco:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dashboard_six
DB_USERNAME=root
DB_PASSWORD=
```

> A variavel `ORDERS_API_URL` ja vem preenchida no `.env.example`.

```bash
# 4. Gere a chave e rode as migrations
php artisan key:generate
php artisan migrate

# 5. Importe os dados da API
php artisan orders:import

# 6. Suba o projeto
php artisan serve
npm run dev
```

### Acesse: **http://127.0.0.1:8000**

### Crie uma conta e acesse o dashboard. ou acesse **https://dashboard-six.on-forge.com/**

### Acessando Pedidos, clicando em um Pedido,  terá uma tela interna com os detalhes desse pedido


## Sincronizacao de dados

Para atualizar os pedidos a qualquer momento:

- Pelo terminal: `php artisan orders:import`
- Pela interface: botao **"Sincronizar Dados"** no dashboard

O import faz upsert dos dados e invalida o cache automaticamente.

## Metricas implementadas

### Basicas (obrigatorias)

- Total de pedidos
- Receita total (USD e BRL)
- Pedidos entregues (quantidade e taxa percentual)
- Clientes unicos (com media de pedidos por cliente)
- Resumo financeiro (faturamento bruto, reembolsos, receita liquida)
- Taxa de reembolso com indicador visual
- Produto mais vendido (nome, quantidade, receita)
- Tabela de pedidos com busca, filtros, ordenacao e paginacao

### Intermediarias

- Top 5 produtos por receita
- Analise de upsell (taxa, receita adicional, combinacoes de produtos)
- Faturamento por variante
- Top 10 cidades em vendas
- Pedidos entregues e reembolsados
- Ticket medio
- Conversao por forma de pagamento

### Avancadas

- Analise temporal de vendas (grafico de receita ao longo do tempo)
- Produtos com alta taxa de reembolso
- Analise de motivos de reembolso

## Estrutura do projeto

```
app/
  Console/Commands/    Comando artisan de importacao
  Helpers/             Cache helper com versionamento
  Http/Controllers/    DashboardController, OrderController
  Models/              Customer, Order, OrderLineItem, OrderPayment, ...
  Services/            DashboardMetricsService, OrderImportService

resources/js/
  components/orders/   KpiCards, OrderTable, OrderFilters, StatusBadge
  pages/               Dashboard, Orders (index, show)
  types/               Tipos TypeScript (Order, Metrics, etc.)
```

## Cache

O projeto usa cache com versionamento via `OrderCache`:

| Escopo           | TTL        |
|------------------|------------|
| Dashboard        | 10 minutos |
| Listagem pedidos | 5 minutos  |
| Filtros (status) | 30 minutos |

O cache é invalidado automaticamente ao importar novos dados.


## Muito obrigado pela oportunidade, Pedro e Jéssica e Grupo Six🫡



