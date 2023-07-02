# Proposta 3 : Mapa das Ruas de Braga

## Engenharia Web 2023

Tiago Ferreira - A97141
João Faria - A97652

### 1. Resumo
Este relatório serve de suporte à entrega do projeto final, que consiste no desenvolvimento de uma aplicação web para listagem de ruas em Braga. Com uma arquitetura baseada em microsserviços utilizando os servidores npm Express para API, interface e autenticação.

### 1. Introdução
O presente relatório descreve todo o processo de desenvolvimento de um website que agrupa informações acerca das Ruas mais importantes do Distrito de Braga, como projeto final da cadeira de Engenharia Web. Este projeto visa aumentar a nossa experiência em tecnologias web, desde o desenvolvimento, disponibilização e consumo de APIs, utilização de tokens de autenticação, desenvolvimento de interfaces e todas as interações pessoa-máquina. 

### 2. Contextualização/Descrição Informal do problema
A contextualização e descrição informal do problema baseiam-se num marco histórico importante: a criação do Mapa das Ruas de Braga pelo padre Ricardo Rocha há 250 anos. Esse mapa é considerado um documento único e especial dentro do rico conjunto iconográfico de Braga. Embora tenha sido produzido como parte de um processo pragmático e abrangente que marcou a história de uma das mais antigas e influentes instituições da cidade, o Cabido da Sé Primacial, o Mapa destaca-se como uma janela aberta para a memória da cidade.

O Mapa das Ruas de Braga, elaborado pelo padre Ricardo Rocha, oferece uma visão panorâmica das ruas e estruturas urbanas de Braga na época em que foi criado. A sua importância histórica reside no facto de que ele regista não apenas a topografia física e a organização das ruas, mas também reflete a evolução social, cultural e arquitetônica da cidade ao longo dos séculos.

Ao evocar o Mapa das Ruas de Braga, reconhecemos a sua relevância como uma peça singular do património iconográfico da cidade. Através desse documento, é possível mergulhar na memória coletiva de Braga e compreender a transformação urbana ao longo do tempo.

No entanto, apesar de sua importância histórica e valor informativo, o acesso e a utilização do Mapa são limitados. Além disso, a compreensão e interpretação das informações contidas no mapa podem ser um desafio para aqueles que não são especialistas na área.

Portanto, diante desse cenário, surge a necessidade de criar uma solução moderna e acessível para a listagem de ruas de Braga. O desenvolvimento de uma aplicação web aparece como uma proposta viável para disponibilizar e explorar as informações contidas no Mapa de forma interativa e abrangente. Essa aplicação terá como objetivo permitir que os utilizadores naveguem pelas ruas de Braga, consultem dados históricos, citem informações atualizadas e partilhem conhecimento sobre a cidade.

Dessa forma, a aplicação web proposta procura preservar e valorizar o legado do Mapa das Ruas de Braga, tornando-o acessível a um público mais amplo. Ao criar uma interface intuitiva e funcionalidades avançadas de pesquisa e interação, a aplicação visa também proporcionar uma experiência enriquecedora aos utilizadores, permitindo que explorem a história e a evolução das ruas de Braga de maneira envolvente e informativa.

### 2. Objetivos
Mais uma vez, objetivo principal deste projeto é desenvolver uma aplicação web para listar ruas de um distrito específico, neste caso, Braga. Para alcançar esse objetivo, foram estabelecidas várias metas. Em primeiro lugar, era necessário analisar o conjunto de dados fornecido e tratá-lo adequadamente para carregá-lo num sistema de gestão de bases de dados, como o MongoDB. Isso garantiria a organização e a integridade dos dados.

Além disso, o desenvolvimento de uma interface web intuitiva e navegável era uma prioridade. Essa interface permitiria aos usuários explorar todas as informações disponíveis sobre as ruas, fornecendo várias opções de pesquisa, como navegar por nome (índice antroponímico), por lugar (índice toponímico) e por data (índice cronológico).

