## Web Scrapping Deso

Automação que busca contas na Deso.

### Iniciando

Primeiro, é necessário instalar as dependências:

```shell
yarn
```
ou
```shell
npm install
```

Após isto vamos configurar as variáveis de ambiente

### Variáveis de ambiente

Dentro do seu projeto, renomei o arquivo ```.env.example``` para ```.env```. Após feito isto preencha as variáveis seguindo a orientação abaixo:

```
DESO_MATRICULA=[A matrícula de sua conta. Esta informação pode constar em qualquer conta de água da Deso]
DESO_CPF=[O CPF que é usado para acessar sua conta]
DESO_URL_AGENCIA_VIRTUAL=https://agenciavirtualdeso.gsan.com.br/gsan ## Host da agência virtual da deso
BAIXAR_CONTAS=true ## Esta variável informa se as contas devem ser salvas localmente (PDF) ou não
```

### Como rodar

Acesse o diretório do projeto e rode o comando abaixo:

```shell
node index.js
```