Outro objetivo importante era permitir que os administradores adicionassem novos registos ao sistema, possibilitando assim a atualização contínua das informações. Além disso, teriam a capacidade de editar os registos existentes, substituindo imagens e alterando campos. Os utilizadores comuns teriam, ainda, a capacidade de fazer posts relacionados a um determinado registo de rua. Essa funcionalidade seria complementada pela possibilidade de outros utilizadores comentarem esses posts, promovendo a interação e a colaboração com o cliente final da aplicação.

Para garantir a segurança e a gestão adequada da aplicação, o sistema seria protegido por autenticação. Além disso, seriam estabelecidos pelo menos dois níveis de acesso: administrador, com permissão para executar todas as operações, e consumidor, que poderia consultar as informações, fazer posts e sugerir alterações. Seriam também coletados dados sobre o utilizador, como nome, email, filiação, nível de acesso, data de registo na plataforma, password e outros campos relevantes para garantir uma experiência personalizada e segura para cada utilizador.

Em resumo, os objetivos do projeto incluem a análise e tratamento dos dados fornecidos, a criação de uma interface web interativa, a implementação de funcionalidades de adição, navegação, edição e comentário de registos, além da proteção da aplicação com autenticação e a definição de diferentes níveis de acesso. Esses objetivos visam fornecer uma plataforma abrangente e segura para a listagem de ruas no distrito de Braga.


### 2. Análise e tratamento do dataset
O primeiro passo do desenvolvimento deste projeto foi a análise e o tratamento do dataset fornecido. Nas informações iniciais podiamos encontrar 60 ficheiros XML, cada um com informações correspondentes a uma determinada rua de Braga, incluindo dados sobre as casas presentes na rua, os proprietários das mesmas, rendas, entre outros. Nos ficheiros XML, de início, ainda foi possível verificar a existência de algumas tags como a data, entidade e lugar, que serviram como meta-informação para a rua em que as mesmas se encontravam. Para além dos ficheiros XML foram ainda fornecidos dois conjuntos de imagens, um conjunto com imagens correspondentes a digitalizações dos desenhos originais do século XVII, e um outro conjunto com imagens correspondentes a um trabalho de campo realizado por alunos de engenharia biomédica da Univerisdade do Minho, que fotografaram as ruas da cidade de Braga na atualidade.

Desde início procuramos entender efetivamente as informações do nosso dataset, como as poderíamos utilizar, o que seria mais relevante, e sobretudo, começamos por discutir e desenhar o nosso início de modelo de base de dados que iríamos utilizar. Esta foi uma tarefa à qual alocamos bastante tempo, pois sabíamos que as definições de arquitetura e decisões tomadas aqui, se iriam refletir e ser muito importantes durante todo o desenvolvimento do projeto.

Para o tratamento destes ficheiros XML utilizamos vários *scripts python* e ainda alguns ficheiros *.xsl* e *.xsd*, que podem ser encontrados na raíz do nosso repositório na pasta **XML** e que proporcionam a obtenção de dados, e a verificação dos ficheiros xml, mais tarde, possibilitaram a criação de um ficheiro *json* final, denominado **ruas.json**. Este ficheiro servirá como uma base de dados contendo as informações essenciais de cada rua. O documento *json* foi importado para o mongoDB, a base de dados que iremos utilizar sempre que necessitamos de persistir informação, de forma a ser utilizado na nossa aplicação web e assim fornecer-nos informações sobre cada rua de Braga. Apesar de levarmos em conta as implicações de alterações na base de dados, podemos referir que por várias vezes tivemos de alterar o nosso esquema e fazer novas importações completas para o MongoDB, pois certos cenários apenas foram contemplados quando, efetivamente, iniciamos o processo de desenvolvimento prático do nosso código.

`mongoimport -d MapaRuas -c ruas --file ruas.json --jsonArray`

### 3. Ferramentas
No desenvolvimento do nosso projeto utilizamos três servidores *express*, cuja arquitetura iremos abordar no próximo capítulo, temos portanto um servidor para a nossa api de dados, um servidor responsável pela nossa interface e, ainda, um servidor responsável por registar utilizadores e proteger as informações dos mesmos. Foram necessárias diferentes bibliotecas para cumprir os requisitos propostos no enunciado do projeto. Em seguida referimos algumas bibliotecas utilizadas e o porque da sua utilização:

1. Servidor de API:

    - **multer:** Biblioteca utilizada para lidar com o upload de ficheiros, como as imagens dos desenhos originais e as fotografias das ruas atuais. O multer facilita o processamento desses ficheiros no servidor e é especialmente importante para permitir o adicionar de novas ruas, possibilitando inserir imagens que pertençam à rua
    - **fs-extra:** Biblioteca que fornece funcionalidades adicionais para manipulação de ficheiros, como copiar, mover, apagar, entre outras operações. Foi útil no tratamento das imagens permitindo a eliminação das mesmas quando apagamos ou editamos uma determinada rua.
    - **path:** Módulo que fornece ferramentas para lidar com caminhos de ficheiros e diretorias. Foi utilizado para manipular caminhos e endereços de ficheiros no sistema, principalmente no que diz respeito às imagens.
    - **mongoose:** Biblioteca que facilita a integração e interação com uma base de dados MongoDB. Foi utilizada para conectar-se à base de dados e realizar operações como leitura, escrita e atualização dos dados guardados na mesma.

2. Servidor de Interface:

    - **form-data:** Biblioteca utilizada para processar e extrair informações dos formulários presentes na interface web, foi utilizada para permitir o envio de imagens entre servidores.
    - **express-session:** Biblioteca do Express utilizada para gerir as sessões dos utilizadores. É importante para manter o estado e a autenticação dos utilizadores durante a utilização da aplicação.
    - **multer:** Como mencionado anteriormente, o multer também foi utilizado no servidor de interface para lidar com o upload de ficheiros.
    - **passport:** Biblioteca utilizada para lidar com a autenticação de utilizadores. Permitiu a utilização da estratégia de autenticação local.
    - **passport-google-oauth20:** Estratégia específica do passport utilizada para autenticar utilizadores através de contas Google. Essa biblioteca simplifica o processo de autenticação com o Google.
    - **jsonwebtoken:** Biblioteca utilizada para gerar e verificar tokens JWT (JSON Web Tokens). Foi utilizada para obtermos uma autenticação baseada em tokens e, sobretudo, para garantir a segurança nas comunicações entre o servidor de interface e o servidor de autenticação.

3. Servidor de Autenticação:

    - **uuid:** Biblioteca utilizada para gerar identificadores únicos universais (UUIDs). Foi utilizada para criar identificadores únicos para cada utilizador registado no servidor de autenticação.
    - **jsonwebtoken:** Como mencionado anteriormente, o jsonwebtoken(JWT) também foi utilizado no servidor de autenticação para gerar e verificar tokens JWT.
    - **multer:** Novamente, o multer foi utilizado para lidar com o upload de ficheiros, neste caso, para o armazenamento de imagens de perfil dos utilizadores.
    - **fs-extra e path:** Estas bibliotecas foram utilizadas, da mesma forma que no servidor de API, para a manipulação de ficheiros, como a cópia, movimentação e eliminação de imagens de perfil.
    - **passport:** Assim como no servidor de interface, o passport foi utilizado para facilitar a autenticação de utilizadores, mas, neste caso, utilizando a estratégia de autenticação local (username e password).
    - **passport-local:** Estratégia do passport utilizada para autenticar utilizadores com base em nome de utilizador e password.
    - **express-session:** Mais uma vez, o express-session foi utilizado para gerir as sessões dos utilizadores no servidor de autenticação.
    - **mongoose:** O mongoose foi utilizado para interagir com uma base de dados em MongoDB no servidor de autenticação, possibilitando o armazenamento e consulta dos utilizadores registados na nossa aplicação.

Estas bibliotecas foram essenciais para o desenvolvimento dos servidores e contribuíram para a implementação de muitas funcionalidades necessárias para o projeto.

### 4. Arquitetura
A arquitetura do sistema foi projetada com base numa abordagem de microsserviços, dividindo a funcionalidade, como anteriormente referido, em três servidores distintos para garantir um ambiente escalável e modular, assim como nos foi indicado nas aulas. Os servidores foram implementados utilizando a plataforma npm e o framework Express, cada um desempenhando um papel específico: API, interface e autenticação.

1. Servidor API:
O primeiro servidor é responsável por fornecer uma API para gerir os dados da aplicação. Ele lida com todas as operações relacionadas à manipulação dos regitos das ruas (CRUD), como adicionar, editar e pesquisar. O servidor API proporciona a comunicação entre a base de dados do MongoFB e os demais componentes do sistema. Ele é projetado para garantir a segurança dos dados e fornecer respostas rápidas e eficientes às solicitações dos usuários.

2. Servidor de Interface:
O segundo servidor é dedicado à interface web, fornecendo uma experiência amigável e intuitiva aos utilizadores. Este é construído utilizando o npm e o framework Express para lidar com as requisições dos utilizadores e renderizar as páginas pug correspondentes. O servidor de interface comunica com o servidor API para obter os dados necessários e apresentá-los de forma adequada na interface web, não apresentando, portanto, nenhuma ligação direta a uma base de dados. Ele oferece recursos de navegação, pesquisa e interação, como descrito nos nossos objetivos, permitindo que os usuários visualizem e interajam com as informações das ruas de Braga.

3. Servidor de Autenticação:
O terceiro servidor é exclusivamente dedicado à autenticação e segurança do sistema. Ele lida com todo o processo de registo, autenticação de utilizadores, gestão de credenciais e autorização de acesso. Ele é responsável por verificar as credenciais fornecidas pelos utilizadores, conceder tokens de autenticação válidos e controlar os diferentes níveis de acesso (administrador e consumidor). A separação desse servidor específico garante uma camada extra de segurança e simplifica a implementação de futuras melhorias ou expansões no sistema de autenticação.

A comunicação entre os três servidores permite a troca de dados e a coordenação das diferentes funcionalidades. Os servidores são independentes, mas trabalham em conjunto para fornecer uma aplicação web coesa, segura e eficiente.

Essa arquitetura modular baseada em microsserviços permite uma maior flexibilidade e escalabilidade do sistema, facilitando a manutenção e aprimoramento de cada componente separadamente. Além disso, essa abordagem facilita a distribuição das tarefas de processamento e garante um desempenho otimizado, melhorando a experiência do utilizador durante a navegação e interação com a aplicação.

### 5. Conclusão
Ao longo deste relatório foi apresentado o projeto de desenvolvimento de um website de listagem exaustiva de Ruas do distrito de Braga e suas informações complemetares.
A implementação foi realizada com sucesso, tendo sido apresentadas algumas alternativas, decisões e problemas que nos surgiram durante o processo de implementação. Foram realizados testes e apresentamos resultados que consideramos que satisfazem os requisitos.

Conclui-se que este projeto permitiu aumentar a nossa experiência em tecnologias web, desde a manutenção de bases de dados, à sua consulta e exposição de várias formas. 

Em suma, este projeto, além de nos ajudar a consolidar conhecimentos aprendidos ao longo das aulas, permitiu ainda adquirir novas competências e conhecimentos em Emgenharia web, compiladores. Pudemos compreender e ganhar experiência do que são todas as etapas de um processo (quase) ponto-a-ponto de criação de um website aplicável ao mundo real com os componentes mais gerais, e por fim conseguimos desenvolver uma ferramenta útil para consulta de informação, neste caso, de ruas.
